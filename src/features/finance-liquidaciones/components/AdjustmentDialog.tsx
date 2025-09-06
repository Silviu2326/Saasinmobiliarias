import React, { useState } from 'react';
import { X, Plus, DollarSign, Percent } from 'lucide-react';
import type { AdjustmentType } from '../types';
import { validateAdjustment } from '../schema';
import { formatCurrency } from '../utils';

interface AdjustmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (adjustment: {
    type: AdjustmentType;
    value: number;
    reason: string;
  }) => void;
  lineId: string;
  currentAmount: number;
  lineName?: string;
}

export const AdjustmentDialog: React.FC<AdjustmentDialogProps> = ({
  isOpen,
  onClose,
  onApply,
  lineId,
  currentAmount,
  lineName
}) => {
  const [formData, setFormData] = useState({
    type: 'AMOUNT' as AdjustmentType,
    value: 0,
    reason: ''
  });
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = () => {
    const validation = validateAdjustment(formData);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors([]);
    onApply(formData);
    onClose();
    setFormData({ type: 'AMOUNT', value: 0, reason: '' });
  };

  const calculateImpact = () => {
    if (formData.type === 'AMOUNT') {
      return formData.value;
    } else {
      return currentAmount * (formData.value / 100);
    }
  };

  const newAmount = currentAmount + calculateImpact();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Aplicar ajuste</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
              <X className="h-4 w-4" />
            </button>
          </div>

          {lineName && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Línea: <span className="font-medium text-gray-900">{lineName}</span></p>
              <p className="text-sm text-gray-600">Importe actual: <span className="font-medium text-gray-900">{formatCurrency(currentAmount)}</span></p>
            </div>
          )}

          {errors.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <ul className="text-red-700 text-sm space-y-1">
                {errors.map((error, index) => <li key={index}>• {error}</li>)}
              </ul>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de ajuste</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="AMOUNT"
                    checked={formData.type === 'AMOUNT'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as AdjustmentType })}
                    className="mr-2"
                  />
                  <DollarSign className="h-4 w-4 mr-1" />
                  Importe fijo
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="PERCENT"
                    checked={formData.type === 'PERCENT'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as AdjustmentType })}
                    className="mr-2"
                  />
                  <Percent className="h-4 w-4 mr-1" />
                  Porcentaje
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {formData.type === 'AMOUNT' ? 'Importe' : 'Porcentaje'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={formData.type === 'AMOUNT' ? '0.00' : '0'}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <span className="text-gray-500 text-sm">
                    {formData.type === 'AMOUNT' ? '€' : '%'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Motivo del ajuste</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Explique el motivo de este ajuste..."
              />
            </div>

            {/* Vista previa del impacto */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Vista previa del ajuste</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Importe actual:</span>
                  <span className="font-medium text-blue-900">{formatCurrency(currentAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Ajuste:</span>
                  <span className={`font-medium ${
                    calculateImpact() >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {calculateImpact() >= 0 ? '+' : ''}{formatCurrency(calculateImpact())}
                  </span>
                </div>
                <div className="flex justify-between border-t border-blue-200 pt-1">
                  <span className="text-blue-700 font-medium">Nuevo importe:</span>
                  <span className="font-medium text-blue-900">{formatCurrency(newAmount)}</span>
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Aplicar ajuste
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};