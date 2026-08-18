import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "../globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "600", "700", "800"],
});

const baseUrl = 'https://dartim-media.com';

export const metadata: Metadata = {
  title: "Storywell — 3 Months of Premium as a Gift 🎁",
  description:
    "Activate code KAZKA and get 3 months of Premium for free: illustrated bedtime stories and audiobooks in 8 languages. No ads, safe for kids.",
  openGraph: {
    title: "Storywell — 3 Months of Premium as a Gift 🎁",
    description:
      "Activate code KAZKA and get 3 months of Premium for free: illustrated bedtime stories and audiobooks in 8 languages. No ads, safe for kids.",
    type: "website",
    url: `${baseUrl}/gift`,
    siteName: "Storywell",
    images: [
      {
        url: `${baseUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Storywell – illustrated children's stories in 8 languages",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Storywell — 3 Months of Premium as a Gift 🎁",
    description:
      "Activate code KAZKA and get 3 months of Premium for free: illustrated bedtime stories and audiobooks in 8 languages.",
    images: [`${baseUrl}/og-image.jpg`],
  },
};

export default function GiftLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={nunito.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
