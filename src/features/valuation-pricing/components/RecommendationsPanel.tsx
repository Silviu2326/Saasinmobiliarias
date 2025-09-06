import React from 'react';
import { TrendingUp, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import type { Recommendation } from '../types';
import { formatMoney, formatPercent, getConfidenceColor } from '../utils';

interface RecommendationsPanelProps {
  recommendations: Recommendation[];
  onApply: (recommendation: Recommendation) => void;
  onCompare: (ids: string[]) => void;
  loading?: boolean;
}

const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({
  recommendations,
  onApply,
  onCompare,
  loading = false
}) => {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const handleCompare = () => {
    if (selectedIds.length >= 2) {
      onCompare(selectedIds);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recomendaciones de Precio</h3>
        {selectedIds.length >= 2 && (
          <button
            onClick={handleCompare}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            Comparar ({selectedIds.length})
          </button>
        )}
      </div>

      {recommendations.length === 0 ? (
        <div className="text-center py-8">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No hay recomendaciones disponibles</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.slice(0, 4).map((rec) => (
            <div
              key={rec.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(rec.id)}
                    onChange={() => toggleSelection(rec.id)}
                    className="mt-1"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-gray-900">
                        {formatMoney(rec.listPrice)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(rec.confidence)}`}>
                        {rec.confidence === 'HIGH' ? 'Alta' : rec.confidence === 'MEDIUM' ? 'Media' : 'Baja'} confianza
                      </span>
                    </div>
                    <div className="flex gap-4 mt-1">
                      <span className="text-sm text-gray-600">
                        Ancla: {formatMoney(rec.anchorPrice)}
                      </span>
                      <span className="text-sm text-gray-600">
                        Mín: {formatMoney(rec.minAcceptable)}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onApply(rec)}
                  className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                >
                  Aplicar
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-500">DOM esperado</p>
                  <p className="text-sm font-semibold text-gray-900">{rec.domP50} días</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-500">Prob. 60d</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatPercent(rec.closeProb60d * 100, 0)}
                  </p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-500">Neto est.</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatMoney(rec.expectedNetOwner, 'EUR', true)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {rec.reasons.map((reason, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{reason}</span>
                  </div>
                ))}
              </div>

              {rec.riskFactors && rec.riskFactors.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  {rec.riskFactors.map((risk, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{risk}</span>
                    </div>
                  ))}
                </div>
              )}

              {rec.competitivePosition && (
                <div className="mt-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-600">
                    Posición competitiva: 
                    <span className={`ml-1 font-medium ${
                      rec.competitivePosition === 'BELOW' ? 'text-green-600' :
                      rec.competitivePosition === 'AT' ? 'text-blue-600' :
                      'text-orange-600'
                    }`}>
                      {rec.competitivePosition === 'BELOW' ? 'Ventajosa' :
                       rec.competitivePosition === 'AT' ? 'Alineada' :
                       'Premium'}
                    </span>
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendationsPanel;