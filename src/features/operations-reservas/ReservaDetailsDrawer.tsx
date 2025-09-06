import React, { useState, useEffect } from 'react';
import type { Reserva, ReservaPago } from './types';
import { reservasApi } from './apis';

interface ReservaDetailsDrawerProps {
  reserva: Reserva | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onSign?: () => void;
  onCancel?: () => void;
  onGenerateContract?: (reserva: Reserva) => void;
}

type TabType = 'overview' | 'payments' | 'documents' | 'history';

export default function ReservaDetailsDrawer({
  reserva,
  isOpen,
  onClose,
  onEdit,
  onSign,
  onCancel,
  onGenerateContract
}: ReservaDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [payments, setPayments] = useState<ReservaPago[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  useEffect(() => {
    if (reserva && activeTab === 'payments') {
      loadPayments();
    }
  }, [reserva, activeTab]);

  const loadPayments = async () => {
    if (!reserva) return;
    
    setLoadingPayments(true);
    try {
      const paymentsData = await reservasApi.getReservaPayments(reserva.id);
      setPayments(paymentsData);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoadingPayments(false);
    }
  };

  if (!reserva) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-CL');
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (estado: Reserva['estado']) => {
    switch (estado) {
      case 'borrador': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'firmada': return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelada': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTipoIcon = (tipo: Reserva['tipo']) => {
    switch (tipo) {
      case 'senal': return '💰';
      case 'arras': return '🔒';
      default: return '📄';
    }
  };

  const getVencimientoStatus = (venceEl: string) => {
    const today = new Date();
    const dueDate = new Date(venceEl);
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (diffDays < 0) {
      return { color: 'text-red-600', text: `Vencida (${Math.abs(diffDays)} días)`, bgColor: 'bg-red-50' };
    } else if (diffDays <= 7) {
      return { color: 'text-yellow-600', text: `Vence en ${diffDays} días`, bgColor: 'bg-yellow-50' };
    } else {
      return { color: 'text-green-600', text: `Vence en ${diffDays} días`, bgColor: 'bg-green-50' };
    }
  };

  const vencimientoStatus = getVencimientoStatus(reserva.venceEl);

  const tabs: { id: TabType; label: string; count?: number }[] = [
    { id: 'overview', label: 'Resumen' },
    { id: 'payments', label: 'Pagos', count: payments.length },
    { id: 'documents', label: 'Documentos', count: reserva.attachments?.length || 0 },
    { id: 'history', label: 'Historial' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Estado y información básica */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                Estado de la Reserva
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Estado</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(reserva.estado)}`}>
                      {reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1)}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tipo</dt>
                  <dd className="mt-1 text-sm text-gray-900 flex items-center">
                    <span className="mr-2 text-lg">{getTipoIcon(reserva.tipo)}</span>
                    <span className="capitalize">{reserva.tipo}</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Importe</dt>
                  <dd className="mt-1 text-lg font-bold text-gray-900">{formatCurrency(reserva.importe)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Vencimiento</dt>
                  <dd className="mt-1">
                    <div className={`inline-flex px-2 py-1 rounded-md text-sm ${vencimientoStatus.bgColor} ${vencimientoStatus.color}`}>
                      {formatDate(reserva.venceEl)} - {vencimientoStatus.text}
                    </div>
                  </dd>
                </div>
              </div>
            </div>

            {/* Información de la propiedad */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                Propiedad
              </h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="font-medium text-gray-900">{reserva.propertyTitle}</div>
                <div className="text-sm text-gray-600">{reserva.propertyAddress}</div>
                {reserva.propertyPrice && (
                  <div className="text-sm text-gray-500 mt-1">
                    Precio: {formatCurrency(reserva.propertyPrice)}
                  </div>
                )}
              </div>
            </div>

            {/* Información del cliente */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                Cliente
              </h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="font-medium text-gray-900">{reserva.clienteNombre}</div>
                {reserva.clienteEmail && (
                  <div className="text-sm text-gray-600">{reserva.clienteEmail}</div>
                )}
                {reserva.clienteTelefono && (
                  <div className="text-sm text-gray-600">{reserva.clienteTelefono}</div>
                )}
              </div>
            </div>

            {/* Condiciones */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                Condiciones
              </h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{reserva.condiciones}</p>
              </div>
            </div>

            {/* Notas */}
            {reserva.notas && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                  Notas
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{reserva.notas}</p>
                </div>
              </div>
            )}

            {/* Agente */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">
                Agente Responsable
              </h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="font-medium text-gray-900">{reserva.agenteNombre}</div>
                <div className="text-sm text-gray-500">ID: {reserva.agenteId}</div>
              </div>
            </div>
          </div>
        );

      case 'payments':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                Hitos de Pago ({payments.length})
              </h4>
              <button
                onClick={loadPayments}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Actualizar
              </button>
            </div>
            
            {loadingPayments ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Cargando pagos...</p>
              </div>
            ) : payments.length > 0 ? (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{payment.concepto}</div>
                        <div className="text-sm text-gray-500">
                          Vencimiento: {formatDate(payment.dueDate)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          {formatCurrency(payment.importe)}
                        </div>
                        {payment.paidAt ? (
                          <div className="text-sm text-green-600">
                            Pagado: {formatDate(payment.paidAt)}
                          </div>
                        ) : (
                          <div className="text-sm text-red-600">Pendiente</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p>No hay hitos de pago registrados</p>
              </div>
            )}
          </div>
        );

      case 'documents':
        return (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Documentos Adjuntos ({reserva.attachments?.length || 0})
            </h4>
            {reserva.attachments && reserva.attachments.length > 0 ? (
              <div className="space-y-2">
                {reserva.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-6 h-6 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{attachment.filename}</div>
                        <div className="text-xs text-gray-500">
                          {(attachment.size / 1024).toFixed(1)} KB • Subido por {attachment.uploadedByName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDateTime(attachment.uploadedAt)}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <p>No hay documentos adjuntos</p>
              </div>
            )}
          </div>
        );

      case 'history':
        return (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Historial de la Reserva
            </h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Reserva creada</div>
                  <div className="text-sm text-gray-500">{formatDateTime(reserva.createdAt)}</div>
                </div>
              </div>

              {reserva.signedAt && (
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Reserva firmada</div>
                    <div className="text-sm text-gray-500">{formatDateTime(reserva.signedAt)}</div>
                  </div>
                </div>
              )}

              {reserva.canceledAt && (
                <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                  <div className="flex-shrink-0 w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Reserva cancelada</div>
                    <div className="text-sm text-gray-500">{formatDateTime(reserva.canceledAt)}</div>
                    {reserva.cancelReason && (
                      <div className="text-sm text-gray-600 mt-1">Motivo: {reserva.cancelReason}</div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Última actualización</div>
                  <div className="text-sm text-gray-500">{formatDateTime(reserva.updatedAt)}</div>
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
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-gray-900 truncate">
                  {reserva.propertyTitle}
                </h2>
                <p className="text-sm text-gray-500 truncate">
                  Reserva #{reserva.id} • {reserva.clienteNombre}
                </p>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                {onEdit && reserva.estado === 'borrador' && (
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
                {onSign && reserva.estado === 'borrador' && (
                  <button
                    onClick={onSign}
                    className="p-2 text-gray-400 hover:text-green-600 rounded-full hover:bg-gray-100"
                    title="Firmar"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
                {onGenerateContract && reserva.estado === 'firmada' && (
                  <button
                    onClick={() => onGenerateContract(reserva)}
                    className="p-2 text-gray-400 hover:text-purple-600 rounded-full hover:bg-gray-100"
                    title="Generar contrato"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                )}
                {onCancel && reserva.estado !== 'cancelada' && (
                  <button
                    onClick={onCancel}
                    className="p-2 text-gray-400 hover:text-yellow-600 rounded-full hover:bg-gray-100"
                    title="Cancelar"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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

            {/* Amount and status */}
            <div className="mt-3 flex items-center justify-between">
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(reserva.importe)}</div>
              <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(reserva.estado)}`}>
                {reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1)}
              </span>
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