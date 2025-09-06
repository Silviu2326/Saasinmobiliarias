import React from 'react';
import { Building2, MapPin, Home, Calendar, TrendingUp, RefreshCw } from 'lucide-react';
import type { Subject } from '../types';
import { formatMoney } from '../utils';

interface SubjectSummaryCardProps {
  subject: Subject | null;
  onRefresh: () => void;
  loading?: boolean;
}

const SubjectSummaryCard: React.FC<SubjectSummaryCardProps> = ({
  subject,
  onRefresh,
  loading = false
}) => {
  if (!subject) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="text-center py-8">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No hay datos del inmueble</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Resumen del Inmueble</h3>
          <p className="text-sm text-gray-500">ID: {subject.id}</p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          title="Actualizar desde AVM/Comparables"
        >
          <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm text-gray-500">Ubicación</p>
            <p className="font-medium text-gray-900">{subject.address}</p>
            {subject.neighborhood && (
              <p className="text-sm text-gray-600">{subject.neighborhood}</p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Home className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm text-gray-500">Tipología</p>
            <p className="font-medium text-gray-900">{subject.propertyType}</p>
            <p className="text-sm text-gray-600">
              {subject.rooms} hab, {subject.bathrooms} baños
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm text-gray-500">Superficie</p>
            <p className="font-medium text-gray-900">{subject.area} m²</p>
            <p className="text-sm text-gray-600">Estado: {subject.condition}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm text-gray-500">Año construcción</p>
            <p className="font-medium text-gray-900">{subject.buildingYear}</p>
            <p className="text-sm text-gray-600">
              {new Date().getFullYear() - subject.buildingYear} años
            </p>
          </div>
        </div>
      </div>

      {subject.avmValue && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">Valor AVM</span>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-gray-900">
                {formatMoney(subject.avmValue)}
              </p>
              {subject.avmRange && (
                <p className="text-sm text-gray-500">
                  Rango: {formatMoney(subject.avmRange.low)} - {formatMoney(subject.avmRange.high)}
                </p>
              )}
              {subject.avmRange?.confidence && (
                <div className="mt-1">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    subject.avmRange.confidence > 0.8 
                      ? 'bg-green-100 text-green-700'
                      : subject.avmRange.confidence > 0.6
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    Confianza: {Math.round(subject.avmRange.confidence * 100)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {subject.features && subject.features.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">Características</p>
          <div className="flex flex-wrap gap-2">
            {subject.features.map((feature, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectSummaryCard;