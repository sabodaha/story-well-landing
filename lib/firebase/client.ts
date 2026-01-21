'use client';

import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAppCheck, getToken, initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

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

export const getFirebaseApp = (): FirebaseApp => {
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
};

export const getFirebaseAuth = () => getAuth(getFirebaseApp());

export const getGoogleProvider = () => new GoogleAuthProvider();

export const initAppCheck = () => {
  if (appCheckInitialized || typeof window === "undefined") return;
  const siteKey = process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY;
  if (!siteKey) return;

  initializeAppCheck(getFirebaseApp(), {
    provider: new ReCaptchaV3Provider(siteKey),
    isTokenAutoRefreshEnabled: true,
  });

  appCheckInitialized = true;
};

export const getAppCheckToken = async () => {
  if (typeof window === "undefined") return null;

  initAppCheck();

  try {
    const appCheck = getAppCheck(getFirebaseApp());
    const { token } = await getToken(appCheck, false);
    return token;
  } catch {
    return null;
  }
};

