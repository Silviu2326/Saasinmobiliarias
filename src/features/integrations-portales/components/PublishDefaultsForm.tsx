import { useState } from "react";
import type { PublishDefaults } from "../types";
import { renderTemplate, generateSampleProperty } from "../utils";

interface PublishDefaultsFormProps {
  portalId: string;
  defaults: PublishDefaults;
  onUpdate: (defaults: PublishDefaults) => void;
}

const PublishDefaultsForm = ({ portalId, defaults, onUpdate }: PublishDefaultsFormProps) => {
  const [formData, setFormData] = useState(defaults);
  const [showPreview, setShowPreview] = useState(false);
  const sampleProperty = generateSampleProperty();

  const handleUpdate = (field: string, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onUpdate(updated);
  };

  const titlePreview = renderTemplate(formData.titleTpl, sampleProperty);
  const descPreview = renderTemplate(formData.descTpl, sampleProperty);

  return (
    <div className="space-y-6">
      {/* Templates */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Plantillas de Publicación</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plantilla de Título
            </label>
            <textarea
              value={formData.titleTpl}
              onChange={(e) => handleUpdate("titleTpl", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="{{propertyType}} de {{numRooms}} habitaciones en {{address}}"
            />
            <p className="text-xs text-gray-500 mt-1">
              Variables disponibles: {"{{address}}, {{sqm}}, {{numRooms}}, {{price}}, {{propertyType}}, {{features}}"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plantilla de Descripción
            </label>
            <textarea
              value={formData.descTpl}
              onChange={(e) => handleUpdate("descTpl", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="{{description}} Superficie: {{sqm}}m². Características: {{features}}."
            />
          </div>
        </div>

        <button
          onClick={() => setShowPreview(!showPreview)}
          className="mt-4 px-4 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
        >
          {showPreview ? "Ocultar" : "Ver"} Vista Previa
        </button>

        {showPreview && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md border-l-4 border-blue-500">
            <h4 className="font-medium text-gray-900 mb-2">Vista Previa:</h4>
            <div className="space-y-2">
              <div>
                <strong>Título:</strong> {titlePreview}
              </div>
              <div>
                <strong>Descripción:</strong> {descPreview}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Price Policy */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Política de Precios</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Moneda
            </label>
            <select
              value={formData.pricePolicy.currency}
              onChange={(e) => handleUpdate("pricePolicy", { 
                ...formData.pricePolicy, 
                currency: e.target.value 
              })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Redondeo
            </label>
            <select
              value={formData.pricePolicy.rounding || 1000}
              onChange={(e) => handleUpdate("pricePolicy", { 
                ...formData.pricePolicy, 
                rounding: Number(e.target.value) 
              })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value={1}>Sin redondeo</option>
              <option value={100}>100€</option>
              <option value={1000}>1.000€</option>
              <option value={5000}>5.000€</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Margen (%)
            </label>
            <input
              type="number"
              min="-50"
              max="100"
              value={formData.pricePolicy.marginPct || 0}
              onChange={(e) => handleUpdate("pricePolicy", { 
                ...formData.pricePolicy, 
                marginPct: Number(e.target.value) 
              })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Photos Policy */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Política de Fotos</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mínimo de fotos
            </label>
            <input
              type="number"
              min="0"
              max="50"
              value={formData.photosPolicy.min || 3}
              onChange={(e) => handleUpdate("photosPolicy", { 
                ...formData.photosPolicy, 
                min: Number(e.target.value) 
              })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Máximo de fotos
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={formData.photosPolicy.max || 20}
              onChange={(e) => handleUpdate("photosPolicy", { 
                ...formData.photosPolicy, 
                max: Number(e.target.value) 
              })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="col-span-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.photosPolicy.watermark || false}
                onChange={(e) => handleUpdate("photosPolicy", { 
                  ...formData.photosPolicy, 
                  watermark: e.target.checked 
                })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Aplicar marca de agua</span>
            </label>
          </div>
        </div>
      </div>

      {/* Contact & Visibility */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Contacto y Visibilidad</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Teléfono de contacto
            </label>
            <input
              type="tel"
              value={formData.contactPhone || ""}
              onChange={(e) => handleUpdate("contactPhone", e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="+34 900 123 456"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Visibilidad
            </label>
            <select
              value={formData.visibility}
              onChange={(e) => handleUpdate("visibility", e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="public">Público</option>
              <option value="private">Privado</option>
            </select>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.autoRenew || false}
                onChange={(e) => handleUpdate("autoRenew", e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Renovación automática</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublishDefaultsForm;