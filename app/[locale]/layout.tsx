import type { Metadata } from "next";
import { Nunito, Lexend } from "next/font/google";
import "../globals.css";
import { CookieBanner } from "@/components/cookie-banner";
import { GoogleAnalytics } from "@/components/google-analytics";
import { locales, defaultLocale, type Locale } from "@/lib/i18n/config";

// Brand/UI font + reading font, bound from design-system/tokens.json
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "600", "700", "800"],
});

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

// Runs synchronously in <head>, before the browser paints, so a page opened at night is
// never a bright cream sheet for a frame. Static export has no server to read the OS
// preference, and Tailwind's dark variant here is class-based, so the class has to be put
// on <html> from the client. The listener keeps an already-open tab in sync when the OS
// theme flips. Any failure leaves the light palette, which is fully functional.
const THEME_INIT = `(function(){try{var e=document.documentElement,m=window.matchMedia("(prefers-color-scheme: dark)"),a=function(d){e.classList.toggle("dark",d)};a(m.matches);m.addEventListener?m.addEventListener("change",function(v){a(v.matches)}):m.addListener(function(v){a(v.matches)})}catch(_){}})();`;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = (locales.includes(localeParam as Locale) ? localeParam : defaultLocale) as Locale;
  
  const baseUrl = 'https://dartim-media.com';
  
  const titles: Record<Locale, string> = {
    en: "Storywell - Multilingual Children's Story App",
    de: "Storywell - Mehrsprachige Kindergeschichten-App",
    es: "Storywell - Aplicación de Cuentos Infantiles Multilingüe",
    fr: "Storywell - Application d'Histoires pour Enfants Multilingue",
    it: "Storywell - App di Storie per Bambini Multilingue",
    ru: "Storywell - Многоязычное приложение детских историй",
    tr: "Storywell - Çok Dilli Çocuk Hikayeleri Uygulaması",
    uk: "Storywell - Багатомовний додаток дитячих історій",
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

  // Generate hreflang alternates
  const languages: Record<string, string> = {};
  for (const loc of locales) {
    languages[loc] = `${baseUrl}/${loc}/`;
  }
  languages['x-default'] = `${baseUrl}/en/`;

  return {
    title: titles[locale] || titles[defaultLocale],
    description: descriptions[locale] || descriptions[defaultLocale],
    keywords: ["children's stories", "multilingual", "kids app", "bedtime stories", "language learning", "offline reading"],
    authors: [{ name: "Storywell Team" }],
    alternates: {
      canonical: `${baseUrl}/${locale}/`,
      languages,
    },
    openGraph: {
      title: titles[locale] || titles[defaultLocale],
      description: descriptions[locale] || descriptions[defaultLocale],
      type: "website",
      url: `${baseUrl}/${locale}/`,
      siteName: "Storywell",
      images: [
        {
          url: `${baseUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: "Storywell – Multilingual Children's Stories",
        },
      ],
      locale: locale,
    },
    twitter: {
      card: "summary_large_image",
      title: titles[locale] || titles[defaultLocale],
      description: descriptions[locale] || descriptions[defaultLocale],
      images: [`${baseUrl}/og-image.jpg`],
    },
    icons: {
      icon: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale: localeParam } = await params;
  const locale = (locales.includes(localeParam as Locale) ? localeParam : defaultLocale) as Locale;
  
  // Structured data for SoftwareApplication
  const appStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Storywell',
    applicationCategory: 'EducationApplication',
    operatingSystem: 'Android, iOS',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    url: 'https://dartim-media.com',
    image: 'https://dartim-media.com/og-image.jpg',
    installUrl: [
      'https://apps.apple.com/app/id6759845142',
      'https://play.google.com/store/apps/details?id=com.dartim_media.storywell',
    ],
    downloadUrl: 'https://dartim-media.com/download',
    description: locale === 'en' 
      ? "Immerse your children in beautifully illustrated stories available in 8 languages. Read offline, switch languages instantly, and create lasting memories."
      : "Multilingual children's story app",
  };
  
  return (
    <html lang={locale} className={`${nunito.variable} ${lexend.variable}`} suppressHydrationWarning>
      <head>
        {/* First in <head>: the class must land before the stylesheet paints. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        <meta name="color-scheme" content="light dark" />
        <meta name="apple-itunes-app" content={`app-id=6759845142, app-argument=https://dartim-media.com/${locale}`} />
        <meta property="al:ios:app_store_id" content="6759845142" />
        <meta property="al:ios:app_name" content="Storywell" />
        <meta property="al:android:package" content="com.dartim_media.storywell" />
        <meta property="al:android:app_name" content="Storywell" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(appStructuredData) }}
        />
      </head>
      <body
        className={`${nunito.variable} ${lexend.variable} antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Skip to main content
        </a>
        <GoogleAnalytics />
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}

