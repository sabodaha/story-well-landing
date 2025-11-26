'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { defaultLocale } from '@/lib/i18n/config';

export default function TermsRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace(`/${defaultLocale}/terms`);
  }, [router]);
  
  return null;
}

