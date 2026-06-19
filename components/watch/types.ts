export interface TranscriptEntry {
  text: string;
  startTime: number;
  endTime?: number;
  confidence?: number;
}

export interface Chapter {
  startTime: number;
  endTime: number;
  title: string;
  summary?: string;
}

export interface VideoData {
  id: string;
  youtube_id: string;
  title: string;
  channel: string;
  duration: number;
  thumbnail_url: string;
  created_at: string;
}

export interface AnalysisData {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error: string | null;
  progress_stage: string | null;
  progress_pct: number | null;
  chapters: Chapter[] | string[];
  summary: string | null;
  transcript: TranscriptEntry[] | string;
  created_at: string;
}

export interface SearchResult {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  duration: number;
  viewCount: string;
  publishedAt: string;
}

export interface YTPlayer {
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  playVideo(): void;
  pauseVideo(): void;
  getCurrentTime(): number;
  destroy(): void;
}
