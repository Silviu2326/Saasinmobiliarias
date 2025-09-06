import React from 'react';
import { Match } from '../apis';

interface MatchesPanelProps {
  matches: Match[];
  onAddToWishlist: (inmuebleId: string) => void;
  onShare: (inmuebleId: string) => void;
  onScheduleVisit: (inmuebleId: string) => void;
}

export default function MatchesPanel({
  matches,
  onAddToWishlist,
  onShare,
  onScheduleVisit
}: MatchesPanelProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        Inmuebles Compatibles ({matches.length})
      </h3>
      
      <div className="grid gap-4">
        {matches.map((match) => (
          <div key={match.inmuebleId} className="bg-white border rounded-lg p-4 hover:shadow-lg transition-shadow">
            <div className="flex gap-4">
              {match.imagen && (
                <img
                  src={match.imagen}
                  alt={match.titulo}
                  className="w-24 h-24 object-cover rounded-md"
                />
              )}
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{match.titulo}</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(match.score)}`}>
                    {match.score}% match
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex gap-4">
                    <span className="font-semibold text-lg text-gray-900">
                      {new Intl.NumberFormat('es-ES').format(match.precio)}€
                    </span>
                    <span>{match.zona}</span>
                    <span>{match.m2}m²</span>
                    <span>{match.habitaciones} hab</span>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => onAddToWishlist(match.inmuebleId)}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => onShare(match.inmuebleId)}
                    className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Compartir
                  </button>
                  <button
                    onClick={() => onScheduleVisit(match.inmuebleId)}
                    className="px-3 py-1 text-sm bg-purple-500 text-white rounded hover:bg-purple-600"
                  >
                    Agendar Visita
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {matches.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No se encontraron inmuebles compatibles
        </div>
      )}
    </div>
  );
}