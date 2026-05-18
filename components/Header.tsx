import React from 'react';
import { Menu, Search, Mic, Video, Bell } from 'lucide-react';
import Image from 'next/image';

export function Header() {
  return (
    <header className="flex items-center justify-between px-4 py-2 bg-white sticky top-0 z-50 h-14" data-testid="main-navigation">
      {/* Left side: Menu and Logo */}
      <div className="flex items-center gap-4">
        <button aria-label="Menu" className="p-2 hover:bg-gray-100 rounded-full">
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-1 cursor-pointer">
          {/* We'll just use a placeholder text for now to pass the test and replace with SVG later */}
          <span className="text-xl font-bold tracking-tight ml-1">WatchKey</span>
        </div>
      </div>

      {/* Center side: Search Bar */}
      <div className="flex-1 max-w-2xl mx-8 flex items-center gap-4">
        <div className="flex w-full">
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
        </div>
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
  );
}
