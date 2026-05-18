import React from "react";
import { Header } from "@/components/layout/Header";

export default function WatchPage() {
  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans">
      <Header />
      
      <main className="max-w-[1400px] mx-auto p-4 lg:p-6 w-full flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Video and Info */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Video Player Section */}
            <section className="bg-black rounded-2xl overflow-hidden shadow-xl aspect-video relative group flex items-center justify-center">
              <div className="text-center text-white">
                <svg className="w-20 h-20 mx-auto mb-3 opacity-60" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <p className="text-sm opacity-70">YouTube Player</p>
              </div>
            </section>

            {/* Video Metadata */}
            <section>
              <h1 className="text-2xl font-bold mb-1">Understanding AI Video Analysis: A Deep Dive</h1>
              <p className="text-sm text-slate-500 mb-6">1.2M views • 2 days ago</p>
              
              <div className="flex items-center justify-between border-b border-slate-200 pb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                    <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 6L8 18L12 6L16 18L20 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold">WatchKey Official</h3>
                    <p className="text-xs text-slate-500">245K subscribers</p>
                  </div>
                </div>
                <button className="bg-slate-900 text-white px-6 py-2 rounded-full font-semibold hover:bg-slate-800 transition-colors">
                  Subscribe
                </button>
              </div>
            </section>

            {/* Insights (Summary & Transcript) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* AI Summary */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">AI Summary</h2>
                  <button className="text-slate-400 hover:text-slate-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M5 15l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                    </svg>
                  </button>
                </div>
                <ul className="space-y-3 text-sm text-slate-600 list-disc pl-4">
                  <li>Overview of AI-powered analysis techniques.</li>
                  <li>Key benefits for content creators.</li>
                  <li>Future trends in video intelligence.</li>
                </ul>
              </div>

              {/* Transcript */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">Transcript</h2>
                  <button className="text-slate-400 hover:text-slate-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M5 15l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                    </svg>
                  </button>
                </div>
                <div className="space-y-3 text-sm h-[120px] overflow-y-auto pr-2">
                  <div className="flex gap-3">
                    <span className="text-blue-500 font-medium underline cursor-pointer">[00:15]</span>
                    <p className="text-slate-600">Welcome back to WatchKey.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-blue-500 font-medium underline cursor-pointer">[00:23]</span>
                    <p className="text-slate-600">Today, we&apos;re exploring video analysis.</p>
                  </div>
                </div>
              </div>
            </div>
            
          </div>

          {/* Right Column: Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            
            {/* Chapters Section */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold mb-6">Chapters</h2>
              <div className="space-y-3">
                <div className="group flex items-center gap-3 p-3 bg-slate-100 hover:bg-slate-200 cursor-pointer transition-all rounded-full">
                  <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                  <span className="text-sm font-medium text-slate-700">[00:00] Introduction</span>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-blue-500 text-white shadow-lg shadow-blue-500/20 cursor-pointer transition-all rounded-full">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>
                  <span className="text-sm font-bold">[01:15] Fundamentals of Analysis</span>
                </div>
                
                <div className="group flex items-center gap-3 p-3 bg-slate-100 hover:bg-slate-200 cursor-pointer transition-all rounded-full">
                  <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                  <span className="text-sm font-medium text-slate-700">[04:30] Key Benefits</span>
                </div>
              </div>
            </section>

            {/* Up Next Section */}
            <section>
              <h2 className="text-xl font-bold mb-6">Up Next</h2>
              <div className="space-y-6">
                <div className="flex gap-3 group cursor-pointer">
                  <div className="w-40 aspect-video rounded-xl overflow-hidden bg-slate-200 flex-shrink-0"></div>
                  <div className="flex flex-col justify-center">
                    <h3 className="text-sm font-bold leading-snug group-hover:text-blue-500 transition-colors mb-1">
                      Next Video: Implementing AI Tools
                    </h3>
                    <p className="text-xs text-slate-500">WatchKey Official</p>
                  </div>
                </div>
              </div>
            </section>

          </aside>
        </div>
      </main>
    </div>
  );
}
