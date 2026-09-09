import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { validateNotificationConfig } from '../lib/notification-config.mjs';

const valid = { RESEND_API_KEY: 're_testcredential123', NOTIFICATION_TO_EMAIL: 'coach@wavedomethod.com', NOTIFICATION_FROM_EMAIL: 'Wavedo <apply@wavedomethod.com>' };
assert.equal(validateNotificationConfig(valid).issues.length, 0);
for (const overrides of [{RESEND_API_KEY:''}, {NOTIFICATION_TO_EMAIL:'a@b.com,c@d.com'}, {NOTIFICATION_TO_EMAIL:'coach@example.com'}, {NOTIFICATION_FROM_EMAIL:'onboarding@resend.dev'}, {NOTIFICATION_FROM_EMAIL:'Bad\r\nName <a@b.com>'}, {NOTIFICATION_FROM_EMAIL:''}]) {
  assert.ok(validateNotificationConfig({...valid, ...overrides}).issues.length);
}
let source = readFileSync(new URL('../app/api/notify/route.ts', import.meta.url), 'utf8');
source = source.replace('"next/server"', JSON.stringify(import.meta.resolve('next/server.js'))).replace('"@/lib/notification-config.mjs"', JSON.stringify(new URL('../lib/notification-config.mjs', import.meta.url).href));
source = source.replace('import { consultationUrl } from "@/lib/booking";', readFileSync(new URL('../lib/booking.ts', import.meta.url), 'utf8').replace('export ', ''));
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { POST } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
Object.assign(process.env, valid);
const logs = [];
console.error = (...args) => logs.push(JSON.stringify(args));
const request = (body = {type:'intake', fields:{email:'applicant@wavedomethod.com',name:'<script>private</script>'}}) => new Request('https://localhost/api/notify', {method:'POST',body:JSON.stringify(body)});
let calls = [];
globalThis.fetch = async (_, options) => {calls.push(JSON.parse(options.body)); return new Response('{}', {status:200});};
assert.equal((await POST(request(null))).status, 400);
process.env.NOTIFICATION_TO_EMAIL = '';
assert.equal((await POST(request())).status, 503);
assert.equal(calls.length, 0);
Object.assign(process.env, valid);
let result = await (await POST(request())).json();
assert.equal(result.delivered, true);
assert.equal(result.confirmationDelivered, true);
assert.equal(calls[0].from, valid.NOTIFICATION_FROM_EMAIL);
assert.ok(calls[0].html.includes('&lt;script&gt;'));
for (const status of [401,403,422,429,500]) {
  globalThis.fetch = async () => new Response('sensitive-provider-detail', {status});
  const response = await POST(request());
  assert.equal(response.status, [401,403,422].includes(status) ? 503 : 502);
  assert.equal((await response.json()).delivered, false);
}
let count = 0;
globalThis.fetch = async () => {if (++count === 1) return new Response('{}'); throw new Error('sensitive-provider-detail');};
result = await (await POST(request())).json();
assert.equal(result.delivered, true);
assert.equal(result.confirmationDelivered, false);
assert.ok(!logs.join('').includes('sensitive-provider-detail'));
assert.ok(!logs.join('').includes('private'));
assert.ok(!logs.join('').includes(valid.RESEND_API_KEY));
assert.ok(!logs.join('').includes(valid.NOTIFICATION_TO_EMAIL));
console.log('Notification configuration and mocked route checks passed. No email sent.');
