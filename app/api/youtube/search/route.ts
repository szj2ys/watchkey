import { NextRequest, NextResponse } from 'next/server';
import { parseDuration, formatViewCount, formatRelativeDate as formatDate, VideoItem } from '@/lib/youtube/utils';
import { setupProxy } from '@/lib/proxy';

const YOUTUBE_SEARCH_API = 'https://www.googleapis.com/youtube/v3/search';
const YOUTUBE_VIDEOS_API = 'https://www.googleapis.com/youtube/v3/videos';

interface YouTubeSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails?: { high?: { url: string }; medium?: { url: string } };
  };
}

interface YouTubeVideoDetail {
  id: string;
  contentDetails?: { duration: string };
  statistics?: { viewCount: string };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const q = request.nextUrl.searchParams.get('q');
  if (!q) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'YouTube API key not configured' }, { status: 503 });
  }

  await setupProxy();

  try {
    const searchRes = await fetch(
      `${YOUTUBE_SEARCH_API}?part=snippet&q=${encodeURIComponent(q)}&type=video&maxResults=20&key=${apiKey}`
    );
    
    if (!searchRes.ok) {
      throw new Error(`YouTube search failed: ${searchRes.status}`);
    }
    
    const searchData = await searchRes.json();

    const videoIds: string[] = (searchData.items as YouTubeSearchItem[] || [])
      .map((item) => item.id?.videoId)
      .filter((id): id is string => Boolean(id));

    if (videoIds.length === 0) {
      return NextResponse.json({ items: [] });
    }

    const detailsRes = await fetch(
      `${YOUTUBE_VIDEOS_API}?part=contentDetails,statistics&id=${videoIds.join(',')}&key=${apiKey}`
    );
    
    if (!detailsRes.ok) {
      throw new Error(`YouTube details failed: ${detailsRes.status}`);
    }
    
    const detailsData = await detailsRes.json();

    const detailsMap = new Map<string, YouTubeVideoDetail>(
      (detailsData.items as YouTubeVideoDetail[] || []).map((item) => [item.id, item])
    );

    const items: VideoItem[] = (searchData.items as YouTubeSearchItem[] || []).map((item) => {
      const id = item.id.videoId;
      const detail = detailsMap.get(id);
      const duration = parseDuration(detail?.contentDetails?.duration || '');
      return {
        id,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || '',
        duration,
        viewCount: formatViewCount(detail?.statistics?.viewCount),
        publishedAt: formatDate(item.snippet.publishedAt),
      };
    });

    return NextResponse.json({ items });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Search failed';
    console.error('[youtube/search]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
