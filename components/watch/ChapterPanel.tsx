'use client';

import React from 'react';
import { Play, List } from 'lucide-react';
import { formatTime } from '@/lib/youtube/utils';
import { GlassCard } from '@/components/ui/GlassCard';
import type { Chapter } from './types';

interface Props {
  chapters: Chapter[];
  activeChapterIdx: number;
  onSeek: (seconds: number) => void;
}

export function ChapterPanel({ chapters, activeChapterIdx, onSeek }: Props) {
  if (chapters.length === 0) return null;

  return (
    <GlassCard className="p-4">
      <h2 className="font-bold text-sm mb-3 flex items-center gap-2 text-white font-heading">
        <List className="w-4 h-4 text-white/60" /> Chapters
      </h2>
      <div className="space-y-1">
        {chapters.map((ch, i) => (
          <button key={i} onClick={() => onSeek(ch.startTime)}
            className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              i === activeChapterIdx
                ? 'bg-white/[0.06] border-l-2 border-white'
                : 'hover:bg-white/[0.02] border-l-2 border-transparent'
            }`}>
            <span className={`text-xs font-mono flex-shrink-0 w-12 transition-colors ${
              i === activeChapterIdx ? 'text-white' : 'text-[#444]'
            }`}>{formatTime(ch.startTime)}</span>
            <span className={`text-sm transition-colors flex-grow ${
              i === activeChapterIdx ? 'text-white font-semibold' : 'text-[#666] group-hover:text-[#aaa]'
            }`}>{ch.title}</span>
            {i === activeChapterIdx && <Play className="w-3.5 h-3.5 text-white ml-auto flex-shrink-0 animate-pulse" />}
          </button>
        ))}
      </div>
    </GlassCard>
  );
}
