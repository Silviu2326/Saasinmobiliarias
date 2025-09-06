import React from 'react';
import { Badge } from '@/components/ui/badge';
import { LinkedEntity } from '../types';
import { ExternalLink } from 'lucide-react';

interface LinkedEntityChipProps {
  entity: LinkedEntity;
  className?: string;
  onClick?: () => void;
}

const entityConfig = {
  OFFER: {
    label: 'Oferta',
    color: '#3B82F6',
    icon: '💼'
  },
  RESERVATION: {
    label: 'Reserva',
    color: '#10B981',
    icon: '📋'
  },
  CONTRACT: {
    label: 'Contrato',
    color: '#8B5CF6',
    icon: '📝'
  },
  INVOICE: {
    label: 'Factura',
    color: '#EF4444',
    icon: '💰'
  },
  DOC: {
    label: 'Documento',
    color: '#6B7280',
    icon: '📄'
  },
  TASK: {
    label: 'Tarea',
    color: '#06B6D4',
    icon: '✅'
  }
};

export default function LinkedEntityChip({ entity, className, onClick }: LinkedEntityChipProps) {
  const config = entityConfig[entity.kind];
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClick) {
      onClick();
    } else {
      // Default behavior: navigate to entity
      console.log(`Navigate to ${entity.kind} ${entity.id}`);
    }
  };

  return (
    <Badge
      variant="outline"
      className={`cursor-pointer hover:bg-gray-50 transition-colors ${className}`}
      style={{
        borderColor: config.color,
        color: config.color
      }}
      onClick={handleClick}
    >
      <span className="mr-1">{config.icon}</span>
      <span className="text-xs font-medium">{config.label}</span>
      {entity.ref && (
        <span className="ml-1 text-xs opacity-75">#{entity.ref}</span>
      )}
      <ExternalLink className="ml-1 h-3 w-3 opacity-60" />
    </Badge>
  );
}