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
  title: "Storywell — 3 Monate Premium geschenkt 🎁",
  description:
    "Code KAZKA aktivieren und 3 Monate Premium gratis erhalten: illustrierte Gutenachtgeschichten und Hörbücher auf Deutsch und in 7 weiteren Sprachen. Ohne Werbung, sicher für Kinder.",
  openGraph: {
    title: "Storywell — 3 Monate Premium geschenkt 🎁",
    description:
      "Code KAZKA aktivieren und 3 Monate Premium gratis erhalten: illustrierte Gutenachtgeschichten und Hörbücher auf Deutsch und in 7 weiteren Sprachen. Ohne Werbung, sicher für Kinder.",
    type: "website",
    url: `${baseUrl}/geschenk`,
    siteName: "Storywell",
    images: [
      {
        url: `${baseUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Storywell – illustrierte Kindergeschichten in 8 Sprachen",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Storywell — 3 Monate Premium geschenkt 🎁",
    description:
      "Code KAZKA aktivieren und 3 Monate Premium gratis erhalten: illustrierte Gutenachtgeschichten und Hörbücher in 8 Sprachen.",
    images: [`${baseUrl}/og-image.jpg`],
  },
};

export default function GeschenkLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={nunito.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
