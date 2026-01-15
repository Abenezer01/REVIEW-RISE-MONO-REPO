'use client';

export default function CTA() {
  return (
    <section className="cta">
      <div className="container">
        <h2 className="title">Ready to improve your SEO?</h2>
        <p className="subtitle">
          Join thousands of websites getting better rankings
        </p>
        <a href="#" className="cta-button">
          Get Started →
        </a>
      </div>

      <style jsx>{`
        .cta {
          padding: 120px 0;
          text-align: center;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .title {
          font-size: 48px;
          font-weight: 700;
          margin-bottom: 16px;
          letter-spacing: -0.02em;
          background: linear-gradient(to right, var(--brand-primary), var(--accent));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .subtitle {
          font-size: 18px;
          color: var(--text-secondary);
          margin-bottom: 32px;
        }
        .cta-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--accent);
          color: white;
          padding: 14px 28px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 15px;
          transition: all 0.2s;
        }
        .cta-button:hover {
          background: var(--accent-hover);
          transform: translateY(-2px);
        }
        @media (max-width: 768px) {
          .cta {
            padding: 80px 0;
          }
          .title {
            font-size: 32px;
          }
        }
      `}</style>
    </section>
  );
}
