import React, { useState } from 'react';
import type { PhotoAnalysis } from '../types';
import { scoreToBand, getScoreColor, getRoomTypeLabel, getRoomTypeIcon } from '../utils';

interface ResultPreviewProps {
  analysis: PhotoAnalysis | null;
  imageUrl?: string;
  loading?: boolean;
}

export default function ResultPreview({ analysis, imageUrl, loading = false }: ResultPreviewProps) {
  const [showSuggestions, setShowSuggestions] = useState(true);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="aspect-video bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="text-center mt-4">
          <p className="text-gray-600">Analizando imagen...</p>
        </div>
      </div>
    );
  }

  if (!analysis || !imageUrl) {
    return (
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <div className="text-4xl mb-4">📸</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Vista previa del resultado
        </h3>
        <p className="text-gray-600">
          Sube una imagen para ver el análisis y las sugerencias de mejora
        </p>
      </div>
    );
  }

  const band = scoreToBand(analysis.score);
  const scoreColor = getScoreColor(analysis.score);

  // Generate mock "after" suggestions (textual improvements)
  const improvementSuggestions = [
    {
      category: 'Iluminación',
      suggestion: 'Aumentar exposición +0.5 stops',
      impact: '+8 puntos',
      color: 'text-yellow-600 bg-yellow-50 border-yellow-200'
    },
    {
      category: 'Composición',
      suggestion: 'Enderezar horizontales -2.3°',
      impact: '+5 puntos',
      color: 'text-blue-600 bg-blue-50 border-blue-200'
    },
    {
      category: 'Nitidez',
      suggestion: 'Aplicar enfoque suave',
      impact: '+3 puntos',
      color: 'text-green-600 bg-green-50 border-green-200'
    }
  ].slice(0, analysis.issues.length); // Only show suggestions for detected issues

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Resultado del análisis
        </h3>
        <button
          onClick={() => setShowSuggestions(!showSuggestions)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showSuggestions ? 'Ocultar' : 'Mostrar'} sugerencias
        </button>
      </div>

      {/* Image Preview */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`text-2xl font-bold ${scoreColor}`}>
                {analysis.score}/100
              </div>
              <div className="text-sm text-gray-600">
                Calidad: <span className="font-medium capitalize">{band}</span>
              </div>
              {analysis.roomType && (
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-1">{getRoomTypeIcon(analysis.roomType)}</span>
                  <span>{getRoomTypeLabel(analysis.roomType)}</span>
                </div>
              )}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(analysis.createdAt).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Image Display */}
        <div className="relative">
          <img
            src={imageUrl}
            alt="Análisis de foto"
            className="w-full h-auto max-h-96 object-contain bg-gray-50"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwTDE3MCAyMDBIMjMwTDIwMCAxNTBaIiBmaWxsPSIjOUNBM0FGIi8+CjxjaXJjbGUgY3g9IjE0MCIgY3k9IjEwMCIgcj0iMjAiIGZpbGw9IiM5Q0EzQUYiLz4KPHRLEHU+';
            }}
          />
          
          {/* Overlay with score */}
          <div className="absolute top-4 right-4">
            <div className={`px-3 py-1 rounded-full text-white font-semibold text-sm ${
              analysis.score >= 80 ? 'bg-green-600' : 
              analysis.score >= 60 ? 'bg-yellow-600' : 'bg-red-600'
            }`}>
              {analysis.score}
            </div>
          </div>
        </div>
      </div>

      {/* Before/After Comparison (Textual) */}
      {showSuggestions && improvementSuggestions.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h4 className="font-medium text-gray-900 flex items-center">
              <span className="mr-2">🔧</span>
              Ajustes sugeridos (simulado)
            </h4>
            <p className="text-sm text-gray-600 mt-1">
              Estas mejoras podrían incrementar la puntuación de tu foto
            </p>
          </div>
          
          <div className="p-4 space-y-3">
            {improvementSuggestions.map((improvement, index) => (
              <div key={index} className={`border rounded-lg p-3 ${improvement.color}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{improvement.category}</div>
                    <div className="text-sm opacity-90">{improvement.suggestion}</div>
                  </div>
                  <div className="text-xs font-medium">
                    {improvement.impact}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Potential Score */}
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-green-800">
                  Puntuación potencial con mejoras:
                </div>
                <div className="text-lg font-bold text-green-600">
                  {Math.min(100, analysis.score + improvementSuggestions.length * 5)}/100
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Suggestions */}
      {analysis.suggestions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-3 flex items-center">
            <span className="mr-2">💡</span>
            Recomendaciones del análisis
          </h4>
          <ul className="space-y-2">
            {analysis.suggestions.map((suggestion, index) => (
              <li key={index} className="text-sm text-blue-800 flex items-start">
                <span className="text-blue-600 mr-2 mt-1">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => {
            // Simulate download functionality
            alert('Funcionalidad simulada: Descargar informe de análisis');
          }}
          className="flex-1 min-w-0 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          📄 Descargar informe
        </button>
        
        <button
          onClick={() => {
            // Simulate sharing functionality
            if (navigator.share) {
              navigator.share({
                title: 'Análisis de foto inmobiliaria',
                text: `Mi foto obtuvo ${analysis.score}/100 puntos`,
                url: window.location.href
              });
            } else {
              alert('Funcionalidad simulada: Compartir resultado');
            }
          }}
          className="flex-1 min-w-0 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
        >
          📤 Compartir
        </button>
      </div>

      {/* Analysis Metadata */}
      <div className="text-xs text-gray-500 space-y-1">
        <div>ID de análisis: {analysis.id}</div>
        <div>Analizado el: {new Date(analysis.createdAt).toLocaleString()}</div>
        <div>{analysis.issues.length} problema{analysis.issues.length !== 1 ? 's' : ''} detectado{analysis.issues.length !== 1 ? 's' : ''}</div>
      </div>
    </div>
  );
}