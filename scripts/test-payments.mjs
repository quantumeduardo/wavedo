import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
const require = createRequire(import.meta.url);
const { NextRequest } = require('next/server.js');
function compile(file, mocks = {}) {
  const source = fs.readFileSync(file, 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const compiled = { exports: {} };
  new Function('require', 'module', 'exports', code)((name) => name in mocks ? mocks[name] : require(name), compiled, compiled.exports);
  return compiled.exports;
}

const shared = compile('lib/checkout.ts');
const core = compile('lib/stripe-checkout.ts', {'./checkout':shared});
const cart = [{size:'M',quantity:2},{size:'L',quantity:1}];
const paid = {id:'cs_test_test123',metadata:{source:'wavedo-cart-v2',cart:JSON.stringify(cart),owner:core.tokenHash('owner')},mode:'payment',status:'complete',payment_status:'paid',currency:'usd',amount_total:23997,livemode:false};
assert.deepEqual(core.paidItems(paid),cart);
assert.equal(core.paidItems({...paid,payment_status:'unpaid'}),null);
assert.equal(core.paidItems({...paid,metadata:{}}),null);
assert.throws(()=>core.paidItems({...paid,amount_total:100}));
assert.throws(()=>core.paidItems({...paid,currency:'eur'}));
assert.deepEqual(core.paidItems({...paid,metadata:{...paid.metadata,cart:JSON.stringify([{size:'M',quantity:1}])},amount_total:9199}),[{size:'M',quantity:1}]);
process.env.STRIPE_SECRET_KEY='sk_live_fake';process.env.VERCEL_ENV='preview';assert.throws(core.getStripe);
process.env.STRIPE_SECRET_KEY='sk_test_fake';process.env.VERCEL_ENV='production';assert.throws(core.getStripe);
process.env.VERCEL_ENV='preview';process.env.STRIPE_WEBHOOK_SECRET='whsec_fake';
const Stripe = require('stripe');
const stripe = new Stripe('sk_test_notreal');
let recorded=0, notified=0;
const webhook = compile('app/api/stripe/webhook/route.ts', {
  '@/lib/stripe-checkout': {getStripe: () => ({webhooks:stripe.webhooks, checkout:{sessions:{retrieve:async()=>paid}}})},
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
  '@/lib/stripe-checkout': {...core,getStripe:()=>({checkout:{sessions:{retrieve:async()=>paid}}})},
  '@/lib/orders': {recordPaidOrder:async()=>true},
});
assert.equal((await status.GET(new NextRequest('https://preview.example/api/checkout/status?session_id=cs_test_test123'))).status,400);
assert.equal((await status.GET(new NextRequest('https://preview.example/api/checkout/status?session_id=cs_test_test123',{headers:{cookie:'wavedo-checkout-owner=wrong'}}))).status,404);
console.log('Checkout validation, totals, test/live guards, idempotency, webhook signatures and ownership checks passed. No network requests or payments made.');

const confirmed=await status.GET(new NextRequest('https://preview.example/api/checkout/status?session_id=cs_test_test123',{headers:{cookie:'wavedo-checkout-owner=owner'}}));
assert.equal(confirmed.status,200);assert.equal((await confirmed.json()).status,'paid');
assert.equal(confirmed.headers.get('cache-control'),'no-store');

let savedOrder;
let mailCount = 0;
const fakeSql = async (strings, ...values) => {
  const query = strings.join('?');
  if (query.startsWith('INSERT')) {
    assert.match(query, /ON CONFLICT \(session_id\) DO NOTHING/);
    savedOrder ??= { notified_at: null, paid_at: new Date(), shipping: JSON.parse(values[7]) };
  }
  if (query.startsWith('SELECT')) return savedOrder ? [savedOrder] : [];
  if (query.startsWith('UPDATE')) savedOrder.notified_at = new Date();
  return [];
};
process.env.DATABASE_URL = 'postgresql://unused';
const orders = compile('lib/orders.ts', {
  '@neondatabase/serverless': {neon:()=>fakeSql},
  './stripe-checkout': core,
  './notification-config.mjs': {validateNotificationConfig:()=>({issues:[],apiKey:'fake',to:'test@example.com',from:'test@example.com'})},
});
globalThis.fetch = async () => {mailCount++;return Response.json({id:'mock'});};
const shipping = {name:'Test',address:{line1:'123 Test'}};
const expanded = {...paid,payment_intent:{id:'pi_test',shipping}};
await orders.recordPaidOrder(expanded);
await orders.notifyPaidOrder(expanded);
await orders.recordPaidOrder(expanded);
await orders.notifyPaidOrder(expanded);
assert.equal(mailCount,1);
assert.deepEqual(savedOrder.shipping,shipping);
assert.equal(await orders.recordPaidOrder({...expanded,payment_status:'unpaid'}),false);
console.log('Paid orders retain shipping; duplicate fulfillment skips already-sent alerts.');
