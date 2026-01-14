'use client';

import { useState, useEffect } from 'react';
import { Globe, ArrowRight } from 'lucide-react';
import { analyzeSEO, type SEOAnalysisResult } from '@/lib/api';
import ResultsDisplay from './ResultsDisplay';
import AnalysisLoader from './AnalysisLoader';

export default function Hero() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SEOAnalysisResult | null>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!url) return;
    
    let processedUrl = url.trim();
    if (!/^https?:\/\//i.test(processedUrl)) {
      processedUrl = `https://${processedUrl}`;
    }
    processedUrl = processedUrl.replace(/\/+$/, '');

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await analyzeSEO(processedUrl);
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (result) {
      const resultsElement = document.getElementById('results');
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [result]);

  return (
    <section className="hero">
      <div className="container">
        <div className="badge">
          <span className="badge-dot"></span>
          AI-Powered SEO Analysis
        </div>
        
        <h1 className="title">
          Instant SEO Insights for<br />Your Website
        </h1>

        <p className="description">
          Get a comprehensive SEO analysis in seconds. No signup required.
        </p>

        {!loading && !result && (
          <>
            <div className="input-wrapper">
              <div className="input-container">
                <Globe className="input-icon" size={18} />
                <input
                  type="url"
                  placeholder="example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                />
              </div>
              <button 
                className="analyze-button"
                onClick={handleAnalyze}
              >
                Analyze
                <ArrowRight size={16} />
              </button>
            </div>

            <p className="features-text">
              Free • Instant Results • No Signup
            </p>
          </>
        )}

        {loading && <AnalysisLoader />}

        {error && <div className="error">{error}</div>}
        
        {!loading && !result && (
          <div className="stats">
            <div className="stat">
              <div className="stat-value">50K+</div>
              <div className="stat-label">Sites Analyzed</div>
            </div>
            <div className="stat">
              <div className="stat-value">98%</div>
              <div className="stat-label">Accuracy</div>
            </div>
            <div className="stat">
              <div className="stat-value">4.9</div>
              <div className="stat-label">Rating</div>
            </div>
          </div>
        )}
      </div>

      {result && (
        <div id="results" style={{ scrollMarginTop: '20px' }}>
          <ResultsDisplay result={result} />
        </div>
      )}

      <style jsx>{`
        .hero {
          padding: 120px 0 80px;
          text-align: center;
          position: relative;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(249, 160, 48, 0.1);
          border: 1px solid rgba(249, 160, 48, 0.3);
          border-radius: 100px;
          padding: 6px 14px;
          font-size: 13px;
          font-weight: 600;
          color: var(--accent);
          margin-bottom: 32px;
        }
        .badge-dot {
          width: 6px;
          height: 6px;
          background: var(--accent);
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }
        .title {
          font-size: 64px;
          font-weight: 700;
          line-height: 1.1;
          margin-bottom: 24px;
          letter-spacing: -0.03em;
          background: linear-gradient(to right, var(--brand-primary), var(--accent));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .description {
          font-size: 20px;
          color: var(--text-secondary);
          margin-bottom: 48px;
          line-height: 1.5;
        }
        .input-wrapper {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }
        .input-container {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          color: var(--accent);
          position: absolute;
          left: 16px;
          z-index: 1;
        }
        input {
          width: 100%;
          padding: 14px 16px 14px 44px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          background: var(--bg-primary);
          color: var(--text-primary);
          font-size: 15px;
          outline: none;
          transition: all 0.2s;
        }
        input:focus {
          border-color: var(--brand-primary);
          box-shadow: 0 0 0 3px rgba(5, 64, 118, 0.1);
        }
        input::placeholder {
          color: var(--text-tertiary);
        }
        .analyze-button {
          background: var(--accent);
          color: white;
          border: none;
          padding: 14px 24px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .analyze-button:hover {
          background: var(--accent-hover);
          transform: translateY(-1px);
        }
        .features-text {
          color: var(--text-tertiary);
          font-size: 14px;
          margin-bottom: 64px;
        }
        .error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #ef4444;
          padding: 12px 16px;
          border-radius: 8px;
          margin-top: 16px;
          font-size: 14px;
        }
        .stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-top: 64px;
        }
        .stat {
          text-align: center;
          padding: 24px;
          background: var(--bg-secondary);
          border-radius: 12px;
          border: 1px solid var(--border-color);
          transition: all 0.2s;
        }
        .stat:hover {
          border-color: var(--accent);
          transform: translateY(-2px);
        }
        .stat-value {
          font-size: 36px;
          font-weight: 700;
          background: linear-gradient(to right, var(--brand-primary), var(--accent));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 8px;
          letter-spacing: -0.02em;
        }
        .stat-label {
          font-size: 13px;
          color: var(--text-secondary);
          font-weight: 500;
        }
        @media (max-width: 768px) {
          .hero {
            padding: 80px 0 60px;
          }
          .title {
            font-size: 40px;
          }
          .description {
            font-size: 18px;
          }
          .input-wrapper {
            flex-direction: column;
          }
          .analyze-button {
            width: 100%;
            justify-content: center;
          }
          .stats {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }
      `}</style>
    </section>
  );
}
