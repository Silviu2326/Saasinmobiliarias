import React, { useState } from 'react';
import { useKPIs, useMultiSelect, useKPISummary, useKPITimeRanges } from './hooks';
import { KPIsToolbar } from './components/KPIsToolbar';
import { KPIsFilters } from './components/KPIsFilters';
import { KPIsTable } from './components/KPIsTable';
import { KPIDetailsDrawer } from './components/KPIDetailsDrawer';
import { KPISummaryCards } from './components/KPISummaryCards';
import type { KPIMetric } from './types';

const KPIsPage: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedKPIMetricId, setSelectedKPIMetricId] = useState<string | null>(null);
  
  const { metrics, loading, error, filter, updateFilter, refresh, summary } = useKPIs();
  const { selectedIds, selectedItems, isAllSelected, isIndeterminate, toggleAll, toggleItem, clearSelection } = useMultiSelect(metrics);
  const { timeRanges, selectedTimeRange, setSelectedTimeRange } = useKPITimeRanges();

  const handleKPISelect = (metric: KPIMetric) => {
    setSelectedKPIMetricId(metric.id);
  };

  const handleKPIClose = () => {
    setSelectedKPIMetricId(null);
  };

  const handleExport = async () => {
    try {
      // Simulate export functionality
      const csvContent = 'ID,Nombre,Categoría,Valor Actual,Objetivo,Estado,Tendencia\n';
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kpis-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting KPIs:', error);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedItems.length === 0) return;

    try {
      switch (action) {
        case 'refresh':
          // Simulate bulk refresh
          console.log('Refreshing KPIs:', selectedItems.map(item => item.id));
          break;
        case 'export':
          // Simulate bulk export
          console.log('Exporting KPIs:', selectedItems.map(item => item.id));
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
          <div className="text-red-500 text-xl mb-2">Error al cargar los KPIs</div>
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de KPIs</h1>
          <p className="mt-2 text-gray-600">
            Monitorea y analiza los indicadores clave de rendimiento de tu negocio
          </p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <KPISummaryCards summary={summary} />
        )}

        {/* Toolbar */}
        <KPIsToolbar
          selectedCount={selectedIds.size}
          totalCount={metrics.length}
          onNewKPI={() => console.log('New KPI')}
          onBulkAction={handleBulkAction}
          onExport={handleExport}
          onFiltersToggle={() => setShowFilters(!showFilters)}
          onRefresh={refresh}
          showFilters={showFilters}
          selectedTimeRange={selectedTimeRange}
          onTimeRangeChange={setSelectedTimeRange}
          timeRanges={timeRanges}
        />

        {/* Filters */}
        {showFilters && (
          <KPIsFilters
            filter={filter}
            onFilterChange={updateFilter}
            className="mb-6"
          />
        )}

        {/* Table */}
        <KPIsTable
          metrics={metrics}
          loading={loading}
          selectedIds={selectedIds}
          isAllSelected={isAllSelected}
          isIndeterminate={isIndeterminate}
          onToggleAll={toggleAll}
          onToggleItem={toggleItem}
          onKPISelect={handleKPISelect}
          onKPIEdit={(id) => console.log('Edit KPI:', id)}
          onKPIDelete={(id) => console.log('Delete KPI:', id)}
          onKPIView={(id) => console.log('View KPI:', id)}
        />
      </div>

      {/* Details Drawer */}
      {selectedKPIMetricId && (
        <KPIDetailsDrawer
          metricId={selectedKPIMetricId}
          onClose={handleKPIClose}
          onEdit={(id) => {
            console.log('Edit KPI:', id);
            handleKPIClose();
          }}
          onDelete={(id) => {
            console.log('Delete KPI:', id);
            handleKPIClose();
          }}
        />
      )}
    </div>
  );
};

export default KPIsPage;


