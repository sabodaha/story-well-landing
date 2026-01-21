'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, CheckCircle2, Loader2, MessageCircle, RefreshCcw, ShieldCheck, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslations } from "@/lib/i18n/use-translations";
import { getAppCheckToken, initAppCheck } from "@/lib/firebase/client";
import { cn } from "@/lib/utils";

type Opinion = {
  id?: string | number;
  name?: string;
  storyTitle?: string;
  rating?: number;
  message: string;
  createdAt?: string;
};

const ratingOptions = [1, 2, 3, 4, 5];

const extractOpinions = (payload: unknown): unknown[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (typeof payload === "object" && payload !== null) {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.items)) return record.items;
    if (Array.isArray(record.data)) return record.data;
    if (Array.isArray(record.opinions)) return record.opinions;
  }
  return [];
};

const normalizeOpinion = (entry: unknown): Opinion | null => {
  if (!entry || typeof entry !== "object") return null;
  const record = entry as Record<string, unknown>;
  const message = String(record.message ?? record.text ?? record.comment ?? "").trim();
  if (!message) return null;
  const ratingValue = Number(record.rating ?? record.stars ?? record.score ?? 0);

  return {
    id: (record.id ?? record._id ?? record.slug ?? message.slice(0, 12)) as string | number,
    name: (record.name ?? record.author ?? record.userName ?? record.username) as string | undefined,
    storyTitle: (record.storyTitle ?? record.story ?? record.story_name ?? record.storyTitleName) as string | undefined,
    rating: Number.isFinite(ratingValue) && ratingValue > 0 ? ratingValue : undefined,
    message,
    createdAt: (record.createdAt ?? record.created_at ?? record.date ?? record.submittedAt) as string | undefined,
  };
};

const buildUrlWithLocale = (rawUrl: string, locale: string) => {
  try {
    const baseUrl = rawUrl.startsWith("http") ? rawUrl : new URL(rawUrl, window.location.origin).toString();
    const url = new URL(baseUrl);
    if (!url.searchParams.has("locale")) {
      url.searchParams.set("locale", locale);
    }
    return url.toString();
  } catch {
    return rawUrl;
  }
};

export default function FeedbackPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const feedbackApiBaseUrl = process.env.NEXT_PUBLIC_FEEDBACK_API_BASE_URL || "";
  const feedbackListUrl =
    (feedbackApiBaseUrl ? `${feedbackApiBaseUrl}/opinions` : "") ||
    process.env.NEXT_PUBLIC_FEEDBACK_LIST_URL ||
    "";
  const feedbackSubmitUrl =
    (feedbackApiBaseUrl ? `${feedbackApiBaseUrl}/opinions` : "") ||
    process.env.NEXT_PUBLIC_FEEDBACK_SUBMIT_URL ||
    "";

  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [storyTitle, setStoryTitle] = useState("");
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const listConfigMissing = !feedbackListUrl;
  const submitConfigMissing = !feedbackSubmitUrl;

  const formattedOpinions = useMemo(() => {
    return opinions.slice().sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [opinions]);

  const formatDate = useCallback(
    (value?: string) => {
      if (!value) return null;
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return null;
      return date.toLocaleDateString(locale);
    },
    [locale]
  );

  const loadOpinions = useCallback(async () => {
    if (!feedbackListUrl) {
      setOpinions([]);
      return;
    }

    setIsLoadingList(true);
    setListError(null);

    try {
      const url = buildUrlWithLocale(feedbackListUrl, locale);
      const appCheckToken = await getAppCheckToken();
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          ...(appCheckToken ? { "X-Firebase-AppCheck": appCheckToken } : {}),
        },
      });
      if (!response.ok) {
        throw new Error("failed-to-load");
      }
      const payload = await response.json();
      const normalized = extractOpinions(payload)
        .map(normalizeOpinion)
        .filter((entry): entry is Opinion => Boolean(entry));

      setOpinions(normalized);
    } catch (error) {
      setListError("load");
    } finally {
      setIsLoadingList(false);
    }
  }, [feedbackListUrl, locale]);

  useEffect(() => {
    initAppCheck();
    loadOpinions();
  }, [loadOpinions]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitSuccess(false);
    setSubmitError(null);

    if (!message.trim() || rating < 1) {
      setSubmitError(t.feedbackValidationMessage);
      return;
    }

    if (honeypot) {
      setSubmitSuccess(true);
      setName("");
      setStoryTitle("");
      setMessage("");
      setRating(5);
      return;
    }

    if (!feedbackSubmitUrl) {
      setSubmitError(t.feedbackMissingConfig);
      return;
    }

    setIsSubmitting(true);

    try {
      const appCheckToken = await getAppCheckToken();
      const response = await fetch(feedbackSubmitUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(appCheckToken ? { "X-Firebase-AppCheck": appCheckToken } : {}),
        },
        body: JSON.stringify({
          name: name.trim() || undefined,
          storyTitle: storyTitle.trim() || undefined,
          rating,
          message: message.trim(),
          locale,
          source: "landing-page",
        }),
      });

      if (!response.ok) {
        throw new Error("submit-failed");
      }

      setSubmitSuccess(true);
      setName("");
      setStoryTitle("");
      setMessage("");
      setRating(5);
    } catch (error) {
      setSubmitError(t.feedbackFormError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-blue-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-purple-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between gap-4">
          <Link href={`/${locale}`}>
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t.backToHome}
            </Button>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <Badge className="mb-4 bg-purple-100 text-purple-700 hover:bg-purple-200">
            {t.feedbackBadge}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold">
            {t.feedbackTitle}{" "}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {t.feedbackTitleHighlight}
            </span>{" "}
            {t.feedbackTitleEnd}
          </h1>
          <p className="text-lg text-gray-600 mt-4 max-w-3xl mx-auto">
            {t.feedbackSubtitle}
          </p>
        </div>

        {(listConfigMissing || submitConfigMissing) && (
          <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 mt-0.5" />
            <p className="text-sm">{t.feedbackMissingConfig}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <Card className="border-2 border-purple-200 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-purple-600" />
                {t.feedbackFormTitle}
              </CardTitle>
              <CardDescription>{t.feedbackFormDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="absolute -left-[9999px] top-auto h-0 w-0 overflow-hidden">
                  <label htmlFor="company-website">Website</label>
                  <input
                    id="company-website"
                    type="text"
                    value={honeypot}
                    onChange={(event) => setHoneypot(event.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {t.feedbackFormNameLabel}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder={t.feedbackFormNamePlaceholder}
                    className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {t.feedbackFormStoryLabel}
                  </label>
                  <input
                    type="text"
                    value={storyTitle}
                    onChange={(event) => setStoryTitle(event.target.value)}
                    placeholder={t.feedbackFormStoryPlaceholder}
                    className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {t.feedbackFormRatingLabel}
                  </label>
                  <div className="mt-2 flex items-center gap-2">
                    {ratingOptions.map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRating(value)}
                        className={cn(
                          "rounded-full p-1 transition hover:bg-purple-50",
                          value === rating ? "bg-purple-50" : ""
                        )}
                        aria-pressed={value === rating}
                        aria-label={`${t.feedbackFormRatingLabel}: ${value}`}
                      >
                        <Star
                          className={cn(
                            "h-5 w-5",
                            value <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          )}
                        />
                      </button>
                    ))}
                    <span className="text-sm text-gray-500">{rating}/5</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {t.feedbackFormMessageLabel}
                  </label>
                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder={t.feedbackFormMessagePlaceholder}
                    rows={5}
                    className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none"
                  />
                </div>

                {submitError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {submitError}
                  </div>
                )}
                {submitSuccess && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    {t.feedbackFormSuccess}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  disabled={isSubmitting || submitConfigMissing}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t.feedbackFormSubmitting}
                    </span>
                  ) : (
                    t.feedbackFormSubmit
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200 shadow-xl">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div>
                <CardTitle>{t.feedbackListTitle}</CardTitle>
                <CardDescription>{t.feedbackListDescription}</CardDescription>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={loadOpinions}
                disabled={isLoadingList || listConfigMissing}
              >
                <RefreshCcw className={cn("h-4 w-4", isLoadingList ? "animate-spin" : "")} />
                {t.feedbackListRefresh}
              </Button>
            </CardHeader>
            <CardContent>
              {listConfigMissing ? (
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                  {t.feedbackMissingConfig}
                </div>
              ) : isLoadingList ? (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t.feedbackListLoading}
                </div>
              ) : listError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {t.feedbackListError}
                </div>
              ) : formattedOpinions.length === 0 ? (
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                  {t.feedbackListEmpty}
                </div>
              ) : (
                <div className="space-y-4">
                  {formattedOpinions.map((opinion) => (
                    <div
                      key={opinion.id}
                      className="rounded-xl border border-purple-100 bg-white/70 p-4 shadow-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {opinion.name?.trim() || t.feedbackAnonymous}
                          </p>
                          {opinion.storyTitle && (
                            <p className="text-sm text-gray-500">
                              {t.feedbackStoryLabel}: {opinion.storyTitle}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {typeof opinion.rating === "number" && (
                            <div className="flex items-center gap-1">
                              {ratingOptions.map((value) => (
                                <Star
                                  key={`${opinion.id}-star-${value}`}
                                  className={cn(
                                    "h-4 w-4",
                                    value <= opinion.rating! ? "fill-yellow-400 text-yellow-400" : "text-gray-200"
                                  )}
                                />
                              ))}
                            </div>
                          )}
                          {formatDate(opinion.createdAt) && (
                            <span className="text-xs text-gray-400">{formatDate(opinion.createdAt)}</span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{opinion.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-10">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
            <div className="flex items-center gap-2 mb-3 text-emerald-700 font-semibold">
              <ShieldCheck className="h-5 w-5" />
              {t.feedbackGuidelinesTitle}
            </div>
            <ul className="text-sm text-emerald-900 space-y-2 list-disc pl-5">
              <li>{t.feedbackGuideline1}</li>
              <li>{t.feedbackGuideline2}</li>
              <li>{t.feedbackGuideline3}</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-purple-200 bg-white p-6">
            <h3 className="font-semibold text-gray-900 mb-2">{t.feedbackModerationNote}</h3>
            <p className="text-sm text-gray-600">{t.feedbackPrivacyNote}</p>
          </div>
        </div>
      </main>
    </div>
  );
}

