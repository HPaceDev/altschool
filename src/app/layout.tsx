import type { Metadata } from "next";
import { Golos_Text, Literata } from "next/font/google";
import "./globals.css";

/** Интерфейсный шрифт: спроектирован под русский текст. */
const golos = Golos_Text({
  variable: "--font-golos",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/** Заголовки: шрифт с засечками, сделанный для длинного чтения. */
const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "АльтШкола — прототип",
    template: "%s — АльтШкола",
  },
  description:
    "Кликабельный прототип агрегатора школ и вопросы к заказчику на этапе проектирования.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${golos.variable} ${literata.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
