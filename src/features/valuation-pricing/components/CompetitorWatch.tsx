import React from 'react';
import { Eye, ExternalLink, TrendingDown, TrendingUp } from 'lucide-react';
import type { CompetitorRecord } from '../types';
import { formatMoney, formatDays } from '../utils';

interface CompetitorWatchProps {
  competitors: CompetitorRecord[];
  onWatch: (id: string) => void;
  subjectPrice: number;
  subjectArea: number;
}

const CompetitorWatch: React.FC<CompetitorWatchProps> = ({ 
  competitors, 
  onWatch, 
  subjectPrice, 
  subjectArea 
}) => {
  const mockCompetitors: CompetitorRecord[] = [
    {
      id: '1',
      title: 'Piso 3 hab Centro',
      address: 'Calle Mayor, 15',
      distance: 150,
      price: 295000,
      ppsqm: 3500,
      area: 85,
      rooms: 3,
      dom: 25,
      status: 'ACTIVE',
      lastPriceChange: { date: '2024-01-15', oldPrice: 310000, newPrice: 295000, changePercent: -4.8 },
      source: 'IDEALISTA',
      lastSeen: new Date().toISOString()
    },
    {
      id: '2', 
      title: 'Apartamento reformado',
      address: 'Plaza España, 8',
      distance: 300,
      price: 315000,
      ppsqm: 3800,
      area: 83,
      rooms: 3,
      dom: 45,
      status: 'UNDER_OFFER',
      source: 'FOTOCASA',
      lastSeen: new Date().toISOString()
    }
  ];

  const data = competitors.length > 0 ? competitors : mockCompetitors;
  const subjectPpsqm = subjectPrice / subjectArea;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Competencia</h3>
        <span className="text-sm text-gray-500">{data.length} propiedades</span>
      </div>

      <div className="space-y-4">
        {data.map((comp) => (
          <div key={comp.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{comp.title || `${comp.rooms} hab, ${comp.area}m²`}</h4>
                <p className="text-sm text-gray-600">{comp.address}</p>
                <p className="text-sm text-gray-500">{comp.distance}m • {formatDays(comp.dom)} en mercado</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onWatch(comp.id)}
                  className="p-1.5 hover:bg-gray-100 rounded"
                  title="Seguir competidor"
                >
                  <Eye className="w-4 h-4 text-gray-400" />
                </button>
                {comp.url && (
                  <button className="p-1.5 hover:bg-gray-100 rounded">
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-3">
              <div>
                <p className="text-sm text-gray-600">Precio</p>
                <p className="font-semibold text-gray-900">{formatMoney(comp.price)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">€/m²</p>
                <div className="flex items-center gap-1">
                  <p className="font-semibold text-gray-900">{formatMoney(comp.ppsqm)}</p>
                  {comp.ppsqm < subjectPpsqm ? (
                    <TrendingDown className="w-3 h-3 text-green-500" />
                  ) : (
                    <TrendingUp className="w-3 h-3 text-red-500" />
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Estado</p>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  comp.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                  comp.status === 'UNDER_OFFER' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {comp.status === 'ACTIVE' ? 'Activo' : 
                   comp.status === 'UNDER_OFFER' ? 'Con oferta' : comp.status}
                </span>
              </div>
            </div>

            {comp.lastPriceChange && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Último cambio:</span>
                <span className={`font-medium ${
                  comp.lastPriceChange.changePercent < 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {comp.lastPriceChange.changePercent > 0 ? '+' : ''}
                  {comp.lastPriceChange.changePercent.toFixed(1)}% 
                  ({new Date(comp.lastPriceChange.date).toLocaleDateString('es-ES')})
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompetitorWatch;