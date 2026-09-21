import { createHash } from "node:crypto";
import { stripeParameters, validateCheckout } from "@/lib/checkout";

export const runtime = "nodejs";
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  if (request.headers.get("origin") && request.headers.get("origin") !== origin) return json({ message: "Please checkout from this site." }, 403);
  let order;
  try {
    const body = await request.text();
    if (body.length > 10000) return json({ message: "Checkout request is too large." }, 413);
    order = validateCheckout(JSON.parse(body));
  } catch (error) {
    return json({ message: error instanceof SyntaxError ? "Invalid checkout request." : error instanceof Error ? error.message : "Please check your cart." }, 400);
  }
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key || !/^(sk|rk)_(test|live)_[A-Za-z0-9]+$/.test(key)) {
    return json({ setupRequired: true, message: "Payments are temporarily unavailable. This is an order preview only; no order has been placed or payment taken.", preview: { items: order.items, ...{subtotal: order.subtotal, shipping: order.shipping, total: order.total, currency: order.currency} } }, 503);
  }
  const params = stripeParameters(order, origin);
  // Bind retries to both the attempt and its exact content. No PII in the key.
  const idempotencyKey = createHash("sha256").update(order.attemptId + params.toString()).digest("hex");
  try {
    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST", signal: AbortSignal.timeout(10000),
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded", "Idempotency-Key": idempotencyKey, "Stripe-Version": "2024-06-20" },
      body: params.toString(),
    });
    if (!response.ok) return json({ message: "Payment checkout is unavailable. Your cart is saved; please try again later." }, 502);
    const session = await response.json();
    const url = new URL(session.url);
    if (url.protocol !== "https:" || url.hostname !== "checkout.stripe.com" || url.username || url.password) throw new Error("Invalid checkout URL");
    return json({ url: url.href });
  } catch {
    return json({ message: "Could not open payment checkout. Your cart is saved; please try again." }, 502);
  }
}
