'use client';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="logo">
              <span className="logo-icon">🟠</span>
              <span className="logo-text">AdRise SEO</span>
            </div>
            <p className="copyright">© 2024 AdRise SEO. All rights reserved.</p>
          </div>
          
          <div className="footer-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer {
          padding: 40px 0;
          border-top: 1px solid var(--border-color);
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .copyright {
          color: var(--text-secondary);
          font-size: 14px;
        }
        .footer-links {
          display: flex;
          gap: 32px;
        }
        .footer-links a {
          color: var(--text-secondary);
          font-size: 14px;
          transition: color 0.2s;
        }
        .footer-links a:hover {
          color: var(--text-primary);
        }
        @media (max-width: 768px) {
          .footer-content {
            flex-direction: column;
            gap: 24px;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}
