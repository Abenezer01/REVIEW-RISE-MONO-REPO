'use client';

import { useTranslations } from 'next-intl';

export default function HowItWorks() {
  const t = useTranslations('landing.howItWorks');

  const steps = [
    {
      number: '01',
      title: t('steps.step1.title'),
      description: t('steps.step1.description')
    },
    {
      number: '02',
      title: t('steps.step2.title'),
      description: t('steps.step2.description')
    },
    {
      number: '03',
      title: t('steps.step3.title'),
      description: t('steps.step3.description')
    }
  ];

  return (
    <section id="how-it-works" className="how-it-works">
      <div className="container">
        <div className="header">
          <h2 className="title">{t('title')}</h2>
          <p className="subtitle">
            {t('subtitle')}
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
