import React from "react";
import Link from "next/link";
import { Menu, Search, Mic, Video, Bell } from "lucide-react";

export function Header() {
  return (
    <header className="flex items-center justify-between px-4 py-2 bg-white sticky top-0 z-50 h-14 border-b border-gray-100">
      {/* Left side: Menu and Logo */}
      <div className="flex items-center gap-4">
        <button aria-label="Menu" className="p-2 hover:bg-gray-100 rounded-full">
          <Menu className="w-6 h-6" />
        </button>
        <Link href="/" className="flex items-center gap-1 cursor-pointer">
          <div className="w-8 h-8 flex items-center justify-center">
            <svg className="w-full h-full text-[#3b82f6]" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6L8 18L12 6L16 18L20 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></path>
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight ml-1">WatchKey</span>
        </Link>
      </div>

      {/* Center side: Search Bar */}
      <div className="flex-1 max-w-2xl mx-8 flex items-center gap-4 hidden md:flex">
        <div className="flex w-full">
          <div className="relative w-full">
            <input 
              className="w-full h-10 px-4 py-2 border border-gray-300 rounded-l-full focus:border-[#3b82f6] focus:ring-0 outline-none" 
              placeholder="Search" 
              type="text" 
            />
          </div>
          <button aria-label="Search" className="px-5 bg-gray-50 border border-l-0 border-gray-300 rounded-r-full hover:bg-gray-100 flex items-center justify-center">
            <Search className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <button aria-label="Voice search" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 flex-shrink-0">
          <Mic className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Right side: Actions and Profile */}
      <div className="flex items-center gap-2">
        <button aria-label="Create content" className="p-2 hover:bg-gray-100 rounded-full hidden sm:block">
          <Video className="w-6 h-6" />
        </button>
        <button aria-label="Notifications" className="p-2 hover:bg-gray-100 rounded-full relative hidden sm:block">
          <Bell className="w-6 h-6" />
        </button>
        <div className="ml-2 w-8 h-8 rounded-full overflow-hidden cursor-pointer bg-gray-200">
          <svg className="w-full h-full text-gray-400 mt-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
          </svg>
        </div>
      </div>
    </header>
  );
}
