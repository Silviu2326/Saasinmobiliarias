import React, { useState } from 'react';
import { Property } from '../types';
import { 
  formatPrice, 
  formatArea, 
  formatRooms, 
  formatDate, 
  formatDateTime,
  formatRelativeTime,
  calculatePricePerM2,
  getPropertyStatusColor,
  getPropertyTypeIcon 
} from '../utils';

interface PropertyDetailsDrawerProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onPublish?: () => void;
}

type TabType = 'overview' | 'medios' | 'documentos' | 'pricing' | 'actividad';

export default function PropertyDetailsDrawer({
  property,
  isOpen,
  onClose,
  onEdit,
  onPublish
}: PropertyDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  if (!property) return null;

  const tabs: { id: TabType; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'medios', label: 'Medios', count: property.fotos?.length || 0 },
    { id: 'documentos', label: 'Documentos', count: property.documentos?.length || 0 },
    { id: 'pricing', label: 'Pricing' },
    { id: 'actividad', label: 'Actividad' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Información básica */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                Información Básica
              </h4>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tipo</dt>
                  <dd className="mt-1 text-sm text-gray-900 flex items-center">
                    <span className="mr-2 text-lg">{getPropertyTypeIcon(property.tipo)}</span>
                    <span className="capitalize">{property.tipo}</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Estado</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getPropertyStatusColor(property.estado)}`}>
                      {property.estado.charAt(0).toUpperCase() + property.estado.slice(1)}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Superficie</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatArea(property.m2)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Distribución</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatRooms(property.habitaciones, property.banos)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Exclusiva</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {property.exclusiva ? (
                      <span className="inline-flex items-center text-yellow-600">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        Sí
                      </span>
                    ) : (
                      'No'
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Agente</dt>
                  <dd className="mt-1 text-sm text-gray-900">{property.agente || 'Sin asignar'}</dd>
                </div>
              </dl>
            </div>

            {/* Ubicación */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                Ubicación
              </h4>
              <div className="text-sm text-gray-600">
                <p>{property.direccion}</p>
                <p className="font-medium">{property.ciudad}</p>
                {property.coordenadas && (
                  <p className="text-xs text-gray-500 mt-1">
                    Lat: {property.coordenadas.lat}, Lng: {property.coordenadas.lng}
                  </p>
                )}
              </div>
            </div>

            {/* Descripción */}
            {property.descripcion && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                  Descripción
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">{property.descripcion}</p>
              </div>
            )}

            {/* Características */}
            {property.caracteristicas && property.caracteristicas.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                  Características
                </h4>
                <div className="flex flex-wrap gap-2">
                  {property.caracteristicas.map((caracteristica, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {caracteristica}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Sincronización con portales */}
            {property.portalSync && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                  Portales
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(property.portalSync).map(([portal, synced]) => (
                    <div key={portal} className="flex items-center justify-between">
                      <span className="capitalize">{portal}</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        synced ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {synced ? 'Sincronizado' : 'No publicado'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'medios':
        return (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Fotografías ({property.fotos?.length || 0})
            </h4>
            {property.fotos && property.fotos.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {property.fotos.map((foto, index) => (
                  <div key={index} className="aspect-w-16 aspect-h-12">
                    <img
                      src={foto}
                      alt={`Foto ${index + 1} de ${property.titulo}`}
                      className="object-cover rounded-lg shadow-sm"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>No hay fotografías disponibles</p>
              </div>
            )}
          </div>
        );

      case 'documentos':
        return (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Documentos ({property.documentos?.length || 0})
            </h4>
            {property.documentos && property.documentos.length > 0 ? (
              <div className="space-y-2">
                {property.documentos.map((documento, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-6 h-6 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm text-gray-900">{documento}</span>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-sm">
                      Descargar
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>No hay documentos disponibles</p>
              </div>
            )}
          </div>
        );

      case 'pricing':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                Información de Precio
              </h4>
              <dl className="grid grid-cols-1 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Precio actual</dt>
                  <dd className="mt-1 text-2xl font-bold text-gray-900">{formatPrice(property.precio)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Precio por m²</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-700">
                    {formatPrice(calculatePricePerM2(property.precio, property.m2))}/m²
                  </dd>
                </div>
                {property.pricing?.precioOriginal && property.pricing.precioOriginal !== property.precio && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Precio original</dt>
                    <dd className="mt-1 text-sm text-gray-600 line-through">
                      {formatPrice(property.pricing.precioOriginal)}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {property.pricing?.historialPrecios && property.pricing.historialPrecios.length > 1 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                  Historial de Precios
                </h4>
                <div className="space-y-3">
                  {property.pricing.historialPrecios.map((entrada, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatPrice(entrada.precio)}
                        </div>
                        {entrada.motivo && (
                          <div className="text-xs text-gray-500">{entrada.motivo}</div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(entrada.fecha)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'actividad':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                Estadísticas de Actividad
              </h4>
              {property.actividad ? (
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{property.actividad.visitas}</div>
                    <div className="text-xs text-blue-600 font-medium">Visitas</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{property.actividad.consultas}</div>
                    <div className="text-xs text-green-600 font-medium">Consultas</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{property.actividad.guardados}</div>
                    <div className="text-xs text-purple-600 font-medium">Guardados</div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No hay datos de actividad disponibles</p>
              )}
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                Fechas Importantes
              </h4>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Creado:</dt>
                  <dd className="text-gray-900">{formatDateTime(property.createdAt)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Última actualización:</dt>
                  <dd className="text-gray-900">{formatRelativeTime(property.updatedAt)}</dd>
                </div>
                {property.publishedAt && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Publicado:</dt>
                    <dd className="text-gray-900">{formatDateTime(property.publishedAt)}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 truncate">
                  {property.titulo}
                </h2>
                <p className="text-sm text-gray-500 truncate">
                  {property.direccion}, {property.ciudad}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {onEdit && (
                  <button
                    onClick={onEdit}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                    title="Editar"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
                {onPublish && (
                  <button
                    onClick={onPublish}
                    className="p-2 text-gray-400 hover:text-green-600 rounded-full hover:bg-gray-100"
                    title="Publicar"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011 1v8a1 1 0 01-1 1H7a1 1 0 01-1-1V2a1 1 0 011-1z" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="mt-3">
              <div className="text-2xl font-bold text-gray-900">{formatPrice(property.precio)}</div>
              <div className="text-sm text-gray-500">
                {formatPrice(calculatePricePerM2(property.precio, property.m2))}/m² • {formatArea(property.m2)} • {formatRooms(property.habitaciones, property.banos)}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                      activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-900'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </>
  );
}