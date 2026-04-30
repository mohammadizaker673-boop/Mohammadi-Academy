import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowLeft, Clock, Heart, Share2, ChevronRight } from 'lucide-react';
import LanguageSelector from '../../components/LanguageSelector';
import LogoLink from '../../components/LogoLink';

const LightOfKnowledge: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Language Selector - Floating */}
      <div className="fixed top-6 right-6 z-50">
        <LanguageSelector />
      </div>

      {/* Logo - Floating */}
      <div className="fixed top-6 left-6 z-50">
        <LogoLink showText={false} compact />
      </div>

      {/* Back Button */}
      <div className="px-6 py-6">
        <button
          onClick={() => navigate('/articles')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-xl text-white transition-all"
        >
          <ArrowLeft size={18} />
          Back to Articles
        </button>
      </div>

      {/* Hero Section */}
      <section className="relative py-12 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-accent-500/10 blur-3xl"></div>
        
        <div className="relative max-w-4xl mx-auto">
          {/* Category Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/20 border border-primary-400/30 rounded-full text-primary-300 text-sm font-bold uppercase tracking-wider mb-6">
            <BookOpen size={14} />
            Knowledge & Learning
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            The Light of Knowledge: Finding Truth in a World of Confusion
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-6 text-slate-400 mb-8">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-primary-400" />
              <span>8 min read</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart size={16} className="text-accent-400" />
              <span>Mixed Audience</span>
            </div>
            <button className="flex items-center gap-2 hover:text-white transition-colors">
              <Share2 size={16} />
              <span>Share</span>
            </button>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-12">
            
            {/* Introduction */}
            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl font-black text-primary-300 mb-4 flex items-center gap-3">
                <ChevronRight size={24} />
                Introduction: The Search for Truth
              </h2>
              <p className="text-lg text-slate-200 leading-relaxed mb-4">
                In today's world, we're surrounded by information from every direction—social media, news, friends, family, and endless online content. A student sits with their homework, unsure which source to trust. A parent scrolls through conflicting health advice. A young professional questions their career path. We all share the same human need: <strong className="text-white">the search for truth and real knowledge.</strong>
              </p>
              <p className="text-lg text-slate-200 leading-relaxed">
                But what is truth? And how do we find it when the world feels so confusing?
              </p>
            </section>

            {/* Quranic Verses */}
            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl font-black text-primary-300 mb-6 flex items-center gap-3">
                <ChevronRight size={24} />
                Allah's Promise: Knowledge as Light
              </h2>
              
              <div className="bg-gradient-to-r from-primary-500/10 to-accent-500/10 border-r-4 border-primary-400 rounded-2xl p-6 mb-6">
                <p className="text-2xl md:text-3xl text-white font-arabic text-right leading-loose mb-4" dir="rtl">
                  قُلْ هَلْ يَسْتَوِي الَّذِينَ يَعْلَمُونَ وَالَّذِينَ لَا يَعْلَمُونَ ۗ إِنَّمَا يَتَذَكَّرُ أُولُو الْأَلْبَابِ
                </p>
                <p className="text-lg text-slate-200 italic leading-relaxed mb-2">
                  "Say, 'Are those who know equal to those who do not know?' Only they will remember [who are] people of understanding."
                </p>
                <p className="text-sm text-primary-400 font-bold">
                  [Surah Az-Zumar 39:9]
                </p>
              </div>

              <div className="bg-gradient-to-r from-accent-500/10 to-primary-500/10 border-r-4 border-accent-400 rounded-2xl p-6">
                <p className="text-2xl md:text-3xl text-white font-arabic text-right leading-loose mb-4" dir="rtl">
                  يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ
                </p>
                <p className="text-lg text-slate-200 italic leading-relaxed mb-2">
                  "Allah will raise those who have believed among you and those who were given knowledge, by degrees."
                </p>
                <p className="text-sm text-accent-400 font-bold">
                  [Surah Al-Mujadilah 58:11]
                </p>
              </div>
            </section>

            {/* Understanding */}
            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl font-black text-primary-300 mb-4 flex items-center gap-3">
                <ChevronRight size={24} />
                Understanding the Message
              </h2>
              <p className="text-lg text-slate-200 leading-relaxed mb-4">
                These verses teach us something powerful: <strong className="text-white">knowledge is not just information—it's light that guides us.</strong> The scholars of tafsir explain that true knowledge ('ilm) means understanding that leads to action, wisdom, and closeness to Allah.
              </p>
              <p className="text-lg text-slate-200 leading-relaxed">
                Ibn Kathir (may Allah have mercy on him) explained that those who seek knowledge with sincerity are elevated in this life and the next. Knowledge here means both religious understanding and beneficial worldly knowledge—science, medicine, art, anything that benefits humanity when used correctly.
              </p>
            </section>

            {/* Modern Connection */}
            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl font-black text-primary-300 mb-6 flex items-center gap-3">
                <ChevronRight size={24} />
                Connecting to Our Lives Today
              </h2>

              <div className="space-y-6">
                <div className="bg-primary-500/5 border-l-4 border-primary-400 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-3">For Students:</h3>
                  <p className="text-slate-200 leading-relaxed">
                    You sit in class wondering, "Why am I learning this?" The Qur'an answers: because knowledge elevates you. Every math problem you solve, every book you read, every skill you master—these are tools Allah has given you to serve His creation and discover His signs.
                  </p>
                </div>

                <div className="bg-accent-500/5 border-l-4 border-accent-400 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-3">For Parents:</h3>
                  <p className="text-slate-200 leading-relaxed">
                    You want to guide your children but feel overwhelmed by conflicting advice. The Prophet ﷺ taught us: <em>"Seeking knowledge is obligatory upon every Muslim."</em> [Ibn Majah]. This includes learning how to raise righteous children, manage health, and build strong families.
                  </p>
                </div>

                <div className="bg-primary-500/5 border-l-4 border-primary-400 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-3">For Professionals:</h3>
                  <p className="text-slate-200 leading-relaxed">
                    You question your career's meaning. Islam teaches that every beneficial skill—from engineering to teaching, medicine to art—is a form of worship when done with the right intention. Your work becomes 'ibadah (worship) when you use it to benefit people.
                  </p>
                </div>

                <div className="bg-accent-500/5 border-l-4 border-accent-400 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-3">For Everyone:</h3>
                  <p className="text-slate-200 leading-relaxed">
                    In an age of fake news and misinformation, the Qur'an teaches us to verify: <em>"O you who believe, if there comes to you a disobedient one with information, investigate..."</em> [Surah Al-Hujurat 49:6]
                  </p>
                </div>
              </div>
            </section>

            {/* Life Lessons */}
            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl font-black text-primary-300 mb-6 flex items-center gap-3">
                <ChevronRight size={24} />
                Life Lessons: Pearls of Wisdom
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'Knowledge begins with humility', desc: 'The more we learn, the more we realize how little we know. True scholars are the most humble.' },
                  { title: 'Intention transforms everything', desc: 'Study for Allah\'s sake, not just grades or money. Your intention purifies your efforts.' },
                  { title: 'Truth requires effort', desc: 'Easy answers are often shallow. Deep understanding takes patience, reading, asking teachers, and reflection.' },
                  { title: 'Knowledge must lead to action', desc: 'Learning without applying is like having medicine but not taking it. Use what you learn to improve yourself and help others.' },
                  { title: 'Allah is the Ultimate Teacher', desc: 'When you\'re stuck, make du\'a. Allah taught Prophet Khidr knowledge that even Prophet Musa (peace be upon him) didn\'t have.' },
                  { title: 'Every person has something to teach you', desc: 'From children to elders, scholars to workers—everyone carries knowledge worth learning.' },
                ].map((lesson, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-xl p-5 hover:border-primary-400/50 transition-all">
                    <h4 className="text-lg font-bold text-white mb-2">{lesson.title}</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">{lesson.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Action Steps */}
            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl font-black text-primary-300 mb-6 flex items-center gap-3">
                <ChevronRight size={24} />
                Practical Action Steps
              </h2>

              <div className="space-y-4">
                {[
                  { icon: '🌟', title: 'Start Your Day with Intention', desc: 'Before studying or working, say: "O Allah, increase me in knowledge" (Rabbi zidni \'ilma) [Surah Ta-Ha 20:114]' },
                  { icon: '📚', title: 'Dedicate 15 Minutes to Learning Daily', desc: 'Read Qur\'an with translation, study tafsir, learn a new skill, or read beneficial books.' },
                  { icon: '🤲', title: 'Ask Questions Respectfully', desc: 'There\'s no shame in not knowing. The Prophet ﷺ said: "The cure for ignorance is asking." [Abu Dawud]' },
                  { icon: '✅', title: 'Verify Before Sharing', desc: 'Before forwarding messages or sharing news, check: Is it true? Is it beneficial? Does it promote good?' },
                  { icon: '💡', title: 'Teach Others What You Learn', desc: 'The Prophet ﷺ said: "The best among you are those who learn the Qur\'an and teach it." [Bukhari]' },
                  { icon: '🕌', title: 'Connect with People of Knowledge', desc: 'Attend classes, listen to authentic scholars, join study circles. Good company elevates your learning.' },
                  { icon: '📝', title: 'Reflect and Journal', desc: 'Write down lessons you learn, how they apply to your life, and track your personal growth.' },
                ].map((step, idx) => (
                  <div key={idx} className="flex gap-4 bg-gradient-to-r from-primary-500/5 to-transparent border-l-4 border-primary-400 rounded-xl p-5 hover:bg-primary-500/10 transition-all">
                    <div className="text-3xl flex-shrink-0">{step.icon}</div>
                    <div>
                      <h4 className="text-lg font-bold text-white mb-2">{step.title}</h4>
                      <p className="text-slate-300 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Reflection */}
            <section className="mb-12">
              <div className="bg-gradient-to-br from-accent-500/20 to-primary-500/20 border border-accent-400/30 rounded-2xl p-8">
                <h2 className="text-2xl font-black text-white mb-4">💭 Reflection Question</h2>
                <p className="text-lg text-slate-200 leading-relaxed italic">
                  What is one thing you've learned recently—from Qur'an, life experience, or someone else—that changed how you think or act? How can you use that knowledge to become a better person tomorrow?
                </p>
              </div>
            </section>

            {/* Final Reminder */}
            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-black text-primary-300 mb-4 flex items-center gap-3">
                <ChevronRight size={24} />
                A Final Reminder
              </h2>
              <p className="text-lg text-slate-200 leading-relaxed mb-4">
                The Prophet Muhammad ﷺ taught us:
              </p>
              <div className="bg-gradient-to-r from-primary-500/10 to-accent-500/10 border-l-4 border-primary-400 rounded-xl p-6 mb-6">
                <p className="text-xl text-white italic leading-relaxed mb-2">
                  "Whoever travels a path in search of knowledge, Allah will make easy for them a path to Paradise."
                </p>
                <p className="text-sm text-primary-400 font-bold">
                  [Sahih Muslim]
                </p>
              </div>
              <p className="text-lg text-slate-200 leading-relaxed mb-4">
                Every time you open a book with sincerity, every time you seek to understand truth, every time you humble yourself to learn—you're walking toward Paradise. This journey isn't about perfection; it's about progress. It's about choosing light over darkness, understanding over ignorance, and wisdom over blind following.
              </p>
              <p className="text-lg text-slate-200 leading-relaxed">
                Truth exists. Allah has preserved it in His Book, demonstrated it through His Messenger ﷺ, and written it in the very fabric of creation. Your job is simple: seek it with an open heart, a critical mind, and a humble soul.
              </p>
            </section>

            {/* Du'a */}
            <section>
              <div className="bg-gradient-to-br from-primary-500/20 to-accent-500/20 backdrop-blur-xl border-2 border-primary-400/40 rounded-2xl p-8 text-center">
                <h3 className="text-2xl font-black text-white mb-4">🤲 Du'a</h3>
                <p className="text-xl text-white font-arabic leading-loose mb-4" dir="rtl">
                  اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا
                </p>
                <p className="text-lg text-slate-200 italic leading-relaxed mb-2">
                  "Allahumma inni as'aluka 'ilman nafi'an, wa rizqan tayyiban, wa 'amalan mutaqabbalan."
                </p>
                <p className="text-slate-300 leading-relaxed mb-4">
                  "O Allah, I ask You for beneficial knowledge, good provision, and accepted deeds."
                </p>
                <p className="text-2xl text-primary-300 font-bold">Ameen.</p>
              </div>
            </section>

            {/* Closing */}
            <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-xl text-center">
              <p className="text-slate-300 leading-relaxed italic">
                May Allah ﷻ grant us sincerity in seeking knowledge, wisdom in applying it, and the tawfiq to benefit ourselves and others. May He make us from those who are raised in ranks through knowledge and faith.
              </p>
            </div>
          </div>
        </div>
      </article>

      {/* Related or Next Steps */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-primary-500/20 to-accent-500/20 backdrop-blur-xl border border-primary-400/30 rounded-3xl p-12 text-center">
            <h3 className="text-3xl font-black text-white mb-4">
              Continue Your Learning Journey
            </h3>
            <p className="text-xl text-slate-300 mb-8">
              Explore our Qur'an courses and deepen your understanding with authentic Islamic education.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => navigate('/courses')}
                className="px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-400 hover:to-accent-400 text-white font-black rounded-xl uppercase tracking-wider transition-all shadow-xl hover:shadow-2xl hover:scale-105"
              >
                View Courses
              </button>
              <button
                onClick={() => navigate('/articles')}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white font-bold rounded-xl transition-all"
              >
                More Articles
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LightOfKnowledge;
