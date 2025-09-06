import React, { useState } from 'react';
import { X, Lock, AlertTriangle } from 'lucide-react';
import { validateClosePeriod } from '../schema';
import { formatPeriod } from '../utils';

interface ClosePeriodDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (options: {
    confirmed: boolean;
    createAccountingEntry: boolean;
    accountingNotes?: string;
  }) => void;
  period: string;
  affectedSettlements: number;
  totalAmount: number;
}

export const ClosePeriodDialog: React.FC<ClosePeriodDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  period,
  affectedSettlements,
  totalAmount
}) => {
  const [formData, setFormData] = useState({
    confirmed: false,
    createAccountingEntry: true,
    accountingNotes: ''
  });
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = () => {
    const validation = validateClosePeriod(formData);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors([]);
    onConfirm(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-full">
                <Lock className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Cerrar período</h3>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 mb-1">Atención</h4>
                  <p className="text-sm text-yellow-700">
                    Esta acción cerrará el período <strong>{formatPeriod(period)}</strong> y no podrá ser revertida. 
                    Las liquidaciones del período quedarán bloqueadas para modificaciones.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Resumen del cierre</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Período:</span>
                  <span className="font-medium text-gray-900">{formatPeriod(period)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Liquidaciones afectadas:</span>
                  <span className="font-medium text-gray-900">{affectedSettlements}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Importe total:</span>
                  <span className="font-medium text-gray-900">
                    {totalAmount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {errors.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <ul className="text-red-700 text-sm space-y-1">
                {errors.map((error, index) => <li key={index}>• {error}</li>)}
              </ul>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.createAccountingEntry}
                  onChange={(e) => setFormData({ ...formData, createAccountingEntry: e.target.checked })}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Crear asiento contable automáticamente</span>
              </label>
            </div>

            {formData.createAccountingEntry && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notas contables</label>
                <textarea
                  value={formData.accountingNotes}
                  onChange={(e) => setFormData({ ...formData, accountingNotes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Notas para el asiento contable..."
                />
              </div>
            )}

            <div className="border-t border-gray-200 pt-4">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={formData.confirmed}
                  onChange={(e) => setFormData({ ...formData, confirmed: e.target.checked })}
                  className="mr-2 mt-0.5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-gray-700">
                  Confirmo que deseo cerrar el período <strong>{formatPeriod(period)}</strong>. 
                  Entiendo que esta acción no puede ser revertida.
                </span>
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formData.confirmed}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Lock className="h-4 w-4" />
              Cerrar período
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};