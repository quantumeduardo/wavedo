import { neon } from "@neondatabase/serverless";
import type Stripe from "stripe";
import { paidItems } from "./checkout";
import { validateNotificationConfig } from "./notification-config.mjs";

function database() {
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!url) throw new Error("database_configuration");
  return neon(url);
}

// Additive and idempotent: existing data is never dropped or changed by setup.
export async function prepareOrders() {
  const sql = database();
  await sql`CREATE TABLE IF NOT EXISTS wavedo_orders (
    session_id TEXT PRIMARY KEY,
    payment_intent_id TEXT,
    livemode BOOLEAN NOT NULL,
    amount_total INTEGER NOT NULL,
    currency TEXT NOT NULL,
    items JSONB NOT NULL,
    customer JSONB NOT NULL,
    shipping JSONB,
    paid_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    notified_at TIMESTAMPTZ
  )`;
}

export async function recordPaidOrder(session: Stripe.Checkout.Session) {
  const items = paidItems(session);
  if (!items) return false;
  await prepareOrders();
  const sql = database();
  const shipping = session.collected_information?.shipping_details ?? null;
  await sql`INSERT INTO wavedo_orders (session_id, payment_intent_id, livemode, amount_total, currency, items, customer, shipping)
    VALUES (${session.id}, ${typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null},
      ${session.livemode}, ${session.amount_total!}, ${session.currency!}, ${JSON.stringify(items)}::jsonb,
      ${JSON.stringify(session.customer_details ?? {})}::jsonb, ${JSON.stringify(shipping)}::jsonb)
    ON CONFLICT (session_id) DO NOTHING`;
  return true;
}

export async function notifyPaidOrder(session: Stripe.Checkout.Session) {
  const sql = database();
  const rows = await sql`SELECT notified_at, paid_at FROM wavedo_orders WHERE session_id = ${session.id}`;
  if (!rows.length || rows[0].notified_at) return;
  // Resend guarantees idempotency for 24 hours. Older retries require manual review.
  if (Date.now() - new Date(rows[0].paid_at).getTime() > 23 * 60 * 60 * 1000) throw new Error("notification_manual_review");
  const { apiKey, to, from, issues } = validateNotificationConfig(process.env);
  if (issues.length) throw new Error("notification_configuration");
  const items = paidItems(session)!;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    signal: AbortSignal.timeout(10000),
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "Idempotency-Key": `paid-order/${session.id}` },
    body: JSON.stringify({ from, to, subject: `${session.livemode ? "" : "[TEST] "}Paid Wavēdo hoodie order`,
      text: `Payment confirmed\nStripe session: ${session.id}\nItems: ${items.map((item) => `${item.size} × ${item.quantity}`).join(", ")}\nTotal: $${session.amount_total! / 100} USD\nCustomer: ${session.customer_details?.name ?? ""}\nEmail: ${session.customer_details?.email ?? ""}\nShipping: ${JSON.stringify(session.collected_information?.shipping_details ?? {})}`,
    }),
  });
  if (!response.ok) throw new Error("order_notification_failed");
  await sql`UPDATE wavedo_orders SET notified_at = now() WHERE session_id = ${session.id}`;
}
