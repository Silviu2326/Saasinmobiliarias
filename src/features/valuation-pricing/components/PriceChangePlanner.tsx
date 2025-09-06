import React from 'react';
import { Calendar, Clock } from 'lucide-react';

const PriceChangePlanner: React.FC<{ plan?: any; onCreatePlan?: any; currentPrice: number }> = ({ currentPrice }) => (
  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
    <div className="flex items-center gap-2 mb-4">
      <Calendar className="w-5 h-5 text-green-500" />
      <h3 className="text-lg font-semibold text-gray-900">Plan de Cambios</h3>
    </div>
    <div className="text-center py-8 text-gray-500">
      <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
      <p>Plan de cambios de precio</p>
      <p className="text-sm">Precio actual: {currentPrice.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
    </div>
  </div>
);

export default PriceChangePlanner;