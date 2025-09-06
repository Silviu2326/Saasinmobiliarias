import React, { useState, useCallback } from 'react';
import { Calculator, DollarSign } from 'lucide-react';
import { 
  SettlementsToolbar,
  SettlementsFilters, 
  SettlementsTable,
  SettlementDetails,
  SettlementWizard,
  AdjustmentDialog,
  PayoutDialog,
  ClosePeriodDialog,
  ExportDialog
} from './components';
import { useSettlements, useMultiSelect, useLocalStorage } from './hooks';
import { exportToCSV, exportToJSON } from './utils';
import type { Settlement, SettlementQuery } from './types';

export default function LiquidacionesPage() {
  // Estado principal
  const [showFilters, setShowFilters] = useLocalStorage('settlements-show-filters', true);
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);
  
  // Dialogs
  const [showWizard, setShowWizard] = useState(false);
  const [showAdjustmentDialog, setShowAdjustmentDialog] = useState(false);
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  const [showClosePeriodDialog, setShowClosePeriodDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  
  // Estados para dialogs
  const [adjustmentLineId, setAdjustmentLineId] = useState<string | null>(null);
  const [payoutData, setPayoutData] = useState<{ agentId: string; agentName: string; amount: number } | null>(null);

  // Hook principal de liquidaciones
  const { data, isLoading, error, query, fetchSettlements, refreshSettlements } = useSettlements({
    page: 1,
    size: 25
  });

  // Hook de selección múltiple
  const settlements = data?.items || [];
  const { 
    selectedItems, 
    selectItem, 
    selectAll, 
    isSelected, 
    isAllSelected, 
    isIndeterminate,
    clearSelection,
    selectedCount 
  } = useMultiSelect(settlements);

  // Handlers principales
  const handleFiltersChange = useCallback((newFilters: SettlementQuery) => {
    fetchSettlements(newFilters);
    clearSelection();
  }, [fetchSettlements, clearSelection]);

  const handleFiltersReset = useCallback(() => {
    fetchSettlements({ page: 1, size: query.size });
    clearSelection();
  }, [fetchSettlements, query.size, clearSelection]);

  const handlePageChange = useCallback((page: number) => {
    fetchSettlements({ ...query, page });
  }, [fetchSettlements, query]);

  const handleSort = useCallback((sort: string) => {
    fetchSettlements({ ...query, sort, page: 1 });
  }, [fetchSettlements, query]);

  // Handlers de toolbar
  const handleNewSettlement = useCallback(() => {
    setShowWizard(true);
  }, []);

  const handleExport = useCallback((format: 'csv' | 'json' | 'pdf') => {
    if (format === 'pdf') {
      setShowExportDialog(true);
      return;
    }

    const dataToExport = settlements.map(settlement => ({
      id: settlement.id,
      name: settlement.name,
      period: settlement.period,
      office: settlement.officeName || '',
      team: settlement.teamName || '',
      agent: settlement.agentName || '',
      origin: settlement.origin,
      status: settlement.status,
      linesCount: settlement.linesCount,
      gross: settlement.gross,
      withholdings: settlement.withholdings,
      net: settlement.net,
      createdAt: settlement.createdAt,
      createdBy: settlement.createdByName || ''
    }));

    if (format === 'csv') {
      exportToCSV(dataToExport, `liquidaciones-${new Date().toISOString().slice(0, 10)}`);
    } else {
      exportToJSON(dataToExport, `liquidaciones-${new Date().toISOString().slice(0, 10)}`);
    }
  }, [settlements]);

  const handleRecalculate = useCallback(() => {
    // TODO: Implementar recálculo de liquidaciones seleccionadas
    console.log('Recalcular liquidaciones:', Array.from(selectedItems));
  }, [selectedItems]);

  const handleClosePeriod = useCallback(() => {
    setShowClosePeriodDialog(true);
  }, []);

  // Handlers de tabla
  const handleRowClick = useCallback((settlement: Settlement) => {
    setSelectedSettlement(settlement);
  }, []);

  const handleView = useCallback((settlement: Settlement) => {
    setSelectedSettlement(settlement);
  }, []);

  const handleEdit = useCallback((settlement: Settlement) => {
    // TODO: Implementar edición de liquidación
    console.log('Editar liquidación:', settlement.id);
  }, []);

  const handleDelete = useCallback((settlement: Settlement) => {
    // TODO: Implementar eliminación con confirmación
    if (confirm(`¿Está seguro de que desea eliminar la liquidación "${settlement.name}"?`)) {
      console.log('Eliminar liquidación:', settlement.id);
      refreshSettlements();
    }
  }, [refreshSettlements]);

  const handleDuplicate = useCallback((settlement: Settlement) => {
    // TODO: Implementar duplicación de liquidación
    console.log('Duplicar liquidación:', settlement.id);
  }, []);

  // Handlers de detalles
  const handleAddAdjustment = useCallback((lineId: string) => {
    setAdjustmentLineId(lineId);
    setShowAdjustmentDialog(true);
  }, []);

  const handleGeneratePayouts = useCallback(() => {
    if (selectedSettlement) {
      // TODO: Lógica para generar pagos
      console.log('Generar pagos para liquidación:', selectedSettlement.id);
    }
  }, [selectedSettlement]);

  const handleExportPDF = useCallback(() => {
    if (selectedSettlement) {
      // TODO: Exportar liquidación a PDF
      console.log('Exportar PDF:', selectedSettlement.id);
    }
  }, [selectedSettlement]);

  // Handlers de dialogs
  const handleWizardComplete = useCallback((settlement: Settlement) => {
    setShowWizard(false);
    refreshSettlements();
    setSelectedSettlement(settlement);
  }, [refreshSettlements]);

  const handleApplyAdjustment = useCallback((adjustment: any) => {
    // TODO: Aplicar ajuste
    console.log('Aplicar ajuste:', adjustment);
    setShowAdjustmentDialog(false);
    setAdjustmentLineId(null);
    refreshSettlements();
  }, [refreshSettlements]);

  const handleGeneratePayout = useCallback((payout: any) => {
    // TODO: Generar pago
    console.log('Generar pago:', payout);
    setShowPayoutDialog(false);
    setPayoutData(null);
    refreshSettlements();
  }, [refreshSettlements]);

  const handleConfirmClosePeriod = useCallback((options: any) => {
    // TODO: Cerrar período
    console.log('Cerrar período:', options);
    setShowClosePeriodDialog(false);
    refreshSettlements();
  }, [refreshSettlements]);

  const handleExportWithOptions = useCallback((format: string, options: any) => {
    // TODO: Exportar con opciones avanzadas
    console.log('Exportar con opciones:', format, options);
    setShowExportDialog(false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calculator className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Liquidaciones
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Gestión completa de liquidaciones de comisiones
                  </p>
                </div>
              </div>
              
              {/* Stats rápidos */}
              <div className="hidden md:flex items-center gap-6 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{data?.total || 0}</div>
                  <div className="text-gray-600">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <div className="text-gray-600">Aprobadas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">0</div>
                  <div className="text-gray-600">Borradores</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error handling */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Toolbar */}
        <SettlementsToolbar
          onNewSettlement={handleNewSettlement}
          onExport={handleExport}
          onRecalculate={handleRecalculate}
          onClosePeriod={handleClosePeriod}
          onRefresh={refreshSettlements}
          selectedCount={selectedCount}
          totalCount={data?.total || 0}
          isLoading={isLoading}
          filters={query}
          onFiltersToggle={() => setShowFilters(!showFilters)}
          showFilters={showFilters}
        />

        {/* Filters */}
        {showFilters && (
          <div className="mb-6">
            <SettlementsFilters
              filters={query}
              onFiltersChange={handleFiltersChange}
              onReset={handleFiltersReset}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Layout principal */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className={`${selectedSettlement ? 'xl:col-span-3' : 'xl:col-span-4'}`}>
            <SettlementsTable
              settlements={settlements}
              isLoading={isLoading}
              total={data?.total || 0}
              page={data?.page || 1}
              totalPages={data?.totalPages || 1}
              pageSize={query.size || 25}
              onPageChange={handlePageChange}
              onSort={handleSort}
              sort={query.sort}
              selectedSettlements={selectedItems}
              onSelectSettlement={selectItem}
              onSelectAll={selectAll}
              onRowClick={handleRowClick}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
            />
          </div>

          {selectedSettlement && (
            <div className="xl:col-span-1">
              <div className="sticky top-6">
                <SettlementDetails
                  settlement={selectedSettlement}
                  isOpen={!!selectedSettlement}
                  onClose={() => setSelectedSettlement(null)}
                  onEdit={() => handleEdit(selectedSettlement)}
                  onAddAdjustment={handleAddAdjustment}
                  onGeneratePayouts={handleGeneratePayouts}
                  onExportPDF={handleExportPDF}
                  isLoading={isLoading}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <SettlementWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onComplete={handleWizardComplete}
      />

      <AdjustmentDialog
        isOpen={showAdjustmentDialog}
        onClose={() => {
          setShowAdjustmentDialog(false);
          setAdjustmentLineId(null);
        }}
        onApply={handleApplyAdjustment}
        lineId={adjustmentLineId || ''}
        currentAmount={0} // TODO: Get actual line amount
      />

      {payoutData && (
        <PayoutDialog
          isOpen={showPayoutDialog}
          onClose={() => {
            setShowPayoutDialog(false);
            setPayoutData(null);
          }}
          onGenerate={handleGeneratePayout}
          agentId={payoutData.agentId}
          agentName={payoutData.agentName}
          netAmount={payoutData.amount}
        />
      )}

      <ClosePeriodDialog
        isOpen={showClosePeriodDialog}
        onClose={() => setShowClosePeriodDialog(false)}
        onConfirm={handleConfirmClosePeriod}
        period={query.period || ''}
        affectedSettlements={0} // TODO: Calculate affected settlements
        totalAmount={0} // TODO: Calculate total amount
      />

      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        onExport={handleExportWithOptions}
        filters={query}
        totalRecords={data?.total || 0}
      />
    </div>
  );
}