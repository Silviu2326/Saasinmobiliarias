import React from 'react';
import { InmuebleCartera } from '../apis';

interface CarteraTableProps {
  inmuebles: InmuebleCartera[];
  selectedIds: Set<string>;
  onSelectToggle: (id: string) => void;
  onSelectAll: () => void;
  onEdit: (inmueble: InmuebleCartera) => void;
  onDelete: (id: string) => void;
  onViewDetails: (inmueble: InmuebleCartera) => void;
  onTogglePublicacion: (id: string, publicado: boolean) => void;
}

export default function CarteraTable({
  inmuebles,
  selectedIds,
  onSelectToggle,
  onSelectAll,
  onEdit,
  onDelete,
  onViewDetails,
  onTogglePublicacion
}: CarteraTableProps) {
  const getEstadoColor = (estado: InmuebleCartera['estado']) => {
    switch (estado) {
      case 'activo': return 'bg-green-100 text-green-800';
      case 'reservado': return 'bg-yellow-100 text-yellow-800';
      case 'vendido': return 'bg-blue-100 text-blue-800';
      case 'retirado': return 'bg-gray-100 text-gray-800';
      case 'en_proceso': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipologiaIcon = (tipologia: InmuebleCartera['tipologia']) => {
    const icons: Record<string, string> = {
      piso: '🏠',
      atico: '🏢',
      duplex: '🏘️',
      casa: '🏡',
      chalet: '🏰',
      estudio: '🏢',
      loft: '🏭',
      planta_baja: '🏬',
      local: '🏪',
      oficina: '🏢'
    };
    return icons[tipologia] || '🏠';
  };

  const getRendimientoColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getDiasEnCarteraColor = (dias: number) => {
    if (dias <= 30) return 'text-green-600';
    if (dias <= 90) return 'text-yellow-600';
    if (dias <= 180) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left">
              <input
                type="checkbox"
                checked={selectedIds.size === inmuebles.length && inmuebles.length > 0}
                onChange={onSelectAll}
                className="rounded border-gray-300"
              />
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Inmueble</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Precio</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Estado</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Agente</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Rendimiento</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Días</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Publicado</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {inmuebles.map((inmueble) => (
            <tr key={inmueble.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedIds.has(inmueble.id)}
                  onChange={() => onSelectToggle(inmueble.id)}
                  className="rounded border-gray-300"
                />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {inmueble.fotoPrincipal ? (
                      <img
                        src={inmueble.fotoPrincipal}
                        alt={inmueble.titulo}
                        className="w-16 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center text-2xl">
                        {getTipologiaIcon(inmueble.tipologia)}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">
                      {inmueble.referencia}
                      {inmueble.exclusiva && <span className="ml-2 text-yellow-600">🔒</span>}
                      {inmueble.destacado && <span className="ml-1 text-red-600">⭐</span>}
                    </div>
                    <div className="text-sm text-gray-600">{inmueble.titulo}</div>
                    <div className="text-xs text-gray-500">
                      📍 {inmueble.zona} • {inmueble.m2}m² • {inmueble.habitaciones} hab
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <div>
                  <div className="font-semibold text-gray-900">
                    {new Intl.NumberFormat('es-ES').format(inmueble.precio)}€
                  </div>
                  <div className="text-xs text-gray-500">
                    {Math.round(inmueble.precio / inmueble.m2)} €/m²
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEstadoColor(inmueble.estado)}`}>
                  {inmueble.estado.replace('_', ' ')}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                <div>{inmueble.agenteComercial || inmueble.agenteCaptacion || '-'}</div>
                {inmueble.equipo && (
                  <div className="text-xs text-gray-500">{inmueble.equipo}</div>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          inmueble.score >= 80 ? 'bg-green-500' : 
                          inmueble.score >= 60 ? 'bg-yellow-500' : 
                          inmueble.score >= 40 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${inmueble.score}%` }}
                      />
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${getRendimientoColor(inmueble.score)}`}>
                    {inmueble.score}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {inmueble.visitas} visitas • {inmueble.consultas} consultas
                </div>
              </td>
              <td className="px-4 py-3">
                <span className={`text-sm font-medium ${getDiasEnCarteraColor(inmueble.diasEnCartera)}`}>
                  {inmueble.diasEnCartera}d
                </span>
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onTogglePublicacion(inmueble.id, !inmueble.publicado)}
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    inmueble.publicado 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {inmueble.publicado ? '✓ Publicado' : 'Sin publicar'}
                </button>
                {inmueble.portales.length > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    {inmueble.portales.length} portales
                  </div>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => onViewDetails(inmueble)}
                    className="text-purple-600 hover:text-purple-800 text-sm text-left"
                  >
                    Ver detalles
                  </button>
                  <button
                    onClick={() => onEdit(inmueble)}
                    className="text-blue-600 hover:text-blue-800 text-sm text-left"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(inmueble.id)}
                    className="text-red-600 hover:text-red-800 text-sm text-left"
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {inmuebles.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No se encontraron inmuebles
        </div>
      )}
    </div>
  );
}