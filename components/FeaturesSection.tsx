import React, { useState, useEffect } from 'react';
import { TRANSLATIONS } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { Feature } from '../types';
import { Play, Image as ImageIcon, FileText } from 'lucide-react';

interface FeaturesSectionProps {
  maxItems?: number;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ maxItems = 6 }) => {
  const { language } = useLanguage();
  const t = TRANSLATIONS[language];
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch features from localStorage (in a real app, this would be from an API)
    try {
      const stored = localStorage.getItem('academy_features');
      if (stored) {
        const allFeatures = JSON.parse(stored) as Feature[];
        // Sort by publish date, most recent first
        const sorted = allFeatures.sort((a, b) => 
          new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
        );
        setFeatures(sorted.slice(0, maxItems));
      }
    } catch (error) {
      console.error('Error loading features:', error);
    } finally {
      setLoading(false);
    }
  }, [maxItems]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">{t.features.title}</h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">{t.features.subtitle}</p>
        </div>

        {/* Features Grid */}
        {features.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.id}
                className="group bg-slate-800 rounded-lg overflow-hidden hover:shadow-xl hover:shadow-primary-500/20 transition duration-300"
              >
                {/* Media Container */}
                <div className="relative aspect-video bg-slate-700 overflow-hidden">
                  {feature.type === 'video' && feature.mediaUrl && (
                    <>
                      <img
                        src={`https://img.youtube.com/vi/${extractYouTubeId(feature.mediaUrl)}/maxresdefault.jpg`}
                        alt={feature.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.src = 'https://via.placeholder.com/400x300?text=Video';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition">
                        <div className="bg-primary-500 rounded-full p-4 group-hover:scale-110 transition">
                          <Play className="w-6 h-6 text-white fill-white" />
                        </div>
                      </div>
                    </>
                  )}
                  {feature.type === 'image' && feature.mediaUrl && (
                    <>
                      <img
                        src={feature.mediaUrl}
                        alt={feature.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.src = 'https://via.placeholder.com/400x300?text=Image';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition">
                        <ImageIcon className="w-12 h-12 text-white opacity-70" />
                      </div>
                    </>
                  )}
                  {feature.type === 'text' && (
                    <div className="w-full h-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
                      <FileText className="w-12 h-12 text-white opacity-70" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-block px-3 py-1 bg-primary-500/20 text-primary-300 text-sm rounded-full">
                      {feature.type === 'video' && t.features.video}
                      {feature.type === 'image' && t.features.image}
                      {feature.type === 'text' && t.features.text}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary-400 transition">
                    {feature.title}
                  </h3>

                  <p className="text-slate-300 mb-4 line-clamp-3">{feature.description}</p>

                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <span>{formatDate(feature.publishDate, language)}</span>
                    <a
                      href={feature.type === 'video' && feature.mediaUrl ? feature.mediaUrl : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-400 hover:text-primary-300 font-semibold"
                    >
                      {t.features.viewMore}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-slate-400">{t.features.noFeatures}</p>
          </div>
        )}
      </div>
    </section>
  );
};

// Helper functions
function extractYouTubeId(url: string): string {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : '';
}

function formatDate(date: Date, language: string): string {
  const d = new Date(date);
  if (language === 'en') {
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } else if (language === 'ar') {
    return d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });
  } else if (language === 'fa') {
    return d.toLocaleDateString('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' });
  } else if (language === 'ps') {
    return d.toLocaleDateString('ps-AF', { year: 'numeric', month: 'short', day: 'numeric' });
  }
  return d.toLocaleDateString();
}
