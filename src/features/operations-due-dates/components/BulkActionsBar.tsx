import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  UserCheck, 
  AlertTriangle, 
  Download,
  X
} from 'lucide-react';
import { useBulkActions } from '../hooks';
import { Priority } from '../types';

interface BulkActionsBarProps {
  selectedIds: string[];
  onClearSelection: () => void;
  onActionComplete: () => void;
  className?: string;
}

export default function BulkActionsBar({ 
  selectedIds, 
  onClearSelection, 
  onActionComplete,
  className 
}: BulkActionsBarProps) {
  const { executeAction, isProcessing } = useBulkActions();
  const [postponeDays, setPostponeDays] = useState('1');
  const [assigneeId, setAssigneeId] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIA');
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'ical'>('csv');

  if (selectedIds.length === 0) {
    return null;
  }

  const handleComplete = async () => {
    try {
      await executeAction({
        action: 'complete',
        itemIds: selectedIds
      });
      onActionComplete();
      onClearSelection();
    } catch (error) {
      console.error('Error completing items:', error);
    }
  };

  const handlePostpone = async () => {
    try {
      await executeAction({
        action: 'postpone',
        itemIds: selectedIds,
        params: { postponeDays: parseInt(postponeDays) }
      });
      onActionComplete();
      onClearSelection();
    } catch (error) {
      console.error('Error postponing items:', error);
    }
  };

  const handleReassign = async () => {
    if (!assigneeId) return;
    
    try {
      await executeAction({
        action: 'reassign',
        itemIds: selectedIds,
        params: { assigneeId }
      });
      onActionComplete();
      onClearSelection();
    } catch (error) {
      console.error('Error reassigning items:', error);
    }
  };

  const handlePriorityChange = async () => {
    try {
      await executeAction({
        action: 'priority',
        itemIds: selectedIds,
        params: { priority }
      });
      onActionComplete();
      onClearSelection();
    } catch (error) {
      console.error('Error changing priority:', error);
    }
  };

  const handleExport = async () => {
    try {
      await executeAction({
        action: 'export',
        itemIds: selectedIds,
        params: { format: exportFormat }
      });
    } catch (error) {
      console.error('Error exporting items:', error);
    }
  };

  return (
    <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 ${className}`}>
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          {/* Selection info */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {selectedIds.length} seleccionado{selectedIds.length !== 1 ? 's' : ''}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Complete */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleComplete}
              disabled={isProcessing}
              className="text-green-600 border-green-600 hover:bg-green-50"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Completar
            </Button>

            {/* Postpone */}
            <div className="flex items-center gap-1">
              <Select value={postponeDays} onValueChange={setPostponeDays}>
                <SelectTrigger className="w-16 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1d</SelectItem>
                  <SelectItem value="3">3d</SelectItem>
                  <SelectItem value="7">1s</SelectItem>
                  <SelectItem value="14">2s</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePostpone}
                disabled={isProcessing}
                className="text-amber-600 border-amber-600 hover:bg-amber-50"
              >
                <Clock className="h-4 w-4 mr-1" />
                Posponer
              </Button>
            </div>

            {/* Reassign */}
            <div className="flex items-center gap-1">
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger className="w-32 h-8">
                  <SelectValue placeholder="Agente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agent-1">Juan Pérez</SelectItem>
                  <SelectItem value="agent-2">María García</SelectItem>
                  <SelectItem value="agent-3">Carlos López</SelectItem>
                  <SelectItem value="agent-4">Ana Martín</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReassign}
                disabled={isProcessing || !assigneeId}
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                <UserCheck className="h-4 w-4 mr-1" />
                Reasignar
              </Button>
            </div>

            {/* Priority */}
            <div className="flex items-center gap-1">
              <Select value={priority} onValueChange={(value: Priority) => setPriority(value)}>
                <SelectTrigger className="w-24 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BAJA">Baja</SelectItem>
                  <SelectItem value="MEDIA">Media</SelectItem>
                  <SelectItem value="ALTA">Alta</SelectItem>
                  <SelectItem value="CRITICA">Crítica</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePriorityChange}
                disabled={isProcessing}
                className="text-orange-600 border-orange-600 hover:bg-orange-50"
              >
                <AlertTriangle className="h-4 w-4 mr-1" />
                Prioridad
              </Button>
            </div>

            {/* Export */}
            <div className="flex items-center gap-1">
              <Select value={exportFormat} onValueChange={(value: 'csv' | 'json' | 'ical') => setExportFormat(value)}>
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="ical">iCal</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={isProcessing}
                className="text-purple-600 border-purple-600 hover:bg-purple-50"
              >
                <Download className="h-4 w-4 mr-1" />
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}