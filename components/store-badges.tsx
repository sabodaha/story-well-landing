'use client';

type BadgeVariant = "default" | "light";

const APP_STORE_URL = "https://apps.apple.com/app/id6759845142";
const GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=com.dartim_media.storywell";

function AppStoreBadge({ className = "", variant = "default" }: { className?: string; variant?: BadgeVariant }) {
  const light = variant === "light";
  const bgFill = light ? "#fff" : "url(#app-bg)";
  const fgFill = light ? "#1f2937" : "#fff";

  return (
    <svg className={className} viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Download on the App Store">
      {!light && (
        <defs>
          <linearGradient id="app-bg" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#992ed1" />
            <stop offset="100%" stopColor="#e91370" />
          </linearGradient>
        </defs>
      )}
      <rect width="120" height="40" rx="8" fill={bgFill} />
      <g fill={fgFill}>
        <path d="M24.77 20.3a4.95 4.95 0 0 1 2.36-4.15 5.07 5.07 0 0 0-3.99-2.16c-1.68-.18-3.31 1.01-4.17 1.01-.87 0-2.19-.99-3.62-.96a5.33 5.33 0 0 0-4.49 2.73c-1.93 3.34-.49 8.27 1.36 10.97.93 1.33 2.02 2.81 3.44 2.76 1.39-.06 1.91-.88 3.59-.88 1.67 0 2.15.88 3.6.85 1.49-.02 2.44-1.34 3.33-2.68a11.05 11.05 0 0 0 1.52-3.11 4.78 4.78 0 0 1-2.93-4.38z" />
        <path d="M22.04 12.21a4.87 4.87 0 0 0 1.12-3.49 4.96 4.96 0 0 0-3.21 1.66 4.64 4.64 0 0 0-1.15 3.36 4.1 4.1 0 0 0 3.24-1.53z" />
      </g>
      <g fill={fgFill}>
        <text x="42" y="14" fontSize="5" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="400" letterSpacing="0.5">Download on the</text>
        <text x="42" y="27" fontSize="11" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="600">App Store</text>
      </g>
    </svg>
  );
}

function GooglePlayBadge({ className = "", variant = "default" }: { className?: string; variant?: BadgeVariant }) {
  const light = variant === "light";
  const bgFill = light ? "#fff" : "url(#gp-bg)";
  const fgFill = light ? "#1f2937" : "#fff";

  return (
    <svg className={className} viewBox="0 0 135 40" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Get it on Google Play">
      <defs>
        {!light && (
          <linearGradient id="gp-bg" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#992ed1" />
            <stop offset="100%" stopColor="#e91370" />
          </linearGradient>
        )}
        <linearGradient id="gp-tri" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00C3FF" />
          <stop offset="35%" stopColor="#62DE93" />
          <stop offset="65%" stopColor="#F9E24C" />
          <stop offset="100%" stopColor="#FF6B6B" />
        </linearGradient>
      </defs>
      <rect width="135" height="40" rx="8" fill={bgFill} />
      <g>
        <path d="M13 7.5l12.5 12.5L13 32.5V7.5z" fill="url(#gp-tri)" />
        <path d="M13 7.5l15.5 9.5-3 3L13 7.5z" fill="#00C3FF" opacity="0.8" />
        <path d="M13 32.5l12.5-12.5 3 3L13 32.5z" fill="#FF6B6B" opacity="0.8" />
      </g>
      <g fill={fgFill}>
        <text x="35" y="14" fontSize="5" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="400" letterSpacing="0.3">GET IT ON</text>
        <text x="35" y="27" fontSize="10" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="600">Google Play</text>
      </g>
    </svg>
  );
}

export function StoreBadges({ className = "", variant = "default" }: { className?: string; variant?: BadgeVariant }) {
  return (
    <div className={`flex flex-col sm:flex-row items-center gap-4 ${className}`}>
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="transition-transform hover:scale-105"
        aria-label="Download on the App Store"
      >
        <AppStoreBadge className="h-[52px] w-auto" variant={variant} />
      </a>
      <a
        href={GOOGLE_PLAY_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="transition-transform hover:scale-105"
        aria-label="Get it on Google Play"
      >
        <GooglePlayBadge className="h-[52px] w-auto" variant={variant} />
      </a>
    </div>
  );
}

export { AppStoreBadge, GooglePlayBadge, APP_STORE_URL, GOOGLE_PLAY_URL };
