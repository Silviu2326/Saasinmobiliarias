import React, { useState } from "react";
import { AgentPerf } from "../types";
import { formatPct, formatNumber } from "../utils";

interface AgentPerformanceProps {
  agents: AgentPerf[];
  loading: boolean;
}

export const AgentPerformance: React.FC<AgentPerformanceProps> = ({ agents, loading }) => {
  const [sortBy, setSortBy] = useState<"convGlobal" | "leads" | "responseRate">("convGlobal");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showTopOnly, setShowTopOnly] = useState(false);

  const handleSort = (column: "convGlobal" | "leads" | "responseRate") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const sortedAgents = [...agents].sort((a, b) => {
    const comparison = a[sortBy] - b[sortBy];
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const filteredAgents = showTopOnly
    ? sortedAgents.filter(agent => agent.isTop || agent.isBottom)
    : sortedAgents;

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Rendimiento por Agente</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTopOnly(!showTopOnly)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              showTopOnly
                ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {showTopOnly ? "Mostrar todos" : "Solo destacados"}
          </button>
        </div>
      </div>

      {/* Headers de ordenación */}
      <div className="flex gap-2 mb-4 text-xs">
        <button
          onClick={() => handleSort("convGlobal")}
          className={`px-2 py-1 rounded transition-colors ${
            sortBy === "convGlobal" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
          }`}
        >
          Por conversión {sortBy === "convGlobal" && (sortOrder === "desc" ? "↓" : "↑")}
        </button>
        <button
          onClick={() => handleSort("leads")}
          className={`px-2 py-1 rounded transition-colors ${
            sortBy === "leads" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
          }`}
        >
          Por volumen {sortBy === "leads" && (sortOrder === "desc" ? "↓" : "↑")}
        </button>
        <button
          onClick={() => handleSort("responseRate")}
          className={`px-2 py-1 rounded transition-colors ${
            sortBy === "responseRate" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
          }`}
        >
          Por respuesta {sortBy === "responseRate" && (sortOrder === "desc" ? "↓" : "↑")}
        </button>
      </div>

      {/* Lista de agentes */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredAgents.map((agent, index) => (
          <div
            key={agent.agentId}
            className={`p-4 rounded-lg border transition-all ${
              agent.isTop
                ? "border-green-200 bg-green-50"
                : agent.isBottom
                ? "border-red-200 bg-red-50"
                : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-gray-900">{agent.agentName}</h4>
                  {agent.isTop && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Top 10%
                    </span>
                  )}
                  {agent.isBottom && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                      Bottom 10%
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Leads:</span>
                    <span className="ml-1 font-semibold">{formatNumber(agent.leads)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Visitas:</span>
                    <span className="ml-1 font-semibold">{formatNumber(agent.visits)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Ofertas:</span>
                    <span className="ml-1 font-semibold">{formatNumber(agent.offers)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Contratos:</span>
                    <span className="ml-1 font-semibold">{formatNumber(agent.contracts)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                  <div>
                    <span className="text-gray-500">Conv. global:</span>
                    <span
                      className={`ml-1 font-bold ${
                        agent.convGlobal > 15
                          ? "text-green-600"
                          : agent.convGlobal > 8
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatPct(agent.convGlobal)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">1er contacto:</span>
                    <span className="ml-1 font-semibold">
                      {agent.firstResponseH.toFixed(1)}h
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Tasa respuesta:</span>
                    <span
                      className={`ml-1 font-semibold ${
                        agent.responseRate > 85
                          ? "text-green-600"
                          : agent.responseRate > 70
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatPct(agent.responseRate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Barra de rendimiento visual */}
              <div className="ml-4 w-16">
                <div className="text-xs text-gray-500 mb-1">Rendimiento</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      agent.convGlobal > 15
                        ? "bg-green-500"
                        : agent.convGlobal > 8
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min((agent.convGlobal / 20) * 100, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-center mt-1 font-medium">
                  {formatPct(agent.convGlobal)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Estadísticas del equipo */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Total agentes:</span>
            <span className="ml-2 font-semibold">{agents.length}</span>
          </div>
          <div>
            <span className="text-gray-500">Conv. promedio:</span>
            <span className="ml-2 font-semibold text-blue-600">
              {formatPct(agents.reduce((sum, a) => sum + a.convGlobal, 0) / agents.length)}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Mejor agente:</span>
            <span className="ml-2 font-semibold text-green-600">
              {formatPct(Math.max(...agents.map(a => a.convGlobal)))}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Total contratos:</span>
            <span className="ml-2 font-semibold">
              {formatNumber(agents.reduce((sum, a) => sum + a.contracts, 0))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};