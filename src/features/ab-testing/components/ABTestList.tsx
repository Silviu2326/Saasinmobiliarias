import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  CheckCircle, 
  Edit3, 
  Trash2, 
  Eye,
  Crown,
  Calendar,
  TrendingUp,
  Filter
} from 'lucide-react';
import { ABTest } from '../services/abTestingService';

interface ABTestListProps {
  tests: ABTest[];
  onEdit: (test: ABTest) => void;
  onDelete: (testId: string) => void;
  onStart: (testId: string) => void;
  onPause: (testId: string) => void;
  onComplete: (testId: string) => void;
  onViewResults: (test: ABTest) => void;
}

type FilterStatus = 'all' | 'draft' | 'active' | 'paused' | 'completed';
type FilterWinner = 'all' | 'a' | 'b' | 'inconclusive';

export const ABTestList: React.FC<ABTestListProps> = ({
  tests,
  onEdit,
  onDelete,
  onStart,
  onPause,
  onComplete,
  onViewResults
}) => {
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [winnerFilter, setWinnerFilter] = useState<FilterWinner>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
  const [showConfirmComplete, setShowConfirmComplete] = useState<string | null>(null);

  const itemsPerPage = 5;

  const getStatusBadge = (status: ABTest['status']) => {
    const statusConfig = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Borrador' },
      active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Activo' },
      paused: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pausado' },
      completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Finalizado' }
    };

    const config = statusConfig[status];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getWinnerBadge = (test: ABTest) => {
    if (!test.winner || test.status !== 'completed') return null;

    const winnerVariant = test.variants.find(v => v.id === test.winner);
    if (!winnerVariant) return null;

    return (
      <div className="flex items-center gap-1">
        <Crown className="w-4 h-4 text-yellow-500" />
        <span className="text-sm font-medium text-yellow-700">
          {winnerVariant.name}
        </span>
        {test.significance && (
          <span className="text-xs text-gray-500">
            ({test.significance.toFixed(1)}% conf.)
          </span>
        )}
      </div>
    );
  };

  const getVariantPerformance = (test: ABTest) => {
    if (test.variants.length < 2) return null;

    const [variantA, variantB] = test.variants;
    const aRate = variantA.metrics.conversionRate;
    const bRate = variantB.metrics.conversionRate;

    if (aRate === 0 && bRate === 0) return null;

    const improvement = aRate > 0 ? ((bRate - aRate) / aRate) * 100 : 0;
    const isPositive = improvement > 0;

    return (
      <div className="flex items-center gap-2 text-sm">
        <TrendingUp className={`w-4 h-4 ${isPositive ? 'text-green-500' : 'text-red-500'}`} />
        <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
          {isPositive ? '+' : ''}{improvement.toFixed(1)}%
        </span>
      </div>
    );
  };

  const filteredTests = tests.filter(test => {
    if (statusFilter !== 'all' && test.status !== statusFilter) return false;
    
    if (winnerFilter !== 'all') {
      if (winnerFilter === 'inconclusive') {
        if (test.status === 'completed' && test.winner) return false;
      } else {
        if (!test.winner || test.winner !== winnerFilter) return false;
      }
    }
    
    return true;
  });

  const paginatedTests = filteredTests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredTests.length / itemsPerPage);

  const handleDelete = (testId: string) => {
    onDelete(testId);
    setShowConfirmDelete(null);
  };

  const handleComplete = (testId: string) => {
    onComplete(testId);
    setShowConfirmComplete(null);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium">Filtros:</span>
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
        >
          <option value="all">Todos los estados</option>
          <option value="draft">Borrador</option>
          <option value="active">Activo</option>
          <option value="paused">Pausado</option>
          <option value="completed">Finalizado</option>
        </select>

        <select
          value={winnerFilter}
          onChange={(e) => setWinnerFilter(e.target.value as FilterWinner)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
        >
          <option value="all">Todos los resultados</option>
          <option value="a">Ganador A</option>
          <option value="b">Ganador B</option>
          <option value="inconclusive">Sin resultado</option>
        </select>
      </div>

      {/* Tests List */}
      <div className="space-y-3">
        {paginatedTests.map((test, index) => (
          <motion.div
            key={test.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{test.name}</h3>
                  {getStatusBadge(test.status)}
                </div>
                <p className="text-gray-600 text-sm mb-2">{test.hypothesis}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {test.startDate ? new Date(test.startDate).toLocaleDateString() : 'Sin fecha'}
                    </span>
                  </div>
                  <span>•</span>
                  <span>{test.goal.description}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onViewResults(test)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Ver resultados"
                >
                  <Eye className="w-4 h-4" />
                </button>
                
                {test.status === 'draft' && (
                  <button
                    onClick={() => onEdit(test)}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}

                {test.status === 'draft' && (
                  <button
                    onClick={() => onStart(test.id)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Iniciar test"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                )}

                {test.status === 'active' && (
                  <>
                    <button
                      onClick={() => onPause(test.id)}
                      className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                      title="Pausar test"
                    >
                      <Pause className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowConfirmComplete(test.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Finalizar test"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  </>
                )}

                {test.status === 'paused' && (
                  <button
                    onClick={() => onStart(test.id)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Reanudar test"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                )}

                {(test.status === 'draft' || test.status === 'completed') && (
                  <button
                    onClick={() => setShowConfirmDelete(test.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Variants Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {test.variants.slice(0, 2).map((variant, idx) => (
                <div key={variant.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm">{variant.name}</h4>
                    <span className="text-xs text-gray-500">{variant.trafficPercentage}%</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{variant.description}</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-gray-500">Impresiones</div>
                      <div className="font-medium">{variant.metrics.impressions.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Clics</div>
                      <div className="font-medium">{variant.metrics.clicks.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Conv. %</div>
                      <div className="font-medium">{variant.metrics.conversionRate.toFixed(1)}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Results Summary */}
            <div className="flex justify-between items-center">
              {getWinnerBadge(test)}
              {getVariantPerformance(test)}
            </div>
          </motion.div>
        ))}

        {filteredTests.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-lg mb-2">No se encontraron tests</div>
            <div className="text-sm">Ajusta los filtros o crea un nuevo test A/B</div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPage === page
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {/* Confirm Delete Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full"
          >
            <h3 className="text-lg font-semibold mb-4">Confirmar eliminación</h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres eliminar este test? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmDelete(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(showConfirmDelete)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Confirm Complete Modal */}
      {showConfirmComplete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full"
          >
            <h3 className="text-lg font-semibold mb-4">Finalizar test</h3>
            <p className="text-gray-600 mb-6">
              ¿Quieres finalizar este test A/B? Se calculará el ganador basado en los datos actuales.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmComplete(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleComplete(showConfirmComplete)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Finalizar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};