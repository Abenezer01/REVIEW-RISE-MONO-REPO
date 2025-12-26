'use client';

import Image from 'next/image';

import ThemeToggle from './ThemeToggle';

export default function Header() {
  return (
    <header className="header">
      <div className="container">
        <div className="logo">
          <Image 
            src="/logo.png" 
            alt="ReviewRise Logo" 
            width={150} 
            height={40} 
            priority
            style={{ height: 'auto', width: 'auto', maxHeight: '40px' }}
          />
          AdRise
        </div>
        <nav className="nav">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it Works</a>
          <ThemeToggle />
          <button className="cta-button">Sign In</button>
        </nav>
      </div>
      <style jsx>{`
        .header {
          padding: 20px 0;
          position: sticky;
          top: 0;
          background: var(--bg-primary);
          border-bottom: 1px solid var(--border-color);
          z-index: 100;
          backdrop-filter: blur(10px);
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
          font-size: 20px;
          font-weight: 700;
        }
        .logo-icon {
          font-size: 24px;
        }
        .nav {
          display: flex;
          align-items: center;
          gap: 32px;
        }
        .nav a {
          color: var(--text-secondary);
          font-weight: 500;
          transition: color 0.2s;
        }
        .nav a:hover {
          color: var(--text-primary);
        }
        .cta-button {
          background: var(--accent);
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }
        .cta-button:hover {
          background: var(--accent-hover);
          transform: translateY(-2px);
        }
      `}</style>
    </header>
  );
}
