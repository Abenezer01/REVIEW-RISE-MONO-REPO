'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function Footer() {
  const t = useTranslations('landing');

  return (
    <footer className="footer">
      <div className="container">
        <div className="top">
          <div className="brand">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 19.5h20L12 2z" />
            </svg>
            <span>{t('common.brandName')}</span>
          </div>
          <div className="links">
            <Link href="#features">{t('footer.features')}</Link>
            <Link href="#how-it-works">{t('howItWorks.title')}</Link>
            <Link href="https://app.reviewrise.com">{t('footer.login')}</Link>
          </div>
        </div>
        <div className="bottom">
          <p className="copyright">
            {'©'} {new Date().getFullYear()} {t('common.brandName')}{'.'} {t('footer.rights')}
          </p>
          <div className="legal">
            <Link href="/privacy">{t('footer.privacy')}</Link>
            <Link href="/terms">{t('footer.terms')}</Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer {
          padding: 64px 0 32px;
          border-top: 1px solid var(--border-color);
          background: var(--bg-primary);
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 48px;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .brand svg {
          color: var(--accent);
        }
        .links {
          display: flex;
          gap: 32px;
        }
        .links a {
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
          transition: color 0.2s;
        }
        .links a:hover {
          color: var(--accent);
        }
        .bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 32px;
          border-top: 1px solid var(--border-color);
        }
        .copyright {
          font-size: 13px;
          color: var(--text-tertiary);
        }
        .legal {
          display: flex;
          gap: 24px;
        }
        .legal a {
          font-size: 13px;
          color: var(--text-tertiary);
          transition: color 0.2s;
        }
        .legal a:hover {
          color: var(--accent);
        }
        @media (max-width: 768px) {
          .top {
            flex-direction: column;
            gap: 24px;
            align-items: flex-start;
          }
          .links {
            flex-direction: column;
            gap: 16px;
          }
          .bottom {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }
        }
      `}</style>
    </footer>
  );
}
