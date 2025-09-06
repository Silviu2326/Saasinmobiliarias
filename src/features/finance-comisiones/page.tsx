import { useState } from "react";
import { 
  Calculator,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  FileText 
} from "lucide-react";

import {
  CommissionsToolbar,
  CommissionsFilters,
  CommissionsTable,
  CommissionPlansTable,
  CommissionPlanEditor,
  SettlementWizard,
  PayoutsTable,
  AdjustmentsDialog,
  ReconciliationPanel,
  ForecastCard,
  AgentsSummary,
  AuditTrailDrawer,
} from "./components";

import { 
  useCommissionItems,
  useCommissionPlans,
  usePayouts,
} from "./hooks";
import { CommissionItem, CommissionPlan } from "./types";

export default function ComisionesPage() {
  const {
    data,
    loading: commissionsLoading,
    selectedIds,
    selectedItems,
    selectedTotal,
    updateFilters,
    selectAll,
    deselectAll,
    toggleSelection,
    recalculate,
    refetch,
  } = useCommissionItems();

  const {
    plans,
    loading: plansLoading,
    createPlan,
    updatePlan,
    deletePlan,
  } = useCommissionPlans();

  const {
    payouts,
    loading: payoutsLoading,
    fetchPayouts,
    updateStatus,
    downloadReceipt,
  } = usePayouts();

  const [activeTab, setActiveTab] = useState("pendientes");
  const [showPlanEditor, setShowPlanEditor] = useState(false);
  const [showSettlementWizard, setShowSettlementWizard] = useState(false);
  const [showAdjustmentDialog, setShowAdjustmentDialog] = useState(false);
  const [showAuditDrawer, setShowAuditDrawer] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<CommissionPlan | null>(null);
  const [selectedItem, setSelectedItem] = useState<CommissionItem | null>(null);

  const handleNewRule = () => {
    setSelectedPlan(null);
    setShowPlanEditor(true);
  };

  const handleEditPlan = (plan: CommissionPlan) => {
    setSelectedPlan(plan);
    setShowPlanEditor(true);
  };

  const handleDuplicatePlan = (plan: CommissionPlan) => {
    setSelectedPlan({
      ...plan,
      id: `${plan.id}-copy`,
      name: `${plan.name} (Copia)`,
    });
    setShowPlanEditor(true);
  };

  const handlePreviewPlan = (plan: CommissionPlan) => {
    console.log("Preview plan:", plan);
  };

  const handleSavePlan = async (planData: any) => {
    try {
      if (selectedPlan?.id && selectedPlan.id !== planData.id) {
        await updatePlan(selectedPlan.id, planData);
      } else {
        await createPlan(planData);
      }
      setShowPlanEditor(false);
      setSelectedPlan(null);
    } catch (error) {
      console.error("Error saving plan:", error);
    }
  };

  const handleDeletePlan = async (id: string) => {
    try {
      await deletePlan(id);
    } catch (error) {
      console.error("Error deleting plan:", error);
    }
  };

  const handleSettleSelected = () => {
    if (selectedItems.length > 0) {
      setShowSettlementWizard(true);
    }
  };

  const handleSettlementComplete = () => {
    setShowSettlementWizard(false);
    deselectAll();
    refetch();
    fetchPayouts();
  };

  const handleOpenAudit = (item: CommissionItem) => {
    setSelectedItem(item);
    setShowAuditDrawer(true);
  };

  const handleOpenAdjustment = (item: CommissionItem) => {
    setSelectedItem(item);
    setShowAdjustmentDialog(true);
  };

  const handleAdjustmentSave = () => {
    setShowAdjustmentDialog(false);
    setSelectedItem(null);
    refetch();
  };

  const handlePageChange = (page: number) => {
    updateFilters({ page });
  };

  const handleSort = (field: string) => {
    updateFilters({ sort: field, page: 1 });
  };

  const handleFiltersChange = (filters: any) => {
    updateFilters({ ...filters, page: 1 });
  };

  const handleFiltersClear = () => {
    updateFilters({
      q: undefined,
      period: undefined,
      from: undefined,
      to: undefined,
      agent: undefined,
      office: undefined,
      type: undefined,
      status: undefined,
      source: undefined,
      page: 1,
    });
  };

  const tabs = [
    { id: "pendientes", label: "Pendientes", icon: FileText },
    { id: "planes", label: "Planes", icon: Settings },
    { id: "pagos", label: "Pagos", icon: CreditCard },
    { id: "conciliacion", label: "Conciliación", icon: BarChart3 },
    { id: "kpis", label: "KPIs", icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Comisiones</h1>
        <p className="text-gray-600">
          Gestión integral de comisiones: planes, cálculos, liquidaciones y pagos.
          Controla el ciclo completo desde la definición de reglas hasta la conciliación final.
        </p>
      </div>

      <CommissionsToolbar
        selectedCount={selectedIds.size}
        selectedTotal={selectedTotal}
        onNewRule={handleNewRule}
        onSettleSelected={handleSettleSelected}
        onRecalculateSelected={() => recalculate()}
        filters={data ? {
          q: new URLSearchParams(window.location.search).get("q") || undefined,
        } : {}}
      />

      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "pendientes" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">Comisiones pendientes de liquidar</h3>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Lista de comisiones calculadas que están pendientes de aprobación o liquidación
                </p>
              </div>
              <div className="p-6 space-y-4">
                <CommissionsFilters
                  filters={data ? {
                    q: new URLSearchParams(window.location.search).get("q") || undefined,
                  } : {}}
                  onFiltersChange={handleFiltersChange}
                  onClear={handleFiltersClear}
                />
                
                <CommissionsTable
                  data={data}
                  loading={commissionsLoading}
                  selectedIds={selectedIds}
                  onToggleSelection={toggleSelection}
                  onSelectAll={selectAll}
                  onDeselectAll={deselectAll}
                  onOpenAudit={handleOpenAudit}
                  onOpenAdjustment={handleOpenAdjustment}
                  onPageChange={handlePageChange}
                  onSort={handleSort}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "planes" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">Planes de comisión</h3>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Configuración de reglas de comisión por agente, equipo u oficina
                </p>
              </div>
              <div className="p-6">
                <CommissionPlansTable
                  plans={plans}
                  loading={plansLoading}
                  onEdit={handleEditPlan}
                  onDelete={handleDeletePlan}
                  onDuplicate={handleDuplicatePlan}
                  onPreview={handlePreviewPlan}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "pagos" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">Pagos y liquidaciones</h3>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Historial de pagos emitidos y gestión de estados
                </p>
              </div>
              <div className="p-6">
                <PayoutsTable
                  payouts={payouts}
                  loading={payoutsLoading}
                  onUpdateStatus={updateStatus}
                  onDownloadReceipt={downloadReceipt}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "conciliacion" && (
          <div className="space-y-6">
            <ReconciliationPanel />
          </div>
        )}

        {activeTab === "kpis" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <AgentsSummary />
              </div>
              <div>
                <ForecastCard />
              </div>
            </div>
          </div>
        )}
      </div>

      {showPlanEditor && (
        <CommissionPlanEditor
          plan={selectedPlan}
          open={showPlanEditor}
          onSave={handleSavePlan}
          onCancel={() => {
            setShowPlanEditor(false);
            setSelectedPlan(null);
          }}
        />
      )}

      {showSettlementWizard && (
        <SettlementWizard
          selectedItems={selectedItems}
          open={showSettlementWizard}
          onComplete={handleSettlementComplete}
          onCancel={() => setShowSettlementWizard(false)}
        />
      )}

      {showAdjustmentDialog && (
        <AdjustmentsDialog
          item={selectedItem}
          open={showAdjustmentDialog}
          onSave={handleAdjustmentSave}
          onCancel={() => {
            setShowAdjustmentDialog(false);
            setSelectedItem(null);
          }}
        />
      )}

      {showAuditDrawer && (
        <AuditTrailDrawer
          item={selectedItem}
          open={showAuditDrawer}
          onClose={() => {
            setShowAuditDrawer(false);
            setSelectedItem(null);
          }}
        />
      )}
    </div>
  );
}