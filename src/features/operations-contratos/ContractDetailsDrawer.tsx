import React, { useState } from 'react';
import type { Contract, ContractVersion } from './types';

interface ContractDetailsDrawerProps {
  contract: Contract | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onGenerate?: () => void;
  onSign?: () => void;
  onRequestSignature?: () => void;
}

type TabType = 'overview' | 'versions' | 'signatures' | 'attachments' | 'preview';

export default function ContractDetailsDrawer({
  contract,
  isOpen,
  onClose,
  onEdit,
  onGenerate,
  onSign,
  onRequestSignature
}: ContractDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  if (!contract) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  const getStatusColor = (estado: Contract['estado']) => {
    switch (estado) {
      case 'borrador': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'generado': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'firmado': return 'bg-green-100 text-green-800 border-green-200';
      case 'anulado': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTipoIcon = (tipo: Contract['tipo']) => {
    switch (tipo) {
      case 'compraventa': return '🏠';
      case 'alquiler': return '🔑';
      case 'exclusiva': return '⭐';
      default: return '📄';
    }
  };

  const tabs: { id: TabType; label: string; count?: number }[] = [
    { id: 'overview', label: 'Resumen' },
    { id: 'versions', label: 'Versiones', count: contract.versions?.length || 1 },
    { id: 'signatures', label: 'Firmas' },
    { id: 'attachments', label: 'Adjuntos', count: contract.adjuntos?.length || 0 },
    { id: 'preview', label: 'Vista Previa' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                Información General
              </h4>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tipo</dt>
                  <dd className="mt-1 text-sm text-gray-900 flex items-center">
                    <span className="mr-2 text-lg">{getTipoIcon(contract.tipo)}</span>
                    <span className="capitalize">{contract.tipo}</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Estado</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(contract.estado)}`}>
                      {contract.estado}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Versión</dt>
                  <dd className="mt-1 text-sm text-gray-900">v{contract.version}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Honorarios</dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900">{formatCurrency(contract.honorarios)}</dd>
                </div>
                {contract.reservaId && (
                  <div className="col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Reserva Asociada</dt>
                    <dd className="mt-1 text-sm text-blue-600 font-medium">{contract.reservaId}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                Partes del Contrato
              </h4>
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Cliente</h5>
                  <p className="text-sm text-gray-600">{contract.clienteNombre}</p>
                  {contract.clienteEmail && (
                    <p className="text-sm text-gray-500">{contract.clienteEmail}</p>
                  )}
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Propiedad</h5>
                  <p className="text-sm text-gray-600">{contract.propertyTitle}</p>
                  <p className="text-sm text-gray-500">{contract.propertyAddress}</p>
                </div>

                {contract.propietarioNombre && (
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-2">Propietario</h5>
                    <p className="text-sm text-gray-600">{contract.propietarioNombre}</p>
                  </div>
                )}
              </div>
            </div>

            {contract.fechasClaves && Object.keys(contract.fechasClaves).length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                  Fechas Clave
                </h4>
                <div className="space-y-2">
                  {Object.entries(contract.fechasClaves).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-sm font-medium text-gray-700">{key}</span>
                      <span className="text-sm text-gray-600">{new Date(value).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {contract.notas && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                  Notas
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg">
                  {contract.notas}
                </p>
              </div>
            )}

            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                Fechas Importantes
              </h4>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Creado:</dt>
                  <dd className="text-gray-900">{new Date(contract.createdAt).toLocaleString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Última actualización:</dt>
                  <dd className="text-gray-900">{new Date(contract.updatedAt).toLocaleString()}</dd>
                </div>
                {contract.generatedAt && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Generado:</dt>
                    <dd className="text-gray-900">{new Date(contract.generatedAt).toLocaleString()}</dd>
                  </div>
                )}
                {contract.signedAt && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Firmado:</dt>
                    <dd className="text-gray-900">{new Date(contract.signedAt).toLocaleString()}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        );

      case 'versions':
        return (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Historial de Versiones
            </h4>
            {contract.versions && contract.versions.length > 0 ? (
              <div className="space-y-3">
                {contract.versions.map((version) => (
                  <div key={version.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">Versión {version.version}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(version.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      Por: {version.byName}
                    </div>
                    {version.notes && (
                      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {version.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>Sin historial de versiones</p>
              </div>
            )}
          </div>
        );

      case 'signatures':
        return (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Estado de Firmas
            </h4>
            <div className="space-y-3">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Cliente: {contract.clienteNombre}</div>
                    <div className="text-sm text-gray-500">
                      {contract.estado === 'firmado' ? 'Firmado' : 'Pendiente de firma'}
                    </div>
                  </div>
                  <div>
                    {contract.estado === 'firmado' ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Firmado
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        Pendiente
                      </span>
                    )}
                  </div>
                </div>
                {contract.signedAt && (
                  <div className="mt-2 text-xs text-gray-500">
                    Firmado el: {new Date(contract.signedAt).toLocaleString()}
                  </div>
                )}
              </div>

              {contract.propietarioNombre && (
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Propietario: {contract.propietarioNombre}</div>
                      <div className="text-sm text-gray-500">
                        {contract.estado === 'firmado' ? 'Firmado' : 'Pendiente de firma'}
                      </div>
                    </div>
                    <div>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        Pendiente
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {contract.estado === 'generado' && onRequestSignature && (
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={onRequestSignature}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Solicitar Firmas
                </button>
              </div>
            )}
          </div>
        );

      case 'attachments':
        return (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Documentos Adjuntos ({contract.adjuntos?.length || 0})
            </h4>
            {contract.adjuntos && contract.adjuntos.length > 0 ? (
              <div className="space-y-2">
                {contract.adjuntos.map((adjunto) => (
                  <div key={adjunto.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-6 h-6 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.586-6.586a2 2 0 00-2.828-2.828z" />
                      </svg>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{adjunto.filename}</div>
                        <div className="text-xs text-gray-500">
                          {(adjunto.size / 1024 / 1024).toFixed(2)} MB • Subido por {adjunto.uploadedByName}
                        </div>
                      </div>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.586-6.586a2 2 0 00-2.828-2.828z" />
                </svg>
                <p>No hay documentos adjuntos</p>
              </div>
            )}
          </div>
        );

      case 'preview':
        return (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Vista Previa del Contrato
            </h4>
            <div className="border border-gray-200 rounded-lg p-6 bg-white">
              <div className="text-center mb-6">
                <h1 className="text-xl font-bold text-gray-900 uppercase">
                  Contrato de {contract.tipo}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Versión {contract.version} • {contract.estado}
                </p>
              </div>

              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                <p>
                  Por medio del presente documento, se establece un contrato de <strong>{contract.tipo}</strong> entre las siguientes partes:
                </p>

                <div className="my-4 p-4 bg-gray-50 rounded">
                  <h3 className="font-semibold mb-2">Partes del Contrato:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>Cliente:</strong> {contract.clienteNombre}</li>
                    <li><strong>Propiedad:</strong> {contract.propertyTitle} - {contract.propertyAddress}</li>
                    {contract.propietarioNombre && (
                      <li><strong>Propietario:</strong> {contract.propietarioNombre}</li>
                    )}
                  </ul>
                </div>

                <p>
                  El presente contrato se celebra por un valor de honorarios de <strong>{formatCurrency(contract.honorarios)}</strong>.
                </p>

                {contract.fechaInicio && contract.fechaVencimiento && (
                  <p>
                    Vigencia: desde el <strong>{new Date(contract.fechaInicio).toLocaleDateString()}</strong> hasta el <strong>{new Date(contract.fechaVencimiento).toLocaleDateString()}</strong>.
                  </p>
                )}

                {contract.fechasClaves && Object.keys(contract.fechasClaves).length > 0 && (
                  <div className="my-4">
                    <h3 className="font-semibold mb-2">Fechas Clave:</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {Object.entries(contract.fechasClaves).map(([key, value]) => (
                        <li key={key}>
                          <strong>{key}:</strong> {new Date(value).toLocaleDateString()}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {contract.notas && (
                  <div className="my-4 p-4 bg-yellow-50 rounded">
                    <h3 className="font-semibold mb-2">Notas Adicionales:</h3>
                    <p>{contract.notas}</p>
                  </div>
                )}

                <div className="mt-8 text-center text-sm text-gray-500">
                  <p>--- Documento generado automáticamente ---</p>
                  <p>Creado: {new Date(contract.createdAt).toLocaleDateString()}</p>
                  {contract.generatedAt && (
                    <p>Generado: {new Date(contract.generatedAt).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <span className="mr-2 text-xl">{getTipoIcon(contract.tipo)}</span>
                  Contrato #{contract.id.slice(-6)}
                </h2>
                <p className="text-sm text-gray-500">
                  {contract.propertyTitle} • {contract.clienteNombre}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {contract.estado === 'borrador' && onGenerate && (
                  <button
                    onClick={onGenerate}
                    className="p-2 text-gray-400 hover:text-green-600 rounded-full hover:bg-gray-100"
                    title="Generar contrato"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                )}
                
                {contract.estado === 'generado' && onSign && (
                  <button
                    onClick={onSign}
                    className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-gray-100"
                    title="Firmar contrato"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
                
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

            <div className="mt-3 flex items-center gap-4">
              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(contract.estado)}`}>
                {contract.estado}
              </span>
              <div className="text-lg font-bold text-gray-900">{formatCurrency(contract.honorarios)}</div>
            </div>
          </div>

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

          <div className="flex-1 overflow-y-auto px-6 py-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </>
  );
}