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

## Cart → Stripe Checkout (preview integration)

The cart now calls `/api/checkout`, with no fallback to a fixed payment link. The server validates 1–20 total hoodies and known sizes, calculates $100 USD per hoodie, and creates one Stripe line item per size. Shipping is free (matching the existing $100 free-shipping threshold); shipping destinations are initially US only. No tax calculation is enabled—confirm your tax configuration and shipping regions before a live launch. Only card payments and their eligible wallets (including Apple Pay) are enabled. Existing PayPal/Venmo/Cash App URLs are not used because those fixed links do not synchronize this cart.

### Configure the preview

1. In Vercel, use the preview branch deployment, not the production domains. Set `STRIPE_SECRET_KEY` to a **test** secret in **Preview** (already requested). Non-production deployments reject live keys; Production rejects test keys.
2. Connect a **test/preview Neon database branch** to the same Vercel Preview environment. The app accepts `DATABASE_URL` or `POSTGRES_URL`. Never use `NEXT_PUBLIC_` for a connection URL. The first checkout creates only the `wavedo_orders` table if absent; no tables or data are dropped. This requires CREATE TABLE permission. Use an isolated test database for test orders.
3. In the same Stripe sandbox/test account, create an event destination pointing to `https://YOUR-PREVIEW-HOST/api/stripe/webhook`. Select `checkout.session.completed` and `checkout.session.async_payment_succeeded`. Use the actual stable preview branch URL or exact deployment URL; register that same host in Stripe. Both the exact deployment host and the Vercel-provided branch host are supported; return URLs stay on the host that started checkout to retain its ownership cookie.
4. Privately put that destination's signing secret in `STRIPE_WEBHOOK_SECRET`, scoped to **Preview**, and redeploy. This is a `whsec_…` value, not the Stripe API key. Checkout intentionally remains unavailable until the webhook signing secret and database are configured.
5. Vercel deployment protection must allow Stripe to reach this webhook without a login redirect. Configure an appropriate deployment protection exception with the deployment owner. Never put a protection-bypass secret in committed files or a public checkout URL.
6. Ensure Preview also has valid `RESEND_API_KEY`, `NOTIFICATION_FROM_EMAIL`, and `NOTIFICATION_TO_EMAIL`. Use a controlled test recipient. Only verified paid sessions generate order emails, prefixed `[TEST]` for test payments. The existing intake confirmation template is not used for order notifications.
7. Open `/shop` on the exact preview deployment URL. Add M × 2 and L × 1; Stripe must show two line items and a $300 total. Use Stripe's documented test card, never a real card in test mode. Cancel first and confirm the cart remains. Then complete a test payment; verify the confirmation screen, a single row in `wavedo_orders`, and the test order email. No test payment is performed by automated unit checks.
8. Redeliver the same event from Stripe. The primary key prevents duplicate orders, and the stored notification timestamp plus Resend's idempotency key prevent routine duplicate emails. If an email remains unconfirmed for over 23 hours, the webhook deliberately fails for manual review rather than risking duplicate email after Resend's idempotency window expires. Check Stripe delivery failures and order rows before replaying old events.

Stripe is authoritative for payment status. The webhook verifies the raw-body signature, retrieves the session from Stripe, verifies expected totals, and writes the order before sending email. The return page also verifies the session server-side and persists a paid order if the webhook is delayed. It requires a matching HTTP-only browser ownership cookie and never exposes customer addresses in its API response. Only confirmed purchased quantities are removed from the browser cart; cancellation and failures leave it intact. Webhook retries recover transient database/email failures. This is order recording and notification, not an inventory or shipment-management system.

Local setup uses `.env.local` with test credentials and `stripe listen --forward-to localhost:3000/api/stripe/webhook` to obtain a local signing secret. Local checkout supports localhost and 127.0.0.1 on port 3000. Use `npm run check:checkout` for a value-free presence check and `npm run test:checkout` for mocked API regression checks.

Before merging to main: complete the test journey, set **Production** live Stripe and webhook secrets, configure a production webhook at `https://shop.wavedomethod.com/api/stripe/webhook`, use the production database, and confirm shipping/tax rules. Preview credentials are never copied into Production automatically by this change.
