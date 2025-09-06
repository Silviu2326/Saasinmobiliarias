import React, { useEffect, useState } from 'react';
import { Offer, CounterOfferFormData } from '../types';
import { validateCounterOfferForm, sanitizeCounterOfferData } from '../schema';
import { formatCurrency } from '../utils';

interface CounterOfferDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CounterOfferFormData) => Promise<void>;
  offer: Offer | null;
  isLoading: boolean;
}

export default function CounterOfferDialog({
  isOpen,
  onClose,
  onSubmit,
  offer,
  isLoading
}: CounterOfferDialogProps) {
  const [formData, setFormData] = useState<Partial<CounterOfferFormData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && offer) {
      // Initialize with original offer amount as base
      setFormData({
        importe: offer.importe,
        condiciones: offer.condiciones,
        notas: ''
      });
      setErrors({});
    } else if (!isOpen) {
      setFormData({});
      setErrors({});
    }
  }, [isOpen, offer]);

  const updateField = (field: keyof CounterOfferFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!offer) return;

    // Sanitize data
    const sanitizedData = sanitizeCounterOfferData(formData);
    
    // Validate
    const validationErrors = validateCounterOfferForm(sanitizedData);
    if (validationErrors.length > 0) {
      const errorMap: Record<string, string> = {};
      validationErrors.forEach(error => {
        errorMap[error.field] = error.message;
      });
      setErrors(errorMap);
      return;
    }

    try {
      await onSubmit(sanitizedData as CounterOfferFormData);
      setFormData({});
    } catch (error) {
      console.error('Error submitting counter offer:', error);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({});
      setErrors({});
      onClose();
    }
  };

  const getDifference = () => {
    if (!offer || !formData.importe) return null;
    
    const diff = formData.importe - offer.importe;
    const percentage = Math.round((diff / offer.importe) * 100);
    
    return { amount: diff, percentage };
  };

  const difference = getDifference();

  if (!isOpen || !offer) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Contraoferta</h2>
              <p className="text-sm text-gray-600">
                Responde a la oferta de {offer.clienteNombre}
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Original Offer Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Oferta Original</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Cliente:</p>
                <p className="font-medium">{offer.clienteNombre}</p>
              </div>
              <div>
                <p className="text-gray-600">Propiedad:</p>
                <p className="font-medium">{offer.propertyTitle}</p>
              </div>
              <div>
                <p className="text-gray-600">Importe original:</p>
                <p className="font-bold text-blue-600">{formatCurrency(offer.importe)}</p>
              </div>
              <div>
                <p className="text-gray-600">Precio de venta:</p>
                <p className="font-medium">{offer.propertyPrice ? formatCurrency(offer.propertyPrice) : 'No disponible'}</p>
              </div>
            </div>
            
            <div className="mt-3">
              <p className="text-gray-600 text-sm mb-1">Condiciones originales:</p>
              <p className="text-sm bg-white p-3 rounded border">{offer.condiciones}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nuevo Importe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nuevo importe *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">€</span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.importe || ''}
                  onChange={(e) => updateField('importe', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className={`block w-full pl-8 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.importe ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="350000"
                  disabled={isLoading}
                />
              </div>
              {errors.importe && (
                <p className="mt-1 text-sm text-red-600">{errors.importe}</p>
              )}
              
              {/* Difference indicator */}
              {difference && (
                <div className="mt-2 p-3 rounded-md border">
                  <div className={`text-sm font-medium ${
                    difference.amount > 0 
                      ? 'text-green-600' 
                      : difference.amount < 0 
                        ? 'text-red-600' 
                        : 'text-gray-600'
                  }`}>
                    {difference.amount > 0 && '+'}
                    {formatCurrency(Math.abs(difference.amount))} 
                    ({difference.amount > 0 ? '+' : difference.amount < 0 ? '-' : ''}{Math.abs(difference.percentage)}%)
                    {difference.amount > 0 ? ' más que la oferta original' : 
                     difference.amount < 0 ? ' menos que la oferta original' : 
                     ' igual a la oferta original'}
                  </div>
                  
                  {offer.propertyPrice && formData.importe && (
                    <div className="text-xs text-gray-500 mt-1">
                      {formData.importe < offer.propertyPrice 
                        ? `${formatCurrency(offer.propertyPrice - formData.importe)} por debajo del precio de venta` 
                        : formData.importe === offer.propertyPrice 
                          ? 'Igual al precio de venta' 
                          : `${formatCurrency(formData.importe - offer.propertyPrice)} por encima del precio de venta`
                      }
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Nuevas Condiciones */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condiciones modificadas *
              </label>
              <textarea
                value={formData.condiciones || ''}
                onChange={(e) => updateField('condiciones', e.target.value)}
                rows={4}
                className={`block w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.condiciones ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="Describe las nuevas condiciones de la contraoferta..."
                disabled={isLoading}
              />
              {errors.condiciones && (
                <p className="mt-1 text-sm text-red-600">{errors.condiciones}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Modifica o ajusta las condiciones según la negociación
              </p>
            </div>

            {/* Notas de negociación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas de negociación
              </label>
              <textarea
                value={formData.notas || ''}
                onChange={(e) => updateField('notas', e.target.value)}
                rows={3}
                className={`block w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.notas ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="Justificación del ajuste, estrategia de negociación, puntos clave..."
                disabled={isLoading}
              />
              {errors.notas && (
                <p className="mt-1 text-sm text-red-600">{errors.notas}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Notas internas sobre la estrategia y justificación de la contraoferta
              </p>
            </div>

            {/* Quick suggestions */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Sugerencias rápidas</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {offer.propertyPrice && (
                  <>
                    <button
                      type="button"
                      onClick={() => updateField('importe', Math.round(offer.importe * 1.05))}
                      className="text-xs bg-white border border-blue-200 rounded px-2 py-1 hover:bg-blue-50 text-blue-700"
                      disabled={isLoading}
                    >
                      +5% ({formatCurrency(Math.round(offer.importe * 1.05))})
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField('importe', Math.round(offer.importe * 1.10))}
                      className="text-xs bg-white border border-blue-200 rounded px-2 py-1 hover:bg-blue-50 text-blue-700"
                      disabled={isLoading}
                    >
                      +10% ({formatCurrency(Math.round(offer.importe * 1.10))})
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField('importe', offer.propertyPrice)}
                      className="text-xs bg-white border border-blue-200 rounded px-2 py-1 hover:bg-blue-50 text-blue-700"
                      disabled={isLoading}
                    >
                      Precio venta ({formatCurrency(offer.propertyPrice)})
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md text-sm font-medium hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Enviando...</span>
                  </div>
                ) : (
                  'Enviar Contraoferta'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}