import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/checkout";
import { notifyPaidOrder, recordPaidOrder } from "@/lib/orders";
import type Stripe from "stripe";
export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) return NextResponse.json({ received: false }, { status: 503 });
    event = stripe.webhooks.constructEvent(await request.text(), request.headers.get("stripe-signature") ?? "", secret);
  } catch {
    return NextResponse.json({ received: false }, { status: 400 });
  }
  if (!["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(event.type)) return NextResponse.json({ received: true });
  try {
    const session = await getStripe().checkout.sessions.retrieve((event.data.object as Stripe.Checkout.Session).id);
    if (await recordPaidOrder(session)) await notifyPaidOrder(session);
    return NextResponse.json({ received: true });
  } catch {
    console.error("Wavēdo paid order processing failed; Stripe will retry.");
    return NextResponse.json({ received: false }, { status: 500 });
  }
}
