import React, { useState } from 'react';
import { X, CreditCard, Banknote, MoreHorizontal } from 'lucide-react';
import type { PayoutMethod } from '../types';
import { validatePayout } from '../schema';
import { formatCurrency } from '../utils';

interface PayoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (payout: {
    method: PayoutMethod;
    iban?: string;
    concept?: string;
  }) => void;
  agentId: string;
  agentName: string;
  netAmount: number;
}

export const PayoutDialog: React.FC<PayoutDialogProps> = ({
  isOpen,
  onClose,
  onGenerate,
  agentId,
  agentName,
  netAmount
}) => {
  const [formData, setFormData] = useState({
    method: 'TRANSFER' as PayoutMethod,
    iban: '',
    concept: `Liquidación comisiones - ${agentName}`
  });
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = () => {
    const payoutData = {
      ...formData,
      net: netAmount
    };

    const validation = validatePayout(payoutData);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors([]);
    onGenerate(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Generar pago</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Agente: <span className="font-medium text-gray-900">{agentName}</span></p>
            <p className="text-sm text-gray-600">Importe: <span className="font-medium text-gray-900">{formatCurrency(netAmount)}</span></p>
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
              <label className="block text-sm font-medium text-gray-700 mb-3">Método de pago</label>
              <div className="space-y-2">
                <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="method"
                    value="TRANSFER"
                    checked={formData.method === 'TRANSFER'}
                    onChange={(e) => setFormData({ ...formData, method: e.target.value as PayoutMethod })}
                    className="mr-3"
                  />
                  <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Transferencia bancaria</div>
                    <div className="text-xs text-gray-500">Pago directo a cuenta bancaria</div>
                  </div>
                </label>

                <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="method"
                    value="CASH"
                    checked={formData.method === 'CASH'}
                    onChange={(e) => setFormData({ ...formData, method: e.target.value as PayoutMethod })}
                    className="mr-3"
                  />
                  <Banknote className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Efectivo</div>
                    <div className="text-xs text-gray-500">Pago en efectivo</div>
                  </div>
                </label>

                <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="method"
                    value="OTHER"
                    checked={formData.method === 'OTHER'}
                    onChange={(e) => setFormData({ ...formData, method: e.target.value as PayoutMethod })}
                    className="mr-3"
                  />
                  <MoreHorizontal className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Otro</div>
                    <div className="text-xs text-gray-500">Otro método de pago</div>
                  </div>
                </label>
              </div>
            </div>

            {formData.method === 'TRANSFER' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">IBAN</label>
                <input
                  type="text"
                  value={formData.iban}
                  onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ES00 0000 0000 0000 0000 0000"
                  maxLength={34}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Concepto</label>
              <input
                type="text"
                value={formData.concept}
                onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Concepto del pago"
              />
            </div>

            {/* Resumen */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Resumen del pago</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Método:</span>
                  <span className="font-medium text-blue-900">
                    {formData.method === 'TRANSFER' ? 'Transferencia' :
                     formData.method === 'CASH' ? 'Efectivo' : 'Otro'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Importe:</span>
                  <span className="font-medium text-blue-900">{formatCurrency(netAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Beneficiario:</span>
                  <span className="font-medium text-blue-900">{agentName}</span>
                </div>
              </div>
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Generar pago
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};