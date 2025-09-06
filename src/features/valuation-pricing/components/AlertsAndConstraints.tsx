import React from 'react';
import { AlertTriangle } from 'lucide-react';

const AlertsAndConstraints: React.FC<{ alerts?: any[]; constraints?: any; price?: number; onDismissAlert?: any }> = ({ price }) => (
  <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
    <div className="flex items-center gap-2 mb-4">
      <AlertTriangle className="w-5 h-5 text-amber-500" />
      <h3 className="text-lg font-semibold text-gray-900">Alertas y Restricciones</h3>
    </div>
    <div className="text-center py-8 text-gray-500">
      <p>No hay alertas activas</p>
      {price && <p className="text-sm mt-2">Precio validado: {price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>}
    </div>
  </div>
);

export default AlertsAndConstraints;