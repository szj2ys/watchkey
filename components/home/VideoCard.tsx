'use client';

import { Play } from 'lucide-react';
import { formatDuration, handleAnalyze, VideoItem } from '@/lib/youtube/utils';

interface Props {
  video: VideoItem;
}

export function VideoCard({ video }: Props) {
  return (
    <button onClick={() => handleAnalyze(video.id)} className="group text-left">
      <div className="relative aspect-video rounded-lg overflow-hidden bg-white/[0.03] mb-2 border border-[rgba(255,255,255,0.04)]">
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="w-10 h-10 text-[#333]" />
          </div>
        )}
        <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded">
          {formatDuration(video.duration)}
        </span>
      </div>
      <h3 className="text-sm font-medium line-clamp-2 group-hover:text-white transition-colors leading-snug text-gray-400">
        {video.title}
      </h3>
      <p className="text-xs text-[#555] mt-1">{video.channel}</p>
      <p className="text-xs text-[#444]">
        {video.viewCount} views &middot; {video.publishedAt}
      </p>
    </button>
  );
}
