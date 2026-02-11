import { translations } from '../lib/i18n/translations';
import * as fs from 'fs';
import * as path from 'path';

// Map translation keys to content structure
function mapTranslationsToContent(locale: string, t: typeof translations.en) {
  return {
    locale: locale,
    nav: {
      features: t.navFeatures,
      languages: t.navLanguages,
      faq: t.navFAQ,
      reviews: t.navReviews,
      feedback: t.navFeedback,
      download: t.navDownload,
      downloadUrl: '',
    },
    hero: {
      badge: t.heroBadge,
      title: t.heroTitle,
      titleHighlight: t.heroTitleHighlight,
      titleEnd: t.heroTitleEnd,
      description: t.heroDescription,
      downloadCta: t.heroDownload,
      watchDemo: t.heroWatchDemo,
      downloadUrl: '',
      watchDemoUrl: '',
      lovedBy: t.heroLovedBy,
      worldwide: t.heroWorldwide,
      imageUrl: '',
    },
    features: {
      badge: t.featuresBadge,
      title: t.featuresTitle,
      titleHighlight: t.featuresTitleHighlight,
      subtitle: t.featuresSubtitle,
      items: [
        { icon: 'BookOpen', title: t.featureImmersiveTitle, description: t.featureImmersiveDesc },
        { icon: 'Globe', title: t.featureLanguagesTitle, description: t.featureLanguagesDesc },
        { icon: 'Download', title: t.featureOfflineTitle, description: t.featureOfflineDesc },
        { icon: 'Heart', title: t.featureFavoritesTitle, description: t.featureFavoritesDesc },
        { icon: 'Moon', title: t.featureDarkModeTitle, description: t.featureDarkModeDesc },
        { icon: 'Accessibility', title: t.featureAccessibilityTitle, description: t.featureAccessibilityDesc },
        { icon: 'Smartphone', title: t.featureCrossPlatformTitle, description: t.featureCrossPlatformDesc },
        { icon: 'Shield', title: t.featureSafeTitle, description: t.featureSafeDesc },
        { icon: 'Zap', title: t.featureFastTitle, description: t.featureFastDesc },
      ],
    },
    benefits: {
      badge: t.benefitsBadge,
      title: t.benefitsTitle,
      titleHighlight: t.benefitsTitleHighlight,
      stats: {
        totalStoriesLabel: t.benefitsTotalStories,
        totalStoriesValue: '127',
        languagesLabel: t.benefitsLanguages,
        languagesValue: '8',
        favoritesLabel: t.benefitsFavorites,
        favoritesValue: '45',
        offlineLabel: t.benefitsOffline,
        offlineValue: '12',
      },
      items: [
        { icon: 'Languages', title: t.benefitLanguageTitle, description: t.benefitLanguageDesc },
        { icon: 'Users', title: t.benefitFamilyTitle, description: t.benefitFamilyDesc },
        { icon: 'BookOpen', title: t.benefitScreenTimeTitle, description: t.benefitScreenTimeDesc },
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
      downloadAndroidUrl: '',
      downloadIosUrl: '',
    },
    footer: {
      description: t.footerDescription,
      copyright: t.footerCopyright,
      productLabel: t.footerProduct,
      contactLabel: t.footerContact,
      downloadLabel: t.footerDownload,
      downloadUrl: '',
    },
  };
}

// Export all translations to content structure
const contentStructure: Record<string, ReturnType<typeof mapTranslationsToContent>> = {};

for (const [locale, t] of Object.entries(translations)) {
  contentStructure[locale] = mapTranslationsToContent(locale, t as typeof translations.en);
}

// Write to admin-panel directory
const outputPath = path.join(__dirname, '../../myapp/admin-panel/translations-content.json');
fs.writeFileSync(outputPath, JSON.stringify(contentStructure, null, 2), 'utf-8');

console.log(`✅ Exported translations to: ${outputPath}`);
console.log(`   Locales: ${Object.keys(contentStructure).join(', ')}`);




