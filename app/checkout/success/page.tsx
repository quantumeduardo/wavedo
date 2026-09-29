import { CheckoutResult } from "@/components/CheckoutResult";
export const metadata = { title: "Order confirmation | Wavēdo", robots: { index: false, follow: false } };
export default async function CheckoutSuccess({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  return <CheckoutResult sessionId={(await searchParams).session_id} />;
}
