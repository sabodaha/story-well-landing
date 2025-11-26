import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { CookieBanner } from "@/components/cookie-banner";
import { GoogleAnalytics } from "@/components/google-analytics";
import { locales, defaultLocale, type Locale } from "@/lib/i18n/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const locale = params.locale || defaultLocale;
  
  const titles: Record<Locale, string> = {
    en: "Story Well - Multilingual Children's Story App",
    de: "Story Well - Mehrsprachige Kindergeschichten-App",
    es: "Story Well - Aplicación de Cuentos Infantiles Multilingüe",
    fr: "Story Well - Application d'Histoires pour Enfants Multilingue",
    it: "Story Well - App di Storie per Bambini Multilingue",
    ru: "Story Well - Многоязычное приложение детских историй",
    tr: "Story Well - Çok Dilli Çocuk Hikayeleri Uygulaması",
    uk: "Story Well - Багатомовний додаток дитячих історій",
  };
  
  const descriptions: Record<Locale, string> = {
    en: "Immerse your children in beautifully illustrated stories available in 8 languages. Read offline, switch languages instantly, and create lasting memories.",
    de: "Tauchen Sie Ihre Kinder in wunderschön illustrierte Geschichten ein, die in 8 Sprachen verfügbar sind. Lesen Sie offline, wechseln Sie sofort die Sprache und schaffen Sie bleibende Erinnerungen.",
    es: "Sumerge a tus hijos en historias bellamente ilustradas disponibles en 8 idiomas. Lee sin conexión, cambia de idioma al instante y crea recuerdos duraderos.",
    fr: "Plongez vos enfants dans des histoires magnifiquement illustrées disponibles en 8 langues. Lisez hors ligne, changez de langue instantanément et créez des souvenirs durables.",
    it: "Immergi i tuoi bambini in storie splendidamente illustrate disponibili in 8 lingue. Leggi offline, cambia lingua all'istante e crea ricordi duraturi.",
    ru: "Погрузите своих детей в красиво иллюстрированные истории, доступные на 8 языках. Читайте офлайн, мгновенно переключайте языки и создавайте незабываемые воспоминания.",
    tr: "Çocuklarınızı 8 dilde mevcut güzelce resimlendirilmiş hikayelere daldırın. Çevrimdışı okuyun, anında dil değiştirin ve kalıcı anılar oluşturun.",
    uk: "Занурте своїх дітей у прекрасно ілюстровані історії, доступні 8 мовами. Читайте офлайн, миттєво перемикайте мови та створюйте незабутні спогади.",
  };

  return {
    title: titles[locale] || titles[defaultLocale],
    description: descriptions[locale] || descriptions[defaultLocale],
    keywords: ["children's stories", "multilingual", "kids app", "bedtime stories", "language learning", "offline reading"],
    authors: [{ name: "Story Well Team" }],
    openGraph: {
      title: titles[locale] || titles[defaultLocale],
      description: descriptions[locale] || descriptions[defaultLocale],
      type: "website",
    },
  };
}

export default function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { locale: Locale };
}>) {
  const locale = params.locale || defaultLocale;
  
  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GoogleAnalytics />
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}

