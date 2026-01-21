'use client';

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { defaultLocale } from "@/lib/i18n/config";

export default function ReviewsRedirect() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || defaultLocale;

  useEffect(() => {
    router.replace(`/${locale}/feedback`);
  }, [router, locale]);

  return null;
}
