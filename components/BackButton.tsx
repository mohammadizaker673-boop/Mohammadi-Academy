import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'light';
  showIcon?: boolean;
  onClick?: () => void;
}

/**
 * Reusable BackButton Component
 * Intelligently navigates back with fallback to browser history
 */
const BackButton: React.FC<BackButtonProps> = ({
  to,
  label = '← Back',
  className = '',
  variant = 'primary',
  showIcon = true,
  onClick
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    } else {
      // Try to go back in history, fallback to home
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/');
      }
    }
  };

  const baseStyles = 'flex items-center gap-2 font-bold transition-all duration-200 rounded-lg';
  
  const variantStyles = {
    primary: 'px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 active:scale-95',
    secondary: 'px-4 py-2 bg-white/10 text-white hover:bg-white/20 border border-white/20',
    light: 'px-3 py-1 text-sm bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
  };

  return (
    <button
      onClick={handleClick}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      title="Go back to previous page"
    >
      {showIcon && <ArrowLeft size={18} />}
      <span>{label}</span>
    </button>
  );
};

export default BackButton;
