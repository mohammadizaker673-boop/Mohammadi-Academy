import React from 'react';
import { STORE_CATEGORIES, STORE_PRODUCTS } from '../../../data/knowledgeStore';
import { BarChart3, PackageCheck, Users, TicketPercent } from 'lucide-react';

const StoreDashboard: React.FC = () => {
  return (
    <div className="p-6 space-y-8">
      <header>
        <h1 className="text-3xl font-black text-white">Knowledge Store Admin</h1>
        <p className="text-slate-300">Manage products, categories, sales, and customer access.</p>
      </header>

      <section className="grid md:grid-cols-4 gap-4">
        {[
          { label: 'Total sales', value: '$12,840', icon: BarChart3 },
          { label: 'Orders', value: '412', icon: PackageCheck },
          { label: 'Customers', value: '286', icon: Users },
          { label: 'Coupons', value: '14', icon: TicketPercent }
        ].map(metric => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="bg-slate-800/80 border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{metric.label}</p>
                  <p className="text-2xl font-black text-white mt-2">{metric.value}</p>
                </div>
                <Icon className="text-primary-400" />
              </div>
            </div>
          );
        })}
      </section>

      <section className="bg-slate-800/80 border border-white/10 rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-xl font-bold text-white">Products</h2>
          <button className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-semibold">Add product</button>
        </div>
        <div className="space-y-3">
          {STORE_PRODUCTS.map(product => (
            <div key={product.id} className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-white/10 rounded-xl p-4">
              <div>
                <p className="text-white font-semibold">{product.title}</p>
                <p className="text-xs text-slate-400">{product.type.toUpperCase()} · ${product.price}</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <button className="px-3 py-1 border border-white/10 rounded-lg text-white">Edit</button>
                <button className="px-3 py-1 border border-white/10 rounded-lg text-red-300">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/80 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Categories</h2>
            <button className="px-4 py-2 border border-white/10 rounded-lg text-white text-sm">Add category</button>
          </div>
          <div className="space-y-3">
            {STORE_CATEGORIES.map(category => (
              <div key={category.id} className="flex items-center justify-between bg-slate-900/60 border border-white/10 rounded-xl p-4">
                <div>
                  <p className="text-white font-semibold">{category.name}</p>
                  <p className="text-xs text-slate-400">{category.tagline}</p>
                </div>
                <button className="px-3 py-1 border border-white/10 rounded-lg text-white text-xs">Manage</button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/80 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Customer list</h2>
          <div className="space-y-3">
            {['Amina Rahman', 'Omar Siddiq', 'Sara Noor', 'Bilal Kareem'].map(name => (
              <div key={name} className="flex items-center justify-between bg-slate-900/60 border border-white/10 rounded-xl p-4">
                <div>
                  <p className="text-white font-semibold">{name}</p>
                  <p className="text-xs text-slate-400">Verified purchaser</p>
                </div>
                <button className="px-3 py-1 border border-white/10 rounded-lg text-white text-xs">Refund</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-800/80 border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Discount coupons</h2>
        <div className="flex flex-wrap items-center gap-3">
          {['WELCOME10', 'BUNDLE15', 'STUDENT20'].map(code => (
            <span key={code} className="px-3 py-2 bg-slate-900/60 border border-white/10 rounded-full text-xs text-slate-200">
              {code}
            </span>
          ))}
          <button className="px-4 py-2 border border-white/10 rounded-lg text-white text-sm">Generate coupon</button>
        </div>
      </section>
    </div>
  );
};

export default StoreDashboard;
