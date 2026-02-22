'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type SleepTrack = {
  id: string;
  title: string;
  fileName: string;
};

const baseAudioUrl = process.env.NEXT_PUBLIC_SLEEP_AUDIO_BASE_URL || "";

const tracks: SleepTrack[] = [
  { id: "gentle_rainfall", title: "Gentle Rainfall", fileName: "Gentle Rainfall.mp3" },
  { id: "jungle_evening", title: "Jungle Evening", fileName: "Jungle Evening.mp3" },
  { id: "piano_sleep_music", title: "Piano Sleep Music", fileName: "Piano Sleep Music.mp3" },
  { id: "windy_cornfield_loop", title: "Windy Cornfield loop", fileName: "Windy Cornfield loop.mp3" },
];

type SleepPlayerProps = {
  labels: {
    title: string;
    subtitle: string;
    chooseTrack: string;
    nowPlaying: string;
    audioMissing: string;
    timerLabel: string;
    timerOff: string;
    timerSet: string;
    timerCancel: string;
  };
};

const resolveAudioUrl = (fileName: string) => {
  if (!baseAudioUrl) return "";
  const separator = baseAudioUrl.endsWith("/") ? "" : "/";
  return `${baseAudioUrl}${separator}${encodeURIComponent(fileName)}`;
};

export const SleepPlayer = ({ labels }: SleepPlayerProps) => {
  const [activeTrackId, setActiveTrackId] = useState(tracks[0]?.id || "");
  const [timerMinutes, setTimerMinutes] = useState(0);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const activeTrack = useMemo(
    () => tracks.find((track) => track.id === activeTrackId) || tracks[0],
    [activeTrackId]
  );
  const audioUrl = activeTrack ? resolveAudioUrl(activeTrack.fileName) : "";

  useEffect(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (timerMinutes > 0) {
      timerRef.current = window.setTimeout(() => {
        audioRef.current?.pause();
        setTimerMinutes(0);
      }, timerMinutes * 60 * 1000);
    }

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timerMinutes]);

  const handleTimerChange = (minutes: number) => {
    setTimerMinutes(minutes);
  };

  return (
    <Card className="border-purple-100 shadow-lg">
      <CardContent className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{labels.title}</h1>
          <p className="mt-2 text-gray-600">{labels.subtitle}</p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-700">{labels.chooseTrack}</p>
          <div className="flex flex-wrap gap-3">
            {tracks.map((track) => (
              <Button
                key={track.id}
                type="button"
                variant={track.id === activeTrackId ? "default" : "outline"}
                onClick={() => setActiveTrackId(track.id)}
              >
                {track.title}
              </Button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-purple-100 bg-purple-50 p-4">
          <p className="text-sm text-purple-700">
            {labels.nowPlaying}: <span className="font-semibold">{activeTrack?.title}</span>
          </p>
          {audioUrl ? (
            <audio ref={audioRef} controls src={audioUrl} className="mt-4 w-full" />
          ) : (
            <p className="mt-3 text-sm text-purple-500">{labels.audioMissing}</p>
          )}
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-700">{labels.timerLabel}</p>
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant={timerMinutes === 0 ? "default" : "outline"}
              onClick={() => handleTimerChange(0)}
            >
              {labels.timerOff}
            </Button>
            {[5, 10, 20, 30, 60].map((minutes) => (
              <Button
                key={minutes}
                type="button"
                variant={timerMinutes === minutes ? "default" : "outline"}
                onClick={() => handleTimerChange(minutes)}
              >
                {labels.timerSet.replace("{minutes}", String(minutes))}
              </Button>
            ))}
            {timerMinutes > 0 ? (
              <Button type="button" variant="outline" onClick={() => handleTimerChange(0)}>
                {labels.timerCancel}
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};







