import { useState } from "react";
import { usePortalStats } from "../hooks";
import { formatPrice, formatPercent, getHealthScore, calculateStats } from "../utils";

interface StatsByPortalProps {
  portalId: string;
}

const StatsByPortal = ({ portalId }: StatsByPortalProps) => {
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    to: new Date().toISOString().split('T')[0] // today
  });

  const { stats, loading, error } = usePortalStats(portalId, dateRange);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, j) => (
              <div key={j} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-2">⚠️</div>
        <p className="text-red-600">{error || "No se pudieron cargar las estadísticas"}</p>
      </div>
    );
  }

  const healthScore = getHealthScore(stats);
  const calculatedStats = calculateStats(stats);

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex items-center space-x-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Desde</label>
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
            className="mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Hasta</label>
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
            className="mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
      </div>

      {/* Health Score */}
      <div className={`p-4 rounded-lg ${healthScore.bgColor}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-lg font-semibold ${healthScore.color}`}>
              Salud del Portal: {healthScore.score}/100
            </h3>
            <p className="text-sm text-gray-600">
              {healthScore.level === "excellent" && "🟢 Excelente - Portal funcionando perfectamente"}
              {healthScore.level === "good" && "🔵 Bueno - Portal funcionando bien"}
              {healthScore.level === "warning" && "🟡 Advertencia - Revisar configuración"}
              {healthScore.level === "critical" && "🔴 Crítico - Requiere atención inmediata"}
            </p>
          </div>
          <div className={`text-3xl font-bold ${healthScore.color}`}>
            {healthScore.score}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">{stats.activeListings}</div>
          <div className="text-sm text-gray-600">Anuncios activos</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">{stats.leads}</div>
          <div className="text-sm text-gray-600">Leads recibidos</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-red-600">{stats.errors24h}</div>
          <div className="text-sm text-gray-600">Errores (24h)</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-2xl font-bold text-purple-600">
            {calculatedStats.successRateFormatted}
          </div>
          <div className="text-sm text-gray-600">Tasa de éxito</div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <h4 className="text-lg font-semibold mb-4">Rendimiento</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total de requests:</span>
              <span className="font-medium">{stats.totalRequests.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tiempo respuesta promedio:</span>
              <span className="font-medium">{calculatedStats.avgResponseFormatted}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Requests exitosos:</span>
              <span className="font-medium">{calculatedStats.successRateFormatted}</span>
            </div>
            {stats.duplicatesPct !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-600">% Duplicados:</span>
                <span className="font-medium">{formatPercent(stats.duplicatesPct)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h4 className="text-lg font-semibold mb-4">Costos y Conversión</h4>
          <div className="space-y-3">
            {stats.cost && (
              <div className="flex justify-between">
                <span className="text-gray-600">Costo total:</span>
                <span className="font-medium">{calculatedStats.cplFormatted}</span>
              </div>
            )}
            {stats.cpl && (
              <div className="flex justify-between">
                <span className="text-gray-600">CPL (Costo por Lead):</span>
                <span className="font-medium">{calculatedStats.cplFormatted}</span>
              </div>
            )}
            {stats.cpa && (
              <div className="flex justify-between">
                <span className="text-gray-600">CPA (Costo por Adquisición):</span>
                <span className="font-medium">{calculatedStats.cpaFormatted}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Leads por anuncio:</span>
              <span className="font-medium">
                {stats.activeListings > 0 ? (stats.leads / stats.activeListings).toFixed(2) : "0"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts and Recommendations */}
      <div className="bg-white p-6 rounded-lg border">
        <h4 className="text-lg font-semibold mb-4">Recomendaciones</h4>
        <div className="space-y-3">
          {stats.errors24h > 5 && (
            <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="text-red-500">⚠️</div>
              <div>
                <div className="text-sm font-medium text-red-800">Alto número de errores</div>
                <div className="text-sm text-red-700">
                  Se han detectado {stats.errors24h} errores en las últimas 24 horas. 
                  Revisa la configuración y credenciales del portal.
                </div>
              </div>
            </div>
          )}
          
          {stats.successRate < 95 && (
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="text-yellow-500">⚡</div>
              <div>
                <div className="text-sm font-medium text-yellow-800">Tasa de éxito baja</div>
                <div className="text-sm text-yellow-700">
                  La tasa de éxito está por debajo del 95%. Considera optimizar la configuración 
                  o revisar la conectividad con el portal.
                </div>
              </div>
            </div>
          )}
          
          {stats.avgResponseTime && stats.avgResponseTime > 3000 && (
            <div className="flex items-start space-x-3 p-3 bg-orange-50 border border-orange-200 rounded-md">
              <div className="text-orange-500">🐌</div>
              <div>
                <div className="text-sm font-medium text-orange-800">Respuesta lenta</div>
                <div className="text-sm text-orange-700">
                  El tiempo de respuesta promedio es alto ({stats.avgResponseTime}ms). 
                  Esto puede afectar la experiencia del usuario.
                </div>
              </div>
            </div>
          )}
          
          {stats.duplicatesPct && stats.duplicatesPct > 15 && (
            <div className="flex items-start space-x-3 p-3 bg-purple-50 border border-purple-200 rounded-md">
              <div className="text-purple-500">🔄</div>
              <div>
                <div className="text-sm font-medium text-purple-800">Alto % de duplicados</div>
                <div className="text-sm text-purple-700">
                  {formatPercent(stats.duplicatesPct)} de duplicados detectados. 
                  Ajusta la política de duplicados en la configuración avanzada.
                </div>
              </div>
            </div>
          )}

          {stats.errors24h === 0 && stats.successRate >= 98 && (
            <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="text-green-500">✅</div>
              <div>
                <div className="text-sm font-medium text-green-800">Portal funcionando perfectamente</div>
                <div className="text-sm text-green-700">
                  Sin errores recientes y excelente tasa de éxito. ¡Sigue así!
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsByPortal;