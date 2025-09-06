import React, { useState } from 'react';
import { InformePropietario } from '../apis';

interface InformePanelProps {
  informe?: InformePropietario;
  onGenerar: () => void;
  onProgramar: (frecuencia: 'semanal' | 'quincenal' | 'mensual') => void;
  onEnviar: () => void;
}

export default function InformePanel({ informe, onGenerar, onProgramar, onEnviar }: InformePanelProps) {
  const [frecuencia, setFrecuencia] = useState<'semanal' | 'quincenal' | 'mensual'>('semanal');
  const [showProgramar, setShowProgramar] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Informe para Propietario</h3>
        <div className="flex gap-2">
          <button
            onClick={onGenerar}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Generar Informe
          </button>
          <button
            onClick={() => setShowProgramar(!showProgramar)}
            className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
          >
            Programar
          </button>
        </div>
      </div>

      {showProgramar && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-3">Programar envío automático</h4>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">Frecuencia</label>
              <select
                value={frecuencia}
                onChange={(e) => setFrecuencia(e.target.value as typeof frecuencia)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="semanal">Semanal</option>
                <option value="quincenal">Quincenal</option>
                <option value="mensual">Mensual</option>
              </select>
            </div>
            <button
              onClick={() => {
                onProgramar(frecuencia);
                setShowProgramar(false);
              }}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Activar
            </button>
          </div>
        </div>
      )}

      {informe && (
        <div className="bg-white border rounded-lg p-6 space-y-6">
          <div className="border-b pb-4">
            <h4 className="font-medium text-gray-900 mb-2">Período: {informe.periodo}</h4>
            <div className="grid grid-cols-3 gap-4 mt-3">
              <div>
                <div className="text-2xl font-bold text-blue-600">{informe.visitas}</div>
                <div className="text-sm text-gray-600">Visitas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{informe.guardados}</div>
                <div className="text-sm text-gray-600">Guardados</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{informe.consultas}</div>
                <div className="text-sm text-gray-600">Consultas</div>
              </div>
            </div>
          </div>

          {informe.feedback && informe.feedback.length > 0 && (
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Feedback de visitas</h5>
              <ul className="space-y-2">
                {informe.feedback.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span className="text-sm text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {informe.comparables && informe.comparables.length > 0 && (
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Inmuebles comparables</h5>
              <div className="text-sm text-gray-600">
                {informe.comparables.length} inmuebles similares en la zona
              </div>
            </div>
          )}

          {informe.pricingSugerido && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h5 className="font-medium text-gray-900 mb-1">Precio sugerido</h5>
              <div className="text-2xl font-bold text-blue-600">
                {new Intl.NumberFormat('es-ES').format(informe.pricingSugerido)}€
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Basado en el análisis de mercado actual
              </div>
            </div>
          )}

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-1">Próximo paso recomendado</h5>
            <p className="text-sm text-gray-700">{informe.proximoPaso}</p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onEnviar}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Enviar al Propietario
            </button>
          </div>
        </div>
      )}

      {!informe && (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500">
            Genera un informe para ver el resumen de actividad
          </p>
        </div>
      )}
    </div>
  );
}