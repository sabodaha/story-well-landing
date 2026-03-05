'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { defaultLocale } from '@/lib/i18n/config';

export default function ImpressumRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/${defaultLocale}/impressum`);
  }, [router]);

  return null;
}
