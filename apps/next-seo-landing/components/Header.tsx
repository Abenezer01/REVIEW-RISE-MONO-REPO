'use client';

import ThemeToggle from './ThemeToggle';

export default function Header() {
  return (
    <header className="header">
      <div className="container">
        <div className="logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 19.5h20L12 2z" />
          </svg>
          <span>ReviewRise</span>
        </div>
        <nav className="nav">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it Works</a>
          <ThemeToggle />
          <a href="https://app.reviewrise.com" className="cta-button">Sign In →</a>
        </nav>
      </div>
      <style jsx>{`
        .header {
          padding: 16px 0;
          position: sticky;
          top: 0;
          background: var(--bg-primary);
          border-bottom: 1px solid var(--border-color);
          z-index: 100;
          backdrop-filter: saturate(180%) blur(20px);
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .logo svg {
          color: var(--accent);
        }
        .nav {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .nav a {
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
          transition: color 0.2s;
        }
        .nav a:hover {
          color: var(--text-primary);
        }
        .cta-button {
          background: var(--bg-primary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 500;
          font-size: 14px;
          transition: all 0.2s;
        }
        .cta-button:hover {
          border-color: var(--text-secondary);
        }
        @media (max-width: 768px) {
          .nav a:not(.cta-button) {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
