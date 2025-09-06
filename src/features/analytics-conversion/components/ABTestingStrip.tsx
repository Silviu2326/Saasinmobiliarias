import React, { useState } from "react";
import { ABTestVariant, ABTestResult } from "../types";
import { formatPct, formatNumber, calculateABTestResults } from "../utils";
import { validateABTesting } from "../schema";

export const ABTestingStrip: React.FC = () => {
  const [variantA, setVariantA] = useState<ABTestVariant>({
    name: "Landing A",
    impressions: 10000,
    clicks: 500,
    leads: 50,
    contracts: 5,
  });

  const [variantB, setVariantB] = useState<ABTestVariant>({
    name: "Landing B",
    impressions: 10000,
    clicks: 600,
    leads: 65,
    contracts: 8,
  });

  const [result, setResult] = useState<ABTestResult | null>(null);

  const handleCalculate = () => {
    const validation = validateABTesting({ variantA, variantB });
    
    if (!validation.success) {
      alert("Datos inválidos: " + validation.error.errors.map(e => e.message).join(", "));
      return;
    }

    const testResult = calculateABTestResults(variantA, variantB);
    setResult(testResult);
  };

  const updateVariant = (
    variant: "A" | "B",
    field: keyof ABTestVariant,
    value: string | number
  ) => {
    const numValue = typeof value === "string" ? parseInt(value) || 0 : value;
    
    if (variant === "A") {
      setVariantA(prev => ({ ...prev, [field]: field === "name" ? value : numValue }));
    } else {
      setVariantB(prev => ({ ...prev, [field]: field === "name" ? value : numValue }));
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">A/B Testing</h3>
      
      {/* Input de datos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Variante A */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre Variante A
            </label>
            <input
              type="text"
              value={variantA.name}
              onChange={(e) => updateVariant("A", "name", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Impresiones
              </label>
              <input
                type="number"
                value={variantA.impressions}
                onChange={(e) => updateVariant("A", "impressions", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Clics
              </label>
              <input
                type="number"
                value={variantA.clicks}
                onChange={(e) => updateVariant("A", "clicks", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Leads
              </label>
              <input
                type="number"
                value={variantA.leads}
                onChange={(e) => updateVariant("A", "leads", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contratos
              </label>
              <input
                type="number"
                value={variantA.contracts}
                onChange={(e) => updateVariant("A", "contracts", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Variante B */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre Variante B
            </label>
            <input
              type="text"
              value={variantB.name}
              onChange={(e) => updateVariant("B", "name", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Impresiones
              </label>
              <input
                type="number"
                value={variantB.impressions}
                onChange={(e) => updateVariant("B", "impressions", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Clics
              </label>
              <input
                type="number"
                value={variantB.clicks}
                onChange={(e) => updateVariant("B", "clicks", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Leads
              </label>
              <input
                type="number"
                value={variantB.leads}
                onChange={(e) => updateVariant("B", "leads", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contratos
              </label>
              <input
                type="number"
                value={variantB.contracts}
                onChange={(e) => updateVariant("B", "contracts", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Botón de cálculo */}
      <div className="text-center mb-6">
        <button
          onClick={handleCalculate}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          Calcular Resultado
        </button>
      </div>

      {/* Resultados */}
      {result && (
        <div className="space-y-6">
          {/* Comparativa */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {result.variants.map((variant) => {
              const ctr = variant.impressions > 0 ? (variant.clicks / variant.impressions) * 100 : 0;
              const conversionRate = variant.leads > 0 ? (variant.contracts / variant.leads) * 100 : 0;
              const isWinner = result.winner === variant.name;
              
              return (
                <div
                  key={variant.name}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isWinner
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">{variant.name}</h4>
                    {isWinner && (
                      <span className="px-2 py-1 text-xs font-bold bg-green-500 text-white rounded-full">
                        GANADOR
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">CTR:</span>
                      <span className="ml-2 font-semibold">{formatPct(ctr)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Conv. Rate:</span>
                      <span className="ml-2 font-semibold">{formatPct(conversionRate)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Leads:</span>
                      <span className="ml-2 font-semibold">{formatNumber(variant.leads)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Contratos:</span>
                      <span className="ml-2 font-semibold">{formatNumber(variant.contracts)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Resumen estadístico */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Resultado del Test</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Uplift:</span>
                <span className={`ml-2 font-bold text-lg ${
                  result.uplift > 0 ? "text-green-600" : result.uplift < 0 ? "text-red-600" : "text-gray-600"
                }`}>
                  {result.uplift > 0 ? "+" : ""}{result.uplift.toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-gray-600">Significancia:</span>
                <span className={`ml-2 font-bold text-lg ${
                  result.significance >= 95 ? "text-green-600" :
                  result.significance >= 85 ? "text-yellow-600" : "text-red-600"
                }`}>
                  {result.significance.toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-gray-600">Estado:</span>
                <span className={`ml-2 font-bold ${
                  result.significance >= 95 ? "text-green-600" : "text-yellow-600"
                }`}>
                  {result.significance >= 95 ? "Significativo" : "No concluyente"}
                </span>
              </div>
            </div>
            
            {result.significance < 95 && (
              <div className="mt-3 p-2 bg-yellow-100 rounded text-sm text-yellow-800">
                <strong>Nota:</strong> El test necesita más datos para ser estadísticamente significativo (95% de confianza).
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};