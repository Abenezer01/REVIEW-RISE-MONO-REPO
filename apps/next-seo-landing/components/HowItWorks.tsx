'use client';

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Enter Your URL',
      description: 'Simply paste your website URL into the analyzer'
    },
    {
      number: '02',
      title: 'AI Analysis',
      description: 'Our AI scans your site for SEO opportunities'
    },
    {
      number: '03',
      title: 'Get Results',
      description: 'Receive actionable insights and recommendations'
    }
  ];

  return (
    <section id="how-it-works" className="how-it-works">
      <div className="container">
        <div className="header">
          <h2 className="title">How it works</h2>
          <p className="subtitle">
            Three simple steps to better SEO
          </p>
        </div>

        <div className="steps">
          {steps.map((step, index) => (
            <div key={index} className="step">
              <div className="step-number">{step.number}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .how-it-works {
          padding: 120px 0;
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-color);
          border-bottom: 1px solid var(--border-color);
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
        .steps {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 48px;
        }
        .step {
          text-align: center;
        }
        .step-number {
          font-size: 64px;
          font-weight: 700;
          background: linear-gradient(to right, var(--brand-primary), var(--accent));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 16px;
          letter-spacing: -0.03em;
        }
        .step-title {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 8px;
          color: var(--text-primary);
        }
        .step-description {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.6;
        }
        @media (max-width: 768px) {
          .how-it-works {
            padding: 80px 0;
          }
          .title {
            font-size: 32px;
          }
          .steps {
            grid-template-columns: 1fr;
            gap: 32px;
          }
        }
      `}</style>
    </section>
  );
}
