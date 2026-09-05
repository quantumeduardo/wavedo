"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// Testimonials and images from https://dashboard.coachrx.app/c/16306/store.
const testimonials = [
  {
    name: "Audrey",
    phase: "Strength & Renewal",
    image: "/images/testimonials/audrey.webp",
    quote: "Eduardo didn’t just help me lose weight—he helped me completely transform my health, mindset, and lifestyle.",
    paragraphs: [
      "At 33, I weighed 296 lbs and struggled with high blood pressure, sciatica, a weak knee, and years of failed dieting. I was intimidated by the gym and didn’t know where to start.",
      "Working with Eduardo changed everything. He created a personalized plan, guided my nutrition, and focused on strength training while helping rehab my knee and eliminate my sciatica pain. He kept me accountable, motivated, and confident every step of the way.",
      "Not only did I transform physically, but I also gained confidence in the gym and even learned how to swim—overcoming a lifelong fear.",
      "Today, I’m 187 lbs, down from 48% to 27% body fat, with 75 lbs of muscle. My blood pressure and heart rate are normal, I’m off medication, pain-free, and stronger than ever.",
      "Eduardo didn’t just help me lose weight—he helped me completely transform my health, mindset, and lifestyle. I highly recommend him to anyone looking to lose fat, build muscle, recover from injuries, or simply learn how to train the right way.",
    ],
  },
  {
    name: "Amy",
    phase: "Strength & Confidence",
    image: "/images/testimonials/amy.webp",
    quote: "Eduardo listened and accepted me. He met me in my fear, helped me identify my individual goals, and pushed me to excel.",
    paragraphs: [
      "When I made the decision to hire a personal trainer in August 2024, I thought I was looking for someone to give me a few new ideas to complement my exercise routine. What I actually received in Eduardo was a tremendously knowledgeable, positive, and supportive guide who would act as the springboard to my love for fitness.",
      "Eduardo listened and accepted me. He met me in my fear, helped me identify my individual goals, and pushed me to excel. He provided so much more than progressive exercise ideas.",
      "He taught me about my body’s nutritional needs, analyzed the data, corrected my performance, and adjusted my plans to help me progress toward my goals. Eduardo was patient, but kept me moving forward. He provided information and education in a way that made sense to me.",
    ],
  },
];

export function Testimonial() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [paused, setPaused] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const activeCase = testimonials[activeIndex];
  const angle = 360 / testimonials.length;

  function showCase(direction: number) {
    setActiveIndex((index) => (index + direction + testimonials.length) % testimonials.length);
    setRotation((value) => value + direction);
    setExpanded(false);
  }

  useEffect(() => {
    if (paused || expanded || zoomed || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % testimonials.length);
      setRotation((value) => value + 1);
    }, 10000);
    return () => window.clearInterval(timer);
  }, [paused, expanded, zoomed]);

  return (
    <section id="testimonials" aria-label="Client transformations" className="energy-flow-section relative overflow-hidden bg-ink px-4 py-16 text-bone sm:px-8 sm:py-24 lg:py-32">
      <div className="energy-flow-line energy-flow-line-one" aria-hidden="true" />
      <div className="energy-flow-line energy-flow-line-two" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.95fr_1fr] lg:items-center">
        <div className="testimonial-slide case-cylinder-scene" aria-label="Transformation photos">
          <div className="case-cylinder" style={{ transform: `rotateY(${-rotation * angle}deg)` }}>
            {testimonials.map((caseStudy, index) => (
              <div key={caseStudy.name} aria-hidden={index !== activeIndex}
                className={`case-cylinder-panel ${index === activeIndex ? "case-cylinder-panel-active" : ""}`}
                style={{ transform: `rotateY(${index * angle}deg) translateZ(var(--case-cylinder-radius))` }}>
                <span className="text-xs tracking-[0.32em] text-champagne">Case 0{index + 1}</span>
                <span className="mt-6 block font-display text-3xl leading-tight text-bone sm:mt-8 sm:text-4xl">{caseStudy.name}</span>
                <span className="mt-4 block text-sm tracking-[0.22em] text-bone/52">{caseStudy.phase}</span>
                <button type="button" tabIndex={index === activeIndex ? 0 : -1}
                  aria-label={`Enlarge ${caseStudy.name} before and after photo`}
                  onClick={() => { setZoomed(true); dialogRef.current?.showModal(); }}
                  className="energy-card case-result-card case-result-card-after relative mt-8 aspect-square w-full cursor-zoom-in !p-0">
                  <Image src={caseStudy.image} alt={`${caseStudy.name} before and after transformation, as published on CoachRx`} fill sizes="(max-width: 640px) 280px, 300px" className="object-contain" />
                </button>
                <span className="mt-4 text-xs uppercase tracking-[0.22em] text-bone/48">Click to enlarge</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div key={activeCase.name} className="testimonial-copy">
            <h2 className="text-xs font-semibold uppercase tracking-[0.34em] text-champagne">Transformation</h2>
            <blockquote cite="https://dashboard.coachrx.app/c/16306/store" className="mt-7 font-display text-3xl leading-tight text-bone sm:text-5xl">“{activeCase.quote}”</blockquote>
            <div className="mt-8 flex items-center gap-5">
              <div className="h-px w-16 bg-champagne" />
              <p className="text-sm uppercase tracking-[0.28em] text-bone/58">{activeCase.name}</p>
            </div>
          </div>
          <button type="button" aria-expanded={expanded} aria-controls="full-testimonial" onClick={() => setExpanded(!expanded)} className="mt-6 min-h-11 text-xs font-semibold uppercase tracking-[0.2em] text-champagne underline underline-offset-4">
            {expanded ? "Close full story" : "Read full story"}
          </button>
          <div id="full-testimonial" hidden={!expanded} className="mt-4 space-y-5 text-base leading-8 text-bone/80">
            {activeCase.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3" aria-label="Choose client story">
              {testimonials.map((caseStudy, index) => (
                <button key={caseStudy.name} type="button" aria-label={`Show ${caseStudy.name} case study`} aria-current={index === activeIndex}
                  onClick={() => { setPaused(true); showCase(index - activeIndex); }}
                  className="flex min-h-11 items-center">
                  <span className={`block h-2.5 w-8 border border-champagne/50 transition ${index === activeIndex ? "bg-champagne" : "bg-transparent"}`} />
                </button>
              ))}
            </div>
            <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:gap-4">
              <button type="button" onClick={() => { setPaused(true); showCase(-1); }} className="min-h-11 border border-bone/18 px-4 text-xs font-semibold tracking-[0.16em] text-bone/70 transition hover:border-champagne hover:text-champagne sm:px-5 sm:tracking-[0.22em]">Previous</button>
              <p className="text-xs tracking-[0.16em] text-bone/45 sm:tracking-[0.24em]">0{activeIndex + 1} / 0{testimonials.length}</p>
              <button type="button" onClick={() => { setPaused(true); showCase(1); }} className="min-h-11 border border-champagne px-4 text-xs font-semibold tracking-[0.16em] text-champagne transition hover:bg-champagne hover:text-ink sm:px-5 sm:tracking-[0.22em]">Next</button>
            </div>
          </div>
          <button type="button" aria-pressed={paused} onClick={() => setPaused(!paused)} className="mt-3 min-h-11 text-xs uppercase tracking-[0.16em] text-bone/58 hover:text-champagne">{paused ? "Play slideshow" : "Pause slideshow"}</button>
        </div>
      </div>
      <dialog ref={dialogRef} onClose={() => setZoomed(false)} onClick={(event) => { if (event.target === event.currentTarget) dialogRef.current?.close(); }} aria-label={`${activeCase.name} transformation photo`} className="fixed inset-0 m-auto h-[82svh] max-h-none w-[calc(100%_-_2rem)] max-w-4xl border border-champagne/30 bg-ink p-0 text-bone backdrop:bg-black/90 backdrop:backdrop-blur-sm">
        {zoomed && <Image src={activeCase.image} alt={`${activeCase.name} before and after transformation`} fill sizes="(max-width: 896px) 100vw, 896px" className="object-contain" />}
        <button autoFocus type="button" onClick={() => dialogRef.current?.close()} className="absolute right-3 top-3 border border-bone/25 bg-black/70 px-3 py-2 text-xs uppercase tracking-[0.16em] text-bone hover:border-champagne hover:text-champagne sm:right-5 sm:top-5 sm:px-4">Close</button>
      </dialog>
    </section>
  );
}
