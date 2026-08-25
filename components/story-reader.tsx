'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { fetchPagesForStory } from "@/lib/firebase/stories";
import { resolveAudioDownloadUrl } from "@/lib/firebase/storage";
import type { StoryPage } from "@/lib/types/story";
import { locales, localeNames, type Locale } from "@/lib/i18n/config";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const resolveLocalizedText = (
  value: Record<string, string> | undefined,
  locale: Locale
) => {
  if (!value) return "";
  return value[locale] || value.en || Object.values(value)[0] || "";
};

/** Backoff schedule for the automatic retries that run before any error is shown. */
const RETRY_DELAYS_MS = [400, 1200];

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Aspect classes shared by the poster frame and the loaded reader — keep in sync to avoid layout shift. */
const FRAME_ASPECT = "aspect-[3/4] sm:aspect-[4/3]";

type StoryReaderProps = {
  storyId: string;
  locale: Locale;
  onExit: () => void;
  /** Page-1 still shown while the real pages load. Omit for the plain text loading state. */
  posterSrc?: string;
  labels: {
    loading: string;
    error: string;
    retry: string;
    back: string;
    pageLabel: string;
    audioLabel: string;
    noAudio: string;
    play: string;
    pause: string;
    next: string;
    prev: string;
    fullscreenEnter: string;
    fullscreenExit: string;
    languageLabel: string;
  };
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const StoryReader = ({
  storyId,
  locale,
  onExit,
  posterSrc,
  labels,
}: StoryReaderProps) => {
  // ---- Data ---------------------------------------------------------------
  const [pages, setPages] = useState<StoryPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const requestIdRef = useRef(0);
  const inFlightRef = useRef(false);

  // ---- Navigation ---------------------------------------------------------
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // ---- Fullscreen ---------------------------------------------------------
  const [isFullscreen, setIsFullscreen] = useState(false);
  /** iOS Safari has no Fullscreen API on arbitrary elements — resolved after mount. */
  const [fullscreenSupported, setFullscreenSupported] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // ---- Language (local to reader) -----------------------------------------
  const [readerLocale, setReaderLocale] = useState<Locale>(locale);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langWrapRef = useRef<HTMLDivElement | null>(null);
  const langTriggerRef = useRef<HTMLButtonElement | null>(null);
  const langMenuRef = useRef<HTMLDivElement | null>(null);

  const baseId = useId();
  const langMenuId = `${baseId}-lang-menu`;
  const controlsId = `${baseId}-controls`;

  // ---- Audio --------------------------------------------------------------
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const shouldAutoPlayRef = useRef(false);

  // ---- Controls visibility (tap to toggle, like Flutter) ------------------
  const [controlsVisible, setControlsVisible] = useState(true);

  const totalPages = pages.length;
  const currentPage = pages[currentIndex] as StoryPage | undefined;

  const caption = useMemo(
    () => resolveLocalizedText(currentPage?.caption, readerLocale),
    [currentPage, readerLocale]
  );

  // Resolve audio URL asynchronously via Firebase Storage SDK (tokenized URLs).
  const [audioUrl, setAudioUrl] = useState("");

  useEffect(() => {
    if (!currentPage) {
      setAudioUrl("");
      return;
    }

    let cancelled = false;

    resolveAudioDownloadUrl(currentPage.audioUrls, readerLocale, storyId, currentPage.index)
      .then((url) => {
        if (cancelled) return;
        setAudioUrl(url);
      })
      .catch(() => {
        if (cancelled) return;
        setAudioUrl("");
      });

    return () => { cancelled = true; };
  }, [currentPage, readerLocale, storyId]);

  // =========================================================================
  // Data fetching – one loader shared by the initial load and the retry button
  // =========================================================================

  /**
   * Loads the pages of `storyId`, transparently re-trying transient failures.
   * `manual` runs keep the current error/empty state on screen and only flag
   * `retrying`, so the button can disable itself instead of the whole view
   * flipping back to the loading state.
   */
  const loadPages = useCallback(
    async ({ manual = false }: { manual?: boolean } = {}) => {
      if (manual && inFlightRef.current) return;
      inFlightRef.current = true;

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      const isStale = () => requestId !== requestIdRef.current;

      if (manual) {
        setRetrying(true);
      } else {
        setLoading(true);
        setError(null);
      }

      try {
        for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
          try {
            const data = await fetchPagesForStory(storyId);
            if (isStale()) return;
            setPages(data);
            setCurrentIndex(0);
            setError(null);
            setLoading(false);
            return;
          } catch (err) {
            if (isStale()) return;
            if (attempt >= RETRY_DELAYS_MS.length) {
              console.error(`[StoryReader] Failed loading pages for storyId="${storyId}"`, err);
              setError(err instanceof Error ? err.message : labels.error);
              setLoading(false);
              return;
            }
            const delay = RETRY_DELAYS_MS[attempt];
            console.warn(
              `[StoryReader] Attempt ${attempt + 1} failed for storyId="${storyId}", retrying in ${delay}ms`
            );
            await sleep(delay);
            if (isStale()) return;
          }
        }
      } finally {
        if (!isStale()) {
          inFlightRef.current = false;
          setRetrying(false);
        }
      }
    },
    [storyId, labels.error]
  );

  useEffect(() => {
    void loadPages();
    // Invalidate the in-flight request so a late response cannot land on a newer one.
    return () => { requestIdRef.current += 1; };
  }, [loadPages]);

  const retryLoad = useCallback(() => {
    void loadPages({ manual: true });
  }, [loadPages]);

  // =========================================================================
  // Navigation helpers
  // =========================================================================

  const goToPage = useCallback(
    (index: number) => {
      setCurrentIndex(Math.max(0, Math.min(index, totalPages - 1)));
    },
    [totalPages]
  );

  const handleNext = useCallback(() => {
    if (currentIndex < totalPages - 1) goToPage(currentIndex + 1);
  }, [currentIndex, totalPages, goToPage]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) goToPage(currentIndex - 1);
  }, [currentIndex, goToPage]);

  // =========================================================================
  // Fullscreen
  // =========================================================================

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // The container only exists once the reader itself renders, so this re-checks
  // whenever the view flips out of its loading / error states.
  useEffect(() => {
    const target = containerRef.current ?? document.documentElement;
    setFullscreenSupported(
      Boolean(document.fullscreenEnabled) && typeof target.requestFullscreen === "function"
    );
  }, [loading, error, pages.length]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      containerRef.current.requestFullscreen?.().catch(() => {});
    }
  }, []);

  // =========================================================================
  // Audio: load src when page or locale changes
  // =========================================================================

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Stop whatever was playing
    audio.pause();
    audio.currentTime = 0;

    if (!audioUrl) {
      audio.removeAttribute("src");
      setIsPlaying(false);
      // If auto-play chain was active, advance after brief pause
      if (shouldAutoPlayRef.current && currentIndex < totalPages - 1) {
        const t = setTimeout(() => goToPage(currentIndex + 1), 2000);
        return () => clearTimeout(t);
      }
      return;
    }

    audio.src = audioUrl;
    audio.load();

    if (shouldAutoPlayRef.current) {
      const t = setTimeout(() => {
        audio
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.warn("[StoryReader] Auto-play blocked:", err.message);
            setIsPlaying(false);
          });
      }, 300);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, audioUrl]);

  // Preload next page audio so transitions are seamless
  useEffect(() => {
    const nextPage = pages[currentIndex + 1];
    if (!nextPage) return;
    let cancelled = false;

    resolveAudioDownloadUrl(nextPage.audioUrls, readerLocale, storyId, nextPage.index)
      .then((nextUrl) => {
        if (cancelled || !nextUrl) return;
        const preloader = new Audio(nextUrl);
        preloader.preload = "auto";
        preloader.load();
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [pages, currentIndex, readerLocale, storyId]);

  // =========================================================================
  // Audio event handlers
  // =========================================================================

  const onAudioEnded = useCallback(() => {
    setIsPlaying(false);
    shouldAutoPlayRef.current = true;
    if (currentIndex < totalPages - 1) {
      goToPage(currentIndex + 1);
    } else {
      shouldAutoPlayRef.current = false;
    }
  }, [currentIndex, totalPages, goToPage]);

  /** Synchronous play/pause — keeps user-gesture context intact for mobile. */
  const handlePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      shouldAutoPlayRef.current = false;
      return;
    }

    if (!audioUrl) return;

    // Ensure src is set (should already be via effect, but guard against edge cases)
    if (!audio.src || (audio.src !== audioUrl && !audio.src.endsWith(audioUrl))) {
      audio.src = audioUrl;
      audio.load();
    }

    shouldAutoPlayRef.current = true;
    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  }, [audioUrl, isPlaying, currentIndex]);

  // =========================================================================
  // Language menu
  // =========================================================================

  const closeLangMenu = useCallback((restoreFocus = true) => {
    setLangMenuOpen(false);
    if (restoreFocus) langTriggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!langMenuOpen) return;
    // Capture phase, so a press on the trigger still reaches its own toggle handler.
    const onPointerDown = (e: PointerEvent) => {
      if (langWrapRef.current?.contains(e.target as Node)) return;
      setLangMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [langMenuOpen]);

  // Hiding the control bar makes it inert, which would trap the open menu there.
  useEffect(() => {
    if (!controlsVisible) setLangMenuOpen(false);
  }, [controlsVisible]);

  useEffect(() => {
    if (!langMenuOpen) return;
    const menu = langMenuRef.current;
    if (!menu) return;
    const checked = menu.querySelector<HTMLButtonElement>('[aria-checked="true"]');
    (checked ?? menu.querySelector<HTMLButtonElement>('[role="menuitemradio"]'))?.focus();
  }, [langMenuOpen]);

  const onLangMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Tab") {
      setLangMenuOpen(false);
      return;
    }
    const items = Array.from(
      e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]')
    );
    if (items.length === 0) return;
    const index = items.indexOf(document.activeElement as HTMLButtonElement);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      items[index < 0 ? 0 : (index + 1) % items.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      items[index < 0 ? items.length - 1 : (index - 1 + items.length) % items.length]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      items[items.length - 1]?.focus();
    }
  };

  // =========================================================================
  // Keyboard
  // =========================================================================

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // The open menu owns Escape; only then does it fall through to the reader.
        if (langMenuOpen) {
          e.stopPropagation();
          closeLangMenu();
          return;
        }
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else {
          onExit();
        }
        return;
      }
      if (langMenuOpen) return;
      if (e.key === "ArrowRight") handleNext();
      else if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleNext, handlePrev, onExit, langMenuOpen, closeLangMenu]);

  // =========================================================================
  // Touch / swipe
  // =========================================================================

  const onTouchStart = (e: React.TouchEvent) =>
    setTouchStartX(e.touches[0]?.clientX ?? null);

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX == null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX;
    const delta = endX - touchStartX;
    if (delta > 60) handlePrev();
    else if (delta < -60) handleNext();
    setTouchStartX(null);
  };

  // =========================================================================
  // Render – loading / error states
  // =========================================================================

  if (loading) {
    if (posterSrc) {
      return (
        <div
          className={`relative overflow-hidden rounded-2xl bg-black ${FRAME_ASPECT}`}
          role="status"
          aria-live="polite"
        >
          <Image
            src={posterSrc}
            alt=""
            aria-hidden
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/45" />
          <div
            className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 px-6 pb-5 pt-16"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 60%, transparent 100%)",
            }}
          >
            <span
              className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white/30 border-t-white motion-reduce:animate-none"
              aria-hidden
            />
            <span className="text-sm font-medium text-white/90 drop-shadow">{labels.loading}</span>
          </div>
        </div>
      );
    }

    return (
      <div className={`flex ${FRAME_ASPECT} items-center justify-center rounded-2xl border border-border bg-black/80 text-white`}>
        {labels.loading}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex ${FRAME_ASPECT} flex-col items-center justify-center gap-4 rounded-2xl border border-destructive bg-black/80 text-white`}>
        <span className="text-destructive">{error}</span>
        <button
          onClick={retryLoad}
          disabled={retrying}
          className="rounded-lg border border-white/30 px-4 py-2 text-sm hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {retrying ? labels.loading : labels.retry}
        </button>
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className={`flex ${FRAME_ASPECT} flex-col items-center justify-center gap-4 rounded-2xl border border-warning bg-black/80 text-white`}>
        <span className="text-warning">No pages found for this story yet.</span>
        <button
          onClick={retryLoad}
          disabled={retrying}
          className="rounded-lg border border-white/30 px-4 py-2 text-sm hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {retrying ? labels.loading : labels.retry}
        </button>
      </div>
    );
  }

  if (!currentPage) {
    return (
      <div className={`flex ${FRAME_ASPECT} items-center justify-center rounded-2xl border border-border bg-black/80 text-white`}>
        {labels.error}
      </div>
    );
  }

  // =========================================================================
  // Render – immersive reader
  // =========================================================================

  const pageLabel = labels.pageLabel
    .replace("{current}", String(currentIndex + 1))
    .replace("{total}", String(totalPages));

  const atStart = currentIndex === 0;
  const atEnd = currentIndex >= totalPages - 1;

  const chevronBase =
    "pointer-events-none absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full backdrop-blur-sm transition-opacity duration-200 motion-reduce:transition-none";

  return (
    <div
      ref={containerRef}
      className={`group relative select-none overflow-hidden rounded-2xl bg-black ${
        isFullscreen ? "h-screen w-screen" : FRAME_ASPECT
      }`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ---- Story image (covers entire area) ---- */}
      {currentPage.imageUrl ? (
        <Image
          key={`${storyId}-${currentIndex}`}
          src={currentPage.imageUrl}
          alt={caption || "Story page"}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-white/40">
          <span className="text-6xl">📖</span>
        </div>
      )}

      {/* ---- Tap zones for prev / next, with visible chevron affordances ---- */}
      <button
        type="button"
        onClick={handlePrev}
        disabled={atStart}
        aria-label={labels.prev}
        className="group/prev absolute inset-y-0 left-0 z-10 w-1/3 cursor-pointer focus:outline-none disabled:cursor-default"
      >
        <span
          className={`${chevronBase} left-2 sm:left-3 ${
            atStart ? "bg-black/25 text-white/35" : "bg-black/50 text-white"
          } opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-visible/prev:opacity-100 group-focus-visible/prev:ring-2 group-focus-visible/prev:ring-white group-focus-visible/prev:ring-offset-2 group-focus-visible/prev:ring-offset-black`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden><path d="m15 18-6-6 6-6" /></svg>
        </span>
      </button>
      <button
        type="button"
        onClick={handleNext}
        disabled={atEnd}
        aria-label={labels.next}
        className="group/next absolute inset-y-0 right-0 z-10 w-1/3 cursor-pointer focus:outline-none disabled:cursor-default"
      >
        <span
          className={`${chevronBase} right-2 sm:right-3 ${
            atEnd ? "bg-black/25 text-white/35" : "bg-black/50 text-white"
          } opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-visible/next:opacity-100 group-focus-visible/next:ring-2 group-focus-visible/next:ring-white group-focus-visible/next:ring-offset-2 group-focus-visible/next:ring-offset-black`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden><path d="m9 18 6-6-6-6" /></svg>
        </span>
      </button>

      {/* ---- Centre tap zone toggles controls ---- */}
      {/* A ring around a full-height transparent overlay would frame the whole
          picture, so keyboard focus is shown by the centred badge instead. */}
      <button
        type="button"
        onClick={() => setControlsVisible((v) => !v)}
        aria-expanded={controlsVisible}
        aria-controls={controlsId}
        aria-label={controlsVisible ? "Hide reader controls" : "Show reader controls"}
        className="group/toggle absolute inset-y-0 left-1/3 right-1/3 z-10 cursor-pointer focus:outline-none"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white opacity-0 ring-2 ring-white backdrop-blur-sm transition-opacity duration-200 group-focus-visible/toggle:opacity-100 motion-reduce:transition-none"
        >
          {controlsVisible ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19" /><path d="M6.61 6.61A18.9 18.9 0 0 0 2 12s3 8 10 8a9.7 9.7 0 0 0 5.39-1.61" /><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" /><path d="m2 2 20 20" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M2 12s3-8 10-8 10 8 10 8-3 8-10 8-10-8-10-8z" /><circle cx="12" cy="12" r="3" /></svg>
          )}
        </span>
      </button>

      {/* ---- Top control bar ---- */}
      <div
        id={controlsId}
        inert={!controlsVisible}
        className={`absolute left-0 right-0 top-0 z-20 flex items-center justify-between gap-2 px-3 py-2 transition-opacity duration-200 motion-reduce:transition-none ${
          controlsVisible
            ? "opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)" }}
      >
        {/* Left cluster */}
        <div className="flex items-center gap-1">
          {/* Play / Pause */}
          <button
            type="button"
            onClick={handlePlayPause}
            className="flex h-9 items-center gap-1.5 rounded-full bg-black/50 px-3 text-sm text-white backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            aria-label={isPlaying ? labels.pause : labels.play}
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden><path d="M8 5v14l11-7z" /></svg>
            )}
            <span className="hidden sm:inline">{isPlaying ? labels.pause : labels.play}</span>
          </button>

          {/* Language selector (inline, NO portal) */}
          <div className="relative" ref={langWrapRef}>
            <button
              ref={langTriggerRef}
              type="button"
              onClick={() => setLangMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={langMenuOpen}
              aria-controls={langMenuOpen ? langMenuId : undefined}
              className="flex h-9 items-center gap-1.5 rounded-full bg-black/50 px-3 text-sm text-white backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
              <span className="sr-only">{labels.languageLabel}</span>
              <span>{readerLocale.toUpperCase()}</span>
            </button>

            {langMenuOpen && (
              <div
                id={langMenuId}
                ref={langMenuRef}
                role="menu"
                aria-label={labels.languageLabel}
                onKeyDown={onLangMenuKeyDown}
                className="absolute left-0 top-full z-50 mt-1 max-h-64 overflow-auto rounded-lg bg-black/90 py-1 shadow-lg backdrop-blur-md"
              >
                {locales.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    role="menuitemradio"
                    aria-checked={readerLocale === loc}
                    onClick={() => {
                      setReaderLocale(loc);
                      closeLangMenu();
                    }}
                    className={`flex w-full items-center gap-2 whitespace-nowrap px-4 py-2 text-left text-sm hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white ${
                      readerLocale === loc ? "bg-white/20 font-semibold text-white" : "text-white/80"
                    }`}
                  >
                    <span lang={loc}>{localeNames[loc].native}</span>
                    <span className="text-xs text-white/50">{localeNames[loc].english}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Page counter */}
          <span className="rounded-full bg-black/50 px-3 py-1.5 text-xs text-white backdrop-blur-sm">
            {pageLabel}
          </span>
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-1">
          {/* Fullscreen — omitted where the API cannot work (e.g. iPhone Safari) */}
          {fullscreenSupported && (
            <button
              type="button"
              onClick={toggleFullscreen}
              className="flex h-9 items-center gap-1.5 rounded-full bg-black/50 px-3 text-sm text-white backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              aria-label={isFullscreen ? labels.fullscreenExit : labels.fullscreenEnter}
            >
              {isFullscreen ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden><path d="M8 3v3a2 2 0 0 1-2 2H3" /><path d="M21 8h-3a2 2 0 0 1-2-2V3" /><path d="M3 16h3a2 2 0 0 1 2 2v3" /><path d="M16 21v-3a2 2 0 0 1 2-2h3" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden><path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M21 8V5a2 2 0 0 0-2-2h-3" /><path d="M3 16v3a2 2 0 0 0 2 2h3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" /></svg>
              )}
            </button>
          )}

          {/* Close / back */}
          <button
            type="button"
            onClick={onExit}
            className="flex h-9 items-center gap-1.5 rounded-full bg-black/50 px-3 text-sm text-white backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            aria-label={labels.back}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>
      </div>

      {/* ---- Caption overlay at bottom (gradient like Flutter) ---- */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20 px-6 pb-4 pt-16"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)",
        }}
      >
        <p
          className="text-center text-base font-medium leading-relaxed text-white drop-shadow-lg sm:text-lg md:text-xl"
          aria-live="polite"
        >
          {caption}
        </p>
      </div>

      {/* ---- Main audio element (programmatic control) ---- */}
      <audio
        ref={audioRef}
        playsInline
        preload="auto"
        className="pointer-events-none absolute h-0 w-0 opacity-0"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={onAudioEnded}
        onError={(e) => {
          const el = e.currentTarget;
          console.error("[StoryReader] Audio error:", el.error?.code, el.error?.message, "src:", el.src);
          setIsPlaying(false);
        }}
      />
    </div>
  );
};
