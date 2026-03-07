import type { Metadata } from "next";

const baseUrl = 'https://dartim-media.com';

export const metadata: Metadata = {
  title: "Download Storywell - Multilingual Children's Stories",
  description: "Download Storywell for free on iOS and Android. Beautifully illustrated children's stories in 8 languages. No ads, offline reading, safe for kids.",
  openGraph: {
    title: "Download Storywell - Multilingual Children's Stories",
    description: "Download Storywell for free on iOS and Android. Beautifully illustrated children's stories in 8 languages. No ads, offline reading, safe for kids.",
    type: "website",
    url: `${baseUrl}/download`,
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
    title: "Download Storywell - Multilingual Children's Stories",
    description: "Download Storywell for free on iOS and Android. Beautifully illustrated children's stories in 8 languages. No ads, offline reading, safe for kids.",
    images: [`${baseUrl}/og-image.jpg`],
  },
};

export default function DownloadLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
