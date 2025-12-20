'use client';

export default function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Enter Your URL',
      description: 'Simply paste your website URL into the analyzer. No registration, no payment, no hassle.'
    },
    {
      number: '2',
      title: 'AI Analysis',
      description: 'Our advanced AI scans 50+ SEO factors including technical health, content quality, and backlink profile.'
    },
    {
      number: '3',
      title: 'Get Your Report',
      description: 'Receive your detailed SEO health score with actionable recommendations to boost your rankings.'
    }
  ];

  return (
    <section className="how-it-works" id="how-it-works">
      <div className="container">
        <h2 className="section-title">How It Works</h2>
        <p className="section-subtitle">
          Get your complete SEO analysis in 3 simple steps
        </p>

        <div className="steps-grid">
          {steps.map((step, index) => (
            <div key={index} className="step-card">
              <div className="step-number">{step.number}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .how-it-works {
          padding: 80px 0;
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
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
        }
        .step-card {
          text-align: center;
        }
        .step-number {
          width: 64px;
          height: 64px;
          background: var(--accent);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          font-weight: 800;
          color: white;
          margin: 0 auto 24px;
        }
        .step-title {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 12px;
        }
        .step-description {
          color: var(--text-secondary);
          line-height: 1.6;
        }
        @media (max-width: 968px) {
          .steps-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
