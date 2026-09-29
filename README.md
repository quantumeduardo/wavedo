# Wavēdo landing

Use Node.js 24 LTS (the version used in CI). Install with `npm ci`, then `npm run dev`.

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

The cart creates a hosted Stripe Checkout Session at `POST /api/checkout`. It uses the $79.99 USD price, sizes XS–XXL, and shipping rule ($12 below $100; included at $100 or above). Each size is a separate line item. Amounts are calculated server-side in cents; client prices/totals are ignored. Shipping contact/address is attached to the PaymentIntent, email prefills Checkout, and size metadata is included on both the session and payment. Country accepts ISO two-letter codes (the previous United States default also works).

### Payment setup and release

Keep all credentials server-only. Add the blank entries in .env.example to your existing local or Vercel settings without replacing existing values. Never use NEXT_PUBLIC_ for credentials.

- STRIPE_SECRET_KEY: a test key for local/Preview; a live key for Vercel Production. The server rejects a key from the wrong mode.
- STRIPE_WEBHOOK_SECRET: signing secret for this deployment's endpoint, from the same Stripe account/mode as its API key.
- DATABASE_URL (or POSTGRES_URL): Neon Postgres connection string. Use a separate Preview database; the connection needs permission to create and write wavedo_orders.
- RESEND_API_KEY, NOTIFICATION_TO_EMAIL, NOTIFICATION_FROM_EMAIL: see the notification guide above. Paid-order alerts use plain text and do not need an email template. Intake confirmations still need their existing template.

Create a Stripe webhook destination at https://YOUR-DEPLOYMENT/api/stripe/webhook for checkout.session.completed and checkout.session.async_payment_succeeded. Preview protection must allow Stripe to reach that route; do not disable protection for unrelated pages. Copy the destination's signing secret privately into the matching Vercel environment and redeploy. Register Production separately with live-mode credentials before promoting this branch.

Checkout checks database availability and requires a webhook secret before opening payment. Only a verified, paid Stripe session with the expected items, currency, and total can be recorded. The table is created additively; session IDs are unique, so duplicate webhook delivery cannot create duplicate orders. Shipping is read from the verified PaymentIntent. The browser confirmation also records the paid order if the webhook is delayed, and checks an HttpOnly ownership cookie before returning any purchase details. Purchased quantities are removed once; later additions stay in the cart. An uncertain confirmation keeps the cart and asks the shopper to check again before paying again.

The webhook sends the owner a paid-order alert after saving the order. Resend failures return a retryable error to Stripe; order persistence is independent of email delivery. Email retries use the session ID for idempotency. Unsent alerts older than 23 hours require manual review to avoid a duplicate email outside Resend's idempotency window. Review webhook failures and orders with notified_at unset. This is payment recording and notification, not shipping-label generation or refund management. Existing sessions created before this release remain manual fulfillment.

Run npm run check:checkout for a values-free offline configuration check. It cannot prove that keys authenticate, that Stripe can reach the webhook, or that delivery works. Run npm run lint, npm run test:checkout, npm run test:payments, npm run test:notifications, and npm run build. CI runs these checks on pull requests and pushes to main without production secrets. Enable the verify job as a required branch-protection check in GitHub.

Before production: complete a test payment on Preview; check its exact items, $79.99 unit price and shipping total, one database order, one test-marked alert, confirmation page, and cart behavior after reload. Replay the webhook to verify no duplicate order/email. Test cancellation and a declined card. Never enter a live card in this test. The automated suite mocks providers and does not make payments or send mail.

Stripe's displayed business name comes from the Stripe account behind STRIPE_SECRET_KEY. Confirm that account and its public business/branding settings show Wavedo before release; a code change cannot rename a different account. Configure deployment-level rate limits on public checkout and notification endpoints.
