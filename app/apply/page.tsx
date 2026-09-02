import Link from "next/link";
import { IntakeForm } from "@/components/IntakeForm";

export const metadata = {
  title: "Apply | Wavēdo Intake",
  description: "Submit your Wavēdo coaching evaluation intake.",
};

export default function ApplyPage() {
  return (
    <main className="min-h-screen bg-ink px-6 py-10 text-bone sm:px-8 lg:py-14">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between gap-6 border-b border-champagne/20 pb-8">
          <Link href="/" className="text-xl font-semibold tracking-[0.3em] text-bone">
            WAVĒDO
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold tracking-[0.24em] text-bone/60 transition hover:text-champagne"
          >
            Back Home
          </Link>
        </header>

        <section className="grid gap-12 py-16 lg:grid-cols-[0.72fr_1fr] lg:py-24">
          <div>
            <p className="text-xs font-semibold tracking-[0.34em] text-champagne">
              Coaching Evaluation
            </p>
            <h1 className="mt-6 font-display text-5xl leading-tight sm:text-6xl">
              Start with a precise intake.
            </h1>
            <p className="mt-7 text-base leading-8 text-bone/64">
              Share your goals, current routine, and what has been getting in
              the way. This creates the baseline for your Wavēdo coaching path.
            </p>
          </div>

          <IntakeForm />
        </section>
      </div>
    </main>
  );
}
