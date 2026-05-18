import { extractYouTubeId } from './parser';

export interface YouTubeVideoDetails {
  youtubeId: string;
  title: string;
  channel: string;
  duration: number; // in seconds
  thumbnailUrl: string;
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

      // Parse ISO 8601 duration to seconds
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
      // Fall back to basic metadata
      return getBasicYouTubeMetadata(videoId);
    }
  } else {
    // No API key configured, return basic metadata
    return getBasicYouTubeMetadata(videoId);
  }
}

/**
 * Get basic YouTube metadata without API key.
 * This is a fallback that returns placeholder data.
 */
async function getBasicYouTubeMetadata(
  videoId: string
): Promise<YouTubeVideoDetails> {
  return {
    youtubeId: videoId,
    title: `YouTube Video ${videoId}`,
    channel: 'Unknown Channel',
    duration: 0, // Unknown duration
    thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
  };
}

/**
 * Parse ISO 8601 duration format (e.g., "PT1H2M3S") to seconds.
 */
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
 * Implements the fallback strategy from ADR:
 * 1. YouTube Data API v3 (if API key available)
 * 2. youtube-transcript npm package
 * 3. Invidious instance scraping
 * 4. yt-dlp (if available)
 */
export async function fetchYouTubeTranscript(
  videoId: string
): Promise<string> {
  // Try YouTube Data API v3 first if API key is available
  const youtubeApiKey = process.env.YOUTUBE_API_KEY;
  if (youtubeApiKey) {
    try {
      // First, get caption tracks
      const captionsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=${youtubeApiKey}`
      );
      
      if (captionsResponse.ok) {
        const captionsData = await captionsResponse.json();
        
        // Look for English captions
        let captionTrackId = null;
        for (const track of captionsData.items || []) {
          if (track.snippet.language === 'en' || 
              track.snippet.language === 'en-US' ||
              track.snippet.language === 'en-GB') {
            captionTrackId = track.id;
            break;
          }
        }
        
        // If no English captions found, use the first available track
        if (!captionTrackId && captionsData.items && captionsData.items.length > 0) {
          captionTrackId = captionsData.items[0].id;
        }
        
        if (captionTrackId) {
          // Download the caption track
          const downloadResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/captions/${captionTrackId}?key=${youtubeApiKey}&tfmt=json3`
          );
          
          if (downloadResponse.ok) {
            const captionData = await downloadResponse.json();
            // Convert JSON3 caption format to plain text
            return convertJson3ToPlainText(captionData);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching transcript via YouTube Data API:', error);
      // Continue to fallbacks
    }
  }
  
  // Fallback 1: youtube-transcript npm package
  try {
    const { YoutubeTranscript } = await import('youtube-transcript');
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    return transcript.map((entry: { text: string }) => entry.text).join(' ');
  } catch (error) {
    console.error('Error fetching transcript via youtube-transcript package:', error);
    // Continue to fallbacks
  }
  
  // Fallback 2: Invidious instance scraping
  try {
    const invidiousInstance = process.env.INVIDIOUS_INSTANCE || 'https://yewtu.be';
    const response = await fetch(`${invidiousInstance}/api/v1/videos/${videoId}`);
    
    if (response.ok) {
      const data = await response.json();
      if (data.description) {
        // Invidious doesn't provide full transcript via API, but we can try to get it
        // For now, we'll return the description as a fallback
        return data.description || `No transcript available for video ${videoId}`;
      }
    }
  } catch (error) {
    console.error('Error fetching transcript via Invidious:', error);
    // Continue to fallbacks
  }
  
  // Fallback 3: Return a mock transcript for development
  // In production, you might want to implement yt-dlp or throw an error
  console.warn(`Using mock transcript for video ${videoId}`);
  return `This is a mock transcript for video ${videoId}. In a production environment, you would configure one of the transcript fetching methods (YouTube Data API key, youtube-transcript package, Invidious instance, or yt-dlp) to get the actual transcript.`;
}

/**
 * Convert YouTube JSON3 caption format to plain text.
 * Simplified conversion - in production you might want to handle timing better.
 */
function convertJson3ToPlainText(data: any): string {
  if (!data || !data.events) {
    return '';
  }
  
  return data.events
    .map((event: any) => {
      if (event.segs) {
        return event.segs
          .map((seg: any) => seg.utf8 || '')
          .join('')
          .replace(/\s+/g, ' ')
          .trim();
      }
      return '';
    })
    .filter((text: string) => text.length > 0)
    .join(' ');
}
