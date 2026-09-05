"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const caseStudies = [
  {
    name: "Audrey",
    phase: "Strength & Renewal",
    quote:
      "Wavēdo gave me the structure I was missing. Training stopped feeling random, nutrition became simple, and my energy finally matched the work I was putting in.",
  },
  {
    name: "Marcus",
    phase: "Recomposition",
    quote:
      "The biggest shift was clarity. I knew exactly what to train, how to recover, and how to stay consistent without rebuilding my plan every Monday.",
  },
  {
    name: "Elena",
    phase: "Hybrid Coaching",
    quote:
      "I came in overwhelmed and left with a rhythm I could trust. The balance of strength, food, recovery, and accountability changed how I show up.",
  },
];

const transformationImages = {
  before: {
    src: "/images/sample-before.png",
    alt: "Sample before transformation",
    label: "Before",
  },
  after: {
    src: "/images/sample-after.png",
    alt: "Sample after transformation",
    label: "After",
  },
};

export function Testimonial() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomedImage, setZoomedImage] = useState<
    (typeof transformationImages)[keyof typeof transformationImages] | null
  >(null);
  const activeCase = caseStudies[activeIndex];
  const showPreviousCase = () => {
    setActiveIndex((currentIndex) =>
      currentIndex === 0 ? caseStudies.length - 1 : currentIndex - 1,
    );
  };
  const showNextCase = () => {
    setActiveIndex((currentIndex) => (currentIndex + 1) % caseStudies.length);
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((currentIndex) => {
        let nextIndex = currentIndex;

        while (nextIndex === currentIndex && caseStudies.length > 1) {
          nextIndex = Math.floor(Math.random() * caseStudies.length);
        }

        return nextIndex;
      });
    }, 5200);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!zoomedImage) {
      return;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setZoomedImage(null);
      }
    };

    document.addEventListener("keydown", closeOnEscape);

    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [zoomedImage]);

  return (
    <section className="energy-flow-section relative overflow-hidden bg-ink px-4 py-16 text-bone sm:px-8 sm:py-24 lg:py-32">
      <div className="energy-flow-line energy-flow-line-one" />
      <div className="energy-flow-line energy-flow-line-two" />
      <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.95fr_1fr] lg:items-center">
        {/* Replace these cylinder panels with real transformation imagery when available. */}
        <div className="testimonial-slide case-cylinder-scene" aria-label="3D transformation case studies">
          <div
            className="case-cylinder"
            style={{ transform: `rotateY(${-activeIndex * 120}deg)` }}
          >
            {caseStudies.map((caseStudy, index) => (
              <div
                key={caseStudy.name}
                role="button"
                tabIndex={0}
                aria-label={`Show ${caseStudy.name} case study`}
                aria-current={index === activeIndex}
                onClick={() => setActiveIndex(index)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setActiveIndex(index);
                  }
                }}
                className={`case-cylinder-panel ${
                  index === activeIndex ? "case-cylinder-panel-active" : ""
                }`}
                style={{
                  transform: `rotateY(${index * 120}deg) translateZ(var(--case-cylinder-radius))`,
                }}
              >
                <span className="text-xs tracking-[0.32em] text-champagne">
                  Case 0{index + 1}
                </span>
                <span className="mt-6 block font-display text-3xl leading-tight text-bone sm:mt-8 sm:text-4xl">
                  {caseStudy.name}
                </span>
                <span className="mt-4 block text-sm tracking-[0.22em] text-bone/52">
                  {caseStudy.phase}
                </span>
                <span className="mt-auto grid gap-5">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setZoomedImage(transformationImages.before);
                    }}
                    className="energy-card case-result-card case-result-card-before cursor-zoom-in text-left"
                  >
                    <Image
                      src={transformationImages.before.src}
                      alt={transformationImages.before.alt}
                      fill
                      unoptimized
                      className="object-contain object-center opacity-78"
                    />
                    <span className="text-xs tracking-[0.28em] text-bone/48">
                      {transformationImages.before.label}
                    </span>
                    <span className="mt-3 block h-px w-16 bg-bone/20" />
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setZoomedImage(transformationImages.after);
                    }}
                    className="energy-card case-result-card case-result-card-after cursor-zoom-in text-left"
                  >
                    <Image
                      src={transformationImages.after.src}
                      alt={transformationImages.after.alt}
                      fill
                      unoptimized
                      className="object-contain object-center opacity-82"
                    />
                    <span className="text-xs tracking-[0.28em] text-champagne/78">
                      {transformationImages.after.label}
                    </span>
                    <span className="mt-3 block h-px w-16 bg-champagne" />
                  </button>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Edit testimonial copy here. */}
        <div key={`${activeCase.name}-copy`} className="testimonial-copy">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-champagne">
            Transformation
          </p>
          <blockquote className="mt-7 font-display text-3xl leading-tight text-bone sm:text-5xl">
            “{activeCase.quote}”
          </blockquote>
          <div className="mt-8 flex items-center gap-5">
            <div className="h-px w-16 bg-champagne" />
            <p className="text-sm uppercase tracking-[0.28em] text-bone/58">
              {activeCase.name}
            </p>
          </div>
          <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3" aria-label="Transformation case studies">
              {caseStudies.map((caseStudy, index) => (
                <button
                  key={caseStudy.name}
                  type="button"
                  aria-label={`Show ${caseStudy.name} case study`}
                  aria-current={index === activeIndex}
                  onClick={() => setActiveIndex(index)}
                  className={`h-2.5 w-8 border border-champagne/50 transition ${
                    index === activeIndex ? "bg-champagne" : "bg-transparent"
                  }`}
                />
              ))}
            </div>
            <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:gap-4">
              <button
                type="button"
                onClick={showPreviousCase}
                className="min-h-11 border border-bone/18 px-4 text-xs font-semibold tracking-[0.16em] text-bone/70 transition hover:border-champagne hover:text-champagne sm:px-5 sm:tracking-[0.22em]"
              >
                Previous
              </button>
              <p className="text-xs tracking-[0.16em] text-bone/45 sm:tracking-[0.24em]">
                0{activeIndex + 1} / 0{caseStudies.length}
              </p>
              <button
                type="button"
                onClick={showNextCase}
                className="min-h-11 border border-champagne px-4 text-xs font-semibold tracking-[0.16em] text-champagne transition hover:bg-champagne hover:text-ink sm:px-5 sm:tracking-[0.22em]"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {zoomedImage ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4 py-6 backdrop-blur-sm sm:px-5 sm:py-8"
          role="dialog"
          aria-modal="true"
          aria-label={`${zoomedImage.label} transformation photo`}
          onClick={() => setZoomedImage(null)}
        >
          <div
            className="relative h-[78svh] w-full max-w-4xl border border-champagne/30 bg-ink shadow-[0_30px_120px_rgba(0,0,0,0.7)] sm:h-[82vh]"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Click a transformation photo to inspect it closer. Replace sample images in public/images. */}
            <Image
              src={zoomedImage.src}
              alt={zoomedImage.alt}
              fill
              unoptimized
              className="object-contain"
            />
            <div className="absolute left-3 top-3 border border-champagne/40 bg-black/60 px-3 py-2 text-xs uppercase tracking-[0.18em] text-champagne sm:left-5 sm:top-5 sm:px-4 sm:tracking-[0.28em]">
              {zoomedImage.label}
            </div>
            <button
              type="button"
              onClick={() => setZoomedImage(null)}
              className="absolute right-3 top-3 border border-bone/25 bg-black/70 px-3 py-2 text-xs uppercase tracking-[0.16em] text-bone transition hover:border-champagne hover:text-champagne sm:right-5 sm:top-5 sm:px-4 sm:tracking-[0.24em]"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
