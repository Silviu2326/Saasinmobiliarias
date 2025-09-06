import React from 'react';
import { CarteraStats } from '../apis';

interface CarteraStatsProps {
  stats: CarteraStats;
  onFilterChange: (filtro: string) => void;
}

export default function CarteraStatsComponent({ stats, onFilterChange }: CarteraStatsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('es-ES').format(value);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      <div 
        className="bg-white p-4 rounded-lg border hover:shadow-md cursor-pointer transition-shadow"
        onClick={() => onFilterChange('todos')}
      >
        <div className="text-2xl font-bold text-gray-600">{stats.total}</div>
        <div className="text-sm text-gray-500">Total Inmuebles</div>
      </div>

      <div 
        className="bg-green-50 p-4 rounded-lg border border-green-200 hover:shadow-md cursor-pointer transition-shadow"
        onClick={() => onFilterChange('activo')}
      >
        <div className="text-2xl font-bold text-green-600">{stats.activos}</div>
        <div className="text-sm text-green-600">Activos</div>
      </div>

      <div 
        className="bg-blue-50 p-4 rounded-lg border border-blue-200 hover:shadow-md cursor-pointer transition-shadow"
        onClick={() => onFilterChange('vendido')}
      >
        <div className="text-2xl font-bold text-blue-600">{stats.vendidos}</div>
        <div className="text-sm text-blue-600">Vendidos</div>
        {stats.total > 0 && (
          <div className="text-xs text-blue-500 mt-1">
            {((stats.vendidos / stats.total) * 100).toFixed(1)}% conversión
          </div>
        )}
      </div>

      <div 
        className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 hover:shadow-md cursor-pointer transition-shadow"
        onClick={() => onFilterChange('reservado')}
      >
        <div className="text-2xl font-bold text-yellow-600">{stats.reservados}</div>
        <div className="text-sm text-yellow-600">Reservados</div>
      </div>

      <div 
        className="bg-purple-50 p-4 rounded-lg border border-purple-200 hover:shadow-md cursor-pointer transition-shadow"
        onClick={() => onFilterChange('exclusiva')}
      >
        <div className="text-2xl font-bold text-purple-600">{stats.enExclusiva}</div>
        <div className="text-sm text-purple-600">Exclusivas</div>
        {stats.total > 0 && (
          <div className="text-xs text-purple-500 mt-1">
            {((stats.enExclusiva / stats.total) * 100).toFixed(1)}% del total
          </div>
        )}
      </div>

      <div 
        className="bg-orange-50 p-4 rounded-lg border border-orange-200 hover:shadow-md cursor-pointer transition-shadow"
        onClick={() => onFilterChange('publicado')}
      >
        <div className="text-2xl font-bold text-orange-600">{stats.publicados}</div>
        <div className="text-sm text-orange-600">Publicados</div>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border col-span-2">
        <div className="text-2xl font-bold text-gray-900">
          {formatCurrency(stats.valorTotal)}
        </div>
        <div className="text-sm text-gray-600">Valor Total Cartera</div>
        <div className="text-xs text-gray-500 mt-1">
          Media: {formatCurrency(stats.valorMedio)}
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border">
        <div className="text-2xl font-bold text-gray-600">{stats.diasMediosEnCartera}d</div>
        <div className="text-sm text-gray-500">Días Medio</div>
        <div className="text-xs text-gray-400">en cartera</div>
      </div>

      <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
        <div className="text-2xl font-bold text-indigo-600">{formatNumber(stats.visitasTotales)}</div>
        <div className="text-sm text-indigo-600">Visitas Totales</div>
        <div className="text-xs text-indigo-500 mt-1">
          {formatNumber(stats.consultasTotales)} consultas
        </div>
      </div>

      <div className={`p-4 rounded-lg border ${
        stats.tasaConversion >= 15 
          ? 'bg-green-50 border-green-200' 
          : stats.tasaConversion >= 10
          ? 'bg-yellow-50 border-yellow-200'
          : 'bg-red-50 border-red-200'
      }`}>
        <div className={`text-2xl font-bold ${
          stats.tasaConversion >= 15 
            ? 'text-green-600' 
            : stats.tasaConversion >= 10
            ? 'text-yellow-600'
            : 'text-red-600'
        }`}>
          {stats.tasaConversion}%
        </div>
        <div className={`text-sm ${
          stats.tasaConversion >= 15 
            ? 'text-green-600' 
            : stats.tasaConversion >= 10
            ? 'text-yellow-600'
            : 'text-red-600'
        }`}>
          Tasa Conversión
        </div>
      </div>

      <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
        <div className="text-xl font-bold text-teal-600">
          {stats.activos > 0 ? Math.round(stats.visitasTotales / stats.activos) : 0}
        </div>
        <div className="text-sm text-teal-600">Visitas/Inmueble</div>
        <div className="text-xs text-teal-500 mt-1">promedio activos</div>
      </div>
    </div>
  );
}