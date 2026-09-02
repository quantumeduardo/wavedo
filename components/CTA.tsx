export function CTA() {
  return (
    <section id="contact" className="bg-ink px-6 py-24 text-bone sm:px-8 lg:py-32">
      <div className="mx-auto max-w-4xl border-t border-champagne/30 pt-16 text-center">
        {/* Edit closing CTA copy and button text here. */}
        <p className="text-xs font-semibold tracking-[0.34em] text-champagne">
          Private Intake
        </p>
        <h2 className="mx-auto mt-6 max-w-3xl font-display text-5xl leading-tight sm:text-6xl">
          Your next phase starts with structure.
        </h2>
        <a
          href="/apply"
          className="mt-10 inline-flex min-h-12 items-center justify-center border border-champagne px-9 text-sm font-semibold tracking-[0.2em] text-champagne transition hover:bg-champagne hover:text-ink"
        >
          Apply Now
        </a>
      </div>
    </section>
  );
}
