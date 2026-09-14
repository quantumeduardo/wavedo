import { NextRequest, NextResponse } from "next/server";
import { checkoutOrigin, getStripe, sessionParameters, tokenHash, validateCart } from "@/lib/checkout";
import { prepareOrders } from "@/lib/orders";

export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  const origin = checkoutOrigin();
  // Local previews may use either loopback name; deployment redirects use configured hosts only.
  const requestOrigin = request.headers.get("origin");
  const local = !process.env.VERCEL_ENV && ["http://127.0.0.1:3000", "http://localhost:3000"].includes(requestOrigin ?? "");
  const branchOrigin = process.env.VERCEL_ENV === "preview" && process.env.VERCEL_BRANCH_URL
    ? `https://${process.env.VERCEL_BRANCH_URL}` : undefined;
  if (requestOrigin !== origin && requestOrigin !== branchOrigin && !local) return NextResponse.json({ message: "Please start checkout from the shop." }, { status: 403 });
  let items;
  let attempt: string;
  try {
    const raw = await request.text();
    if (raw.length > 4096) throw new Error();
    const body = JSON.parse(raw);
    items = validateCart(body.items);
    if (typeof body.attempt !== "string" || !/^[0-9a-f-]{36}$/i.test(body.attempt)) throw new Error();
    attempt = body.attempt;
  } catch {
    return NextResponse.json({ message: "Check your cart. Choose valid sizes and a total of 1–20 hoodies." }, { status: 400 });
  }
  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET?.startsWith("whsec_")) throw new Error("webhook_configuration");
    const stripe = getStripe();
    await prepareOrders();
    const owner = request.cookies.get("wavedo-checkout-owner")?.value ?? attempt;
    const destination = requestOrigin!;
    const session = await stripe.checkout.sessions.create(sessionParameters(items, destination, tokenHash(owner)), {
      idempotencyKey: `wavedo/${tokenHash(owner)}/${attempt}/${tokenHash(JSON.stringify(items))}`,
    });
    if (!session.url) throw new Error("checkout_unavailable");
    const response = NextResponse.json({ url: session.url });
    response.cookies.set("wavedo-checkout-owner", owner, { httpOnly: true, secure: !local, sameSite: "lax", path: "/", maxAge: 86400 });
    return response;
  } catch {
    console.error("Wavēdo checkout could not be created; check Stripe, webhook, and database configuration.");
    return NextResponse.json({ message: "Checkout is temporarily unavailable. Your cart is saved. Please try again later." }, { status: 503 });
  }
}
