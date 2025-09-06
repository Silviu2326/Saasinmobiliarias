import { useState } from "react";
import { useRopa } from "../hooks";
import { formatDate, exportToCsv } from "../utils";
import { activityRecordSchema } from "../schema";

const DATA_CATEGORIES = [
  "Identificación",
  "Contacto",
  "Económicos",
  "Transacciones",
  "Navegación",
  "Preferencias",
  "Categorías especiales",
  "Judiciales",
];

const DATA_SUBJECTS = [
  "Clientes",
  "Potenciales clientes",
  "Empleados",
  "Proveedores",
  "Visitantes web",
  "Propietarios",
  "Inquilinos",
];

const LEGAL_BASES = [
  "Consentimiento",
  "Ejecución de contrato",
  "Obligación legal",
  "Interés vital",
  "Misión de interés público",
  "Interés legítimo",
];

export function RoPA() {
  const { records, loading, error, createRecord, updateRecord, deleteRecord, exportRopa } = useRopa();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    purpose: "",
    legalBase: "",
    dataCategories: [] as string[],
    dataSubjects: [] as string[],
    recipients: [] as string[],
    retention: "",
    safeguards: "",
    intlTransfers: false,
    transferDetails: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      purpose: "",
      legalBase: "",
      dataCategories: [],
      dataSubjects: [],
      recipients: [],
      retention: "",
      safeguards: "",
      intlTransfers: false,
      transferDetails: "",
    });
    setEditingId(null);
  };

  const handleEdit = (record: any) => {
    setFormData({
      name: record.name,
      purpose: record.purpose,
      legalBase: record.legalBase,
      dataCategories: record.dataCategories,
      dataSubjects: record.dataSubjects,
      recipients: record.recipients,
      retention: record.retention,
      safeguards: record.safeguards || "",
      intlTransfers: record.intlTransfers || false,
      transferDetails: record.transferDetails || "",
    });
    setEditingId(record.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validated = activityRecordSchema.parse(formData);
      
      if (editingId) {
        await updateRecord(editingId, validated);
      } else {
        await createRecord(validated);
      }
      
      resetForm();
      setShowForm(false);
    } catch (err: any) {
      console.error("Error al guardar registro:", err.issues || err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Está seguro de que desea eliminar este registro de actividad?")) {
      try {
        await deleteRecord(id);
      } catch (err) {
        console.error("Error al eliminar:", err);
      }
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

  const handleRecipientsChange = (value: string) => {
    const recipients = value.split(",").map(r => r.trim()).filter(Boolean);
    setFormData({ ...formData, recipients });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Registro de Actividades de Tratamiento (RoPA)</h2>
          <p className="text-sm text-gray-600">
            Registro detallado de todas las actividades de tratamiento según Art. 30 RGPD
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={exportRopa}
            disabled={records.length === 0}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            Exportar RoPA
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Nueva Actividad
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingId ? "Editar" : "Nueva"} Actividad de Tratamiento
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nombre de la Actividad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Ej: Gestión de clientes"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Base Jurídica <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.legalBase}
                    onChange={(e) => setFormData({ ...formData, legalBase: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    required
                  >
                    <option value="">Seleccionar base jurídica</option>
                    {LEGAL_BASES.map(base => (
                      <option key={base} value={base}>{base}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Finalidad <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 h-20"
                  placeholder="Descripción detallada de la finalidad del tratamiento..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
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
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Categorías de Interesados <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-1 max-h-32 overflow-y-auto border rounded-md p-2">
                    {DATA_SUBJECTS.map(subject => (
                      <label key={subject} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.dataSubjects.includes(subject)}
                          onChange={(e) => handleArrayChange("dataSubjects", subject, e.target.checked)}
                        />
                        <span className="text-sm">{subject}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Destinatarios
                </label>
                <input
                  type="text"
                  value={formData.recipients.join(", ")}
                  onChange={(e) => handleRecipientsChange(e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="Equipo comercial, Administración (separar por comas)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Período de Conservación <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.retention}
                  onChange={(e) => setFormData({ ...formData, retention: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="Ej: 5 años desde fin de relación contractual"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Medidas de Seguridad
                </label>
                <textarea
                  value={formData.safeguards}
                  onChange={(e) => setFormData({ ...formData, safeguards: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 h-20"
                  placeholder="Medidas técnicas y organizativas de seguridad aplicadas..."
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.intlTransfers}
                    onChange={(e) => setFormData({ ...formData, intlTransfers: e.target.checked })}
                  />
                  <span className="text-sm font-medium">Transferencias Internacionales</span>
                </label>
                {formData.intlTransfers && (
                  <input
                    type="text"
                    value={formData.transferDetails}
                    onChange={(e) => setFormData({ ...formData, transferDetails: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="País de destino y garantías aplicadas (Cláusulas contractuales tipo, etc.)"
                  />
                )}
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
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  {editingId ? "Actualizar" : "Crear"} Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="font-medium">Registros de Actividades de Tratamiento</h3>
        </div>
        
        {loading ? (
          <div className="p-4 text-center">Cargando registros...</div>
        ) : error ? (
          <div className="p-4 text-red-600">{error}</div>
        ) : records.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No hay registros de actividad</div>
        ) : (
          <div className="divide-y">
            {records.map((record) => (
              <div key={record.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{record.name}</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      v{record.version}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatDate(record.updatedAt)} por {record.updatedBy}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-gray-500">Base Jurídica:</span>
                    <div className="font-medium">{record.legalBase}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Categorías de Datos:</span>
                    <div>{record.dataCategories.join(", ")}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Interesados:</span>
                    <div>{record.dataSubjects.join(", ")}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Conservación:</span>
                    <div>{record.retention}</div>
                  </div>
                </div>

                <div className="mb-3">
                  <span className="text-gray-500 text-sm">Finalidad:</span>
                  <p className="text-sm mt-1">{record.purpose}</p>
                </div>

                {record.recipients.length > 0 && (
                  <div className="mb-3">
                    <span className="text-gray-500 text-sm">Destinatarios:</span>
                    <p className="text-sm mt-1">{record.recipients.join(", ")}</p>
                  </div>
                )}

                {record.intlTransfers && (
                  <div className="mb-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                      Transferencias Internacionales
                    </span>
                    {record.transferDetails && (
                      <p className="text-sm mt-1 text-orange-700">{record.transferDetails}</p>
                    )}
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(record)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(record.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Eliminar
                  </button>
                  <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                    Ver Historial
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900 mb-2">Requisitos Art. 30 RGPD</h4>
        <div className="grid grid-cols-2 gap-4 text-sm text-green-800">
          <ul className="space-y-1">
            <li>✓ Nombre y datos de contacto del responsable</li>
            <li>✓ Fines del tratamiento</li>
            <li>✓ Categorías de interesados y datos personales</li>
            <li>✓ Categorías de destinatarios</li>
          </ul>
          <ul className="space-y-1">
            <li>✓ Plazos previstos para supresión</li>
            <li>✓ Descripción general medidas de seguridad</li>
            <li>✓ Transferencias internacionales (si aplica)</li>
            <li>✓ Base jurídica del tratamiento</li>
          </ul>
        </div>
      </div>
    </div>
  );
}