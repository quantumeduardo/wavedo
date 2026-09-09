import nextEnv from '@next/env';
const { loadEnvConfig } = nextEnv;
import { validateNotificationConfig } from '../lib/notification-config.mjs';

// Match Next's production env precedence. Never print env values or loader errors.
loadEnvConfig(process.cwd(), false, { info() {}, error() {} });
const { issues } = validateNotificationConfig(process.env);
if (issues.length) {
  console.error('Notification configuration needs attention:');
  for (const issue of issues) console.error(`- ${issue}`);
  process.exitCode = 1;
} else {
  console.log('Notification configuration format checks passed. No values displayed.');
}
console.log('Offline check only: verify key permissions, sender domain, recipient inbox, and template in Resend before launch. No email sent.');
