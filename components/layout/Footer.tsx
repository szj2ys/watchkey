import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="py-8 border-t border-[rgba(255,255,255,0.04)] mt-auto">
      <div className="container mx-auto px-4">
        <nav className="flex justify-center items-center gap-8 text-sm text-muted-foreground">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          <span className="text-muted-foreground/60">&copy; {new Date().getFullYear()} WatchKey</span>
        </nav>
      </div>
    </footer>
  );
}
