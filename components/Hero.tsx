import Image from "next/image";

const navLinks = [
  { label: "Programs", href: "#programs" },
  { label: "Shop", href: "#shop" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-ink">
      <Image
        src="/images/wavedo-hero-transparent.png"
        alt="Woman and man represented as luminous aura bodies in a luxury wellness studio"
        fill
        priority
        unoptimized
        className="animate-hero-drift object-contain object-right-bottom opacity-72"
      />

      {/* Edit the navigation labels and section anchors here. */}
      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-6 sm:px-8 sm:py-7">
        <a href="#" className="text-lg font-semibold tracking-[0.24em] text-white sm:text-xl sm:tracking-[0.32em]">
          WAVĒDO
        </a>
        <nav className="hidden items-center gap-8 text-xs font-medium uppercase tracking-[0.28em] text-white/68 md:flex">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="transition hover:text-champagne">
              {link.label}
            </a>
          ))}
        </nav>
      </header>

      {/* Edit hero headline, subheadline, and primary CTAs here. */}
      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-88px)] w-full max-w-7xl items-center px-4 pb-16 pt-8 sm:min-h-[calc(100vh-96px)] sm:px-8 lg:pb-28">
        <div className="max-w-3xl">
          <h1 className="font-display text-5xl leading-[0.96] text-white sm:text-7xl lg:text-8xl">
            Harness the Wave Within
          </h1>
          <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:gap-4">
            <a
              href="#programs"
              className="inline-flex min-h-12 items-center justify-center border border-champagne bg-champagne px-5 text-center text-xs font-semibold uppercase tracking-[0.14em] text-ink transition hover:border-white hover:bg-white sm:px-7 sm:text-sm sm:tracking-[0.18em]"
            >
              Start Your Program
            </a>
            <a
              href="#contact"
              className="inline-flex min-h-12 items-center justify-center border border-white/28 px-5 text-center text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:border-champagne hover:text-champagne sm:px-7 sm:text-sm sm:tracking-[0.18em]"
            >
              Book a Virtual Consultation
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
