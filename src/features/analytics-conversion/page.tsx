import React, { useState } from "react";
import {
  ConversionFilters,
  FunnelOverview,
  StageTable,
  DropoffReasons,
  TimeToConvertChart,
  AttributionPanel,
  AgentPerformance,
  PortalPerformance,
  CohortsTable,
  ABTestingStrip,
  ExportBar,
  KpisStrip,
} from "./components";
import {
  useConversionFilters,
  useConversionData,
  useAttribution,
  useAgentsPerformance,
  usePortalsPerformance,
  useCohorts,
} from "./hooks";
import { AttributionModel } from "./types";

export const ConversionPage: React.FC = () => {
  const { filters, updateFilters, resetFilters } = useConversionFilters();
  const { funnel, stages, timeStats, dropoffs, kpis, loading, error } = useConversionData(filters);
  
  const [attributionModel, setAttributionModel] = useState<AttributionModel>("last");
  const { data: attributionData, loading: attributionLoading } = useAttribution(filters, attributionModel);
  const { agents, loading: agentsLoading } = useAgentsPerformance(filters);
  const { portals, loading: portalsLoading } = usePortalsPerformance(filters);
  const { cohorts, loading: cohortsLoading } = useCohorts(filters);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar datos</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Analítica de Conversión</h1>
                <p className="mt-2 text-gray-600">
                  Vista completa del embudo de conversión desde lead hasta contrato, 
                  con análisis de tasas, tiempos y atribución por canal.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">
                  {loading ? "Cargando..." : "Datos actualizados"}
                </span>
                <div className={`w-3 h-3 rounded-full ${loading ? "bg-yellow-500 animate-pulse" : "bg-green-500"}`} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Barra superior: Filtros, Export y KPIs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <ConversionFilters
              filters={filters}
              onFiltersChange={updateFilters}
              onReset={resetFilters}
            />
          </div>
          <div className="space-y-4">
            <ExportBar 
              data={{ funnel, stages, attributionData, agents, portals, cohorts }}
              filename={`conversion-analytics-${new Date().toISOString().split('T')[0]}`}
            />
          </div>
        </div>

        {/* KPIs Strip */}
        <div className="mb-6">
          <KpisStrip kpis={kpis} loading={loading} />
        </div>

        {/* Embudo principal - ancho completo */}
        <div className="mb-6">
          <FunnelOverview funnel={funnel} loading={loading} />
        </div>

        {/* Grid principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Columna izquierda */}
          <div className="space-y-6">
            <StageTable stages={stages} loading={loading} />
            <TimeToConvertChart timeStats={timeStats} loading={loading} />
          </div>
          
          {/* Columna derecha */}
          <div className="space-y-6">
            <DropoffReasons dropoffs={dropoffs} loading={loading} />
            <AttributionPanel
              data={attributionData}
              loading={attributionLoading}
              onModelChange={setAttributionModel}
            />
          </div>
        </div>

        {/* Segunda fila: Rendimiento */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <AgentPerformance agents={agents} loading={agentsLoading} />
          <PortalPerformance portals={portals} loading={portalsLoading} />
        </div>

        {/* Tercera fila: Cohortes y A/B Testing */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          <div className="xl:col-span-2">
            <CohortsTable cohorts={cohorts} loading={cohortsLoading} />
          </div>
          <div>
            <ABTestingStrip />
          </div>
        </div>

        {/* Footer con información adicional */}
        <div className="mt-8 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>📊 Dashboard de Conversión</span>
              <span>•</span>
              <span>Datos en tiempo real</span>
              <span>•</span>
              <span>Actualización automática</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Última actualización:</span>
              <span className="font-medium">{new Date().toLocaleString("es-ES")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};