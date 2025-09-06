import { useState } from "react";
import { useRetention } from "../hooks";
import { formatDate } from "../utils";
import { retentionRuleSchema } from "../schema";

export function RetentionPolicies() {
  const { policies, loading, error, createPolicy, previewPolicy } = useRetention();
  const [showForm, setShowForm] = useState(false);
  const [previewData, setPreviewData] = useState<{ affected: number; entities: string[] } | null>(null);
  const [formData, setFormData] = useState({
    entity: "",
    action: "delete" as "delete" | "anonymize",
    afterDays: 365,
    enabled: true,
    description: "",
    legalBasis: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validated = retentionRuleSchema.parse(formData);
      await createPolicy(validated);
      setFormData({
        entity: "",
        action: "delete",
        afterDays: 365,
        enabled: true,
        description: "",
        legalBasis: "",
      });
      setShowForm(false);
    } catch (err: any) {
      console.error("Error al crear política:", err.issues || err);
    }
  };

  const handlePreview = async (policyId: string) => {
    try {
      const data = await previewPolicy(policyId);
      setPreviewData(data);
    } catch (err) {
      console.error("Error al previsualizar:", err);
    }
  };

  const getActionColor = (action: string) => {
    return action === "delete" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Políticas de Retención</h2>
          <p className="text-sm text-gray-600">
            Configuración de reglas automáticas de eliminación y anonimización de datos
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Nueva Política
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Nueva Política de Retención</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Entidad/Tipo de Dato <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.entity}
                  onChange={(e) => setFormData({ ...formData, entity: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                  required
                >
                  <option value="">Seleccionar entidad</option>
                  <option value="Lead inactivo">Lead inactivo</option>
                  <option value="Cliente inactivo">Cliente inactivo</option>
                  <option value="Propietario inactivo">Propietario inactivo</option>
                  <option value="Documento caducado">Documento caducado</option>
                  <option value="Sesión web">Sesión web</option>
                  <option value="Log de sistema">Log de sistema</option>
                  <option value="Email marketing">Email marketing</option>
                  <option value="Consulta web">Consulta web</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Acción <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.action}
                  onChange={(e) => setFormData({ ...formData, action: e.target.value as any })}
                  className="w-full border rounded-md px-3 py-2"
                  required
                >
                  <option value="delete">Eliminar</option>
                  <option value="anonymize">Anonimizar</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Días de Retención <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.afterDays}
                  onChange={(e) => setFormData({ ...formData, afterDays: parseInt(e.target.value) })}
                  className="w-full border rounded-md px-3 py-2"
                  min="1"
                  required
                />
                <p className="text-xs text-gray-600 mt-1">
                  Número de días después de los cuales aplicar la acción
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Base Legal</label>
                <input
                  type="text"
                  value={formData.legalBasis}
                  onChange={(e) => setFormData({ ...formData, legalBasis: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="Art. 5.1.e RGPD - Limitación del plazo de conservación"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 h-20"
                  placeholder="Descripción de la política y criterios de aplicación..."
                />
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  />
                  <span className="text-sm">Política activa</span>
                </label>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Crear Política
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {previewData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Preview de Aplicación</h3>
            <div className="space-y-4">
              <div>
                <span className="font-medium">Registros afectados:</span>
                <div className="text-2xl font-bold text-orange-600">{previewData.affected}</div>
              </div>
              <div>
                <span className="font-medium">Ejemplos:</span>
                <div className="mt-2 space-y-1">
                  {previewData.entities.slice(0, 5).map((entity, index) => (
                    <div key={index} className="text-sm bg-gray-50 px-2 py-1 rounded">
                      {entity}
                    </div>
                  ))}
                  {previewData.entities.length > 5 && (
                    <div className="text-sm text-gray-600">
                      ... y {previewData.entities.length - 5} más
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-sm text-yellow-800">
                  Esta es una simulación. La acción real se ejecutará según la programación configurada.
                </p>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setPreviewData(null)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="font-medium">Políticas de Retención Configuradas</h3>
        </div>
        
        {loading ? (
          <div className="p-4 text-center">Cargando políticas...</div>
        ) : error ? (
          <div className="p-4 text-red-600">{error}</div>
        ) : policies.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No hay políticas de retención configuradas</div>
        ) : (
          <div className="divide-y">
            {policies.map((policy) => (
              <div key={policy.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{policy.entity}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(policy.action)}`}>
                      {policy.action === "delete" ? "Eliminar" : "Anonimizar"}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      policy.enabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}>
                      {policy.enabled ? "Activa" : "Inactiva"}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {policy.afterDays} días
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-gray-500">Última ejecución:</span>
                    <div>{policy.lastRun ? formatDate(policy.lastRun) : "Nunca"}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Próxima ejecución:</span>
                    <div>{policy.nextRun ? formatDate(policy.nextRun) : "Programar"}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Acción:</span>
                    <div className="capitalize">{policy.action}</div>
                  </div>
                </div>

                {policy.description && (
                  <div className="mb-3">
                    <span className="text-gray-500 text-sm">Descripción:</span>
                    <p className="text-sm mt-1">{policy.description}</p>
                  </div>
                )}

                {policy.legalBasis && (
                  <div className="mb-3">
                    <span className="text-gray-500 text-sm">Base legal:</span>
                    <p className="text-sm mt-1 font-mono">{policy.legalBasis}</p>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePreview(policy.id)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Preview
                  </button>
                  <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                    Ejecutar Ahora
                  </button>
                  <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                    Configurar
                  </button>
                  {policy.enabled ? (
                    <button className="text-orange-600 hover:text-orange-800 text-sm font-medium">
                      Pausar
                    </button>
                  ) : (
                    <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                      Activar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="font-medium text-purple-900 mb-2">Configuración Automática</h4>
        <div className="grid grid-cols-2 gap-4 text-sm text-purple-800">
          <div>
            <p className="font-medium mb-2">Programación:</p>
            <ul className="space-y-1">
              <li>• Ejecución diaria a las 02:00 AM</li>
              <li>• Log detallado de acciones</li>
              <li>• Notificación por email</li>
              <li>• Backup previo (opcional)</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-2">Seguridad:</p>
            <ul className="space-y-1">
              <li>• Confirmación antes de eliminar</li>
              <li>• Periodo de gracia configurable</li>
              <li>• Auditoria de todas las acciones</li>
              <li>• Recuperación de emergencia</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}