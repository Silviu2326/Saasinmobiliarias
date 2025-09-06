import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Home,
  DollarSign,
  Bed,
  Bath,
  Filter,
  RotateCcw,
  Search,
  Building,
  Store,
  Briefcase,
  Mountain,
  Car,
  Tag
} from 'lucide-react';
import { CoExclusivasFilters } from '../index';

interface CoExclusivasFiltersProps {
  filters: CoExclusivasFilters;
  onFiltersChange: (filters: CoExclusivasFilters) => void;
  onClear: () => void;
}

export const CoExclusivasFiltersComponent: React.FC<CoExclusivasFiltersProps> = ({
  filters,
  onFiltersChange,
  onClear
}) => {
  const [localFilters, setLocalFilters] = useState<CoExclusivasFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleInputChange = (key: keyof CoExclusivasFilters, value: any) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleClearFilters = () => {
    setLocalFilters({});
    onClear();
  };

  const tiposPropiedad = [
    { value: 'piso', label: 'Piso', icon: Home },
    { value: 'chalet', label: 'Chalet', icon: Building },
    { value: 'local', label: 'Local', icon: Store },
    { value: 'oficina', label: 'Oficina', icon: Briefcase },
    { value: 'terreno', label: 'Terreno', icon: Mountain },
    { value: 'garaje', label: 'Garaje', icon: Car }
  ];

  const estadosPropiedad = [
    { value: 'disponible', label: 'Disponible' },
    { value: 'reservada', label: 'Reservada' },
    { value: 'vendida', label: 'Vendida' }
  ];

  const tiposColaboracion = [
    { value: 'venta', label: 'Solo Venta' },
    { value: 'alquiler', label: 'Solo Alquiler' },
    { value: 'ambos', label: 'Venta y Alquiler' }
  ];

  const preciosComunes = [
    { min: 0, max: 100000, label: 'Hasta €100.000' },
    { min: 100000, max: 200000, label: '€100.000 - €200.000' },
    { min: 200000, max: 300000, label: '€200.000 - €300.000' },
    { min: 300000, max: 500000, label: '€300.000 - €500.000' },
    { min: 500000, max: 1000000, label: '€500.000 - €1.000.000' },
    { min: 1000000, max: undefined, label: 'Más de €1.000.000' }
  ];

  const handlePrecioRangoClick = (min: number, max?: number) => {
    setLocalFilters(prev => ({
      ...prev,
      precioMin: min,
      precioMax: max
    }));
  };

  return (
    <div className="space-y-6">
      {/* Location Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <MapPin className="inline h-4 w-4 mr-1" />
          Ubicación
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Ciudad, código postal, dirección..."
            value={localFilters.ubicacion || ''}
            onChange={(e) => handleInputChange('ubicacion', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Property Type Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Home className="inline h-4 w-4 mr-1" />
          Tipo de Propiedad
        </label>
        <div className="grid grid-cols-3 gap-2">
          {tiposPropiedad.map((tipo) => (
            <motion.button
              key={tipo.value}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleInputChange('tipo', 
                localFilters.tipo === tipo.value ? undefined : tipo.value
              )}
              className={`p-3 border rounded-lg flex items-center space-x-2 transition-all ${
                localFilters.tipo === tipo.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400 text-gray-700'
              }`}
            >
              <tipo.icon className="h-4 w-4" />
              <span className="text-sm font-medium">{tipo.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="inline h-4 w-4 mr-1" />
            Precio Mínimo
          </label>
          <input
            type="number"
            placeholder="€0"
            value={localFilters.precioMin || ''}
            onChange={(e) => handleInputChange('precioMin', 
              e.target.value ? parseInt(e.target.value) : undefined
            )}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Precio Máximo
          </label>
          <input
            type="number"
            placeholder="Sin límite"
            value={localFilters.precioMax || ''}
            onChange={(e) => handleInputChange('precioMax', 
              e.target.value ? parseInt(e.target.value) : undefined
            )}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Quick Price Ranges */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rangos de Precio Populares
        </label>
        <div className="flex flex-wrap gap-2">
          {preciosComunes.map((rango, index) => (
            <button
              key={index}
              onClick={() => handlePrecioRangoClick(rango.min, rango.max)}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                localFilters.precioMin === rango.min && localFilters.precioMax === rango.max
                  ? 'bg-blue-100 text-blue-700 border-blue-300'
                  : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
              }`}
            >
              {rango.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rooms and Bathrooms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Bed className="inline h-4 w-4 mr-1" />
            Habitaciones
          </label>
          <select
            value={localFilters.habitaciones || ''}
            onChange={(e) => handleInputChange('habitaciones', 
              e.target.value ? parseInt(e.target.value) : undefined
            )}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Cualquier cantidad</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="5">5+</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Bath className="inline h-4 w-4 mr-1" />
            Baños
          </label>
          <select
            value={localFilters.banos || ''}
            onChange={(e) => handleInputChange('banos', 
              e.target.value ? parseInt(e.target.value) : undefined
            )}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Cualquier cantidad</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </select>
        </div>
      </div>

      {/* Status and Collaboration Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Tag className="inline h-4 w-4 mr-1" />
            Estado
          </label>
          <select
            value={localFilters.estado || ''}
            onChange={(e) => handleInputChange('estado', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            {estadosPropiedad.map((estado) => (
              <option key={estado.value} value={estado.value}>
                {estado.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Colaboración
          </label>
          <select
            value={localFilters.tipoColaboracion || ''}
            onChange={(e) => handleInputChange('tipoColaboracion', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los tipos</option>
            {tiposColaboracion.map((tipo) => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <button
          onClick={handleClearFilters}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Limpiar filtros
        </button>
        
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleApplyFilters}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Filter className="h-4 w-4 mr-2" />
            Aplicar Filtros
          </motion.button>
        </div>
      </div>

      {/* Filter Summary */}
      <div className="pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <p className="font-medium mb-2">Resumen de filtros:</p>
          <ul className="space-y-1">
            {localFilters.ubicacion && (
              <li>• Ubicación: {localFilters.ubicacion}</li>
            )}
            {localFilters.tipo && (
              <li>• Tipo: {tiposPropiedad.find(t => t.value === localFilters.tipo)?.label}</li>
            )}
            {(localFilters.precioMin || localFilters.precioMax) && (
              <li>• Precio: 
                {localFilters.precioMin ? ` desde €${localFilters.precioMin.toLocaleString()}` : ''}
                {localFilters.precioMax ? ` hasta €${localFilters.precioMax.toLocaleString()}` : ' sin límite superior'}
              </li>
            )}
            {localFilters.habitaciones && (
              <li>• Habitaciones: {localFilters.habitaciones}+</li>
            )}
            {localFilters.banos && (
              <li>• Baños: {localFilters.banos}+</li>
            )}
            {localFilters.estado && (
              <li>• Estado: {estadosPropiedad.find(e => e.value === localFilters.estado)?.label}</li>
            )}
            {localFilters.tipoColaboracion && (
              <li>• Colaboración: {tiposColaboracion.find(t => t.value === localFilters.tipoColaboracion)?.label}</li>
            )}
            {Object.keys(localFilters).length === 0 && (
              <li className="text-gray-500 italic">No hay filtros aplicados</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};