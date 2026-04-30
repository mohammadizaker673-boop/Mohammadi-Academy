import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#050a12] flex items-center justify-center px-6 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/5 blur-[150px] rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/5 blur-[150px] rounded-full" />

      <div className="text-center relative z-10 max-w-lg">
        <p className="text-8xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary-400 to-accent-400 leading-none mb-6">
          404
        </p>
        <h1 className="text-2xl sm:text-3xl font-black text-white mb-4">Page Not Found</h1>
        <p className="text-slate-400 mb-10 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold rounded-xl text-sm uppercase tracking-wider hover:from-primary-400 hover:to-accent-400 transition-all shadow-lg"
          >
            Go Home
          </Link>
          <Link
            to="/courses"
            className="px-8 py-4 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl text-sm uppercase tracking-wider transition-all"
          >
            Browse Courses
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
