import { redirect } from 'next/navigation';
import { defaultLocale } from '@/lib/i18n/config';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // This layout is only used for the root path, which should redirect to the locale
  redirect(`/${defaultLocale}`);
}
