'use client';

import { ArrowRight } from 'lucide-react';

export default function CTA() {
  return (
    <section className="cta">
      <div className="container">
        <h2 className="cta-title">Ready to Improve Your SEO?</h2>
        <button className="cta-button">
          Analyze Your Website Now
          <ArrowRight size={20} />
        </button>
      </div>

      <style jsx>{`
        .cta {
          padding: 80px 0;
          background: var(--bg-secondary);
          text-align: center;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .cta-title {
          font-size: 48px;
          font-weight: 800;
          margin-bottom: 32px;
        }
        .cta-button {
          background: var(--accent);
          color: white;
          border: none;
          padding: 18px 40px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 18px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          transition: all 0.3s;
        }
        .cta-button:hover {
          background: var(--accent-hover);
          transform: translateY(-4px);
        }
        @media (max-width: 768px) {
          .cta-title {
            font-size: 32px;
          }
        }
      `}</style>
    </section>
  );
}
