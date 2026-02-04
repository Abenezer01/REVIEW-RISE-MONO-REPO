'use client';

import { Sun, Moon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const t = useTranslations('landing.common');

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={t('toggleTheme')}
    >
      {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      <style jsx>{`
        .theme-toggle {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }
        .theme-toggle:hover {
          transform: scale(1.05);
          border-color: var(--accent);
        }
      `}</style>
    </button>
  );
}
