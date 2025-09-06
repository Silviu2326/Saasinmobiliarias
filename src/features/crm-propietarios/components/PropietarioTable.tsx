import React from 'react';
import { Propietario } from '../apis';

interface PropietarioTableProps {
  propietarios: Propietario[];
  onEdit: (propietario: Propietario) => void;
  onDelete: (id: string) => void;
  onViewInmuebles: (propietario: Propietario) => void;
  onGenerarInforme: (propietario: Propietario) => void;
}

export default function PropietarioTable({
  propietarios,
  onEdit,
  onDelete,
  onViewInmuebles,
  onGenerarInforme
}: PropietarioTableProps) {
  const getExclusivaStatus = (propietario: Propietario) => {
    if (!propietario.tieneExclusiva) {
      return <span className="text-gray-500">Sin exclusiva</span>;
    }
    
    if (propietario.fechaFinExclusiva) {
      const fechaFin = new Date(propietario.fechaFinExclusiva);
      const diasRestantes = Math.ceil((fechaFin.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      if (diasRestantes < 0) {
        return <span className="text-red-600">Expirada</span>;
      } else if (diasRestantes < 30) {
        return <span className="text-yellow-600">Expira en {diasRestantes} días</span>;
      } else {
        return <span className="text-green-600">Activa</span>;
      }
    }
    
    return <span className="text-green-600">Activa</span>;
  };

  const getInteresColor = (interes: Propietario['interesDeVenta']) => {
    switch (interes) {
      case 'alto': return 'bg-green-100 text-green-800';
      case 'medio': return 'bg-yellow-100 text-yellow-800';
      case 'bajo': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nombre</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Exclusiva</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Inmuebles</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Interés</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Agente</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Docs</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {propietarios.map((propietario) => (
            <tr key={propietario.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <div>
                  <div className="font-medium text-gray-900">{propietario.nombre}</div>
                  <div className="text-sm text-gray-500">{propietario.email}</div>
                  <div className="text-sm text-gray-500">{propietario.telefono}</div>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="text-sm">
                  {getExclusivaStatus(propietario)}
                  {propietario.tieneExclusiva && propietario.fechaFinExclusiva && (
                    <div className="text-xs text-gray-500 mt-1">
                      hasta {new Date(propietario.fechaFinExclusiva).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="text-center">
                  <span className="text-2xl font-bold text-gray-700">
                    {propietario.numeroInmuebles || 0}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 inline-flex text-xs font-medium rounded-full ${getInteresColor(propietario.interesDeVenta)}`}>
                  {propietario.interesDeVenta}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {propietario.agente || '-'}
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-1">
                  {propietario.ndaFirmado && (
                    <span className="text-green-600" title="NDA Firmado">📄</span>
                  )}
                  {propietario.consentimientoRGPD && (
                    <span className="text-blue-600" title="RGPD OK">🔒</span>
                  )}
                  {!propietario.ndaFirmado && !propietario.consentimientoRGPD && (
                    <span className="text-gray-400">-</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => onViewInmuebles(propietario)}
                    className="text-purple-600 hover:text-purple-800 text-sm text-left"
                  >
                    Ver Inmuebles
                  </button>
                  <button
                    onClick={() => onGenerarInforme(propietario)}
                    className="text-green-600 hover:text-green-800 text-sm text-left"
                  >
                    Generar Informe
                  </button>
                  <button
                    onClick={() => onEdit(propietario)}
                    className="text-blue-600 hover:text-blue-800 text-sm text-left"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(propietario.id)}
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
      {propietarios.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No se encontraron propietarios
        </div>
      )}
    </div>
  );
}