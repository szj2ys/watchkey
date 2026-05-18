import React from 'react';
import { FileText, AlignLeft, List } from 'lucide-react';

export function Features() {
  const features = [
    {
      title: 'AI Chapters',
      description: 'Automatically divide any video into logical chapters with timestamps.',
      icon: <List className="w-6 h-6 text-blue-500" />
    },
    {
      title: 'Smart Summaries',
      description: 'Get the key points and takeaways without watching the whole video.',
      icon: <AlignLeft className="w-6 h-6 text-blue-500" />
    },
    {
      title: 'Full Transcripts',
      description: 'Searchable, accurate transcripts generated in seconds.',
      icon: <FileText className="w-6 h-6 text-blue-500" />
    }
  ];

  return (
    <section className="w-full max-w-6xl mx-auto py-16 px-4" data-testid="features-section">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            data-testid="feature-card"
          >
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
