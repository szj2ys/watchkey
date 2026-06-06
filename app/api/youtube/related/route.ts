import { NextRequest, NextResponse } from 'next/server';
import { parseDuration, formatViewCount, formatRelativeDate as formatDate, VideoItem } from '@/lib/youtube/utils';
import { setupProxy } from '@/lib/proxy';

interface YouTubeSearchItem {
  id?: { videoId?: string };
}

interface YouTubeVideoResponse {
  id: string;
  snippet: {
    title: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails?: { high?: { url: string } };
  };
  contentDetails?: { duration: string };
  statistics?: { viewCount: string };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const videoId = request.nextUrl.searchParams.get('videoId');
  if (!videoId) {
    return NextResponse.json({ error: 'Missing videoId' }, { status: 400 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'YouTube API key not configured' }, { status: 503 });
  }

  await setupProxy();

  try {
    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&relatedToVideoId=${videoId}&type=video&maxResults=10&key=${apiKey}`
    );
    if (!searchRes.ok) throw new Error(`Related search failed: ${searchRes.status}`);
    const searchData = await searchRes.json();

    const videoIds: string[] = (searchData.items as YouTubeSearchItem[] || [])
      .map((i) => i.id?.videoId)
      .filter((id): id is string => Boolean(id));
    if (videoIds.length === 0) return NextResponse.json({ items: [] });

    const vidsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics,snippet&id=${videoIds.join(',')}&key=${apiKey}`
    );
    if (!vidsRes.ok) throw new Error(`Videos detail failed: ${vidsRes.status}`);
    const vidsData = await vidsRes.json();

    const items: VideoItem[] = (vidsData.items as YouTubeVideoResponse[] || []).map((item) => ({
      id: item.id,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails?.high?.url || '',
      duration: parseDuration(item.contentDetails?.duration || ''),
      viewCount: formatViewCount(item.statistics?.viewCount),
      publishedAt: formatDate(item.snippet.publishedAt),
    }));

    return NextResponse.json({ items });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed';
    console.error('[youtube/related]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
