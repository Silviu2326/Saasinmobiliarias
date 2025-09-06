import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ProductivityFilters,
  ExportBar,
  KpisStrip,
  ActivityTimeline,
  WorkloadHeatmap,
  TasksCompletionPanel,
  PipelineLoadPanel,
  AgentLeaderboard,
  ResponseTimeChart,
  SlaComplianceCard,
  FieldOpsPanel,
  CapacityPlanner,
  AgentDetailDrawer
} from './components';

export default function ProductividadPage() {
  const [searchParams] = useSearchParams();
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);

  const handleAgentClick = (agentId: string) => {
    setSelectedAgentId(agentId);
  };

  const handleCloseDrawer = () => {
    setSelectedAgentId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analítica de Productividad</h1>
          <p className="mt-2 text-gray-600">
            Mide y optimiza la productividad comercial: actividad, tiempos de respuesta, SLA, visitas y carga de trabajo
          </p>
        </div>

        {/* Filters and Export Bar */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <ProductivityFilters />
            <ExportBar />
          </div>
        </div>

        {/* KPIs Strip */}
        <div className="mb-8">
          <KpisStrip />
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <ActivityTimeline />
            </div>
            
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <WorkloadHeatmap />
            </div>
            
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <TasksCompletionPanel onAgentClick={handleAgentClick} />
            </div>
            
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <PipelineLoadPanel onAgentClick={handleAgentClick} />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <AgentLeaderboard onAgentClick={handleAgentClick} />
            </div>
            
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <ResponseTimeChart />
            </div>
            
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <SlaComplianceCard />
            </div>
            
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <FieldOpsPanel onAgentClick={handleAgentClick} />
            </div>
            
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <CapacityPlanner />
            </div>
          </div>
        </div>
      </div>

      {/* Agent Detail Drawer */}
      {selectedAgentId && (
        <AgentDetailDrawer
          agentId={selectedAgentId}
          isOpen={!!selectedAgentId}
          onClose={handleCloseDrawer}
        />
      )}
    </div>
  );
}