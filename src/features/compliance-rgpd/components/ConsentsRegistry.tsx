import { useState } from "react";
import { useConsents } from "../hooks";
import { formatDateTime, exportToCsv } from "../utils";
import { consentSchema } from "../schema";

export function ConsentsRegistry() {
  const [subject, setSubject] = useState("");
  const { consents, loading, error, createConsent, revokeConsent } = useConsents(subject);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    email: "",
    purpose: "",
    granted: true,
    evidence: "",
    origin: "",
    ip: "",
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const searchTerm = formData.get("subject") as string;
    setSubject(searchTerm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validated = consentSchema.parse(formData);
      await createConsent({
        ...validated,
        by: "Manual entry",
      });
      setFormData({
        subject: "",
        email: "",
        purpose: "",
        granted: true,
        evidence: "",
        origin: "",
        ip: "",
      });
      setShowForm(false);
    } catch (err: any) {
      console.error("Error al crear consentimiento:", err.issues || err);
    }
  };

  const handleRevoke = async (id: string) => {
    const reason = prompt("Motivo de revocación (opcional):");
    try {
      await revokeConsent(id, reason || undefined);
    } catch (err) {
      console.error("Error al revocar:", err);
    }
  };

  const handleExportCsv = () => {
    if (consents.length === 0) return;
    exportToCsv(consents, `consents-${subject || 'all'}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Registro de Consentimientos</h2>
          <p className="text-sm text-gray-600">
            Gestión de consentimientos de marketing, email, WhatsApp y otros tratamientos
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleExportCsv}
            disabled={consents.length === 0}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Exportar CSV
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Nuevo Consentimiento
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4">
        <form onSubmit={handleSearch} className="flex space-x-2">
          <input
            type="text"
            name="subject"
            placeholder="Buscar por nombre del interesado..."
            className="flex-1 border rounded-md px-3 py-2"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Buscar
          </button>
        </form>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Nuevo Consentimiento</h3>
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
                  Finalidad <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                  required
                >
                  <option value="">Seleccionar finalidad</option>
                  <option value="Marketing por email">Marketing por email</option>
                  <option value="WhatsApp comercial">WhatsApp comercial</option>
                  <option value="SMS promocionales">SMS promocionales</option>
                  <option value="Llamadas comerciales">Llamadas comerciales</option>
                  <option value="Newsletter">Newsletter</option>
                  <option value="Cookies analíticas">Cookies analíticas</option>
                  <option value="Cookies de marketing">Cookies de marketing</option>
                  <option value="Perfilado comercial">Perfilado comercial</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Estado</label>
                <select
                  value={formData.granted.toString()}
                  onChange={(e) => setFormData({ ...formData, granted: e.target.value === "true" })}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="true">Concedido</option>
                  <option value="false">Denegado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Origen</label>
                <select
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="">Seleccionar origen</option>
                  <option value="Web form">Formulario web</option>
                  <option value="Landing page">Landing page</option>
                  <option value="Call center">Call center</option>
                  <option value="Email campaign">Campaña email</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Presencial">Presencial</option>
                  <option value="Terceros">Terceros</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">IP (opcional)</label>
                <input
                  type="text"
                  value={formData.ip}
                  onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="192.168.1.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Evidencia</label>
                <textarea
                  value={formData.evidence}
                  onChange={(e) => setFormData({ ...formData, evidence: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 h-20"
                  placeholder="Descripción de la evidencia del consentimiento..."
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
                  Crear Consentimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="font-medium">
            Consentimientos{subject && ` para "${subject}"`}
          </h3>
        </div>
        
        {loading ? (
          <div className="p-4 text-center">Cargando consentimientos...</div>
        ) : error ? (
          <div className="p-4 text-red-600">{error}</div>
        ) : !subject ? (
          <div className="p-4 text-center text-gray-500">
            Busque por nombre del interesado para ver sus consentimientos
          </div>
        ) : consents.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No se encontraron consentimientos para "{subject}"
          </div>
        ) : (
          <div className="divide-y">
            {consents.map((consent) => (
              <div key={consent.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{consent.purpose}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      consent.granted && !consent.revokedAt
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {consent.granted && !consent.revokedAt ? "Concedido" : "Revocado/Denegado"}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    ID: {consent.id}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-gray-500">Fecha:</span>
                    <div>{formatDateTime(consent.at)}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Por:</span>
                    <div>{consent.by}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Origen:</span>
                    <div>{consent.origin || "-"}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">IP:</span>
                    <div>{consent.ip || "-"}</div>
                  </div>
                </div>

                {consent.evidence && (
                  <div className="mb-3">
                    <span className="text-gray-500 text-sm">Evidencia:</span>
                    <p className="text-sm mt-1 bg-gray-50 p-2 rounded">{consent.evidence}</p>
                  </div>
                )}

                {consent.revokedAt && (
                  <div className="mb-3 bg-red-50 p-2 rounded">
                    <span className="text-red-700 font-medium text-sm">
                      Revocado el {formatDateTime(consent.revokedAt)}
                    </span>
                    {consent.revokedReason && (
                      <p className="text-red-600 text-sm mt-1">Motivo: {consent.revokedReason}</p>
                    )}
                  </div>
                )}

                <div className="flex space-x-2">
                  {consent.granted && !consent.revokedAt && (
                    <button
                      onClick={() => handleRevoke(consent.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Revocar Consentimiento
                    </button>
                  )}
                  <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                    Ver Timeline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-900 mb-2">Mejores Prácticas</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Registre siempre la evidencia del consentimiento (formulario, email, grabación)</li>
          <li>• Conserve la IP y timestamp cuando sea posible</li>
          <li>• Documente el origen y método de obtención</li>
          <li>• Facilite la revocación con el mismo nivel de facilidad que la concesión</li>
          <li>• Mantenga un registro cronológico de cambios</li>
        </ul>
      </div>
    </div>
  );
}