import React from 'react';
import { BarChart3 } from 'lucide-react';
import type { MarketBands, Subject } from '../types';
import { formatMoney } from '../utils';

interface PriceBandsHistogramProps {
  bands: MarketBands | null;
  subject: Subject | null;
  currentPrice: number;
}

const PriceBandsHistogram: React.FC<PriceBandsHistogramProps> = ({ bands, subject, currentPrice }) => {
  const mockBands: MarketBands = {
    area: 'Centro Madrid',
    propertyType: 'Piso',
    sampleSize: 85,
    pricePerM2: { p25: 3200, p50: 3800, p75: 4500, p90: 5200, p95: 5800 },
    totalPrice: { p25: 280000, p50: 320000, p75: 380000, p90: 450000, p95: 520000 },
    subjectPosition: { pricePercentile: 65, band: 'P50_P75' },
    lastUpdated: new Date().toISOString()
  };

  const data = bands || mockBands;
  const subjectPpsqm = subject ? currentPrice / subject.area : 0;

  const bandData = [
    { label: '<P25', value: data.pricePerM2.p25, count: Math.round(data.sampleSize * 0.25), color: 'bg-red-200' },
    { label: 'P25-P50', value: data.pricePerM2.p50, count: Math.round(data.sampleSize * 0.25), color: 'bg-orange-200' },
    { label: 'P50-P75', value: data.pricePerM2.p75, count: Math.round(data.sampleSize * 0.25), color: 'bg-yellow-200' },
    { label: 'P75-P90', value: data.pricePerM2.p90, count: Math.round(data.sampleSize * 0.15), color: 'bg-blue-200' },
    { label: '>P90', value: data.pricePerM2.p95, count: Math.round(data.sampleSize * 0.1), color: 'bg-purple-200' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900">Bandas de Mercado</h3>
      </div>

      {/* Current Position */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-blue-600">Posición actual</p>
            <p className="font-semibold text-blue-900">{formatMoney(subjectPpsqm)}/m²</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-600">Percentil</p>
            <p className="font-semibold text-blue-900">{data.subjectPosition.pricePercentile}</p>
          </div>
        </div>
      </div>

      {/* Histogram */}
      <div className="space-y-3 mb-6">
        {bandData.map((band, index) => {
          const isSubjectBand = data.subjectPosition.band === 
            (index === 0 ? 'BELOW_P25' : 
             index === 1 ? 'P25_P50' :
             index === 2 ? 'P50_P75' :
             index === 3 ? 'P75_P90' : 'ABOVE_P90');

          return (
            <div key={band.label} className="flex items-center gap-3">
              <div className="w-16 text-sm text-gray-600">{band.label}</div>
              <div className="flex-1 relative">
                <div className="h-8 bg-gray-100 rounded">
                  <div 
                    className={`h-full ${band.color} ${isSubjectBand ? 'ring-2 ring-blue-500' : ''} rounded`}
                    style={{ width: `${(band.count / data.sampleSize) * 100}%` }}
                  ></div>
                  {isSubjectBand && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-800">TÚ ESTÁS AQUÍ</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="w-20 text-right">
                <div className="text-sm font-medium">{formatMoney(band.value, 'EUR', true)}/m²</div>
                <div className="text-xs text-gray-500">{band.count} props</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="text-sm text-gray-600">
          <p>Muestra: <strong>{data.sampleSize}</strong> propiedades similares en <strong>{data.area}</strong></p>
          <p className="mt-1">Mediana del mercado: <strong>{formatMoney(data.pricePerM2.p50)}/m²</strong></p>
        </div>
      </div>
    </div>
  );
};

export default PriceBandsHistogram;