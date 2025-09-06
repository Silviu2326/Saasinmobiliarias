import React from 'react';
import { scoreToBand, getBandColor, getScoreColor, getProgressColor } from '../utils';

interface PhotoQualityMeterProps {
  score: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export default function PhotoQualityMeter({ 
  score, 
  showLabel = true, 
  size = 'md',
  animated = true 
}: PhotoQualityMeterProps) {
  const band = scoreToBand(score);
  const bandColor = getBandColor(band);
  const scoreColor = getScoreColor(score);
  const progressColor = getProgressColor(score);

  const sizeClasses = {
    sm: {
      container: 'w-32',
      bar: 'h-2',
      text: 'text-sm',
      badge: 'text-xs px-2 py-1'
    },
    md: {
      container: 'w-48',
      bar: 'h-3',
      text: 'text-base',
      badge: 'text-sm px-3 py-1'
    },
    lg: {
      container: 'w-64',
      bar: 'h-4',
      text: 'text-lg',
      badge: 'text-base px-4 py-2'
    }
  };

  const classes = sizeClasses[size];

  const getBandEmoji = (band: string) => {
    switch (band) {
      case 'ideal': return '🌟';
      case 'aceptable': return '👍';
      case 'pobre': return '⚠️';
      default: return '📊';
    }
  };

  const getBandMessage = (band: string, score: number) => {
    if (score >= 90) return 'Excelente calidad';
    if (score >= 80) return 'Muy buena calidad';
    if (score >= 70) return 'Buena calidad';
    if (score >= 60) return 'Calidad mejorable';
    if (score >= 40) return 'Necesita mejoras';
    return 'Requiere corrección';
  };

  return (
    <div className="space-y-3">
      {/* Score Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{getBandEmoji(band)}</span>
          <span className={`font-bold ${classes.text} ${scoreColor}`}>
            {score}/100
          </span>
        </div>
        {showLabel && (
          <span className={`inline-flex items-center rounded-full border font-medium ${classes.badge} ${bandColor}`}>
            {band.charAt(0).toUpperCase() + band.slice(1)}
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className={classes.container}>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
        <div className={`bg-gray-200 rounded-full overflow-hidden ${classes.bar}`}>
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${progressColor} ${
              animated ? 'animate-pulse' : ''
            }`}
            style={{ 
              width: `${score}%`,
              transition: animated ? 'width 1.5s ease-out' : 'none'
            }}
          />
        </div>
        
        {/* Scale Markers */}
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Pobre</span>
          <span>Aceptable</span>
          <span>Ideal</span>
        </div>
      </div>

      {/* Quality Message */}
      {showLabel && (
        <div className="text-center">
          <p className={`font-medium ${classes.text.replace('text-', 'text-sm text-')} text-gray-700`}>
            {getBandMessage(band, score)}
          </p>
        </div>
      )}

      {/* Quality Bands Visualization */}
      <div className="flex space-x-1">
        <div className="flex-1 h-2 bg-red-200 rounded-l">
          <div className="h-full bg-red-400 rounded-l" style={{ width: '100%' }} />
        </div>
        <div className="flex-1 h-2 bg-yellow-200">
          <div className="h-full bg-yellow-400" style={{ width: '100%' }} />
        </div>
        <div className="flex-1 h-2 bg-green-200 rounded-r">
          <div className="h-full bg-green-400 rounded-r" style={{ width: '100%' }} />
        </div>
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>0-59</span>
        <span>60-79</span>
        <span>80-100</span>
      </div>
    </div>
  );
}

// Compact version for tables and small spaces
export function PhotoQualityScore({ score, showBand = false }: { score: number; showBand?: boolean }) {
  const band = scoreToBand(score);
  const scoreColor = getScoreColor(score);
  const bandColor = getBandColor(band);

  return (
    <div className="flex items-center space-x-2">
      <span className={`font-semibold ${scoreColor}`}>
        {score}
      </span>
      {showBand && (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${bandColor}`}>
          {band}
        </span>
      )}
    </div>
  );
}

// Circular progress version
export function PhotoQualityCircular({ score, size = 60 }: { score: number; size?: number }) {
  const radius = size / 2 - 4;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const progressColor = getProgressColor(score).replace('bg-', '');
  
  const strokeColor = progressColor === 'green-500' ? '#10B981' : 
                     progressColor === 'yellow-500' ? '#F59E0B' : '#EF4444';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth="4"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-sm font-semibold ${getScoreColor(score)}`}>
          {score}
        </span>
      </div>
    </div>
  );
}