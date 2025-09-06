import React from 'react';
import { X, MapPin, Calendar, Square, Home, Car, Star, Ruler } from 'lucide-react';
import { Comparable } from '../types';
import { formatMoney, formatSqm, formatDate, formatDistance, percent } from '../utils';
import { QualityBadge } from './QualityBadge';
import { PhotosStrip } from './PhotosStrip';

interface Props {
  comparable: Comparable | null;
  onClose: () => void;
  className?: string;
}

export const CompDetailDrawer: React.FC<Props> = ({ comparable, onClose, className = '' }) => {
  if (!comparable) return null;

  const ppsqm = comparable.ppsqm || (comparable.price / comparable.sqm);
  const adjustmentAmount = comparable.adjTotal ? comparable.adjTotal - comparable.price : 0;
  const adjustmentPercent = adjustmentAmount / comparable.price;

  const getConditionColor = (condition?: string) => {
    switch (condition) {
      case 'new': return 'text-green-600';
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getConditionLabel = (condition?: string) => {
    switch (condition) {
      case 'new': return 'Obra nueva';
      case 'excellent': return 'Excelente';
      case 'good': return 'Bueno';
      case 'fair': return 'Regular';
      case 'poor': return 'Necesita reforma';
      default: return 'No especificado';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'PORTAL': return 'bg-blue-100 text-blue-800';
      case 'REGISTRO': return 'bg-green-100 text-green-800';
      case 'NOTARIA': return 'bg-purple-100 text-purple-800';
      case 'INTERNO': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      
      {/* Drawer */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl z-50 transform transition-transform duration-300 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-900">
              Detalle del Comparable
            </h2>
            <QualityBadge quality={comparable.quality} />
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              getSourceColor(comparable.source)
            }`}>
              {comparable.source}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Photos */}
          {comparable.photos && comparable.photos.length > 0 && (
            <div className="px-6 py-4 border-b">
              <PhotosStrip photos={comparable.photos} />
            </div>
          )}

          {/* Basic Info */}
          <div className="px-6 py-4 border-b">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Información básica</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">Dirección</div>
                      <div className="text-sm text-gray-600">{comparable.address || 'No especificada'}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">Fecha de operación</div>
                      <div className="text-sm text-gray-600">{formatDate(comparable.date)}</div>
                    </div>
                  </div>
                  
                  {comparable.distance && (
                    <div className="flex items-center gap-2">
                      <Ruler className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">Distancia</div>
                        <div className="text-sm text-gray-600">{formatDistance(comparable.distance)}</div>
                      </div>
                    </div>
                  )}
                  
                  {comparable.ref && (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4" />
                      <div>
                        <div className="font-medium text-gray-900">Referencia</div>
                        <div className="text-sm text-gray-600">{comparable.ref}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Precio y valoración</h3>
                <div className="space-y-3">
                  <div>
                    <div className="font-medium text-gray-900">Precio original</div>
                    <div className="text-2xl font-bold text-blue-600">{formatMoney(comparable.price)}</div>
                  </div>
                  
                  <div>
                    <div className="font-medium text-gray-900">€ / m²</div>
                    <div className="text-lg font-semibold text-gray-900">{formatMoney(ppsqm)}</div>
                  </div>
                  
                  {comparable.adjTotal && (
                    <div>
                      <div className="font-medium text-gray-900">Precio ajustado</div>
                      <div className="flex items-center gap-2">
                        <div className="text-lg font-semibold text-green-600">
                          {formatMoney(comparable.adjTotal)}
                        </div>
                        <span className={`text-sm px-2 py-1 rounded ${
                          adjustmentAmount > 0 ? 'bg-green-100 text-green-600' : 
                          adjustmentAmount < 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {adjustmentAmount > 0 ? '+' : ''}{formatMoney(adjustmentAmount)}
                          {' '}({percent(adjustmentPercent)})
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {comparable.weight && (
                    <div>
                      <div className="font-medium text-gray-900">Peso en valoración</div>
                      <div className="flex items-center gap-2">
                        <div className="text-lg font-semibold text-gray-900">{percent(comparable.weight)}</div>
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${
                                i < (comparable.weight || 0) * 5 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Características</h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Square className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">Superficie</div>
                    <div className="text-sm text-gray-600">{formatSqm(comparable.sqm)}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">Habitaciones</div>
                    <div className="text-sm text-gray-600">{comparable.rooms || 'No especificado'}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4" />
                  <div>
                    <div className="font-medium text-gray-900">Baños</div>
                    <div className="text-sm text-gray-600">{comparable.baths || 'No especificado'}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4" />
                  <div>
                    <div className="font-medium text-gray-900">Planta</div>
                    <div className="text-sm text-gray-600">
                      {comparable.floor !== undefined ? `${comparable.floor}ª` : 'No especificado'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4" />
                  <div>
                    <div className="font-medium text-gray-900">Ascensor</div>
                    <div className="text-sm text-gray-600">
                      {comparable.elevator !== undefined ? (comparable.elevator ? 'Sí' : 'No') : 'No especificado'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">Parking</div>
                    <div className="text-sm text-gray-600">
                      {comparable.parking !== undefined ? (comparable.parking ? 'Sí' : 'No') : 'No especificado'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4" />
                  <div>
                    <div className="font-medium text-gray-900">Estado</div>
                    <div className={`text-sm font-medium ${
                      getConditionColor(comparable.condition)
                    }`}>
                      {getConditionLabel(comparable.condition)}
                    </div>
                  </div>
                </div>
                
                {comparable.terrace && (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4" />
                    <div>
                      <div className="font-medium text-gray-900">Terraza</div>
                      <div className="text-sm text-gray-600">{comparable.terrace} m²</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Similarity Analysis */}
          {comparable.similarity && (
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Análisis de similitud</h3>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-blue-900">Índice de similitud</span>
                  <span className="text-2xl font-bold text-blue-600">{percent(comparable.similarity)}</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${comparable.similarity * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-blue-700 mt-2">
                  Basado en ubicación, superficie, características y fecha
                </div>
              </div>
            </div>
          )}

          {/* Meta Information */}
          {comparable.meta && Object.keys(comparable.meta).length > 0 && (
            <div className="px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Información adicional</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {Object.entries(comparable.meta).map(([key, value]) => (
                    <div key={key}>
                      <span className="font-medium text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                      </span>
                      <span className="ml-2 text-gray-600">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between">
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                Excluir de análisis
              </button>
              <button className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-lg hover:bg-blue-100">
                Añadir a set
              </button>
            </div>
            
            <button 
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};