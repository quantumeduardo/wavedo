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
    className: "min-h-[820px] md:col-span-2",
  },
  {
    label: "Look 02",
    src: "/images/wavedo-hoodie-fitness-robot-walk.png",
    alt: "Fitness robot model walking in the Wavēdo training hoodie",
    className: "min-h-[720px]",
  },
  {
    label: "Look 03",
    src: "/images/wavedo-hoodie-fitness-robot-recovery.png",
    alt: "Fitness robot model in a recovery stance wearing the Wavēdo training hoodie",
    className: "min-h-[720px]",
  },
  {
    label: "Front",
    src: "/images/wavedo-hoodie-front.png",
    alt: "Wavēdo paint-splatter hoodie front product image",
    className: "min-h-[560px]",
  },
  {
    label: "Angle",
    src: "/images/wavedo-hoodie-angle.png",
    alt: "Wavēdo paint-splatter hoodie angled product image",
    className: "min-h-[560px]",
  },
  {
    label: "Side",
    src: "/images/wavedo-hoodie-side.png",
    alt: "Wavēdo training hoodie side product image",
    className: "min-h-[560px]",
  },
  {
    label: "Back",
    src: "/images/wavedo-hoodie-back.png",
    alt: "Wavēdo training hoodie back product image",
    className: "min-h-[560px]",
  },
  {
    label: "Detail",
    src: "/images/wavedo-hoodie-detail.png",
    alt: "Wavēdo hoodie embroidery and paint splatter detail",
    className: "min-h-[420px] md:col-span-2",
  },
];

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

type ShopProps = {
  compact?: boolean;
};

export function Shop({ compact = false }: ShopProps) {
  const [focusedPreview, setFocusedPreview] = useState<(typeof productPreviews)[number] | null>(null);
  const [selectedSize, setSelectedSize] = useState("M");

  useEffect(() => {
    if (!focusedPreview) {
      return;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFocusedPreview(null);
      }
    };

    document.addEventListener("keydown", closeOnEscape);

    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [focusedPreview]);

  return (
    <section id="shop" className="bg-ink px-4 py-20 text-bone sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto grid max-w-[1500px] gap-10 lg:grid-cols-[1.12fr_0.88fr] lg:items-start">
        <div>
          <div className="mb-5 flex items-center justify-between gap-4 border-b border-bone/10 pb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-bone/48">
              Product Gallery
            </p>
            <p className="text-xs uppercase tracking-[0.24em] text-bone/34">
              Scroll for all angles
            </p>
          </div>
          {/* Replace product gallery images in the productPreviews array above. */}
          <div className="grid gap-4 md:grid-cols-2">
            {productPreviews.map((preview) => (
              <button
                type="button"
                key={preview.label}
                onClick={() => setFocusedPreview(preview)}
                className={`group relative overflow-hidden bg-[#030303] text-left ${preview.className}`}
                aria-label={`Zoom ${preview.label} product image`}
              >
                <Image
                  src={preview.src}
                  alt={preview.alt}
                  fill
                  unoptimized
                  className="object-contain transition duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute left-4 top-4 bg-black/70 px-3 py-2 text-[10px] uppercase tracking-[0.26em] text-bone/62">
                  {preview.label}
                </div>
                <div className="absolute bottom-4 right-4 border border-bone/20 bg-black/70 px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-bone/58 opacity-0 transition duration-300 group-hover:opacity-100">
                  Zoom
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Edit product details, price, and checkout URL in the shopItem object above. */}
        <div className="lg:sticky lg:top-8">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-bone/48">
            Shop / Hoodie
          </p>
          <h2 className="mt-5 max-w-2xl font-display text-5xl leading-tight sm:text-6xl">
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
            <div className="flex items-center justify-between gap-4">
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
          onClick={() => setFocusedPreview(null)}
        >
          <div
            className="relative h-[88vh] w-full max-w-6xl overflow-hidden bg-[#030303]"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={focusedPreview.src}
              alt={focusedPreview.alt}
              fill
              unoptimized
              className="object-contain"
            />
            <div className="absolute left-5 top-5 bg-black/72 px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-bone/70">
              {focusedPreview.label}
            </div>
            <button
              type="button"
              onClick={() => setFocusedPreview(null)}
              className="absolute right-5 top-5 border border-bone/25 bg-black/72 px-4 py-2 text-xs uppercase tracking-[0.24em] text-bone transition hover:border-champagne hover:text-champagne"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
