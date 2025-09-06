import { useState } from "react";
import { usePortals, usePortalConnection } from "../hooks";
import PortalCard from "./PortalCard";
import ConnectDialog from "./ConnectDialog";
import SettingsDrawer from "./SettingsDrawer";
import StatsByPortal from "./StatsByPortal";
import type { PortalInfo } from "../types";

interface PortalsGridProps {
  onPortalSelect?: (portal: PortalInfo) => void;
}

const PortalsGrid = ({ onPortalSelect }: PortalsGridProps) => {
  const [filters, setFilters] = useState({ status: "", search: "" });
  const { portals, loading, error, reload } = usePortals(filters);
  const { connect, disconnect, connecting, disconnecting } = usePortalConnection();

  const [connectingPortal, setConnectingPortal] = useState<string | null>(null);
  const [settingsPortal, setSettingsPortal] = useState<string | null>(null);
  const [statsPortal, setStatsPortal] = useState<string | null>(null);

  const handleConnect = (portalId: string) => {
    setConnectingPortal(portalId);
  };

  const handleConnectSubmit = async (portalId: string, credentials: any) => {
    const result = await connect(portalId, credentials);
    if (result.success) {
      setConnectingPortal(null);
      reload();
    }
    return result;
  };

  const handleDisconnect = async (portalId: string) => {
    if (window.confirm("¿Estás seguro de que quieres desconectar este portal?")) {
      const result = await disconnect(portalId);
      if (result.success) {
        reload();
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">⚠️</div>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={reload}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar portales..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="CONNECTED">Conectados</option>
            <option value="DISCONNECTED">Desconectados</option>
            <option value="TOKEN_EXPIRED">Token expirado</option>
            <option value="ERROR">Con errores</option>
            <option value="PAUSED">Pausados</option>
          </select>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{portals.length}</div>
          <div className="text-sm text-gray-600">Portales totales</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">
            {portals.filter(p => p.status === "CONNECTED").length}
          </div>
          <div className="text-sm text-gray-600">Conectados</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-yellow-600">
            {portals.filter(p => p.status === "TOKEN_EXPIRED").length}
          </div>
          <div className="text-sm text-gray-600">Token expirado</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-red-600">
            {portals.filter(p => p.status === "ERROR").length}
          </div>
          <div className="text-sm text-gray-600">Con errores</div>
        </div>
      </div>

      {/* Portals Grid */}
      {portals.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">🌐</div>
          <p className="text-gray-600">No se encontraron portales con los filtros actuales</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portals.map((portal) => (
            <PortalCard
              key={portal.id}
              portal={portal}
              onConnect={() => handleConnect(portal.id)}
              onSettings={() => setSettingsPortal(portal.id)}
              onViewStats={() => setStatsPortal(portal.id)}
              onDisconnect={() => handleDisconnect(portal.id)}
            />
          ))}
        </div>
      )}

      {/* Connect Dialog */}
      {connectingPortal && (
        <ConnectDialog
          portalId={connectingPortal}
          isOpen={!!connectingPortal}
          onClose={() => setConnectingPortal(null)}
          onConnect={handleConnectSubmit}
          loading={connecting}
        />
      )}

      {/* Settings Drawer */}
      {settingsPortal && (
        <SettingsDrawer
          portalId={settingsPortal}
          isOpen={!!settingsPortal}
          onClose={() => setSettingsPortal(null)}
        />
      )}

      {/* Stats Modal */}
      {statsPortal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-screen overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Estadísticas - {portals.find(p => p.id === statsPortal)?.name}
              </h3>
              <button
                onClick={() => setStatsPortal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <StatsByPortal portalId={statsPortal} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PortalsGrid;