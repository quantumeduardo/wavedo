"use client";

import { createContext, FormEvent, useContext, useRef, useState } from "react";

const ValidationContext = createContext<Record<string, string>>({});
function FieldError({ name }: { name: string }) {
  const errors = useContext(ValidationContext);
  return errors[name] ? <p id={`${name}-error`} className="mt-2 text-sm text-champagne">{errors[name]}</p> : null;
}

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

function Rating({ label, name, low, high }: { label: string; name: string; low: string; high: string }) {
  const errors = useContext(ValidationContext);
  return (
    <fieldset className="min-w-0">
      <legend className="mb-4 text-base text-bone">{label}</legend>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
        {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
          <label key={value} className="relative cursor-pointer">
            <input required type="radio" name={name} value={`${value}/10 (1 = ${low}; 10 = ${high})`} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `${name}-error` : undefined} aria-label={`${value} out of 10`} className="peer sr-only" />
            <span className="flex min-h-12 items-center justify-center rounded-xl border border-bone/15 text-sm text-bone/70 transition hover:border-champagne peer-checked:border-champagne peer-checked:bg-champagne peer-checked:text-ink peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-champagne">{value}</span>
          </label>
        ))}
      </div>
      <div className="mt-3 flex justify-between gap-6 text-xs leading-5 text-bone/55">
        <span>1 · {low}</span><span className="text-right">10 · {high}</span>
      </div>
      <FieldError name={name} />
    </fieldset>
  );
}

function FieldSelect({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: string[];
}) {
  const errors = useContext(ValidationContext);
  return (
    <label className="grid gap-3 text-sm text-bone/70">
      {label}
      <select
        required
        name={name}
        aria-invalid={!!errors[name]}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
        defaultValue=""
        className="min-h-12 rounded-xl border border-bone/14 bg-graphite px-4 text-base tracking-normal text-bone outline-none transition focus:border-champagne"
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
      <FieldError name={name} />
    </label>
  );
}

export function QuestionnaireForm() {
  const cardsRef = useRef<HTMLDivElement>(null);
  const [activeCard, setActiveCard] = useState(0);
  const cardNames = ["Your direction", "Your rhythm", "How you feel", "Stay connected"];

  function goToCard(index: number) {
    const container = cardsRef.current;
    const card = container?.children[index] as HTMLElement | undefined;
    if (!container || !card) return;
    container.scrollTo({ left: container.scrollLeft + card.getBoundingClientRect().left - container.getBoundingClientRect().left, behavior: "instant" });
    setActiveCard(index);
    card.focus({ preventScroll: true });
  }

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [interestError, setInterestError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validateThrough(lastCard: number) {
    const nextErrors: Record<string, string> = {};
    let firstInvalid: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | undefined;
    let firstCard = -1;
    if (selectedInterests.length !== 3) {
      nextErrors.interests = "Choose exactly three training interests.";
      firstCard = 0;
    }
    for (let index = 1; index <= lastCard; index++) {
      const card = cardsRef.current?.children[index];
      card?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input[required], select[required], textarea[required]").forEach((field) => {
        const missing = field.type !== "radio" && !field.value.trim();
        if (!field.validity.valid || missing) {
          nextErrors[field.name] = field.type === "radio" ? "Choose a rating from 1 to 10." : field.name === "email" ? "Enter a valid email address." : field.name === "name" ? "Enter your full name." : "Choose an option.";
          if (firstCard === -1) { firstCard = index; firstInvalid = field; }
        }
      });
    }
    setErrors(nextErrors);
    setInterestError(nextErrors.interests ?? "");
    if (firstCard !== -1) {
      goToCard(firstCard);
      firstInvalid?.focus({ preventScroll: true });
      firstInvalid?.closest("fieldset, label")?.scrollIntoView({ block: "nearest", inline: "nearest" });
      return false;
    }
    return true;
  }

  function navigate(index: number) {
    if (index <= activeCard || validateThrough(index - 1)) goToCard(index);
  }

  function toggleInterest(interest: string) {
    setInterestError("");
    setErrors((current) => { const updated = { ...current }; delete updated.interests; return updated; });
    const next = selectedInterests.includes(interest)
      ? selectedInterests.filter((item) => item !== interest)
      : selectedInterests.length < 3 ? [...selectedInterests, interest] : selectedInterests;
    setSelectedInterests(next);
    if (selectedInterests.length < 3 && next.length === 3) goToCard(1);
  }

  function advanceCompletedCard(event: FormEvent<HTMLFormElement>) {
    const field = event.target as HTMLInputElement | HTMLSelectElement;
    if (field.validity?.valid && field.value.trim()) {
      setErrors((current) => { const updated = { ...current }; delete updated[field.name]; return updated; });
    }
    const card = field.closest<HTMLElement>("[data-card]");
    const index = Number(card?.dataset.card);
    if (!card || index < 1 || index > 2 || index !== activeCard) return;
    const fields = Array.from(card.querySelectorAll<HTMLInputElement | HTMLSelectElement>("input[required], select[required]"));
    if (fields.length && fields.every((field) => field.validity.valid)) navigate(index + 1);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateThrough(3)) return;
    if (isSubmitting) return;
    setNotice("");
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
        setupRequired?: boolean;
        confirmationDelivered?: boolean;
      };

      if (!response.ok || result.delivered !== true) {
        setNotice(result.setupRequired
          ? "Submissions are temporarily unavailable. Your questionnaire has not been sent. Your answers are still here; please try again later."
          : result.message ?? "Your questionnaire could not be sent. Please try again.");
        return;
      }
      setNotice(result.confirmationDelivered
        ? "Your questionnaire was sent to Eduardo, and a confirmation email is on its way. Check your spam folder if you don’t see it."
        : "Your questionnaire was sent to Eduardo. We couldn’t send your confirmation email, but you don’t need to submit again.");
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
          Questionnaire Received
        </p>
        <h2 className="mt-5 font-display text-4xl leading-tight text-bone">
          Your answers are in.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-bone/64">
          {notice}
        </p>
      </div>
    );
  }

  return (
    <ValidationContext.Provider value={errors}>
    <form noValidate aria-busy={isSubmitting} onSubmit={handleSubmit} onChange={advanceCompletedCard} className="min-w-0 space-y-5">
      <nav aria-label="Questionnaire sections" className="flex items-center gap-2">
        {cardNames.map((name, index) => (
          <button key={name} type="button" aria-label={`Section ${index + 1}: ${name}`} aria-current={activeCard === index ? "step" : undefined} onClick={() => navigate(index)} className="flex min-h-11 flex-1 items-center py-3 focus-visible:outline focus-visible:outline-champagne">
            <span className={`h-1 w-full rounded-full transition-colors ${activeCard === index ? "bg-champagne" : "bg-bone/15"}`} />
          </button>
        ))}
      </nav>
      <p aria-live="polite" className="text-sm text-bone/60">{activeCard + 1} of 4 · {cardNames[activeCard]} <span className="float-right text-xs">Complete choices or use Next</span></p>
      {Object.keys(errors).length > 0 ? <p role="alert" className="rounded-xl border border-champagne/40 p-4 text-sm text-champagne">Please complete the highlighted answers before continuing.</p> : null}
      <div ref={cardsRef} onScroll={(event) => {
        const container = event.currentTarget;
        const first = container.children[0] as HTMLElement;
        if (first) setActiveCard(Math.max(0, Math.min(3, Math.round(container.scrollLeft / (first.offsetWidth + 16)))));
      }} className="relative flex snap-x snap-mandatory items-start gap-4 overflow-x-auto rounded-3xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

      <section data-card="0" tabIndex={-1} aria-label="Your direction" className="max-h-[65svh] w-full min-w-0 shrink-0 snap-start overflow-y-auto overscroll-y-contain rounded-3xl border border-bone/10 bg-graphite p-5 outline-none sm:p-8 ">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.28em] text-champagne">
              01 / Your direction
            </p>
            <h2 className="mt-2 font-display text-3xl leading-tight text-bone">
              What would you like to work on?
            </h2>
          </div>
          <p className="text-xs font-semibold tracking-[0.18em] text-bone/54">
            {selectedInterests.length}/3 chosen
          </p>
        </div>

        <p className="mt-3 text-sm text-bone/55">Choose three priorities to continue automatically. You can go back to edit.</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {trainingInterestOptions.map((interest) => {
            const isSelected = selectedInterests.includes(interest);

            return (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                aria-pressed={isSelected}
                className={`min-h-12 rounded-full border px-5 text-left text-sm transition ${
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

      <section data-card="1" tabIndex={-1} aria-label="Your rhythm" className="max-h-[65svh] w-full min-w-0 shrink-0 snap-start overflow-y-auto overscroll-y-contain rounded-3xl border border-bone/10 bg-graphite p-5 outline-none sm:p-8 grid gap-7">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-champagne">
            02 / Your rhythm
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

      <section data-card="2" tabIndex={-1} aria-label="How you feel" className="max-h-[65svh] w-full min-w-0 shrink-0 snap-start overflow-y-auto overscroll-y-contain rounded-3xl border border-bone/10 bg-graphite p-5 outline-none sm:p-8 grid gap-7">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-champagne">
            03 / How you feel
          </p>
          <h2 className="mt-2 font-display text-2xl leading-tight text-bone">
            A quick check-in with yourself.
          </h2>
          <p className="mt-3 text-sm leading-6 text-bone/55">Think about the past two weeks. Tap a number for each question.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <FieldSelect label="Biggest Blocker" name="biggestBlocker" options={blockerOptions} />
          <FieldSelect
            label="Nutrition Priority"
            name="nutritionRecovery"
            options={nutritionOptions}
          />

        </div>
        <div className="mt-3 grid gap-9">
          <Rating label="How consistent has your training felt?" name="trainingConsistency" low="Not consistent" high="Very consistent" />
          <Rating label="How supported do you feel by your eating habits?" name="nutritionConfidence" low="Need a lot of support" high="Feel confident" />
          <Rating label="How restorative has your sleep been?" name="sleepQuality" low="Not restorative" high="Fully rested" />
          <Rating label="How much stress are you carrying?" name="stressLevel" low="Very little" high="Overwhelming" />
        </div>
      </section>

      <section data-card="3" tabIndex={-1} aria-label="Stay connected" className="max-h-[65svh] w-full min-w-0 shrink-0 snap-start overflow-y-auto overscroll-y-contain rounded-3xl border border-bone/10 bg-graphite p-5 outline-none sm:p-8 grid gap-7">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-champagne">
            04 / Stay connected
          </p>
          <h2 className="mt-2 font-display text-2xl leading-tight text-bone">
            Where should Eduardo send next steps?
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-3 text-sm text-bone/70">
            Full Name
            <input
              required
              name="name"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
              type="text"
              className="min-h-12 rounded-xl border border-bone/14 bg-graphite px-4 text-base tracking-normal text-bone outline-none transition focus:border-champagne"
            />
            <FieldError name="name" />
          </label>
          <label className="grid gap-3 text-sm text-bone/70">
            Email
            <input
              required
              name="email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              type="email"
              className="min-h-12 rounded-xl border border-bone/14 bg-graphite px-4 text-base tracking-normal text-bone outline-none transition focus:border-champagne"
            />
            <FieldError name="email" />
          </label>
          <label className="grid gap-3 text-sm text-bone/70">
            Phone
            <input
              name="phone"
              type="tel"
              className="min-h-12 rounded-xl border border-bone/14 bg-graphite px-4 text-base tracking-normal text-bone outline-none transition focus:border-champagne"
            />
          </label>
        </div>
        <label className="grid gap-3 text-sm text-bone/70">
          Anything Else?
          <textarea
            name="notes"
            rows={4}
            className="rounded-xl border border-bone/14 bg-graphite px-4 py-3 text-base leading-7 tracking-normal text-bone outline-none transition focus:border-champagne"
            placeholder="Optional: timeline, injuries, schedule limits, or anything you want reviewed."
          />
        </label>
      </section>

      </div>
      <div className="flex items-center justify-between gap-4">
        <button type="button" disabled={activeCard === 0 || isSubmitting} onClick={() => goToCard(activeCard - 1)} className="min-h-12 rounded-full border border-bone/20 px-6 text-sm text-bone disabled:opacity-30">Back</button>
        {activeCard < 3 ? (
          <button type="button" onClick={() => navigate(activeCard + 1)} className="min-h-12 rounded-full bg-champagne px-8 text-sm font-semibold text-ink">Next →</button>
        ) : (
          <button type="submit" disabled={isSubmitting} className="min-h-12 rounded-full bg-champagne px-6 text-sm font-semibold text-ink disabled:opacity-50">{isSubmitting ? "Submitting…" : "Submit Questionnaire"}</button>
        )}
      </div>
      {notice ? (
        <div role="alert" className="border border-champagne/40 bg-graphite p-5 text-sm leading-7 text-bone">
          <p>{notice}</p>
        </div>
      ) : null}

    </form>
    </ValidationContext.Provider>
  );
}
