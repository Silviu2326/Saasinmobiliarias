import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Table, 
  LayoutGrid, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  Target
} from 'lucide-react';

// Components
import {
  DueDatesToolbar,
  DueDatesFilters,
  DueDatesBoard,
  DueDatesTable,
  CalendarView,
  CreateDueDateDialog,
  EditDueDateDrawer,
  BulkActionsBar,
  RemindersSettings,
  EscalationRulesPanel,
  ImportExportBar,
  AuditTrailDrawer
} from './components';

// Hooks
import { useDueDates, useViewState } from './hooks';
import { formatRelative } from './utils';

export default function DueDatesPage() {
  const {
    items,
    total,
    kpis,
    filters,
    isLoading,
    selectedItems,
    selectedCount,
    updateFilters,
    refresh,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected
  } = useDueDates();

  const {
    view,
    selectedId,
    editingId,
    creating,
    setView,
    selectItem,
    editItem,
    setCreating
  } = useViewState();

  // Modal/drawer states
  const [showRemindersSettings, setShowRemindersSettings] = useState(false);
  const [showEscalationRules, setShowEscalationRules] = useState(false);
  const [showAuditTrail, setShowAuditTrail] = useState(false);

  // Selected item for details
  const selectedItem = selectedId ? items.find(item => item.id === selectedId) : null;
  const editingItem = editingId ? items.find(item => item.id === editingId) : null;

  const handleItemClick = (item: any) => {
    selectItem(item.id);
  };

  const handleItemEdit = (item: any) => {
    editItem(item.id);
  };

  const handleCreateNew = (date?: Date) => {
    setCreating(true);
  };

  const handleSuccess = () => {
    refresh();
  };

  const handleDateClick = (date: Date) => {
    setCreating(true);
  };

  const handleExport = () => {
    console.log('Export functionality');
  };

  const handleImport = () => {
    console.log('Import functionality');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Due Dates — Vencimientos</h1>
              <p className="text-gray-600 mt-1">
                Gestión centralizada de vencimientos operativos
              </p>
            </div>

            <ImportExportBar onExport={handleExport} onImport={handleImport} />
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Target className="h-5 w-5 text-blue-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{kpis.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Vencidos</p>
                    <p className="text-2xl font-bold text-red-600">{kpis.vencidos}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-amber-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Hoy</p>
                    <p className="text-2xl font-bold text-amber-600">{kpis.hoy}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Esta Semana</p>
                    <p className="text-2xl font-bold text-blue-600">{kpis.semana}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">En Riesgo</p>
                    <p className="text-2xl font-bold text-orange-600">{kpis.atRisk}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Completados</p>
                    <p className="text-2xl font-bold text-green-600">{kpis.completados}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <DueDatesToolbar
        selectedCount={selectedCount}
        onCreateNew={handleCreateNew}
        onExport={handleExport}
        onRemindersSettings={() => setShowRemindersSettings(true)}
        onEscalationRules={() => setShowEscalationRules(true)}
      />

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <DueDatesFilters
          filters={filters}
          onChange={updateFilters}
          onClear={() => updateFilters({})}
        />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <Tabs value={view} onValueChange={setView}>
          <TabsList className="mb-4">
            <TabsTrigger value="board" className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              Board
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendario
            </TabsTrigger>
            <TabsTrigger value="table" className="flex items-center gap-2">
              <Table className="h-4 w-4" />
              Tabla
            </TabsTrigger>
          </TabsList>

          <TabsContent value="board">
            <DueDatesBoard
              items={items}
              onItemClick={handleItemClick}
              onItemEdit={handleItemEdit}
            />
          </TabsContent>

          <TabsContent value="calendar">
            <CalendarView
              items={items}
              onItemClick={handleItemClick}
              onDateClick={handleDateClick}
              onCreateNew={handleCreateNew}
            />
          </TabsContent>

          <TabsContent value="table">
            <DueDatesTable
              items={items}
              selectedIds={selectedItems}
              onSelectionChange={toggleSelection}
              onSelectAll={selectAll}
              onItemClick={handleItemClick}
              onItemEdit={handleItemEdit}
            />
          </TabsContent>
        </Tabs>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Cargando...</span>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && items.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay vencimientos
              </h3>
              <p className="text-gray-600 mb-4">
                Comienza creando tu primer vencimiento o ajusta los filtros de búsqueda.
              </p>
              <Button onClick={handleCreateNew}>
                Crear Primer Vencimiento
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedIds={selectedItems}
        onClearSelection={clearSelection}
        onActionComplete={handleSuccess}
      />

      {/* Dialogs and Drawers */}
      <CreateDueDateDialog
        open={creating}
        onOpenChange={setCreating}
        onSuccess={handleSuccess}
      />

      <EditDueDateDrawer
        item={editingItem}
        open={!!editingId}
        onClose={() => editItem(null)}
        onUpdate={handleSuccess}
      />

      <RemindersSettings
        open={showRemindersSettings}
        onOpenChange={setShowRemindersSettings}
      />

      <EscalationRulesPanel
        open={showEscalationRules}
        onOpenChange={setShowEscalationRules}
      />

      <AuditTrailDrawer
        open={showAuditTrail}
        onClose={() => setShowAuditTrail(false)}
        itemId={selectedId}
      />
    </div>
  );
}