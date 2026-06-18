'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { onAuthStateChanged, signInWithPopup, signOut, User } from "firebase/auth";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  RefreshCcw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslations } from "@/lib/i18n/use-translations";
import { getAppCheckToken, getFirebaseAuth, getGoogleProvider, initAppCheck } from "@/lib/firebase/client";
import { cn } from "@/lib/utils";

type AdminOpinion = {
  id: string;
  name?: string | null;
  storyTitle?: string | null;
  rating?: number | null;
  message: string;
  locale?: string | null;
  createdAt?: string | null;
  status?: string;
};

const buildApiUrl = (baseUrl: string, path: string) => {
  if (!baseUrl) return "";
  return `${baseUrl.replace(/\/$/, "")}${path}`;
};

export default function AdminOpinionsPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const [auth, setAuth] = useState<ReturnType<typeof getFirebaseAuth> | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [opinions, setOpinions] = useState<AdminOpinion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apiBaseUrl = process.env.NEXT_PUBLIC_FEEDBACK_API_BASE_URL || "";
  const pendingUrl = useMemo(() => buildApiUrl(apiBaseUrl, "/opinions/pending"), [apiBaseUrl]);
  const updateBaseUrl = useMemo(() => buildApiUrl(apiBaseUrl, "/opinions"), [apiBaseUrl]);

  const loadOpinions = useCallback(async () => {
    if (!pendingUrl) {
      setError(t.adminMissingConfig);
      return;
    }
    if (!user) {
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const idToken = await user.getIdToken();
      const appCheckToken = await getAppCheckToken();
      const response = await fetch(`${pendingUrl}?limit=50`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
          ...(appCheckToken ? { "X-Firebase-AppCheck": appCheckToken } : {}),
        },
      });

      if (response.status === 403) {
        setError(t.adminNotAuthorized);
        setOpinions([]);
        return;
      }

      if (!response.ok) {
        throw new Error("load-failed");
      }

      const payload = (await response.json()) as AdminOpinion[];
      setOpinions(payload || []);
    } catch (err) {
      setError(t.adminError);
    } finally {
      setIsLoading(false);
    }
  }, [pendingUrl, t.adminError, t.adminMissingConfig, t.adminNotAuthorized, user]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    initAppCheck();
    const firebaseAuth = getFirebaseAuth();
    setAuth(firebaseAuth);
    const unsubscribe = onAuthStateChanged(firebaseAuth, (nextUser) => {
      setUser(nextUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadOpinions();
    }
  }, [loadOpinions, user]);

  const handleSignIn = async () => {
    if (!auth) return;
    setError(null);
    try {
      await signInWithPopup(auth, getGoogleProvider());
    } catch {
      setError(t.adminError);
    }
  };

  const handleSignOut = async () => {
    if (!auth) return;
    await signOut(auth);
    setOpinions([]);
  };

  const handleUpdate = async (id: string, status: "approved" | "rejected") => {
    if (!user) return;
    if (!auth) {
      setError(t.adminMissingConfig);
      return;
    }
    if (!updateBaseUrl) {
      setError(t.adminMissingConfig);
      return;
    }
    setIsUpdating(id);
    setError(null);

    try {
      const idToken = await user.getIdToken();
      const appCheckToken = await getAppCheckToken();
      const response = await fetch(`${updateBaseUrl}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
          ...(appCheckToken ? { "X-Firebase-AppCheck": appCheckToken } : {}),
        },
        body: JSON.stringify({ status }),
      });

      if (response.status === 403) {
        setError(t.adminNotAuthorized);
        return;
      }

      if (!response.ok) {
        throw new Error("update-failed");
      }

      setOpinions((prev) => prev.filter((item) => item.id !== id));
    } catch {
      setError(t.adminError);
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-purple/5 via-background to-brand-pink/5">
      <header className="bg-white/80 backdrop-blur-md border-b border-border">
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
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-accent">
            {t.adminOpinionsBadge}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">{t.adminOpinionsTitle}</h1>
          <p className="text-lg text-muted-foreground">{t.adminOpinionsSubtitle}</p>
        </div>

        {!user ? (
          <Card className="border-2 border-border shadow-xl max-w-xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                {t.adminSignIn}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                className="w-full bg-magic-gradient hover:opacity-90"
                onClick={handleSignIn}
              >
                {t.adminSignIn}
              </Button>
              {error && (
                <div className="rounded-lg border border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 border-border shadow-xl">
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>{t.adminOpinionsTitle}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t.adminSignedInAs}: {user.email}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="outline" className="gap-2" onClick={loadOpinions}>
                  <RefreshCcw className={cn("h-4 w-4", isLoading ? "animate-spin" : "")} />
                  {t.adminRefresh}
                </Button>
                <Button variant="ghost" onClick={handleSignOut}>
                  {t.adminSignOut}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 rounded-lg border border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  {error}
                </div>
              )}

              {isLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t.adminLoading}
                </div>
              ) : opinions.length === 0 ? (
                <div className="rounded-lg border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
                  {t.adminNoPending}
                </div>
              ) : (
                <div className="space-y-4">
                  {opinions.map((opinion) => (
                    <div
                      key={opinion.id}
                      className="rounded-xl border border-border bg-white/70 p-4 shadow-sm"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-1">
                          <p className="font-semibold text-foreground">
                            {t.adminColumnName}: {opinion.name || t.feedbackAnonymous}
                          </p>
                          {opinion.storyTitle && (
                            <p className="text-sm text-muted-foreground">
                              {t.adminColumnStory}: {opinion.storyTitle}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            {t.adminColumnLocale}: {opinion.locale || "-"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {t.adminColumnRating}: {opinion.rating ?? "-"}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            className="gap-2 bg-success hover:opacity-90"
                            onClick={() => handleUpdate(opinion.id, "approved")}
                            disabled={isUpdating === opinion.id}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            {t.adminApprove}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2 border-destructive text-destructive hover:bg-destructive/10"
                            onClick={() => handleUpdate(opinion.id, "rejected")}
                            disabled={isUpdating === opinion.id}
                          >
                            <XCircle className="h-4 w-4" />
                            {t.adminReject}
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3 text-sm text-foreground/80 leading-relaxed">
                        {t.adminColumnMessage}: {opinion.message}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

