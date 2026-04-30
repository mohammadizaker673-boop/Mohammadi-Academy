import React from 'react';
import { Link } from 'react-router-dom';
import { StoreCategory, StoreProduct } from '../../types/store.types';
import { STORE_CATEGORIES, STORE_PRODUCTS, STORE_TESTIMONIALS } from '../../data/knowledgeStore';
import LogoLink from '../../components/LogoLink';
import LanguageSelector from '../../components/LanguageSelector';
import ThemeToggle from '../../components/ThemeToggle';
import { ShoppingBag, Star, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

type ProductCardProps = {
  product: StoreProduct;
};

type CategoryCardProps = {
  category: StoreCategory;
};

const ProductCard: React.FC<ProductCardProps> = ({ product }) => (
  <Link
    to={`/store/product/${product.id}`}
    className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-primary-400/50 transition"
  >
    <div className="relative h-56 overflow-hidden">
      <img src={product.coverImage} alt={product.title} className="h-full w-full object-cover group-hover:scale-105 transition" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
      <div className="absolute bottom-4 left-4 text-xs uppercase tracking-[0.3em] text-primary-200">
        {product.type}
      </div>
    </div>
    <div className="p-5 space-y-3">
      <h3 className="text-lg font-bold text-white group-hover:text-primary-300 transition">
        {product.title}
      </h3>
      <p className="text-sm text-slate-300">{product.shortDescription}</p>
      <div className="flex items-center justify-between text-sm text-slate-300">
        <span>${product.price}</span>
        <span className="flex items-center gap-1">
          <Star size={14} className="text-yellow-400" /> {product.rating}
        </span>
      </div>
    </div>
  </Link>
);

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => (
  <Link
    to={`/store/category/${category.id}`}
    className="relative bg-gradient-to-br from-slate-900/70 to-slate-950/70 border border-white/10 rounded-2xl p-6 overflow-hidden hover:border-primary-400/50 transition"
  >
    <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-500/10 blur-2xl" />
    <h3 className="text-xl font-bold text-white mb-2">{category.name}</h3>
    <p className="text-sm text-slate-300 mb-4">{category.description}</p>
    <span className="text-xs uppercase tracking-[0.3em] text-primary-300">{category.tagline}</span>
  </Link>
);

const KnowledgeStoreHome: React.FC = () => {
  const featured = STORE_PRODUCTS.filter(product => product.isFeatured);
  const bestSellers = STORE_PRODUCTS.filter(product => product.isBestSeller);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0a0f2b] to-slate-950">
      <nav className="fixed top-0 w-full z-50 bg-[#0a0f2b]/80 backdrop-blur-2xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <LogoLink />
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <LanguageSelector />
            <Link to="/" className="text-slate-300 hover:text-primary-400 text-[11px] font-black uppercase tracking-wider transition-colors">
              Home
            </Link>
            <Link to="/store/dashboard" className="px-4 py-2 border border-white/10 text-white rounded-full text-[11px] font-black uppercase tracking-wider hover:bg-white/10 transition">
              My Store
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-28 pb-20">
        <section className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[1.2fr,0.8fr] gap-10 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-400/20 rounded-full text-primary-300 text-[10px] font-black uppercase tracking-[0.3em]">
              <Sparkles size={14} /> Premium Knowledge Marketplace
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-white font-display">
              Knowledge Store
              <span className="block text-primary-300">Designed for mastery.</span>
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed">
              Curated digital products for faith, modern skills, and career growth. Built for learners who value depth, clarity, and premium delivery.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="#featured"
                className="px-5 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-full text-xs font-black uppercase tracking-wider"
              >
                Explore products
              </Link>
              <Link
                to="/register"
                className="px-5 py-3 border border-white/15 text-white rounded-full text-xs font-black uppercase tracking-wider hover:bg-white/10 transition"
              >
                Create account
              </Link>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-primary-400" /> Secure downloads
              </div>
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-primary-400" /> Verified purchases only
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-3xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Featured Bundle</h2>
            <ProductCard product={featured[0]} />
          </div>
        </section>

        <section id="featured" className="max-w-7xl mx-auto px-6 mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-black text-white font-display">Featured products</h2>
            <Link to="/store/category/islamic" className="text-xs uppercase tracking-[0.3em] text-primary-300 hover:text-white">
              View all
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 mt-16">
          <h2 className="text-3xl font-black text-white mb-6 font-display">Shop by category</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STORE_CATEGORIES.map(category => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-black text-white font-display">Best sellers</h2>
            <Link to="/store/category/modern" className="text-xs uppercase tracking-[0.3em] text-primary-300 hover:text-white">
              See best sellers
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bestSellers.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 mt-16">
          <div className="bg-gradient-to-br from-primary-500/20 to-accent-500/10 border border-white/10 rounded-3xl p-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-black text-white font-display">Testimonials</h2>
                <p className="text-slate-300">Trusted by educators, career coaches, and builders.</p>
              </div>
              <Link to="/store/dashboard" className="text-xs uppercase tracking-[0.3em] text-primary-200 hover:text-white">
                Join the community
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mt-6">
              {STORE_TESTIMONIALS.map(testimonial => (
                <div key={testimonial.id} className="bg-slate-950/50 border border-white/10 rounded-2xl p-5">
                  <p className="text-sm text-slate-200">“{testimonial.quote}”</p>
                  <div className="mt-4 text-xs uppercase tracking-[0.3em] text-primary-300">
                    {testimonial.name} · {testimonial.role}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 mt-16">
          <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-8 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-black text-white font-display">Ready to launch your knowledge library?</h2>
              <p className="text-slate-300">Start with a few premium assets, test, then expand with confidence.</p>
            </div>
            <Link to="/register" className="px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-full text-xs font-black uppercase tracking-wider">
              Start now
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default KnowledgeStoreHome;
