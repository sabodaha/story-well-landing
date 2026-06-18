'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "@/lib/i18n/use-translations";
import { useParams } from "next/navigation";

export default function Impressum() {
  const t = useTranslations();
  const params = useParams();
  const locale = params?.locale as string || 'en';

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-purple/5 via-background to-brand-pink/5">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href={`/${locale}`}>
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t.backToHome}
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl font-bold mb-8 text-magic-gradient">
            {t.impressumTitle}
          </h1>

          <div className="prose prose-lg max-w-none">
            {/* Operator note */}
            <p className="text-foreground/80 font-semibold mb-8 text-lg">
              {t.impressumOperatorNote}
            </p>

            {/* Legal identity */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">{t.impressumAccordingTo}</h2>
              <address className="not-italic text-foreground/80 leading-relaxed">
                <p className="font-semibold">{t.impressumName}</p>
                <p>{t.impressumBrand}</p>
                <p>{t.impressumStreet}</p>
                <p>{t.impressumCity}</p>
                <p>{t.impressumCountry}</p>
              </address>
            </section>

            {/* Contact */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">{t.impressumContactTitle}</h2>
              <p className="text-foreground/80">{t.impressumPhone}</p>
              <p className="text-foreground/80">
                {t.impressumEmail.split('admin@dartim-media.com')[0]}
                <a href="mailto:admin@dartim-media.com" className="text-primary hover:underline">
                  admin@dartim-media.com
                </a>
              </p>
            </section>

            {/* Editorially responsible */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">{t.impressumEditorialTitle}</h2>
              <address className="not-italic text-foreground/80 leading-relaxed">
                <p className="font-semibold">{t.impressumName}</p>
                <p>{t.impressumStreet}</p>
                <p>{t.impressumCity}</p>
                <p>{t.impressumCountry}</p>
              </address>
            </section>

            {/* Online dispute resolution */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">{t.impressumDisputeTitle}</h2>
              <p className="text-foreground/80 leading-relaxed">
                {t.impressumDisputeText.split('https://ec.europa.eu/consumers/odr/')[0]}
                <a
                  href="https://ec.europa.eu/consumers/odr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  https://ec.europa.eu/consumers/odr/
                </a>
                {t.impressumDisputeText.split('https://ec.europa.eu/consumers/odr/')[1]}
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
