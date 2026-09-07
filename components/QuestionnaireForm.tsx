"use client";

import { FormEvent, useState } from "react";

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

const programOptions = [
  "Virtual Consultation",
  "Online Coaching",
  "Hybrid Coaching",
  "12-Week Strength & Body Recomposition",
  "Recommend the best fit",
];

const trainingExperienceOptions = [
  "New to structured training",
  "Returning after time away",
  "Consistent but plateaued",
  "Experienced and ready for precision",
];

const weeklyTrainingOptions = [
  "1-2 days",
  "3-4 days",
  "5+ days",
  "Not consistent yet",
];

const equipmentOptions = [
  "Full gym",
  "Home gym",
  "Dumbbells or bands",
  "Bodyweight only",
];

const blockerOptions = [
  "Consistency",
  "Too many random programs",
  "Schedule",
  "Nutrition confusion",
  "Low energy or recovery",
  "Pain or injury considerations",
];

const nutritionOptions = [
  "Simple meal structure",
  "Macro guidance",
  "Protein and habit support",
  "Energy and recovery support",
];

const sleepOptions = [
  "Strong",
  "Average",
  "Inconsistent",
  "Needs work",
];

const stressOptions = ["Low", "Moderate", "High", "Very high"];

function FieldSelect({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: string[];
}) {
  return (
    <label className="grid gap-3 text-xs font-semibold tracking-[0.2em] text-bone/72">
      {label}
      <select
        required
        name={name}
        defaultValue=""
        className="min-h-12 border border-bone/14 bg-graphite px-4 text-base tracking-normal text-bone outline-none transition focus:border-champagne"
      >
        <option value="" disabled>
          Select One
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function QuestionnaireForm() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [interestError, setInterestError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const topTrainingInterests = selectedInterests.join(", ");
    const fields = {
      goal: topTrainingInterests,
      topTrainingInterests,
      ...Object.fromEntries(formData.entries()),
    };

    try {
      const response = await fetch("/api/notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "questionnaire",
          subject: "New Wavēdo Coaching Questionnaire",
          fields,
        }),
      });
      const result = (await response.json()) as {
        delivered?: boolean;
        message?: string;
      };

      setNotice(
        result.delivered
          ? "Your questionnaire was sent."
          : result.message ?? "Your questionnaire was captured.",
      );
      setSubmitted(true);
    } catch {
      setNotice("The questionnaire could not be submitted. Please try again.");
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="border border-champagne/40 bg-graphite p-8 text-center shadow-gold">
        <p className="text-xs font-semibold tracking-[0.34em] text-champagne">
          Questionnaire Received
        </p>
        <h2 className="mt-5 font-display text-4xl leading-tight text-bone">
          Your answers are in.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-bone/64">
          {notice}
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-8 inline-flex min-h-12 items-center justify-center border border-champagne px-8 text-sm font-semibold tracking-[0.18em] text-champagne transition hover:bg-champagne hover:text-ink"
        >
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8">
      {/* Edit questionnaire choices and labels in the arrays above. */}
      <section className="border border-champagne/24 bg-graphite p-5 sm:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.28em] text-champagne">
              Step One
            </p>
            <h2 className="mt-2 font-display text-3xl leading-tight text-bone">
              Pick your top three training interests.
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
                className={`min-h-12 border px-4 text-left text-sm font-semibold tracking-[0.1em] transition ${
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

      <section className="grid gap-5 border border-bone/10 bg-graphite/72 p-5 sm:p-7">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-champagne">
            Coaching Fit
          </p>
          <h2 className="mt-2 font-display text-2xl leading-tight text-bone">
            Choose the structure that feels closest.
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <FieldSelect label="Preferred Program" name="program" options={programOptions} />
          <FieldSelect
            label="Training Experience"
            name="trainingExperience"
            options={trainingExperienceOptions}
          />
          <FieldSelect
            label="Current Weekly Training"
            name="weeklyTraining"
            options={weeklyTrainingOptions}
          />
          <FieldSelect label="Equipment Access" name="equipmentAccess" options={equipmentOptions} />
        </div>
      </section>

      <section className="grid gap-5 border border-bone/10 bg-graphite/72 p-5 sm:p-7">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-champagne">
            Baseline
          </p>
          <h2 className="mt-2 font-display text-2xl leading-tight text-bone">
            Give the quick read on what needs support.
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <FieldSelect label="Biggest Blocker" name="biggestBlocker" options={blockerOptions} />
          <FieldSelect
            label="Nutrition Priority"
            name="nutritionRecovery"
            options={nutritionOptions}
          />
          <FieldSelect label="Sleep Quality" name="sleepQuality" options={sleepOptions} />
          <FieldSelect label="Stress Level" name="stressLevel" options={stressOptions} />
        </div>
      </section>

      <section className="grid gap-5 border border-bone/10 bg-graphite/72 p-5 sm:p-7">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-champagne">
            Contact
          </p>
          <h2 className="mt-2 font-display text-2xl leading-tight text-bone">
            Where should Eduardo send next steps?
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-3 text-xs font-semibold tracking-[0.2em] text-bone/72">
            Full Name
            <input
              required
              name="name"
              type="text"
              className="min-h-12 border border-bone/14 bg-graphite px-4 text-base tracking-normal text-bone outline-none transition focus:border-champagne"
            />
          </label>
          <label className="grid gap-3 text-xs font-semibold tracking-[0.2em] text-bone/72">
            Email
            <input
              required
              name="email"
              type="email"
              className="min-h-12 border border-bone/14 bg-graphite px-4 text-base tracking-normal text-bone outline-none transition focus:border-champagne"
            />
          </label>
          <label className="grid gap-3 text-xs font-semibold tracking-[0.2em] text-bone/72">
            Phone
            <input
              name="phone"
              type="tel"
              className="min-h-12 border border-bone/14 bg-graphite px-4 text-base tracking-normal text-bone outline-none transition focus:border-champagne"
            />
          </label>
        </div>
        <label className="grid gap-3 text-xs font-semibold tracking-[0.2em] text-bone/72">
          Anything Else?
          <textarea
            name="notes"
            rows={4}
            className="border border-bone/14 bg-graphite px-4 py-3 text-base leading-7 tracking-normal text-bone outline-none transition focus:border-champagne"
            placeholder="Optional: timeline, injuries, schedule limits, or anything you want reviewed."
          />
        </label>
      </section>

      <button
        type="submit"
        disabled={isSubmitting}
        className="min-h-14 border border-champagne bg-champagne px-8 text-sm font-semibold tracking-[0.2em] text-ink transition hover:border-bone hover:bg-bone disabled:cursor-not-allowed disabled:opacity-60 md:w-fit"
      >
        {isSubmitting ? "Submitting..." : "Submit Questionnaire"}
      </button>
    </form>
  );
}
