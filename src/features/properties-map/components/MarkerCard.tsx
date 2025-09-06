import React from 'react';
import { PropertyMapPoint } from '../types';
import { formatMapPrice, getPropertyStatusColor, getPropertyTypeIcon } from '../utils';

interface MarkerCardProps {
  property: PropertyMapPoint;
  onClick: () => void;
}

export default function MarkerCard({ property, onClick }: MarkerCardProps) {
  const statusColors = {
    borrador: 'text-gray-600 bg-gray-100',
    activo: 'text-green-800 bg-green-100',
    vendido: 'text-blue-800 bg-blue-100',
    alquilado: 'text-violet-800 bg-violet-100'
  };

  const statusLabels = {
    borrador: 'Borrador',
    activo: 'Activo',
    vendido: 'Vendido',
    alquilado: 'Alquilado'
  };

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Title and icon */}
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">{getPropertyTypeIcon(property.type)}</span>
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {property.title}
            </h4>
          </div>

          {/* Address */}
          {property.address && (
            <p className="text-xs text-gray-600 mb-2 truncate">
              {property.address}
              {property.city && `, ${property.city}`}
            </p>
          )}

          {/* Details */}
          <div className="flex items-center space-x-3 text-xs text-gray-600 mb-2">
            {property.m2 && (
              <span className="flex items-center space-x-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2M16 4h2a2 2 0 012 2v2M16 20h2a2 2 0 01-2 2h-2" />
                </svg>
                <span>{property.m2}m²</span>
              </span>
            )}
            {property.habitaciones && (
              <span className="flex items-center space-x-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21v-4a2 2 0 012-2h2a2 2 0 012 2v4" />
                </svg>
                <span>{property.habitaciones} hab.</span>
              </span>
            )}
          </div>

          {/* Price and status */}
          <div className="flex items-center justify-between">
            <div className="text-lg font-bold text-gray-900">
              {formatMapPrice(property.price)}
            </div>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[property.status]}`}>
              {statusLabels[property.status]}
            </span>
          </div>
        </div>

        {/* Status indicator */}
        <div 
          className="w-3 h-3 rounded-full ml-3 mt-1 flex-shrink-0"
          style={{ backgroundColor: getPropertyStatusColor(property.status) }}
        />
      </div>
    </div>
  );
}