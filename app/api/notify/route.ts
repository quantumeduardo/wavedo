import { NextResponse } from "next/server";
import { isEmail, validateNotificationConfig } from "@/lib/notification-config.mjs";

const confirmationTemplateId = "coaching-application";
const applicationUrl = "https://www.wavedomethod.com/questionnaire";
const consultationUrl = "https://calendly.com/eduardolandart/30min;

type NotificationPayload = {
  type?: string;
  subject?: string;
  fields?: Record<string, string | number | boolean | null | undefined>;
};

function formatFields(fields: NotificationPayload["fields"] = {}) {
  return Object.entries(fields)
    .map(([key, value]) => `${key}: ${value ?? ""}`)
    .join("\n");
}

function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]!);
}

function formatHtml(fields: NotificationPayload["fields"] = {}) {
  return `
    <div style="font-family: Arial, sans-serif; color: #111;">
      <h1 style="font-size: 20px;">Wavēdo Notification</h1>
      <table style="border-collapse: collapse; width: 100%;">
        ${Object.entries(fields)
          .map(
            ([key, value]) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px; font-weight: 700;">${escapeHtml(key)}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${escapeHtml(value)}</td>
              </tr>
            `,
          )
          .join("")}
      </table>
    </div>
  `;
}

function getApplicantEmail(fields: NotificationPayload["fields"] = {}) {
  const email = fields.email;

  return typeof email === "string" && isEmail(email.trim()) ? email.trim() : null;
}

function getTemplateVariables(fields: NotificationPayload["fields"] = {}) {
  const fullName = typeof fields.name === "string" ? fields.name.trim() : "";
  const firstName = fullName.split(/\s+/)[0] || "there";

  return {
    ...Object.fromEntries(
      Object.entries(fields)
        .filter(([, value]) => typeof value === "string" || typeof value === "number")
        .map(([key, value]) => [key, value]),
    ),
    application_url: applicationUrl,
    consultation_url: consultationUrl,
    first_name: firstName,
  };
}

function shouldSendConfirmation(type?: string) {
  return type === "intake" || type === "questionnaire";
}

export async function POST(request: Request) {
  let payload: NotificationPayload;

  try {
    payload = (await request.json()) as NotificationPayload;
  } catch {
    return NextResponse.json(
      {
        delivered: false,
        message: "The form could not be read. Please try again.",
      },
      { status: 400 },
    );
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload) ||
      (payload.type !== undefined && typeof payload.type !== "string") ||
      (payload.subject !== undefined && (typeof payload.subject !== "string" || payload.subject.length > 200 || /[\r\n]/.test(payload.subject))) ||
      !payload.fields || typeof payload.fields !== "object" || Array.isArray(payload.fields) ||
      Object.keys(payload.fields).length > 50 ||
      Object.entries(payload.fields).some(([key, value]) => key.length > 100 ||
        (value !== null && !["string", "number", "boolean"].includes(typeof value)) || String(value ?? "").length > 10000) ||
      (shouldSendConfirmation(payload.type) && !getApplicantEmail(payload.fields))) {
    return NextResponse.json({ delivered: false, message: "Please check your form details and email address." }, { status: 400 });
  }

  const fields = payload.fields;
  const subject = payload.subject ?? `Wavēdo ${payload.type ?? "notification"}`;
  const { apiKey: resendApiKey, to: notificationTo, from: notificationFrom, issues } = validateNotificationConfig(process.env);
  const configurationError = () => NextResponse.json({
    delivered: false,
    setupRequired: true,
    message: "Submissions are temporarily unavailable. Your evaluation has not been sent. Please try again later.",
  }, { status: 503 });

  if (issues.length) {
    console.error("Wavēdo notification configuration invalid", { issues });
    return configurationError();
  }

  let response: Response;

  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      signal: AbortSignal.timeout(10000),
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: notificationFrom,
        to: notificationTo,
        subject,
        text: formatFields(fields),
        html: formatHtml(fields),
      }),
    });
  } catch {
    console.error("Wavēdo notification request failed");

    return NextResponse.json(
      {
        delivered: false,
        message: "The email service could not be reached. Please try again.",
      },
      { status: 502 },
    );
  }

  if (!response.ok) {
    console.error("Resend rejected Wavēdo notification", { status: response.status });
    if ([400, 401, 403, 422].includes(response.status)) return configurationError();
    return NextResponse.json({ delivered: false, message: "The email service is temporarily unavailable. Please try again later." }, { status: 502 });
  }

  const applicantEmail = getApplicantEmail(fields);
  let confirmationDelivered = false;
  if (shouldSendConfirmation(payload.type) && applicantEmail) {
    try {
      const confirmationResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        signal: AbortSignal.timeout(10000),
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: notificationFrom,
          to: applicantEmail,
          template: {
            id: confirmationTemplateId,
            variables: getTemplateVariables(fields),
          },
        }),
      });

      confirmationDelivered = confirmationResponse.ok;
      if (!confirmationResponse.ok) {
        console.error("Resend rejected Wavēdo confirmation", { status: confirmationResponse.status });
      }
    } catch {
      // The coach notification already succeeded; do not encourage a duplicate submission.
      console.error("Wavēdo confirmation request failed");
    }
  }

  return NextResponse.json({
    delivered: true,
    confirmationDelivered,
    setupRequired: false,
  });
}
