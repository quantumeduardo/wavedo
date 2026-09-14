import nextEnv from '@next/env';
nextEnv.loadEnvConfig(process.cwd(), false, {info(){},error(){}});
const requirements = {
  STRIPE_SECRET_KEY: /^sk_(test|live)_/.test(process.env.STRIPE_SECRET_KEY ?? ''),
  STRIPE_WEBHOOK_SECRET: (process.env.STRIPE_WEBHOOK_SECRET ?? '').startsWith('whsec_'),
  'DATABASE_URL or POSTGRES_URL': !!(process.env.DATABASE_URL || process.env.POSTGRES_URL),
};
for (const [name, present] of Object.entries(requirements)) console.log(`${name}: ${present ? 'present (not authenticated)' : 'missing or invalid'}`);
if (Object.values(requirements).some((value) => !value)) process.exitCode = 1;
console.log('No secret values displayed; no network requests made.');
