export function Testimonial() {
  return (
    <section className="bg-ink px-6 py-24 text-white sm:px-8 lg:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.95fr_1fr] lg:items-center">
        {/* Replace these placeholders with real transformation images when available. */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex aspect-[4/5] items-end border border-white/12 bg-[linear-gradient(145deg,rgba(255,255,255,0.10),rgba(255,255,255,0.02))] p-6">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/48">Before</p>
              <div className="mt-4 h-px w-24 bg-champagne" />
            </div>
          </div>
          <div className="flex aspect-[4/5] items-end border border-champagne/40 bg-[linear-gradient(145deg,rgba(216,182,111,0.18),rgba(255,255,255,0.03))] p-6 shadow-gold">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/56">After</p>
              <div className="mt-4 h-px w-24 bg-champagne" />
            </div>
          </div>
        </div>

        {/* Edit testimonial copy here. */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-champagne">
            Transformation
          </p>
          <blockquote className="mt-7 font-display text-4xl leading-tight text-white sm:text-5xl">
            “Wavēdo gave me the structure I was missing. Training stopped feeling
            random, nutrition became simple, and my energy finally matched the
            work I was putting in.”
          </blockquote>
          <div className="mt-8 flex items-center gap-5">
            <div className="h-px w-16 bg-champagne" />
            <p className="text-sm uppercase tracking-[0.28em] text-white/58">
              Audrey
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
