import React from 'react';
import { Offer } from '../types';
import { 
  formatCurrency, 
  formatDate, 
  getOfferStatusColor, 
  getOfferStatusLabel, 
  getDaysUntilExpiration,
  getOfferUrgency 
} from '../utils';

interface OffersTableProps {
  offers: Offer[];
  selectedIds: string[];
  onToggleSelection: (id: string) => void;
  onToggleAll: (ids: string[], checked: boolean) => void;
  isAllSelected: boolean;
  isPartiallySelected: boolean;
  onOfferClick: (offer: Offer) => void;
  onAcceptOffer: (offer: Offer) => void;
  onRejectOffer: (offer: Offer) => void;
  onCounterOffer: (offer: Offer) => void;
  isLoading: boolean;
}

export default function OffersTable({
  offers,
  selectedIds,
  onToggleSelection,
  onToggleAll,
  isAllSelected,
  isPartiallySelected,
  onOfferClick,
  onAcceptOffer,
  onRejectOffer,
  onCounterOffer,
  isLoading
}: OffersTableProps) {
  const getUrgencyIndicator = (offer: Offer) => {
    const urgency = getOfferUrgency(offer);
    const daysLeft = getDaysUntilExpiration(offer.venceEl);
    
    if (urgency === 'high') {
      return (
        <div className="flex items-center">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-1"></div>
          <span className="text-xs text-red-600">
            {daysLeft < 0 ? `${Math.abs(daysLeft)}d vencida` : `${daysLeft}d restantes`}
          </span>
        </div>
      );
    } else if (urgency === 'medium') {
      return (
        <div className="flex items-center">
          <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
          <span className="text-xs text-yellow-600">{daysLeft}d restantes</span>
        </div>
      );
    }
    
    return (
      <span className="text-xs text-gray-500">{daysLeft}d restantes</span>
    );
  };

  const canPerformAction = (offer: Offer, action: string) => {
    switch (action) {
      case 'accept':
        return ['abierta', 'counter'].includes(offer.estado);
      case 'reject':
        return ['abierta', 'counter'].includes(offer.estado);
      case 'counter':
        return ['abierta', 'counter'].includes(offer.estado);
      default:
        return false;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <svg className="animate-spin w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="text-gray-600">Cargando ofertas...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay ofertas</h3>
            <p className="text-gray-600">
              No se encontraron ofertas que coincidan con los filtros actuales.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isPartiallySelected;
                  }}
                  onChange={(e) => onToggleAll(offers.map(o => o.id), e.target.checked)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Propiedad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Importe
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Agente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vencimiento
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {offers.map((offer) => (
              <tr
                key={offer.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onOfferClick(offer)}
              >
                <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(offer.id)}
                    onChange={() => onToggleSelection(offer.id)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(offer.createdAt)}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                        {offer.clienteNombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {offer.clienteNombre}
                      </div>
                      {offer.clienteEmail && (
                        <div className="text-sm text-gray-500">
                          {offer.clienteEmail}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                    {offer.propertyTitle}
                  </div>
                  <div className="text-sm text-gray-500 max-w-xs truncate">
                    {offer.propertyAddress}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="font-semibold">
                    {formatCurrency(offer.importe)}
                  </div>
                  {offer.propertyPrice && (
                    <div className="text-xs text-gray-500">
                      vs {formatCurrency(offer.propertyPrice)}
                    </div>
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOfferStatusColor(offer.estado)}`}>
                    {getOfferStatusLabel(offer.estado)}
                  </span>
                  {offer.counterOffers && offer.counterOffers.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      {offer.counterOffers.length} contraoferta{offer.counterOffers.length > 1 ? 's' : ''}
                    </div>
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {offer.agenteNombre}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDate(offer.venceEl)}
                  </div>
                  <div className="mt-1">
                    {getUrgencyIndicator(offer)}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end space-x-2">
                    {canPerformAction(offer, 'accept') && (
                      <button
                        onClick={() => onAcceptOffer(offer)}
                        className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                        title="Aceptar oferta"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    )}
                    
                    {canPerformAction(offer, 'counter') && (
                      <button
                        onClick={() => onCounterOffer(offer)}
                        className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        title="Contraoferta"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                      </button>
                    )}
                    
                    {canPerformAction(offer, 'reject') && (
                      <button
                        onClick={() => onRejectOffer(offer)}
                        className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                        title="Rechazar oferta"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                    
                    <button
                      onClick={() => onOfferClick(offer)}
                      className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title="Ver detalles"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}