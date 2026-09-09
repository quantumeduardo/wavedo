"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { CartItem, readCart, saveCart } from "@/lib/cart-storage";
const product = {
  name: "Wavēdo Training Hoodie",
  price: 100,
  image: "/images/wavedo-hoodie-front.png",
  color: "Bottle Green / Black",
};

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];



function safePaymentLink(value: string) {
  try { const url = new URL(value.trim()); return url.protocol === "https:" && !url.username && !url.password ? url.href : ""; } catch { return ""; }
}
const paymentMethods = [
  { id: "card", label: "Card", href: process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ?? "" },
  { id: "paypal", label: "PayPal", href: process.env.NEXT_PUBLIC_PAYPAL_PAYMENT_LINK ?? "" },
  { id: "venmo", label: "Venmo", href: process.env.NEXT_PUBLIC_VENMO_PAYMENT_LINK ?? "" },
  { id: "cashapp", label: "Cash App", href: process.env.NEXT_PUBLIC_CASHAPP_PAYMENT_LINK ?? "" },
].map((method) => ({ ...method, href: safePaymentLink(method.href) }));

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
  const selectedPayment = paymentMethods.find((method) => method.href) ?? paymentMethods[0];

  const submitCheckout = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedPayment.href) return;
    const formData = new FormData(event.currentTarget);
    const fields = Object.fromEntries(formData.entries());
    const notificationPayload = {
      type: "order",
      subject: "New Wavēdo Hoodie Order",
      fields: {
        ...fields,
        product: product.name,
        color: product.color,
        size: selectedSize,
        quantity,
        subtotal: `$${subtotal}`,
        shipping: shipping === 0 ? "Included" : `$${shipping}`,
        total: `$${total}`,
        paymentMethod: selectedPayment.label,
      },
    };

    if (selectedPayment.href) {
      navigator.sendBeacon?.(
        "/api/notify",
        new Blob([JSON.stringify(notificationPayload)], {
          type: "application/json",
        }),
      );
      window.location.href = selectedPayment.href;
      return;
    }

    fetch("/api/notify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(notificationPayload),
    });
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

          <section aria-labelledby="express-checkout" className="rounded-2xl border border-bone/20 p-5 sm:p-7">
            <h2 id="express-checkout" className="text-center text-sm font-semibold uppercase tracking-[0.18em]">Express checkout</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {paymentMethods.map((method) => {
                const label = method.id === "card" ? "Card & wallets" : method.label;
                const styles = "flex min-h-14 items-center justify-center rounded-lg border border-bone/20 px-5 text-sm font-semibold";
                return method.href ? (
                  <a key={method.id} href={method.href} className={`${styles} bg-bone text-ink transition hover:bg-champagne`}>{label} ↗</a>
                ) : (
                  <button key={method.id} type="button" disabled className={`${styles} cursor-not-allowed text-bone/40`} aria-label={`${label} unavailable`}>{label} · Unavailable</button>
                );
              })}
            </div>
            {paymentMethods[0].href ? <p className="mt-4 text-center text-xs leading-6 text-bone/60">Apple Pay is available in Stripe checkout on supported devices when enabled.</p> : null}
            <p className="mt-3 text-center text-xs leading-6 text-bone/60">Continue directly to your payment provider. Confirm your size, quantity, shipping address, and final total there before paying.</p>
            <p className="mt-2 text-center text-xs leading-6 text-bone/50">Selected here: {selectedSize} · {quantity} {quantity === 1 ? "hoodie" : "hoodies"}. These selections are not automatically transferred to payment links.</p>
          </section>
          <div className="flex items-center gap-4 text-xs uppercase tracking-wider text-bone/50"><span className="h-px flex-1 bg-bone/15" />Or enter shipping details<span className="h-px flex-1 bg-bone/15" /></div>

          {/* Shipping form fields can be connected to a backend, CRM, or payment provider later. */}
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
                  {label}
                </span>
                <input
                  required={name !== "apartment"}
                  name={name}
                  type={type}
                  defaultValue={name === "country" ? "United States" : ""}
                  className="mt-4 min-h-12 w-full border border-bone/12 bg-ink px-4 text-sm text-bone outline-none transition focus:border-champagne"
                />
              </label>
            ))}
          </div>

          <button
            type="submit"
            disabled={!selectedPayment.href}
            className="inline-flex min-h-12 w-full items-center justify-center bg-bone px-6 text-center text-sm font-semibold uppercase tracking-[0.14em] text-ink transition hover:bg-champagne disabled:cursor-not-allowed disabled:opacity-40 sm:px-9 sm:tracking-[0.18em]"
          >
            Continue with {selectedPayment.label}
          </button>
        </form>

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
                    <button type="button" aria-label={(item.quantity === 1 ? "Remove size " : "Decrease size ") + item.size} onClick={() => changeQuantity(item.size, -1)} className="min-h-11 min-w-11 border border-bone/20">−</button>
                    <span aria-live="polite" className="min-w-8 text-center">{item.quantity}</span>
                    <button type="button" aria-label={"Increase " + item.size} onClick={() => changeQuantity(item.size, 1)} className="min-h-11 min-w-11 border border-bone/20">+</button>
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
