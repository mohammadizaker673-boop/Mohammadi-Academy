import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { STORE_CATEGORIES, STORE_PRODUCTS } from '../../data/knowledgeStore';
import LogoLink from '../../components/LogoLink';
import LanguageSelector from '../../components/LanguageSelector';
import { ShieldCheck, Star, Tag } from 'lucide-react';

const KnowledgeStoreProduct: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const product = STORE_PRODUCTS.find(item => item.id === productId);
  const category = STORE_CATEGORIES.find(item => item.id === product?.categoryId);
  const related = useMemo(() => STORE_PRODUCTS.filter(item => product?.relatedIds.includes(item.id)), [product]);

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center">
        <p>Product not found.</p>
        <Link to="/store" className="text-primary-300 mt-4">Back to store</Link>
      </div>
    );
  }

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
            <Link to="/store/dashboard" className="px-4 py-2 border border-white/10 text-white rounded-full text-[11px] font-black uppercase tracking-wider hover:bg-white/10 transition">
              My Store
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-28 pb-20 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-[1.1fr,0.9fr] gap-10">
          <div className="space-y-8">
            <div className="rounded-3xl overflow-hidden border border-white/10">
              <img src={product.coverImage} alt={product.title} className="w-full h-[420px] object-cover" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-primary-300">{category?.name}</p>
              <h1 className="text-4xl font-black text-white mt-2 font-display">{product.title}</h1>
              <p className="text-lg text-slate-300 mt-3">{product.description}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-white mb-3">Highlights</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  {product.highlights.map(item => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-white mb-3">Includes</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  {product.includes.map(item => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {product.preview && (
              <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-white mb-2">Preview</h3>
                <p className="text-sm text-slate-300">{product.preview}</p>
              </div>
            )}

            {related.length > 0 && (
              <div>
                <h3 className="text-2xl font-black text-white mb-4 font-display">Related products</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {related.map(item => (
                    <Link
                      key={item.id}
                      to={`/store/product/${item.id}`}
                      className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-primary-400/50 transition"
                    >
                      <img src={item.coverImage} alt={item.title} className="w-20 h-24 object-cover rounded-xl" />
                      <div>
                        <p className="text-sm text-slate-400 uppercase tracking-[0.2em]">{item.type}</p>
                        <p className="text-white font-bold">{item.title}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300 uppercase tracking-[0.3em]">{product.type}</span>
                <span className="text-sm text-slate-300 flex items-center gap-1">
                  <Star size={14} className="text-yellow-400" /> {product.rating} ({product.reviews})
                </span>
              </div>
              <div className="mt-4">
                <p className="text-4xl font-black text-white font-display">${product.price}</p>
                <p className="text-sm text-slate-300 mt-2">{product.fileName} · {product.fileSize}</p>
              </div>
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <ShieldCheck size={16} className="text-primary-400" /> Secure download link (expires)
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Tag size={16} className="text-primary-400" /> Discount codes and bundle pricing supported
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <input
                  type="text"
                  placeholder="Discount code"
                  className="w-full px-4 py-3 bg-slate-900/70 border border-white/10 rounded-xl text-white"
                />
                <button className="w-full px-4 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-bold">
                  Pay with Stripe (coming soon)
                </button>
                <button className="w-full px-4 py-3 border border-white/10 text-white rounded-xl font-bold hover:bg-white/10 transition">
                  Pay with PayPal (coming soon)
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-4">
                Purchase confirmations are emailed instantly. Download access requires verified purchase.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6">
              <h3 className="text-lg font-bold text-white mb-3">Need bundle pricing?</h3>
              <p className="text-sm text-slate-300">Ask us to curate a custom bundle for your students or team.</p>
              <Link to="/contact" className="text-sm text-primary-300 mt-3 inline-flex">Contact sales</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default KnowledgeStoreProduct;
