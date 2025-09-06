import React, { useState, useCallback } from 'react';
import { FileText, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import {
  InvoicesToolbar,
  InvoicesTable,
  InvoicesFilters,
  InvoiceDetailsDrawer
} from './components';
import { useInvoices, useMultiSelect } from './hooks';
import { formatCurrency } from './utils';
import type { Invoice, InvoiceQuery } from './types';

export default function FacturasPage() {
  // Estado principal
  const [showFilters, setShowFilters] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);

  // Datos de facturas
  const {
    data,
    invoices,
    isLoading,
    error,
    query,
    refreshInvoices,
    updateQuery,
    totalAmounts
  } = useInvoices({
    page: 1,
    size: 25,
    sort: 'date:desc'
  });

  // Selección múltiple
  const {
    selectedItems,
    selectedCount,
    selectItem,
    selectAll,
    clearSelection,
    isSelected
  } = useMultiSelect<Invoice>();

  // Calcular totales de selección
  const selectedTotal = React.useMemo(() => {
    if (selectedItems.size === 0) return undefined;
    
    return invoices
      .filter(invoice => selectedItems.has(invoice.id))
      .reduce(
        (acc, invoice) => ({
          base: acc.base + invoice.base,
          iva: acc.iva + invoice.ivaTotal,
          total: acc.total + invoice.total
        }),
        { base: 0, iva: 0, total: 0 }
      );
  }, [invoices, selectedItems]);

  // Handlers de navegación y filtros
  const handlePageChange = useCallback((page: number) => {
    updateQuery({ ...query, page });
  }, [query, updateQuery]);

  const handleSort = useCallback((sort: string) => {
    updateQuery({ ...query, sort, page: 1 });
  }, [query, updateQuery]);

  const handleFiltersChange = useCallback((newQuery: InvoiceQuery) => {
    updateQuery(newQuery);
    clearSelection();
  }, [updateQuery, clearSelection]);

  const handleFiltersReset = useCallback(() => {
    updateQuery({ page: 1, size: query.size, sort: query.sort });
    clearSelection();
  }, [query.size, query.sort, updateQuery, clearSelection]);

  // Handlers de acciones principales
  const handleNewInvoice = useCallback(() => {
    // TODO: Abrir formulario de nueva factura
    console.log('Nueva factura');
  }, []);

  const handleSendSelected = useCallback(() => {
    if (selectedItems.size === 0) return;
    // TODO: Enviar facturas seleccionadas
    console.log('Enviar facturas:', Array.from(selectedItems));
  }, [selectedItems]);

  const handleExport = useCallback(() => {
    // TODO: Abrir diálogo de exportación
    console.log('Exportar facturas');
  }, []);

  const handleImport = useCallback(() => {
    // TODO: Abrir diálogo de importación
    console.log('Importar facturas');
  }, []);

  const handleCreditNote = useCallback(() => {
    if (selectedItems.size !== 1) return;
    const invoiceId = Array.from(selectedItems)[0];
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      // TODO: Abrir diálogo de abono
      console.log('Crear abono para:', invoice.number);
    }
  }, [selectedItems, invoices]);

  const handleScheduleRecurring = useCallback(() => {
    if (selectedItems.size !== 1) return;
    const invoiceId = Array.from(selectedItems)[0];
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      // TODO: Abrir diálogo de recurrencia
      console.log('Programar recurrente:', invoice.number);
    }
  }, [selectedItems, invoices]);

  // Handlers de tabla
  const handleRowClick = useCallback((invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailsDrawer(true);
  }, []);

  const handleView = useCallback((invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailsDrawer(true);
  }, []);

  const handleEdit = useCallback((invoice: Invoice) => {
    // TODO: Abrir formulario de edición
    console.log('Editar factura:', invoice.id);
  }, []);

  const handleSend = useCallback((invoice: Invoice) => {
    // TODO: Enviar factura individual
    console.log('Enviar factura:', invoice.id);
  }, []);

  const handlePayment = useCallback((invoice: Invoice) => {
    // TODO: Abrir panel de pagos
    console.log('Registrar pago:', invoice.id);
  }, []);

  const handleCreditNoteFromTable = useCallback((invoice: Invoice) => {
    // TODO: Crear abono
    console.log('Crear abono:', invoice.id);
  }, []);

  const handleCancel = useCallback((invoice: Invoice) => {
    // TODO: Anular factura con confirmación
    if (confirm(`¿Está seguro de que desea anular la factura ${invoice.number}?`)) {
      console.log('Anular factura:', invoice.id);
      refreshInvoices();
    }
  }, [refreshInvoices]);

  const handleDuplicate = useCallback((invoice: Invoice) => {
    // TODO: Duplicar factura
    console.log('Duplicar factura:', invoice.id);
  }, []);

  // Handlers del drawer de detalles
  const handleCloseDetailsDrawer = useCallback(() => {
    setShowDetailsDrawer(false);
    setSelectedInvoice(null);
  }, []);

  const handleEditFromDrawer = useCallback((invoice: Invoice) => {
    handleEdit(invoice);
    setShowDetailsDrawer(false);
  }, [handleEdit]);

  const handleSendFromDrawer = useCallback((invoice: Invoice) => {
    handleSend(invoice);
  }, [handleSend]);

  const handlePaymentFromDrawer = useCallback((invoice: Invoice) => {
    handlePayment(invoice);
  }, [handlePayment]);

  const handleCreditNoteFromDrawer = useCallback((invoice: Invoice) => {
    handleCreditNoteFromTable(invoice);
  }, [handleCreditNoteFromTable]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Facturas
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Gestión completa de facturación
                  </p>
                </div>
              </div>
              
              {/* Resumen de importes */}
              <div className="hidden md:flex items-center gap-8 text-sm">
                <div className="text-center">
                  <div className="flex items-center gap-2 text-blue-600">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(totalAmounts?.total || 0)}
                    </span>
                  </div>
                  <div className="text-gray-600">Emitido</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-2 text-green-600">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(totalAmounts?.paid || 0)}
                    </span>
                  </div>
                  <div className="text-gray-600">Cobrado</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-2 text-orange-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(totalAmounts?.pending || 0)}
                    </span>
                  </div>
                  <div className="text-gray-600">Pendiente</div>
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
        <InvoicesToolbar
          onNewInvoice={handleNewInvoice}
          onSend={handleSendSelected}
          onExport={handleExport}
          onImport={handleImport}
          onCreditNote={handleCreditNote}
          onScheduleRecurring={handleScheduleRecurring}
          onRefresh={refreshInvoices}
          selectedCount={selectedCount}
          totalCount={data?.total || 0}
          selectedTotal={selectedTotal}
          isLoading={isLoading}
          filters={query}
          onFiltersToggle={() => setShowFilters(!showFilters)}
          showFilters={showFilters}
        />

        {/* Filtros */}
        {showFilters && (
          <InvoicesFilters
            filters={query}
            onFiltersChange={handleFiltersChange}
            onReset={handleFiltersReset}
            isLoading={isLoading}
          />
        )}

        {/* Tabla principal */}
        <InvoicesTable
          invoices={invoices}
          isLoading={isLoading}
          total={data?.total || 0}
          page={data?.page || 1}
          totalPages={data?.totalPages || 1}
          pageSize={query.size || 25}
          onPageChange={handlePageChange}
          onSort={handleSort}
          sort={query.sort}
          selectedInvoices={selectedItems}
          onSelectInvoice={selectItem}
          onSelectAll={() => selectAll(invoices)}
          onRowClick={handleRowClick}
          onView={handleView}
          onEdit={handleEdit}
          onSend={handleSend}
          onPayment={handlePayment}
          onCreditNote={handleCreditNoteFromTable}
          onCancel={handleCancel}
          onDuplicate={handleDuplicate}
          totalAmounts={totalAmounts}
        />
      </div>

      {/* Drawer de detalles */}
      <InvoiceDetailsDrawer
        invoice={selectedInvoice}
        isOpen={showDetailsDrawer}
        onClose={handleCloseDetailsDrawer}
        onEdit={handleEditFromDrawer}
        onSend={handleSendFromDrawer}
        onPayment={handlePaymentFromDrawer}
        onCreditNote={handleCreditNoteFromDrawer}
        isLoading={isLoading}
      />
    </div>
  );
}