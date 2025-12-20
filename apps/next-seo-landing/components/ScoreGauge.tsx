'use client';

interface ScoreGaugeProps {
  score: number;
  size?: number;
  showLabel?: boolean;
}

export default function ScoreGauge({ score, size = 200, showLabel = true }: ScoreGaugeProps) {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  
  // Color based on score
  const getColor = () => {
    if (score >= 75) return '#10b981'; // Green
    if (score >= 50) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };
  
  const getStatus = () => {
    if (score >= 75) return 'Excellent';
    if (score >= 50) return 'Good';
    return 'Needs Improvement';
  };

  return (
    <div className="score-gauge">
      <svg width={size} height={size} className="gauge-svg">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border-color)"
          strokeWidth={strokeWidth}
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="progress-circle"
        />
        
        {/* Score text */}
        <text
          x="50%"
          y="45%"
          textAnchor="middle"
          className="score-text"
          fill="var(--text-primary)"
        >
          {score}
        </text>
        <text
          x="50%"
          y="60%"
          textAnchor="middle"
          className="score-label"
          fill="var(--text-secondary)"
        >
          / 100
        </text>
      </svg>
      
      {showLabel && (
        <div className="score-status" style={{ color: getColor() }}>
          {getStatus()}
        </div>
      )}

      <style jsx>{`
        .score-gauge {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .gauge-svg {
          filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
        }
        .progress-circle {
          transition: stroke-dashoffset 1s ease-in-out;
        }
        .score-text {
          font-size: 48px;
          font-weight: 800;
        }
        .score-label {
          font-size: 18px;
          font-weight: 600;
        }
        .score-status {
          font-size: 18px;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}
