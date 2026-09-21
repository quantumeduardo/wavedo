"use client";

import Image from "next/image";
import { addToCart, readCart } from "@/lib/cart-storage";
import { cartSizes as sizes, unitAmount, maxQuantity } from "@/lib/checkout";
import { coachingUrl } from "@/lib/site-links";
import { useEffect, useState } from "react";

const shopItem = {
  name: "Wavedo 520",
  price: `$${unitAmount / 100}`,
  eyebrow: "Limited Drop 01",
  description:
    "Heavyweight 520 GSM, 100% organic cotton. A clean, baggy silhouette with dropped shoulders, ribbed wrists and waist, and a kangaroo pocket finished with the cream Wavēdo logo.",
  color: "Jet Black",
  includes: ["520 GSM heavyweight fabric", "100% organic cotton", "Baggy fit with dropped shoulders", "Ribbed wrists and waist"],
  checkoutUrl: "/cart",
};

const productPreviews = [
  {
    label: "Front",
    src: "/images/wavedo-hoodie-jet-black-front.png",
    alt: "Jet-black Wavedo 520 GSM hoodie with cream pocket logo, front view",
  },
  {
    label: "Back",
    src: "/images/wavedo-hoodie-jet-black-back.png",
    alt: "Wavedo 520 hoodie back product image",
  },
];


export function Shop() {
  const [focusedPreviewIndex, setFocusedPreviewIndex] = useState<number | null>(null);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [existingItems, setExistingItems] = useState<{size: string; quantity: number}[]>([]);
  const [selectedSize, setSelectedSize] = useState("M");
  const remaining = Math.max(0, maxQuantity - (existingItems.find(item => item.size === selectedSize)?.quantity ?? 0));
  useEffect(() => {
    const saved = readCart();
    if (saved) { setSelectedSize(saved.size); setExistingItems(saved.items); }
  }, []);
  const activePreview = productPreviews[activePreviewIndex];
  const focusedPreview =
    focusedPreviewIndex === null ? null : productPreviews[focusedPreviewIndex];
  const focusedPreviewPosition = focusedPreviewIndex === null ? 0 : focusedPreviewIndex + 1;
  const showPreviousPreview = () => {
    setActivePreviewIndex((currentIndex) =>
      currentIndex === 0 ? productPreviews.length - 1 : currentIndex - 1,
    );
  };
  const showNextPreview = () => {
    setActivePreviewIndex((currentIndex) => (currentIndex + 1) % productPreviews.length);
  };
  const showPreviousFocusedPreview = () => {
    setFocusedPreviewIndex((currentIndex) => {
      if (currentIndex === null) {
        return productPreviews.length - 1;
      }

      return currentIndex === 0 ? productPreviews.length - 1 : currentIndex - 1;
    });
  };
  const showNextFocusedPreview = () => {
    setFocusedPreviewIndex((currentIndex) => {
      if (currentIndex === null) {
        return 0;
      }

      return (currentIndex + 1) % productPreviews.length;
    });
  };

  useEffect(() => {
    if (focusedPreviewIndex === null) {
      return;
    }

    const handleFocusedPreviewKeys = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFocusedPreviewIndex(null);
      }

      if (event.key === "ArrowLeft") {
        showPreviousFocusedPreview();
      }

      if (event.key === "ArrowRight") {
        showNextFocusedPreview();
      }
    };

    document.addEventListener("keydown", handleFocusedPreviewKeys);

    return () => document.removeEventListener("keydown", handleFocusedPreviewKeys);
  }, [focusedPreviewIndex]);

  return (
    <section id="shop" className="px-5 pb-10 pt-8 sm:px-10 sm:pt-12">
      <div className="mx-auto w-full max-w-[480px]">
        <button type="button" onClick={() => setFocusedPreviewIndex(activePreviewIndex)} className="group relative block aspect-square w-full overflow-hidden bg-black" aria-label={`Zoom ${activePreview.label} product image`}>
          <Image src={activePreview.src} alt={activePreview.alt} fill priority unoptimized sizes="(max-width: 520px) 100vw, 480px" className="object-contain transition-transform duration-500 group-hover:scale-105" />
          <span className="absolute bottom-4 right-4 bg-white px-2 py-1 text-xs text-black">＋</span>
        </button>
        <div className="mt-3 flex items-center justify-between text-[10px] uppercase text-bone/60">
          <button type="button" onClick={showPreviousPreview} aria-label="Previous hoodie image" className="min-h-11 px-2">←</button>
          <div className="flex gap-1">
            {productPreviews.map((preview, index) => (
              <button key={preview.label} type="button" onClick={() => setActivePreviewIndex(index)} aria-label={`Show ${preview.label} product image`} aria-pressed={index === activePreviewIndex} className={`min-h-11 px-2 sm:px-3 ${index === activePreviewIndex ? "text-bone underline underline-offset-4" : "hover:text-champagne"}`}>{preview.label}</button>
            ))}
          </div>
          <button type="button" onClick={showNextPreview} aria-label="Next hoodie image" className="min-h-11 px-2">→</button>
        </div>
        <div className="mt-6 text-center text-xs uppercase leading-6">
          <h1 className="text-sm">{shopItem.name}</h1><p>{shopItem.price}</p>
          <p className="mt-2 text-[10px] text-bone/60">{shopItem.eyebrow} · {shopItem.color}</p>
        </div>
        <fieldset className="mt-7">
          <legend className="w-full text-center text-[10px] uppercase text-bone/60">Select size</legend>
          <div className="mt-3 flex justify-center gap-1 sm:gap-3">
            {sizes.map((size) => (
              <button key={size} type="button" onClick={() => { setSelectedSize(size); setQuantity(1); }} aria-pressed={selectedSize === size} className={`min-h-11 min-w-11 border text-xs ${selectedSize === size ? "border-bone bg-bone text-ink" : "border-transparent hover:border-bone/40"}`}>{size}</button>
            ))}
          </div>
        </fieldset>
        <div className="mt-6 text-center">
          <p id="quantity-label" className="text-[10px] uppercase text-bone/60">Quantity</p>
          <div role="group" aria-labelledby="quantity-label" className="mt-3 flex items-center justify-center gap-4">
            <button type="button" aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity(value => value - 1)} className="min-h-11 min-w-11 border border-bone/30 disabled:opacity-30">−</button>
            <span aria-live="polite" className="min-w-8 text-sm">{quantity}</span>
            <button type="button" aria-label="Increase quantity" disabled={quantity >= remaining} onClick={() => setQuantity(value => value + 1)} className="min-h-11 min-w-11 border border-bone/30 disabled:opacity-30">+</button>
          </div>
          {remaining === 0 && <p role="status" className="mt-2 text-xs text-bone/60">Your bag already has the maximum of 99 in this size.</p>}
        </div>
        <button type="button" disabled={remaining === 0} onClick={() => {
          const cart = addToCart(selectedSize, Math.min(quantity, remaining));
          window.location.assign(`${shopItem.checkoutUrl}?size=${cart.size}&quantity=${cart.quantity}`);
        }} className="mt-6 flex min-h-12 w-full items-center justify-center bg-bone px-6 text-xs uppercase text-ink hover:bg-champagne disabled:opacity-30">Add to Bag</button>
        <a href={`${coachingUrl}/#contact`} className="mx-auto mt-2 flex min-h-11 w-fit items-center text-[10px] uppercase text-bone/60">Size guide ↗</a>
        <div className="mt-6 divide-y divide-bone/15 border-y border-bone/15 text-xs leading-6">
          <details className="py-4">
            <summary className="cursor-pointer uppercase">Product details</summary>
            <p className="mt-4 text-bone/60">{shopItem.description}</p>
            <ul className="mt-4 list-inside list-disc text-bone/60">{shopItem.includes.map((item) => <li key={item}>{item}</li>)}</ul>
          </details>
          <details className="py-4"><summary className="cursor-pointer uppercase">Shipping</summary><p className="mt-4 text-bone/60">Review shipping and payment options at checkout.</p></details>
        </div>
      </div>

      {focusedPreview ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 px-4 py-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`${focusedPreview.label} focused product image`}
          onClick={() => setFocusedPreviewIndex(null)}
        >
          <div
            className="relative h-[86svh] w-full max-w-6xl overflow-hidden bg-white pb-20 sm:h-[88vh] sm:pb-0"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={focusedPreview.src}
              alt={focusedPreview.alt}
              fill
              unoptimized
              className="object-contain"
            />
            <div className="absolute left-3 top-3 max-w-[58vw] bg-white px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-black sm:left-5 sm:top-5 sm:max-w-none sm:px-4 sm:tracking-[0.28em]">
              {focusedPreview.label} / 0{focusedPreviewPosition} of 0{productPreviews.length}
            </div>
            <button
              type="button"
              onClick={() => setFocusedPreviewIndex(null)}
              className="absolute right-3 top-3 border border-black/30 bg-white px-3 py-2 text-xs uppercase tracking-[0.16em] text-black transition hover:border-black hover:bg-gray-100 sm:right-5 sm:top-5 sm:px-4 sm:tracking-[0.24em]"
            >
              Close
            </button>
            <button
              type="button"
              onClick={showPreviousFocusedPreview}
              className="absolute bottom-5 left-4 min-h-11 border border-black/30 bg-white px-4 text-xs font-semibold uppercase tracking-[0.16em] text-black transition hover:border-black hover:bg-gray-100 sm:bottom-auto sm:top-1/2 sm:min-h-12 sm:-translate-y-1/2 sm:tracking-[0.22em]"
              aria-label="Previous zoomed hoodie image"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={showNextFocusedPreview}
              className="absolute bottom-5 right-4 min-h-11 border border-black/30 bg-white px-4 text-xs font-semibold uppercase tracking-[0.16em] text-black transition hover:border-black hover:bg-gray-100 sm:bottom-auto sm:top-1/2 sm:min-h-12 sm:-translate-y-1/2 sm:tracking-[0.22em]"
              aria-label="Next zoomed hoodie image"
            >
              Next
            </button>
            <div className="absolute bottom-[4.75rem] left-1/2 flex -translate-x-1/2 gap-2 bg-white px-3 py-2 sm:bottom-5">
              {productPreviews.map((preview, index) => (
                <button
                  key={preview.label}
                  type="button"
                  onClick={() => setFocusedPreviewIndex(index)}
                  className={`h-2.5 w-8 transition ${
                    index === focusedPreviewIndex ? "bg-black" : "bg-gray-300 hover:bg-gray-500"
                  }`}
                  aria-label={`Zoom ${preview.label}`}
                  aria-current={index === focusedPreviewIndex}
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
