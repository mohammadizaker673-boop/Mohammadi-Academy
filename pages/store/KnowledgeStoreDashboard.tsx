import React from 'react';
import { Link } from 'react-router-dom';
import { STORE_DOWNLOADS, STORE_PRODUCTS, STORE_PURCHASES } from '../../data/knowledgeStore';
import LogoLink from '../../components/LogoLink';
import LanguageSelector from '../../components/LanguageSelector';
import { DownloadCloud, ShieldCheck } from 'lucide-react';

const KnowledgeStoreDashboard: React.FC = () => {
  const purchases = STORE_PURCHASES.map(item => ({
    ...item,
    product: STORE_PRODUCTS.find(product => product.id === item.productId)
  }));

  const downloads = STORE_DOWNLOADS.map(item => ({
    ...item,
    product: STORE_PRODUCTS.find(product => product.id === item.productId)
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0a0f2b] to-slate-950">
      <nav className="fixed top-0 w-full z-50 bg-[#0a0f2b]/80 backdrop-blur-2xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <LogoLink />
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <Link to="/store" className="text-slate-300 hover:text-primary-400 text-[11px] font-black uppercase tracking-wider transition-colors">
              Knowledge Store
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-28 pb-20 max-w-6xl mx-auto px-6 space-y-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white font-display">My Knowledge Store</h1>
            <p className="text-slate-300">Purchase history, secure downloads, and account updates.</p>
          </div>
          <Link to="/store" className="px-4 py-2 border border-white/10 text-white rounded-full text-xs font-black uppercase tracking-wider">
            Browse products
          </Link>
        </header>

        <section className="grid md:grid-cols-3 gap-6">
          <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-5">
            <h2 className="text-sm uppercase tracking-[0.3em] text-primary-300">Account</h2>
            <p className="text-lg font-bold text-white mt-3">Verified learner</p>
            <p className="text-sm text-slate-300">Email confirmations enabled</p>
          </div>
          <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-5">
            <h2 className="text-sm uppercase tracking-[0.3em] text-primary-300">Downloads</h2>
            <p className="text-lg font-bold text-white mt-3">Secure links</p>
            <p className="text-sm text-slate-300">Links expire after 72 hours</p>
          </div>
          <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-5">
            <h2 className="text-sm uppercase tracking-[0.3em] text-primary-300">Support</h2>
            <p className="text-lg font-bold text-white mt-3">Need help?</p>
            <p className="text-sm text-slate-300">Contact us for refunds or access issues</p>
          </div>
        </section>

        <section className="bg-slate-900/60 border border-white/10 rounded-3xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Purchase history</h2>
          <div className="space-y-4">
            {purchases.map(item => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 bg-white/5 border border-white/10 rounded-2xl p-4">
                <div>
                  <p className="text-white font-bold">{item.product?.title}</p>
                  <p className="text-sm text-slate-400">{item.date}</p>
                </div>
                <div className="text-sm text-slate-300">${item.amount} · {item.status}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-900/60 border border-white/10 rounded-3xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Download history</h2>
          <div className="space-y-4">
            {downloads.map(item => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 bg-white/5 border border-white/10 rounded-2xl p-4">
                <div>
                  <p className="text-white font-bold">{item.product?.title}</p>
                  <p className="text-sm text-slate-400">{item.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs uppercase tracking-[0.3em] text-primary-300">{item.status}</span>
                  <button className="px-4 py-2 bg-primary-500/20 text-primary-200 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2">
                    <DownloadCloud size={14} /> Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-br from-primary-500/20 to-accent-500/10 border border-white/10 rounded-3xl p-6">
          <div className="flex items-center gap-3 text-slate-200">
            <ShieldCheck className="text-primary-300" />
            <p>Only verified purchasers can download. Links expire for security.</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default KnowledgeStoreDashboard;
