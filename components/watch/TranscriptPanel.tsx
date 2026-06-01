'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp, Clock, Download } from 'lucide-react';
import { formatTime } from '@/lib/youtube/utils';
import type { TranscriptEntry } from './types';

interface TranscriptPanelProps {
  transcript: TranscriptEntry[];
  activeTranscriptIdx: number;
  showTranscript: boolean;
  onToggle: () => void;
  onSeek: (seconds: number) => void;
  videoId?: string;
}

export function TranscriptPanel({
  transcript,
  activeTranscriptIdx,
  showTranscript,
  onToggle,
  onSeek,
  videoId,
}: TranscriptPanelProps) {
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTranscriptIdx < 0 || !transcriptRef.current) return;
    const el = transcriptRef.current.children[activeTranscriptIdx] as HTMLElement;
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [activeTranscriptIdx]);

  const exportTranscript = useCallback((): void => {
    const text = transcript.map(e => `[${formatTime(e.startTime)}] ${e.text}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${videoId || 'video'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [transcript, videoId]);

  return (
    <div className="bg-[#1a1a1a] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-4">
        <button onClick={onToggle}
          className="flex items-center gap-2 font-medium text-sm hover:text-gray-300 transition-colors">
          <Clock className="w-4 h-4 text-blue-400" /> Transcript
          {showTranscript ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
        </button>
        {transcript.length > 0 && (
          <button onClick={exportTranscript}
            className="text-xs px-3 py-1.5 bg-[#272727] hover:bg-[#3a3a3a] text-gray-400 rounded-full font-medium transition-colors flex items-center gap-1">
            <Download className="w-3 h-3" /> Export
          </button>
        )}
      </div>
      {showTranscript && (
        <div ref={transcriptRef} className="max-h-[400px] overflow-y-auto px-4 pb-4 space-y-1 scroll-smooth">
          {transcript.length > 0 ? transcript.map((entry, i) => (
            <button key={i} onClick={() => onSeek(entry.startTime)}
              className={`w-full flex gap-3 p-2.5 rounded-lg text-left transition-all ${
                i === activeTranscriptIdx ? 'bg-blue-500/15 text-white' : 'hover:bg-[#222] text-gray-400'
              }`}>
              <span className={`text-xs font-mono flex-shrink-0 pt-0.5 w-12 ${i === activeTranscriptIdx ? 'text-blue-400' : 'text-gray-600'}`}>
                {formatTime(entry.startTime)}
              </span>
              <p className="text-sm leading-relaxed">{entry.text}</p>
            </button>
          )) : (
            <p className="text-sm text-gray-600 italic text-center py-8">No transcript available</p>
          )}
        </div>
      )}
    </div>
  );
}
