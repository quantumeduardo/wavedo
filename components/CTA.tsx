export function CTA() {
  return (
    <section id="contact" className="relative overflow-hidden bg-bone px-6 py-24 text-ink sm:px-8 lg:py-32">
      <div className="wave-line absolute inset-0 opacity-35" />
      <div className="relative mx-auto max-w-5xl text-center">
        {/* Edit closing CTA copy and button text here. */}
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-neutral-500">
          Begin the next phase
        </p>
        <h2 className="mt-5 font-display text-5xl leading-tight sm:text-6xl">
          Your next phase starts with structure.
        </h2>
        <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-neutral-600">
          Apply for a coaching path built around your training, nutrition,
          recovery, and accountability needs.
        </p>
        <a
          href="mailto:hello@wavedo.com"
          className="mt-10 inline-flex min-h-12 items-center justify-center bg-ink px-9 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-champagne hover:text-ink"
        >
          Apply Now
        </a>
      </div>
    </section>
  );
}
