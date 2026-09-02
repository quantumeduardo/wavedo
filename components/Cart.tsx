"use client";

import Image from "next/image";
import { FormEvent, useMemo, useState } from "react";

const product = {
  name: "Wavēdo Training Hoodie",
  price: 100,
  image: "/images/wavedo-hoodie-front.png",
  color: "Bottle Green / Black",
};

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
const paymentMethods = [
  {
    id: "card",
    label: "Card",
    note: "Secure card checkout",
    envName: "NEXT_PUBLIC_STRIPE_PAYMENT_LINK",
    href: process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ?? "",
  },
  {
    id: "paypal",
    label: "PayPal",
    note: "Pay with PayPal",
    envName: "NEXT_PUBLIC_PAYPAL_PAYMENT_LINK",
    href: process.env.NEXT_PUBLIC_PAYPAL_PAYMENT_LINK ?? "",
  },
  {
    id: "venmo",
    label: "Venmo",
    note: "Pay with Venmo",
    envName: "NEXT_PUBLIC_VENMO_PAYMENT_LINK",
    href: process.env.NEXT_PUBLIC_VENMO_PAYMENT_LINK ?? "",
  },
  {
    id: "cashapp",
    label: "Cash App",
    note: "Pay with Cash App",
    envName: "NEXT_PUBLIC_CASHAPP_PAYMENT_LINK",
    href: process.env.NEXT_PUBLIC_CASHAPP_PAYMENT_LINK ?? "",
  },
];

type CartProps = {
  initialSize?: string;
};

export function Cart({ initialSize = "M" }: CartProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(
    sizes.includes(initialSize) ? initialSize : "M",
  );
  const [selectedPaymentId, setSelectedPaymentId] = useState(paymentMethods[0].id);
  const [submitted, setSubmitted] = useState(false);

  const subtotal = useMemo(() => product.price * quantity, [quantity]);
  const shipping = subtotal >= 100 ? 0 : 12;
  const total = subtotal + shipping;
  const selectedPayment = paymentMethods.find(
    (method) => method.id === selectedPaymentId,
  ) ?? paymentMethods[0];

  const submitCheckout = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
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

  return (
    <section className="min-h-screen bg-ink px-4 py-20 text-bone sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_0.72fr] lg:items-start">
        <form onSubmit={submitCheckout} className="space-y-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-bone/48">
              Checkout
            </p>
            <h1 className="mt-5 font-display text-5xl leading-tight sm:text-6xl">
              Shipping Information
            </h1>
          </div>

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
                <span className="text-xs uppercase tracking-[0.24em] text-bone/42">
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

          <div className="border-y border-bone/12 py-7">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-bone/58">
              Payment
            </p>
            <p className="mt-4 text-sm leading-7 text-bone/56">
              Choose a secure payment option. Add the provider payment link in your
              environment variables when each option is ready.
            </p>
            <div className="mt-6 grid gap-px bg-bone/12 sm:grid-cols-2">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedPaymentId(method.id)}
                  className={`min-h-24 p-5 text-left transition ${
                    selectedPaymentId === method.id
                      ? "bg-bone text-ink"
                      : "bg-[#090909] text-bone hover:bg-bone hover:text-ink"
                  }`}
                >
                  <span className="block text-sm font-semibold uppercase tracking-[0.2em]">
                    {method.label}
                  </span>
                  <span
                    className={`mt-3 block text-xs leading-5 ${
                      selectedPaymentId === method.id ? "text-ink/60" : "text-bone/46"
                    }`}
                  >
                    {method.note}
                  </span>
                </button>
              ))}
            </div>
            {submitted && !selectedPayment.href ? (
              <p className="mt-5 border border-champagne/30 bg-champagne/10 p-4 text-sm leading-7 text-champagne">
                Shipping information captured in this checkout preview. Add
                <span className="text-bone"> {selectedPayment.envName} </span>
                to enable {selectedPayment.label} payments.
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            className="inline-flex min-h-12 w-full items-center justify-center bg-bone px-9 text-sm font-semibold uppercase tracking-[0.18em] text-ink transition hover:bg-champagne"
          >
            Continue with {selectedPayment.label}
          </button>
        </form>

        <aside className="lg:sticky lg:top-8">
          <div className="border border-bone/12 bg-[#070707] p-5">
            <div className="relative min-h-[360px] overflow-hidden bg-black">
              <Image
                src={product.image}
                alt="Wavēdo Training Hoodie"
                fill
                unoptimized
                className="object-contain"
              />
            </div>
            <div className="mt-7">
              <p className="text-xs uppercase tracking-[0.28em] text-bone/42">
                Order Summary
              </p>
              <h2 className="mt-4 font-display text-3xl leading-tight">
                {product.name}
              </h2>
              <p className="mt-3 text-sm text-bone/54">{product.color}</p>
            </div>

            <div className="mt-7">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-bone/48">
                Size
              </p>
              <div className="mt-4 grid grid-cols-6 gap-px bg-bone/16">
                {sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`min-h-11 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                      selectedSize === size
                        ? "bg-bone text-ink"
                        : "bg-ink text-bone/72 hover:bg-bone hover:text-ink"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-7 flex items-center justify-between border-y border-bone/12 py-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-bone/48">
                Quantity
              </p>
              <div className="flex items-center gap-px bg-bone/16">
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  className="min-h-10 w-10 bg-ink text-lg text-bone transition hover:bg-bone hover:text-ink"
                >
                  -
                </button>
                <span className="flex min-h-10 w-12 items-center justify-center bg-ink text-sm">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((current) => current + 1)}
                  className="min-h-10 w-10 bg-ink text-lg text-bone transition hover:bg-bone hover:text-ink"
                >
                  +
                </button>
              </div>
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
