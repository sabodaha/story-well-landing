'use client';

import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { AppCheck, getToken, initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let appCheckInitialized = false;
let appCheckInstance: AppCheck | null = null;

export const getFirebaseApp = (): FirebaseApp => {
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
};

export const getFirebaseAuth = () => getAuth(getFirebaseApp());

export const getGoogleProvider = () => new GoogleAuthProvider();

const ensureAppCheck = () => {
  if (appCheckInstance || typeof window === "undefined") return appCheckInstance;
  const siteKey = process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY;
  if (!siteKey) return null;

  appCheckInstance = initializeAppCheck(getFirebaseApp(), {
    provider: new ReCaptchaV3Provider(siteKey),
    isTokenAutoRefreshEnabled: true,
  });
  appCheckInitialized = true;

  return appCheckInstance;
};

export const initAppCheck = () => {
  if (appCheckInitialized) return;
  ensureAppCheck();
};

export const getAppCheckToken = async () => {
  if (typeof window === "undefined") return null;

  try {
    const appCheck = ensureAppCheck();
    if (!appCheck) return null;
    const { token } = await getToken(appCheck, false);
    return token;
  } catch {
    return null;
  }
};

