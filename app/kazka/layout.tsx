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
  title: "Storywell — 3 місяці Premium у подарунок 🎁",
  description:
    "Активуйте код KAZKA та отримайте 3 місяці преміум-доступу безкоштовно: ілюстровані казки й аудіоказки українською та ще 7 мовами. Без реклами, безпечно для дітей.",
  openGraph: {
    title: "Storywell — 3 місяці Premium у подарунок 🎁",
    description:
      "Активуйте код KAZKA та отримайте 3 місяці преміум-доступу безкоштовно: ілюстровані казки й аудіоказки українською та ще 7 мовами. Без реклами, безпечно для дітей.",
    type: "website",
    url: `${baseUrl}/kazka`,
    siteName: "Storywell",
    images: [
      {
        url: `${baseUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Storywell – казки для дітей 8 мовами",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Storywell — 3 місяці Premium у подарунок 🎁",
    description:
      "Активуйте код KAZKA та отримайте 3 місяці преміум-доступу безкоштовно: ілюстровані казки й аудіоказки українською та ще 7 мовами.",
    images: [`${baseUrl}/og-image.jpg`],
  },
};

export default function KazkaLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" className={nunito.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
