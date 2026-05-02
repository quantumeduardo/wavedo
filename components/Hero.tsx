import Image from "next/image";

const navLinks = ["Programs", "About", "Contact"];

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-ink">
      <Image
        src="/images/wavedo-hero-inclusive.png"
        alt="Woman and man represented as luminous aura bodies in a luxury wellness studio"
        fill
        priority
        unoptimized
        className="object-cover object-center opacity-72"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#050505_0%,rgba(5,5,5,0.86)_34%,rgba(5,5,5,0.32)_67%,rgba(5,5,5,0.72)_100%)]" />
      <div className="wave-line absolute inset-x-0 top-0 h-40 opacity-40" />

      {/* Edit the navigation labels and section anchors here. */}
      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-7 sm:px-8">
        <a href="#" className="text-xl font-semibold tracking-[0.32em] text-white">
          WAVĒDO
        </a>
        <nav className="hidden items-center gap-8 text-xs font-medium uppercase tracking-[0.28em] text-white/68 md:flex">
          {navLinks.map((link) => (
            <a key={link} href={`#${link.toLowerCase()}`} className="transition hover:text-champagne">
              {link}
            </a>
          ))}
        </nav>
      </header>

      {/* Edit hero headline, subheadline, and primary CTAs here. */}
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-96px)] w-full max-w-7xl items-center px-6 pb-20 pt-10 sm:px-8 lg:pb-28">
        <div className="max-w-3xl">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.42em] text-champagne">
            Luxury Fitness Coaching
          </p>
          <h1 className="font-display text-6xl leading-[0.92] text-white sm:text-7xl lg:text-8xl">
            Harness the Wave Within
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-white/76 sm:text-xl">
            A holistic coaching system built around strength, nutrition, energy
            flow, and renewal.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href="#programs"
              className="inline-flex min-h-12 items-center justify-center border border-champagne bg-champagne px-7 text-sm font-semibold uppercase tracking-[0.18em] text-ink transition hover:bg-white hover:border-white"
            >
              Start Your Program
            </a>
            <a
              href="#contact"
              className="inline-flex min-h-12 items-center justify-center border border-white/28 px-7 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:border-champagne hover:text-champagne"
            >
              Book a Virtual Consultation
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
