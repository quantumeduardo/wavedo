"use client";

import { useEffect, useState } from "react";
import { readCart } from "@/lib/cart-storage";

export function CartLink() {
  const [summary, setSummary] = useState<{ count: number; total: number } | null>(null);

  useEffect(() => {
    function update() {
      const count = (readCart()?.items ?? []).reduce((sum, item) => sum + item.quantity, 0);
      setSummary({ count, total: count * 100 });
    }
    update();
    window.addEventListener("storage", update);
    window.addEventListener("wavedo:cart-updated", update);
    window.addEventListener("pageshow", update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("wavedo:cart-updated", update);
      window.removeEventListener("pageshow", update);
    };
  }, []);

  return (
    <a href="/cart" className="flex min-h-11 flex-wrap items-center justify-end gap-x-3 gap-y-1">
      <span aria-live="polite" className="text-[10px] normal-case text-bone/60">
        {summary ? `${summary.count} ${summary.count === 1 ? "item" : "items"} · $${summary.total}` : ""}
      </span>
      <span>Cart ↗</span>
    </a>
  );
}
