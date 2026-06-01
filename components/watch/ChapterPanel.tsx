'use client';

import React from 'react';
import { Play, List } from 'lucide-react';
import { formatTime } from '@/lib/youtube/utils';
import type { Chapter } from './types';

interface Props {
  chapters: Chapter[];
  activeChapterIdx: number;
  onSeek: (seconds: number) => void;
}

export function ChapterPanel({ chapters, activeChapterIdx, onSeek }: Props) {
  if (chapters.length === 0) return null;

  return (
    <div className="bg-[#1a1a1a] rounded-xl p-4">
      <h2 className="font-bold text-sm mb-3 flex items-center gap-2">
        <List className="w-4 h-4 text-blue-400" /> Chapters
      </h2>
      <div className="space-y-1">
        {chapters.map((ch, i) => (
          <button key={i} onClick={() => onSeek(ch.startTime)}
            className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all ${
              i === activeChapterIdx
                ? 'bg-blue-500/15 border-l-2 border-blue-500'
                : 'hover:bg-[#222] border-l-2 border-transparent'
            }`}>
            <span className="text-xs font-mono text-gray-500 flex-shrink-0 w-12">{formatTime(ch.startTime)}</span>
            <span className={`text-sm ${i === activeChapterIdx ? 'text-blue-400 font-medium' : 'text-gray-300'}`}>{ch.title}</span>
            {i === activeChapterIdx && <Play className="w-3 h-3 text-blue-400 ml-auto flex-shrink-0" />}
          </button>
        ))}
      </div>
    </div>
  );
}
