import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BookOpen, ArrowLeft, Clock, Heart, Share2 } from 'lucide-react';
import LanguageSelector from '../components/LanguageSelector';
import { useLanguage } from '../contexts/LanguageContext';
import { TRANSLATIONS } from '../constants';
import LogoLink from '../components/LogoLink';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: string;
  audience: string;
  gradient: string;
  date: string;
  author: string;
}

const ArticleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  let t = TRANSLATIONS[language];
  
  // Fallback to English if translations are not available
  if (!t) {
    t = TRANSLATIONS['en'];
  }
  const [article, setArticle] = useState<Article | null>(null);

  if (!t) {
    return (
      <div style={{ color: 'white', padding: '20px', textAlign: 'center' }}>
        <h2>Error: Translations not loaded</h2>
      </div>
    );
  }

  useEffect(() => {
    if (t && t.dir) {
      document.documentElement.dir = t.dir;
      document.documentElement.lang = language;
    }
  }, [language, t]);

  const articles: Record<string, Article> = {
    'light-of-knowledge': {
      id: 'light-of-knowledge',
      title: 'The Light of Knowledge: Finding Truth in a World of Confusion',
      excerpt: 'In today\'s world, we\'re surrounded by information from every direction. Discover how the Qur\'an guides us to true knowledge and wisdom.',
      content: `In today's world, we're surrounded by information from every direction. Social media, news outlets, and countless voices compete for our attention, each claiming to have the truth. In this overwhelming landscape, how do we find guidance? How do we distinguish between genuine wisdom and mere opinion?

The Qur'an, the word of Allah, offers us a beacon of light. Throughout history, Muslims have turned to the Qur'an not just as a spiritual guide, but as a comprehensive source of wisdom that addresses every aspect of human life.

The process of seeking knowledge in Islam begins with sincerity. When we approach learning with a pure heart and genuine intention to serve Allah and His creation, we open ourselves to true understanding. This is why Prophet Muhammad (peace be upon him) said: "The best of you are those who learn the Qur'an and teach it."

Knowledge in Islam is not meant to be hoarded or used for personal gain. Instead, it is a trust (amanah) from Allah, and we are accountable for how we use it. Whether we share it, act upon it, or hide it – all of these choices have consequences in this life and the next.

In our online academy, we believe that quality Islamic education should be accessible to everyone, regardless of their background or location. We invite you to join us on this journey of seeking knowledge – not for worldly acclaim, but for spiritual growth and service to humanity.

Remember: "Whoever Allah intends good for, He gives them understanding of the religion." Let this intention guide your learning.`,
      category: 'Knowledge & Learning',
      readTime: '8 min read',
      audience: 'Mixed Audience',
      gradient: 'from-primary-500 to-accent-500',
      date: 'January 15, 2026',
      author: 'Islamic Scholars',
    },
    'raising-children-with-values': {
      id: 'raising-children-with-values',
      title: 'Raising Children with Islamic Values in a Modern World',
      excerpt: 'Parenting in the modern age comes with unique challenges. Learn practical approaches to instill Islamic values while allowing your children to thrive.',
      content: `The challenge of raising children with strong Islamic values has never been more relevant than in today's world. As parents, we want our children to be academically successful, emotionally healthy, AND spiritually grounded. But how do we achieve this balance?

First, we must recognize that parenting is indeed a sacred trust. The Prophet (peace be upon him) said: "All of you are guardians and all of you are responsible for your wards." This responsibility extends beyond providing food and shelter – it encompasses spiritual, emotional, and moral development.

In our academy, we help parents understand Islamic principles of child-rearing that have stood the test of time. These include:

**Leading by Example**: Children learn what they see. Our actions speak louder than our words. When we demonstrate Islamic values in our daily lives, our children naturally absorb these lessons.

**Open Communication**: Create a safe space where children feel comfortable asking questions and expressing concerns. The Prophet encouraged questions and dialogue – even challenging questions should be met with patience and wisdom.

**Balance and Moderation**: While we teach Islamic values, we should allow our children to enjoy their youth. Islam is a religion of balance (wasatiyyah), not extremism or neglect.

**Connecting with Community**: Involve your children in Islamic community activities. Peer relationships with other Muslim children strengthen their identity and provide positive role models.

The goal is not to raise perfect children, but to raise mindful humans who understand their purpose and strive to live according to Islamic principles. It's a journey, and like all journeys, it requires patience, prayer, and persistence.`,
      category: 'Family & Parenting',
      readTime: '10 min read',
      audience: 'Parents',
      gradient: 'from-accent-500 to-primary-500',
      date: 'January 10, 2026',
      author: 'Dr. Fatima Al-Rashid',
    },
    'finding-peace-in-prayer': {
      id: 'finding-peace-in-prayer',
      title: 'Finding Inner Peace Through Prayer and Reflection',
      excerpt: 'In a fast-paced world, discover how Islamic prayer offers more than ritual – it offers genuine peace and connection with the Divine.',
      content: `The modern world moves at an unprecedented pace. We're constantly connected, constantly distracted, constantly stressed. In this chaos, many people are searching for peace – real, lasting peace that goes beyond temporary relief.

Islamic prayer (Salah) is one of the most powerful tools for finding this peace. Yet many people pray mechanically, without fully experiencing its transformative potential. What if we approached prayer differently?

**Prayer is Conversation with Allah**: The Prophet (peace be upon him) taught us that prayer is our direct line of communication with Allah. It's not just a ritual; it's a conversation where we present our needs, express our gratitude, and reconnect with our purpose.

**Mindfulness in Prayer**: When we pray with full presence and awareness (khushu), we experience a level of focus that our fragmented modern lives rarely allow. We step away from our phones, our worries, our schedules, and we are fully present in the moment.

**Five Daily Anchors**: The five daily prayers serve as anchors throughout our day. They break the cycle of endless work and consumption, reminding us of what truly matters. They create rhythm and structure that our souls crave.

**Community in Prayer**: When we pray in congregation, we experience a sense of unity and belonging that extends beyond the prayer itself. We are reminded that we are part of a global community of Muslims – millions of people praying at the same time, in the same direction, with the same purpose.

Many students in our academy have shared how developing a sincere prayer practice transformed not just their spiritual life, but their mental health, relationships, and overall well-being. 

If you haven't yet experienced the true peace of prayer, we invite you to explore Islamic teachings on Salah through our courses. You might be surprised at what you discover.`,
      category: 'Spiritual Growth',
      readTime: '7 min read',
      audience: 'Mixed Audience',
      gradient: 'from-sky-500 to-primary-500',
      date: 'January 5, 2026',
      author: 'Sheikh Ahmed',
    },
  };

  useEffect(() => {
    if (id && articles[id]) {
      setArticle(articles[id]);
    } else {
      setArticle(null);
    }
  }, [id]);

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-black text-white mb-4">Article Not Found</h2>
          <button
            onClick={() => navigate('/articles')}
            className="px-6 py-3 bg-primary-500 hover:bg-primary-400 text-white rounded-xl font-bold transition-all"
          >
            Back to Articles
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0f2b]/80 backdrop-blur-2xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <LogoLink showText={false} compact />
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <Link to="/" className="px-5 py-2 bg-primary-500 text-white rounded-full text-[11px] font-black uppercase tracking-wider hover:bg-primary-400 transition-all">
                Home
            </Link>
            <Link to="/store" className="px-5 py-2 border border-white/10 text-white rounded-full text-[11px] font-black uppercase tracking-wider hover:bg-white/10 transition-all">
              Knowledge Store
            </Link>
          </div>
        </div>
      </nav>

      {/* Article Content */}
      <article className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/articles')}
            className="flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors mb-8 font-bold"
          >
            <ArrowLeft size={20} />
            {t.articles.backToArticles}
          </button>

          {/* Category Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500/20 to-accent-500/20 border border-primary-400/30 rounded-full text-primary-300 text-sm font-bold uppercase tracking-wider mb-6">
            <BookOpen size={14} />
            {article.category}
          </div>

          {/* Title */}
          <h1 className="text-5xl font-black text-white mb-6 leading-tight">
            {article.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-8 text-slate-400 mb-12 pb-8 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-primary-400" />
              <span>{article.readTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">•</span>
              <span>{article.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">•</span>
              <span>{article.author}</span>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-invert max-w-none mb-12">
            {article.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-lg text-slate-300 leading-relaxed mb-6">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Share & Actions */}
          <div className="py-8 border-t border-white/10">
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all">
              <Share2 size={18} />
              Share Article
            </button>
          </div>

          {/* Related Articles CTA */}
          <div className="mt-16 p-8 bg-gradient-to-br from-primary-500/20 to-accent-500/20 backdrop-blur-xl border border-primary-400/30 rounded-3xl text-center">
            <h3 className="text-2xl font-black text-white mb-4">
              Want to Deepen Your Knowledge?
            </h3>
            <p className="text-slate-300 mb-6">
              Explore our comprehensive courses on Islamic teachings and personal growth.
            </p>
            <button
              onClick={() => navigate('/courses')}
              className="px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-400 hover:to-accent-400 text-white font-black rounded-xl uppercase tracking-wider transition-all shadow-xl hover:shadow-2xl hover:scale-105"
            >
              {t.form.ourCourses}
            </button>
          </div>
        </div>
      </article>
    </div>
  );
};

export default ArticleDetailPage;
