import React from 'react';
import { Assumptions } from '../types';
import { formatPercent } from '../utils';

interface AssumptionsPanelProps {
  assumptions: Assumptions;
  onChange: (assumptions: Assumptions) => void;
  isEditing?: boolean;
  errors?: Record<string, string>;
}

export default function AssumptionsPanel({
  assumptions,
  onChange,
  isEditing = true,
  errors = {}
}: AssumptionsPanelProps) {
  const handleChange = (field: keyof Assumptions, value: number) => {
    onChange({
      ...assumptions,
      [field]: value
    });
  };

  const InputField = ({ 
    field, 
    label, 
    type = 'number', 
    step = 'any', 
    min = 0, 
    max, 
    format 
  }: {
    field: keyof Assumptions;
    label: string;
    type?: string;
    step?: string;
    min?: number;
    max?: number;
    format?: (value: number) => string;
  }) => {
    const value = assumptions[field] as number;
    const error = errors[field];
    
    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <div className="flex items-center space-x-2">
          <input
            type={type}
            step={step}
            min={min}
            max={max}
            value={value}
            onChange={(e) => handleChange(field, parseFloat(e.target.value) || 0)}
            disabled={!isEditing}
            className={`block w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error 
                ? 'border-red-300 focus:border-red-500' 
                : 'border-gray-300 focus:border-transparent'
            } ${!isEditing ? 'bg-gray-50' : 'bg-white'}`}
          />
          {format && (
            <span className="text-xs text-gray-500 min-w-0 flex-shrink-0">
              {format(value)}
            </span>
          )}
        </div>
        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Supuestos</h3>
        <div className="text-xs text-gray-500">
          Los cambios se guardan automáticamente
        </div>
      </div>

      <div className="space-y-6">
        {/* Tasas de Conversión */}
        <div>
          <h4 className="text-sm font-medium text-gray-800 mb-3">Tasas de Conversión</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              field="convLeadVisit"
              label="Lead → Visita"
              max={1}
              step="0.01"
              format={formatPercent}
            />
            <InputField
              field="convVisitOffer"
              label="Visita → Oferta"
              max={1}
              step="0.01"
              format={formatPercent}
            />
            <InputField
              field="convOfferReservation"
              label="Oferta → Reserva"
              max={1}
              step="0.01"
              format={formatPercent}
            />
            <InputField
              field="convReservationContract"
              label="Reserva → Contrato"
              max={1}
              step="0.01"
              format={formatPercent}
            />
          </div>
        </div>

        {/* Tickets Medios */}
        <div>
          <h4 className="text-sm font-medium text-gray-800 mb-3">Tickets Medios</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              field="avgTicketSale"
              label="Ticket Medio Venta (€)"
              step="1000"
            />
            <InputField
              field="avgTicketRent"
              label="Ticket Medio Alquiler (€)"
              step="50"
            />
          </div>
        </div>

        {/* Honorarios */}
        <div>
          <h4 className="text-sm font-medium text-gray-800 mb-3">Honorarios</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              field="feesPctSale"
              label="% Honorarios Venta"
              max={1}
              step="0.01"
              format={formatPercent}
            />
            <InputField
              field="feesPctRent"
              label="% Honorarios Alquiler"
              max={1}
              step="0.01"
              format={formatPercent}
            />
          </div>
        </div>

        {/* Operacional */}
        <div>
          <h4 className="text-sm font-medium text-gray-800 mb-3">Operacional</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              field="cycleDays"
              label="Días de Ciclo"
              step="1"
              min={1}
            />
            <InputField
              field="commissionPct"
              label="% Comisión"
              max={1}
              step="0.01"
              format={formatPercent}
            />
          </div>
        </div>

        {/* Opcionales */}
        <div>
          <h4 className="text-sm font-medium text-gray-800 mb-3">Opcionales</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              field="fixedCosts"
              label="Costos Fijos Mensuales (€)"
              step="100"
            />
            <InputField
              field="cac"
              label="CAC Estimado (€)"
              step="10"
            />
          </div>
        </div>

        {/* Resumen Global de Conversión */}
        <div className="bg-gray-50 rounded-lg p-4 mt-6">
          <h5 className="text-sm font-medium text-gray-800 mb-2">Conversión Global</h5>
          <div className="text-2xl font-bold text-blue-600">
            {formatPercent(
              assumptions.convLeadVisit *
              assumptions.convVisitOffer *
              assumptions.convOfferReservation *
              assumptions.convReservationContract
            )}
          </div>
          <p className="text-xs text-gray-600 mt-1">
            De cada 100 leads, {Math.round(
              assumptions.convLeadVisit *
              assumptions.convVisitOffer *
              assumptions.convOfferReservation *
              assumptions.convReservationContract * 100
            )} se convierten en contratos
          </p>
        </div>
      </div>
    </div>
  );
}