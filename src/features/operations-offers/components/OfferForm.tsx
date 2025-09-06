import React, { useEffect } from 'react';
import { OfferFormData } from '../types';
import { validateOfferForm, sanitizeOfferData } from '../schema';
import { useOfferForm } from '../hooks';
import { generateMockClients, generateMockProperties } from '../apis';
import { formatCurrency } from '../utils';

interface OfferFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: OfferFormData) => Promise<void>;
  initialData?: Partial<OfferFormData>;
  isLoading: boolean;
}

export default function OfferForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading
}: OfferFormProps) {
  const { formData, errors, updateField, setErrors, resetForm, setSubmitting } = useOfferForm(initialData);
  const [clients] = React.useState(generateMockClients());
  const [properties] = React.useState(generateMockProperties());
  
  // Selected property for price reference
  const selectedProperty = properties.find(p => p.id === formData.propertyId);

  useEffect(() => {
    if (isOpen) {
      resetForm(initialData);
    }
  }, [isOpen, initialData, resetForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Sanitize data
    const sanitizedData = sanitizeOfferData(formData);
    
    // Validate
    const validationErrors = validateOfferForm(sanitizedData);
    if (validationErrors.length > 0) {
      const errorMap: Record<string, string> = {};
      validationErrors.forEach(error => {
        errorMap[error.field] = error.message;
      });
      setErrors(errorMap);
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(sanitizedData as OfferFormData);
      resetForm();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {initialData?.clienteId ? 'Editar Oferta' : 'Nueva Oferta'}
              </h2>
              <p className="text-sm text-gray-600">
                Completa los detalles de la oferta de compra
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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cliente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cliente *
              </label>
              <select
                value={formData.clienteId || ''}
                onChange={(e) => updateField('clienteId', e.target.value)}
                className={`block w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.clienteId ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
                disabled={isLoading}
              >
                <option value="">Selecciona un cliente</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.nombre} - {client.email}
                  </option>
                ))}
              </select>
              {errors.clienteId && (
                <p className="mt-1 text-sm text-red-600">{errors.clienteId}</p>
              )}
            </div>

            {/* Propiedad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Propiedad *
              </label>
              <select
                value={formData.propertyId || ''}
                onChange={(e) => updateField('propertyId', e.target.value)}
                className={`block w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.propertyId ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
                disabled={isLoading}
              >
                <option value="">Selecciona una propiedad</option>
                {properties.map(property => (
                  <option key={property.id} value={property.id}>
                    {property.title} - {formatCurrency(property.price)}
                  </option>
                ))}
              </select>
              {errors.propertyId && (
                <p className="mt-1 text-sm text-red-600">{errors.propertyId}</p>
              )}
              {selectedProperty && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm font-medium text-gray-900">{selectedProperty.title}</p>
                  <p className="text-sm text-gray-600">{selectedProperty.address}</p>
                  <p className="text-sm font-semibold text-blue-600 mt-1">
                    Precio de venta: {formatCurrency(selectedProperty.price)}
                  </p>
                </div>
              )}
            </div>

            {/* Importe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Importe de la oferta *
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
                  placeholder="300000"
                  disabled={isLoading}
                />
              </div>
              {errors.importe && (
                <p className="mt-1 text-sm text-red-600">{errors.importe}</p>
              )}
              {selectedProperty && formData.importe && (
                <div className="mt-2 text-sm">
                  <span className={`font-medium ${
                    formData.importe < selectedProperty.price 
                      ? 'text-red-600' 
                      : formData.importe === selectedProperty.price 
                        ? 'text-green-600' 
                        : 'text-blue-600'
                  }`}>
                    {formData.importe < selectedProperty.price 
                      ? `${formatCurrency(selectedProperty.price - formData.importe)} por debajo del precio` 
                      : formData.importe === selectedProperty.price 
                        ? 'Igual al precio de venta' 
                        : `${formatCurrency(formData.importe - selectedProperty.price)} por encima del precio`
                    }
                  </span>
                  <span className="text-gray-500 ml-2">
                    ({Math.round((formData.importe / selectedProperty.price) * 100)}% del precio)
                  </span>
                </div>
              )}
            </div>

            {/* Fecha de vencimiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de vencimiento *
              </label>
              <input
                type="date"
                value={formData.venceEl || ''}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => updateField('venceEl', e.target.value)}
                className={`block w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.venceEl ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
                disabled={isLoading}
              />
              {errors.venceEl && (
                <p className="mt-1 text-sm text-red-600">{errors.venceEl}</p>
              )}
            </div>

            {/* Condiciones */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condiciones *
              </label>
              <textarea
                value={formData.condiciones || ''}
                onChange={(e) => updateField('condiciones', e.target.value)}
                rows={4}
                className={`block w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.condiciones ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="Ej: Oferta condicionada a obtención de hipoteca al 80% en 30 días..."
                disabled={isLoading}
              />
              {errors.condiciones && (
                <p className="mt-1 text-sm text-red-600">{errors.condiciones}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Describe las condiciones específicas de la oferta (mínimo 10 caracteres)
              </p>
            </div>

            {/* Notas adicionales */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas adicionales
              </label>
              <textarea
                value={formData.notas || ''}
                onChange={(e) => updateField('notas', e.target.value)}
                rows={3}
                className={`block w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.notas ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="Notas internas sobre la oferta, cliente o proceso de negociación..."
                disabled={isLoading}
              />
              {errors.notas && (
                <p className="mt-1 text-sm text-red-600">{errors.notas}</p>
              )}
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
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
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
                    <span>Guardando...</span>
                  </div>
                ) : (
                  initialData?.clienteId ? 'Actualizar Oferta' : 'Crear Oferta'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}