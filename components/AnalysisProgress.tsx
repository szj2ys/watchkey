'use client';

import React from 'react';
import { PROGRESS_LABEL, PROGRESS_PCT } from '@/lib/progress';
import type { ProgressStage } from '@/lib/progress';

interface AnalysisProgressProps {
  progress_stage: string | null;
  progress_pct: number | null;
}

export function AnalysisProgress({ progress_stage, progress_pct }: AnalysisProgressProps): React.ReactElement | null {
  // Graceful degradation: if progress data is missing, return null
  // (caller falls back to existing "Up to 2 minutes" display)
  if (progress_stage === null || progress_pct === null) {
    return null;
  }

  const stage = progress_stage as ProgressStage;
  const label = PROGRESS_LABEL[stage] ?? 'Processing...';
  const pct = progress_pct ?? 0;

  return (
    <div className="flex flex-col gap-2 w-full max-w-xs">
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="w-full h-1.5 bg-[#272727] rounded-full overflow-hidden">
        <div
          className="h-full bg-white rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
