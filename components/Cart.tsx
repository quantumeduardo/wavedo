"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { CartItem, readCart, saveCart } from "@/lib/cart-storage";
const product = {
  name: "Wavēdo Training Hoodie",
  price: 100,
  image: "/images/wavedo-hoodie-front.png",
  color: "Bottle Green / Black",
};

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];



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
  const quantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const selectedSize = items.map((item) => item.size + " × " + item.quantity).join(", ");
  const subtotal = useMemo(() => product.price * quantity, [quantity]);
  const shipping = subtotal >= 100 ? 0 : 12;
  const total = subtotal + shipping;
  const [error, setError] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);
  const checkoutLock = useRef(false);
  const attempt = useRef<{ cart: string; id: string } | null>(null);
  async function checkout() {
    if (checkoutLock.current) return;
    checkoutLock.current = true;
    setCheckingOut(true);
    setError("");
    const cart = JSON.stringify(items);
    if (attempt.current?.cart !== cart) attempt.current = { cart, id: crypto.randomUUID() };
    try {
      const response = await fetch("/api/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, attempt: attempt.current.id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "Checkout could not be started.");
      const destination = new URL(result.url);
      if (destination.protocol !== "https:" || destination.hostname !== "checkout.stripe.com") throw new Error("Checkout could not be opened.");
      window.location.assign(destination.href);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Checkout could not be started. Your cart is saved.");
      setCheckingOut(false);
      checkoutLock.current = false;
    }
  }

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
        <section className="space-y-7" aria-busy={checkingOut}>
          <p className="text-xs uppercase tracking-[0.24em] text-bone/60">Checkout</p>
          <h1 className="font-display text-4xl sm:text-6xl">Your next layer.</h1>
          <p className="text-sm leading-7 text-bone/65">Your selected sizes and quantities carry through to secure checkout. Enter your shipping address and payment details there.</p>
          <p className="text-sm text-bone/70">{selectedSize}</p>
          <button type="button" onClick={checkout} disabled={checkingOut || quantity > 20} className="flex min-h-14 w-full items-center justify-center rounded-lg bg-bone px-6 text-sm font-semibold text-ink hover:bg-champagne disabled:opacity-50">
            {checkingOut ? "Opening checkout…" : "Continue to secure checkout"}
          </button>
          <p className="text-xs leading-6 text-bone/55">Pay by card, or use Apple Pay when available in Stripe. Shipping within the United States is included.</p>
          {quantity > 20 ? <p role="alert" className="text-sm text-champagne">Please limit each order to 20 hoodies.</p> : null}
          {error ? <p role="alert" className="rounded-xl border border-champagne/40 p-4 text-sm text-champagne">{error}</p> : null}
          <a href="/shop" className="inline-flex min-h-11 items-center text-sm text-bone/65">← Continue shopping</a>
        </section>

        <aside className="lg:sticky lg:top-8">
          <div className="border border-bone/12 bg-[#070707] p-5">
            <div className="relative min-h-[260px] overflow-hidden bg-black sm:min-h-[360px]">
              <Image
                src={product.image}
                alt="Wavēdo Training Hoodie"
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
                  <div><p>Size {item.size}</p><p className="text-xs text-bone/60">Line total: {item.quantity * product.price} USD</p></div>
                  <div className="flex items-center gap-2">
                    <button type="button" aria-label={(item.quantity === 1 ? "Remove size " : "Decrease size ") + item.size} disabled={checkingOut} onClick={() => changeQuantity(item.size, -1)} className="min-h-11 min-w-11 border border-bone/20">−</button>
                    <span aria-live="polite" className="min-w-8 text-center">{item.quantity}</span>
                    <button type="button" aria-label={"Increase " + item.size} disabled={checkingOut || quantity >= 20} onClick={() => changeQuantity(item.size, 1)} className="min-h-11 min-w-11 border border-bone/20">+</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-4 text-sm text-bone/58">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Included" : `$${shipping}`}</span>
              </div>
              <div className="flex justify-between border-t border-bone/12 pt-5 font-display text-3xl text-bone">
                <span>Total</span>
                <span>${total}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
