import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Eye,
  EyeOff,
  Search,
  AlertTriangle
} from 'lucide-react';
import { TrendData } from '../services/radarService';

interface TrendGraphProps {
  trends: TrendData[];
  loading?: boolean;
  onRefresh?: () => void;
  onExport?: () => void;
}

export const TrendGraph: React.FC<TrendGraphProps> = ({
  trends,
  loading = false,
  onRefresh,
  onExport
}) => {
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(
    new Set(trends.map(t => t.keyword))
  );
  const [showRelatedQueries, setShowRelatedQueries] = useState(false);

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  const toggleKeyword = (keyword: string) => {
    const newSelection = new Set(selectedKeywords);
    if (newSelection.has(keyword)) {
      newSelection.delete(keyword);
    } else {
      newSelection.add(keyword);
    }
    setSelectedKeywords(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedKeywords.size === trends.length) {
      setSelectedKeywords(new Set());
    } else {
      setSelectedKeywords(new Set(trends.map(t => t.keyword)));
    }
  };

  const prepareChartData = () => {
    if (trends.length === 0) return [];

    const allDates = [...new Set(trends.flatMap(t => t.data.map(d => d.date)))].sort();
    
    return allDates.map(date => {
      const dataPoint: any = { date: new Date(date).toLocaleDateString('es-ES', { 
        month: 'short', 
        day: 'numeric' 
      }) };

      trends.forEach(trend => {
        const point = trend.data.find(d => d.date === date);
        dataPoint[trend.keyword] = point ? point.value : null;
      });

      return dataPoint;
    });
  };

  const getKeywordStats = (trend: TrendData) => {
    const avgValue = trend.data.reduce((sum, d) => sum + d.value, 0) / trend.data.length;
    const maxValue = Math.max(...trend.data.map(d => d.value));
    const minValue = Math.min(...trend.data.map(d => d.value));
    
    return { avgValue, maxValue, minValue };
  };

  const chartData = prepareChartData();
  const hasAlerts = trends.some(t => Math.abs(t.growthRate) > 15);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            <span className="text-gray-600">Cargando tendencias...</span>
          </div>
        </div>
      </div>
    );
  }

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
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Tendencias de Búsqueda</h3>
              <p className="text-sm text-gray-600">Evolución del interés de búsqueda</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasAlerts && (
              <div className="flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                <AlertTriangle className="w-4 h-4" />
                Picos detectados
              </div>
            )}
            
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Actualizar datos"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={onExport}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Exportar datos"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Keyword Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Palabras clave:</span>
              <button
                onClick={toggleSelectAll}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                {selectedKeywords.size === trends.length ? 'Deseleccionar todas' : 'Seleccionar todas'}
              </button>
            </div>
            
            <button
              onClick={() => setShowRelatedQueries(!showRelatedQueries)}
              className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-700"
            >
              {showRelatedQueries ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              Consultas relacionadas
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {trends.map((trend, index) => {
              const isSelected = selectedKeywords.has(trend.keyword);
              const stats = getKeywordStats(trend);
              
              return (
                <div
                  key={trend.keyword}
                  className={`
                    relative group cursor-pointer transition-all duration-200
                    ${isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
                  `}
                  onClick={() => toggleKeyword(trend.keyword)}
                >
                  <div className={`
                    px-3 py-2 rounded-lg border transition-colors
                    ${isSelected 
                      ? 'bg-blue-50 border-blue-200 text-blue-900' 
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }
                  `}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: colors[index % colors.length] }}
                      />
                      <span className="text-sm font-medium">{trend.keyword}</span>
                      <div className="flex items-center gap-1">
                        {trend.growthRate > 0 ? (
                          <TrendingUp className="w-3 h-3 text-green-500" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-red-500" />
                        )}
                        <span className={`text-xs ${
                          trend.growthRate > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {trend.growthRate > 0 ? '+' : ''}{trend.growthRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
                      <div>Búsquedas totales: {trend.totalSearches.toLocaleString()}</div>
                      <div>Promedio: {stats.avgValue.toFixed(1)}</div>
                      <div>Máximo: {stats.maxValue}</div>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        {selectedKeywords.size === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Search className="w-12 h-12 mb-4 text-gray-300" />
            <p className="text-lg font-medium">Selecciona al menos una palabra clave</p>
            <p className="text-sm">para ver las tendencias de búsqueda</p>
          </div>
        ) : (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                
                {/* Reference line for average */}
                {selectedKeywords.size === 1 && trends.length > 0 && (
                  <ReferenceLine 
                    y={getKeywordStats(trends.find(t => selectedKeywords.has(t.keyword))!).avgValue}
                    stroke="#9ca3af"
                    strokeDasharray="5 5"
                    label="Promedio"
                  />
                )}

                {trends
                  .filter(trend => selectedKeywords.has(trend.keyword))
                  .map((trend, index) => (
                    <Line
                      key={trend.keyword}
                      type="monotone"
                      dataKey={trend.keyword}
                      stroke={colors[trends.indexOf(trend) % colors.length]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Related Queries */}
      {showRelatedQueries && selectedKeywords.size > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-gray-200 p-6"
        >
          <h4 className="text-sm font-medium text-gray-900 mb-3">Consultas Relacionadas</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trends
              .filter(trend => selectedKeywords.has(trend.keyword))
              .map(trend => (
                <div key={trend.keyword} className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-700">{trend.keyword}</h5>
                  <div className="space-y-1">
                    {trend.data[0]?.relatedQueries?.slice(0, 3).map((query, index) => (
                      <div key={index} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                        {query}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};