import React from 'react';
import { List, AlignLeft, Clock } from 'lucide-react';

export function Features() {
  const features = [
    {
      title: 'Smart Chapters',
      description: 'Automatically divide any video into logical sections. Click to jump directly to the part you need.',
      icon: <List className="w-6 h-6 text-white/60" />
    },
    {
      title: 'AI Summaries',
      description: 'Get the key points and takeaways without watching the whole video. Read the gist in seconds.',
      icon: <AlignLeft className="w-6 h-6 text-white/60" />
    },
    {
      title: 'Full Transcripts',
      description: 'Click any timestamp to jump to that moment. Search, read, and export the full transcript.',
      icon: <Clock className="w-6 h-6 text-white/60" />
    }
  ];

  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-16 lg:py-24" data-testid="features-section">
      <h2 className="text-2xl lg:text-3xl font-bold text-center mb-4 font-heading tracking-tight text-white">Everything you need</h2>
      <p className="text-[#666] text-center mb-12 max-w-lg mx-auto">
        Powerful AI tools to understand any YouTube video faster.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="p-6 glass-card glass-card-hover rounded-xl"
            data-testid="feature-card"
          >
            <div className="w-12 h-12 bg-white/[0.06] rounded-full flex items-center justify-center mb-4 ring-1 ring-[rgba(255,255,255,0.06)]">
              {feature.icon}
            </div>
            <h3 className="text-lg font-bold mb-2 text-white font-heading">{feature.title}</h3>
            <p className="text-[#666] text-sm leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
