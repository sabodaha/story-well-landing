'use client';

import { useEffect, useMemo, useState, type ComponentProps } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FAQSection } from "@/components/faq-section";
import { 
  BookOpen, 
  Globe, 
  Heart, 
  Download, 
  Moon, 
  Accessibility, 
  Smartphone,
  Star,
  Languages,
  Shield,
  Zap,
  Users
} from "lucide-react";
import { useTranslations } from "@/lib/i18n/use-translations";
import { LanguageSwitcher } from "@/components/language-switcher";
import { localeNames, type Locale } from "@/lib/i18n/config";
import { useParams } from "next/navigation";
import { getSiteContent } from "@/lib/content/client";

const iconMap = {
  BookOpen,
  Globe,
  Heart,
  Download,
  Moon,
  Accessibility,
  Smartphone,
  Star,
  Languages,
  Shield,
  Zap,
  Users,
};

const featureToneClasses = [
  { borderHover: "hover:border-purple-300", bg: "bg-purple-100", text: "text-purple-600" },
  { borderHover: "hover:border-pink-300", bg: "bg-pink-100", text: "text-pink-600" },
  { borderHover: "hover:border-blue-300", bg: "bg-blue-100", text: "text-blue-600" },
  { borderHover: "hover:border-green-300", bg: "bg-green-100", text: "text-green-600" },
  { borderHover: "hover:border-indigo-300", bg: "bg-indigo-100", text: "text-indigo-600" },
  { borderHover: "hover:border-orange-300", bg: "bg-orange-100", text: "text-orange-600" },
  { borderHover: "hover:border-teal-300", bg: "bg-teal-100", text: "text-teal-600" },
  { borderHover: "hover:border-rose-300", bg: "bg-rose-100", text: "text-rose-600" },
  { borderHover: "hover:border-violet-300", bg: "bg-violet-100", text: "text-violet-600" },
];

const DEFAULT_DOWNLOAD_URL = "https://play.google.com/store/apps/details?id=com.dartim_media.storywell";

const normalizeLink = (value?: string) => (typeof value === "string" ? value.trim() : "");
const isExternalLink = (href: string) => /^https?:\/\//i.test(href);
const resolveLink = (explicitUrl?: string, fallbackLabel?: string) => {
  const explicit = normalizeLink(explicitUrl);
  if (explicit) return explicit;
  const fallback = normalizeLink(fallbackLabel);
  if (/^https?:\/\//i.test(fallback)) return fallback;
  return "";
};
const linkProps = (href: string) =>
  isExternalLink(href) ? { target: "_blank", rel: "noopener noreferrer" } : {};

const resolveIcon = (name?: string) => {
  if (!name) return BookOpen;
  return iconMap[name as keyof typeof iconMap] || BookOpen;
};

type LinkButtonProps = ComponentProps<typeof Button> & {
  href?: string;
};

const LinkButton = ({ href, children, ...props }: LinkButtonProps) => {
  if (!href) {
    return <Button {...props}>{children}</Button>;
  }

  return (
    <Button asChild {...props}>
      <a href={href} {...linkProps(href)}>
        {children}
      </a>
    </Button>
  );
};

const buildDefaultContent = (t: ReturnType<typeof useTranslations>) => ({
  nav: {
    features: t.navFeatures,
    languages: t.navLanguages,
    faq: t.navFAQ,
    reviews: t.navReviews,
    feedback: t.navFeedback,
    download: t.navDownload,
    downloadUrl: "",
  },
  hero: {
    badge: t.heroBadge,
    title: t.heroTitle,
    titleHighlight: t.heroTitleHighlight,
    titleEnd: t.heroTitleEnd,
    description: t.heroDescription,
    downloadCta: t.heroDownload,
    watchDemo: t.heroWatchDemo,
    downloadUrl: "",
    watchDemoUrl: "",
    lovedBy: t.heroLovedBy,
    worldwide: t.heroWorldwide,
    imageUrl: "",
  },
  features: {
    badge: t.featuresBadge,
    title: t.featuresTitle,
    titleHighlight: t.featuresTitleHighlight,
    subtitle: t.featuresSubtitle,
    items: [
      { icon: "BookOpen", title: t.featureImmersiveTitle, description: t.featureImmersiveDesc },
      { icon: "Globe", title: t.featureLanguagesTitle, description: t.featureLanguagesDesc },
      { icon: "Download", title: t.featureOfflineTitle, description: t.featureOfflineDesc },
      { icon: "Heart", title: t.featureFavoritesTitle, description: t.featureFavoritesDesc },
      { icon: "Moon", title: t.featureDarkModeTitle, description: t.featureDarkModeDesc },
      { icon: "Accessibility", title: t.featureAccessibilityTitle, description: t.featureAccessibilityDesc },
      { icon: "Smartphone", title: t.featureCrossPlatformTitle, description: t.featureCrossPlatformDesc },
      { icon: "Shield", title: t.featureSafeTitle, description: t.featureSafeDesc },
      { icon: "Zap", title: t.featureFastTitle, description: t.featureFastDesc },
    ],
  },
  benefits: {
    badge: t.benefitsBadge,
    title: t.benefitsTitle,
    titleHighlight: t.benefitsTitleHighlight,
    stats: {
      totalStoriesLabel: t.benefitsTotalStories,
      totalStoriesValue: "127",
      languagesLabel: t.benefitsLanguages,
      languagesValue: "8",
      favoritesLabel: t.benefitsFavorites,
      favoritesValue: "45",
      offlineLabel: t.benefitsOffline,
      offlineValue: "12",
    },
    items: [
      { icon: "Languages", title: t.benefitLanguageTitle, description: t.benefitLanguageDesc },
      { icon: "Users", title: t.benefitFamilyTitle, description: t.benefitFamilyDesc },
      { icon: "BookOpen", title: t.benefitScreenTimeTitle, description: t.benefitScreenTimeDesc },
    ],
  },
  languages: {
    badge: t.languagesBadge,
    title: t.languagesTitle,
    titleHighlight: t.languagesTitleHighlight,
    subtitle: t.languagesSubtitle,
  },
  faq: {
    badge: t.faqBadge,
    title: t.faqTitle,
    titleHighlight: t.faqTitleHighlight,
    items: [
      { title: t.faq1Question, description: t.faq1Answer },
      { title: t.faq2Question, description: t.faq2Answer },
      { title: t.faq3Question, description: t.faq3Answer },
      { title: t.faq4Question, description: t.faq4Answer },
      { title: t.faq5Question, description: t.faq5Answer },
      { title: t.faq6Question, description: t.faq6Answer },
    ],
  },
  cta: {
    title: t.ctaTitle,
    subtitle: t.ctaSubtitle,
    downloadAndroid: t.ctaDownloadAndroid,
    downloadIos: t.ctaDownloadiOS,
    downloadAndroidUrl: "",
    downloadIosUrl: "",
  },
  footer: {
    description: t.footerDescription,
    copyright: t.footerCopyright,
    productLabel: t.footerProduct,
    contactLabel: t.footerContact,
    downloadLabel: t.footerDownload,
    downloadUrl: "",
  },
});

export default function Home() {
  const params = useParams();
  const locale = (params?.locale as Locale) || "en";
  const t = useTranslations();
  const defaultContent = useMemo(() => buildDefaultContent(t), [t]);
  const [content, setContent] = useState(defaultContent);

  useEffect(() => {
    let active = true;
    setContent(defaultContent);
    getSiteContent(locale, defaultContent).then((data) => {
      if (active) setContent(data);
    });
    return () => {
      active = false;
    };
  }, [locale, defaultContent]);
  
  const languages = [
    { code: 'en', flag: "🇬🇧", native: localeNames.en.native, english: localeNames.en.english },
    { code: 'de', flag: "🇩🇪", native: localeNames.de.native, english: localeNames.de.english },
    { code: 'ru', flag: "🇷🇺", native: localeNames.ru.native, english: localeNames.ru.english },
    { code: 'uk', flag: "🇺🇦", native: localeNames.uk.native, english: localeNames.uk.english },
    { code: 'it', flag: "🇮🇹", native: localeNames.it.native, english: localeNames.it.english },
    { code: 'fr', flag: "🇫🇷", native: localeNames.fr.native, english: localeNames.fr.english },
    { code: 'tr', flag: "🇹🇷", native: localeNames.tr.native, english: localeNames.tr.english },
    { code: 'es', flag: "🇪🇸", native: localeNames.es.native, english: localeNames.es.english },
  ];
  
  const navDownloadUrl = resolveLink(content.nav.downloadUrl, content.nav.download) || DEFAULT_DOWNLOAD_URL;
  const heroDownloadUrl = resolveLink(content.hero.downloadUrl, content.hero.downloadCta) || DEFAULT_DOWNLOAD_URL;
  const heroWatchDemoUrl = resolveLink(content.hero.watchDemoUrl, content.hero.watchDemo);
  const ctaAndroidUrl =
    resolveLink(content.cta.downloadAndroidUrl, content.cta.downloadAndroid) || DEFAULT_DOWNLOAD_URL;
  const ctaIosUrl = resolveLink(content.cta.downloadIosUrl, content.cta.downloadIos);
  const footerDownloadUrl =
    resolveLink(content.footer.downloadUrl, content.footer.downloadLabel) || DEFAULT_DOWNLOAD_URL;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-blue-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-purple-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Story Well
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-gray-700 hover:text-purple-600 transition">
                {content.nav.features}
              </Link>
              <Link href="#languages" className="text-gray-700 hover:text-purple-600 transition">
                {content.nav.languages}
              </Link>
              <Link href="#faq" className="text-gray-700 hover:text-purple-600 transition">
                {content.nav.faq}
              </Link>
              <Link href={`/${locale}/reviews`} className="text-gray-700 hover:text-purple-600 transition">
                {content.nav.reviews}
              </Link>
              <Link href={`/${locale}/feedback`} className="text-gray-700 hover:text-purple-600 transition">
                {content.nav.feedback}
              </Link>
              <LanguageSwitcher />
              <LinkButton
                href={navDownloadUrl}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {content.nav.download}
              </LinkButton>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main id="main-content">
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">
                {content.hero.badge}
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                {content.hero.title}{" "}
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                  {content.hero.titleHighlight}
                </span>{" "}
                {content.hero.titleEnd}
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                {content.hero.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <LinkButton
                  href={heroDownloadUrl}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg h-14 px-8"
                >
                  <Download className="mr-2 h-5 w-5" />
                  {content.hero.downloadCta}
                </LinkButton>
                <LinkButton
                  href={heroWatchDemoUrl}
                  size="lg"
                  variant="outline"
                  className="text-lg h-14 px-8 border-2 border-purple-600 text-purple-600 hover:bg-purple-50"
                >
                  {content.hero.watchDemo}
                </LinkButton>
              </div>
              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{content.hero.lovedBy}</span> {content.hero.worldwide}
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-3xl blur-3xl opacity-20 animate-pulse"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 border-4 border-purple-200">
                <div className="aspect-[4/3] bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 rounded-2xl flex items-center justify-center overflow-hidden relative">
                  {content.hero.imageUrl ? (
                    <Image
                      src={content.hero.imageUrl}
                      alt="Story Well preview"
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <BookOpen className="h-32 w-32 text-purple-400" />
                  )}
                </div>
                <div className="mt-6 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200">
              {content.features.badge}
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {content.features.title}{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {content.features.titleHighlight}
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {content.features.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.features.items.map((feature, index) => {
              const Icon = resolveIcon(feature.icon);
              const tone = featureToneClasses[index % featureToneClasses.length];
              return (
                <Card key={`${feature.title}-${index}`} className={`border-2 transition-all hover:shadow-xl ${tone.borderHover}`}>
                  <CardHeader>
                    <div className={`h-12 w-12 ${tone.bg} rounded-xl flex items-center justify-center mb-4`}>
                      <Icon className={`h-6 w-6 ${tone.text}`} />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                {content.benefits.badge}
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold">
                {content.benefits.title}{" "}
                <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  {content.benefits.titleHighlight}
                </span>
              </h2>
              <div className="space-y-6">
                {content.benefits.items.map((benefit, index) => {
                  const Icon = resolveIcon(benefit.icon);
                  const tone = featureToneClasses[index % featureToneClasses.length];
                  return (
                    <div key={`${benefit.title}-${index}`} className="flex gap-4">
                      <div className={`h-10 w-10 ${tone.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`h-5 w-5 ${tone.text}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                        <p className="text-gray-600">{benefit.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-400 rounded-3xl blur-3xl opacity-20"></div>
              <Card className="relative border-4 border-green-200 shadow-2xl">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">{content.benefits.stats.totalStoriesLabel}</p>
                        <p className="text-3xl font-bold text-purple-600">{content.benefits.stats.totalStoriesValue}</p>
                      </div>
                      <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-purple-600" />
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-gradient-to-r from-purple-600 to-pink-600"></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 pt-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{content.benefits.stats.languagesValue}</p>
                        <p className="text-xs text-gray-600">{content.benefits.stats.languagesLabel}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{content.benefits.stats.favoritesValue}</p>
                        <p className="text-xs text-gray-600">{content.benefits.stats.favoritesLabel}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{content.benefits.stats.offlineValue}</p>
                        <p className="text-xs text-gray-600">{content.benefits.stats.offlineLabel}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Languages Section */}
      <section id="languages" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-100 text-purple-700 hover:bg-purple-200">
              {content.languages.badge}
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {content.languages.title}{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {content.languages.titleHighlight}
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {content.languages.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {languages.map((lang) => (
              <Card key={lang.code} className="border-2 hover:border-purple-300 transition-all hover:shadow-lg cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="text-5xl mb-3">{lang.flag}</div>
                  <p className="font-semibold text-gray-900">{lang.native}</p>
                  <p className="text-sm text-gray-600">{lang.english}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-pink-100 text-pink-700 hover:bg-pink-200">
              {content.faq.badge}
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {content.faq.title}{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {content.faq.titleHighlight}
              </span>
            </h2>
          </div>

          <FAQSection items={content.faq.items} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {content.cta.title}
          </h2>
          <p className="text-xl mb-8 text-purple-100">
            {content.cta.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <LinkButton
              href={ctaAndroidUrl}
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 text-lg h-14 px-8"
            >
              <Download className="mr-2 h-5 w-5" />
              {content.cta.downloadAndroid}
            </LinkButton>
            <LinkButton
              href={ctaIosUrl}
              size="lg"
              variant="outline"
              className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-lg h-14 px-8"
            >
              <Download className="mr-2 h-5 w-5" />
              {content.cta.downloadIos}
            </LinkButton>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-8 w-8 text-purple-400" />
                <span className="text-2xl font-bold text-white">Story Well</span>
              </div>
              <p className="text-gray-400 mb-4">
                {content.footer.description}
              </p>
              <p className="text-sm text-gray-500">
                {content.footer.copyright}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">{content.footer.productLabel}</h3>
              <ul className="space-y-2">
                <li><Link href="#features" className="hover:text-purple-400 transition">{content.nav.features}</Link></li>
                <li><Link href="#languages" className="hover:text-purple-400 transition">{content.nav.languages}</Link></li>
                <li><Link href="#faq" className="hover:text-purple-400 transition">{content.nav.faq}</Link></li>
                <li><Link href={`/${locale}/reviews`} className="hover:text-purple-400 transition">{content.nav.reviews}</Link></li>
                <li><Link href={`/${locale}/feedback`} className="hover:text-purple-400 transition">{content.nav.feedback}</Link></li>
                <li>
                  {footerDownloadUrl ? (
                    <a
                      href={footerDownloadUrl}
                      className="hover:text-purple-400 transition"
                      {...linkProps(footerDownloadUrl)}
                    >
                      {content.footer.downloadLabel}
                    </a>
                  ) : (
                    <span className="text-gray-400">{content.footer.downloadLabel}</span>
                  )}
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">{content.footer.contactLabel}</h3>
              <ul className="space-y-2">
                <li>
                  <a href="mailto:admin@dartim-media.com" className="hover:text-purple-400 transition">
                    admin@dartim-media.com
                  </a>
                </li>
                <li><Link href={`/${locale}/privacy`} className="hover:text-purple-400 transition">{t.cookiePrivacyPolicy}</Link></li>
                <li><Link href={`/${locale}/terms`} className="hover:text-purple-400 transition">{t.cookieTerms}</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
      </main>
    </div>
  );
}
