import { useRgpdOverview } from "../hooks";
import { complianceColor, calculateComplianceScore } from "../utils";

export function ComplianceScore() {
  const { metrics, loading, error } = useRgpdOverview();

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="text-red-600 text-sm">{error || "Error al cargar métricas"}</div>
      </div>
    );
  }

  const { score, details } = calculateComplianceScore(metrics);

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">Score de Cumplimiento RGPD</h3>
          <p className="text-sm text-gray-600">Indicador global de cumplimiento</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg"
               style={{ backgroundColor: complianceColor(metrics.level).replace('bg-', '') }}>
            {score}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>DSR pendientes:</span>
          <span className="font-medium">{metrics.pendingDsr}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>DSR vencidos:</span>
          <span className={`font-medium ${metrics.overdueDsr > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {metrics.overdueDsr}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Brechas activas:</span>
          <span className={`font-medium ${metrics.activeBreaches > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
            {metrics.activeBreaches}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Brechas alto riesgo:</span>
          <span className={`font-medium ${metrics.highRiskBreaches > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {metrics.highRiskBreaches}
          </span>
        </div>
      </div>

      {metrics.issues.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="font-medium text-gray-900 mb-2">Acciones requeridas:</h4>
          <div className="space-y-1">
            {metrics.issues.map((issue, index) => (
              <div key={index} className={`text-xs px-2 py-1 rounded-md flex items-center justify-between ${
                issue.severity === 'critical' ? 'bg-red-50 text-red-700' :
                issue.severity === 'warning' ? 'bg-yellow-50 text-yellow-700' :
                'bg-blue-50 text-blue-700'
              }`}>
                <span>{issue.message}</span>
                {issue.action && (
                  <button className="ml-2 underline hover:no-underline text-xs">
                    {issue.action}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {details.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="font-medium text-gray-900 mb-2">Detalles del cálculo:</h4>
          <div className="space-y-1">
            {details.map((detail, index) => (
              <div key={index} className="text-xs text-gray-600">{detail}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}