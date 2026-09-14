"use client";
import { useEffect, useState } from "react";
import { readCart, saveCart } from "@/lib/cart-storage";
export function CheckoutResult({ sessionId }: { sessionId?: string }) {
  const [message, setMessage] = useState("Confirming your payment…");
  const [paid, setPaid] = useState(false);
  useEffect(() => {
    let cancelled = false;
    async function check() {
      if (!sessionId) { setMessage("No checkout was provided. Return to your cart to continue."); return; }
      try {
        const response = await fetch(`/api/checkout/status?session_id=${encodeURIComponent(sessionId)}`, { cache: "no-store" });
        const result = await response.json();
        if (cancelled) return;
        if (!response.ok || result.status !== "paid") {
          setMessage("Payment confirmation is not available yet. Your cart is saved. Refresh this page to check again before starting another payment.");
          return;
        }
        setPaid(true);
        setMessage(result.test ? "Test payment confirmed. No real charge was made." : "Payment confirmed. Thank you for your order.");
        // Only subtract purchased quantities once, retaining anything added since checkout.
        const marker = `wavedo-paid-${sessionId}`;
        try {
          if (!localStorage.getItem(marker)) {
            const saved = readCart();
            const items = (saved?.items ?? []).map((item) => ({ ...item, quantity: item.quantity - (result.items.find((paidItem: { size: string; quantity: number }) => paidItem.size === item.size)?.quantity ?? 0) })).filter((item) => item.quantity > 0);
            saveCart({ ...(items[0] ?? { size: "M", quantity: 0 }), items });
            localStorage.setItem(marker, "true");
          }
        } catch { /* Payment is confirmed even if browser storage is unavailable. */ }
      } catch {
        if (!cancelled) setMessage("We couldn’t check payment status. Refresh this page to try again. Your cart has not been cleared.");
      }
    }
    void check();
    return () => { cancelled = true; };
  }, [sessionId]);
  return <main className="min-h-screen bg-ink px-6 py-24 text-center text-bone">
    <h1 className="font-display text-4xl">{paid ? "Your order is confirmed." : "Checking your order"}</h1>
    <p role="status" className="mx-auto mt-6 max-w-xl text-sm leading-7 text-bone/70">{message}</p>
    <a href={paid ? "/shop" : "/cart"} className="mt-8 inline-flex min-h-12 items-center bg-bone px-8 text-ink">{paid ? "Back to shop" : "Back to cart"}</a>
  </main>;
}
