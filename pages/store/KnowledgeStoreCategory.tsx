import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { STORE_CATEGORIES, STORE_PRODUCTS } from '../../data/knowledgeStore';
import LogoLink from '../../components/LogoLink';
import LanguageSelector from '../../components/LanguageSelector';
import { StoreProduct } from '../../types/store.types';
import { ArrowLeft, Star } from 'lucide-react';

type ProductCardProps = {
  product: StoreProduct;
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

const KnowledgeStoreCategory: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const category = STORE_CATEGORIES.find(item => item.id === categoryId);
  const products = STORE_PRODUCTS.filter(product => product.categoryId === categoryId);

  if (!category) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center">
        <p>Category not found.</p>
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
          </div>
        </div>
      </nav>

      <main className="pt-28 pb-20 max-w-7xl mx-auto px-6">
        <Link to="/store" className="inline-flex items-center gap-2 text-primary-300 text-xs uppercase tracking-[0.3em]">
          <ArrowLeft size={14} /> Back to store
        </Link>

        <div className="mt-6 mb-10">
          <h1 className="text-4xl font-black text-white font-display">{category.name}</h1>
          <p className="text-slate-300 max-w-2xl mt-2">{category.description}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default KnowledgeStoreCategory;
