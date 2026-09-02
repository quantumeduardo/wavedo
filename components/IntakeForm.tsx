"use client";

import { FormEvent, useState } from "react";

const programOptions = [
  "Virtual Consultation",
  "Online Coaching",
  "Hybrid Coaching",
  "12-Week Strength & Body Recomposition",
];

export function IntakeForm() {
  const [submitted, setSubmitted] = useState(false);
  const [notice, setNotice] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const fields = Object.fromEntries(formData.entries());

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
    };

    setNotice(
      result.delivered
        ? "Your evaluation was sent."
        : result.message ?? "Your evaluation was captured.",
    );
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="border border-champagne/40 bg-graphite p-8 text-center shadow-gold">
        <p className="text-xs font-semibold tracking-[0.34em] text-champagne">
          Intake Received
        </p>
        <h2 className="mt-5 font-display text-4xl leading-tight text-bone">
          Your evaluation has been captured.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-bone/64">
          {notice}
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-8 inline-flex min-h-12 items-center justify-center border border-champagne px-8 text-sm font-semibold tracking-[0.2em] text-champagne transition hover:bg-champagne hover:text-ink"
        >
          Edit Form
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8">
      {/* Edit intake fields and labels here. */}
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
      </div>

      <label className="grid gap-3 text-xs font-semibold tracking-[0.22em] text-bone/72">
        Primary Goal
        <textarea
          required
          name="goal"
          rows={4}
          className="border border-bone/14 bg-graphite px-4 py-3 text-base leading-7 tracking-normal text-bone outline-none transition focus:border-champagne"
          placeholder="Strength, recomposition, consistency, energy, recovery..."
        />
      </label>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-3 text-xs font-semibold tracking-[0.22em] text-bone/72">
          Training History
          <textarea
            required
            name="trainingHistory"
            rows={5}
            className="border border-bone/14 bg-graphite px-4 py-3 text-base leading-7 tracking-normal text-bone outline-none transition focus:border-champagne"
          />
        </label>
        <label className="grid gap-3 text-xs font-semibold tracking-[0.22em] text-bone/72">
          Nutrition & Recovery
          <textarea
            required
            name="nutritionRecovery"
            rows={5}
            className="border border-bone/14 bg-graphite px-4 py-3 text-base leading-7 tracking-normal text-bone outline-none transition focus:border-champagne"
          />
        </label>
      </div>

      <label className="grid gap-3 text-xs font-semibold tracking-[0.22em] text-bone/72">
        What Feels Stuck Right Now?
        <textarea
          required
          name="stuck"
          rows={4}
          className="border border-bone/14 bg-graphite px-4 py-3 text-base leading-7 tracking-normal text-bone outline-none transition focus:border-champagne"
        />
      </label>

      <button
        type="submit"
        className="min-h-14 border border-champagne bg-champagne px-8 text-sm font-semibold tracking-[0.22em] text-ink transition hover:border-bone hover:bg-bone md:w-fit"
      >
        Submit Evaluation
      </button>
    </form>
  );
}
