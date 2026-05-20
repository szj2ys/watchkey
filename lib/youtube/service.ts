import { extractYouTubeId } from './parser';

export interface YouTubeVideoDetails {
  youtubeId: string;
  title: string;
  channel: string;
  duration: number; // in seconds
  thumbnailUrl: string;
}

interface TranscriptEntry {
  text: string;
  startTime: number;
}

/**
 * Fetch YouTube video metadata using YouTube Data API v3.
 * Falls back to basic metadata extraction if API key is not available.
 */
export async function getYouTubeVideoDetails(
  videoId: string
): Promise<YouTubeVideoDetails> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (apiKey) {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        throw new Error('Video not found');
      }

      const item = data.items[0];
      const snippet = item.snippet;
      const contentDetails = item.contentDetails;

      const duration = parseISO8601Duration(contentDetails.duration);

      return {
        youtubeId: videoId,
        title: snippet.title,
        channel: snippet.channelTitle,
        duration,
        thumbnailUrl: snippet.thumbnails.high.url,
      };
    } catch (error) {
      console.error('Error fetching YouTube metadata via API:', error);
      return getBasicYouTubeMetadata(videoId);
    }
  } else {
    return getBasicYouTubeMetadata(videoId);
  }
}

async function getBasicYouTubeMetadata(
  videoId: string
): Promise<YouTubeVideoDetails> {
  return {
    youtubeId: videoId,
    title: `YouTube Video ${videoId}`,
    channel: 'Unknown Channel',
    duration: 0,
    thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
  };
}

function parseISO8601Duration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Fetch transcript for a YouTube video.
 * Uses youtube-transcript package with proxy support via undici.
 * Returns structured entries with timestamps.
 */
export async function fetchYouTubeTranscript(
  videoId: string
): Promise<TranscriptEntry[]> {
  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || process.env.https_proxy || process.env.http_proxy;

  // Set up proxy for fetch if needed
  if (proxyUrl) {
    try {
      const { ProxyAgent, setGlobalDispatcher } = await import('undici');
      setGlobalDispatcher(new ProxyAgent(proxyUrl));
    } catch (e) {
      console.warn('[youtube] Failed to set up proxy:', e);
    }
  }

  try {
    const { YoutubeTranscript } = await import('youtube-transcript');
    const raw = await YoutubeTranscript.fetchTranscript(videoId);

    const entries: TranscriptEntry[] = raw.map((item: any) => ({
      text: item.text.replace(/\n/g, ' ').trim(),
      startTime: Math.round((item.offset || 0) / 1000),
    }));

    console.log(`[youtube] Got ${entries.length} transcript entries for ${videoId}`);
    return entries;
  } catch (error) {
    console.error('Error fetching transcript:', error);
  }

  console.warn(`[youtube] All transcript methods failed for ${videoId}`);
  return [];
}
