import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle = ({ className = '', showLabel = false }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`relative inline-flex items-center justify-center p-2 rounded-xl transition-all duration-300 border ${
        isDark
          ? 'bg-surface-900/90 text-amber-400 border-surface-700/60 hover:bg-surface-800 hover:border-amber-400/40 hover:text-amber-300 shadow-lg shadow-black/20'
          : 'bg-white text-surface-700 border-surface-300/80 hover:bg-surface-50 hover:text-brand-600 hover:border-brand-400/40 shadow-sm'
      } ${className}`}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 transition-transform duration-300 rotate-0 hover:rotate-45 text-amber-400" />
        ) : (
          <Moon className="w-4 h-4 transition-transform duration-300 -rotate-12 hover:rotate-0 text-surface-700" />
        )}
      </div>
      {showLabel && (
        <span className="ml-2 text-xs font-semibold capitalize">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
};
