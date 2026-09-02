import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Caveat } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  display: "swap",
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Website Resmi RT 05 RW 19 Sangkal Putung",
  description: "Pusat informasi resmi dan layanan publik digital warga RT 05 RW 19 Sangkal Putung, Kelurahan Brebes. Pengurusan surat online, laporan warga, dan berita lingkungan.",
  keywords: "RT 05, RW 19, Sangkal Putung, Brebes, Kelurahan Brebes, surat online, lapor rt, website rt",
  authors: [{ name: "Pengurus RT 05 RW 19" }],
  viewport: "width=device-width, initial-scale=1.0",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${plusJakartaSans.variable} ${caveat.variable} h-full`}>
      <body className="font-sans min-h-full bg-neutral-bg text-dark flex flex-col">
        {children}
      </body>
    </html>
  );
}
