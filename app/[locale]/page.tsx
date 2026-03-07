'use client';

import { useEffect, useMemo, useState, type ComponentProps } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FAQSection } from "@/components/faq-section";
import { StoryReader } from "@/components/story-reader";
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
  Users,
  Menu,
  X,
  ShieldCheck,
  Sparkles,
  BookHeart,
} from "lucide-react";
import { useTranslations } from "@/lib/i18n/use-translations";
import { LanguageSwitcher } from "@/components/language-switcher";
import { localeNames, type Locale } from "@/lib/i18n/config";
import { useParams } from "next/navigation";
import { getSiteContent } from "@/lib/content/client";
import { usePlatform } from "@/hooks/use-platform";
import { StoreBadges } from "@/components/store-badges";

const HERO_STORY_ID = "theMoonbellQuest";

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
const DEFAULT_DOWNLOAD_IOS_URL = "https://apps.apple.com/app/id6759845142";

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
    feedback: t.navFeedback,
    stories: t.navStories,
    download: t.navDownload,
    storiesUrl: "",
    downloadUrl: "",
  },
  hero: {
    badge: t.heroBadge,
    title: t.heroTitle,
    titleHighlight: t.heroTitleHighlight,
    titleEnd: t.heroTitleEnd,
    description: t.heroDescription,
    readOnline: t.heroReadOnline,
    readOnlineUrl: "",
    lovedBy: t.heroLovedBy,
    worldwide: t.heroWorldwide,
    imageUrl: "",
    imageCaption: "",
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
  const platform = usePlatform();
  const defaultContent = useMemo(() => buildDefaultContent(t), [t]);
  const [content, setContent] = useState(defaultContent);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
  
  const platformDownloadUrl = platform === 'ios' ? DEFAULT_DOWNLOAD_IOS_URL : DEFAULT_DOWNLOAD_URL;
  const navStoriesUrl = resolveLink(content.nav.storiesUrl, content.nav.stories) || `/${locale}/stories/`;
  const heroReadOnlineUrl =
    resolveLink(content.hero.readOnlineUrl, content.hero.readOnline) || `/${locale}/stories/`;
  const footerDownloadUrl =
    resolveLink(content.footer.downloadUrl, content.footer.downloadLabel) || platformDownloadUrl;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-blue-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href={`/${locale}`} className="flex items-center gap-2">
              <img src="/website-icon.png" alt="Storywell" className="h-10 w-10 rounded-lg" />
              <span className="text-2xl font-bold bg-gradient-to-r from-[#992ed1] to-[#e91370] bg-clip-text text-transparent">
                Storywell
              </span>
            </Link>
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
              <Link href={navStoriesUrl} className="text-gray-700 hover:text-purple-600 transition">
                {content.nav.stories}
              </Link>
              <Link href={`/${locale}/feedback`} className="text-gray-700 hover:text-purple-600 transition">
                {content.nav.feedback}
              </Link>
              <LanguageSwitcher />
            </div>
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-purple-50 transition"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6 text-purple-600" /> : <Menu className="h-6 w-6 text-purple-600" />}
            </button>
          </div>
          {/* Mobile menu drawer */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-purple-100 bg-white/95 backdrop-blur-md pb-4 px-2 space-y-1">
              <Link href="#features" className="block py-2 px-3 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition" onClick={() => setMobileMenuOpen(false)}>
                {content.nav.features}
              </Link>
              <Link href="#languages" className="block py-2 px-3 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition" onClick={() => setMobileMenuOpen(false)}>
                {content.nav.languages}
              </Link>
              <Link href="#faq" className="block py-2 px-3 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition" onClick={() => setMobileMenuOpen(false)}>
                {content.nav.faq}
              </Link>
              <Link href={navStoriesUrl} className="block py-2 px-3 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition" onClick={() => setMobileMenuOpen(false)}>
                {content.nav.stories}
              </Link>
              <Link href={`/${locale}/feedback`} className="block py-2 px-3 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition" onClick={() => setMobileMenuOpen(false)}>
                {content.nav.feedback}
              </Link>
              <div className="py-2 px-3">
                <LanguageSwitcher />
              </div>
            </div>
          )}
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
              <StoreBadges />
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
              <div className="relative rounded-3xl shadow-2xl overflow-hidden border-4 border-purple-200">
                <StoryReader
                  storyId={HERO_STORY_ID}
                  locale={locale}
                  onExit={() => {}}
                  labels={{
                    loading: t.storyReaderLoading,
                    error: t.storyReaderError,
                    retry: t.storyReaderRetry,
                    back: t.storyReaderBack,
                    pageLabel: t.storyReaderPageLabel,
                    audioLabel: t.storyReaderAudioLabel,
                    noAudio: t.storyReaderNoAudio,
                    play: t.storyReaderPlay,
                    pause: t.storyReaderPause,
                    next: t.storyReaderNext,
                    prev: t.storyReaderPrev,
                    fullscreenEnter: t.storyReaderFullscreenEnter,
                    fullscreenExit: t.storyReaderFullscreenExit,
                    languageLabel: t.storyReaderLanguageLabel,
                  }}
                />
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

      {/* Trust Signals */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center gap-3 p-6">
              <div className="h-14 w-14 bg-green-100 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg text-gray-900">{t.trustAdFreeTitle}</h3>
              <p className="text-gray-600 text-sm">{t.trustAdFreeDesc}</p>
            </div>
            <div className="flex flex-col items-center gap-3 p-6">
              <div className="h-14 w-14 bg-purple-100 rounded-2xl flex items-center justify-center">
                <Heart className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg text-gray-900">{t.trustSafeTitle}</h3>
              <p className="text-gray-600 text-sm">{t.trustSafeDesc}</p>
            </div>
            <div className="flex flex-col items-center gap-3 p-6">
              <div className="h-14 w-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Sparkles className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg text-gray-900">{t.trustMadeWithLoveTitle}</h3>
              <p className="text-gray-600 text-sm">{t.trustMadeWithLoveDesc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Stories Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4 bg-orange-100 text-orange-700 hover:bg-orange-200">
            {t.exploreStoriesBadge}
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {t.exploreStoriesTitle}{" "}
            <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              {t.exploreStoriesTitleHighlight}
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            {t.exploreStoriesSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <LinkButton
              href={`/${locale}/stories/`}
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-lg h-14 px-8"
            >
              <BookHeart className="mr-2 h-5 w-5" />
              {t.exploreStoriesCta}
            </LinkButton>
          </div>
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
          <StoreBadges className="justify-center" variant="light" />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <Link href={`/${locale}`} className="inline-flex flex-col items-center gap-1 mb-4 p-3 rounded-xl ring-1 ring-white/25">
                <img src="/website-icon.png" alt="Storywell" className="h-12 w-12 rounded-lg" />
                <span className="text-2xl font-bold bg-gradient-to-r from-[#992ed1] to-[#e91370] bg-clip-text text-transparent">
                  Storywell
                </span>
              </Link>
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
                <li><Link href={`/${locale}/impressum`} className="hover:text-purple-400 transition">{t.footerImpressum}</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
      </main>
    </div>
  );
}
