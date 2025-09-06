import React, { useState, useCallback, useEffect } from 'react';
import { FileText, DollarSign, TrendingUp, AlertCircle, Plus, Download, Upload } from 'lucide-react';
import {
  ExpensesToolbar,
  ExpensesTable,
  ExpensesFilters,
  ExpenseDetailsDrawer
} from './components';
import { useExpenses, useMultiSelect } from './hooks';
import { formatCurrency } from './utils';
import type { Expense, ExpenseQuery } from './types';

export default function GastosPage() {
  // Estado principal
  const [showFilters, setShowFilters] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);

  // Datos de gastos
  const {
    data,
    expenses,
    isLoading,
    error,
    query,
    refreshExpenses,
    updateQuery,
    totalAmounts
  } = useExpenses({
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
  } = useMultiSelect<Expense>();

  // Calcular totales de selección
  const selectedTotal = React.useMemo(() => {
    if (selectedItems.size === 0) return undefined;
    
    return expenses
      .filter(expense => selectedItems.has(expense.id))
      .reduce(
        (acc, expense) => ({
          base: acc.base + expense.base,
          iva: acc.iva + expense.ivaTotal,
          total: acc.total + expense.total,
          paid: acc.paid + expense.paid,
          balance: acc.balance + expense.balance
        }),
        { base: 0, iva: 0, total: 0, paid: 0, balance: 0 }
      );
  }, [expenses, selectedItems]);

  // Handlers de navegación y filtros
  const handlePageChange = useCallback((page: number) => {
    updateQuery({ ...query, page });
  }, [query, updateQuery]);

  const handleSort = useCallback((sort: string) => {
    updateQuery({ ...query, sort, page: 1 });
  }, [query, updateQuery]);

  const handleFiltersChange = useCallback((newQuery: ExpenseQuery) => {
    updateQuery(newQuery);
    clearSelection();
  }, [updateQuery, clearSelection]);

  const handleFiltersReset = useCallback(() => {
    updateQuery({ page: 1, size: query.size, sort: query.sort });
    clearSelection();
  }, [query.size, query.sort, updateQuery, clearSelection]);

  // Handlers de acciones principales
  const handleNewExpense = useCallback(() => {
    // TODO: Abrir formulario de nuevo gasto
    console.log('Nuevo gasto');
  }, []);

  const handleApproveSelected = useCallback(() => {
    if (selectedItems.size === 0) return;
    // TODO: Aprobar gastos seleccionados
    console.log('Aprobar gastos:', Array.from(selectedItems));
  }, [selectedItems]);

  const handleExport = useCallback(() => {
    // TODO: Abrir diálogo de exportación
    console.log('Exportar gastos');
  }, []);

  const handleImport = useCallback(() => {
    // TODO: Abrir diálogo de importación
    console.log('Importar gastos');
  }, []);

  const handleExpenseSelect = useCallback((expense: Expense) => {
    setSelectedExpense(expense);
    setShowDetailsDrawer(true);
  }, []);

  const handleExpenseEdit = useCallback((expense: Expense) => {
    // TODO: Abrir formulario de edición
    console.log('Editar gasto:', expense.id);
  }, []);

  const handleExpenseDelete = useCallback((expense: Expense) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este gasto?')) {
      // TODO: Eliminar gasto
      console.log('Eliminar gasto:', expense.id);
    }
  }, []);

  const handleExpenseApprove = useCallback((expense: Expense) => {
    // TODO: Aprobar gasto
    console.log('Aprobar gasto:', expense.id);
  }, []);

  const handleExpenseReject = useCallback((expense: Expense) => {
    const reason = window.prompt('Motivo del rechazo:');
    if (reason !== null) {
      // TODO: Rechazar gasto
      console.log('Rechazar gasto:', expense.id, 'Motivo:', reason);
    }
  }, []);

  // Cargar datos al montar el componente
  useEffect(() => {
    refreshExpenses();
  }, [refreshExpenses]);

  // Cargar datos cuando cambie la query
  useEffect(() => {
    refreshExpenses();
  }, [query, refreshExpenses]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar los gastos</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={refreshExpenses}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Gastos</h1>
              <p className="mt-2 text-gray-600">
                Administra y controla todos los gastos de la empresa
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleImport}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Upload className="h-4 w-4 mr-2" />
                Importar
              </button>
              <button
                onClick={handleExport}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </button>
              <button
                onClick={handleNewExpense}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Gasto
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        {totalAmounts && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Gastos</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(totalAmounts.total)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pagado</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(totalAmounts.paid)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pendiente</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(totalAmounts.balance)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Base Imponible</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(totalAmounts.base)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <ExpensesToolbar
          onNewExpense={handleNewExpense}
          onApprove={handleApproveSelected}
          onExport={handleExport}
          onImport={handleImport}
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
          <ExpensesFilters
            filters={query}
            onFiltersChange={handleFiltersChange}
            onFiltersReset={handleFiltersReset}
          />
        )}

        {/* Tabla */}
        <ExpensesTable
          expenses={expenses}
          isLoading={isLoading}
          selectedItems={selectedItems}
          onSelectItem={selectItem}
          onSelectAll={selectAll}
          isSelected={isSelected}
          onExpenseSelect={handleExpenseSelect}
          onExpenseEdit={handleExpenseEdit}
          onExpenseDelete={handleExpenseDelete}
          onExpenseApprove={handleExpenseApprove}
          onExpenseReject={handleExpenseReject}
          currentPage={query.page}
          totalPages={data?.totalPages || 1}
          onPageChange={handlePageChange}
        />

        {/* Drawer de detalles */}
        <ExpenseDetailsDrawer
          expense={selectedExpense}
          isOpen={showDetailsDrawer}
          onClose={() => {
            setShowDetailsDrawer(false);
            setSelectedExpense(null);
          }}
          onEdit={handleExpenseEdit}
          onDelete={handleExpenseDelete}
          onApprove={handleExpenseApprove}
          onReject={handleExpenseReject}
        />
      </div>
    </div>
  );
}

