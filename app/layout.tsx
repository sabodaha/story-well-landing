import { defaultLocale } from '@/lib/i18n/config';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // For static export, we'll handle redirect in the page component
  return children;
}
