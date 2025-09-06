import { useState } from "react";
import type { FieldMap } from "../types";
import { validateMappings } from "../utils";

interface MappingEditorProps {
  portalId: string;
  mappings: FieldMap[];
  onUpdate: (mappings: FieldMap[]) => void;
}

const MappingEditor = ({ portalId, mappings, onUpdate }: MappingEditorProps) => {
  const [localMappings, setLocalMappings] = useState<FieldMap[]>(mappings);
  const validation = validateMappings(localMappings);

  const commonFields = [
    { from: "type", to: "propertyType", required: true, label: "Tipo de propiedad" },
    { from: "rooms", to: "numRooms", label: "Número de habitaciones" },
    { from: "location", to: "address", required: true, label: "Dirección" },
    { from: "cost", to: "price", required: true, label: "Precio" },
    { from: "area", to: "sqm", label: "Superficie (m²)" },
    { from: "floor", to: "floor", label: "Planta" },
    { from: "bathrooms", to: "bathrooms", label: "Baños" },
    { from: "year", to: "year", label: "Año construcción" },
    { from: "description", to: "description", label: "Descripción" },
    { from: "features", to: "features", label: "Características" }
  ];

  const addMapping = () => {
    const newMapping: FieldMap = {
      from: "",
      to: "",
      required: false
    };
    const updated = [...localMappings, newMapping];
    setLocalMappings(updated);
    onUpdate(updated);
  };

  const updateMapping = (index: number, field: keyof FieldMap, value: any) => {
    const updated = [...localMappings];
    (updated[index] as any)[field] = value;
    setLocalMappings(updated);
    onUpdate(updated);
  };

  const removeMapping = (index: number) => {
    const updated = localMappings.filter((_, i) => i !== index);
    setLocalMappings(updated);
    onUpdate(updated);
  };

  const addCommonField = (commonField: { from: string; to: string; required?: boolean }) => {
    const exists = localMappings.some(m => m.to === commonField.to);
    if (!exists) {
      const newMapping: FieldMap = {
        from: commonField.from,
        to: commonField.to,
        required: commonField.required || false
      };
      const updated = [...localMappings, newMapping];
      setLocalMappings(updated);
      onUpdate(updated);
    }
  };

  return (
    <div className="space-y-6">
      {/* Validation Alerts */}
      {(validation.missing.length > 0 || validation.invalid.length > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-800">
            <strong>Errores de validación:</strong>
            {validation.missing.length > 0 && (
              <div>• Campos obligatorios faltantes: {validation.missing.join(", ")}</div>
            )}
            {validation.invalid.length > 0 && (
              <div>• Mapeos inválidos: {validation.invalid.join(", ")}</div>
            )}
          </div>
        </div>
      )}

      {/* Quick Add Common Fields */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Campos Comunes</h3>
        <p className="text-sm text-gray-600 mb-4">
          Haz clic para agregar mapeos comunes rápidamente:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {commonFields.map((field) => {
            const exists = localMappings.some(m => m.to === field.to);
            return (
              <button
                key={field.to}
                onClick={() => addCommonField(field)}
                disabled={exists}
                className={`px-3 py-2 text-sm rounded-md border ${
                  exists
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : field.required
                    ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                    : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                }`}
              >
                {field.required && "⚠️ "}
                {field.label}
                {exists && " ✓"}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mappings Table */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Mapeos de Campos</h3>
          <button
            onClick={addMapping}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
          >
            ➕ Agregar Mapeo
          </button>
        </div>

        {localMappings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No hay mapeos configurados</p>
            <p className="text-sm">Usa los campos comunes de arriba o agrega uno personalizado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 text-sm font-medium text-gray-700">Campo Origen</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-700">Campo Destino</th>
                  <th className="text-center py-3 text-sm font-medium text-gray-700">Obligatorio</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-700">Transformación</th>
                  <th className="text-center py-3 text-sm font-medium text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {localMappings.map((mapping, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3">
                      <input
                        type="text"
                        value={mapping.from}
                        onChange={(e) => updateMapping(index, "from", e.target.value)}
                        placeholder="campo_origen"
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                    </td>
                    <td className="py-3">
                      <select
                        value={mapping.to}
                        onChange={(e) => updateMapping(index, "to", e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      >
                        <option value="">Seleccionar...</option>
                        <option value="propertyType">propertyType *</option>
                        <option value="address">address *</option>
                        <option value="price">price *</option>
                        <option value="numRooms">numRooms</option>
                        <option value="sqm">sqm</option>
                        <option value="floor">floor</option>
                        <option value="bathrooms">bathrooms</option>
                        <option value="year">year</option>
                        <option value="description">description</option>
                        <option value="features">features</option>
                      </select>
                    </td>
                    <td className="py-3 text-center">
                      <input
                        type="checkbox"
                        checked={mapping.required || false}
                        onChange={(e) => updateMapping(index, "required", e.target.checked)}
                        className="rounded border-gray-300 text-blue-600"
                      />
                    </td>
                    <td className="py-3">
                      <select
                        value={mapping.transform || ""}
                        onChange={(e) => updateMapping(index, "transform", e.target.value || undefined)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      >
                        <option value="">Sin transformar</option>
                        <option value="stringify">A string</option>
                        <option value="lowercase">Minúsculas</option>
                        <option value="uppercase">Mayúsculas</option>
                        <option value="truncate">Truncar</option>
                        <option value="enum_map">Mapeo enum</option>
                      </select>
                    </td>
                    <td className="py-3 text-center">
                      <button
                        onClick={() => removeMapping(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h4 className="font-medium text-gray-900 mb-2">Leyenda:</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <div>• <strong>Campo Origen:</strong> Nombre del campo en InmoFlow</div>
          <div>• <strong>Campo Destino:</strong> Nombre del campo en el portal (los marcados con * son obligatorios)</div>
          <div>• <strong>Obligatorio:</strong> Si está marcado, la sincronización fallará si el campo está vacío</div>
          <div>• <strong>Transformación:</strong> Cómo procesar el valor antes de enviarlo al portal</div>
        </div>
      </div>
    </div>
  );
};

export default MappingEditor;