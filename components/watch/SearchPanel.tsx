'use client';

import React, { useState } from 'react';
import { Play, Search, Loader2 } from 'lucide-react';
import { formatDuration } from '@/lib/youtube/utils';
import type { SearchResult } from './types';

interface Props {
  onAnalyze: (videoId: string) => void;
}

export function SearchPanel({ onAnalyze }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const handleSearch = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    try {
      const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      setSearchResults(data.items || []);
    } finally { setSearchLoading(false); }
  };

  return (
    <>
      <button onClick={() => setShowSearch(!showSearch)}
        className="p-2 hover:bg-[#272727] rounded-full transition-colors flex-shrink-0">
        <Search className="w-5 h-5" />
      </button>

      {showSearch && (
        <div className="border-t border-[#272727] px-4 py-3">
          <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl">
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search YouTube videos..."
              className="flex-1 h-10 px-4 bg-[#121212] border border-[#303030] rounded-full text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none text-sm" />
            <button type="submit" disabled={searchLoading || !searchQuery.trim()}
              className="h-10 px-5 bg-[#263850] hover:bg-blue-600 disabled:opacity-50 rounded-full text-sm font-medium transition-colors flex items-center gap-2">
              {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </button>
          </form>
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="p-4 lg:p-6 border-b border-[#272727]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm">Search Results</h2>
            <button onClick={() => setSearchResults([])} className="text-xs text-gray-500 hover:text-white">Clear</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {searchResults.map(v => (
              <button key={v.id} onClick={() => onAnalyze(v.id)} className="group text-left">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-[#1a1a1a] mb-2">
                  {v.thumbnail ? (
                    <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Play className="w-8 h-8 text-gray-600" /></div>
                  )}
                  <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">{formatDuration(v.duration)}</span>
                </div>
                <h3 className="text-sm font-medium line-clamp-2 group-hover:text-blue-400 transition-colors">{v.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{v.channel}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
