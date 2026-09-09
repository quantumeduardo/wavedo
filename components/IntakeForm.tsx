"use client";

import { FormEvent, useState } from "react";

const programOptions = [
  "Virtual Consultation",
  "Online Coaching",
  "Hybrid Coaching",
  "12-Week Strength & Body Recomposition",
];

const trainingInterestOptions = [
  "Strength",
  "Body Recomposition",
  "Fat Loss",
  "Muscle Gain",
  "Nutrition Structure",
  "Energy & Recovery",
  "Mobility",
  "Accountability",
  "Return From Injury",
];

const experienceOptions = [
  "New to structured training",
  "Returning after time away",
  "Consistent but plateaued",
  "Experienced and needs precision",
];

const nutritionOptions = [
  "Need simple structure",
  "Need macro guidance",
  "Eating well but inconsistent",
  "Need recovery and energy support",
];

const blockerOptions = [
  "Consistency",
  "Too many random programs",
  "Schedule",
  "Nutrition confusion",
  "Low energy or recovery",
  "Pain or injury considerations",
];

export function IntakeForm() {
  const [submitted, setSubmitted] = useState(false);
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [interestError, setInterestError] = useState("");

  function toggleInterest(interest: string) {
    setInterestError("");
    setSelectedInterests((current) => {
      if (current.includes(interest)) {
        return current.filter((item) => item !== interest);
      }

      if (current.length === 3) {
        return current;
      }

      return [...current, interest];
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (selectedInterests.length !== 3) {
      setInterestError("Choose your top three training interests.");
      return;
    }

    if (isSubmitting) return;
    setNotice("");
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const fields = {
      topTrainingInterests: selectedInterests.join(", "),
      ...Object.fromEntries(formData.entries()),
    };

    try {
      const response = await fetch("/api/notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "intake",
          subject: "New Wavēdo Intake Evaluation",
          fields,
        }),
      });
      const result = (await response.json()) as {
        delivered?: boolean;
        message?: string;
        setupRequired?: boolean;
        confirmationDelivered?: boolean;
      };

      if (!response.ok || result.delivered !== true) {
        setNotice(result.setupRequired
          ? "Submissions are temporarily unavailable. Your evaluation has not been sent. Your answers are still here; please try again later."
          : result.message ?? "Your evaluation could not be sent. Please try again.");
        return;
      }
      setNotice(result.confirmationDelivered
        ? "Your evaluation was sent to Eduardo, and a confirmation email is on its way. Check your spam folder if you don’t see it."
        : "Your evaluation was sent to Eduardo. We couldn’t send your confirmation email, but you don’t need to submit again.");
      setSubmitted(true);
    } catch {
      setNotice("We couldn’t confirm submission. Your answers are still here. Please check your connection before trying again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div role="status" tabIndex={-1} ref={(element) => element?.focus()} className="border border-champagne/40 bg-graphite p-8 text-center shadow-gold">
        <p className="text-xs font-semibold tracking-[0.34em] text-champagne">
          Intake Received
        </p>
        <h2 className="mt-5 font-display text-4xl leading-tight text-bone">
          Thank you for taking the first step.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-bone/64">
          {notice}
        </p>
        <a href="/" className="mt-8 inline-flex min-h-12 items-center justify-center border border-champagne px-8 text-sm font-semibold tracking-[0.2em] text-champagne transition hover:bg-champagne hover:text-ink">
          Back Home
        </a>
      </div>
    );
  }

  return (
    <form aria-busy={isSubmitting} onSubmit={handleSubmit} className="grid gap-8">
      {/* Edit intake fields and labels here. */}
      <section className="border border-champagne/24 bg-graphite p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.28em] text-champagne">
              First
            </p>
            <h2 className="mt-2 font-display text-2xl leading-tight text-bone">
              Choose your top three training interests.
            </h2>
          </div>
          <p className="text-xs font-semibold tracking-[0.18em] text-bone/54">
            {selectedInterests.length}/3 Selected
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {trainingInterestOptions.map((interest) => {
            const isSelected = selectedInterests.includes(interest);

            return (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                aria-pressed={isSelected}
                className={`min-h-12 border px-4 text-left text-sm font-semibold tracking-[0.12em] transition ${
                  isSelected
                    ? "border-champagne bg-champagne text-ink"
                    : "border-bone/14 bg-ink text-bone/72 hover:border-champagne hover:text-bone"
                }`}
              >
                {interest}
              </button>
            );
          })}
        </div>

        {interestError ? (
          <p className="mt-4 text-sm text-champagne">{interestError}</p>
        ) : null}
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-3 text-xs font-semibold tracking-[0.22em] text-bone/72">
          Preferred Program
          <select
            required
            name="program"
            defaultValue=""
            className="min-h-12 border border-bone/14 bg-graphite px-4 text-base tracking-normal text-bone outline-none transition focus:border-champagne"
          >
            <option value="" disabled>
              Select One
            </option>
            {programOptions.map((program) => (
              <option key={program} value={program}>
                {program}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-3 text-xs font-semibold tracking-[0.22em] text-bone/72">
          Training Experience
          <select
            required
            name="trainingExperience"
            defaultValue=""
            className="min-h-12 border border-bone/14 bg-graphite px-4 text-base tracking-normal text-bone outline-none transition focus:border-champagne"
          >
            <option value="" disabled>
              Select One
            </option>
            {experienceOptions.map((experience) => (
              <option key={experience} value={experience}>
                {experience}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-3 text-xs font-semibold tracking-[0.22em] text-bone/72">
          Nutrition & Recovery
          <select
            required
            name="nutritionRecovery"
            defaultValue=""
            className="min-h-12 border border-bone/14 bg-graphite px-4 text-base tracking-normal text-bone outline-none transition focus:border-champagne"
          >
            <option value="" disabled>
              Select One
            </option>
            {nutritionOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-3 text-xs font-semibold tracking-[0.22em] text-bone/72">
          Biggest Blocker
          <select
            required
            name="biggestBlocker"
            defaultValue=""
            className="min-h-12 border border-bone/14 bg-graphite px-4 text-base tracking-normal text-bone outline-none transition focus:border-champagne"
          >
            <option value="" disabled>
              Select One
            </option>
            {blockerOptions.map((blocker) => (
              <option key={blocker} value={blocker}>
                {blocker}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-3 text-xs font-semibold tracking-[0.22em] text-bone/72">
          Full Name
          <input
            required
            name="name"
            type="text"
            className="min-h-12 border border-bone/14 bg-graphite px-4 text-base tracking-normal text-bone outline-none transition focus:border-champagne"
          />
        </label>
        <label className="grid gap-3 text-xs font-semibold tracking-[0.22em] text-bone/72">
          Email
          <input
            required
            name="email"
            type="email"
            className="min-h-12 border border-bone/14 bg-graphite px-4 text-base tracking-normal text-bone outline-none transition focus:border-champagne"
          />
        </label>
        <label className="grid gap-3 text-xs font-semibold tracking-[0.22em] text-bone/72">
          Phone
          <input
            name="phone"
            type="tel"
            className="min-h-12 border border-bone/14 bg-graphite px-4 text-base tracking-normal text-bone outline-none transition focus:border-champagne"
          />
        </label>
      </div>

      <label className="grid gap-3 text-xs font-semibold tracking-[0.22em] text-bone/72">
        Anything Eduardo Should Know?
        <textarea
          name="notes"
          rows={4}
          className="border border-bone/14 bg-graphite px-4 py-3 text-base leading-7 tracking-normal text-bone outline-none transition focus:border-champagne"
          placeholder="Optional: injury considerations, schedule limits, timeline, or anything personal to your goals."
        />
      </label>

      {notice ? <p role="alert" className="border border-champagne/40 bg-graphite p-5 text-sm leading-7 text-bone">{notice}</p> : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="min-h-14 border border-champagne bg-champagne px-8 text-sm font-semibold tracking-[0.22em] text-ink transition hover:border-bone hover:bg-bone md:w-fit"
      >
        {isSubmitting ? "Submitting..." : "Submit Evaluation"}
      </button>
    </form>
  );
}
