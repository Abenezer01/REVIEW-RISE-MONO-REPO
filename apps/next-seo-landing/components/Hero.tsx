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
    
    // Transform URL: ensure protocol, trim whitespace, remove trailing slash
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
          <span className="badge-icon">✨</span> FREE AI-POWERED SEO ANALYSIS
        </div>
        
        <h1 className="title">
          Discover Your Website&apos;s SEO Score<br />in Seconds
        </h1>

        {!loading && !result && (
          <>
            <div className="input-wrapper">
              <div className="input-container">
                <Globe className="input-icon" size={20} />
                <input
                  type="url"
                  placeholder="Enter your website URL (e.g., www.example.com)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                />
              </div>
              <button 
                className="analyze-button"
                onClick={handleAnalyze}
              >
                Analyze Now
                <ArrowRight size={20} />
              </button>
            </div>

            <p className="subtitle">
              ✓ Instant results • ✓ No signup required • ✓ Completely free
            </p>
          </>
        )}

        {loading && <AnalysisLoader />}

        {error && <div className="error">{error}</div>}
        
        {!loading && !result && (
          <div className="stats">
            <div className="stat">
              <div className="stat-value">50K+</div>
              <div className="stat-label">SITES ANALYZED</div>
            </div>
            <div className="stat">
              <div className="stat-value">98%</div>
              <div className="stat-label">ACCURACY RATE</div>
            </div>
            <div className="stat">
              <div className="stat-value">4.9/5</div>
              <div className="stat-label">USER RATING</div>
            </div>
            <div className="stat">
              <div className="stat-value">24/7</div>
              <div className="stat-label">AVAILABLE</div>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Results Section */}
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
          max-width: 900px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: rgba(249, 160, 48, 0.1);
          border: 1px solid rgba(249, 160, 48, 0.2);
          border-radius: 50px;
          padding: 12px 28px;
          font-size: 11px;
          font-weight: 700;
          color: var(--accent-solid);
          margin-bottom: 40px;
          animation: fadeIn 0.6s ease-out;
          box-shadow: 0 4px 20px rgba(249, 160, 48, 0.1);
          letter-spacing: 1.2px;
          text-transform: uppercase;
        }
        .badge-icon {
          font-size: 18px;
        }
        .title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 72px;
          font-weight: 900;
          line-height: 1.1;
          margin-bottom: 56px;
          animation: fadeIn 0.8s ease-out 0.2s both;
          letter-spacing: -0.02em;
        }
        .input-wrapper {
          display: flex;
          gap: 16px;
          margin-bottom: 20px;
          animation: fadeIn 1s ease-out 0.4s both;
        }
        .input-container {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          color: var(--accent-solid);
          position: absolute;
          left: 20px;
          z-index: 1;
        }
        input {
          width: 100%;
          padding: 20px 20px 20px 56px;
          border-radius: 16px;
          border: 2px solid var(--border-color);
          background: var(--card-bg);
          backdrop-filter: blur(10px);
          color: var(--text-primary);
          font-size: 16px;
          outline: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: var(--shadow);
        }
        input:focus {
          border-color: var(--accent-solid);
          box-shadow: 0 0 0 4px rgba(249, 160, 48, 0.1), var(--glow);
          transform: translateY(-2px);
        }
        input::placeholder {
          color: var(--text-secondary);
        }
        .analyze-button {
          background: var(--accent);
          color: white;
          border: none;
          padding: 20px 40px;
          border-radius: 16px;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
          box-shadow: 0 8px 24px rgba(249, 160, 48, 0.25);
          position: relative;
          overflow: hidden;
        }
        .analyze-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s;
        }
        .analyze-button:hover::before {
          left: 100%;
        }
        .analyze-button:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(249, 160, 48, 0.35);
        }
        .analyze-button:active {
          transform: translateY(-2px);
        }
        .subtitle {
          color: var(--text-secondary);
          font-size: 16px;
          margin-bottom: 80px;
          animation: fadeIn 1.2s ease-out 0.6s both;
          font-weight: 400;
          letter-spacing: 0.01em;
        }
        .error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
          padding: 16px;
          border-radius: 12px;
          margin-top: 20px;
          animation: slideIn 0.4s ease-out;
        }
        .stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px;
          margin-top: 80px;
          animation: fadeIn 1.4s ease-out 0.8s both;
        }
        .stat {
          text-align: center;
          padding: 24px;
          background: var(--card-bg);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          border: 1px solid var(--border-color);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: var(--shadow);
        }
        .stat:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-lg);
          border-color: var(--accent-solid);
        }
        .stat-value {
          font-family: 'JetBrains Mono', monospace;
          font-size: 48px;
          font-weight: 800;
          background: var(--accent);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 10px;
          line-height: 1;
          letter-spacing: -0.03em;
        }
        .stat-label {
          font-size: 10px;
          color: var(--text-secondary);
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        @media (max-width: 768px) {
          .hero {
            padding: 80px 0 60px;
          }
          .title {
            font-size: 44px;
          }
          .input-wrapper {
            flex-direction: column;
            gap: 12px;
          }
          input {
            font-size: 15px;
            padding: 18px 18px 18px 52px;
          }
          .analyze-button {
            width: 100%;
            justify-content: center;
          }
          .stats {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
          .stat {
            padding: 20px 16px;
          }
          .stat-value {
            font-size: 32px;
          }
        }
      `}</style>
    </section>
  );
}
