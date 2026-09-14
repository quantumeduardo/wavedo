import Stripe from "stripe";
import { createHash } from "node:crypto";

export const hoodiePrice = 10000;
export const allowedSizes = ["XS", "S", "M", "L", "XL", "XXL"];
export type CheckoutItem = { size: string; quantity: number };

export function validateCart(value: unknown): CheckoutItem[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 6) throw new Error("invalid_cart");
  const seen = new Set<string>();
  const items = value.map((item) => {
    if (!item || !allowedSizes.includes(item.size) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20 || seen.has(item.size)) throw new Error("invalid_cart");
    seen.add(item.size);
    return { size: item.size as string, quantity: item.quantity as number };
  });
  if (items.reduce((sum, item) => sum + item.quantity, 0) > 20) throw new Error("invalid_cart");
  return items.sort((a, b) => allowedSizes.indexOf(a.size) - allowedSizes.indexOf(b.size));
}

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key || !/^sk_(test|live)_/.test(key)) throw new Error("stripe_configuration");
  if (process.env.VERCEL_ENV !== "production" && !key.startsWith("sk_test_")) throw new Error("test_key_required");
  if (process.env.VERCEL_ENV === "production" && !key.startsWith("sk_live_")) throw new Error("live_key_required");
  return new Stripe(key, { maxNetworkRetries: 2, timeout: 15000 });
}

export function checkoutOrigin() {
  if (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.VERCEL_ENV === "production") return "https://shop.wavedomethod.com";
  return "http://localhost:3000";
}

export function tokenHash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function sessionParameters(items: CheckoutItem[], origin: string, owner: string): Stripe.Checkout.SessionCreateParams {
  return {
    mode: "payment",
    payment_method_types: ["card"],
    line_items: items.map((item) => ({
      price_data: { currency: "usd", unit_amount: hoodiePrice, product_data: { name: `Wavēdo Training Hoodie — ${item.size}`, metadata: { size: item.size } } },
      quantity: item.quantity,
    })),
    shipping_address_collection: { allowed_countries: ["US"] },
    shipping_options: [{ shipping_rate_data: { type: "fixed_amount", fixed_amount: { amount: 0, currency: "usd" }, display_name: "Shipping included" } }],
    metadata: { source: "wavedo-cart-v1", cart: JSON.stringify(items), owner },
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/cart?checkout=cancelled`,
  };
}

export function paidItems(session: Stripe.Checkout.Session): CheckoutItem[] | null {
  if (session.metadata?.source !== "wavedo-cart-v1" || session.mode !== "payment" || session.status !== "complete" || session.payment_status !== "paid") return null;
  const items = validateCart(JSON.parse(session.metadata.cart ?? "null"));
  const expected = items.reduce((sum, item) => sum + item.quantity * hoodiePrice, 0);
  if (session.currency !== "usd" || session.amount_total !== expected) throw new Error("order_total_mismatch");
  return items;
}
