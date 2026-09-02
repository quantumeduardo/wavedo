const programs = [
  {
    title: "Virtual Consultation",
    description:
      "A precise strategy session to assess your goals, training history, nutrition patterns, and next best phase.",
  },
  {
    title: "Online Coaching",
    description:
      "Remote programming, nutrition guidance, progress reviews, and accountability designed around your schedule.",
  },
  {
    title: "Hybrid Coaching",
    description:
      "A high-touch blend of virtual planning and in-person coaching for clients who want deeper technical refinement.",
  },
  {
    title: "12-Week Strength & Body Recomposition",
    description:
      "A focused phase for building lean strength, reshaping habits, and tightening the weekly structure that drives visible change.",
  },
];

export function Programs() {
  return (
    <section id="programs" className="bg-ink px-6 py-24 text-bone sm:px-8 lg:py-32">
      <div className="mx-auto max-w-7xl">
        {/* Edit program section heading and intro copy here. */}
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-champagne">
              Programs
            </p>
            <h2 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
              Built for structure, not guesswork.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-8 text-bone/64 lg:ml-auto">
            Choose the coaching path that matches your current season, then move
            through clear training, nutrition, recovery, and accountability rhythms.
          </p>
        </div>

        {/* Edit program card titles and descriptions in the programs array above. */}
        <div className="mt-14 grid gap-px overflow-hidden border border-champagne/22 bg-champagne/22 md:grid-cols-2 xl:grid-cols-4">
          {programs.map((program, index) => (
            <article
              key={program.title}
              className="group min-h-80 bg-graphite p-7 transition hover:bg-[#111111] hover:shadow-gold"
            >
              <div className="flex h-full flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[0.32em] text-champagne">
                    0{index + 1}
                  </span>
                  <h3 className="mt-8 text-2xl font-medium leading-tight">
                    {program.title}
                  </h3>
                  <p className="mt-5 text-sm leading-7 text-bone/58 transition group-hover:text-bone/78">
                    {program.description}
                  </p>
                </div>
                <a
                  href="#contact"
                  className="mt-10 inline-flex text-xs font-semibold uppercase tracking-[0.25em] text-champagne transition group-hover:text-bone"
                >
                  Explore
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
