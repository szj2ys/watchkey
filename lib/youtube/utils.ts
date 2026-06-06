export interface VideoItem {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  duration: number;
  viewCount: string;
  publishedAt: string;
}

export async function handleAnalyze(videoId: string): Promise<void> {
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ youtubeUrl: `https://www.youtube.com/watch?v=${videoId}` }),
  });
  if (!res.ok) throw new Error('Failed');
  const data = await res.json();
  window.location.href = `/watch/${data.analysis_id}`;
}

export function parseDuration(iso: string): number {
  if (!iso) return 0;
  
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  
  return (hours * 3600) + (minutes * 60) + seconds;
}

export function formatViewCount(n: string | undefined): string {
  if (!n) return '0';
  const num = parseInt(n, 10);
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

export function formatRelativeDate(iso: string): string {
  if (!iso) return '';
  
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  
  if (days < 7) {
    return `${days}d ago`;
  }
  
  const weeks = Math.floor(days / 7);
  if (weeks < 5) {
    return `${weeks}w ago`;
  }
  
  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months}mo ago`;
  }
  
  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  
  return `${m}:${s.toString().padStart(2, '0')}`;
}
