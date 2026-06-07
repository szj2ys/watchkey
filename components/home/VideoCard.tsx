'use client';

import { Play } from 'lucide-react';
import { formatDuration, handleAnalyze, VideoItem } from '@/lib/youtube/utils';

interface Props {
  video: VideoItem;
}

export function VideoCard({ video }: Props) {
  return (
    <button onClick={() => handleAnalyze(video.id)} className="group text-left">
      <div className="relative aspect-video rounded-xl overflow-hidden bg-[#1a1a1a] mb-2">
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="w-10 h-10 text-gray-400" />
          </div>
        )}
        <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
          {formatDuration(video.duration)}
        </span>
      </div>
      <h3 className="text-sm font-medium line-clamp-2 group-hover:text-blue-400 transition-colors leading-snug">
        {video.title}
      </h3>
      <p className="text-xs text-gray-400 mt-1">{video.channel}</p>
      <p className="text-xs text-gray-400">
        {video.viewCount} views &middot; {video.publishedAt}
      </p>
    </button>
  );
}
