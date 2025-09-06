import React, { useState } from 'react';
import { InmuebleCartera, AnalisisComparativo } from '../apis';

interface InmuebleDetailsProps {
  inmueble: InmuebleCartera;
  analisisComparativo?: AnalisisComparativo;
  onAjustarPrecio: (nuevoPrecio: number, motivo: string) => void;
  onPublicarPortales: (portales: string[]) => void;
}

export default function InmuebleDetails({
  inmueble,
  analisisComparativo,
  onAjustarPrecio,
  onPublicarPortales
}: InmuebleDetailsProps) {
  const [showAjustePrecio, setShowAjustePrecio] = useState(false);
  const [nuevoPrecio, setNuevoPrecio] = useState(inmueble.precio);
  const [motivoAjuste, setMotivoAjuste] = useState('');
  const [selectedPortales, setSelectedPortales] = useState<string[]>([]);

  const portalesDisponibles = [
    'Idealista', 'Fotocasa', 'Pisos.com', 'Habitaclia', 'Yaencontre',
    'Milanuncios', 'Vibbo', 'Tecnocasa', 'Century21', 'Remax'
  ];

  const handleAjustePrecio = () => {
    if (nuevoPrecio > 0 && motivoAjuste.trim()) {
      onAjustarPrecio(nuevoPrecio, motivoAjuste);
      setShowAjustePrecio(false);
      setMotivoAjuste('');
    }
  };

  const togglePortal = (portal: string) => {
    if (selectedPortales.includes(portal)) {
      setSelectedPortales(selectedPortales.filter(p => p !== portal));
    } else {
      setSelectedPortales([...selectedPortales, portal]);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0 
    }).format(value);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getProbabilidadColor = (probabilidad: number) => {
    if (probabilidad >= 75) return 'text-green-600';
    if (probabilidad >= 50) return 'text-yellow-600';
    if (probabilidad >= 25) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header con foto principal */}
      <div className="flex gap-6">
        <div className="flex-shrink-0">
          {inmueble.fotoPrincipal ? (
            <img
              src={inmueble.fotoPrincipal}
              alt={inmueble.titulo}
              className="w-48 h-36 object-cover rounded-lg"
            />
          ) : (
            <div className="w-48 h-36 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-4xl">🏠</span>
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{inmueble.referencia}</h2>
              <p className="text-lg text-gray-600">{inmueble.titulo}</p>
              <p className="text-gray-500">📍 {inmueble.direccion}, {inmueble.zona}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(inmueble.precio)}
              </div>
              <div className="text-sm text-gray-500">
                {Math.round(inmueble.precio / inmueble.m2)} €/m²
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-gray-900">{inmueble.m2}</div>
              <div className="text-sm text-gray-600">m²</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-gray-900">{inmueble.habitaciones}</div>
              <div className="text-sm text-gray-600">habitaciones</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-gray-900">{inmueble.banos}</div>
              <div className="text-sm text-gray-600">baños</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-gray-900">{inmueble.diasEnCartera}</div>
              <div className="text-sm text-gray-600">días</div>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas de rendimiento */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Score General</h3>
              <div className="text-2xl font-bold mt-1">{inmueble.score}</div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(inmueble.score)}`}>
              {inmueble.score >= 80 ? 'Excelente' : inmueble.score >= 60 ? 'Bueno' : inmueble.score >= 40 ? 'Regular' : 'Bajo'}
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-600">Probabilidad Venta</h3>
          <div className={`text-2xl font-bold mt-1 ${getProbabilidadColor(inmueble.probabilidadVenta)}`}>
            {inmueble.probabilidadVenta}%
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-600">Actividad</h3>
          <div className="flex justify-between text-sm mt-2">
            <span>👁 {inmueble.visitas} visitas</span>
            <span>💾 {inmueble.guardados} guardados</span>
            <span>📞 {inmueble.consultas} consultas</span>
          </div>
        </div>
      </div>

      {/* Características */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Características</h3>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(inmueble.caracteristicas).map(([key, value]) => {
            if (!value) return null;
            return (
              <div key={key} className="flex items-center text-sm">
                <span className="text-green-500 mr-2">✓</span>
                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Análisis Comparativo */}
      {analisisComparativo && (
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Análisis Comparativo</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-blue-50 rounded">
              <div className="text-sm text-gray-600">Precio Sugerido</div>
              <div className="text-xl font-bold text-blue-600">
                {formatCurrency(analisisComparativo.precioSugerido)}
              </div>
              <div className="text-xs text-gray-500">
                {analisisComparativo.variacionMercado > 0 ? '+' : ''}{analisisComparativo.variacionMercado}% vs mercado
              </div>
            </div>
            <div className="p-3 bg-purple-50 rounded">
              <div className="text-sm text-gray-600">Índice Competitividad</div>
              <div className="text-xl font-bold text-purple-600">
                {analisisComparativo.indiceCompetitividad}/100
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Inmuebles Comparables</h4>
            <div className="space-y-2">
              {analisisComparativo.comparables.slice(0, 3).map((comp) => (
                <div key={comp.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <span className="text-sm font-medium">{comp.referencia}</span>
                    <span className="text-xs text-gray-500 ml-2">({comp.distancia}m)</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatCurrency(comp.precio)}</div>
                    <div className="text-xs text-gray-500">{comp.precioM2} €/m²</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Gestión de Precio */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium text-gray-900">Gestión de Precio</h3>
          <button
            onClick={() => setShowAjustePrecio(!showAjustePrecio)}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          >
            Ajustar Precio
          </button>
        </div>

        {showAjustePrecio && (
          <div className="border-t pt-4 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nuevo Precio
                </label>
                <input
                  type="number"
                  value={nuevoPrecio}
                  onChange={(e) => setNuevoPrecio(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Variación
                </label>
                <div className="px-3 py-2 bg-gray-50 rounded-md text-sm">
                  {((nuevoPrecio - inmueble.precio) / inmueble.precio * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo del Ajuste
              </label>
              <textarea
                value={motivoAjuste}
                onChange={(e) => setMotivoAjuste(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe el motivo del cambio de precio..."
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleAjustePrecio}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Confirmar Ajuste
              </button>
              <button
                onClick={() => setShowAjustePrecio(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Publicación en Portales */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Publicación en Portales</h3>
        
        <div className="grid grid-cols-5 gap-3 mb-4">
          {portalesDisponibles.map((portal) => {
            const isPublished = inmueble.portales.includes(portal);
            const isSelected = selectedPortales.includes(portal);
            
            return (
              <label key={portal} className="flex items-center">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => togglePortal(portal)}
                  className="mr-2 rounded border-gray-300"
                />
                <span className={`text-sm ${isPublished ? 'text-green-600' : 'text-gray-600'}`}>
                  {portal} {isPublished && '✓'}
                </span>
              </label>
            );
          })}
        </div>
        
        {selectedPortales.length > 0 && (
          <button
            onClick={() => {
              onPublicarPortales(selectedPortales);
              setSelectedPortales([]);
            }}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Publicar en {selectedPortales.length} portales
          </button>
        )}
      </div>

      {/* Notas */}
      {(inmueble.notas || inmueble.notasInternas) && (
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Notas</h3>
          {inmueble.notas && (
            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-700 mb-1">Notas Públicas</h4>
              <p className="text-sm text-gray-600">{inmueble.notas}</p>
            </div>
          )}
          {inmueble.notasInternas && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Notas Internas</h4>
              <p className="text-sm text-gray-600">{inmueble.notasInternas}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}