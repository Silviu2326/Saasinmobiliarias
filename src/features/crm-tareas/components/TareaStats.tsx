import React from 'react';
import { TareaStats as Stats } from '../apis';

interface TareaStatsProps {
  stats: Stats;
  onFilterChange: (filtro: string) => void;
}

export default function TareaStats({ stats, onFilterChange }: TareaStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
      <div 
        className="bg-white p-4 rounded-lg border hover:shadow-md cursor-pointer transition-shadow"
        onClick={() => onFilterChange('todas')}
      >
        <div className="text-2xl font-bold text-gray-600">{stats.total}</div>
        <div className="text-sm text-gray-500">Total</div>
      </div>

      <div 
        className="bg-blue-50 p-4 rounded-lg border border-blue-200 hover:shadow-md cursor-pointer transition-shadow"
        onClick={() => onFilterChange('pendiente')}
      >
        <div className="text-2xl font-bold text-blue-600">{stats.pendientes}</div>
        <div className="text-sm text-blue-600">Pendientes</div>
      </div>

      <div 
        className="bg-orange-50 p-4 rounded-lg border border-orange-200 hover:shadow-md cursor-pointer transition-shadow"
        onClick={() => onFilterChange('en_progreso')}
      >
        <div className="text-2xl font-bold text-orange-600">{stats.enProgreso}</div>
        <div className="text-sm text-orange-600">En Progreso</div>
      </div>

      <div 
        className="bg-green-50 p-4 rounded-lg border border-green-200 hover:shadow-md cursor-pointer transition-shadow"
        onClick={() => onFilterChange('hecha')}
      >
        <div className="text-2xl font-bold text-green-600">{stats.completadas}</div>
        <div className="text-sm text-green-600">Completadas</div>
      </div>

      <div 
        className="bg-red-50 p-4 rounded-lg border border-red-200 hover:shadow-md cursor-pointer transition-shadow"
        onClick={() => onFilterChange('atrasadas')}
      >
        <div className="text-2xl font-bold text-red-600">{stats.atrasadas}</div>
        <div className="text-sm text-red-600">Atrasadas</div>
        {stats.atrasadas > 0 && (
          <div className="text-xs text-red-500 mt-1">⚠️ Requiere atención</div>
        )}
      </div>

      <div 
        className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 hover:shadow-md cursor-pointer transition-shadow"
        onClick={() => onFilterChange('hoy')}
      >
        <div className="text-2xl font-bold text-yellow-600">{stats.vencenHoy}</div>
        <div className="text-sm text-yellow-600">Vencen Hoy</div>
        {stats.vencenHoy > 0 && (
          <div className="text-xs text-yellow-500 mt-1">📅 Revisar</div>
        )}
      </div>

      <div 
        className="bg-purple-50 p-4 rounded-lg border border-purple-200 hover:shadow-md cursor-pointer transition-shadow"
        onClick={() => onFilterChange('semana')}
      >
        <div className="text-2xl font-bold text-purple-600">{stats.vencenSemana}</div>
        <div className="text-sm text-purple-600">Esta Semana</div>
      </div>
    </div>
  );
}