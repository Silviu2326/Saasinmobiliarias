import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, CheckCircle, Clock, UserCheck, Edit } from 'lucide-react';
import { DueDateItem } from '../types';
import SLAIndicator from './SLAIndicator';
import LinkedEntityChip from './LinkedEntityChip';
import { formatDateTime, getDueTypeIcon, getPriorityColor, getStatusColor } from '../utils';

interface DueDatesTableProps {
  items: DueDateItem[];
  selectedIds: string[];
  onSelectionChange: (itemId: string) => void;
  onSelectAll: () => void;
  onItemClick: (item: DueDateItem) => void;
  onItemEdit: (item: DueDateItem) => void;
  className?: string;
}

export default function DueDatesTable({
  items,
  selectedIds,
  onSelectionChange,
  onSelectAll,
  onItemClick,
  onItemEdit,
  className
}: DueDatesTableProps) {
  const allSelected = items.length > 0 && selectedIds.length === items.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < items.length;

  const handleComplete = async (item: DueDateItem, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Complete item:', item.id);
  };

  const handlePostpone = async (item: DueDateItem, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Postpone item:', item.id);
  };

  const handleReassign = async (item: DueDateItem, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Reassign item:', item.id);
  };

  return (
    <div className={`rounded-md border ${className}`}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onCheckedChange={onSelectAll}
              />
            </TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Fecha/Hora</TableHead>
            <TableHead>Entidad</TableHead>
            <TableHead>Responsable</TableHead>
            <TableHead>Oficina</TableHead>
            <TableHead>Prioridad</TableHead>
            <TableHead>SLA</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Creado</TableHead>
            <TableHead className="w-16">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={12} className="text-center py-8 text-gray-500">
                <div className="flex flex-col items-center gap-2">
                  <div className="text-4xl">📋</div>
                  <p>No se encontraron elementos</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            items.map(item => {
              const isSelected = selectedIds.includes(item.id);
              
              return (
                <TableRow
                  key={item.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => onItemClick(item)}
                >
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onSelectionChange(item.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{getDueTypeIcon(item.type)}</span>
                      <Badge variant="outline" className="text-xs">
                        {item.type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm">{item.title}</div>
                      {item.description && (
                        <div className="text-xs text-gray-500 line-clamp-1">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm">
                      {formatDateTime(item.date)}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {item.entity ? (
                      <LinkedEntityChip entity={item.entity} />
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm">
                      {item.assigneeName || (
                        <span className="text-gray-400">Sin asignar</span>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm">
                      {item.officeId || (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="text-xs"
                      style={{ 
                        borderColor: getPriorityColor(item.priority),
                        color: getPriorityColor(item.priority)
                      }}
                    >
                      {item.priority}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <SLAIndicator sla={item.sla} />
                  </TableCell>
                  
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="text-xs"
                      style={{
                        borderColor: getStatusColor(item.status),
                        color: getStatusColor(item.status)
                      }}
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-xs text-gray-500">
                      {formatDateTime(item.createdAt, false)}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      {item.status === 'PENDIENTE' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-green-600"
                            onClick={(e) => handleComplete(item, e)}
                            title="Completar"
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-amber-600"
                            onClick={(e) => handlePostpone(item, e)}
                            title="Posponer"
                          >
                            <Clock className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-blue-600"
                            onClick={(e) => handleReassign(item, e)}
                            title="Reasignar"
                          >
                            <UserCheck className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onItemEdit(item);
                        }}
                        title="Editar"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}