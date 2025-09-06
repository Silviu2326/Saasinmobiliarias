import { useState } from "react";
import { useBreaches } from "../hooks";
import { formatDate, riskColor, statusColor } from "../utils";
import { breachSchema } from "../schema";

export function BreachReports() {
  const { breaches, loading, error, createBreach, updateBreach } = useBreaches();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: "",
    discoveryDate: "",
    systems: [] as string[],
    dataCategories: [] as string[],
    affected: 0,
    risk: "low" as "low" | "medium" | "high",
    description: "",
    measures: "",
    notifiedAEPD: false,
    notifiedAEPDDate: "",
    notifiedSubjects: false,
    notifiedSubjectsDate: "",
    assignedTo: "",
  });

  const SYSTEMS = [
    "CRM",
    "Email Marketing",
    "Web Portal",
    "Base de Datos",
    "Servidor Web",
    "Sistema de Backup",
    "Aplicación Móvil",
  ];

  const DATA_CATEGORIES = [
    "Identificación",
    "Contacto",
    "Económicos",
    "Datos de salud",
    "Datos biométricos",
    "Datos de ubicación",
    "Datos judiciales",
  ];

  const resetForm = () => {
    setFormData({
      date: "",
      discoveryDate: "",
      systems: [],
      dataCategories: [],
      affected: 0,
      risk: "low",
      description: "",
      measures: "",
      notifiedAEPD: false,
      notifiedAEPDDate: "",
      notifiedSubjects: false,
      notifiedSubjectsDate: "",
      assignedTo: "",
    });
    setEditingId(null);
  };

  const handleEdit = (breach: any) => {
    setFormData({
      date: breach.date?.split('T')[0] || "",
      discoveryDate: breach.discoveryDate?.split('T')[0] || "",
      systems: breach.systems || [],
      dataCategories: breach.dataCategories || [],
      affected: breach.affected || 0,
      risk: breach.risk || "low",
      description: breach.description || "",
      measures: breach.measures || "",
      notifiedAEPD: breach.notifiedAEPD || false,
      notifiedAEPDDate: breach.notifiedAEPDDate?.split('T')[0] || "",
      notifiedSubjects: breach.notifiedSubjects || false,
      notifiedSubjectsDate: breach.notifiedSubjectsDate?.split('T')[0] || "",
      assignedTo: breach.assignedTo || "",
    });
    setEditingId(breach.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        date: formData.date,
        discoveryDate: formData.discoveryDate,
        notifiedAEPDDate: formData.notifiedAEPDDate || undefined,
        notifiedSubjectsDate: formData.notifiedSubjectsDate || undefined,
      };

      const validated = breachSchema.parse(submitData);
      
      if (editingId) {
        await updateBreach(editingId, validated);
      } else {
        await createBreach(validated);
      }
      
      resetForm();
      setShowForm(false);
    } catch (err: any) {
      console.error("Error al guardar brecha:", err.issues || err);
    }
  };

  const handleArrayChange = (field: keyof typeof formData, value: string, checked: boolean) => {
    const currentArray = formData[field] as string[];
    if (checked) {
      setFormData({
        ...formData,
        [field]: [...currentArray, value],
      });
    } else {
      setFormData({
        ...formData,
        [field]: currentArray.filter((item) => item !== value),
      });
    }
  };

  const getTimeToNotify = (date: string, risk: string) => {
    const breachDate = new Date(date);
    const hoursLimit = risk === "high" ? 72 : 72; // Siempre 72h para AEPD
    const deadline = new Date(breachDate.getTime() + hoursLimit * 60 * 60 * 1000);
    const now = new Date();
    const hoursLeft = Math.max(0, Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60)));
    return { deadline, hoursLeft, isOverdue: now > deadline };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Registro de Brechas de Seguridad</h2>
          <p className="text-sm text-gray-600">
            Gestión de incidentes de seguridad y notificaciones a AEPD según RGPD
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
        >
          Reportar Brecha
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingId ? "Editar" : "Nueva"} Brecha de Seguridad
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Fecha del Incidente <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Fecha de Descubrimiento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.discoveryDate}
                    onChange={(e) => setFormData({ ...formData, discoveryDate: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Sistemas Afectados <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-1 max-h-32 overflow-y-auto border rounded-md p-2">
                    {SYSTEMS.map(system => (
                      <label key={system} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.systems.includes(system)}
                          onChange={(e) => handleArrayChange("systems", system, e.target.checked)}
                        />
                        <span className="text-sm">{system}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Categorías de Datos <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-1 max-h-32 overflow-y-auto border rounded-md p-2">
                    {DATA_CATEGORIES.map(category => (
                      <label key={category} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.dataCategories.includes(category)}
                          onChange={(e) => handleArrayChange("dataCategories", category, e.target.checked)}
                        />
                        <span className="text-sm">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Personas Afectadas <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.affected}
                    onChange={(e) => setFormData({ ...formData, affected: parseInt(e.target.value) || 0 })}
                    className="w-full border rounded-md px-3 py-2"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nivel de Riesgo <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.risk}
                    onChange={(e) => setFormData({ ...formData, risk: e.target.value as any })}
                    className="w-full border rounded-md px-3 py-2"
                    required
                  >
                    <option value="low">Bajo</option>
                    <option value="medium">Medio</option>
                    <option value="high">Alto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Asignado a</label>
                  <input
                    type="text"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Responsable del caso"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Descripción del Incidente <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 h-24"
                  placeholder="Descripción detallada del incidente de seguridad..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Medidas Adoptadas</label>
                <textarea
                  value={formData.measures}
                  onChange={(e) => setFormData({ ...formData, measures: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 h-24"
                  placeholder="Medidas de contención y remediación adoptadas..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.notifiedAEPD}
                      onChange={(e) => setFormData({ ...formData, notifiedAEPD: e.target.checked })}
                    />
                    <span className="text-sm font-medium">Notificado a AEPD</span>
                  </label>
                  {formData.notifiedAEPD && (
                    <input
                      type="date"
                      value={formData.notifiedAEPDDate}
                      onChange={(e) => setFormData({ ...formData, notifiedAEPDDate: e.target.value })}
                      className="w-full border rounded-md px-3 py-2"
                      placeholder="Fecha de notificación"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.notifiedSubjects}
                      onChange={(e) => setFormData({ ...formData, notifiedSubjects: e.target.checked })}
                    />
                    <span className="text-sm font-medium">Notificado a Interesados</span>
                  </label>
                  {formData.notifiedSubjects && (
                    <input
                      type="date"
                      value={formData.notifiedSubjectsDate}
                      onChange={(e) => setFormData({ ...formData, notifiedSubjectsDate: e.target.value })}
                      className="w-full border rounded-md px-3 py-2"
                      placeholder="Fecha de notificación"
                    />
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                >
                  {editingId ? "Actualizar" : "Reportar"} Brecha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="font-medium">Brechas de Seguridad Reportadas</h3>
        </div>
        
        {loading ? (
          <div className="p-4 text-center">Cargando brechas...</div>
        ) : error ? (
          <div className="p-4 text-red-600">{error}</div>
        ) : breaches.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No hay brechas de seguridad reportadas</div>
        ) : (
          <div className="divide-y">
            {breaches.map((breach) => {
              const timeInfo = getTimeToNotify(breach.date, breach.risk);
              
              return (
                <div key={breach.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Brecha #{breach.id.split('-')[1]}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${riskColor(breach.risk)}`}>
                        Riesgo {breach.risk === "low" ? "Bajo" : breach.risk === "medium" ? "Medio" : "Alto"}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(breach.status)}`}>
                        {breach.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatDate(breach.date)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-gray-500">Sistemas:</span>
                      <div>{breach.systems.join(", ")}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Afectados:</span>
                      <div className="font-medium">{breach.affected} personas</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Descubierto:</span>
                      <div>{formatDate(breach.discoveryDate)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Responsable:</span>
                      <div>{breach.assignedTo || "Sin asignar"}</div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <span className="text-gray-500 text-sm">Descripción:</span>
                    <p className="text-sm mt-1">{breach.description}</p>
                  </div>

                  {breach.measures && (
                    <div className="mb-3">
                      <span className="text-gray-500 text-sm">Medidas adoptadas:</span>
                      <p className="text-sm mt-1">{breach.measures}</p>
                    </div>
                  )}

                  <div className="mb-3">
                    <span className="text-gray-500 text-sm">Categorías de datos:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {breach.dataCategories.map((category) => (
                        <span key={category} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className={`p-2 rounded ${
                      breach.notifiedAEPD ? "bg-green-50 border border-green-200" : 
                      timeInfo.isOverdue ? "bg-red-50 border border-red-200" : "bg-yellow-50 border border-yellow-200"
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Notificación AEPD</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          breach.notifiedAEPD ? "bg-green-100 text-green-800" : 
                          timeInfo.isOverdue ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {breach.notifiedAEPD ? "Completado" : timeInfo.isOverdue ? "VENCIDO" : "Pendiente"}
                        </span>
                      </div>
                      {breach.notifiedAEPD && breach.notifiedAEPDDate && (
                        <div className="text-xs text-green-700 mt-1">
                          Notificado: {formatDate(breach.notifiedAEPDDate)}
                        </div>
                      )}
                      {!breach.notifiedAEPD && (
                        <div className="text-xs mt-1">
                          <div>Límite: {formatDate(timeInfo.deadline.toISOString())}</div>
                          {!timeInfo.isOverdue && (
                            <div className="text-orange-600">Quedan {timeInfo.hoursLeft}h</div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className={`p-2 rounded ${
                      breach.notifiedSubjects ? "bg-green-50 border border-green-200" : "bg-gray-50 border border-gray-200"
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Notificación Interesados</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          breach.notifiedSubjects ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}>
                          {breach.notifiedSubjects ? "Completado" : "Pendiente"}
                        </span>
                      </div>
                      {breach.notifiedSubjects && breach.notifiedSubjectsDate && (
                        <div className="text-xs text-green-700 mt-1">
                          Notificado: {formatDate(breach.notifiedSubjectsDate)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(breach)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Editar
                    </button>
                    <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                      Notificar AEPD
                    </button>
                    <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                      Notificar Interesados
                    </button>
                    <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                      Ver Timeline
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h4 className="font-medium text-red-900 mb-2">Obligaciones Legales</h4>
        <div className="grid grid-cols-2 gap-4 text-sm text-red-800">
          <ul className="space-y-1">
            <li>• <strong>72 horas</strong> para notificar a AEPD</li>
            <li>• Sin demora indebida a los interesados (si alto riesgo)</li>
            <li>• Registro detallado de todos los incidentes</li>
            <li>• Medidas inmediatas de contención</li>
          </ul>
          <ul className="space-y-1">
            <li>• Evaluación del riesgo para derechos y libertades</li>
            <li>• Documentación de causas y consecuencias</li>
            <li>• Medidas adoptadas y planificadas</li>
            <li>• Cooperación con autoridades de control</li>
          </ul>
        </div>
      </div>
    </div>
  );
}