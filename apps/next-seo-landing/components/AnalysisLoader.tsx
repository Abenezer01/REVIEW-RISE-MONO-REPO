'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, Zap, Smartphone, Shield } from 'lucide-react';

interface AnalysisStep {
  id: string;
  label: string;
  subtext: string;
}

const steps: AnalysisStep[] = [
  { id: 'fetch', label: 'Fetching website data...', subtext: 'Connecting to server' },
  { id: 'technical', label: 'Analyzing technical SEO...', subtext: 'Checking SSL, headers, and structure' },
  { id: 'content', label: 'Evaluating content quality...', subtext: 'Scanning keywords and readability' },
  { id: 'mobile', label: 'Testing mobile responsiveness...', subtext: 'Simulating mobile devices' },
  { id: 'performance', label: 'Measuring performance...', subtext: 'Calculating Core Web Vitals' },
];

export default function AnalysisLoader() {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 1; // Increment progress
      });
    }, 50); // Complete in ~5 seconds

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Sync steps with progress
    const stepDuration = 100 / steps.length;
    const step = Math.floor(progress / stepDuration);
    setCurrentStep(Math.min(step, steps.length - 1));
  }, [progress]);

  return (
    <div className="loader-container">
      {/* Step Progress Container */}
      <div className="progress-card">
        {/* Animated App Icon */}
        <div className="app-icon-wrapper">
          <div className="app-icon">
            <Zap size={32} color="white" fill="white" />
          </div>
          <div className="ripple"></div>
        </div>

        <h3 className="progress-text">
          {steps[currentStep].label} <span className="percentage">{progress}%</span>
        </h3>
        
        <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="steps-list">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;

            return (
              <div key={step.id} className={`step-item ${isCurrent ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                <div className="step-icon">
                  {isCompleted ? (
                    <CheckCircle2 size={20} className="text-green-500" />
                  ) : isCurrent ? (
                    <Loader2 size={20} className="animate-spin text-accent" />
                  ) : (
                    <div className="circle-placeholder" />
                  )}
                </div>
                <div className="step-content">
                    <span className="step-label">{step.subtext}</span>
                    {isCompleted && <span className="step-time">✓ Completed</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Early Insights Card */}
      <div className="insights-card">
        <div className="insights-header">
           <Zap size={20} className="text-purple-400" />
           <span>Early Insights Detected</span>
        </div>
        
        <div className="insight-item">
            <div className="insight-icon bg-purple-500/20 text-purple-400">
                <Zap size={16} />
            </div>
            <span>Page load time: 2.4s - Room for improvement detected</span>
        </div>
        
        <div className="insight-item">
            <div className="insight-icon bg-purple-500/20 text-purple-400">
                <Smartphone size={16} />
            </div>
            <span>Mobile optimization: Excellent responsive design found</span>
        </div>
        
        <div className="insight-item">
            <div className="insight-icon bg-purple-500/20 text-purple-400">
                <Shield size={16} />
            </div>
            <span>Security: HTTPS properly configured</span>
        </div>
      </div>

      <style jsx>{`
        .loader-container {
            max-width: 600px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: 24px;
        }
        .progress-card {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 20px;
            padding: 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
            backdrop-filter: blur(10px);
        }
        .app-icon-wrapper {
            position: relative;
            width: 80px;
            height: 80px;
            margin: 0 auto 24px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .app-icon {
            width: 64px;
            height: 64px;
            background: linear-gradient(135deg, #f59e0b, #d97706);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2;
            box-shadow: 0 10px 25px -5px rgba(245, 158, 11, 0.5);
        }
        .ripple {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            border: 2px solid rgba(245, 158, 11, 0.3);
            animation: ripple 2s infinite;
        }
        @keyframes ripple {
            0% { transform: scale(0.8); opacity: 1; }
            100% { transform: scale(1.5); opacity: 0; }
        }
        .progress-text {
            font-size: 18px;
            font-weight: 600;
            color: var(--accent);
            margin-bottom: 24px;
        }
        .percentage {
            color: var(--text-primary);
        }
        .progress-bar-bg {
            height: 6px;
            background: var(--border-color);
            border-radius: 3px;
            overflow: hidden;
            margin-bottom: 32px;
            max-width: 200px;
            margin-left: auto;
            margin-right: auto;
        }
        .progress-bar-fill {
            height: 100%;
            background: var(--accent);
            border-radius: 3px;
            transition: width 0.3s ease;
        }
        .steps-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
            text-align: left;
            max-width: 300px;
            margin: 0 auto;
        }
        .step-item {
            display: flex;
            align-items: center;
            gap: 12px;
            opacity: 0.5;
            transition: opacity 0.3s;
        }
        .step-item.active, .step-item.completed {
            opacity: 1;
        }
        .step-content {
            display: flex;
            flex-direction: column;
        }
        .step-label {
            font-size: 14px;
            font-weight: 500;
        }
        .step-time {
            font-size: 12px;
            color: #10b981;
        }
        .circle-placeholder {
            width: 20px;
            height: 20px;
            border: 2px solid var(--border-color);
            border-radius: 50%;
        }
        
        .insights-card {
            background: rgba(168, 85, 247, 0.05);
            border: 1px solid rgba(168, 85, 247, 0.2);
            border-radius: 16px;
            padding: 24px;
        }
        .insights-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 16px;
            font-weight: 700;
            color: #e9d5ff; /* Light purple text */
        }
        .insight-item {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
            font-size: 14px;
            color: var(--text-secondary);
        }
        .insight-icon {
            width: 24px;
            height: 24px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
      `}</style>
    </div>
  );
}
