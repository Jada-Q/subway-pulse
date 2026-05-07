import type { Metadata } from "next";
import { Cormorant_Garamond, Geist_Mono } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Subway Pulse — Tokyo Metro",
  description:
    "東京地下鉄の5路線を抽象的な図として描き、列車をキャンバス上の点と軌跡として表現するアンビエント・キャンバス。デモダイヤグラム。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${cormorant.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full overflow-hidden bg-black">{children}</body>
    </html>
  );
}
