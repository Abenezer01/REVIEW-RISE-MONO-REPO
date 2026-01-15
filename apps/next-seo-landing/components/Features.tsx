'use client';

export default function Features() {
  const features = [
    {
      icon: '⚡',
      title: 'Instant Analysis',
      description: 'Get comprehensive SEO insights in seconds, not hours.'
    },
    {
      icon: '🎯',
      title: 'Actionable Insights',
      description: 'Receive clear, prioritized recommendations you can implement immediately.'
    },
    {
      icon: '🤖',
      title: 'AI-Powered',
      description: 'Leverage advanced AI to uncover opportunities your competitors miss.'
    },
    {
      icon: '📊',
      title: 'Detailed Reports',
      description: 'Access in-depth analysis of meta tags, performance, and content quality.'
    },
    {
      icon: '🔒',
      title: 'Secure & Private',
      description: 'Your data is never stored or shared. Complete privacy guaranteed.'
    },
    {
      icon: '💯',
      title: 'Always Free',
      description: 'No hidden fees, no credit card required. Professional SEO analysis for everyone.'
    }
  ];

  return (
    <section id="features" className="features">
      <div className="container">
        <div className="header">
          <h2 className="title">Everything you need</h2>
          <p className="subtitle">
            Professional SEO analysis tools at your fingertips
          </p>
        </div>

        <div className="grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .features {
          padding: 120px 0;
          background: var(--bg-primary);
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .header {
          text-align: center;
          margin-bottom: 64px;
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
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .feature-card {
          padding: 32px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          transition: all 0.2s;
        }
        .feature-card:hover {
          border-color: var(--accent);
          transform: translateY(-4px);
        }
        .icon {
          font-size: 32px;
          margin-bottom: 16px;
        }
        .feature-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
          color: var(--text-primary);
        }
        .feature-description {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.6;
        }
        @media (max-width: 768px) {
          .features {
            padding: 80px 0;
          }
          .title {
            font-size: 32px;
          }
          .grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .feature-card {
            padding: 24px;
          }
        }
      `}</style>
    </section>
  );
}
