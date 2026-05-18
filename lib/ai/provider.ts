export interface Chapter {
  startTime: number; // in seconds
  endTime: number;   // in seconds
  title: string;
  summary?: string;
}

export interface TranscriptEntry {
  startTime: number; // in seconds
  endTime: number;   // in seconds
  text: string;
}

export interface AIProvider {
  generateChapters(transcript: string, videoDuration: number): Promise<Chapter[]>;
  generateSummary(transcript: string): Promise<string>;
  enhanceTranscript(rawTranscript: string): Promise<TranscriptEntry[]>;
}
