'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "@/lib/i18n/use-translations";
import { useParams } from "next/navigation";

export default function TermsOfService() {
  const t = useTranslations();
  const params = useParams();
  const locale = params?.locale as string || 'en';

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-purple-100">
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
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {t.termsTitle}
          </h1>
          <p className="text-gray-600 mb-8">{t.termsLastUpdated}</p>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">
              {t.termsIntro}
            </p>

            <p className="text-gray-700 leading-relaxed mb-8">
              <strong>{t.termsAgreement}</strong>
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{t.termsSection1Title}</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {t.termsSection1Intro}
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">{t.termsSection1Agree}</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>{t.termsSection1List1}</li>
              <li>{t.termsSection1List2}</li>
              <li>{t.termsSection1List3}</li>
              <li>{t.termsSection1List4}</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-6">
              {t.termsSection1Note}
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{t.termsSection2Title}</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {t.termsSection2Intro}
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>{t.termsSection2List1}</li>
              <li>{t.termsSection2List2}</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-6">
              {t.termsSection2Note}
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{t.termsSection3Title}</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {t.termsSection3Intro}
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">{t.termsSection3Agree}</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>{t.termsSection3List1}</li>
              <li>{t.termsSection3List2}</li>
              <li>{t.termsSection3List3}</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-6">
              <strong>{t.termsSection3Note}</strong>
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{t.termsSection4Title}</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {t.termsSection4Intro}
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>{t.termsSection4List1}</li>
              <li>{t.termsSection4List2}</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-6">
              {t.termsSection4Note}
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{t.termsSection5Title}</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {t.termsSection5Intro}
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>{t.termsSection5List1}</li>
              <li>{t.termsSection5List2}</li>
              <li>{t.termsSection5List3}</li>
              <li>{t.termsSection5List4}</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              {t.termsSection5NotResponsible}
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>{t.termsSection5NotList1}</li>
              <li>{t.termsSection5NotList2}</li>
              <li>{t.termsSection5NotList3}</li>
              <li>{t.termsSection5NotList4}</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-6">
              <strong>{t.termsSection5Note}</strong>
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{t.termsSection6Title}</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {t.termsSection6Intro}
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>{t.termsSection6List1}</li>
              <li>{t.termsSection6List2}</li>
              <li>{t.termsSection6List3}</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-6">
              {t.termsSection6Note}
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{t.termsSection7Title}</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {t.termsSection7Intro}
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">{t.termsSection7Disclaim}</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>{t.termsSection7List1}</li>
              <li>{t.termsSection7List2}</li>
              <li>{t.termsSection7List3}</li>
              <li>{t.termsSection7List4}</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-6">
              <strong>{t.termsSection7Note}</strong>
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{t.termsSection8Title}</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {t.termsSection8Intro}
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>{t.termsSection8List1}</li>
              <li>{t.termsSection8List2}</li>
              <li>{t.termsSection8List3}</li>
              <li>{t.termsSection8List4}</li>
              <li>{t.termsSection8List5}</li>
              <li>{t.termsSection8List6}</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-6">
              {t.termsSection8Note}
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{t.termsSection9Title}</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {t.termsSection9Intro}
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>{t.termsSection9List1}</li>
              <li>{t.termsSection9List2}</li>
              <li>{t.termsSection9List3}</li>
              <li>{t.termsSection9List4}</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{t.termsSection10Title}</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {t.termsSection10Intro}
            </p>
            <p className="text-gray-700 leading-relaxed mb-6">
              {t.termsSection10Note}
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{t.termsSection11Title}</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {t.termsSection11Intro}
            </p>
            <p className="text-gray-700 leading-relaxed mb-6">
              {t.termsSection11Note}
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{t.termsSection12Title}</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              {t.termsSection12Intro}
            </p>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <p className="text-gray-700 mb-2">
                {t.termsSection12Email}{" "}
                <a href="mailto:admin@dartim-media.com" className="text-purple-600 hover:text-purple-700 font-semibold">
                  admin@dartim-media.com
                </a>
              </p>
              <p className="text-gray-700">
                {t.termsSection12Website}{" "}
                <a href="https://dartim-media.com/" className="text-purple-600 hover:text-purple-700 font-semibold">
                  https://dartim-media.com/
                </a>
              </p>
            </div>
            <p className="text-gray-700 leading-relaxed mt-4">
              {t.termsSection12Response}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
