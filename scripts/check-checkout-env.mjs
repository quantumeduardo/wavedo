import nextEnv from '@next/env';
nextEnv.loadEnvConfig(process.cwd(), false, { info() {}, error() {} });
const mode = process.env.VERCEL_ENV === 'production' ? 'live' : 'test';
const checks = {
  STRIPE_SECRET_KEY: new RegExp(`^(sk|rk)_${mode}_[A-Za-z0-9]+$`).test(process.env.STRIPE_SECRET_KEY?.trim() ?? ''),
  STRIPE_WEBHOOK_SECRET: /^whsec_[A-Za-z0-9]+$/.test(process.env.STRIPE_WEBHOOK_SECRET ?? ''),
  DATABASE_URL_OR_POSTGRES_URL: /^postgres(?:ql)?:\/\//.test(process.env.DATABASE_URL || process.env.POSTGRES_URL || ''),
};
for (const [name, valid] of Object.entries(checks)) console.log(`${name}: ${valid ? 'format OK' : 'needs configuration'}`);
if (Object.values(checks).some(valid => !valid)) process.exitCode = 1;
console.log(`Expected Stripe mode: ${mode}. Offline check only; no values displayed or provider requests made.`);
