"use client";

import Image from "next/image";
import { addToCart, readCart } from "@/lib/cart-storage";
import { coachingUrl } from "@/lib/site-links";
import { useEffect, useState } from "react";

const shopItem = {
  name: "Wavēdo Training Hoodie",
  price: "$100",
  eyebrow: "Limited Drop 01",
  description:
    "Dark bottle-green black performance fleece with a subtle off-white splatter finish and cream Wavēdo embroidery near the lower pocket seam.",
  color: "Bottle Green / Black",
  includes: ["Performance fleece", "Athletic warmup fit", "Ribbed cuffs and waistline", "Cream embroidered Wavēdo mark"],
  checkoutUrl: "/cart",
};

const productPreviews = [
  {
    label: "Look 01",
    src: "/images/wavedo-hoodie-fitness-robot.png",
    alt: "Fitness robot model wearing the Wavēdo training hoodie",
  },
  {
    label: "Look 02",
    src: "/images/wavedo-hoodie-fitness-robot-walk.png",
    alt: "Fitness robot model walking in the Wavēdo training hoodie",
  },
  {
    label: "Front",
    src: "/images/wavedo-hoodie-front.png",
    alt: "Wavēdo paint-splatter hoodie front product image",
  },
  {
    label: "Back",
    src: "/images/wavedo-hoodie-back.png",
    alt: "Wavēdo training hoodie back product image",
  },
];

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

export function Shop() {
  const [focusedPreviewIndex, setFocusedPreviewIndex] = useState<number | null>(null);
  const [activePreviewIndex, setActivePreviewIndex] = useState(2);
  const [selectedSize, setSelectedSize] = useState("M");
  useEffect(() => {
    const saved = readCart();
    if (saved) setSelectedSize(saved.size);
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
          <span className="absolute bottom-4 right-4 text-xs text-white">＋</span>
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
              <button key={size} type="button" onClick={() => setSelectedSize(size)} aria-pressed={selectedSize === size} className={`min-h-11 min-w-11 border text-xs ${selectedSize === size ? "border-bone bg-bone text-ink" : "border-transparent hover:border-bone/40"}`}>{size}</button>
            ))}
          </div>
        </fieldset>
        <button type="button" onClick={() => {
          const cart = addToCart(selectedSize);
          window.location.assign(`${shopItem.checkoutUrl}?size=${cart.size}&quantity=${cart.quantity}`);
        }} className="mt-6 flex min-h-12 w-full items-center justify-center bg-bone px-6 text-xs uppercase text-ink hover:bg-champagne">Add to Cart</button>
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
            className="relative h-[86svh] w-full max-w-6xl overflow-hidden bg-[#030303] pb-20 sm:h-[88vh] sm:pb-0"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={focusedPreview.src}
              alt={focusedPreview.alt}
              fill
              unoptimized
              className="object-contain"
            />
            <div className="absolute left-3 top-3 max-w-[58vw] bg-black/72 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-bone/70 sm:left-5 sm:top-5 sm:max-w-none sm:px-4 sm:tracking-[0.28em]">
              {focusedPreview.label} / 0{focusedPreviewPosition} of 0{productPreviews.length}
            </div>
            <button
              type="button"
              onClick={() => setFocusedPreviewIndex(null)}
              className="absolute right-3 top-3 border border-bone/25 bg-black/72 px-3 py-2 text-xs uppercase tracking-[0.16em] text-bone transition hover:border-champagne hover:text-champagne sm:right-5 sm:top-5 sm:px-4 sm:tracking-[0.24em]"
            >
              Close
            </button>
            <button
              type="button"
              onClick={showPreviousFocusedPreview}
              className="absolute bottom-5 left-4 min-h-11 border border-bone/25 bg-black/72 px-4 text-xs font-semibold uppercase tracking-[0.16em] text-bone transition hover:border-champagne hover:text-champagne sm:top-1/2 sm:min-h-12 sm:-translate-y-1/2 sm:tracking-[0.22em]"
              aria-label="Previous zoomed hoodie image"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={showNextFocusedPreview}
              className="absolute bottom-5 right-4 min-h-11 border border-bone/25 bg-black/72 px-4 text-xs font-semibold uppercase tracking-[0.16em] text-bone transition hover:border-champagne hover:text-champagne sm:top-1/2 sm:min-h-12 sm:-translate-y-1/2 sm:tracking-[0.22em]"
              aria-label="Next zoomed hoodie image"
            >
              Next
            </button>
            <div className="absolute bottom-[4.75rem] left-1/2 flex -translate-x-1/2 gap-2 bg-black/64 px-3 py-2 sm:bottom-5">
              {productPreviews.map((preview, index) => (
                <button
                  key={preview.label}
                  type="button"
                  onClick={() => setFocusedPreviewIndex(index)}
                  className={`h-2.5 w-8 transition ${
                    index === focusedPreviewIndex ? "bg-champagne" : "bg-bone/24 hover:bg-bone/50"
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
