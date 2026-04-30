import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
      className={`theme-toggle inline-flex items-center justify-center w-8 h-8 rounded-full border transition-all shadow-lg ${
        isLight
          ? 'bg-white/80 text-slate-900 border-white/70 hover:bg-white'
          : 'bg-slate-900 text-white border-white/15 hover:bg-slate-800'
      }`}
    >
      {isLight ? <Moon size={14} /> : <Sun size={14} />}
    </button>
  );
};

export default ThemeToggle;
