'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { localeNames } from "@/lib/i18n/config";
import { useParams } from "next/navigation";

export default function Home() {
  const t = useTranslations();
  const params = useParams();
  const locale = params?.locale as string || 'en';
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
                {t.navFeatures}
              </Link>
              <Link href="#languages" className="text-gray-700 hover:text-purple-600 transition">
                {t.navLanguages}
              </Link>
              <Link href="#faq" className="text-gray-700 hover:text-purple-600 transition">
                {t.navFAQ}
              </Link>
              <LanguageSwitcher />
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                {t.navDownload}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">
                {t.heroBadge}
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                {t.heroTitle}{" "}
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                  {t.heroTitleHighlight}
                </span>{" "}
                {t.heroTitleEnd}
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                {t.heroDescription}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg h-14 px-8">
                  <Download className="mr-2 h-5 w-5" />
                  {t.heroDownload}
                </Button>
                <Button size="lg" variant="outline" className="text-lg h-14 px-8 border-2 border-purple-600 text-purple-600 hover:bg-purple-50">
                  {t.heroWatchDemo}
                </Button>
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
                  <span className="font-semibold text-gray-900">{t.heroLovedBy}</span> {t.heroWorldwide}
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-3xl blur-3xl opacity-20 animate-pulse"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 border-4 border-purple-200">
                <div className="aspect-[4/3] bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 rounded-2xl flex items-center justify-center">
                  <BookOpen className="h-32 w-32 text-purple-400" />
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
              {t.featuresBadge}
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {t.featuresTitle}{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {t.featuresTitleHighlight}
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t.featuresSubtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-purple-300 transition-all hover:shadow-xl">
              <CardHeader>
                <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>{t.featureImmersiveTitle}</CardTitle>
                <CardDescription>
                  {t.featureImmersiveDesc}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-pink-300 transition-all hover:shadow-xl">
              <CardHeader>
                <div className="h-12 w-12 bg-pink-100 rounded-xl flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-pink-600" />
                </div>
                <CardTitle>{t.featureLanguagesTitle}</CardTitle>
                <CardDescription>
                  {t.featureLanguagesDesc}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-blue-300 transition-all hover:shadow-xl">
              <CardHeader>
                <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <Download className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>{t.featureOfflineTitle}</CardTitle>
                <CardDescription>
                  {t.featureOfflineDesc}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-green-300 transition-all hover:shadow-xl">
              <CardHeader>
                <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>{t.featureFavoritesTitle}</CardTitle>
                <CardDescription>
                  {t.featureFavoritesDesc}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-indigo-300 transition-all hover:shadow-xl">
              <CardHeader>
                <div className="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                  <Moon className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle>{t.featureDarkModeTitle}</CardTitle>
                <CardDescription>
                  {t.featureDarkModeDesc}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-orange-300 transition-all hover:shadow-xl">
              <CardHeader>
                <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                  <Accessibility className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>{t.featureAccessibilityTitle}</CardTitle>
                <CardDescription>
                  {t.featureAccessibilityDesc}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-teal-300 transition-all hover:shadow-xl">
              <CardHeader>
                <div className="h-12 w-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
                  <Smartphone className="h-6 w-6 text-teal-600" />
                </div>
                <CardTitle>{t.featureCrossPlatformTitle}</CardTitle>
                <CardDescription>
                  {t.featureCrossPlatformDesc}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-rose-300 transition-all hover:shadow-xl">
              <CardHeader>
                <div className="h-12 w-12 bg-rose-100 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-rose-600" />
                </div>
                <CardTitle>{t.featureSafeTitle}</CardTitle>
                <CardDescription>
                  {t.featureSafeDesc}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-violet-300 transition-all hover:shadow-xl">
              <CardHeader>
                <div className="h-12 w-12 bg-violet-100 rounded-xl flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-violet-600" />
                </div>
                <CardTitle>{t.featureFastTitle}</CardTitle>
                <CardDescription>
                  {t.featureFastDesc}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                {t.benefitsBadge}
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold">
                {t.benefitsTitle}{" "}
                <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  {t.benefitsTitleHighlight}
                </span>
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Languages className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{t.benefitLanguageTitle}</h3>
                    <p className="text-gray-600">
                      {t.benefitLanguageDesc}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{t.benefitFamilyTitle}</h3>
                    <p className="text-gray-600">
                      {t.benefitFamilyDesc}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{t.benefitScreenTimeTitle}</h3>
                    <p className="text-gray-600">
                      {t.benefitScreenTimeDesc}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-400 rounded-3xl blur-3xl opacity-20"></div>
              <Card className="relative border-4 border-green-200 shadow-2xl">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">{t.benefitsTotalStories}</p>
                        <p className="text-3xl font-bold text-purple-600">127</p>
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
                        <p className="text-2xl font-bold text-gray-900">8</p>
                        <p className="text-xs text-gray-600">{t.benefitsLanguages}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">45</p>
                        <p className="text-xs text-gray-600">{t.benefitsFavorites}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">12</p>
                        <p className="text-xs text-gray-600">{t.benefitsOffline}</p>
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
              {t.languagesBadge}
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {t.languagesTitle}{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {t.languagesTitleHighlight}
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t.languagesSubtitle}
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
              {t.faqBadge}
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {t.faqTitle}{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {t.faqTitleHighlight}
              </span>
            </h2>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="bg-white rounded-lg px-6 border-2">
              <AccordionTrigger className="text-left font-semibold hover:text-purple-600">
                {t.faq1Question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                {t.faq1Answer}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="bg-white rounded-lg px-6 border-2">
              <AccordionTrigger className="text-left font-semibold hover:text-purple-600">
                {t.faq2Question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                {t.faq2Answer}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="bg-white rounded-lg px-6 border-2">
              <AccordionTrigger className="text-left font-semibold hover:text-purple-600">
                {t.faq3Question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                {t.faq3Answer}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="bg-white rounded-lg px-6 border-2">
              <AccordionTrigger className="text-left font-semibold hover:text-purple-600">
                {t.faq4Question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                {t.faq4Answer}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="bg-white rounded-lg px-6 border-2">
              <AccordionTrigger className="text-left font-semibold hover:text-purple-600">
                {t.faq5Question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                {t.faq5Answer}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="bg-white rounded-lg px-6 border-2">
              <AccordionTrigger className="text-left font-semibold hover:text-purple-600">
                {t.faq6Question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                {t.faq6Answer}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {t.ctaTitle}
          </h2>
          <p className="text-xl mb-8 text-purple-100">
            {t.ctaSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 text-lg h-14 px-8">
              <Download className="mr-2 h-5 w-5" />
              {t.ctaDownloadAndroid}
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-lg h-14 px-8">
              <Download className="mr-2 h-5 w-5" />
              {t.ctaDownloadiOS}
            </Button>
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
                {t.footerDescription}
              </p>
              <p className="text-sm text-gray-500">
                {t.footerCopyright}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">{t.footerProduct}</h3>
              <ul className="space-y-2">
                <li><Link href="#features" className="hover:text-purple-400 transition">{t.navFeatures}</Link></li>
                <li><Link href="#languages" className="hover:text-purple-400 transition">{t.navLanguages}</Link></li>
                <li><Link href="#faq" className="hover:text-purple-400 transition">{t.navFAQ}</Link></li>
                <li><Link href="#" className="hover:text-purple-400 transition">{t.footerDownload}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">{t.footerContact}</h3>
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
    </div>
  );
}

