"use client";

import Image from "next/image";
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

type ShopProps = {
  compact?: boolean;
};

export function Shop({ compact = false }: ShopProps) {
  const [focusedPreviewIndex, setFocusedPreviewIndex] = useState<number | null>(null);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("M");
  const activePreview = productPreviews[activePreviewIndex];
  const focusedPreview =
    focusedPreviewIndex === null ? null : productPreviews[focusedPreviewIndex];
  const activePreviewPosition = activePreviewIndex + 1;
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
    <section id="shop" className="bg-ink px-4 py-16 text-bone sm:px-6 sm:py-20 lg:px-8 lg:py-28">
      <div className="mx-auto grid max-w-[1500px] gap-10 lg:grid-cols-[1.12fr_0.88fr] lg:items-start">
        <div>
          <div className="mb-5 flex items-center justify-between gap-4 border-b border-bone/10 pb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-bone/48 sm:tracking-[0.28em]">
              Product Gallery
            </p>
            <p className="text-xs uppercase tracking-[0.16em] text-bone/34 sm:tracking-[0.24em]">
              0{activePreviewPosition} / 0{productPreviews.length}
            </p>
          </div>
          {/* Replace product gallery images in the productPreviews array above. */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setFocusedPreviewIndex(activePreviewIndex)}
              className="group relative min-h-[360px] w-full overflow-hidden bg-[#030303] text-left sm:min-h-[620px]"
              aria-label={`Zoom ${activePreview.label} product image`}
            >
              <Image
                src={activePreview.src}
                alt={activePreview.alt}
                fill
                unoptimized
                className="object-contain transition duration-700 ease-out group-hover:scale-110"
              />
              <div className="absolute left-4 top-4 bg-black/70 px-3 py-2 text-[10px] uppercase tracking-[0.26em] text-bone/62">
                {activePreview.label}
              </div>
              <div className="absolute bottom-4 right-4 border border-bone/20 bg-black/70 px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-bone/58 opacity-0 transition duration-300 group-hover:opacity-100">
                Click to Focus
              </div>
            </button>

            <div className="grid grid-cols-[1fr_1fr] items-center gap-3 sm:grid-cols-[auto_1fr_auto]">
              <button
                type="button"
                onClick={showPreviousPreview}
                className="min-h-11 border border-bone/16 px-4 text-xs font-semibold uppercase tracking-[0.16em] text-bone/70 transition hover:border-champagne hover:text-champagne sm:tracking-[0.2em]"
                aria-label="Previous hoodie image"
              >
                Prev
              </button>
              <div className="col-span-2 row-start-2 overflow-x-auto sm:col-span-1 sm:row-start-auto">
                <div className="flex min-w-max gap-3">
                  {productPreviews.map((preview, index) => (
                    <button
                      key={preview.label}
                      type="button"
                      onClick={() => setActivePreviewIndex(index)}
                      className={`relative h-24 w-20 shrink-0 overflow-hidden border bg-[#030303] transition sm:h-28 sm:w-24 ${
                        index === activePreviewIndex
                          ? "border-champagne"
                          : "border-bone/12 hover:border-bone/40"
                      }`}
                      aria-label={`Show ${preview.label} product image`}
                      aria-current={index === activePreviewIndex}
                    >
                      <Image
                        src={preview.src}
                        alt={preview.alt}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                      <span className="absolute inset-x-0 bottom-0 bg-black/72 px-2 py-1 text-[9px] uppercase tracking-[0.16em] text-bone/70">
                        {preview.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={showNextPreview}
                className="min-h-11 border border-bone/16 px-4 text-xs font-semibold uppercase tracking-[0.16em] text-bone/70 transition hover:border-champagne hover:text-champagne sm:tracking-[0.2em]"
                aria-label="Next hoodie image"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Edit product details, price, and checkout URL in the shopItem object above. */}
        <div className="lg:sticky lg:top-8">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-bone/48">
            Shop / Hoodie
          </p>
          <h2 className="mt-5 max-w-2xl font-display text-4xl leading-tight sm:text-6xl">
            {shopItem.name}
          </h2>
          <p className="mt-5 font-display text-4xl text-bone">{shopItem.price}</p>

          <div className="mt-10 border-y border-bone/12 py-7">
            <p className="text-sm leading-7 text-bone/62">{shopItem.description}</p>
            <div className="mt-7 grid gap-4 text-sm text-bone/58 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-bone/36">Color</p>
                <p className="mt-2 text-bone/72">{shopItem.color}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-bone/36">Release</p>
                <p className="mt-2 text-bone/72">{shopItem.eyebrow}</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-bone/58">
                Select Size
              </p>
              <a href="#contact" className="text-xs uppercase tracking-[0.22em] text-bone/42 transition hover:text-champagne">
                Size guide
              </a>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-px bg-bone/16 sm:grid-cols-6">
              {sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`min-h-12 text-xs font-semibold uppercase tracking-[0.18em] transition ${
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

          <a
            href={`${shopItem.checkoutUrl}?size=${selectedSize}`}
            className="mt-7 inline-flex min-h-12 w-full items-center justify-center bg-bone px-9 text-sm font-semibold uppercase tracking-[0.18em] text-ink transition hover:bg-champagne"
          >
            Add to Cart
          </a>

          <div className="mt-8 divide-y divide-bone/12 border-y border-bone/12">
            <details className="group py-5" open>
              <summary className="cursor-pointer list-none text-xs font-semibold uppercase tracking-[0.26em] text-bone/70">
                Product Details
              </summary>
              <ul className="mt-5 space-y-3 text-sm leading-7 text-bone/58">
                {shopItem.includes.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </details>
            <details className="group py-5">
              <summary className="cursor-pointer list-none text-xs font-semibold uppercase tracking-[0.26em] text-bone/70">
                Shipping
              </summary>
              <p className="mt-5 text-sm leading-7 text-bone/58">
                Checkout currently routes through the intake form while payment setup is pending.
              </p>
            </details>
          </div>

          <div className="mt-8 grid gap-px bg-bone/12 sm:grid-cols-2">
            {shopItem.includes.map((item) => (
              <div key={item} className="bg-[#090909] p-5 text-xs uppercase leading-6 tracking-[0.16em] text-bone/48">
                {item}
              </div>
            ))}
          </div>
          {!compact ? (
            <p className="mt-6 max-w-xl text-xs uppercase tracking-[0.22em] text-bone/34">
              Replace the add-to-cart URL with a live checkout link when ready.
            </p>
          ) : null}
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
