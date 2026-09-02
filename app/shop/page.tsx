import { Shop } from "@/components/Shop";

export default function ShopPage() {
  return (
    <main className="min-h-screen bg-ink">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-7 text-bone sm:px-8">
        <a href="/" className="text-xl font-semibold tracking-[0.32em] text-white">
          WAVĒDO
        </a>
        <nav className="flex items-center gap-6 text-xs font-medium uppercase tracking-[0.24em] text-white/62">
          <a href="/#programs" className="transition hover:text-champagne">
            Programs
          </a>
          <a href="/#contact" className="transition hover:text-champagne">
            Contact
          </a>
        </nav>
      </header>
      <Shop />
    </main>
  );
}
