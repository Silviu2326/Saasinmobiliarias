import React, { useState } from 'react';
import { Property, PropertyFormData } from '../types';
import { validateProperty, sanitizePropertyData, ValidationResult } from '../schema';

interface PropertyFormProps {
  property?: Property;
  onSubmit: (data: PropertyFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function PropertyForm({ property, onSubmit, onCancel, isLoading = false }: PropertyFormProps) {
  const [formData, setFormData] = useState<PropertyFormData>({
    titulo: property?.titulo || '',
    direccion: property?.direccion || '',
    ciudad: property?.ciudad || 'Madrid',
    coordenadas: property?.coordenadas || undefined,
    tipo: property?.tipo || 'piso',
    precio: property?.precio || 0,
    m2: property?.m2 || 0,
    habitaciones: property?.habitaciones || 0,
    banos: property?.banos || 0,
    estado: property?.estado || 'borrador',
    exclusiva: property?.exclusiva || false,
    agente: property?.agente || '',
    descripcion: property?.descripcion || '',
    caracteristicas: property?.caracteristicas || []
  });

  const [validation, setValidation] = useState<ValidationResult>({ isValid: true, errors: {} });
  const [newCaracteristica, setNewCaracteristica] = useState('');

  const handleChange = (field: keyof PropertyFormData, value: any) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    
    // Validate on change
    const validationResult = validateProperty(updatedData);
    setValidation(validationResult);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const sanitizedData = sanitizePropertyData(formData);
    const validationResult = validateProperty(sanitizedData);
    
    setValidation(validationResult);
    
    if (validationResult.isValid) {
      onSubmit(sanitizedData as PropertyFormData);
    }
  };

  const addCaracteristica = () => {
    const caracteristica = newCaracteristica.trim();
    if (caracteristica && !formData.caracteristicas?.includes(caracteristica)) {
      handleChange('caracteristicas', [...(formData.caracteristicas || []), caracteristica]);
      setNewCaracteristica('');
    }
  };

  const removeCaracteristica = (caracteristica: string) => {
    handleChange('caracteristicas', formData.caracteristicas?.filter(c => c !== caracteristica) || []);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCaracteristica();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información básica */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Información Básica</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
              Título *
            </label>
            <input
              type="text"
              id="titulo"
              value={formData.titulo}
              onChange={(e) => handleChange('titulo', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                validation.errors.titulo ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Ej: Piso luminoso en el centro"
            />
            {validation.errors.titulo && (
              <p className="mt-1 text-sm text-red-600">{validation.errors.titulo}</p>
            )}
          </div>

          <div>
            <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de inmueble *
            </label>
            <select
              id="tipo"
              value={formData.tipo}
              onChange={(e) => handleChange('tipo', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                validation.errors.tipo ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="piso">Piso</option>
              <option value="atico">Ático</option>
              <option value="duplex">Dúplex</option>
              <option value="casa">Casa</option>
              <option value="chalet">Chalet</option>
              <option value="estudio">Estudio</option>
              <option value="loft">Loft</option>
              <option value="local">Local</option>
              <option value="oficina">Oficina</option>
            </select>
            {validation.errors.tipo && (
              <p className="mt-1 text-sm text-red-600">{validation.errors.tipo}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">
              Dirección *
            </label>
            <input
              type="text"
              id="direccion"
              value={formData.direccion}
              onChange={(e) => handleChange('direccion', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                validation.errors.direccion ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Calle, número, piso..."
            />
            {validation.errors.direccion && (
              <p className="mt-1 text-sm text-red-600">{validation.errors.direccion}</p>
            )}
          </div>

          <div>
            <label htmlFor="ciudad" className="block text-sm font-medium text-gray-700 mb-1">
              Ciudad *
            </label>
            <select
              id="ciudad"
              value={formData.ciudad}
              onChange={(e) => handleChange('ciudad', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                validation.errors.ciudad ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="Madrid">Madrid</option>
              <option value="Barcelona">Barcelona</option>
              <option value="Valencia">Valencia</option>
              <option value="Sevilla">Sevilla</option>
              <option value="Bilbao">Bilbao</option>
              <option value="Málaga">Málaga</option>
              <option value="Zaragoza">Zaragoza</option>
              <option value="Murcia">Murcia</option>
            </select>
            {validation.errors.ciudad && (
              <p className="mt-1 text-sm text-red-600">{validation.errors.ciudad}</p>
            )}
          </div>
        </div>

        {/* Coordenadas opcionales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="latitud" className="block text-sm font-medium text-gray-700 mb-1">
              Latitud (opcional)
            </label>
            <input
              type="number"
              id="latitud"
              step="any"
              value={formData.coordenadas?.lat || ''}
              onChange={(e) => handleChange('coordenadas', {
                ...formData.coordenadas,
                lat: e.target.value ? parseFloat(e.target.value) : undefined
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: 40.4168"
            />
          </div>

          <div>
            <label htmlFor="longitud" className="block text-sm font-medium text-gray-700 mb-1">
              Longitud (opcional)
            </label>
            <input
              type="number"
              id="longitud"
              step="any"
              value={formData.coordenadas?.lng || ''}
              onChange={(e) => handleChange('coordenadas', {
                ...formData.coordenadas,
                lng: e.target.value ? parseFloat(e.target.value) : undefined
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: -3.7038"
            />
          </div>
        </div>
      </div>

      {/* Características físicas */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Características</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="precio" className="block text-sm font-medium text-gray-700 mb-1">
              Precio (€) *
            </label>
            <input
              type="number"
              id="precio"
              value={formData.precio}
              onChange={(e) => handleChange('precio', parseFloat(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                validation.errors.precio ? 'border-red-300' : 'border-gray-300'
              }`}
              min="0"
            />
            {validation.errors.precio && (
              <p className="mt-1 text-sm text-red-600">{validation.errors.precio}</p>
            )}
          </div>

          <div>
            <label htmlFor="m2" className="block text-sm font-medium text-gray-700 mb-1">
              m² *
            </label>
            <input
              type="number"
              id="m2"
              value={formData.m2}
              onChange={(e) => handleChange('m2', parseFloat(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                validation.errors.m2 ? 'border-red-300' : 'border-gray-300'
              }`}
              min="1"
            />
            {validation.errors.m2 && (
              <p className="mt-1 text-sm text-red-600">{validation.errors.m2}</p>
            )}
          </div>

          <div>
            <label htmlFor="habitaciones" className="block text-sm font-medium text-gray-700 mb-1">
              Habitaciones
            </label>
            <input
              type="number"
              id="habitaciones"
              value={formData.habitaciones}
              onChange={(e) => handleChange('habitaciones', parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                validation.errors.habitaciones ? 'border-red-300' : 'border-gray-300'
              }`}
              min="0"
            />
            {validation.errors.habitaciones && (
              <p className="mt-1 text-sm text-red-600">{validation.errors.habitaciones}</p>
            )}
          </div>

          <div>
            <label htmlFor="banos" className="block text-sm font-medium text-gray-700 mb-1">
              Baños
            </label>
            <input
              type="number"
              id="banos"
              value={formData.banos}
              onChange={(e) => handleChange('banos', parseInt(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                validation.errors.banos ? 'border-red-300' : 'border-gray-300'
              }`}
              min="0"
            />
            {validation.errors.banos && (
              <p className="mt-1 text-sm text-red-600">{validation.errors.banos}</p>
            )}
          </div>
        </div>
      </div>

      {/* Estado y gestión */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Gestión</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
              Estado *
            </label>
            <select
              id="estado"
              value={formData.estado}
              onChange={(e) => handleChange('estado', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="borrador">Borrador</option>
              <option value="activo">Activo</option>
              <option value="vendido">Vendido</option>
              <option value="alquilado">Alquilado</option>
            </select>
          </div>

          <div>
            <label htmlFor="agente" className="block text-sm font-medium text-gray-700 mb-1">
              Agente responsable
            </label>
            <select
              id="agente"
              value={formData.agente}
              onChange={(e) => handleChange('agente', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Sin asignar</option>
              <option value="Ana García">Ana García</option>
              <option value="Carlos López">Carlos López</option>
              <option value="María Rodríguez">María Rodríguez</option>
              <option value="Juan Martín">Juan Martín</option>
              <option value="Laura Sánchez">Laura Sánchez</option>
            </select>
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="exclusiva"
            checked={formData.exclusiva}
            onChange={(e) => handleChange('exclusiva', e.target.checked)}
            className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
          />
          <label htmlFor="exclusiva" className="ml-2 text-sm text-gray-700">
            Inmueble en exclusiva
          </label>
        </div>
      </div>

      {/* Descripción */}
      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
          Descripción
        </label>
        <textarea
          id="descripcion"
          rows={4}
          value={formData.descripcion}
          onChange={(e) => handleChange('descripcion', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
            validation.errors.descripcion ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="Describe las características y ventajas del inmueble..."
        />
        {validation.errors.descripcion && (
          <p className="mt-1 text-sm text-red-600">{validation.errors.descripcion}</p>
        )}
      </div>

      {/* Características adicionales */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Características adicionales
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newCaracteristica}
            onChange={(e) => setNewCaracteristica(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Añadir característica..."
          />
          <button
            type="button"
            onClick={addCaracteristica}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Añadir
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.caracteristicas?.map((caracteristica, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
            >
              {caracteristica}
              <button
                type="button"
                onClick={() => removeCaracteristica(caracteristica)}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </span>
          ))}
        </div>
        {validation.errors.caracteristicas && (
          <p className="mt-1 text-sm text-red-600">{validation.errors.caracteristicas}</p>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end space-x-3 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading || !validation.isValid}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Guardando...
            </div>
          ) : (
            property ? 'Actualizar inmueble' : 'Crear inmueble'
          )}
        </button>
      </div>
    </form>
  );
}