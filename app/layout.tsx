import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wavēdo | Harness the Wave Within",
  description:
    "A holistic coaching system built around strength, nutrition, energy flow, and renewal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}
