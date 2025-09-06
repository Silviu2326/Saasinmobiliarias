import { useState } from "react";
import { useDataMap } from "../hooks";
import { dataMapEntrySchema } from "../schema";

const DATA_CATEGORIES = [
  "Identificación",
  "Contacto",
  "Económicos",
  "Transacciones",
  "Navegación",
  "Preferencias",
  "Biométricos",
  "Salud",
  "Judiciales",
];

const PURPOSES = [
  "Gestión comercial",
  "Marketing directo",
  "Análisis y estadísticas",
  "Atención al cliente",
  "Facturación",
  "Cumplimiento legal",
  "Seguridad",
  "Mejora del servicio",
];

const ACCESS_CONTROLS = [
  "Autenticación multifactor (MFA)",
  "Control de acceso basado en roles (RBAC)",
  "Cifrado de datos",
  "Logs de auditoría",
  "VPN obligatoria",
  "Firewall",
  "Antivirus",
  "Copias de seguridad cifradas",
];

export function DataMap() {
  const { entries, loading, error, createEntry } = useDataMap();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    system: "",
    description: "",
    dataCategories: [] as string[],
    purposes: [] as string[],
    processors: [] as string[],
    processorContracts: false,
    intlTransfers: false,
    transferMechanism: "",
    accessControls: [] as string[],
    dataOwner: "",
    technicalContact: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validated = dataMapEntrySchema.parse(formData);
      await createEntry(validated);
      setFormData({
        system: "",
        description: "",
        dataCategories: [],
        purposes: [],
        processors: [],
        processorContracts: false,
        intlTransfers: false,
        transferMechanism: "",
        accessControls: [],
        dataOwner: "",
        technicalContact: "",
      });
      setShowForm(false);
    } catch (err: any) {
      console.error("Error al crear entrada:", err.issues || err);
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

  const handleProcessorsChange = (value: string) => {
    const processors = value.split(",").map(p => p.trim()).filter(Boolean);
    setFormData({ ...formData, processors });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Mapa de Datos</h2>
          <p className="text-sm text-gray-600">
            Matriz de sistemas, categorías de datos, finalidades y transferencias
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Nuevo Sistema
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Nuevo Sistema en Mapa de Datos</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Sistema <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.system}
                    onChange={(e) => setFormData({ ...formData, system: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="CRM Principal, Portal Web, App Móvil"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Responsable de Datos</label>
                  <input
                    type="text"
                    value={formData.dataOwner}
                    onChange={(e) => setFormData({ ...formData, dataOwner: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Director Comercial, CTO"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 h-20"
                  placeholder="Descripción del sistema y su función en la organización..."
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
                    Finalidades <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-1 max-h-32 overflow-y-auto border rounded-md p-2">
                    {PURPOSES.map(purpose => (
                      <label key={purpose} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.purposes.includes(purpose)}
                          onChange={(e) => handleArrayChange("purposes", purpose, e.target.checked)}
                        />
                        <span className="text-sm">{purpose}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Encargados/Proveedores
                </label>
                <input
                  type="text"
                  value={formData.processors.join(", ")}
                  onChange={(e) => handleProcessorsChange(e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="Salesforce, AWS, Google Analytics (separar por comas)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Controles de Acceso</label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                  {ACCESS_CONTROLS.map(control => (
                    <label key={control} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.accessControls.includes(control)}
                        onChange={(e) => handleArrayChange("accessControls", control, e.target.checked)}
                      />
                      <span className="text-sm">{control}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Contacto Técnico</label>
                  <input
                    type="text"
                    value={formData.technicalContact}
                    onChange={(e) => setFormData({ ...formData, technicalContact: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="admin@empresa.com, IT Manager"
                  />
                </div>
                <div>
                  <label className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      checked={formData.processorContracts}
                      onChange={(e) => setFormData({ ...formData, processorContracts: e.target.checked })}
                    />
                    <span className="text-sm font-medium">Contratos con encargados firmados</span>
                  </label>
                </div>
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
                    value={formData.transferMechanism}
                    onChange={(e) => setFormData({ ...formData, transferMechanism: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Decisión de adecuación, Cláusulas contractuales tipo, BCR"
                  />
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
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
                  Crear Entrada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="font-medium">Sistemas y Flujos de Datos</h3>
        </div>
        
        {loading ? (
          <div className="p-4 text-center">Cargando mapa de datos...</div>
        ) : error ? (
          <div className="p-4 text-red-600">{error}</div>
        ) : entries.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No hay sistemas registrados en el mapa de datos</div>
        ) : (
          <div className="divide-y">
            {entries.map((entry) => (
              <div key={entry.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-lg">{entry.system}</span>
                    {entry.intlTransfers && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        Transferencias Int.
                      </span>
                    )}
                    {entry.processorContracts && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Contratos OK
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    ID: {entry.id}
                  </div>
                </div>

                {entry.description && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-700">{entry.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-gray-500">Responsable:</span>
                    <div>{entry.dataOwner || "Sin asignar"}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Contacto técnico:</span>
                    <div>{entry.technicalContact || "Sin asignar"}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Encargados:</span>
                    <div>{entry.processors?.length || 0}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Controles:</span>
                    <div>{entry.accessControls?.length || 0}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <span className="text-gray-500 text-sm font-medium">Categorías de Datos:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {entry.dataCategories.map((category) => (
                        <span key={category} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm font-medium">Finalidades:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {entry.purposes.map((purpose) => (
                        <span key={purpose} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          {purpose}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {entry.processors && entry.processors.length > 0 && (
                  <div className="mb-3">
                    <span className="text-gray-500 text-sm font-medium">Encargados/Proveedores:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {entry.processors.map((processor) => (
                        <span key={processor} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          {processor}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {entry.accessControls && entry.accessControls.length > 0 && (
                  <div className="mb-3">
                    <span className="text-gray-500 text-sm font-medium">Controles de Seguridad:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {entry.accessControls.map((control) => (
                        <span key={control} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {control}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {entry.intlTransfers && (
                  <div className="mb-3 bg-orange-50 p-2 rounded">
                    <span className="text-orange-700 font-medium text-sm">
                      Transferencias Internacionales
                    </span>
                    {entry.transferMechanism && (
                      <p className="text-orange-600 text-sm mt-1">
                        Mecanismo: {entry.transferMechanism}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Editar
                  </button>
                  <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                    Ver Flujo
                  </button>
                  <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                    Auditar Controles
                  </button>
                  <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                    Exportar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-4">
          <h4 className="font-medium mb-3">Resumen del Mapa</h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Total sistemas:</span>
              <span className="font-medium">{entries.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Con transferencias int.:</span>
              <span className="font-medium text-orange-600">
                {entries.filter(e => e.intlTransfers).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Con contratos firmados:</span>
              <span className="font-medium text-green-600">
                {entries.filter(e => e.processorContracts).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Encargados totales:</span>
              <span className="font-medium">
                {entries.reduce((acc, e) => acc + (e.processors?.length || 0), 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
          <h4 className="font-medium text-cyan-900 mb-2">Beneficios del Mapa</h4>
          <ul className="text-sm text-cyan-800 space-y-1">
            <li>• Visibilidad completa de flujos de datos</li>
            <li>• Identificación de riesgos y vulnerabilidades</li>
            <li>• Cumplimiento de obligaciones RGPD</li>
            <li>• Gestión eficiente de encargados</li>
            <li>• Base para evaluaciones de impacto</li>
            <li>• Auditorías de seguridad simplificadas</li>
          </ul>
        </div>
      </div>
    </div>
  );
}