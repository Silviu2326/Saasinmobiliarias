import React, { useState } from 'react';
import type { BatchResult, AnalysisFilters } from '../types';
import { PhotoQualityScore } from './PhotoQualityMeter';
import { PhotoIssuesCompact } from './PhotoIssuesList';
import { truncateFilename, calculateBatchStats, exportBatchToCsv, downloadCsv, formatPercentage } from '../utils';

interface PhotoBatchTableProps {
  results: BatchResult[];
  loading?: boolean;
  onResultClick?: (result: BatchResult) => void;
  onRetryFailed?: (result: BatchResult) => void;
}

export default function PhotoBatchTable({
  results,
  loading = false,
  onResultClick,
  onRetryFailed
}: PhotoBatchTableProps) {
  const [filters, setFilters] = useState<AnalysisFilters>({
    sortBy: 'score',
    sortOrder: 'desc'
  });
  const [selectedResults, setSelectedResults] = useState<Set<string>>(new Set());

  const stats = calculateBatchStats(results);

  // Filter and sort results
  const filteredResults = results
    .filter(result => {
      if (result.status === 'error') return true;
      
      const analysis = result.analysis;
      
      if (filters.minScore && analysis.score < filters.minScore) return false;
      if (filters.maxScore && analysis.score > filters.maxScore) return false;
      if (filters.hasIssues !== undefined) {
        const hasIssues = analysis.issues.length > 0;
        if (filters.hasIssues !== hasIssues) return false;
      }
      if (filters.roomType && filters.roomType !== 'all' && analysis.roomType !== filters.roomType) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      if (!filters.sortBy) return 0;
      
      let aValue: any, bValue: any;
      
      switch (filters.sortBy) {
        case 'filename':
          aValue = a.filename;
          bValue = b.filename;
          break;
        case 'score':
          aValue = a.status === 'error' ? -1 : a.analysis.score;
          bValue = b.status === 'error' ? -1 : b.analysis.score;
          break;
        case 'createdAt':
          aValue = a.status === 'error' ? 0 : new Date(a.analysis.createdAt).getTime();
          bValue = b.status === 'error' ? 0 : new Date(b.analysis.createdAt).getTime();
          break;
        default:
          return 0;
      }
      
      const order = filters.sortOrder === 'asc' ? 1 : -1;
      if (aValue < bValue) return -order;
      if (aValue > bValue) return order;
      return 0;
    });

  const handleSelectToggle = (id: string) => {
    setSelectedResults(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedResults.size === filteredResults.length) {
      setSelectedResults(new Set());
    } else {
      setSelectedResults(new Set(filteredResults.map(r => r.id)));
    }
  };

  const handleExportSelected = () => {
    const selectedData = results.filter(r => selectedResults.has(r.id));
    if (selectedData.length === 0) {
      alert('Selecciona al menos un resultado para exportar');
      return;
    }
    
    const csvContent = exportBatchToCsv(selectedData);
    const filename = `photo-analysis-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCsv(csvContent, filename);
  };

  const handleExportAll = () => {
    if (results.length === 0) return;
    
    const csvContent = exportBatchToCsv(results);
    const filename = `photo-analysis-batch-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCsv(csvContent, filename);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="text-4xl mb-4">📊</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Sin resultados de análisis por lotes
        </h3>
        <p className="text-gray-600">
          Los resultados aparecerán aquí después de procesar múltiples imágenes
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{stats.totalFiles}</div>
          <div className="text-sm text-gray-600">Total archivos</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sm text-gray-600">Completados</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{stats.averageScore}</div>
          <div className="text-sm text-gray-600">Score promedio</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-orange-600">{stats.totalIssues}</div>
          <div className="text-sm text-gray-600">Issues totales</div>
        </div>
      </div>

      {/* Quality Distribution */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3">Distribución de calidad</h4>
        <div className="flex space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
            <span className="text-sm">Ideal: {stats.qualityDistribution.ideal} ({formatPercentage(stats.qualityDistribution.ideal, stats.completed)})</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
            <span className="text-sm">Aceptable: {stats.qualityDistribution.aceptable} ({formatPercentage(stats.qualityDistribution.aceptable, stats.completed)})</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
            <span className="text-sm">Pobre: {stats.qualityDistribution.pobre} ({formatPercentage(stats.qualityDistribution.pobre, stats.completed)})</span>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={filters.sortBy || 'score'}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="score">Ordenar por score</option>
              <option value="filename">Ordenar por nombre</option>
              <option value="createdAt">Ordenar por fecha</option>
            </select>
            
            <select
              value={filters.sortOrder || 'desc'}
              onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value as any }))}
              className="px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="desc">Descendente</option>
              <option value="asc">Ascendente</option>
            </select>

            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Score mín:</label>
              <input
                type="number"
                min="0"
                max="100"
                value={filters.minScore || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, minScore: e.target.value ? Number(e.target.value) : undefined }))}
                className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {selectedResults.size > 0 && (
              <button
                onClick={handleExportSelected}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Exportar seleccionados ({selectedResults.size})
              </button>
            )}
            <button
              onClick={handleExportAll}
              className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Exportar todos
            </button>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedResults.size === filteredResults.length && filteredResults.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Archivo</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Score</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Issues</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Estado</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredResults.map((result) => (
                <tr key={result.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedResults.has(result.id)}
                      onChange={() => handleSelectToggle(result.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">
                      {truncateFilename(result.filename)}
                    </div>
                    {result.status === 'completed' && result.analysis.roomType && (
                      <div className="text-xs text-gray-500 capitalize">
                        {result.analysis.roomType}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {result.status === 'completed' ? (
                      <PhotoQualityScore score={result.analysis.score} showBand />
                    ) : result.status === 'error' ? (
                      <span className="text-sm text-red-600">Error</span>
                    ) : (
                      <span className="text-sm text-gray-500">Procesando...</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {result.status === 'completed' ? (
                      <PhotoIssuesCompact issues={result.analysis.issues} />
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      result.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : result.status === 'error'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {result.status === 'completed' ? 'Completado' : 
                       result.status === 'error' ? 'Error' : 'Procesando'}
                    </span>
                    {result.error && (
                      <div className="text-xs text-red-600 mt-1">{result.error}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      {result.status === 'completed' && onResultClick && (
                        <button
                          onClick={() => onResultClick(result)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Ver
                        </button>
                      )}
                      {result.status === 'error' && onRetryFailed && (
                        <button
                          onClick={() => onRetryFailed(result)}
                          className="text-orange-600 hover:text-orange-800 text-sm"
                        >
                          Reintentar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredResults.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-2">🔍</div>
            <p>No hay resultados que coincidan con los filtros actuales</p>
          </div>
        )}
      </div>
    </div>
  );
}