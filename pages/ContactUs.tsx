import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, Clock, MessageCircle } from 'lucide-react';
import { PHONE_NUMBER } from '../constants';
import LanguageSelector from '../components/LanguageSelector';
import LogoLink from '../components/LogoLink';
import BackButton from '../components/BackButton';
import { useLanguage } from '../contexts/LanguageContext';
import { TRANSLATIONS } from '../constants';

const ContactUs: React.FC = () => {
  const { language } = useLanguage();
  let t = TRANSLATIONS[language];
  
  // Fallback to English if translations are not available
  if (!t) {
    t = TRANSLATIONS['en'];
  }
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (t && t.dir) {
      document.documentElement.dir = t.dir;
      document.documentElement.lang = language;
    }
  }, [language, t]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-[#050a12]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#050a12]/80 backdrop-blur-2xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <LogoLink />

          <div className="flex items-center gap-6">
            <LanguageSelector />
            <Link to="/" className="text-slate-300 hover:text-primary-400 text-[11px] font-black uppercase tracking-wider transition-colors">
              Home
            </Link>
            <Link to="/courses" className="text-slate-300 hover:text-primary-400 text-[11px] font-black uppercase tracking-wider transition-colors">
              Courses
            </Link>
            <Link to="/ai-tutor" className="text-slate-300 hover:text-primary-400 text-[11px] font-black uppercase tracking-wider transition-colors">
              AI Teachers
            </Link>
            <Link to="/about" className="text-slate-300 hover:text-primary-400 text-[11px] font-black uppercase tracking-wider transition-colors">
              About
            </Link>
            <Link 
              to="/login"
              className="px-5 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-full text-[11px] font-black uppercase tracking-wider shadow-lg hover:from-primary-400 hover:to-accent-400 transition-all"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <BackButton to="/" label="← Back to Home" variant="light" />
          <div className="text-center mt-6">
            <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400 mb-6">
              Contact Us
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Have questions? We're here to help! Reach out to us and we'll get back to you as soon as possible.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Info & Form */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <h2 className="text-3xl font-black text-white mb-6">Get In Touch</h2>
              <p className="text-slate-300 mb-8">
                Feel free to reach out through any of the following channels. Our team is ready to assist you.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="text-primary-400" size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-1">Phone</h3>
                    <a href={`tel:${PHONE_NUMBER}`} className="text-slate-300 hover:text-primary-400 transition-colors">
                      {PHONE_NUMBER}
                    </a>
                    <p className="text-slate-500 text-sm mt-1">Call us anytime</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="text-accent-400" size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-1">Email</h3>
                    <a href="mailto:info@mohammadiacademy.com" className="text-slate-300 hover:text-accent-400 transition-colors">
                      info@mohammadiacademy.com
                    </a>
                    <p className="text-slate-500 text-sm mt-1">Send us an email</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="text-green-400" size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-1">WhatsApp</h3>
                    <a href={`https://wa.me/${PHONE_NUMBER.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-green-400 transition-colors">
                      Chat with us
                    </a>
                    <p className="text-slate-500 text-sm mt-1">Quick response via WhatsApp</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="text-accent-400" size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-1">Office Hours</h3>
                    <p className="text-slate-300">Monday - Saturday</p>
                    <p className="text-slate-300">9:00 AM - 9:00 PM (GMT)</p>
                    <p className="text-slate-500 text-sm mt-1">We're here to help</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <h2 className="text-3xl font-black text-white mb-6">Send Us a Message</h2>
            
            {submitted ? (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
                <p className="text-slate-300">Thank you for contacting us. We'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-primary-400 transition-colors"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-2">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-primary-400 transition-colors"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-primary-400 transition-colors"
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-2">Subject *</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-400 transition-colors"
                  >
                    <option value="">Select a subject</option>
                    <option value="admission">Admission Inquiry</option>
                    <option value="courses">Course Information</option>
                    <option value="pricing">Pricing & Fees</option>
                    <option value="technical">Technical Support</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-2">Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-primary-400 transition-colors resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg font-black uppercase tracking-wider shadow-xl hover:from-primary-400 hover:to-accent-400 transition-all flex items-center justify-center gap-2"
                >
                  <Send size={20} />
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#050a12] py-8 mt-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-slate-500 text-sm">
            &copy; 2026 Mohammadi Online Quran Academy. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ContactUs;

