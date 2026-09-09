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
