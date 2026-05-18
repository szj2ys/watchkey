import { Header } from "@/components/Header";
import { Features } from "@/components/Features";
import { HeroForm } from "@/components/HeroForm";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">
      <Header />
      <main className="flex-grow flex flex-col items-center px-4 -mt-14">
        <div className="min-h-[80vh] flex flex-col items-center justify-center w-full">
          <div className="text-center space-y-4 max-w-4xl w-full">
            {/* Hero section */}
            <h1 className="text-[40px] md:text-[64px] tracking-tighter text-[#0f0f0f] leading-tight font-extrabold">
              Understand any video in minutes
            </h1>
            <p className="text-[18px] md:text-[22px] text-[#0f0f0f] font-normal pt-2">
              AI-generated chapters, summaries, and transcripts.
            </p>
            
            {/* Input Form extracted to client component */}
            <HeroForm />
          </div>
        </div>
        
        <Features />
      </main>
      
      <footer className="py-8 border-t border-gray-100 mt-auto">
        <div className="container mx-auto px-4">
          <nav className="flex justify-center items-center gap-8 text-sm font-medium text-gray-600">
            <a href="/privacy" className="hover:text-gray-900 transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-gray-900 transition-colors">Terms</a>
            <span className="text-gray-400">© 2026 WatchKey</span>
          </nav>
        </div>
      </footer>
    </div>
  );
}
