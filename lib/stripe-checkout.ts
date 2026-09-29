import Stripe from "stripe";
import { createHash } from "node:crypto";
import { cartSizes, maxQuantity, totals, type CheckoutItem } from "./checkout";

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  const mode = process.env.VERCEL_ENV === "production" ? "live" : "test";
  if (!key || !new RegExp(`^(sk|rk)_${mode}_[A-Za-z0-9]+$`).test(key)) throw new Error("stripe_configuration");
  return new Stripe(key, { maxNetworkRetries: 2, timeout: 15000 });
}

export function tokenHash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function paidItems(session: Stripe.Checkout.Session): CheckoutItem[] | null {
  if (session.metadata?.source !== "wavedo-cart-v2" || session.mode !== "payment" || session.status !== "complete" || session.payment_status !== "paid") return null;
  const items: CheckoutItem[] = JSON.parse(session.metadata.cart ?? "null");
  if (!Array.isArray(items) || !items.length || items.length > cartSizes.length ||
      items.some(item => !item || !cartSizes.includes(item.size) || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > maxQuantity) ||
      new Set(items.map(item => item.size)).size !== items.length) throw new Error("invalid_paid_cart");
  if (session.currency !== "usd" || session.amount_total !== totals(items).total) throw new Error("order_total_mismatch");
  return items;
}
