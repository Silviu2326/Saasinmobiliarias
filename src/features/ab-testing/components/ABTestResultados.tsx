import React from 'react';
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
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  ArrowLeft,
  Crown,
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointer,
  Target,
  Calendar,
  Users
} from 'lucide-react';
import { ABTest } from '../services/abTestingService';

interface ABTestResultadosProps {
  test: ABTest;
  onBack: () => void;
}

export const ABTestResultados: React.FC<ABTestResultadosProps> = ({ test, onBack }) => {
  const getWinnerVariant = () => {
    if (!test.winner) return null;
    return test.variants.find(v => v.id === test.winner);
  };

  const getVariantColor = (index: number) => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    return colors[index % colors.length];
  };

  const calculateImprovement = () => {
    if (test.variants.length < 2) return null;
    
    const [variantA, variantB] = test.variants;
    const aRate = variantA.metrics.conversionRate;
    const bRate = variantB.metrics.conversionRate;
    
    if (aRate === 0) return null;
    
    const improvement = ((bRate - aRate) / aRate) * 100;
    return {
      percentage: improvement,
      isPositive: improvement > 0,
      winner: improvement > 0 ? variantB : variantA,
      loser: improvement > 0 ? variantA : variantB
    };
  };

  const getStatisticalSignificance = () => {
    if (!test.significance) return null;
    
    let level = 'Baja';
    let color = 'text-red-600';
    let bgColor = 'bg-red-50';
    
    if (test.significance >= 95) {
      level = 'Alta';
      color = 'text-green-600';
      bgColor = 'bg-green-50';
    } else if (test.significance >= 90) {
      level = 'Media';
      color = 'text-yellow-600';
      bgColor = 'bg-yellow-50';
    }
    
    return { level, color, bgColor, value: test.significance };
  };

  const prepareTimelineData = () => {
    if (!test.results || test.results.length === 0) return [];
    
    return test.results.map(result => ({
      date: new Date(result.date).toLocaleDateString('es-ES', { 
        month: 'short', 
        day: 'numeric' 
      }),
      'Variante A': result.variantA.conversions,
      'Variante B': result.variantB.conversions,
      'CTR A': (result.variantA.clicks / result.variantA.impressions * 100).toFixed(1),
      'CTR B': (result.variantB.clicks / result.variantB.impressions * 100).toFixed(1)
    }));
  };

  const prepareMetricsData = () => {
    return test.variants.map(variant => ({
      name: variant.name,
      impressions: variant.metrics.impressions,
      clicks: variant.metrics.clicks,
      conversions: variant.metrics.conversions,
      ctr: variant.metrics.ctr,
      conversionRate: variant.metrics.conversionRate
    }));
  };

  const preparePieData = () => {
    return test.variants.map(variant => ({
      name: variant.name,
      value: variant.metrics.conversions,
      percentage: variant.trafficPercentage
    }));
  };

  const improvement = calculateImprovement();
  const significance = getStatisticalSignificance();
  const winner = getWinnerVariant();
  const timelineData = prepareTimelineData();
  const metricsData = prepareMetricsData();
  const pieData = preparePieData();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{test.name}</h2>
          <p className="text-gray-600">{test.hypothesis}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">Duración</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {test.startDate && test.endDate ? (
              Math.ceil(
                (new Date(test.endDate).getTime() - new Date(test.startDate).getTime()) / 
                (1000 * 60 * 60 * 24)
              )
            ) : (
              test.startDate ? (
                Math.ceil(
                  (new Date().getTime() - new Date(test.startDate).getTime()) / 
                  (1000 * 60 * 60 * 24)
                )
              ) : 0
            )} días
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-gray-700">Participantes</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {test.variants.reduce((sum, v) => sum + v.metrics.impressions, 0).toLocaleString()}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium text-gray-700">Conversiones</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {test.variants.reduce((sum, v) => sum + v.metrics.conversions, 0)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700">Mejora</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {improvement ? (
              <span className={improvement.isPositive ? 'text-green-600' : 'text-red-600'}>
                {improvement.isPositive ? '+' : ''}{improvement.percentage.toFixed(1)}%
              </span>
            ) : (
              'N/A'
            )}
          </div>
        </div>
      </div>

      {/* Winner Section */}
      {winner && significance && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <Crown className="w-6 h-6 text-yellow-600" />
            <h3 className="text-xl font-bold text-yellow-800">Variante Ganadora</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-yellow-800 mb-2">{winner.name}</h4>
              <p className="text-yellow-700 text-sm mb-4">{winner.description}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-yellow-600">Tasa de Conversión</div>
                  <div className="text-2xl font-bold text-yellow-800">
                    {winner.metrics.conversionRate.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-yellow-600">CTR</div>
                  <div className="text-2xl font-bold text-yellow-800">
                    {winner.metrics.ctr.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <div className={`p-4 rounded-lg ${significance.bgColor}`}>
                <div className="text-sm font-medium text-gray-700 mb-1">
                  Significancia Estadística
                </div>
                <div className={`text-3xl font-bold ${significance.color}`}>
                  {significance.value.toFixed(1)}%
                </div>
                <div className={`text-sm ${significance.color}`}>
                  Confianza {significance.level}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Performance Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Comparación de Variantes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metricsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="conversions" fill="#3B82F6" name="Conversiones" />
              <Bar dataKey="clicks" fill="#10B981" name="Clics" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Distribución de Conversiones</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} (${percentage}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getVariantColor(index)} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Timeline Chart */}
      {timelineData.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Evolución Temporal</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="Variante A"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="Variante B"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Detailed Metrics */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Métricas Detalladas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tráfico
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Impresiones
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clics
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CTR
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversiones
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tasa Conv.
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {test.variants.map((variant, index) => (
                <motion.tr
                  key={variant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`hover:bg-gray-50 ${variant.id === test.winner ? 'bg-yellow-50' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {variant.id === test.winner && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {variant.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {variant.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {variant.trafficPercentage}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {variant.metrics.impressions.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {variant.metrics.clicks.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {variant.metrics.ctr.toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {variant.metrics.conversions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900">
                        {variant.metrics.conversionRate.toFixed(2)}%
                      </span>
                      {improvement && variant.id === improvement.winner.id && (
                        <div className="flex items-center gap-1">
                          {improvement.isPositive ? (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          )}
                          <span className={`text-xs ${improvement.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {improvement.isPositive ? '+' : ''}{Math.abs(improvement.percentage).toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};