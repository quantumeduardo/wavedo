export function isEmail(value) {
  return typeof value === "string" && value.length <= 254 &&
    /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?)+$/i.test(value);
}

export function validateNotificationConfig(env) {
  const apiKey = env.RESEND_API_KEY?.trim() ?? "";
  const to = env.NOTIFICATION_TO_EMAIL?.trim() ?? "";
  const from = env.NOTIFICATION_FROM_EMAIL?.trim() ?? "";
  const issues = [];
  if (!/^re_[A-Za-z0-9_-]+$/.test(apiKey) || /placeholder|replace|your_|xxx/i.test(apiKey)) {
    issues.push("RESEND_API_KEY: missing or invalid format");
  }
  if (!isEmail(to) || /@(?:example\.(?:com|org|net))$/i.test(to)) {
    issues.push("NOTIFICATION_TO_EMAIL: set one real recipient email address");
  }
  const sender = from.match(/^([^<>\r\n]+) <([^<>]+)>$/);
  const senderEmail = sender ? sender[2] : from;
  if (!isEmail(senderEmail) || /@(?:example\.(?:com|org|net)|resend\.dev)$/i.test(senderEmail)) {
    issues.push("NOTIFICATION_FROM_EMAIL: use an address on your verified domain, optionally Name <email>");
  }
  return { apiKey, to, from, issues };
}
