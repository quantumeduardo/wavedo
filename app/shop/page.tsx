import { Shop } from "@/components/Shop";
import { CartLink } from "@/components/CartLink";
import { coachingUrl, shopUrl } from "@/lib/site-links";
export const metadata = { title: "Shop | Wavēdo", description: "Shop the Wavēdo Training Hoodie. Limited Drop 01." };
export default function ShopPage() {
  return (
    <main className="min-h-screen bg-ink font-mono text-bone">
      <header className="flex items-center justify-between px-5 py-6 text-xs uppercase sm:px-10">
        <a href={coachingUrl} className="flex min-h-11 items-center">← Home</a>
        <a href={shopUrl} className="tracking-[0.18em]">Wavēdo</a>
        <CartLink />
      </header>
      <Shop />
      <footer className="flex justify-center gap-8 px-5 py-10 text-[10px] uppercase text-bone/60">
        <a href={coachingUrl}>Coaching</a><a href={`${coachingUrl}/#contact`}>Contact</a>
      </footer>
    </main>
  );
}
