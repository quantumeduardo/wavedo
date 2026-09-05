import { CTA } from "@/components/CTA";
import { Hero } from "@/components/Hero";
import { Programs } from "@/components/Programs";
import { Shop } from "@/components/Shop";
import { Testimonial } from "@/components/Testimonial";

export default function Home() {
  return (
    <main>
      <Hero />

      {/* Edit the problem section copy here. */}
      <section id="about" className="bg-ink px-4 py-16 text-bone sm:px-8 sm:py-24 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-champagne sm:tracking-[0.34em]">
              The Pattern
            </p>
            <h2 className="mt-5 font-display text-3xl leading-tight sm:text-5xl">
              Effort is not the issue. Direction is.
            </h2>
          </div>
          <div className="space-y-6 text-base leading-8 text-bone/68 sm:text-lg sm:leading-9">
            <p>
              You have tried gyms, diets, apps, random programs, and short bursts
              of motivation. The cycle starts strong, then life gets loud,
              consistency fades, and the plan becomes one more thing to manage.
            </p>
            <p>
              Wavēdo is for people who are tired of feeling inconsistent,
              overwhelmed, or stuck despite putting in real effort.
            </p>
          </div>
        </div>
      </section>

      {/* Edit the solution pillars and supporting copy here. */}
      <section className="bg-ink px-4 py-16 text-bone sm:px-8 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-champagne sm:tracking-[0.34em]">
              The Wavēdo System
            </p>
            <h2 className="mt-5 font-display text-3xl leading-tight sm:text-5xl">
              A structured coaching system for strength, nourishment, recovery,
              and accountability.
            </h2>
          </div>
          <div className="mt-10 grid gap-px overflow-hidden border border-champagne/18 bg-champagne/18 sm:mt-14 md:grid-cols-4">
            {["Intelligent Training", "Nutrition Guidance", "Recovery", "Accountability"].map(
              (pillar) => (
                <div key={pillar} className="min-h-44 bg-graphite p-6 sm:min-h-52 sm:p-7">
                  <div className="mb-8 h-px w-14 bg-champagne" />
                  <h3 className="text-xl font-medium">{pillar}</h3>
                  <p className="mt-4 text-sm leading-7 text-bone/58">
                    Clear weekly actions that remove guesswork and keep your next
                    phase measurable.
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      <Programs />
      <Testimonial />
      <Shop compact />
      <CTA />

      {/* Edit footer links and brand line here. */}
      <footer className="bg-ink px-4 py-10 text-bone sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 border-t border-champagne/16 pt-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-semibold tracking-[0.24em] sm:tracking-[0.3em]">WAVĒDO</p>
            <p className="mt-2 text-sm text-bone/50">Harness the Wave Within</p>
          </div>
          <nav className="flex flex-wrap gap-x-5 gap-y-3 text-xs font-semibold uppercase tracking-[0.16em] text-bone/54 sm:gap-6 sm:tracking-[0.24em]">
            <a href="#programs" className="transition hover:text-champagne">Programs</a>
            <a href="#shop" className="transition hover:text-champagne">Shop</a>
            <a href="#about" className="transition hover:text-champagne">About</a>
            <a href="#contact" className="transition hover:text-champagne">Contact</a>
          </nav>
        </div>
      </footer>
    </main>
  );
}
