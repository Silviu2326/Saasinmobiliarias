import React from 'react';
import { InmuebleAsociado } from '../apis';

interface InmueblesPanelProps {
  inmuebles: InmuebleAsociado[];
  rendimiento: {
    totalVisitas: number;
    totalGuardados: number;
    promedioDias: number;
    conversionRate: number;
  };
}

export default function InmueblesPanel({ inmuebles, rendimiento }: InmueblesPanelProps) {
  const getEstadoColor = (estado: InmuebleAsociado['estadoVenta']) => {
    switch (estado) {
      case 'activo': return 'bg-green-100 text-green-800';
      case 'reservado': return 'bg-yellow-100 text-yellow-800';
      case 'vendido': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{rendimiento.totalVisitas}</div>
          <div className="text-sm text-gray-600">Total Visitas</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{rendimiento.totalGuardados}</div>
          <div className="text-sm text-gray-600">Total Guardados</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{rendimiento.promedioDias}d</div>
          <div className="text-sm text-gray-600">Promedio Venta</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{rendimiento.conversionRate.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">Conversión</div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">
          Inmuebles Asociados ({inmuebles.length})
        </h3>
        
        {inmuebles.map((inmueble) => (
          <div key={inmueble.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex gap-4">
              {inmueble.imagen && (
                <img
                  src={inmueble.imagen}
                  alt={inmueble.referencia}
                  className="w-20 h-20 object-cover rounded-md"
                />
              )}
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">Ref: {inmueble.referencia}</h4>
                    <p className="text-sm text-gray-600">{inmueble.direccion}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEstadoColor(inmueble.estadoVenta)}`}>
                    {inmueble.estadoVenta}
                  </span>
                </div>
                
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="font-semibold text-lg text-gray-900">
                      {new Intl.NumberFormat('es-ES').format(inmueble.precio)}€
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-600">👁</span>
                    <span>{inmueble.visitas} visitas</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-600">💾</span>
                    <span>{inmueble.guardados} guardados</span>
                  </div>
                  {inmueble.ultimaVisita && (
                    <div className="text-gray-500">
                      Última visita: {new Date(inmueble.ultimaVisita).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {inmuebles.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay inmuebles asociados
          </div>
        )}
      </div>
    </div>
  );
}