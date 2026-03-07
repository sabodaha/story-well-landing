'use client';

import { useState, useEffect } from 'react';

export type Platform = 'ios' | 'android' | 'desktop';

export function usePlatform(): Platform {
  const [platform, setPlatform] = useState<Platform>('desktop');

  useEffect(() => {
    const ua = navigator.userAgent || '';
    if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
      setPlatform('ios');
    } else if (/android/i.test(ua)) {
      setPlatform('android');
    }
  }, []);

  return platform;
}

export function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent || '';
  if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    return 'ios';
  }
  if (/android/i.test(ua)) return 'android';
  return 'desktop';
}
