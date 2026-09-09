import Link from "next/link";
import { QuestionnaireForm } from "@/components/QuestionnaireForm";

export const metadata = {
  title: "Questionnaire | Wavēdo Coaching",
  description: "Complete the Wavēdo coaching questionnaire.",
};

export default function QuestionnairePage() {
  return (
    <main className="min-h-screen bg-ink px-6 py-10 text-bone sm:px-8 lg:py-14">
      <div className="mx-auto max-w-6xl">
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

        <section className="grid gap-12 py-12 lg:grid-cols-[0.4fr_1fr] lg:py-20">
          <aside className="lg:sticky lg:top-10 lg:self-start">
            {/* Edit questionnaire page intro copy here. */}
            <p className="text-xs font-semibold tracking-[0.34em] text-champagne">
              Coaching Questionnaire
            </p>
            <h1 className="mt-6 font-display text-5xl leading-tight sm:text-6xl">
              A little about you.
            </h1>
            <p className="mt-7 text-base leading-8 text-bone/64">
              Your goals. Your everyday rhythm. How you feel right now.
              A few quick choices help Eduardo shape your next step.
            </p>


          </aside>

          <QuestionnaireForm />
        </section>
      </div>
    </main>
  );
}
