import React, { useState } from 'react';
import type { PhotoIssue } from '../types';
import { getIssueIcon, getIssueLabel, getSeverityColor, getSeverityLabel } from '../utils';

interface PhotoIssuesListProps {
  issues: PhotoIssue[];
  showHints?: boolean;
  onIssueClick?: (issue: PhotoIssue) => void;
}

export default function PhotoIssuesList({ 
  issues, 
  showHints = true,
  onIssueClick 
}: PhotoIssuesListProps) {
  const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set());

  const toggleIssueExpansion = (issueCode: string) => {
    setExpandedIssues(prev => {
      const newSet = new Set(prev);
      if (newSet.has(issueCode)) {
        newSet.delete(issueCode);
      } else {
        newSet.add(issueCode);
      }
      return newSet;
    });
  };

  const groupedIssues = issues.reduce((acc, issue) => {
    if (!acc[issue.severity]) {
      acc[issue.severity] = [];
    }
    acc[issue.severity].push(issue);
    return acc;
  }, {} as Record<string, PhotoIssue[]>);

  const severityOrder = ['high', 'med', 'low'];

  if (issues.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="text-4xl mb-2">✨</div>
        <h3 className="text-lg font-medium text-green-800 mb-1">
          ¡Excelente trabajo!
        </h3>
        <p className="text-green-700">
          No se detectaron problemas en esta imagen.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Problemas detectados ({issues.length})
        </h3>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span>👆 Toca para ver consejos</span>
        </div>
      </div>

      <div className="space-y-3">
        {severityOrder.map(severity => {
          const severityIssues = groupedIssues[severity];
          if (!severityIssues || severityIssues.length === 0) return null;

          return (
            <div key={severity} className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(severity as any)}`}>
                  {getSeverityLabel(severity as any)}
                </span>
                <span className="text-sm text-gray-500">
                  {severityIssues.length} problema{severityIssues.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="space-y-2">
                {severityIssues.map((issue, index) => {
                  const issueKey = `${issue.code}-${index}`;
                  const isExpanded = expandedIssues.has(issueKey);

                  return (
                    <div
                      key={issueKey}
                      className={`border rounded-lg transition-all duration-200 ${
                        severity === 'high' 
                          ? 'border-red-200 bg-red-50' 
                          : severity === 'med'
                          ? 'border-yellow-200 bg-yellow-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <button
                        onClick={() => {
                          toggleIssueExpansion(issueKey);
                          onIssueClick?.(issue);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <span className="text-xl mt-0.5">
                              {getIssueIcon(issue.code)}
                            </span>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-gray-900">
                                  {getIssueLabel(issue.code)}
                                </h4>
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getSeverityColor(issue.severity)}`}>
                                  {getSeverityLabel(issue.severity)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {issue.message}
                              </p>
                            </div>
                          </div>
                          <div className="ml-2 flex-shrink-0">
                            <svg 
                              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                                isExpanded ? 'transform rotate-180' : ''
                              }`}
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </button>

                      {/* Expanded hints */}
                      {isExpanded && showHints && issue.hints.length > 0 && (
                        <div className="px-4 pb-4">
                          <div className="border-t border-current border-opacity-20 pt-3">
                            <h5 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                              <span className="mr-2">💡</span>
                              Cómo solucionarlo:
                            </h5>
                            <ul className="space-y-1">
                              {issue.hints.map((hint, hintIndex) => (
                                <li key={hintIndex} className="text-sm text-gray-700 flex items-start">
                                  <span className="text-gray-400 mr-2 mt-1">•</span>
                                  <span>{hint}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-blue-800 mb-1">
              Resumen de problemas
            </h4>
            <div className="text-sm text-blue-700 space-y-1">
              {groupedIssues.high && (
                <div>🔴 {groupedIssues.high.length} problema{groupedIssues.high.length !== 1 ? 's' : ''} crítico{groupedIssues.high.length !== 1 ? 's' : ''}</div>
              )}
              {groupedIssues.med && (
                <div>🟡 {groupedIssues.med.length} problema{groupedIssues.med.length !== 1 ? 's' : ''} moderado{groupedIssues.med.length !== 1 ? 's' : ''}</div>
              )}
              {groupedIssues.low && (
                <div>⚪ {groupedIssues.low.length} problema{groupedIssues.low.length !== 1 ? 's' : ''} menor{groupedIssues.low.length !== 1 ? 'es' : ''}</div>
              )}
              <p className="mt-2 font-medium">
                💡 Prioriza los problemas críticos para obtener mejores resultados
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact version for smaller spaces
export function PhotoIssuesCompact({ issues }: { issues: PhotoIssue[] }) {
  if (issues.length === 0) {
    return (
      <div className="flex items-center text-green-600">
        <span className="mr-2">✅</span>
        <span className="text-sm font-medium">Sin problemas</span>
      </div>
    );
  }

  const severityCounts = issues.reduce((acc, issue) => {
    acc[issue.severity] = (acc[issue.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex items-center space-x-3">
      {severityCounts.high && (
        <div className="flex items-center text-red-600">
          <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
          <span className="text-sm">{severityCounts.high}</span>
        </div>
      )}
      {severityCounts.med && (
        <div className="flex items-center text-yellow-600">
          <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>
          <span className="text-sm">{severityCounts.med}</span>
        </div>
      )}
      {severityCounts.low && (
        <div className="flex items-center text-gray-600">
          <span className="w-2 h-2 bg-gray-400 rounded-full mr-1"></span>
          <span className="text-sm">{severityCounts.low}</span>
        </div>
      )}
    </div>
  );
}