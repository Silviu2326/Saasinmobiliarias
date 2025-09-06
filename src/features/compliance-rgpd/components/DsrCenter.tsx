import { useState } from "react";
import { useDsr } from "../hooks";
import { statusColor, formatDate, daysUntil, isOverdue, getDsrTypeName } from "../utils";
import { dsrRequestSchema } from "../schema";
import type { DsrRequest, DsrType } from "../types";

export function DsrCenter() {
  const { requests, loading, error, createRequest, exportData, deleteData } = useDsr();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    email: "",
    type: "access" as DsrType,
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dueAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const validated = dsrRequestSchema.parse({ ...formData, dueAt });
      await createRequest(validated);
      setFormData({ subject: "", email: "", type: "access", description: "" });
      setShowForm(false);
    } catch (err: any) {
      console.error("Error al crear solicitud:", err.issues || err);
    }
  };

  const handleExport = async (id: string) => {
    try {
      await exportData(id);
    } catch (err) {
      console.error("Error al exportar:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Está seguro de que desea eliminar estos datos? Esta acción no se puede deshacer.")) {
      try {
        await deleteData(id);
      } catch (err) {
        console.error("Error al eliminar:", err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Centro de Derechos del Interesado (DSR)</h2>
          <p className="text-sm text-gray-600">
            Gestión de solicitudes de acceso, rectificación, supresión, portabilidad, limitación y oposición
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Nueva Solicitud
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Nueva Solicitud DSR</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Interesado <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tipo de Solicitud <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as DsrType })}
                  className="w-full border rounded-md px-3 py-2"
                  required
                >
                  <option value="access">Acceso</option>
                  <option value="rectification">Rectificación</option>
                  <option value="erasure">Supresión</option>
                  <option value="portability">Portabilidad</option>
                  <option value="restriction">Limitación</option>
                  <option value="objection">Oposición</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 h-24"
                  placeholder="Detalles adicionales de la solicitud..."
                />
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
                  Crear Solicitud
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="font-medium">Solicitudes DSR</h3>
        </div>
        
        {loading ? (
          <div className="p-4 text-center">Cargando solicitudes...</div>
        ) : error ? (
          <div className="p-4 text-red-600">{error}</div>
        ) : requests.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No hay solicitudes DSR</div>
        ) : (
          <div className="divide-y">
            {requests.map((request) => (
              <div key={request.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{request.subject}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(request.status)}`}>
                      {request.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {getDsrTypeName(request.type)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    ID: {request.id}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-gray-500">Creado:</span>
                    <div>{formatDate(request.createdAt)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Vence:</span>
                    <div className={isOverdue(request.dueAt) ? "text-red-600 font-medium" : ""}>
                      {formatDate(request.dueAt)}
                      {isOverdue(request.dueAt) && " (VENCIDO)"}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Días restantes:</span>
                    <div className={daysUntil(request.dueAt) < 5 ? "text-orange-600 font-medium" : ""}>
                      {daysUntil(request.dueAt)} días
                    </div>
                  </div>
                </div>

                {request.description && (
                  <div className="mb-3">
                    <span className="text-gray-500 text-sm">Descripción:</span>
                    <p className="text-sm mt-1">{request.description}</p>
                  </div>
                )}

                <div className="flex space-x-2">
                  {request.type === "access" && request.status === "done" && (
                    <button
                      onClick={() => handleExport(request.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Exportar Datos
                    </button>
                  )}
                  {request.type === "erasure" && request.status === "done" && (
                    <button
                      onClick={() => handleDelete(request.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Confirmar Borrado
                    </button>
                  )}
                  <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                    Ver Detalles
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">SLA por Tipo de Solicitud</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-medium">Acceso</div>
            <div className="text-blue-700">30 días</div>
          </div>
          <div>
            <div className="font-medium">Rectificación</div>
            <div className="text-blue-700">30 días</div>
          </div>
          <div>
            <div className="font-medium">Supresión</div>
            <div className="text-blue-700">30 días</div>
          </div>
          <div>
            <div className="font-medium">Portabilidad</div>
            <div className="text-blue-700">30 días</div>
          </div>
          <div>
            <div className="font-medium">Limitación</div>
            <div className="text-blue-700">30 días</div>
          </div>
          <div>
            <div className="font-medium">Oposición</div>
            <div className="text-blue-700">30 días</div>
          </div>
        </div>
      </div>
    </div>
  );
}