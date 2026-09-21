"use client";

import Image from "next/image";
import { FormEvent, useEffect, useRef, useState } from "react";
import { CartItem, readCart, saveCart } from "@/lib/cart-storage";
import { cartSizes as sizes, maxQuantity, totals, unitAmount } from "@/lib/checkout";
const product = {
  name: "Wavedo 520",
  price: unitAmount / 100,
  image: "/images/wavedo-hoodie-jet-black-front.png",
  color: "Jet Black",
};

type CartProps = {
  initialSize?: string;
};

export function Cart({ initialSize }: CartProps) {
  const [cartReady, setCartReady] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  useEffect(() => {
    const saved = readCart();
    setItems(saved?.items ?? (initialSize && sizes.includes(initialSize) ? [{ size: initialSize, quantity: 1 }] : []));
    setCartReady(true);
  }, [initialSize]);
  useEffect(() => {
    if (cartReady) saveCart({ ...(items[items.length - 1] ?? { size: "M", quantity: 0 }), items });
  }, [cartReady, items]);
  function changeQuantity(size: string, delta: number) {
    setItems((current) => current.map((item) => item.size === size ? { ...item, quantity: item.quantity + delta } : item).filter((item) => item.quantity > 0));
  }
  const { subtotal: subtotalCents, shipping: shippingCents, total: totalCents } = totals(items);
  const subtotal = subtotalCents / 100;
  const shipping = shippingCents / 100;
  const total = totalCents / 100;
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(false);
  const busy = useRef(false);
  const attempt = useRef("");
  useEffect(() => {
    const status = new URLSearchParams(window.location.search).get("checkout");
    if (status === "cancelled") setMessage("Payment checkout was cancelled. Your cart is saved.");
    if (status === "returned") setMessage("You returned from payment checkout. Check your Stripe receipt for payment status. Your cart has been kept for reference; do not pay again if already paid.");
  }, []);
  const submitCheckout = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setMessage("");
    setPreview(false);
    attempt.current ||= crypto.randomUUID();
    const shipping = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const response = await fetch("/api/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, shipping, attemptId: attempt.current }),
        signal: AbortSignal.timeout(15000),
      });
      const result = await response.json();
      if (!response.ok) {
        setPreview(result.setupRequired === true);
        setMessage(result.message || "Checkout is unavailable. Please try again.");
        return;
      }
      const url = new URL(result.url);
      if (url.protocol !== "https:" || url.hostname !== "checkout.stripe.com") throw new Error("Invalid checkout URL");
      window.location.assign(url.href);
    } catch {
      setMessage("Could not open checkout. Your cart and shipping details are still here. Please try again.");
    } finally {
      busy.current = false;
      setPending(false);
    }
  };

  if (!cartReady) return <p role="status" className="bg-ink p-8 text-bone">Loading your cart…</p>;
  if (!items.length) return (
    <section className="min-h-[60vh] bg-ink px-6 py-24 text-center text-bone">
      <h1 role="status" className="font-display text-4xl">Your cart is empty.</h1>
      <a href="/shop" className="mt-8 inline-flex min-h-12 items-center bg-bone px-8 text-sm text-ink">Continue shopping</a>
    </section>
  );

  return (
    <section className="min-h-screen bg-ink px-4 py-12 text-bone sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_0.72fr] lg:items-start">
        <form onSubmit={submitCheckout} className="space-y-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-bone/48 sm:tracking-[0.34em]">
              Checkout
            </p>
            <h1 className="mt-5 font-display text-4xl leading-tight sm:text-6xl">
              Shipping Information
            </h1>
          </div>

          <section className="rounded-2xl border border-bone/20 p-5 sm:p-7">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em]">Secure payment</h2>
            <p className="mt-3 text-sm text-bone/60">Your sizes, quantities, shipping details, and total will be sent to Stripe. Choose from the payment methods available there.</p>
          </section>
          {message && <p role="status" className="border border-bone/20 p-5 text-sm">{message}</p>}
          {preview && <p className="text-sm text-bone/60">Order preview: {items.map(item => `${item.size} × ${item.quantity}`).join(", ")} · Shipping {shipping === 0 ? "included" : `$${shipping.toFixed(2)}`} · Total ${total.toFixed(2)} USD. You can edit your cart and retry when payments are available.</p>}
          <div className="grid gap-px border border-bone/12 bg-bone/12 sm:grid-cols-2">
            {[
              ["First Name", "firstName", "text"],
              ["Last Name", "lastName", "text"],
              ["Email", "email", "email"],
              ["Phone", "phone", "tel"],
              ["Address", "address", "text"],
              ["Apt / Suite", "apartment", "text"],
              ["City", "city", "text"],
              ["State", "state", "text"],
              ["ZIP Code", "zip", "text"],
              ["Country", "country", "text"],
            ].map(([label, name, type]) => (
              <label key={name} className="bg-[#090909] p-5">
                <span className="text-xs uppercase tracking-[0.18em] text-bone/42 sm:tracking-[0.24em]">
                  {name === "country" ? "Country (two-letter code)" : label}
                </span>
                <input
                  disabled={pending}
                  maxLength={200}
                  required={name !== "apartment"}
                  name={name}
                  type={type}
                  defaultValue={name === "country" ? "US" : ""}
                  className="mt-4 min-h-12 w-full border border-bone/12 bg-ink px-4 text-sm text-bone outline-none transition focus:border-champagne"
                />
              </label>
            ))}
          </div>

          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-12 w-full items-center justify-center bg-bone px-6 text-center text-sm font-semibold uppercase tracking-[0.14em] text-ink transition hover:bg-champagne disabled:cursor-not-allowed disabled:opacity-40 sm:px-9 sm:tracking-[0.18em]"
          >
            {pending ? "Opening checkout…" : "Continue to payment"}
          </button>
        </form>

        <aside className="lg:sticky lg:top-8">
          <div className="border border-bone/12 bg-[#070707] p-5">
            <div className="relative min-h-[260px] overflow-hidden bg-black sm:min-h-[360px]">
              <Image
                src={product.image}
                alt="Wavedo 520"
                fill
                unoptimized
                className="object-contain"
              />
            </div>
            <div className="mt-7">
              <p className="text-xs uppercase tracking-[0.2em] text-bone/42 sm:tracking-[0.28em]">
                Order Summary
              </p>
              <h2 className="mt-4 font-display text-3xl leading-tight">
                {product.name}
              </h2>
              <p className="mt-3 text-sm text-bone/54">{product.color}</p>
            </div>

            <div className="mt-7 divide-y divide-bone/15 border-y border-bone/15">
              {items.map((item) => (
                <div key={item.size} className="flex flex-wrap items-center justify-between gap-4 py-5">
                  <div><p>Size {item.size}</p><p className="text-xs text-bone/60">Line total: {(item.quantity * unitAmount / 100).toFixed(2)} USD</p></div>
                  <div className="flex items-center gap-2">
                    <button type="button" aria-label={(item.quantity === 1 ? "Remove size " : "Decrease size ") + item.size} disabled={pending} onClick={() => changeQuantity(item.size, -1)} className="min-h-11 min-w-11 border border-bone/20">−</button>
                    <span aria-live="polite" className="min-w-8 text-center">{item.quantity}</span>
                    <button type="button" aria-label={"Increase " + item.size} disabled={pending || item.quantity >= maxQuantity} onClick={() => changeQuantity(item.size, 1)} className="min-h-11 min-w-11 border border-bone/20">+</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-4 text-sm text-bone/58">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Included" : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between border-t border-bone/12 pt-5 font-display text-3xl text-bone">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
