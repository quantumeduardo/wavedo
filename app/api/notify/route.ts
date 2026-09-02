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
  const payload = (await request.json()) as NotificationPayload;
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

  const response = await fetch("https://api.resend.com/emails", {
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

  if (!response.ok) {
    return NextResponse.json(
      {
        delivered: false,
        message: "Email provider rejected the notification.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    delivered: true,
    setupRequired: false,
  });
}
