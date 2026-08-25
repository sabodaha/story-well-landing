'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "@/lib/i18n/use-translations";
import { useParams } from "next/navigation";

export default function PrivacyPolicy() {
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
          <h1 className="text-4xl font-bold mb-2 text-magic-gradient">
            {t.privacyTitle}
          </h1>
          <p className="text-muted-foreground mb-8">{t.privacyLastUpdated}</p>

          <div className="prose prose-lg max-w-none">
            <p className="text-foreground/80 leading-relaxed mb-6">
              {t.privacyIntro}
            </p>

            <p className="text-foreground/80 leading-relaxed mb-8">
              {t.privacyCommitment}
            </p>

            {/* Controller / Verantwortlicher - DSGVO requirement */}
            <div className="bg-primary/5 border border-border rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">{t.privacyControllerTitle}</h2>
              <p className="text-foreground/80 mb-3">{t.privacyControllerText}</p>
              <address className="not-italic text-foreground/80 leading-relaxed">
                <p className="font-semibold">{t.privacyControllerName}</p>
                <p>{t.privacyControllerAddress}</p>
                <p>{t.privacyControllerPhone}</p>
                <p>
                  {t.privacyControllerEmail.split('admin@dartim-media.com')[0]}
                  <a href="mailto:admin@dartim-media.com" className="text-primary hover:underline">
                    admin@dartim-media.com
                  </a>
                </p>
              </address>
            </div>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">{t.privacySection1Title}</h2>
            
            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">{t.privacySection1_1Title}</h3>
            <p className="text-foreground/80 leading-relaxed mb-4">
              {t.privacySection1_1Intro}
            </p>
            <ul className="list-disc pl-6 mb-4 text-foreground/80 space-y-2">
              <li>{t.privacySection1_1List1}</li>
              <li>{t.privacySection1_1List2}</li>
            </ul>
            <p className="text-foreground/80 leading-relaxed mb-4">{t.privacySection1_1Info}</p>
            <ul className="list-disc pl-6 mb-4 text-foreground/80 space-y-2">
              <li>{t.privacySection1_1InfoList1}</li>
              <li>{t.privacySection1_1InfoList2}</li>
              <li>{t.privacySection1_1InfoList3}</li>
            </ul>
            <p className="text-foreground/80 leading-relaxed mb-6">
              {t.privacySection1_1Note}
            </p>
            <p className="text-foreground/80 leading-relaxed mb-4">
              {t.privacyFeedbackNote}
            </p>
            <p className="text-foreground/80 leading-relaxed mb-6">
              {t.privacyFirebaseNote}
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">{t.privacySection1_2Title}</h3>
            <p className="text-foreground/80 leading-relaxed mb-4">
              {t.privacySection1_2Intro}
            </p>
            <ul className="list-disc pl-6 mb-4 text-foreground/80 space-y-2">
              <li>{t.privacySection1_2List1}</li>
              <li>{t.privacySection1_2List2}</li>
              <li>{t.privacySection1_2List3}</li>
              <li>{t.privacySection1_2List4}</li>
            </ul>
            <p className="text-foreground/80 leading-relaxed mb-4">{t.privacySection1_2NotCollect}</p>
            <ul className="list-disc pl-6 mb-6 text-foreground/80 space-y-2">
              <li>{t.privacySection1_2NotList1}</li>
              <li>{t.privacySection1_2NotList2}</li>
              <li>{t.privacySection1_2NotList3}</li>
              <li>{t.privacySection1_2NotList4}</li>
              <li>{t.privacySection1_2NotList5}</li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">{t.privacySection1_3Title}</h3>
            <p className="text-foreground/80 leading-relaxed mb-4">{t.privacySection1_3Intro}</p>
            <ul className="list-disc pl-6 mb-4 text-foreground/80 space-y-2">
              <li>{t.privacySection1_3List1}</li>
              <li>{t.privacySection1_3List2}</li>
              <li>{t.privacySection1_3List3}</li>
            </ul>
            <p className="text-foreground/80 leading-relaxed mb-6">
              {t.privacySection1_3Note}
            </p>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">{t.privacySection2Title}</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">{t.privacySection2Intro}</p>
            <ul className="list-disc pl-6 mb-4 text-foreground/80 space-y-2">
              <li>{t.privacySection2List1}</li>
              <li>{t.privacySection2List2}</li>
              <li>{t.privacySection2List3}</li>
              <li>{t.privacySection2List4}</li>
              <li>{t.privacySection2List5}</li>
            </ul>
            <p className="text-foreground/80 leading-relaxed mb-4">{t.privacySection2NotUse}</p>
            <ul className="list-disc pl-6 mb-6 text-foreground/80 space-y-2">
              <li>{t.privacySection2NotList1}</li>
              <li>{t.privacySection2NotList2}</li>
            </ul>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">{t.privacySection3Title}</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              {t.privacySection3Intro}
            </p>
            <ul className="list-disc pl-6 mb-4 text-foreground/80 space-y-2">
              <li>{t.privacySection3List1}</li>
              <li>{t.privacySection3List2}</li>
            </ul>
            <p className="text-foreground/80 leading-relaxed mb-6">
              {t.privacySection3Note}
            </p>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">{t.privacySection4Title}</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              {t.privacySection4Intro}
            </p>
            <ul className="list-disc pl-6 mb-4 text-foreground/80 space-y-2">
              <li>{t.privacySection4List1}</li>
              <li>{t.privacySection4List2}</li>
              <li>{t.privacySection4List3}</li>
              <li>{t.privacySection4List4}</li>
            </ul>
            <p className="text-foreground/80 leading-relaxed mb-4">
              {t.privacySection4Security}
            </p>
            <p className="text-foreground/80 leading-relaxed mb-6">
              {t.privacySection4Note}
            </p>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">{t.privacySection5Title}</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              {t.privacySection5Intro}
            </p>
            <ul className="list-disc pl-6 mb-4 text-foreground/80 space-y-2">
              <li>{t.privacySection5List1}</li>
              <li>{t.privacySection5List2}</li>
              <li>{t.privacySection5List3}</li>
            </ul>
            <p className="text-foreground/80 leading-relaxed mb-6">
              {t.privacySection5Note}
            </p>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">{t.privacySection6Title}</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              {t.privacySection6Intro}
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">{t.privacySection6_1Title}</h3>
            <p className="text-foreground/80 leading-relaxed mb-4">{t.privacySection6_1Intro}</p>
            <ul className="list-disc pl-6 mb-4 text-foreground/80 space-y-2">
              <li>{t.privacySection6_1List1}</li>
              <li>{t.privacySection6_1List2}</li>
              <li>{t.privacySection6_1List3}</li>
            </ul>
            <p className="text-foreground/80 leading-relaxed mb-6">
              {t.privacySection6_1Note}
            </p>

            <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">{t.privacySection6_2Title}</h3>
            <p className="text-foreground/80 leading-relaxed mb-4">{t.privacySection6_2Intro}</p>
            <ul className="list-disc pl-6 mb-4 text-foreground/80 space-y-2">
              <li>{t.privacySection6_2List1}</li>
              <li>{t.privacySection6_2List2}</li>
              <li>{t.privacySection6_2List3}</li>
            </ul>

            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
              <p className="text-foreground font-semibold mb-2">{t.privacySection6NotShare}</p>
              <ul className="list-disc pl-6 text-foreground/80 space-y-1">
                <li>{t.privacySection6NotList1}</li>
                <li>{t.privacySection6NotList2}</li>
                <li>{t.privacySection6NotList3}</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">{t.privacySection7Title}</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              {t.privacySection7Intro}
            </p>
            <ul className="list-disc pl-6 mb-6 text-foreground/80 space-y-2">
              <li>{t.privacySection7List1}</li>
              <li>{t.privacySection7List2}</li>
              <li>{t.privacySection7List3}</li>
            </ul>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">{t.privacySection8Title}</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              {t.privacySection8Intro}
            </p>
            <ul className="list-disc pl-6 mb-4 text-foreground/80 space-y-2">
              <li>{t.privacySection8List1}</li>
              <li>{t.privacySection8List2}</li>
              <li>{t.privacySection8List3}</li>
              <li>{t.privacySection8List4}</li>
              <li>{t.privacySection8List5}</li>
              <li>{t.privacySection8List6}</li>
              <li>{t.privacySection8List7}</li>
            </ul>
            <p className="text-foreground/80 leading-relaxed mb-6">
              {t.privacySection8Contact}{" "}
              <a href="mailto:admin@dartim-media.com" className="text-primary hover:text-primary">
                📩 admin@dartim-media.com
              </a>
            </p>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">{t.privacySection9Title}</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              {t.privacySection9Intro}
            </p>
            <p className="text-foreground/80 leading-relaxed mb-6">
              {t.privacySection9Note}
            </p>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">{t.privacySection10Title}</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              {t.privacySection10Intro}
            </p>
            <p className="text-foreground/80 leading-relaxed mb-6">
              {t.privacySection10Note}
            </p>

            {/* Third-Party Services - DSGVO requirement */}
            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">{t.privacyServicesTitle}</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">{t.privacyServicesIntro}</p>
            <ul className="list-disc pl-6 mb-6 text-foreground/80 space-y-3">
              <li>{t.privacyServiceFirebase}</li>
              <li>{t.privacyServiceGA}</li>
              <li>{t.privacyServiceCloudflare}</li>
              <li>{t.privacyServiceRecaptcha}</li>
            </ul>

            <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">{t.privacySection11Title}</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              {t.privacySection11Intro}
            </p>
            <div className="bg-primary/5 border border-border rounded-lg p-6">
              <p className="text-foreground/80 mb-2">
                {t.privacySection11Email}{" "}
                <a href="mailto:admin@dartim-media.com" className="text-primary hover:text-primary font-semibold">
                  admin@dartim-media.com
                </a>
              </p>
              <p className="text-foreground/80">
                {t.privacySection11Website}{" "}
                <a href="https://dartim-media.com/" className="text-primary hover:text-primary font-semibold">
                  https://dartim-media.com/
                </a>
              </p>
            </div>
            <p className="text-foreground/80 leading-relaxed mt-4">
              {t.privacySection11Response}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
