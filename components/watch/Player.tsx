'use client';

import React, { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import type { YTPlayer } from './types';

interface PlayerProps {
  videoId: string;
  onTimeUpdate: (time: number) => void;
  onPlayerReady: (player: YTPlayer) => void;
}

export function Player({ videoId, onTimeUpdate, onPlayerReady }: PlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onTimeUpdateRef = useRef(onTimeUpdate);
  const onPlayerReadyRef = useRef(onPlayerReady);

  useEffect(() => {
    onTimeUpdateRef.current = onTimeUpdate;
    onPlayerReadyRef.current = onPlayerReady;
  });

  useEffect(() => {
    if (!videoId || !containerRef.current) return;

    function createPlayer(): void {
      if (!containerRef.current) return;
      containerRef.current.innerHTML = '';
      const div = document.createElement('div');
      div.id = 'yt-player';
      containerRef.current.appendChild(div);

      const win = window as unknown as Record<string, unknown>;
      const YT = win.YT as { Player: new (id: string, opts: Record<string, unknown>) => YTPlayer } | undefined;
      if (!YT?.Player) return;

      const player = new YT.Player('yt-player', {
        height: '100%',
        width: '100%',
        videoId,
        playerVars: { autoplay: 0, modestbranding: 1, rel: 0, enablejsapi: 1 },
        events: {
          onReady: () => {
            playerRef.current = player;
            onPlayerReadyRef.current(player);
            intervalRef.current = setInterval(() => {
              try {
                const t = player.getCurrentTime();
                if (typeof t === 'number') onTimeUpdateRef.current(t);
              } catch { /* player not ready */ }
            }, 250); // High precision: 250ms interval for perfect mapping
          },
        },
      });
    }

    const win = window as unknown as Record<string, unknown>;
    const YT = win.YT as Record<string, unknown> | undefined;
    if (!YT?.Player) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
      (win as Record<string, unknown>).onYouTubeIframeAPIReady = createPlayer;
    } else {
      createPlayer();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      playerRef.current = null;
    };
  }, [videoId]);

  return (
    <div className="rounded border border-[rgba(255,255,255,0.08)] overflow-hidden bg-black aspect-video" ref={containerRef}>
      <div className="w-full h-full flex items-center justify-center text-[#555] text-sm">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    </div>
  );
}
