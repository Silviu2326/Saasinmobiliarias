import React, { useState } from "react";
import { formatMoney } from "../utils";
import type { Charge } from "../types";

interface RefundDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRefund: (amount?: number, reason?: string) => Promise<void>;
  charge: Charge | null;
  loading: boolean;
}

export function RefundDialog({ isOpen, onClose, onRefund, charge, loading }: RefundDialogProps) {
  const [refundType, setRefundType] = useState<"full" | "partial">("full");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!isOpen || !charge) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const refundAmount = refundType === "full" ? undefined : parseFloat(amount);
      
      if (refundType === "partial" && (!refundAmount || refundAmount <= 0 || refundAmount > charge.amount)) {
        setError("El importe de reembolso debe ser mayor a 0 y menor o igual al cobro original");
        return;
      }

      await onRefund(refundAmount, reason.trim() || undefined);
    } catch (error: any) {
      setError(error.message || "Error al procesar el reembolso");
    }
  };

  const handleClose = () => {
    if (!loading) {
      setRefundType("full");
      setAmount("");
      setReason("");
      setError("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Reembolsar Cobro
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Charge Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Cliente:</span>
              <span className="text-sm font-medium text-gray-900">{charge.customer}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Importe original:</span>
              <span className="text-sm font-medium text-gray-900">
                {formatMoney(charge.amount, charge.currency)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">ID del cobro:</span>
              <span className="text-sm font-mono text-gray-700">{charge.id}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Refund Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tipo de reembolso
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="refundType"
                    value="full"
                    checked={refundType === "full"}
                    onChange={(e) => setRefundType(e.target.value as "full" | "partial")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Reembolso completo ({formatMoney(charge.amount, charge.currency)})
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="refundType"
                    value="partial"
                    checked={refundType === "partial"}
                    onChange={(e) => setRefundType(e.target.value as "full" | "partial")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Reembolso parcial</span>
                </label>
              </div>
            </div>

            {/* Partial Amount */}
            {refundType === "partial" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Importe a reembolsar
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={charge.amount}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                    placeholder="0.00"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">{charge.currency}</span>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Máximo: {formatMoney(charge.amount, charge.currency)}
                </p>
              </div>
            )}

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo del reembolso (opcional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Describe el motivo del reembolso..."
                maxLength={500}
              />
              <p className="mt-1 text-xs text-gray-500">{reason.length}/500 caracteres</p>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Procesando..." : "Reembolsar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}