'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export function HeroForm() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const validateUrl = (urlToValidate: string) => {
    // Basic YouTube URL regex
    const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    return regex.test(urlToValidate);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateUrl(url)) {
      setError('Please enter a valid YouTube URL');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ youtubeUrl: url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze video');
      }

      const data = await response.json();
      const { analysis_id } = data;

      // Redirect to the watch page for this analysis
      router.push(`/watch/${analysis_id}`);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-12 flex flex-col items-center space-y-3 w-full max-w-3xl mx-auto pt-8">
      <div className="flex flex-col md:flex-row w-full gap-4">
        <div className="relative flex-grow">
          <input 
            type="text" 
            placeholder="Paste YouTube URL here" 
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError('');
            }}
            className={`w-full h-[56px] px-8 text-lg border rounded-full focus:ring-1 shadow-sm outline-none transition-all ${
              error 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-400 focus:border-[#3b82f6] focus:ring-[#3b82f6]'
            }`}
          />
        </div>
        <button 
          type="submit" 
          disabled={!url || isSubmitting}
          className="h-[56px] px-10 bg-[#3b82f6] text-white text-[18px] font-semibold rounded-[28px] hover:bg-[#2563eb] disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center min-w-[140px]"
        >
          {isSubmitting ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-1 w-full text-left ml-4">{error}</p>
      )}
      <p className="text-sm text-gray-500 font-medium mt-4">
        Analysis takes ~2 minutes
      </p>
    </form>
  );
}
