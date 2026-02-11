'use client';

import { useEffect } from 'react';
import { initAppCheck } from '@/lib/firebase/client';

/**
 * Initialises Firebase App Check as early as possible.
 * Rendered once by the locale layout so every page benefits
 * from an already-warm reCAPTCHA v3 token.
 */
export function FirebaseBootstrap() {
  useEffect(() => {
    initAppCheck();
  }, []);
  return null;
}

