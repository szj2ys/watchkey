import type { Chapter, TranscriptEntry } from './types';

export function parseChapters(raw: unknown): Chapter[] {
  let data: unknown = raw;
  if (!data) return [];
  if (typeof data === 'string') { try { data = JSON.parse(data); } catch { return []; } }
  if (!Array.isArray(data)) return [];
  return data.map((ch: unknown) => {
    if (typeof ch === 'string') {
      const match = ch.match(/^(\d+):(\d+)\s+(.+)$/);
      if (match) {
        const secs = parseInt(match[1]) * 60 + parseInt(match[2]);
        return { startTime: secs, endTime: secs + 60, title: ch, summary: '' };
      }
      return { startTime: 0, endTime: 0, title: ch, summary: '' };
    }
    const obj = ch as Record<string, unknown>;
    return {
      startTime: Number(obj.startTime) || 0,
      endTime: Number(obj.endTime) || 0,
      title: String(obj.title || ''),
      summary: String(obj.summary || ''),
    };
  });
}

export function parseTranscript(raw: unknown): TranscriptEntry[] {
  let data: unknown = raw;
  if (!data) return [];
  if (typeof data === 'string') { try { data = JSON.parse(data); } catch { return []; } }
  if (!Array.isArray(data)) return [];
  return data.map((e: unknown) => {
    const obj = e as Record<string, unknown>;
    return {
      text: String(obj.text || ''),
      startTime: Number(obj.startTime) || 0,
      endTime: Number(obj.endTime) || 0,
      confidence: Number(obj.confidence) || undefined,
    };
  });
}

export function findActiveChapter(chapters: Chapter[], currentTime: number): number {
  for (let i = chapters.length - 1; i >= 0; i--) {
    if (currentTime >= chapters[i].startTime) return i;
  }
  return -1;
}
