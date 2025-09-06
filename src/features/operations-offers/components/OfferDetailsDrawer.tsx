import React from 'react';
import { Offer, OfferEvent } from '../types';
import { 
  formatCurrency, 
  formatDate, 
  formatRelativeDate,
  getOfferStatusColor, 
  getOfferStatusLabel,
  getDaysUntilExpiration,
  getOfferUrgency
} from '../utils';
import { generateMockOfferEvents } from '../apis';

interface OfferDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  offer: Offer | null;
  onAcceptOffer: (offer: Offer) => void;
  onRejectOffer: (offer: Offer) => void;
  onCounterOffer: (offer: Offer) => void;
  onEditOffer: (offer: Offer) => void;
}

export default function OfferDetailsDrawer({
  isOpen,
  onClose,
  offer,
  onAcceptOffer,
  onRejectOffer,
  onCounterOffer,
  onEditOffer
}: OfferDetailsDrawerProps) {
  const [timeline, setTimeline] = React.useState<OfferEvent[]>([]);

  React.useEffect(() => {
    if (offer) {
      // Generate mock timeline
      const events = generateMockOfferEvents(offer.id, offer);
      setTimeline(events);
    }
  }, [offer]);

  if (!isOpen || !offer) return null;

  const daysLeft = getDaysUntilExpiration(offer.venceEl);
  const urgency = getOfferUrgency(offer);
  const canPerformActions = ['abierta', 'counter'].includes(offer.estado);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'create':
        return (
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
          </div>
        );
      case 'counter':
        return (
          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
        );
      case 'accept':
        return (
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'reject':
        return (
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case 'expire':
        return (
          <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
      <div className="bg-white h-full w-full max-w-2xl shadow-xl flex flex-col">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Detalles de la Oferta</h2>
              <p className="text-sm text-gray-600">#{offer.id}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Status and Urgency */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getOfferStatusColor(offer.estado)}`}>
                {getOfferStatusLabel(offer.estado)}
              </span>
              
              {urgency === 'high' && (
                <div className="flex items-center text-red-600">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
                  <span className="text-sm font-medium">
                    {daysLeft < 0 ? `Vencida hace ${Math.abs(daysLeft)} días` : `Vence en ${daysLeft} días`}
                  </span>
                </div>
              )}
            </div>

            <div className="text-3xl font-bold text-gray-900 mb-1">
              {formatCurrency(offer.importe)}
            </div>
            
            {offer.propertyPrice && (
              <div className="text-sm text-gray-600">
                {offer.importe < offer.propertyPrice 
                  ? `${formatCurrency(offer.propertyPrice - offer.importe)} por debajo del precio` 
                  : offer.importe === offer.propertyPrice 
                    ? 'Igual al precio de venta' 
                    : `${formatCurrency(offer.importe - offer.propertyPrice)} por encima del precio`
                }
                <span className="ml-2 text-gray-500">
                  ({Math.round((offer.importe / offer.propertyPrice) * 100)}% del precio)
                </span>
              </div>
            )}
          </div>

          {/* Offer Details */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Información de la Oferta</h3>
            
            <div className="grid grid-cols-1 gap-4">
              {/* Client */}
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 h-10 w-10">
                  <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                    {offer.clienteNombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{offer.clienteNombre}</p>
                  <div className="text-sm text-gray-500">
                    {offer.clienteEmail && <div>{offer.clienteEmail}</div>}
                    {offer.clienteTelefono && <div>{offer.clienteTelefono}</div>}
                  </div>
                </div>
              </div>

              {/* Property */}
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-900">{offer.propertyTitle}</p>
                <p className="text-sm text-gray-600">{offer.propertyAddress}</p>
                {offer.propertyPrice && (
                  <p className="text-sm font-semibold text-blue-600 mt-1">
                    Precio: {formatCurrency(offer.propertyPrice)}
                  </p>
                )}
              </div>

              {/* Dates */}
              <div className="border-t pt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Creada</p>
                  <p className="text-sm font-medium">{formatDate(offer.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Vence</p>
                  <p className="text-sm font-medium">{formatDate(offer.venceEl)}</p>
                </div>
              </div>

              {/* Agent */}
              <div className="border-t pt-4">
                <p className="text-xs text-gray-500">Agente responsable</p>
                <p className="text-sm font-medium">{offer.agenteNombre}</p>
              </div>
            </div>
          </div>

          {/* Conditions */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Condiciones</h3>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-700">{offer.condiciones}</p>
            </div>
          </div>

          {/* Notes */}
          {offer.notas && (
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Notas</h3>
              <div className="bg-yellow-50 rounded-lg p-3">
                <p className="text-sm text-gray-700">{offer.notas}</p>
              </div>
            </div>
          )}

          {/* Counter Offers */}
          {offer.counterOffers && offer.counterOffers.length > 0 && (
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Contraofertas ({offer.counterOffers.length})
              </h3>
              <div className="space-y-3">
                {offer.counterOffers.map((counter, index) => (
                  <div key={counter.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-yellow-800">
                        Contraoferta #{index + 1}
                      </span>
                      <span className="text-xs text-yellow-600">
                        {formatRelativeDate(counter.createdAt)}
                      </span>
                    </div>
                    <div className="text-lg font-bold text-yellow-900 mb-1">
                      {formatCurrency(counter.importe)}
                    </div>
                    <p className="text-sm text-yellow-700 mb-2">{counter.condiciones}</p>
                    {counter.notas && (
                      <p className="text-xs text-yellow-600 italic">{counter.notas}</p>
                    )}
                    <p className="text-xs text-yellow-600 mt-1">
                      Por: {counter.createdByName}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="px-6 py-4">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Timeline de Negociación</h3>
            <div className="flow-root">
              <ul className="-mb-8">
                {timeline.map((event, eventIdx) => (
                  <li key={event.id}>
                    <div className="relative pb-8">
                      {eventIdx !== timeline.length - 1 && (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          {getEventIcon(event.type)}
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-900">
                              <span className="font-medium">{event.byName}</span>{' '}
                              {event.notes}
                            </p>
                            {event.data && (
                              <div className="mt-2 text-xs text-gray-500">
                                {event.data.importe && (
                                  <div>Importe: {formatCurrency(event.data.importe)}</div>
                                )}
                                {event.data.condiciones && (
                                  <div className="mt-1 italic">"{event.data.condiciones}"</div>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="text-right text-xs whitespace-nowrap text-gray-500">
                            {formatRelativeDate(event.at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <button
              onClick={() => onEditOffer(offer)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Editar oferta
            </button>
            
            {canPerformActions && (
              <div className="flex space-x-3">
                <button
                  onClick={() => onRejectOffer(offer)}
                  className="px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Rechazar
                </button>
                
                <button
                  onClick={() => onCounterOffer(offer)}
                  className="px-3 py-2 border border-yellow-300 rounded-md text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  Contraoferta
                </button>
                
                <button
                  onClick={() => onAcceptOffer(offer)}
                  className="px-3 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Aceptar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}