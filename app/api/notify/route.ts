import { NextResponse } from "next/server";

const resendApiKey = process.env.RESEND_API_KEY;
const notificationTo = process.env.NOTIFICATION_TO_EMAIL;
const notificationFrom = process.env.NOTIFICATION_FROM_EMAIL ?? "Wavēdo <onboarding@resend.dev>";

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

  let response: Response;

  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
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

    console.error("Resend rejected Wavēdo notification", {
      status: response.status,
      resendError,
    });

    return NextResponse.json(
      {
        delivered: false,
        message:
          "The form was received, but the email service rejected the notification. Check the Vercel logs for the Resend error.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    delivered: true,
    setupRequired: false,
  });
}
