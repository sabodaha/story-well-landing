import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Story Well - Multilingual Children's Story App",
  description: "Immerse your children in beautifully illustrated stories available in 8 languages. Read offline, switch languages instantly, and create lasting memories.",
  keywords: ["children's stories", "multilingual", "kids app", "bedtime stories", "language learning", "offline reading"],
  authors: [{ name: "Story Well Team" }],
  openGraph: {
    title: "Story Well - Multilingual Children's Story App",
    description: "Beautifully illustrated stories in 8 languages for children",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
