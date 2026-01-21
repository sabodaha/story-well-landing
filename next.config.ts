import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Cloudflare Pages configuration
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: "AIzaSyAI8gczz5STotQ1bZjcazhu7z3eDUgFD2A",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "kidsstoriesapp.firebaseapp.com",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: "kidsstoriesapp",
    NEXT_PUBLIC_FIREBASE_APP_ID: "1:643688636511:web:3bdead44d1fa1a16dfbbea",
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "kidsstoriesapp.firebasestorage.app",
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "643688636511",
    NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY: "6Ld5zFEsAAAAAMDEbTgdzzLyZJoMxrEQijNuLc7l",
    NEXT_PUBLIC_FEEDBACK_API_BASE_URL: "https://opinionboard-643688636511.us-central1.run.app",
  },
};

export default nextConfig;
