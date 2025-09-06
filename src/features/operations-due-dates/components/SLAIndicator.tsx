import React from 'react';
import { Badge } from '@/components/ui/badge';
import { SLAState } from '../types';
import { getSLAColor } from '../utils';

interface SLAIndicatorProps {
  sla: SLAState;
  className?: string;
  showTooltip?: boolean;
}

const slaConfig = {
  ON_TIME: {
    label: 'A tiempo',
    description: 'Más de 24h restantes',
    color: '#10B981'
  },
  AT_RISK: {
    label: 'En riesgo',
    description: 'Menos de 24h restantes',
    color: '#F59E0B'
  },
  LATE: {
    label: 'Vencido',
    description: 'Fecha límite superada',
    color: '#EF4444'
  }
};

export default function SLAIndicator({ sla, className, showTooltip = true }: SLAIndicatorProps) {
  const config = slaConfig[sla];
  
  const indicator = (
    <Badge 
      variant="outline"
      className={`border-2 font-medium ${className}`}
      style={{ 
        borderColor: config.color,
        color: config.color,
        backgroundColor: `${config.color}10`
      }}
    >
      {config.label}
    </Badge>
  );

  if (showTooltip) {
    return (
      <div className="relative group">
        {indicator}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
          {config.description}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
        </div>
      </div>
    );
  }

  return indicator;
}