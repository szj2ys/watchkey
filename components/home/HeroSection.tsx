"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export function HeroSection() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    
    setIsLoading(true);
    // 模拟分析过程，稍后跳转到 watch 页面
    setTimeout(() => {
      // 提取 video ID (简化版)
      let videoId = "mock-id";
      if (url.includes("v=")) {
        videoId = url.split("v=")[1].split("&")[0];
      } else if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1].split("?")[0];
      }
      
      router.push(`/watch?v=${videoId}`);
    }, 1500);
  };

  return (
    <main className="flex-grow flex flex-col items-center justify-center px-4 -mt-14 min-h-[80vh]">
      <div className="text-center space-y-4 max-w-4xl w-full">
        {/* Headline */}
        <h1 className="text-[40px] md:text-[64px] tracking-tighter text-[#0f0f0f] leading-tight font-extrabold">
          Understand any video in minutes
        </h1>
        
        {/* Subheadline */}
        <p className="text-[18px] md:text-[22px] text-[#0f0f0f] font-normal pt-2">
          AI-generated chapters, summaries, and transcripts.
        </p>
        
        {/* Input Group */}
        <form onSubmit={handleAnalyze} className="mt-12 flex flex-col items-center space-y-3 w-full max-w-3xl mx-auto pt-8">
          <div className="flex flex-col md:flex-row w-full gap-4">
            {/* URL Input Field */}
            <div className="relative flex-grow">
              <input 
                className="w-full h-[56px] px-8 text-lg border border-gray-400 rounded-full focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] shadow-sm outline-none transition-all" 
                placeholder="Paste YouTube URL here" 
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            {/* Action Button */}
            <button 
              type="submit"
              disabled={isLoading || !url.trim()}
              className="h-[56px] px-10 bg-[#3b82f6] text-white text-[18px] font-semibold rounded-[28px] hover:bg-[#2563eb] disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center min-w-[140px]"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Analyze"
              )}
            </button>
          </div>
          
          {/* Hint Text */}
          <p className="text-sm text-gray-500 font-medium mt-4">
            Analysis takes ~2 minutes
          </p>
        </form>
      </div>
    </main>
  );
}
