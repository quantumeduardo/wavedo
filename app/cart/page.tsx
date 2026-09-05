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
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-6 text-bone sm:px-8 sm:py-7">
        <a href="/" className="text-lg font-semibold tracking-[0.24em] text-white sm:text-xl sm:tracking-[0.32em]">
          WAVĒDO
        </a>
        <nav className="flex flex-wrap items-center justify-end gap-x-5 gap-y-2 text-xs font-medium uppercase tracking-[0.16em] text-white/62 sm:gap-6 sm:tracking-[0.24em]">
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
