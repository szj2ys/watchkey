import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="py-8 border-t border-[#272727] mt-auto">
      <div className="container mx-auto px-4">
        <nav className="flex justify-center items-center gap-8 text-sm font-medium text-gray-500">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          <span className="text-gray-400">© {new Date().getFullYear()} WatchKey</span>
        </nav>
      </div>
    </footer>
  );
}
