'use client';

import React from 'react';
import { Play } from 'lucide-react';
import { formatDuration } from '@/lib/youtube/utils';
import { GlassCard } from '@/components/ui/GlassCard';
import type { SearchResult } from './types';

interface Props {
  recommendations: SearchResult[];
  onAnalyze: (videoId: string) => void;
}

export function RecommendationsPanel({ recommendations, onAnalyze }: Props) {
  if (recommendations.length === 0) {
    return (
      <GlassCard className="p-6 text-center">
        <p className="text-sm text-muted-foreground">Recommendations will appear here</p>
      </GlassCard>
    );
  }

  return (
    <div>
      <h2 className="font-bold text-sm mb-3 px-1 text-white font-heading">Up Next</h2>
      <div className="space-y-3">
        {recommendations.map(v => (
          <button key={v.id} onClick={() => onAnalyze(v.id)}
            className="w-full flex gap-3 group text-left">
            <div className="relative w-40 aspect-video rounded overflow-hidden bg-white/[0.03] border border-[rgba(255,255,255,0.04)] flex-shrink-0">
              {v.thumbnail ? (
                <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><Play className="w-6 h-6 text-muted-foreground" /></div>
              )}
              <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 py-0.5 rounded">{formatDuration(v.duration)}</span>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium line-clamp-2 group-hover:text-white transition-colors leading-snug text-[#aaa]">{v.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{v.channel}</p>
              <p className="text-xs text-muted-foreground/60">{v.viewCount} views</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
