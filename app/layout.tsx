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

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.rt5rw19.my.id";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Website Resmi RT 05 RW 19 Sangkal Putung",
    template: "%s | RT 05 RW 19 Sangkal Putung",
  },
  description:
    "Pusat informasi resmi dan layanan publik digital warga RT 05 RW 19 Sangkal Putung, Kelurahan Brebes. Pengurusan surat pengantar online, transparansi kas, aduan laporan warga, dan berita lingkungan.",
  keywords: [
    "RT 05 RW 19",
    "Sangkal Putung",
    "Kelurahan Brebes",
    "Kabupaten Brebes",
    "Surat Pengantar RT Online",
    "Lapor Warga RT 05",
    "Website RT",
    "Dasbor Warga RT 05",
    "Informasi Lingkungan Sangkal Putung",
  ],
  authors: [{ name: "Pengurus RT 05 RW 19 Sangkal Putung" }],
  creator: "Pengurus RT 05 RW 19",
  publisher: "RT 05 RW 19 Sangkal Putung",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: "/logo-rt.png",
    shortcut: "/logo-rt.png",
    apple: "/logo-rt.png",
  },
  openGraph: {
    title: "Website Resmi RT 05 RW 19 Sangkal Putung",
    description:
      "Pusat informasi resmi dan layanan publik digital warga RT 05 RW 19 Sangkal Putung, Kelurahan Brebes. Pengurusan surat online, aduan warga, dan agenda lingkungan.",
    url: siteUrl,
    siteName: "RT 05 RW 19 Sangkal Putung",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/logo-rt.png",
        width: 512,
        height: 512,
        alt: "Logo Resmi RT 05 RW 19 Sangkal Putung",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Website Resmi RT 05 RW 19 Sangkal Putung",
    description:
      "Pusat informasi resmi dan layanan publik digital warga RT 05 RW 19 Sangkal Putung, Kelurahan Brebes.",
    images: ["/logo-rt.png"],
  },
  verification: {
    google: "diJdqGVjitBKVSh27Vauth8M-ZfBgIVIVdoYRjDKO88",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "GovernmentOrganization",
    name: "RT 05 RW 19 Sangkal Putung",
    alternateName: "Rukun Tetangga 05 Rukun Warga 19 Sangkal Putung",
    url: siteUrl,
    logo: `${siteUrl}/logo-rt.png`,
    description:
      "Pusat informasi resmi dan layanan publik digital warga RT 05 RW 19 Sangkal Putung, Kelurahan Brebes.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Sangkal Putung",
      addressLocality: "Brebes",
      addressRegion: "Jawa Tengah",
      postalCode: "52212",
      addressCountry: "ID",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["Indonesian", "Javanese"],
    },
  };

  return (
    <html lang="id" className={`${plusJakartaSans.variable} ${caveat.variable} h-full`}>
      <head>
        <meta
          name="google-site-verification"
          content="diJdqGVjitBKVSh27Vauth8M-ZfBgIVIVdoYRjDKO88"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans min-h-full bg-neutral-bg text-dark flex flex-col">
        {children}
      </body>
    </html>
  );
}
