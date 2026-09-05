export function CTA() {
  return (
    <section id="contact" className="bg-ink px-4 py-16 text-bone sm:px-8 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-4xl border-t border-champagne/30 pt-12 text-center sm:pt-16">
        {/* Edit closing CTA copy and button text here. */}
        <p className="text-xs font-semibold tracking-[0.24em] text-champagne sm:tracking-[0.34em]">
          Private Intake
        </p>
        <h2 className="mx-auto mt-6 max-w-3xl font-display text-4xl leading-tight sm:text-6xl">
          Your next phase starts with structure.
        </h2>
        <a
          href="/apply"
          className="mt-8 inline-flex min-h-12 items-center justify-center border border-champagne px-8 text-sm font-semibold tracking-[0.16em] text-champagne transition hover:bg-champagne hover:text-ink sm:mt-10 sm:px-9 sm:tracking-[0.2em]"
        >
          Apply Now
        </a>
      </div>
    </section>
  );
}
