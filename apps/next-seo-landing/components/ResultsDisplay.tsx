'use client';

import { useState } from 'react';
import {
  Download,
  Share2,
  Zap,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Layout,
  FileText,
  Link as LinkIcon,
  RefreshCw,
  Lock
} from 'lucide-react';
import ScoreGauge from './ScoreGauge';
import { type SEOAnalysisResult } from '@/lib/api';

interface ResultsDisplayProps {
  result: SEOAnalysisResult;
}

export default function ResultsDisplay({ result }: ResultsDisplayProps) {
  const [expandedIssue, setExpandedIssue] = useState<number | null>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [isHtmlDetailsExpanded, setIsHtmlDetailsExpanded] = useState(true);

  const toggleCategory = (key: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Determine score verdict
  const getScoreVerdict = (score: number) => {
    if (score >= 85) return { label: 'Excellent', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
    if (score >= 70) return { label: 'Good', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
    if (score >= 50) return { label: 'Fair', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
    return { label: 'Poor', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
  };

  const verdict = getScoreVerdict(result.healthScore);
  const issuesFound = result.recommendations.length;
  const criticalIssues = result.recommendations.filter(r => r.priority === 'high').length;

  // Sort categories by score (worst first)
  const sortedCategories = [
    {
      key: 'technical',
      label: 'Technical SEO',
      data: result.categoryScores.technical,
      icon: Zap,
      description: 'Analysis indicates robust site architecture, but crawlability can be improved. Server response times are optimal.'
    },
    {
      key: 'content',
      label: 'Content Quality',
      data: result.categoryScores.content,
      icon: FileText,
      description: 'Content relevance is high, but keyword density is below optimal levels. Readability scores suggest some pages are too complex.'
    },
    {
      key: 'onPage',
      label: 'On-Page SEO',
      data: result.categoryScores.onPage,
      icon: Layout,
      description: 'Meta tags are present but some descriptions are duplicates. HTML header structure needs refinement for better hierarchy.'
    },
  ].sort((a, b) => (a.data?.percentage || 0) - (b.data?.percentage || 0));

  return (
    <>
      <div className="results-container">

        {/* Result Context Bar */}
        <div className="context-bar">
          <div className="context-info">
            <div className="context-label">Analysis for</div>
            <div className="context-url">{result.url.replace('https://', '').replace('http://', '')}</div>
            <div className="context-meta">
              <Clock size={14} />
              <span>Scanned {new Date(result.timestamp).toLocaleString()}</span>
            </div>
          </div>
          <button className="btn-rescan">
            <RefreshCw size={16} />
            Re-scan
          </button>
        </div>

        {/* Score Hero Section */}
        <div className="score-hero">
          <div className="score-left">
            <div className="score-label">SEO Health Score</div>
            <div className="score-display">
              <div className="score-number">{result.healthScore}</div>
              <div className="score-total">/ 100</div>
            </div>
            <div className="score-verdict" style={{ background: verdict.bg }}>
              <span style={{ color: verdict.color }}>{verdict.label}</span>
            </div>

            <div className="score-legend">
              <div className="legend-item">
                <div className="legend-bar poor"></div>
                <span>0-49 Poor</span>
              </div>
              <div className="legend-item">
                <div className="legend-bar fair"></div>
                <span>50-69 Fair</span>
              </div>
              <div className="legend-item">
                <div className="legend-bar good"></div>
                <span>70-84 Good</span>
              </div>
              <div className="legend-item">
                <div className="legend-bar excellent"></div>
                <span>85+ Excellent</span>
              </div>
            </div>
          </div>

          <div className="score-right">
            <div className="score-stats">
              <div className="stat-box">
                <div className="stat-number">{issuesFound}</div>
                <div className="stat-label">Total Issues</div>
              </div>
              <div className="stat-box critical">
                <div className="stat-number">{criticalIssues}</div>
                <div className="stat-label">Critical</div>
              </div>
              <div className="stat-box">
                <div className="stat-number">{result.technicalAnalysis.pageSpeed.loadTime}ms</div>
                <div className="stat-label">Load Time</div>
              </div>
            </div>

            <div className="cta-group">
              <button className="btn-primary-cta">
                <Download size={18} />
                Get Full Report
              </button>
              <button className="btn-secondary-cta">
                <Share2 size={16} />
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="content-grid">

          {/* Left Column */}
          <div className="left-column">

            {/* SEO Breakdown */}
            <section className="section">
              <h2 className="section-title">SEO Health Breakdown</h2>

              {/* HTML Page Details Card */}
              <div className="html-page-details">
                <div
                  className="breakdown-header"
                  onClick={() => setIsHtmlDetailsExpanded(!isHtmlDetailsExpanded)}
                  style={{ cursor: 'pointer', marginBottom: isHtmlDetailsExpanded ? '20px' : '0' }}
                >
                  <h3 className="details-title" style={{ marginBottom: 0 }}>HTML Page</h3>
                  <button className="expand-toggle">
                    {isHtmlDetailsExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </button>
                </div>

                {isHtmlDetailsExpanded && (
                  <div className="details-grid">
                    <div className="detail-item">
                      <div className="detail-header-group">
                        <span className="detail-label">Meta title</span>
                        <div className="ai-badge">AI Analysis</div>
                      </div>
                      <span className="detail-value">
                        {typeof result.seoElements?.title === 'object' && result.seoElements.title !== null
                          ? (result.seoElements.title as any).value || '-'
                          : result.seoElements?.title || '-'}
                      </span>
                      <p className="detail-description">
                        The title tag is the first thing users see in search results. It should be concise (50-60 characters) and include your primary keyword.
                      </p>
                    </div>
                    <div className="detail-item">
                      <div className="detail-header-group">
                        <span className="detail-label">Meta description</span>
                        <div className="ai-badge">AI Analysis</div>
                      </div>
                      <span className="detail-value">
                        {typeof result.seoElements?.description === 'object' && result.seoElements.description !== null
                          ? (result.seoElements.description as any).value || 'Not set'
                          : result.seoElements?.description || 'Not set'}
                      </span>
                      <p className="detail-description">
                        A brief summary of the page content. Well-written descriptions (150-160 characters) can significantly improve click-through rates.
                      </p>
                    </div>
                    <div className="detail-item">
                      <div className="detail-header-group">
                        <span className="detail-label">URL</span>
                        <div className="ai-badge">AI Analysis</div>
                      </div>
                      <span className="detail-value url-value">{result.url}</span>
                      <p className="detail-description">
                        The web address of your page. Short, descriptive URLs are easier for users to read and search engines to crawl.
                      </p>
                    </div>
                    <div className="detail-item">
                      <div className="detail-header-group">
                        <span className="detail-label">Status code</span>
                        <div className="ai-badge">AI Analysis</div>
                      </div>
                      <span className="detail-value">{result.technicalAnalysis?.pageSpeed?.status || '200'}</span>
                      <p className="detail-description">
                        The server response code. A 200 OK status means the page loaded successfully. 4xx or 5xx codes indicate errors.
                      </p>
                    </div>
                    <div className="detail-item">
                      <div className="detail-header-group">
                        <span className="detail-label">Response time</span>
                        <div className="ai-badge">AI Analysis</div>
                      </div>
                      <span className="detail-value">{(result.technicalAnalysis?.pageSpeed?.loadTime / 1000).toFixed(2)} sec</span>
                      <p className="detail-description">
                        How quickly your server responds. Faster response times (under 500ms) improve user experience and crawl budget.
                      </p>
                    </div>
                    <div className="detail-item">
                      <div className="detail-header-group">
                        <span className="detail-label">Word count</span>
                        <div className="ai-badge">AI Analysis</div>
                      </div>
                      <span className="detail-value">
                        {typeof result.seoElements?.wordCount === 'number'
                          ? result.seoElements.wordCount
                          : '-'}
                      </span>
                      <p className="detail-description">
                        The total number of words on the page. Sufficient content length (typically 600+ words) helps cover topics in depth for better ranking.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="breakdown-list">
                {sortedCategories.map((cat, idx) => {
                  const Icon = cat.icon;
                  const percentage = cat.data?.percentage || 0;
                  const scoreColor = percentage >= 70 ? '#10b981' : percentage >= 50 ? '#f59e0b' : '#ef4444';

                  // Get category-specific recommendations
                  const categoryRecs = result.recommendations.filter(r => r.category === cat.key);
                  const criticalCount = categoryRecs.filter(r => r.priority === 'high').length;
                  const expanded = expandedCategories[cat.key] || false;

                  return (
                    <div key={cat.key} className="breakdown-row">
                      <div className="breakdown-icon" style={{ background: `${scoreColor}15`, color: scoreColor }}>
                        <Icon size={20} />
                      </div>
                      <div className="breakdown-content">
                        <div className="breakdown-header" onClick={() => toggleCategory(cat.key)} style={{ cursor: 'pointer' }}>
                          <div className="breakdown-title-group">
                            <h3>{cat.label}</h3>
                            <span className="breakdown-percentage" style={{ color: scoreColor }}>
                              {Math.round(percentage)}%
                            </span>
                          </div>
                          <div className="breakdown-meta-group">
                            {categoryRecs.length > 0 && (
                              <span className="issues-badge">
                                {categoryRecs.length} issue{categoryRecs.length !== 1 ? 's' : ''}
                                {criticalCount > 0 && ` • ${criticalCount} critical`}
                              </span>
                            )}
                            <button className="expand-toggle">
                              {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                            </button>
                          </div>
                        </div>

                        <div className="detail-header-group" style={{ marginBottom: '6px' }}>
                          <div className="ai-badge">AI Analysis</div>
                        </div>
                        <p className="breakdown-desc">{cat.description}</p>

                        <div className="progress-track">
                          <div className="progress-fill" style={{ width: `${percentage}%`, background: scoreColor }}></div>
                        </div>

                        {/* Expanded Details */}
                        {expanded && categoryRecs.length > 0 && (
                          <div className="breakdown-details">
                            <h4 className="details-subtitle">Checks</h4>
                            <div className="checks-list">
                              {categoryRecs.map((rec, i) => {
                                const checkStatus = rec.priority === 'high' ? 'error' : rec.priority === 'medium' ? 'warning' : 'tip';
                                const statusIcon = checkStatus === 'error' ? <AlertTriangle size={16} /> :
                                  checkStatus === 'warning' ? <AlertCircle size={16} /> :
                                    <CheckCircle2 size={16} />;

                                return (
                                  <div key={i} className={`check-item check-${checkStatus}`}>
                                    <div className="check-header">
                                      <div className="check-left">
                                        <span className="check-icon">{statusIcon}</span>
                                        <span className="check-title">{rec.issue}</span>
                                      </div>
                                      <span className={`check-badge ${checkStatus}`}>
                                        {checkStatus === 'error' ? 'Error' : checkStatus === 'warning' ? 'Warning' : 'Tip'}
                                      </span>
                                    </div>
                                    <div className="check-body">
                                      <p className="check-recommendation">{rec.recommendation}</p>
                                      {rec.impact && (
                                        <p className="check-impact">
                                          <strong>Impact:</strong> {rec.impact}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Critical Issues */}
            <section className="section">
              <div className="section-header">
                <h2 className="section-title">Critical Issues</h2>
                <span className="issues-count">{criticalIssues} found</span>
              </div>

              <div className="issues-list">
                {result.recommendations
                  .filter(r => r.priority === 'high')
                  .slice(0, 3)
                  .map((issue, idx) => (
                    <div key={idx} className="issue-card" onClick={() => setExpandedIssue(expandedIssue === idx ? null : idx)}>
                      <div className="issue-header">
                        <div className="issue-left">
                          <div className="issue-icon-critical">
                            <AlertTriangle size={18} />
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <h3 className="issue-title" style={{ marginBottom: 0 }}>{issue.issue}</h3>
                              <div className="ai-badge" style={{ fontSize: '9px', padding: '1px 6px' }}>AI</div>
                            </div>
                            <p className="issue-desc">{issue.recommendation}</p>
                          </div>
                        </div>
                        <button className="expand-btn">
                          {expandedIssue === idx ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        </button>
                      </div>

                      <div className="issue-meta">
                        <span className="meta-tag critical">Critical</span>
                        <span className="meta-tag impact">+15-20% CTR</span>
                        <span className="meta-tag difficulty">Easy Fix</span>
                      </div>

                      {expandedIssue === idx && (
                        <div className="issue-actions">
                          <button className="action-btn primary">
                            <ExternalLink size={14} />
                            Fix Guide
                          </button>
                          <button className="action-btn">Learn More</button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>

              {issuesFound > 3 && (
                <div className="locked-content">
                  <Lock size={16} />
                  <span>{issuesFound - 3} more issues hidden</span>
                  <button className="unlock-btn">Unlock Full Report</button>
                </div>
              )}
            </section>

          </div>

          {/* Right Column */}
          <div className="right-column">

            {/* AI Strategic Insights */}
            <section className="section">
              <h2 className="section-title">AI Strategic Insights</h2>

              {result.strategicRecommendations && result.strategicRecommendations.length > 0 ? (
                <div className="recommendations-list">
                  {result.strategicRecommendations.map((rec, idx) => (
                    <div key={rec.id} className="rec-card">
                      <div className="rec-number">#{idx + 1}</div>
                      <div className="rec-content">
                        <h3 className="rec-title">{rec.title}</h3>
                        <p className="rec-description">{rec.description}</p>
                        <div className="rec-meta">
                          <span className={`rec-badge ${rec.impact.toLowerCase()}`}>{rec.impact} Impact</span>
                          <span className="rec-badge type">{rec.type}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-insights">
                  <p>No AI insights available at this time.</p>
                </div>
              )}
            </section>

            {/* Upgrade Card */}
            <div className="upgrade-card">
              <div className="upgrade-header">
                <Zap size={24} fill="currentColor" />
                <h3>Unlock Full SEO Power</h3>
              </div>
              <p>Get the complete analysis with advanced features:</p>
              <ul className="upgrade-features">
                <li><CheckCircle2 size={16} /> 40+ detailed recommendations</li>
                <li><CheckCircle2 size={16} /> Competitor analysis</li>
                <li><CheckCircle2 size={16} /> Keyword rank tracking</li>
                <li><CheckCircle2 size={16} /> Priority support</li>
              </ul>
              <button className="btn-upgrade">Upgrade to Pro</button>
            </div>

          </div>

        </div>

      </div>

      {/* Sticky Bottom CTA */}
      <div className="sticky-cta">
        <div className="sticky-content">
          <div className="sticky-left">
            <div className="sticky-score">{result.healthScore}/100</div>
            <div className="sticky-info">
              <span className="sticky-label">SEO Score</span>
              <span className="sticky-issues">{criticalIssues} critical issues</span>
            </div>
          </div>
          <button className="sticky-btn">
            <Download size={16} />
            Get Full Report
          </button>
        </div>
      </div>

      <style jsx>{`
        .results-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px 120px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        /* Context Bar */
        .context-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--card-bg);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px 24px;
          margin-bottom: 32px;
        }
        .context-info {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .context-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--text-secondary);
        }
        .context-url {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .context-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--text-secondary);
        }
        .btn-rescan {
          display: flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .btn-rescan:hover {
          background: var(--card-bg);
          border-color: var(--accent-solid);
        }

        /* Score Hero */
        .score-hero {
          background: rgba(249, 160, 48, 0.05);
          border: 1px solid rgba(249, 160, 48, 0.2);
          border-radius: 20px;
          padding: 48px;
          margin-bottom: 48px;
          display: flex;
          justify-content: space-between;
          gap: 48px;
        }
        .score-left {
          flex: 1;
        }
        .score-label {
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: var(--text-secondary);
          margin-bottom: 16px;
        }
        .score-display {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 20px;
        }
        .score-number {
          font-family: 'JetBrains Mono', monospace;
          font-size: 80px;
          font-weight: 900;
          line-height: 1;
          background: var(--accent);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-variant-numeric: tabular-nums;
        }
        .score-total {
          font-family: 'JetBrains Mono', monospace;
          font-size: 28px;
          font-weight: 600;
          color: var(--text-secondary);
          font-variant-numeric: tabular-nums;
        }
        .score-verdict {
          display: inline-flex;
          padding: 8px 20px;
          border-radius: 8px;
          margin-bottom: 32px;
          font-size: 15px;
          font-weight: 700;
        }
        .score-legend {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .legend-bar {
          width: 40px;
          height: 6px;
          border-radius: 3px;
        }
        .legend-bar.poor { background: #ef4444; }
        .legend-bar.fair { background: #f59e0b; }
        .legend-bar.good { background: #10b981; }
        .legend-bar.excellent { background: #10b981; }
        .legend-item span {
          font-size: 13px;
          color: var(--text-secondary);
        }

        .score-right {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .score-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .stat-box {
          background: var(--card-bg);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
          text-align: center;
        }
        .stat-box.critical {
          border-color: rgba(239, 68, 68, 0.3);
          background: rgba(239, 68, 68, 0.05);
        }
        .stat-number {
          font-family: 'JetBrains Mono', monospace;
          font-size: 32px;
          font-weight: 800;
          line-height: 1;
          margin-bottom: 8px;
          font-variant-numeric: tabular-nums;
        }
        .stat-box.critical .stat-number {
          color: #ef4444;
        }
        .stat-label {
          font-size:12px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .cta-group {
          display: flex;
          gap: 12px;
        }
        .btn-primary-cta {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: var(--accent-solid);
          color: white;
          border: none;
          padding: 16px 32px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          box-shadow: 0 8px 24px var(--glow);
          transition: all 0.3s;
        }
        .btn-primary-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px var(--glow);
        }
        .btn-secondary-cta {
          display: flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          padding: 16px 24px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .btn-secondary-cta:hover {
          background: var(--card-bg);
          border-color: var(--accent-solid);
        }

        /* Content Grid */
        .content-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 32px;
        }

        .section {
          margin-bottom: 40px;
        }
        .section-title {
          font-size: 24px;
          font-weight: 800;
          margin-bottom: 24px;
          letter-spacing: -0.02em;
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .issues-count {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-secondary);
          background: rgba(239, 68, 68, 0.1);
          padding: 4px 12px;
          border-radius: 6px;
        }

        /* HTML Page Details */
        .html-page-details {
          background: var(--card-bg);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
        }
        .details-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 16px;
        }
        .details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }
        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .detail-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .detail-value {
          font-size: 14px;
          color: var(--text-primary);
          font-weight: 500;
        }
        .url-value {
          word-break: break-all;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
        }

        /* Breakdown */
        .breakdown-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .breakdown-row {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          background: var(--card-bg);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 24px;
          transition: all 0.3s;
        }
        .breakdown-row:hover {
          border-color: var(--accent-solid);
        }
        .breakdown-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .breakdown-content {
          flex: 1;
        }
        .breakdown-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .breakdown-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .breakdown-title-group h3 {
          font-size: 18px;
          font-weight: 700;
          margin: 0;
        }
        .breakdown-percentage {
          font-family: 'JetBrains Mono', monospace;
          font-size: 20px;
          font-weight: 800;
          font-variant-numeric: tabular-nums;
        }
        .breakdown-meta-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .issues-badge {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          background: rgba(255, 255, 255, 0.05);
          padding: 4px 12px;
          border-radius: 6px;
        }
        .expand-toggle {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          padding: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }
        .expand-toggle:hover {
          color: var(--text-primary);
        }
        .breakdown-desc {
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: 16px;
          line-height: 1.5;
        }
        
        /* Breakdown Details (Expanded) */
        .breakdown-details {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid var(--border-color);
        }
        .details-subtitle {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 16px;
        }
        .checks-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .check-item {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 12px;
          padding: 16px;
          border-left: 3px solid transparent;
        }
        .check-item.check-error {
          border-left-color: #ef4444;
        }
        .check-item.check-warning {
          border-left-color: #f59e0b;
        }
        .check-item.check-tip {
          border-left-color: #6366f1;
        }
        .check-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }
        .check-left {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          flex: 1;
        }
        .check-icon {
          flex-shrink: 0;
          display: flex;
          margin-top: 2px;
        }
        .check-item.check-error .check-icon {
          color: #ef4444;
        }
        .check-item.check-warning .check-icon {
          color: #f59e0b;
        }
        .check-item.check-tip .check-icon {
          color: #6366f1;
        }
        .check-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.4;
        }
        .check-badge {
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          flex-shrink: 0;
        }
        .check-badge.error {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }
        .check-badge.warning {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }
        .check-badge.tip {
          background: rgba(99, 102, 241, 0.15);
          color: #6366f1;
        }
        .check-body {
          padding-left: 26px;
        }
        .check-recommendation {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 8px;
        }
        .check-impact {
          font-size: 13px;
          color: var(--text-secondary);
          margin: 0;
        }
        .check-impact strong {
          color: var(--text-primary);
        }
        .breakdown-findings {
          margin-bottom: 16px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
          border: 1px solid var(--border-color);
        }
        .findings-header {
          margin-bottom: 8px;
        }
        .findings-count {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .findings-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .finding-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 13px;
          line-height: 1.5;
        }
        .finding-priority {
          flex-shrink: 0;
          font-size: 14px;
        }
        .finding-text {
          color: var(--text-primary);
          flex: 1;
        }
        .finding-more {
          font-size: 12px;
          color: var(--text-secondary);
          font-style: italic;
          padding-left: 22px;
        }
        .progress-track {
          height: 6px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.6s ease;
        }

        /* Issues */
        .issues-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .issue-card {
          background: var(--card-bg);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 24px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .issue-card:hover {
          border-color: rgba(239, 68, 68, 0.4);
        }
        .issue-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }
        .issue-left {
          display: flex;
          gap: 16px;
          flex: 1;
        }
        .issue-icon-critical {
          width: 40px;
          height: 40px;
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .issue-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 6px;
        }
        .issue-desc {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.6;
        }
        .expand-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          padding: 4px;
          cursor: pointer;
        }
        .issue-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 16px;
        }
        .meta-tag {
          font-size: 12px;
          font-weight: 700;
          padding: 6px 12px;
          border-radius: 6px;
        }
        .meta-tag.critical {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }
        .meta-tag.impact {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
        }
        .meta-tag.difficulty {
          background: rgba(249, 160, 48, 0.15);
          color: var(--accent-solid);
        }
        .issue-actions {
          display: flex;
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid var(--border-color);
        }
        .action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .action-btn.primary {
          background: var(--accent-solid);
          border-color: var(--accent-solid);
          color: white;
        }
        .action-btn:hover {
          background: var(--card-bg);
        }

        .locked-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: rgba(249, 160, 48, 0.05);
          border: 1px dashed rgba(249, 160, 48, 0.3);
          border-radius: 12px;
          padding: 24px;
          margin-top: 16px;
          font-size: 14px;
          color: var(--text-secondary);
        }
        .unlock-btn {
          background: var(--accent-solid);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          margin-left: auto;
        }

        /* Recommendations */
        .recommendations-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .rec-card {
          display: flex;
          gap: 16px;
          background: var(--card-bg);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 20px;
          transition: all 0.3s;
        }
        .rec-card:hover {
          border-color: var(--accent-solid);
          transform: translateY(-2px);
        }
        .rec-number {
          width: 32px;
          height: 32px;
          background: var(--accent);
          color: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'JetBrains Mono', monospace;
          font-size: 16px;
          font-weight: 800;
          flex-shrink: 0;
        }
        .rec-content {
          flex: 1;
        }
        .rec-title {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 10px;
        }
        .rec-description {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 12px;
        }
        .rec-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .rec-badge {
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .rec-badge.high {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }
        .rec-badge.medium {
          background: rgba(249, 160, 48, 0.15);
          color: var(--accent-solid);
        }
        .rec-badge.low {
          background: rgba(99, 102, 241, 0.15);
          color: #6366f1;
        }
        .rec-badge.type {
          background: rgba(139, 92, 246, 0.15);
          color: #8b5cf6;
        }
        .rec-badge.priority {
          background: rgba(139, 92, 246, 0.15);
          color: #8b5cf6;
        }
        .rec-badge.impact {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
        }
        .rec-badge.effort {
          background: rgba(99, 102, 241, 0.15);
          color: #6366f1;
        }
        .no-insights {
          text-align: center;
          padding: 32px;
          color: var(--text-secondary);
          font-style: italic;
        }

        /* Upgrade Card */
        .upgrade-card {
          background: var(--accent);
          color: white;
          border-radius: 20px;
          padding: 32px;
        }
        .upgrade-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        .upgrade-header h3 {
          font-size: 20px;
          font-weight: 800;
        }
        .upgrade-card p {
          font-size: 15px;
          margin-bottom: 20px;
          opacity: 0.9;
          line-height: 1.5;
        }
        .upgrade-features {
          list-style: none;
          padding: 0;
          margin: 0 0 24px 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .upgrade-features li {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 15px;
        }
        .btn-upgrade {
          width: 100%;
          background: white;
          color: var(--accent-solid);
          border: none;
          padding: 14px;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 700;
          transition: all 0.2s;
        }
        .btn-upgrade:hover {
          transform: translateY(-2px);
        }

        /* Sticky CTA */
        .sticky-cta {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: var(--card-bg);
          backdrop-filter: blur(20px);
          border-top: 1px solid var(--border-color);
          padding: 16px 24px;
          z-index: 50;
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.2);
        }
        .sticky-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .sticky-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .sticky-score {
          font-family: 'JetBrains Mono', monospace;
          font-size: 32px;
          font-weight: 900;
          background: var(--accent-solid);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-variant-numeric: tabular-nums;
        }
        .sticky-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .sticky-label {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .sticky-issues {
          font-size: 12px;
          color: #ef4444;
          font-weight: 600;
        }
        .sticky-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--accent);
          color: white;
          border: none;
          padding: 12px 32px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 700;
          box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
        }

        /* HTML Page Details Styles */
        .detail-header-group {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }
        
        .ai-badge {
          font-size: 10px;
          font-weight: 700;
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .detail-description {
          font-size: 12px;
          color: var(--text-secondary);
          margin-top: 8px;
          line-height: 1.5;
          opacity: 0.8;
        }

        @media (max-width: 1024px) {
          .content-grid {
            grid-template-columns: 1fr;
          }
          .score-hero {
            flex-direction: column;
          }
          .score-stats {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .context-bar {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .score-number {
            font-size: 64px;
          }
          .score-stats {
            grid-template-columns: 1fr;
          }
          .cta-group {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
}
