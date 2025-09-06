import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Plus,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  RefreshCw,
  Target,
  Activity
} from 'lucide-react';
import { TrendData } from '../services/radarService';

interface KeywordTrackerProps {
  trends: TrendData[];
  keywords: string[];
  loading?: boolean;
  onAddKeyword?: (keyword: string) => void;
  onRemoveKeyword?: (keyword: string) => void;
  onRefresh?: () => void;
}

export const KeywordTracker: React.FC<KeywordTrackerProps> = ({
  trends,
  keywords,
  loading = false,
  onAddKeyword,
  onRemoveKeyword,
  onRefresh
}) => {
  const [newKeyword, setNewKeyword] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      onAddKeyword?.(newKeyword.trim());
      setNewKeyword('');
      setShowAddForm(false);
    }
  };

  const getKeywordScore = (keyword: string): number => {
    const trend = trends.find(t => t.keyword === keyword);
    if (!trend) return 0;
    
    const avgValue = trend.data.reduce((sum, d) => sum + d.value, 0) / trend.data.length;
    const growthWeight = Math.abs(trend.growthRate) > 10 ? 1.5 : 1;
    
    return Math.round(avgValue * growthWeight);
  };

  const getKeywordStatus = (keyword: string) => {
    const trend = trends.find(t => t.keyword === keyword);
    if (!trend) return { status: 'unknown', color: 'gray' };

    const growthRate = trend.growthRate;
    
    if (growthRate > 15) {
      return { status: 'hot', color: 'red', label: 'En auge' };
    } else if (growthRate > 5) {
      return { status: 'trending', color: 'orange', label: 'Creciendo' };
    } else if (growthRate > -5) {
      return { status: 'stable', color: 'green', label: 'Estable' };
    } else {
      return { status: 'declining', color: 'blue', label: 'Declinando' };
    }
  };

  const sortedKeywords = [...keywords].sort((a, b) => {
    const scoreA = getKeywordScore(a);
    const scoreB = getKeywordScore(b);
    return scoreB - scoreA;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 shadow-sm"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Monitor de Palabras Clave</h3>
              <p className="text-sm text-gray-600">Seguimiento de {keywords.length} términos</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Agregar
            </button>
            
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Actualizar datos"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Add Keyword Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                  placeholder="ej. apartamentos barcelona"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <button
                onClick={handleAddKeyword}
                disabled={!newKeyword.trim()}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Agregar
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewKeyword('');
                }}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Keywords List */}
      <div className="p-6">
        {loading && keywords.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
              <span className="text-gray-600">Cargando palabras clave...</span>
            </div>
          </div>
        ) : keywords.length === 0 ? (
          <div className="text-center py-8">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No hay palabras clave configuradas</p>
            <p className="text-sm text-gray-400">Agrega términos para comenzar el monitoreo</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedKeywords.map((keyword, index) => {
              const trend = trends.find(t => t.keyword === keyword);
              const status = getKeywordStatus(keyword);
              const score = getKeywordScore(keyword);
              
              return (
                <motion.div
                  key={keyword}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {/* Ranking */}
                    <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full text-sm font-semibold text-gray-700 border-2 border-gray-200">
                      #{index + 1}
                    </div>

                    {/* Keyword Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-medium text-gray-900">{keyword}</h4>
                        
                        {/* Status Badge */}
                        <span className={`
                          px-2 py-1 text-xs font-medium rounded-full
                          ${status.color === 'red' ? 'bg-red-100 text-red-700' :
                            status.color === 'orange' ? 'bg-orange-100 text-orange-700' :
                            status.color === 'green' ? 'bg-green-100 text-green-700' :
                            'bg-blue-100 text-blue-700'
                          }
                        `}>
                          {status.label}
                        </span>

                        {/* Alert for high growth */}
                        {trend && Math.abs(trend.growthRate) > 15 && (
                          <div className="flex items-center gap-1 text-amber-600">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-xs font-medium">Pico detectado</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {/* Growth Rate */}
                        {trend && (
                          <div className="flex items-center gap-1">
                            {trend.growthRate > 0 ? (
                              <TrendingUp className="w-4 h-4 text-green-500" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-500" />
                            )}
                            <span className={trend.growthRate > 0 ? 'text-green-600' : 'text-red-600'}>
                              {trend.growthRate > 0 ? '+' : ''}{trend.growthRate.toFixed(1)}%
                            </span>
                          </div>
                        )}

                        {/* Total Searches */}
                        {trend && (
                          <div className="flex items-center gap-1">
                            <Activity className="w-4 h-4" />
                            <span>{trend.totalSearches.toLocaleString()} búsquedas</span>
                          </div>
                        )}

                        {/* Score */}
                        <div className="flex items-center gap-1">
                          <span>Puntuación:</span>
                          <span className="font-medium">{score}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {/* Performance Indicator */}
                    <div className="flex items-center">
                      <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            score > 80 ? 'bg-green-500' :
                            score > 60 ? 'bg-yellow-500' :
                            score > 40 ? 'bg-orange-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(score, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => onRemoveKeyword?.(keyword)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition-all"
                      title="Eliminar palabra clave"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {keywords.length > 0 && (
        <div className="border-t border-gray-200 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {trends.filter(t => t.growthRate > 5).length}
              </div>
              <div className="text-sm text-gray-600">Creciendo</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {trends.filter(t => Math.abs(t.growthRate) > 15).length}
              </div>
              <div className="text-sm text-gray-600">Alertas</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {trends.reduce((sum, t) => sum + t.totalSearches, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Búsquedas Total</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {(trends.reduce((sum, t) => sum + t.growthRate, 0) / trends.length).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Crecimiento Promedio</div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};