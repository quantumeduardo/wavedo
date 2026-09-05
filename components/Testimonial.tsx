// Testimonials published at https://dashboard.coachrx.app/c/16306/store.
const testimonials = [
  {
    name: "Audrey",
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
    paragraphs: [
      "When I made the decision to hire a personal trainer in August 2024, I thought I was looking for someone to give me a few new ideas to complement my exercise routine. What I actually received in Eduardo was a tremendously knowledgeable, positive, and supportive guide who would act as the springboard to my love for fitness.",
      "Eduardo listened and accepted me. He met me in my fear, helped me identify my individual goals, and pushed me to excel. He provided so much more than progressive exercise ideas.",
      "He taught me about my body’s nutritional needs, analyzed the data, corrected my performance, and adjusted my plans to help me progress toward my goals. Eduardo was patient, but kept me moving forward. He provided information and education in a way that made sense to me.",
    ],
  },
];

export function Testimonial() {
  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-heading"
      className="relative overflow-hidden bg-ink px-4 py-16 text-bone sm:px-8 sm:py-24 lg:py-32"
    >
      <div className="energy-flow-line energy-flow-line-one" aria-hidden="true" />
      <div className="energy-flow-line energy-flow-line-two" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-champagne sm:tracking-[0.34em]">
          Client Stories
        </p>
        <h2 id="testimonials-heading" className="mt-5 font-display text-3xl leading-tight sm:text-5xl">
          What clients are saying.
        </h2>
        <div className="mt-10 grid items-start gap-6 sm:mt-14 lg:grid-cols-2 lg:gap-8">
          {testimonials.map((testimonial) => (
            <figure key={testimonial.name} className="border border-champagne/20 bg-graphite p-6 sm:p-9">
              <span aria-hidden="true" className="block h-12 font-display text-7xl leading-none text-champagne">
                “
              </span>
              <blockquote cite="https://dashboard.coachrx.app/c/16306/store" className="mt-5 space-y-5 text-base leading-8 text-bone/80">
                {testimonial.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-4 border-t border-champagne/16 pt-6">
                <span aria-hidden="true" className="h-px w-10 bg-champagne" />
                <span className="text-sm font-semibold uppercase tracking-[0.24em] text-champagne">
                  {testimonial.name}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
