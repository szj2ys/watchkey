import { proxyFetch } from '@/lib/proxy';
import { parseDuration } from '@/lib/youtube/utils';
import { fetchWithProxy } from '@/lib/fetch';

export interface YouTubeVideoDetails {
  youtubeId: string;
  title: string;
  channel: string;
  duration: number;
  thumbnailUrl: string;
}

interface TranscriptEntry {
  text: string;
  startTime: number;
}

interface YouTubeVideoResponse {
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: { high: { url: string } };
  };
  contentDetails: { duration: string };
}

interface YouTubeTranscriptItem {
  text: string;
  offset: number;
}

export async function getYouTubeVideoDetails(
  videoId: string
): Promise<YouTubeVideoDetails> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (apiKey) {
    try {
      const response = await proxyFetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        throw new Error('Video not found');
      }

      const item: YouTubeVideoResponse = data.items[0];
      const snippet = item.snippet;
      const contentDetails = item.contentDetails;

      const duration = parseDuration(contentDetails.duration);

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

function getBasicYouTubeMetadata(videoId: string): YouTubeVideoDetails {
  return {
    youtubeId: videoId,
    title: `YouTube Video ${videoId}`,
    channel: 'Unknown Channel',
    duration: 0,
    thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
  };
}


export async function fetchYouTubeTranscript(
  videoId: string
): Promise<TranscriptEntry[]> {
  try {
    const { YoutubeTranscript } = await import('youtube-transcript');
    const raw: YouTubeTranscriptItem[] = await YoutubeTranscript.fetchTranscript(videoId, { fetch: fetchWithProxy as unknown as typeof fetch });

    const entries: TranscriptEntry[] = raw.map((item: YouTubeTranscriptItem) => ({
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
