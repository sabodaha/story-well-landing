'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { fetchPagesForStory } from "@/lib/firebase/stories";
import { initAppCheck } from "@/lib/firebase/client";
import { resolveAllAudioUrls, resolveAudioDownloadUrl } from "@/lib/firebase/storage";
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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type StoryReaderProps = {
  storyId: string;
  locale: Locale;
  onExit: () => void;
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
  labels,
}: StoryReaderProps) => {
  // ---- Initialise App Check on mount (reCAPTCHA v3 – blocks simple bots) --
  useEffect(() => {
    initAppCheck();
  }, []);

  // ---- Data ---------------------------------------------------------------
  const [pages, setPages] = useState<StoryPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noPagesFound, setNoPagesFound] = useState(false);

  // ---- Resolved audio URLs (Firebase Storage SDK download URLs) -----------
  const [audioUrlMap, setAudioUrlMap] = useState<Map<number, string>>(new Map());

  // ---- Navigation ---------------------------------------------------------
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // ---- Fullscreen ---------------------------------------------------------
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // ---- Language (local to reader) -----------------------------------------
  const [readerLocale, setReaderLocale] = useState<Locale>(locale);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  // ---- Audio --------------------------------------------------------------
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const shouldAutoPlayRef = useRef(false);
  const emptyRetryRef = useRef(false);

  // ---- Controls visibility (tap to toggle, like Flutter) ------------------
  const [controlsVisible, setControlsVisible] = useState(true);

  const totalPages = pages.length;
  const currentPage = pages[currentIndex] as StoryPage | undefined;

  const caption = useMemo(
    () => resolveLocalizedText(currentPage?.caption, readerLocale),
    [currentPage, readerLocale]
  );

  // Current page audio URL from resolved map
  const audioUrl = audioUrlMap.get(currentPage?.index ?? -1) || "";

  // =========================================================================
  // Data fetching
  // =========================================================================

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setNoPagesFound(false);
    emptyRetryRef.current = false;

    fetchPagesForStory(storyId)
      .then((data) => {
        if (!active) return;
        console.log("[StoryReader] Loaded", data.length, "pages. First page audioUrls:", data[0]?.audioUrls);
        if (data.length === 0) {
          if (!emptyRetryRef.current) {
            // Transient empty snapshots happen occasionally in production; confirm once before showing empty state.
            emptyRetryRef.current = true;
            setTimeout(() => {
              if (!active) return;
              fetchPagesForStory(storyId)
                .then((retryData) => {
                  if (!active) return;
                  if (retryData.length === 0) {
                    console.warn(`[StoryReader] No pages returned for storyId="${storyId}" after retry`);
                    setNoPagesFound(true);
                    setPages([]);
                  } else {
                    setPages(retryData);
                  }
                  setLoading(false);
                  setCurrentIndex(0);
                })
                .catch((retryErr) => {
                  if (!active) return;
                  console.error(`[StoryReader] Retry load failed for storyId="${storyId}"`, retryErr);
                  setError(retryErr instanceof Error ? retryErr.message : labels.error);
                  setLoading(false);
                });
            }, 600);
            return;
          }
          setNoPagesFound(true);
          setPages([]);
          setLoading(false);
          setCurrentIndex(0);
          return;
        }
        setPages(data);
        setLoading(false);
        setCurrentIndex(0);
      })
      .catch((err) => {
        if (!active) return;
        console.error(`[StoryReader] Failed loading pages for storyId="${storyId}"`, err);
        setError(err instanceof Error ? err.message : labels.error);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [storyId, labels.error]);

  // =========================================================================
  // Resolve audio URLs via Firebase Storage SDK (not public GCS URLs)
  // Re-resolve when pages load or reader locale changes
  // =========================================================================

  useEffect(() => {
    if (pages.length === 0) return;
    let active = true;

    console.log(`[StoryReader] Resolving audio URLs for locale="${readerLocale}", ${pages.length} pages…`);

    const current = pages[currentIndex];
    if (current) {
      resolveAudioDownloadUrl(current.audioUrls, readerLocale, storyId, current.index)
        .then((url) => {
          if (!active || !url) return;
          setAudioUrlMap((prev) => {
            const next = new Map(prev);
            next.set(current.index, url);
            return next;
          });
        })
        .catch((err) => {
          console.error("[StoryReader] Failed to resolve current page audio URL:", err);
        });
    }

    resolveAllAudioUrls(pages, readerLocale, storyId)
      .then((map) => {
        if (!active) return;
        console.log("[StoryReader] Audio URL map resolved:", Object.fromEntries(map));
        setAudioUrlMap((prev) => {
          const next = new Map(prev);
          map.forEach((value, key) => next.set(key, value));
          return next;
        });
      })
      .catch((err) => {
        console.error("[StoryReader] Failed to resolve audio URLs:", err);
      });

    return () => {
      active = false;
    };
  }, [pages, readerLocale, storyId, currentIndex]);

  // =========================================================================
  // Navigation helpers (no URL mutation – keeps fullscreen alive)
  // =========================================================================

  const goToPage = useCallback(
    (index: number) => {
      setCurrentIndex(Math.max(0, Math.min(index, totalPages - 1)));
    },
    [totalPages]
  );

  const handleNext = useCallback(() => {
    if (currentIndex < totalPages - 1) {
      goToPage(currentIndex + 1);
    }
  }, [currentIndex, totalPages, goToPage]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      goToPage(currentIndex - 1);
    }
  }, [currentIndex, goToPage]);

  // =========================================================================
  // Fullscreen
  // =========================================================================

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      containerRef.current.requestFullscreen?.().catch(() => {});
    }
  }, []);

  // =========================================================================
  // Audio: single combined effect – avoids race conditions
  // =========================================================================

  // When page or audioUrl changes, load the new audio and auto-play if needed
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    console.log("[StoryReader] Audio effect – page:", currentIndex, "url:", audioUrl, "autoPlay:", shouldAutoPlayRef.current);

    // Always stop whatever was playing
    audio.pause();
    audio.currentTime = 0;

    if (!audioUrl) {
      audio.removeAttribute("src");
      setIsPlaying(false);
      // If auto-play was on but this page has no audio, advance after a pause
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
          .then(() => {
            console.log("[StoryReader] Auto-play started:", audioUrl);
            setIsPlaying(true);
          })
          .catch((err) => {
            console.error("[StoryReader] Auto-play failed:", err);
            setIsPlaying(false);
          });
      }, 400);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, audioUrl]);

  // Preload next page audio
  useEffect(() => {
    const nextPage = pages[currentIndex + 1];
    if (!nextPage) return;
    const nextUrl = audioUrlMap.get(nextPage.index) || "";
    if (!nextUrl) return;
    const preloader = new Audio(nextUrl);
    preloader.preload = "auto";
    preloader.load();
  }, [pages, currentIndex, audioUrlMap]);

  // =========================================================================
  // Audio event handlers (stable callbacks)
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

  const handlePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      console.warn("[StoryReader] Play ignored – no audio element.");
      return;
    }
    if (!audioUrl) {
      console.warn("[StoryReader] Play ignored – audioUrl is empty for page", currentIndex);
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      shouldAutoPlayRef.current = false;
    } else {
      // Ensure src is set before playing
      if (!audio.src || !audio.src.startsWith("http")) {
        console.log("[StoryReader] Setting audio src before play:", audioUrl);
        audio.src = audioUrl;
        audio.load();
      }
      shouldAutoPlayRef.current = true;
      audio
        .play()
        .then(() => {
          console.log("[StoryReader] Playing:", audioUrl);
          setIsPlaying(true);
        })
        .catch((err) => {
          console.error("[StoryReader] play() failed:", err, "src:", audio.src);
          setIsPlaying(false);
        });
    }
  }, [audioUrl, isPlaying, currentIndex]);

  // =========================================================================
  // Keyboard
  // =========================================================================

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      else if (e.key === "ArrowLeft") handlePrev();
      else if (e.key === "Escape") {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else {
          onExit();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleNext, handlePrev, onExit]);

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
  // Retry
  // =========================================================================

  const retryLoad = () => {
    setLoading(true);
    setError(null);
    setNoPagesFound(false);
    fetchPagesForStory(storyId)
      .then((data) => {
        if (data.length === 0) {
          console.warn(`[StoryReader] Retry found no pages for storyId="${storyId}"`);
          setNoPagesFound(true);
          setPages([]);
          setLoading(false);
          setCurrentIndex(0);
          return;
        }
        setPages(data);
        setLoading(false);
        setCurrentIndex(0);
      })
      .catch((err) => {
        console.error(`[StoryReader] Retry failed for storyId="${storyId}"`, err);
        setError(err instanceof Error ? err.message : labels.error);
        setLoading(false);
      });
  };

  // =========================================================================
  // Render – loading / error states
  // =========================================================================

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center rounded-2xl border border-purple-100 bg-black/80 text-white">
        {labels.loading}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 rounded-2xl border border-red-300 bg-black/80 text-white">
        <span className="text-red-400">{error}</span>
        <button
          onClick={retryLoad}
          className="rounded-lg border border-white/30 px-4 py-2 text-sm hover:bg-white/10"
        >
          {labels.retry}
        </button>
      </div>
    );
  }

  if (noPagesFound) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 rounded-2xl border border-amber-300 bg-black/80 text-white">
        <span className="text-amber-300">No pages found for this story yet.</span>
        <button
          onClick={retryLoad}
          className="rounded-lg border border-white/30 px-4 py-2 text-sm hover:bg-white/10"
        >
          {labels.retry}
        </button>
      </div>
    );
  }

  if (!currentPage) {
    return (
      <div className="flex h-96 items-center justify-center rounded-2xl border border-purple-100 bg-black/80 text-white">
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

  return (
    <div
      ref={containerRef}
      className={`relative select-none overflow-hidden rounded-2xl bg-black ${
        isFullscreen ? "h-screen w-screen" : "aspect-[3/4] sm:aspect-[4/3]"
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

      {/* ---- Tap zones for prev / next ---- */}
      <div
        className="absolute inset-y-0 left-0 z-10 w-1/3 cursor-pointer"
        onClick={handlePrev}
        aria-label={labels.prev}
      />
      <div
        className="absolute inset-y-0 right-0 z-10 w-1/3 cursor-pointer"
        onClick={handleNext}
        aria-label={labels.next}
      />

      {/* ---- Centre tap zone toggles controls ---- */}
      <div
        className="absolute inset-y-0 left-1/3 right-1/3 z-10 cursor-pointer"
        onClick={() => setControlsVisible((v) => !v)}
      />

      {/* ---- Top control bar ---- */}
      <div
        className={`absolute left-0 right-0 top-0 z-20 flex items-center justify-between gap-2 px-3 py-2 transition-opacity duration-200 ${
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
            onClick={handlePlayPause}
            disabled={!audioUrl}
            className="flex h-9 items-center gap-1.5 rounded-full bg-black/50 px-3 text-sm text-white backdrop-blur-sm disabled:opacity-40"
            aria-label={isPlaying ? labels.pause : labels.play}
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M8 5v14l11-7z" /></svg>
            )}
            <span className="hidden sm:inline">{isPlaying ? labels.pause : labels.play}</span>
          </button>

          {/* Language selector (inline, NO portal) */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen((v) => !v)}
              className="flex h-9 items-center gap-1.5 rounded-full bg-black/50 px-3 text-sm text-white backdrop-blur-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
              <span>{readerLocale.toUpperCase()}</span>
            </button>

            {langMenuOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 max-h-64 overflow-auto rounded-lg bg-black/90 py-1 shadow-lg backdrop-blur-md">
                {locales.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => {
                      setReaderLocale(loc);
                      setLangMenuOpen(false);
                    }}
                    className={`flex w-full items-center gap-2 whitespace-nowrap px-4 py-2 text-left text-sm hover:bg-white/10 ${
                      readerLocale === loc ? "bg-white/20 font-semibold text-white" : "text-white/80"
                    }`}
                  >
                    <span>{localeNames[loc].native}</span>
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
          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="flex h-9 items-center gap-1.5 rounded-full bg-black/50 px-3 text-sm text-white backdrop-blur-sm"
            aria-label={isFullscreen ? labels.fullscreenExit : labels.fullscreenEnter}
          >
            {isFullscreen ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M8 3v3a2 2 0 0 1-2 2H3" /><path d="M21 8h-3a2 2 0 0 1-2-2V3" /><path d="M3 16h3a2 2 0 0 1 2 2v3" /><path d="M16 21v-3a2 2 0 0 1 2-2h3" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M21 8V5a2 2 0 0 0-2-2h-3" /><path d="M3 16v3a2 2 0 0 0 2 2h3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" /></svg>
            )}
          </button>

          {/* Close / back */}
          <button
            onClick={onExit}
            className="flex h-9 items-center gap-1.5 rounded-full bg-black/50 px-3 text-sm text-white backdrop-blur-sm"
            aria-label={labels.back}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
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

      {/* ---- Hidden audio element ---- */}
      <audio
        ref={audioRef}
        preload="auto"
        className="hidden"
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
