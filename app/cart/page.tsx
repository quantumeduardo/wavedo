import { Cart } from "@/components/Cart";

type CartPageProps = {
  searchParams: Promise<{
    size?: string;
  }>;
};

export default async function CartPage({ searchParams }: CartPageProps) {
  const params = await searchParams;

  return (
    <main className="bg-ink">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-7 text-bone sm:px-8">
        <a href="/" className="text-xl font-semibold tracking-[0.32em] text-white">
          WAVĒDO
        </a>
        <nav className="flex items-center gap-6 text-xs font-medium uppercase tracking-[0.24em] text-white/62">
          <a href="/#shop" className="transition hover:text-champagne">
            Shop
          </a>
          <a href="/#contact" className="transition hover:text-champagne">
            Contact
          </a>
        </nav>
      </header>
      <Cart initialSize={params.size} />
    </main>
  );
}
