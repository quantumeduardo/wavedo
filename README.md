# Wavēdo landing

Use Node.js 20.9+ (Node 22 LTS recommended). Install with `npm ci`, then `npm run dev`.

## Intake notification setup

1. If `.env.local` does not exist, copy `.env.example` to `.env.local`. Otherwise add only the missing entries; do not overwrite existing secrets. All `.env*` files except `.env.example` are ignored by Git.
2. Privately set `RESEND_API_KEY` to a real Resend API key (`re_…`). Prefer sending-only access scoped to the sender domain. Never put secrets in source, screenshots, logs, chat, or a `NEXT_PUBLIC_` variable.
3. Set `NOTIFICATION_TO_EMAIL` to **one bare email address** for the coach's inbox. Lists and display names are not supported for the recipient. Confirm you control this inbox.
4. Set `NOTIFICATION_FROM_EMAIL` explicitly to an address on your Resend-verified domain, either `apply@your-domain.com` or `"Wavedo Private Coaching <apply@your-domain.com>"`. There is no implicit sender fallback. Example domains and Resend's test sender are rejected. Verify DNS and domain status in Resend; matching email syntax does not prove domain verification. See [Resend sender setup](https://resend.com/docs/knowledge-base/how-do-I-create-an-email-address-or-sender-in-resend) and [API key permissions](https://resend.com/docs/dashboard/api-keys/introduction).
5. Publish the Resend template with ID/alias `coaching-application`. It receives `first_name`, `application_url`, `consultation_url`, and the submitted fields. The application and consultation links are defined in `app/api/notify/route.ts`; review them before launch.
6. Run `npm run check:notifications`. It loads production Next.js env precedence (existing process variables take precedence), prints only variable names and validation outcomes, exits nonzero for invalid settings, and never sends email. It checks syntax/placeholders only: it cannot authenticate a key, verify a domain, prove inbox ownership, or check template publication.
7. For Vercel, privately add all three variables in Project Settings → Environment Variables for the intended environments, then redeploy. Use a separate test inbox for previews. Restart the local dev server after changes. Do not paste quotes around values in the hosting UI; quotes in `.env.local` are file syntax.
8. Run `npm run build`. A build does not require email credentials and does not prove delivery. Run the config check separately against the intended deployment environment.

## Release verification and troubleshooting

With the deployment owner, submit one evaluation using an inbox you control. Confirm the coach notification and applicant confirmation in Resend and both inboxes. Resend API acceptance is not proof of inbox delivery; inspect delivery/bounce events. No live email is sent by the checker or tests.

Missing/malformed settings and provider authentication/sender rejections return HTTP 503 with `setupRequired: true`. The apply page keeps answers visible and states that the evaluation was not sent. Server diagnostics contain variable names or HTTP status only, never key values, recipient addresses, applicant fields, or raw provider responses. Review settings and [Resend errors](https://resend.com/docs/api-reference/errors), then redeploy.

A successful coach notification shows a success state. Confirmation failures remain success with a clear notice to avoid duplicate applications. Provider outages return a retryable error. Network timeouts can have an uncertain send outcome; check provider activity before retrying. There is no database or local capture fallback, durable retry queue, or delivery webhook tracking. Configure deployment-level abuse/rate limiting for this public email endpoint before exposing it to untrusted traffic.

Run `npm run test:notifications` for isolated configuration and mocked provider regression tests.

## Hoodie checkout

The cart creates a hosted Stripe Checkout Session at `POST /api/checkout`. It reuses the existing $100 USD price, sizes XS–XXL, and shipping rule ($12 below $100; included at $100 or above). Each size is a separate line item. Amounts are calculated server-side in cents; client prices/totals are ignored. Shipping contact/address is attached to the PaymentIntent, email prefills Checkout, and size metadata is included on both the session and payment. Country accepts ISO two-letter codes (the previous United States default also works).

Set the server-only `STRIPE_SECRET_KEY` in `.env.local` or the hosting environment and restart/redeploy. Start with a Stripe test-mode key from the existing Stripe account. No publishable key, SDK, new price IDs, or email configuration is required. The former `NEXT_PUBLIC_*_PAYMENT_LINK` settings cannot carry this order reliably and are no longer used. Configure eligible payment methods in Stripe; availability depends on the account, customer, and device. See [Stripe Checkout Session creation](https://docs.stripe.com/api/checkout/sessions/create).

Without a valid key the endpoint returns HTTP 503 with `setupRequired: true` and a server-calculated preview. The cart displays that no payment or order was created, preserves edits, and allows retry. This fallback makes no provider requests and is safe to exercise locally. It is not a simulated successful payment. Provider failures also preserve the form/cart. A retry of unchanged content within the same page uses the same Stripe idempotency key; changed content uses a different key. Stripe's idempotency retention is finite, so this is not durable order deduplication.

Run `npm run test:checkout`, `npm run test:notifications`, `npx tsc --noEmit`, and `npm run build`. The checkout tests mock Stripe and cover multi-size payloads, authoritative totals, invalid inputs, missing configuration, retries, and provider failures. For manual verification, add multiple sizes, adjust/remove quantities, reload the cart, fill shipping, and continue with the key unset to see the preview. With a test key, inspect line items and total in Checkout, cancel and verify the cart remains, then complete a test payment and verify the shipping address on its PaymentIntent in Stripe. Do not use a live card for this check.

Returning from Stripe is not treated as proof of payment and does not clear the cart or send an order email. Use Stripe's payment status/receipt for manual fulfillment. Automated fulfillment, durable orders, and cart clearing require a verified payment webhook and order storage, which this repository does not yet have. Deploy behind HTTPS and configure deployment-level rate limits for the public session endpoint.
