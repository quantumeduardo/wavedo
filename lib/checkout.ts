export const cartSizes = ["XS", "S", "M", "L", "XL", "XXL"];
export const unitAmount = 7999;
export const maxQuantity = 99;
export type CheckoutItem = { size: string; quantity: number };
export function totals(items: CheckoutItem[]) {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * unitAmount, 0);
  const shipping = subtotal === 0 || subtotal >= 10000 ? 0 : 1200;
  return { subtotal, shipping, total: subtotal + shipping, currency: "usd" };
}
export function validateCheckout(value: unknown) {
  const input = value as { items?: CheckoutItem[]; shipping?: Record<string, string>; attemptId?: string } | null;
  if (!input || !Array.isArray(input.items) || !input.items.length || input.items.length > cartSizes.length ||
      input.items.some(item => !item || !cartSizes.includes(item.size) || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > maxQuantity) ||
      new Set(input.items.map(item => item.size)).size !== input.items.length) throw new Error("Please check the sizes and quantities in your cart (1–99 per size).");
  if (typeof input.attemptId !== "string" || !/^[a-f0-9-]{36}$/i.test(input.attemptId)) throw new Error("Please reload checkout and try again.");
  const fields = ["firstName", "lastName", "email", "phone", "address", "apartment", "city", "state", "zip", "country"];
  const shipping: Record<string, string> = {};
  for (const field of fields) {
    const value = input.shipping?.[field] ?? "";
    if (typeof value !== "string" || value.length > 200 || /[\x00-\x1f]/.test(value) || (field !== "apartment" && !value.trim())) throw new Error("Please complete valid shipping details.");
    shipping[field] = value.trim();
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email)) throw new Error("Please enter a valid email address.");
  // Accept the existing default plus ISO country codes, without guessing an address.
  shipping.country = /^(united states|usa|us)$/i.test(shipping.country) ? "US" : shipping.country.toUpperCase();
  const countries = new Set(countryCodes.split(" "));
  if (!countries.has(shipping.country)) throw new Error("Enter a valid two-letter country code, such as US or CA.");
  return { items: input.items.map(({size, quantity}) => ({size, quantity})), details: shipping, attemptId: input.attemptId, ...totals(input.items) };
}
const countryCodes = "AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW";

export function stripeParameters(order: ReturnType<typeof validateCheckout>, origin: string) {
  const p = new URLSearchParams({ mode: "payment", customer_email: order.details.email,
    success_url: `${origin}/cart?checkout=returned`, cancel_url: `${origin}/cart?checkout=cancelled` });
  order.items.forEach((item, index) => {
    const prefix = `line_items[${index}]`;
    p.set(`${prefix}[quantity]`, String(item.quantity));
    p.set(`${prefix}[price_data][currency]`, "usd");
    p.set(`${prefix}[price_data][unit_amount]`, String(unitAmount));
    p.set(`${prefix}[price_data][product_data][name]`, `Wavedo 520 · Jet Black · ${item.size}`);
    p.set(`${prefix}[price_data][product_data][metadata][size]`, item.size);
  });
  const rate = "shipping_options[0][shipping_rate_data]";
  p.set(`${rate}[type]`, "fixed_amount");
  p.set(`${rate}[fixed_amount][amount]`, String(order.shipping));
  p.set(`${rate}[fixed_amount][currency]`, "usd");
  p.set(`${rate}[display_name]`, order.shipping === 0 ? "Shipping included" : "Standard shipping");
  const prefix = "payment_intent_data[shipping]";
  p.set(`${prefix}[name]`, `${order.details.firstName} ${order.details.lastName}`);
  p.set(`${prefix}[phone]`, order.details.phone);
  for (const [key, field] of Object.entries({line1: "address", line2: "apartment", city: "city", state: "state", postal_code: "zip", country: "country"})) {
    p.set(`${prefix}[address][${key}]`, order.details[field]);
  }
  for (const prefix of ["metadata", "payment_intent_data[metadata]"]) {
    p.set(`${prefix}[items]`, order.items.map(item => `${item.size} x ${item.quantity}`).join(", "));
    p.set(`${prefix}[total_cents]`, String(order.total));
  }
  return p;
}
