import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const compile = source => `data:text/javascript;base64,${Buffer.from(ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText).toString('base64')}`;
const moduleUrl = compile(readFileSync(new URL('../lib/checkout.ts', import.meta.url),'utf8'));
const { validateCheckout, totals } = await import(moduleUrl);
const { POST } = await import(compile(readFileSync(new URL('../app/api/checkout/route.ts',import.meta.url),'utf8').replace('"@/lib/checkout"', JSON.stringify(moduleUrl))));
const payload = {items:[{size:'S',quantity:2},{size:'XL',quantity:1}],shipping:{firstName:'Test',lastName:'Shopper',email:'test@example.com',phone:'5551234567',address:'123 Main St',apartment:'',city:'Boston',state:'MA',zip:'02110',country:'United States'},attemptId:'12345678-1234-1234-1234-123456789abc',total:1};
const request = (body = payload, origin = 'https://wavedomethod.com') => new Request('https://wavedomethod.com/api/checkout',{method:'POST',headers:{origin},body:JSON.stringify(body)});
assert.equal(validateCheckout(payload).total,23997);
assert.equal(totals([]).total,0);
assert.deepEqual(totals([{size:'M',quantity:1}]), {subtotal:7999,shipping:1200,total:9199,currency:'usd'});
assert.deepEqual(totals([{size:'M',quantity:2}]), {subtotal:15998,shipping:0,total:15998,currency:'usd'});
let calls=[];
globalThis.fetch = async (url, options) => {calls.push({url,options});return Response.json({url:'https://checkout.stripe.com/c/pay/cs_test_mock'});};
delete process.env.STRIPE_SECRET_KEY;
let response = await POST(request());
assert.equal(response.status,503);
const fallback=await response.json();
assert.equal(fallback.setupRequired,true);
assert.equal(fallback.preview.total,23997);
assert.equal(calls.length,0);
for (const items of [[],[{size:'BAD',quantity:1}],[{size:'M',quantity:0}],[{size:'M',quantity:1.5}],[{size:'M',quantity:100}],[{size:'M',quantity:1},{size:'M',quantity:2}], [null]]) {
  assert.equal((await POST(request({...payload,items}))).status,400);
}
for (const body of [null,{}, {...payload,shipping:{}},{...payload,shipping:{...payload.shipping,email:'bad'}},{...payload,shipping:{...payload.shipping,country:'ZZ'}},{...payload,attemptId:'bad'}]) assert.equal((await POST(request(body))).status,400);
assert.equal((await POST(request(payload,'https://attacker.test'))).status,403);
assert.equal((await POST(new Request('https://wavedomethod.com/api/checkout',{method:'POST',body:'{'}))).status,400);
process.env.STRIPE_SECRET_KEY='sk_test_mockcredential';
response=await POST(request());
assert.equal(response.status,200);
const params=new URLSearchParams(calls[0].options.body);
assert.equal(params.get('line_items[0][quantity]'),'2');
assert.equal(params.get('line_items[1][price_data][product_data][name]'),'Wavedo 520 · Jet Black · XL');
assert.equal(params.get('line_items[0][price_data][unit_amount]'),'7999');
assert.equal(params.get('shipping_options[0][shipping_rate_data][fixed_amount][amount]'),'0');
assert.equal(params.get('payment_intent_data[shipping][address][line1]'),'123 Main St');
assert.equal(params.get('payment_intent_data[shipping][address][country]'),'US');
assert.equal(params.get('metadata[total_cents]'),'23997');
await POST(request());
assert.equal(calls[0].options.headers['Idempotency-Key'],calls[1].options.headers['Idempotency-Key']);
await POST(request({...payload,items:[{size:'M',quantity:1}]}));
assert.notEqual(calls[0].options.headers['Idempotency-Key'],calls[2].options.headers['Idempotency-Key']);
for (const status of [401,403,429,500]) {
  globalThis.fetch=async()=>new Response('private provider error',{status});
  response=await POST(request()); assert.equal(response.status,502); assert.ok(!(await response.text()).includes('private'));
}
for (const url of ['http://checkout.stripe.com/pay','https://evil.test/pay',null]) {
  globalThis.fetch=async()=>Response.json({url}); assert.equal((await POST(request())).status,502);
}
globalThis.fetch=async()=>{throw new Error('timeout');};
assert.equal((await POST(request())).status,502);
console.log('Checkout validation, preview, Stripe payload, retries, and failure checks passed. No payments created.');

const storage = new Map();
globalThis.localStorage = {getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value)};
globalThis.window = {dispatchEvent: () => {}};
const {addToCart, readCart} = await import(compile(readFileSync(new URL('../lib/cart-storage.ts',import.meta.url),'utf8').replace('"./checkout"', JSON.stringify(moduleUrl))));
assert.equal(addToCart('M',3).quantity,3);
assert.equal(addToCart('M',2).quantity,5);
addToCart('XL',2);
assert.deepEqual(readCart().items,[{size:'M',quantity:5},{size:'XL',quantity:2}]);
assert.equal(addToCart('M',99).quantity,99);
assert.throws(() => addToCart('M',0));
assert.throws(() => addToCart('M',1.5));
console.log('Selected quantity, existing bag accumulation, size separation, and limits passed.');
