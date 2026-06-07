import React from 'react';
import { List, AlignLeft, Clock } from 'lucide-react';

export function Features() {
  const features = [
    {
      title: 'Smart Chapters',
      description: 'Automatically divide any video into logical sections. Click to jump directly to the part you need.',
      icon: <List className="w-6 h-6 text-blue-400" />
    },
    {
      title: 'AI Summaries',
      description: 'Get the key points and takeaways without watching the whole video. Read the gist in seconds.',
      icon: <AlignLeft className="w-6 h-6 text-blue-400" />
    },
    {
      title: 'Full Transcripts',
      description: 'Click any timestamp to jump to that moment. Search, read, and export the full transcript.',
      icon: <Clock className="w-6 h-6 text-blue-400" />
    }
  ];

  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-16 lg:py-24" data-testid="features-section">
      <h2 className="text-2xl lg:text-3xl font-bold text-center mb-4">Everything you need</h2>
      <p className="text-gray-400 text-center mb-12 max-w-lg mx-auto">
        Powerful AI tools to understand any YouTube video faster.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="p-6 bg-[#1a1a1a] rounded-2xl border border-[#272727] hover:border-[#3a3a3a] transition-colors"
            data-testid="feature-card"
          >
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
              {feature.icon}
            </div>
            <h3 className="text-lg font-bold mb-2 text-white">{feature.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
