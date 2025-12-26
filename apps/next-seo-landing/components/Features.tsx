'use client';

import { FileText, Gauge, Lightbulb, Check } from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: <FileText size={32} />,
      title: 'SEO Health Score',
      description: 'Get a comprehensive 0-100 visibility score based on 50+ key metrics',
      items: ['Overall performance rating', 'Competitor comparison', 'Industry benchmarks']
    },
    {
      icon: <Gauge size={32} />,
      title: 'Technical Analysis',
      description: 'Deep dive into technical SEO issues affecting your rankings',
      items: ['Page speed analysis', 'Mobile optimization', 'Security & HTTPS']
    },
    {
      icon: <Lightbulb size={32} />,
      title: 'Smart Recommendations',
      description: 'AI-generated action items to improve your SEO performance',
      items: ['Prioritized fixes', 'Step-by-step guides', 'Impact estimates']
    }
  ];

  return (
    <section className="features" id="features">
      <div className="container">
        <h2 className="section-title">What You&apos;ll Discover</h2>
        <p className="section-subtitle">
          Comprehensive SEO analysis powered by advanced AI algorithms
        </p>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
              <ul className="feature-list">
                {feature.items.map((item, i) => (
                  <li key={i}>
                    <Check size={16} className="check-icon" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .features {
          padding: 80px 0;
          background: var(--bg-secondary);
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .section-title {
          text-align: center;
          font-size: 40px;
          font-weight: 800;
          margin-bottom: 16px;
        }
        .section-subtitle {
          text-align: center;
          color: var(--text-secondary);
          font-size: 18px;
          margin-bottom: 60px;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }
        .feature-card {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 32px;
          backdrop-filter: blur(10px);
          transition: all 0.3s;
        }
        .feature-card:hover {
          transform: translateY(-8px);
          border-color: var(--accent);
        }
        .feature-icon {
          width: 64px;
          height: 64px;
          background: var(--accent);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin-bottom: 24px;
        }
        .feature-title {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 12px;
        }
        .feature-description {
          color: var(--text-secondary);
          margin-bottom: 20px;
          line-height: 1.6;
        }
        .feature-list {
          list-style: none;
        }
        .feature-list li {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
          color: var(--text-secondary);
          font-size: 14px;
        }
        :global(.check-icon) {
          color: #10b981;
          flex-shrink: 0;
        }
        @media (max-width: 968px) {
          .features-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
