import { NextResponse } from "next/server";

const resendApiKey = process.env.RESEND_API_KEY?.trim();
const notificationTo = process.env.NOTIFICATION_TO_EMAIL?.trim();
const fallbackNotificationFrom = "Wavedo <apply@wavedomethod.com>";
const confirmationTemplateId = "coaching-application";

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

function formatHtml(fields: NotificationPayload["fields"] = {}) {
  return `
    <div style="font-family: Arial, sans-serif; color: #111;">
      <h1 style="font-size: 20px;">Wavēdo Notification</h1>
      <table style="border-collapse: collapse; width: 100%;">
        ${Object.entries(fields)
          .map(
            ([key, value]) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px; font-weight: 700;">${key}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${value ?? ""}</td>
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

  return typeof email === "string" && email.includes("@") ? email.trim() : null;
}

function getTemplateVariables(fields: NotificationPayload["fields"] = {}) {
  return Object.fromEntries(
    Object.entries(fields)
      .filter(([, value]) => typeof value === "string" || typeof value === "number")
      .map(([key, value]) => [key, value]),
  );
}

export async function POST(request: Request) {
  let payload: NotificationPayload;

  try {
    payload = (await request.json()) as NotificationPayload;
  } catch (error) {
    console.error("Wavēdo notification payload could not be parsed", error);

    return NextResponse.json(
      {
        delivered: false,
        message: "The form could not be read. Please try again.",
      },
      { status: 400 },
    );
  }

  const fields = payload.fields ?? {};
  const subject = payload.subject ?? `Wavēdo ${payload.type ?? "notification"}`;

  if (!resendApiKey || !notificationTo) {
    console.info("Wavēdo notification preview", {
      subject,
      fields,
      setupRequired: ["RESEND_API_KEY", "NOTIFICATION_TO_EMAIL"],
    });

    return NextResponse.json({
      delivered: false,
      setupRequired: true,
      message:
        "Notification captured locally. Add RESEND_API_KEY and NOTIFICATION_TO_EMAIL to send email.",
    });
  }

  if (!resendApiKey.startsWith("re_")) {
    console.error("Wavēdo notification has the wrong API key type", {
      startsWithResendPrefix: false,
      keyLength: resendApiKey.length,
    });

    return NextResponse.json(
      {
        delivered: false,
        message:
          "The email key is not a Resend key. Add a Resend API key that starts with re_ in Vercel, then redeploy.",
      },
      { status: 502 },
    );
  }

  let response: Response;

  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fallbackNotificationFrom,
        to: notificationTo,
        subject,
        text: formatFields(fields),
        html: formatHtml(fields),
      }),
    });
  } catch (error) {
    console.error("Wavēdo notification request failed before reaching Resend", error);

    return NextResponse.json(
      {
        delivered: false,
        message: "The email service could not be reached. Please try again.",
      },
      { status: 502 },
    );
  }

  if (!response.ok) {
    const resendError = await response.text();
    const invalidApiKey = response.status === 401 && resendError.includes("API key is invalid");

    console.error("Resend rejected Wavēdo notification", {
      status: response.status,
      resendError,
      keyLength: resendApiKey.length,
      startsWithResendPrefix: resendApiKey.startsWith("re_"),
    });

    return NextResponse.json(
      {
        delivered: false,
        message: invalidApiKey
          ? "The form was received, but Resend says the API key is invalid. Create a new Resend API key, replace RESEND_API_KEY in Vercel, and redeploy."
          : "The form was received, but the email service rejected the notification. Check the Vercel logs for the Resend error.",
      },
      { status: 502 },
    );
  }

  const applicantEmail = getApplicantEmail(fields);
  let confirmationDelivered = false;
  let confirmationMessage = applicantEmail
    ? "Confirmation email was not attempted."
    : "No applicant email was provided.";

  if (payload.type === "intake" && applicantEmail) {
    const confirmationResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fallbackNotificationFrom,
        to: applicantEmail,
        template: {
          id: confirmationTemplateId,
          variables: getTemplateVariables(fields),
        },
      }),
    });

    confirmationDelivered = confirmationResponse.ok;
    confirmationMessage = confirmationDelivered
      ? "Confirmation email sent."
      : "Confirmation template was rejected by Resend.";

    if (!confirmationResponse.ok) {
      const confirmationError = await confirmationResponse.text();
      confirmationMessage = confirmationError;

      console.error("Resend rejected Wavēdo confirmation template", {
        status: confirmationResponse.status,
        confirmationError,
        templateId: confirmationTemplateId,
      });
    }
  }

  return NextResponse.json({
    delivered: true,
    confirmationDelivered,
    confirmationMessage,
    setupRequired: false,
  });
}
