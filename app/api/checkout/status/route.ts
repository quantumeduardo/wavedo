import { NextRequest, NextResponse } from "next/server";
import { getStripe, paidItems, tokenHash } from "@/lib/checkout";
import { recordPaidOrder } from "@/lib/orders";
export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("session_id");
  const owner = request.cookies.get("wavedo-checkout-owner")?.value;
  if (!id || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(id) || !owner) return NextResponse.json({ status: "unknown" }, { status: 400 });
  try {
    const session = await getStripe().checkout.sessions.retrieve(id);
    if (session.metadata?.owner !== tokenHash(owner)) return NextResponse.json({ status: "unknown" }, { status: 404 });
    const items = paidItems(session);
    if (!items) return NextResponse.json({ status: "pending" }, { headers: { "Cache-Control": "no-store" } });
    await recordPaidOrder(session);
    return NextResponse.json({ status: "paid", items, amount: session.amount_total, test: !session.livemode }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ status: "unknown" }, { status: 503 });
  }
}
