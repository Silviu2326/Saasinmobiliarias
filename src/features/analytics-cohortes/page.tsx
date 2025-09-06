import { useState, useCallback } from "react";
import type { CohortFilters } from "./types";
import { useCohorts, useDrilldown } from "./hooks";
import {
  CohortFilters as CohortFiltersComponent,
  CohortHeatmap,
  RetentionCurve,
  StageProgressionMatrix,
  CohortTable,
  SegmentationPanel,
  TimeToEventChart,
  SurvivalAnalysis,
  DrilldownDrawer,
  KpisStrip,
  ExportBar
} from "./components";

const CohortesPage = () => {
  const [filters, setFilters] = useState<CohortFilters>({
    window: 12,
    targetStage: "CONTRATO"
  });

  const { kpis } = useCohorts(filters);
  const drilldown = useDrilldown();

  const handleFiltersChange = useCallback((newFilters: CohortFilters) => {
    setFilters(newFilters);
  }, []);

  const handleCellClick = useCallback((cohort: string, monthRel: number, stage: string) => {
    drilldown.fetchData({
      cohort,
      monthRel,
      event: stage as any,
      filters
    });
  }, [drilldown, filters]);

  const handleRowClick = useCallback((cohort: string) => {
    drilldown.fetchData({
      cohort,
      monthRel: 0,
      event: filters.targetStage as any || "CONTRATO",
      filters
    });
  }, [drilldown, filters]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analítica de Cohortes</h1>
          <p className="mt-2 text-gray-600">
            Análisis del comportamiento y progresión de leads agrupados por mes de adquisición, 
            con seguimiento de su avance por etapas del funnel de ventas.
          </p>
        </div>

        {/* Top Bar */}
        <div className="space-y-6 mb-8">
          <CohortFiltersComponent
            onFiltersChange={handleFiltersChange}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <KpisStrip kpis={kpis} />
            </div>
            <div className="lg:col-span-1">
              <ExportBar filters={filters} />
            </div>
          </div>

          <SegmentationPanel
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        </div>

        {/* Main Grid */}
        <div className="space-y-8">
          {/* Heatmap - Full Width */}
          <div>
            <CohortHeatmap
              filters={filters}
              onCellClick={handleCellClick}
            />
          </div>

          {/* Row 2: Retention Curve + Time to Event Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RetentionCurve filters={filters} />
            <TimeToEventChart filters={filters} />
          </div>

          {/* Row 3: Stage Progression Matrix + Survival Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StageProgressionMatrix
              filters={filters}
              onCellClick={handleCellClick}
            />
            <SurvivalAnalysis filters={filters} />
          </div>

          {/* Row 4: Cohort Table - Full Width */}
          <div>
            <CohortTable
              filters={filters}
              onRowClick={handleRowClick}
            />
          </div>
        </div>

        {/* Drilldown Drawer */}
        <DrilldownDrawer
          isOpen={drilldown.isOpen}
          onClose={drilldown.close}
          data={drilldown.data}
          loading={drilldown.loading}
          error={drilldown.error}
          title="Detalle de Registros de Cohorte"
        />
      </div>
    </div>
  );
};

export default CohortesPage;