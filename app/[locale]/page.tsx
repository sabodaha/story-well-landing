'use client';

import { useEffect, useMemo, useState, type ComponentProps } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FAQSection } from "@/components/faq-section";
import { StoryReader } from "@/components/story-reader";
import { AppScreenshots } from "@/components/app-screenshots";
import { StoryCarousel } from "@/components/story-carousel";
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

// Brand accent cycle (purple → pink → gold), bound from design-system/tokens.json.
// Replaces the old 9-color rainbow. Gold icon uses gold-700 (#C97A18) for contrast on pale gold.
const featureToneClasses = [
  { borderHover: "hover:border-brand-purple/40", bg: "bg-brand-purple/10", text: "text-brand-purple" },
  { borderHover: "hover:border-brand-pink/40", bg: "bg-brand-pink/10", text: "text-brand-pink" },
  { borderHover: "hover:border-[#C97A18]/40", bg: "bg-brand-gold/20", text: "text-[#C97A18]" },
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

const buildDefaultContent =(t: ReturnType<typeof useTranslations>) => ({
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
    <div className="min-h-screen bg-gradient-to-b from-brand-purple/5 via-background to-brand-pink/5">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md z-50 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href={`/${locale}`} className="flex items-center gap-2">
              <img src="/website-icon.png" alt="Storywell" className="h-10 w-10 rounded-lg" />
              <span className="text-2xl font-bold text-magic-gradient">
                Storywell
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-foreground/80 hover:text-primary transition">
                {content.nav.features}
              </Link>
              <Link href="#languages" className="text-foreground/80 hover:text-primary transition">
                {content.nav.languages}
              </Link>
              <Link href="#faq" className="text-foreground/80 hover:text-primary transition">
                {content.nav.faq}
              </Link>
              <Link href={navStoriesUrl} className="text-foreground/80 hover:text-primary transition">
                {content.nav.stories}
              </Link>
              <Link href={`/${locale}/feedback`} className="text-foreground/80 hover:text-primary transition">
                {content.nav.feedback}
              </Link>
              <LanguageSwitcher />
            </div>
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-accent transition"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6 text-primary" /> : <Menu className="h-6 w-6 text-primary" />}
            </button>
          </div>
          {/* Mobile menu drawer */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md pb-4 px-2 space-y-1">
              <Link href="#features" className="block py-2 px-3 rounded-lg text-foreground/80 hover:bg-accent hover:text-primary transition" onClick={() => setMobileMenuOpen(false)}>
                {content.nav.features}
              </Link>
              <Link href="#languages" className="block py-2 px-3 rounded-lg text-foreground/80 hover:bg-accent hover:text-primary transition" onClick={() => setMobileMenuOpen(false)}>
                {content.nav.languages}
              </Link>
              <Link href="#faq" className="block py-2 px-3 rounded-lg text-foreground/80 hover:bg-accent hover:text-primary transition" onClick={() => setMobileMenuOpen(false)}>
                {content.nav.faq}
              </Link>
              <Link href={navStoriesUrl} className="block py-2 px-3 rounded-lg text-foreground/80 hover:bg-accent hover:text-primary transition" onClick={() => setMobileMenuOpen(false)}>
                {content.nav.stories}
              </Link>
              <Link href={`/${locale}/feedback`} className="block py-2 px-3 rounded-lg text-foreground/80 hover:bg-accent hover:text-primary transition" onClick={() => setMobileMenuOpen(false)}>
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
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                {content.hero.badge}
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                {content.hero.title}{" "}
                <span className="text-magic-gradient">
                  {content.hero.titleHighlight}
                </span>{" "}
                {content.hero.titleEnd}
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                {content.hero.description}
              </p>
              <StoreBadges />
              <ul className="flex flex-wrap items-center gap-x-3 gap-y-2 pt-4">
                {[
                  { icon: Languages, label: t.featureLanguagesTitle },
                  { icon: Download, label: t.featureOfflineTitle },
                  { icon: ShieldCheck, label: t.trustAdFreeTitle },
                ].map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground"
                  >
                    <Icon className="h-4 w-4 text-brand-purple" aria-hidden="true" />
                    <span className="font-medium text-foreground">{label}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-purple to-brand-pink rounded-3xl blur-3xl opacity-20 animate-pulse"></div>
              <div className="relative rounded-3xl shadow-2xl overflow-hidden border-4 border-primary/20">
                <StoryReader
                  storyId={HERO_STORY_ID}
                  locale={locale}
                  posterSrc="/hero-poster.webp"
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

      <AppScreenshots className="bg-card/50" />

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
              {content.features.badge}
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {content.features.title}{" "}
              <span className="text-magic-gradient">
                {content.features.titleHighlight}
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                {content.benefits.badge}
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold">
                {content.benefits.title}{" "}
                <span className="text-magic-gradient">
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
                        <p className="text-muted-foreground">{benefit.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-purple to-brand-pink rounded-3xl blur-3xl opacity-20"></div>
              <Card className="relative border-4 border-primary/20 shadow-2xl">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{content.benefits.stats.totalStoriesLabel}</p>
                        <p className="text-3xl font-bold text-primary">{content.benefits.stats.totalStoriesValue}</p>
                      </div>
                      <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-magic-gradient"></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 pt-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-foreground">{content.benefits.stats.languagesValue}</p>
                        <p className="text-xs text-muted-foreground">{content.benefits.stats.languagesLabel}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-foreground">{content.benefits.stats.favoritesValue}</p>
                        <p className="text-xs text-muted-foreground">{content.benefits.stats.favoritesLabel}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-foreground">{content.benefits.stats.offlineValue}</p>
                        <p className="text-xs text-muted-foreground">{content.benefits.stats.offlineLabel}</p>
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
      <section id="languages" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
              {content.languages.badge}
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {content.languages.title}{" "}
              <span className="text-magic-gradient">
                {content.languages.titleHighlight}
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {content.languages.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {languages.map((lang) => (
              <Card key={lang.code} className="border-2 hover:border-primary/40 transition-all hover:shadow-lg cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="text-5xl mb-3">{lang.flag}</div>
                  <p className="font-semibold text-foreground">{lang.native}</p>
                  <p className="text-sm text-muted-foreground">{lang.english}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-card/50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
              {content.faq.badge}
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {content.faq.title}{" "}
              <span className="text-magic-gradient">
                {content.faq.titleHighlight}
              </span>
            </h2>
          </div>

          <FAQSection items={content.faq.items} />
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center gap-3 p-6">
              <div className="h-14 w-14 bg-brand-purple/10 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="h-7 w-7 text-brand-purple" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">{t.trustAdFreeTitle}</h3>
              <p className="text-muted-foreground text-sm">{t.trustAdFreeDesc}</p>
            </div>
            <div className="flex flex-col items-center gap-3 p-6">
              <div className="h-14 w-14 bg-brand-pink/10 rounded-2xl flex items-center justify-center">
                <Heart className="h-7 w-7 text-brand-pink" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">{t.trustSafeTitle}</h3>
              <p className="text-muted-foreground text-sm">{t.trustSafeDesc}</p>
            </div>
            <div className="flex flex-col items-center gap-3 p-6">
              <div className="h-14 w-14 bg-brand-gold/20 rounded-2xl flex items-center justify-center">
                <Sparkles className="h-7 w-7 text-[#C97A18]" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">{t.trustMadeWithLoveTitle}</h3>
              <p className="text-muted-foreground text-sm">{t.trustMadeWithLoveDesc}</p>
            </div>
          </div>
        </div>
      </section>

      <StoryCarousel className="bg-card/50" />

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-magic-gradient">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {content.cta.title}
          </h2>
          <p className="text-xl mb-8 text-white/80">
            {content.cta.subtitle}
          </p>
          <StoreBadges className="justify-center" variant="light" />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1B0A37] text-white/70 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <Link href={`/${locale}`} className="inline-flex flex-col items-center gap-1 mb-4 p-3 rounded-xl ring-1 ring-white/25">
                <img src="/website-icon.png" alt="Storywell" className="h-12 w-12 rounded-lg" />
                <span className="text-2xl font-bold text-magic-gradient">
                  Storywell
                </span>
              </Link>
              <p className="text-white/60 mb-4">
                {content.footer.description}
              </p>
              <p className="text-sm text-white/40">
                {content.footer.copyright}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">{content.footer.productLabel}</h3>
              <ul className="space-y-2">
                <li><Link href="#features" className="hover:text-brand-gold transition">{content.nav.features}</Link></li>
                <li><Link href="#languages" className="hover:text-brand-gold transition">{content.nav.languages}</Link></li>
                <li><Link href="#faq" className="hover:text-brand-gold transition">{content.nav.faq}</Link></li>
                <li><Link href={`/${locale}/feedback`} className="hover:text-brand-gold transition">{content.nav.feedback}</Link></li>
                <li>
                  {footerDownloadUrl ? (
                    <a
                      href={footerDownloadUrl}
                      className="hover:text-brand-gold transition"
                      {...linkProps(footerDownloadUrl)}
                    >
                      {content.footer.downloadLabel}
                    </a>
                  ) : (
                    <span className="text-white/60">{content.footer.downloadLabel}</span>
                  )}
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">{content.footer.contactLabel}</h3>
              <ul className="space-y-2">
                <li>
                  <a href="mailto:admin@dartim-media.com" className="hover:text-brand-gold transition">
                    admin@dartim-media.com
                  </a>
                </li>
                <li><Link href={`/${locale}/privacy`} className="hover:text-brand-gold transition">{t.cookiePrivacyPolicy}</Link></li>
                <li><Link href={`/${locale}/terms`} className="hover:text-brand-gold transition">{t.cookieTerms}</Link></li>
                <li><Link href={`/${locale}/impressum`} className="hover:text-brand-gold transition">{t.footerImpressum}</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
      </main>
    </div>
  );
}
