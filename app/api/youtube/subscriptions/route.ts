import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { parseDuration, formatViewCount, formatRelativeDate as formatDate, VideoItem } from '@/lib/youtube/utils';

const YOUTUBE_SUBS_API = 'https://www.googleapis.com/youtube/v3/subscriptions';
const YOUTUBE_VIDEOS_API = 'https://www.googleapis.com/youtube/v3/videos';

interface YouTubeSubItem {
  id: string;
  snippet: {
    title: string;
    resourceId?: { channelId?: string };
    thumbnails?: { default?: { url: string } };
  };
}

interface YouTubeSearchItem {
  id: { videoId: string };
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

async function fetchRecentVideos(channelId: string | undefined, accessToken: string): Promise<VideoItem[]> {
  if (!channelId) return [];

  const searchRes = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=10&order=date&type=video`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!searchRes.ok) return [];

  const searchData = await searchRes.json();
  const videoIds: string[] = (searchData.items as YouTubeSearchItem[] || [])
    .map((i) => i.id.videoId)
    .filter(Boolean);
  if (videoIds.length === 0) return [];

  const vidsRes = await fetch(
    `${YOUTUBE_VIDEOS_API}?part=contentDetails,statistics,snippet&id=${videoIds.slice(0, 5).join(',')}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!vidsRes.ok) return [];

  const vidsData = await vidsRes.json();
  return (vidsData.items as YouTubeVideoResponse[] || []).map((item) => ({
    id: item.id,
    title: item.snippet.title,
    channel: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails?.high?.url || '',
    duration: parseDuration(item.contentDetails?.duration || ''),
    viewCount: formatViewCount(item.statistics?.viewCount),
    publishedAt: formatDate(item.snippet.publishedAt),
  }));
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const accessToken = session.provider_token;
  if (!accessToken) {
    return NextResponse.json({ error: 'No YouTube access. Please sign in with Google.' }, { status: 403 });
  }

  try {
    const subsRes = await fetch(
      `${YOUTUBE_SUBS_API}?part=snippet&mine=true&maxResults=25&order=alphabetical`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!subsRes.ok) throw new Error(`Subscriptions fetch failed: ${subsRes.status}`);
    const subsData = await subsRes.json();

    const subscriptions = (subsData.items as YouTubeSubItem[] || []).map((item) => ({
      id: item.snippet.resourceId?.channelId || item.id,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails?.default?.url || '',
    }));

    const recentVideos = await fetchRecentVideos(subscriptions[0]?.id, accessToken);

    return NextResponse.json({ subscriptions, recentVideos });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch subscriptions';
    console.error('[youtube/subscriptions]', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
