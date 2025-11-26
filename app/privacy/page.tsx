'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { defaultLocale } from '@/lib/i18n/config';

export default function PrivacyRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace(`/${defaultLocale}/privacy`);
  }, [router]);
  
  return null;
}

