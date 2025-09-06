import React, { useState } from 'react';
import { useForecasts, useMultiSelect, useForecastSummary } from './hooks';
import { ForecastsToolbar } from './components/ForecastsToolbar';
import { ForecastsFilters } from './components/ForecastsFilters';
import { ForecastsTable } from './components/ForecastsTable';
import { ForecastDetailsDrawer } from './components/ForecastDetailsDrawer';
import type { ForecastItem } from './types';

const ForecastsPage: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedForecastId, setSelectedForecastId] = useState<string | null>(null);
  
  const { data, loading, error, query, updateQuery, goToPage, refresh } = useForecasts();
  const { selectedIds, selectedItems, isAllSelected, isIndeterminate, toggleAll, toggleItem, clearSelection } = useMultiSelect(data.items);
  const { summary } = useForecastSummary(query.periodId);

  const handleForecastSelect = (forecast: ForecastItem) => {
    setSelectedForecastId(forecast.id);
  };

  const handleForecastClose = () => {
    setSelectedForecastId(null);
  };

  const handleExport = async () => {
    try {
      // Simulate export functionality
      const csvContent = 'ID,Nombre,Tipo,Monto,Probabilidad,Estado\n';
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `forecasts-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting forecasts:', error);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedItems.length === 0) return;

    try {
      switch (action) {
        case 'approve':
          // Simulate bulk approve
          console.log('Approving forecasts:', selectedItems.map(item => item.id));
          break;
        case 'delete':
          // Simulate bulk delete
          console.log('Deleting forecasts:', selectedItems.map(item => item.id));
          break;
        default:
          break;
      }
      
      clearSelection();
      refresh();
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">Error al cargar los forecasts</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Forecast Financiero</h1>
          <p className="mt-2 text-gray-600">
            Gestiona y analiza las proyecciones financieras de tu negocio
          </p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {new Intl.NumberFormat('es-ES', {
                      style: 'currency',
                      currency: summary.currency,
                      minimumFractionDigits: 0
                    }).format(summary.totalIncome)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Gastos Totales</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {new Intl.NumberFormat('es-ES', {
                      style: 'currency',
                      currency: summary.currency,
                      minimumFractionDigits: 0
                    }).format(summary.totalExpenses)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Resultado Neto</p>
                  <p className={`text-2xl font-semibold ${summary.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {new Intl.NumberFormat('es-ES', {
                      style: 'currency',
                      currency: summary.currency,
                      minimumFractionDigits: 0
                    }).format(summary.netAmount)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Probabilidad Media</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {summary.averageProbability.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <ForecastsToolbar
          selectedCount={selectedIds.size}
          totalCount={data.total}
          onNewForecast={() => console.log('New forecast')}
          onBulkAction={handleBulkAction}
          onExport={handleExport}
          onFiltersToggle={() => setShowFilters(!showFilters)}
          onRefresh={refresh}
          showFilters={showFilters}
        />

        {/* Filters */}
        {showFilters && (
          <ForecastsFilters
            query={query}
            onQueryChange={updateQuery}
            className="mb-6"
          />
        )}

        {/* Table */}
        <ForecastsTable
          forecasts={data.items}
          loading={loading}
          selectedIds={selectedIds}
          isAllSelected={isAllSelected}
          isIndeterminate={isIndeterminate}
          onToggleAll={toggleAll}
          onToggleItem={toggleItem}
          onForecastSelect={handleForecastSelect}
          onForecastEdit={(id) => console.log('Edit forecast:', id)}
          onForecastDelete={(id) => console.log('Delete forecast:', id)}
          onForecastApprove={(id) => console.log('Approve forecast:', id)}
          onForecastReject={(id) => console.log('Reject forecast:', id)}
        />

        {/* Pagination */}
        {data.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando {((data.page - 1) * data.limit) + 1} a {Math.min(data.page * data.limit, data.total)} de {data.total} resultados
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => goToPage(data.page - 1)}
                disabled={data.page <= 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md">
                Página {data.page} de {data.totalPages}
              </span>
              <button
                onClick={() => goToPage(data.page + 1)}
                disabled={data.page >= data.totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Drawer */}
      {selectedForecastId && (
        <ForecastDetailsDrawer
          forecastId={selectedForecastId}
          onClose={handleForecastClose}
          onEdit={(id) => {
            console.log('Edit forecast:', id);
            handleForecastClose();
          }}
          onDelete={(id) => {
            console.log('Delete forecast:', id);
            handleForecastClose();
          }}
        />
      )}
    </div>
  );
};

export default ForecastsPage;


