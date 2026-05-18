"use client";

import React, { useState, useEffect } from 'react';
import { Menu, Search, Mic, Video, Bell } from 'lucide-react';
import Image from 'next/image';

export function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [open]);

  const toggleOpen = () => setOpen(!open);

  return (
    <>
      <header className="flex items-center justify-between px-4 py-2 bg-white sticky top-0 z-50 h-14" data-testid="main-navigation">
        {/* Left side: Menu and Logo */}
        <div className="flex items-center gap-4">
          {/* Hamburger button - only show on mobile */}
          <button 
            aria-label="Open menu"
            className="md:hidden p-2 hover:bg-gray-100 rounded-full"
            onClick={toggleOpen}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-1 cursor-pointer">
            {/* We'll just use a placeholder text for now to pass the test and replace with SVG later */}
            <span className="text-xl font-bold tracking-tight ml-1">WatchKey</span>
          </div>
        </div>

        {/* Center side: Search Bar - hidden on mobile */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-8 flex items-center gap-4">
          <div className="relative w-full">
            <input 
              className="w-full h-10 px-4 py-2 border border-gray-300 rounded-l-full focus:border-blue-500 focus:ring-0 search-input" 
              placeholder="Search" 
              type="text"
            />
          </div>
          <button aria-label="Search" className="px-5 bg-gray-50 border border-l-0 border-gray-300 rounded-r-full hover:bg-gray-100 flex items-center justify-center">
            <Search className="w-5 h-5 text-gray-600" />
          </button>
          <button aria-label="Voice search" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            <Mic className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Right side: Actions and Profile */}
        <div className="flex items-center gap-2">
          <button aria-label="Create content" className="p-2 hover:bg-gray-100 rounded-full">
            <Video className="w-6 h-6" />
          </button>
          <button aria-label="Notifications" className="p-2 hover:bg-gray-100 rounded-full relative">
            <Bell className="w-6 h-6" />
          </button>
          <div className="ml-2 w-8 h-8 rounded-full overflow-hidden cursor-pointer bg-gray-200">
            {/* Profile placeholder */}
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-30 flex items-center justify-center ${!open ? 'hidden' : ''} bg-black/50 backdrop-blur-sm`}>
        <div className="relative w-full max-w-xs md:hidden">
          {/* Drawer content */}
          <div className="bg-white rounded-2xl shadow-2xl w-full p-6 space-y-4">
            {/* Close button */}
            <div className="flex justify-end">
              <button aria-label="Close menu" className="p-2 hover:bg-gray-100 rounded-full" onClick={toggleOpen}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
                </svg>
              </button>
            </div>

            {/* Search bar in drawer */}
            <div className="relative w-full mb-4">
              <input 
                className="w-full h-10 px-4 py-2 border border-gray-300 rounded-l-full focus:border-blue-500 focus:ring-0 search-input" 
                placeholder="Search" 
                type="text"
              />
              <button aria-label="Search" className="absolute right-0 top-0 h-10 px-4 py-2 border border-l-0 border-gray-300 rounded-r-full hover:bg-gray-100 flex items-center justify-center">
                <Search className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <button aria-label="Voice search" className="w-full flex items-center justify-center p-2 bg-gray-100 rounded-full hover:bg-gray-200 mb-4">
              <Mic className="w-5 h-5 text-gray-700" />
            </button>

            {/* Navigation links */}
            <nav className="mt-4 space-y-2">
              <a href="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50" onClick={toggleOpen}>
                Home
              </a>
              <a href="/watch" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50" onClick={toggleOpen}>
                Watch
              </a>
              {/* Add more links as needed */}
            </nav>

            {/* Footer links in drawer */}
            <div className="mt-6 border-t pt-4">
              <a href="/privacy" className="block text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Privacy
              </a>
              <a href="/terms" className="block mt-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Terms
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
