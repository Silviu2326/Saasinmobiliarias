import React from "react";
import { FunnelPoint } from "../types";
import { formatPct, formatNumber } from "../utils";

interface FunnelOverviewProps {
  funnel: FunnelPoint[];
  loading: boolean;
}

export const FunnelOverview: React.FC<FunnelOverviewProps> = ({ funnel, loading }) => {
  if (loading) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="flex justify-between">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex-1 mx-2">
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...funnel.map((p) => p.count));

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-6">Embudo de Conversión</h3>
      
      <div className="relative">
        <div className="flex items-end justify-between gap-2 mb-4" style={{ minHeight: "200px" }}>
          {funnel.map((point, index) => {
            const heightPct = (point.count / maxCount) * 100;
            const isFirst = index === 0;
            const isLast = index === funnel.length - 1;
            
            return (
              <div
                key={point.stage}
                className="flex-1 relative group"
              >
                {/* Barra del embudo */}
                <div
                  className={`
                    relative bg-gradient-to-b from-blue-500 to-blue-600
                    transition-all duration-300 hover:from-blue-600 hover:to-blue-700
                    ${isFirst ? "rounded-tl-lg" : ""}
                    ${isLast ? "rounded-tr-lg" : ""}
                  `}
                  style={{ 
                    height: `${heightPct}%`,
                    minHeight: "40px",
                    clipPath: index === 0 
                      ? "polygon(0 0, 100% 0, 95% 100%, 5% 100%)"
                      : index === funnel.length - 1
                      ? "polygon(5% 0, 95% 0, 100% 100%, 0 100%)"
                      : "polygon(5% 0, 95% 0, 90% 100%, 10% 100%)"
                  }}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="bg-gray-900 text-white text-xs rounded-lg p-3 whitespace-nowrap">
                      <div className="font-semibold mb-1">{point.stage}</div>
                      <div>Volumen: {formatNumber(point.count)}</div>
                      <div>Tasa etapa: {formatPct(point.stageRate)}</div>
                      <div>Tasa acum.: {formatPct(point.cumulativeRate)}</div>
                      {point.topChannels && (
                        <div className="mt-2 pt-2 border-t border-gray-700">
                          <div className="font-semibold mb-1">Top canales:</div>
                          {point.topChannels.slice(0, 3).map((channel) => (
                            <div key={channel.channel} className="flex justify-between gap-2">
                              <span>{channel.channel}:</span>
                              <span>{formatNumber(channel.count)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-900"></div>
                    </div>
                  </div>
                  
                  {/* Valores dentro de la barra */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <div className="text-lg font-bold">{formatNumber(point.count)}</div>
                    <div className="text-xs opacity-90">{formatPct(point.stageRate)}</div>
                  </div>
                </div>
                
                {/* Etiqueta */}
                <div className="text-center mt-2">
                  <div className="text-sm font-medium text-gray-700">{point.stage}</div>
                  <div className="text-xs text-gray-500">{formatPct(point.cumulativeRate)} acum.</div>
                </div>

                {/* Flecha de conversión */}
                {index < funnel.length - 1 && (
                  <div className="absolute top-1/2 -right-4 transform -translate-y-1/2 z-20">
                    <svg width="20" height="20" viewBox="0 0 20 20" className="text-gray-400">
                      <path
                        d="M5 10 L12 10 M12 10 L8 6 M12 10 L8 14"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Leyenda de tasas de conversión entre etapas */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 text-xs">
            {funnel.slice(0, -1).map((point, index) => {
              const nextPoint = funnel[index + 1];
              const conversionRate = point.count > 0 ? (nextPoint.count / point.count) * 100 : 0;
              
              return (
                <div key={`${point.stage}-${nextPoint.stage}`} className="flex items-center gap-1">
                  <span className="text-gray-600">{point.stage} → {nextPoint.stage}:</span>
                  <span className={`font-semibold ${conversionRate > 50 ? "text-green-600" : conversionRate > 25 ? "text-yellow-600" : "text-red-600"}`}>
                    {formatPct(conversionRate)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};