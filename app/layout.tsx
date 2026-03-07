import type { Metadata } from "next";
import { defaultLocale } from '@/lib/i18n/config';

const baseUrl = 'https://dartim-media.com';

export const metadata: Metadata = {
  title: "Story Well - Multilingual Children's Story App",
  description: "Immerse your children in beautifully illustrated stories available in 8 languages. Read offline, switch languages instantly, and create lasting memories.",
  openGraph: {
    title: "Story Well - Multilingual Children's Story App",
    description: "Immerse your children in beautifully illustrated stories available in 8 languages. Read offline, switch languages instantly, and create lasting memories.",
    type: "website",
    url: baseUrl,
    siteName: "Story Well",
    images: [
      {
        url: `${baseUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Story Well – Multilingual Children's Stories",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Story Well - Multilingual Children's Story App",
    description: "Immerse your children in beautifully illustrated stories available in 8 languages. Read offline, switch languages instantly, and create lasting memories.",
    images: [`${baseUrl}/og-image.jpg`],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
