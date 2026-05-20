'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export function HeroForm() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const router = useRouter();

  const validateUrl = (urlToValidate: string) => {
    const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    return regex.test(urlToValidate);
  };

  const submitAnalysis = async (youtubeUrl: string) => {
    setError('');
    setIsSubmitting(true);
    setSubmitSuccess(false);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ youtubeUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to analyze video');
      }

      const data = await response.json();
      const { analysis_id } = data;

      setSubmitSuccess(true);
      
      // Small delay to show success state before redirect
      setTimeout(() => {
        router.push(`/watch/${analysis_id}`);
      }, 500);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateUrl(url)) {
      setError('Please enter a valid YouTube URL');
      return;
    }
    
    await submitAnalysis(url);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text').trim();
    if (validateUrl(pastedText)) {
      setUrl(pastedText);
      submitAnalysis(pastedText);
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
              if (submitSuccess) setSubmitSuccess(false);
            }}
            onPaste={handlePaste}
            disabled={isSubmitting}
            className={`w-full h-[56px] px-8 text-lg border rounded-full focus:ring-1 shadow-sm outline-none transition-all ${
              error 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                : submitSuccess
                  ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                  : 'border-gray-400 focus:border-[#3b82f6] focus:ring-[#3b82f6]'
            } ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          />
          {isSubmitting && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-blue-500"></div>
            </div>
          )}
        </div>
        <button 
          type="submit" 
          disabled={!url || isSubmitting}
          className="h-[56px] px-10 bg-[#3b82f6] text-white text-[18px] font-semibold rounded-[28px] hover:bg-[#2563eb] disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center min-w-[140px]"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Analyzing...
            </span>
          ) : submitSuccess ? (
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Success!
            </span>
          ) : (
            'Analyze'
          )}
        </button>
      </div>
      {error && (
        <div className="w-full flex items-start gap-2 ml-4">
          <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}
      {submitSuccess && (
        <div className="w-full flex items-start gap-2 ml-4">
          <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-green-600 text-sm font-medium">Analysis started! Redirecting...</p>
        </div>
      )}
      <p className="text-sm text-gray-500 font-medium mt-4">
        Analysis takes ~2 minutes
      </p>
    </form>
  );
}
