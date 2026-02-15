'use client';

interface StoryReaderLabels {
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
}

interface StoryReaderProps {
  storyId: string;
  locale: string;
  onExit: () => void;
  labels: StoryReaderLabels;
}

/**
 * Story reader component.
 * TODO: implement full page-by-page reader with audio.
 */
export function StoryReader({ storyId, locale, onExit, labels }: StoryReaderProps) {
  return (
    <div className="rounded-xl border border-purple-100 bg-white p-8 text-center">
      <p className="text-gray-600 mb-4">{labels.loading}</p>
      <button
        onClick={onExit}
        className="text-purple-600 hover:text-purple-800 underline"
      >
        {labels.back}
      </button>
    </div>
  );
}
