'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { defaultLocale } from "@/lib/i18n/config";

export default function FeedbackRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/${defaultLocale}/feedback`);
  }, [router]);

  return null;
}



