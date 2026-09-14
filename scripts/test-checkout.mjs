import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';
const require = createRequire(import.meta.url);
const { NextRequest } = require('next/server.js');
function compile(file, mocks = {}) {
  const source = fs.readFileSync(file, 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', code)((name) => name in mocks ? mocks[name] : require(name), module, module.exports);
  return module.exports;
}
const core = compile('lib/checkout.ts');
const cart = [{size:'M',quantity:2},{size:'L',quantity:1}];
assert.deepEqual(core.validateCart(cart), cart);
for (const bad of [null, [], [{size:'bad',quantity:1}], [{size:'M',quantity:0}], [{size:'M',quantity:1.2}], [{size:'M',quantity:21}], [{size:'M',quantity:1},{size:'M',quantity:1}], [{size:'M',quantity:20},{size:'L',quantity:1}]]) assert.throws(() => core.validateCart(bad));
const parameters = core.sessionParameters(core.validateCart([{size:'M',quantity:2,price:1},{size:'L',quantity:1}]), 'https://preview.example', 'owner');
assert.equal(parameters.line_items.reduce((sum, item) => sum + item.price_data.unit_amount * item.quantity, 0), 30000);
assert.equal(parameters.shipping_options[0].shipping_rate_data.fixed_amount.amount, 0);
assert.equal(parameters.success_url.startsWith('https://preview.example/'), true);
const paid = { id:'cs_test_test123', metadata:parameters.metadata, mode:'payment', status:'complete', payment_status:'paid', currency:'usd', amount_total:30000, livemode:false };
assert.deepEqual(core.paidItems(paid), cart);
assert.equal(core.paidItems({...paid, payment_status:'unpaid'}), null);
assert.equal(core.paidItems({...paid, metadata:{}}), null);
assert.throws(() => core.paidItems({...paid, amount_total:100}));
process.env.STRIPE_SECRET_KEY = 'sk_live_notreal';
process.env.VERCEL_ENV = 'preview';
assert.throws(core.getStripe);
process.env.STRIPE_SECRET_KEY = 'sk_test_notreal';
process.env.VERCEL_ENV = 'production';
assert.throws(core.getStripe);
process.env.VERCEL_ENV = 'preview';
process.env.VERCEL_URL = 'preview.example';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_notreal';
let requests = [];
let dbFails = false;
const route = compile('app/api/checkout/route.ts', {
  '@/lib/checkout': {...core, getStripe: () => ({checkout:{sessions:{create: async (params, options) => {requests.push({params, options}); return {url:'https://checkout.stripe.com/test'};}}}})},
  '@/lib/orders': {prepareOrders: async () => {if(dbFails) throw new Error('private-db-secret');}},
});
const attempt = '12345678-1234-1234-1234-123456789012';
const request = (body, origin='https://preview.example') => new NextRequest('https://preview.example/api/checkout', {method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(body)});
assert.equal((await route.POST(request({items:cart, attempt}, 'https://evil.example'))).status,403);
assert.equal((await route.POST(request({items:[], attempt}))).status,400);
assert.equal(requests.length,0);
const first = await route.POST(request({items:cart,attempt}));
assert.equal(first.status,200);
assert.ok(first.headers.get('set-cookie').includes('HttpOnly'));
await route.POST(request({items:cart,attempt}));
assert.equal(requests[0].options.idempotencyKey, requests[1].options.idempotencyKey);
assert.equal(requests[0].params.line_items[0].quantity,2);
const originalError = console.error;
const logs = [];
console.error = (...args) => logs.push(args.join(' '));
dbFails=true;
assert.equal((await route.POST(request({items:cart,attempt}))).status,503);
assert.equal(requests.length,2);
assert.ok(!logs.join('').includes('private-db-secret'));
console.error = originalError;

const Stripe = require('stripe');
const stripe = new Stripe('sk_test_notreal');
let recorded=0, notified=0;
const webhook = compile('app/api/stripe/webhook/route.ts', {
  '@/lib/checkout': {getStripe: () => ({webhooks:stripe.webhooks, checkout:{sessions:{retrieve:async()=>paid}}})},
  '@/lib/orders': {recordPaidOrder:async()=>{recorded++;return true;},notifyPaidOrder:async()=>{notified++;}},
});
const payload = JSON.stringify({id:'evt_test',type:'checkout.session.completed',data:{object:{id:paid.id}}});
const header = stripe.webhooks.generateTestHeaderString({payload,secret:process.env.STRIPE_WEBHOOK_SECRET});
const whRequest = (signature) => new NextRequest('https://preview.example/api/stripe/webhook',{method:'POST',headers:{'stripe-signature':signature},body:payload});
assert.equal((await webhook.POST(whRequest('invalid'))).status,400);
assert.equal(recorded,0);
assert.equal((await webhook.POST(whRequest(header))).status,200);
assert.equal(recorded,1); assert.equal(notified,1);
const status = compile('app/api/checkout/status/route.ts', {
  '@/lib/checkout': {...core,getStripe:()=>({checkout:{sessions:{retrieve:async()=>paid}}})},
  '@/lib/orders': {recordPaidOrder:async()=>true},
});
assert.equal((await status.GET(new NextRequest('https://preview.example/api/checkout/status?session_id=cs_test_test123'))).status,400);
assert.equal((await status.GET(new NextRequest('https://preview.example/api/checkout/status?session_id=cs_test_test123',{headers:{cookie:'wavedo-checkout-owner=wrong'}}))).status,404);
console.log('Checkout validation, totals, test/live guards, idempotency, webhook signatures and ownership checks passed. No network requests or payments made.');
