import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { useCreateDueDate } from '../hooks';
import { DueType, Priority } from '../types';

interface CreateDueDateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate?: string;
  onSuccess?: () => void;
}

export default function CreateDueDateDialog({ 
  open, 
  onOpenChange, 
  initialDate,
  onSuccess 
}: CreateDueDateDialogProps) {
  const { create, isCreating } = useCreateDueDate();
  const [formData, setFormData] = useState({
    type: undefined as DueType | undefined,
    title: '',
    description: '',
    date: initialDate || new Date().toISOString().split('T')[0] + 'T09:00',
    priority: 'MEDIA' as Priority,
    assigneeId: 'none',
    officeId: 'none',
    entityId: '',
    entityKind: 'TASK' as const
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.title || !formData.date) {
      alert('Por favor complete los campos obligatorios');
      return;
    }

    try {
      await create({
        type: formData.type,
        title: formData.title,
        description: formData.description || undefined,
        date: formData.date,
        priority: formData.priority,
        assigneeId: formData.assigneeId === 'none' ? undefined : formData.assigneeId,
        officeId: formData.officeId === 'none' ? undefined : formData.officeId,
        entity: formData.entityId ? {
          kind: formData.entityKind,
          id: formData.entityId
        } : undefined
      });
      
      onOpenChange(false);
      onSuccess?.();
      
      // Reset form
      setFormData({
        type: undefined as DueType | undefined,
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0] + 'T09:00',
        priority: 'MEDIA',
        assigneeId: 'none',
        officeId: 'none',
        entityId: '',
        entityKind: 'TASK'
      });
    } catch (error) {
      console.error('Error creating due date:', error);
      alert('Error al crear el vencimiento');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nuevo Vencimiento</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select value={formData.type || ''} onValueChange={(value: DueType) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OFERTA">Oferta</SelectItem>
                  <SelectItem value="RESERVA">Reserva</SelectItem>
                  <SelectItem value="CONTRATO">Contrato</SelectItem>
                  <SelectItem value="DUE_DILIGENCE">Due Diligence</SelectItem>
                  <SelectItem value="PAGO">Pago</SelectItem>
                  <SelectItem value="DOCUMENTO">Documento</SelectItem>
                  <SelectItem value="TAREA">Tarea</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridad</Label>
              <Select value={formData.priority} onValueChange={(value: Priority) => setFormData({ ...formData, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BAJA">Baja</SelectItem>
                  <SelectItem value="MEDIA">Media</SelectItem>
                  <SelectItem value="ALTA">Alta</SelectItem>
                  <SelectItem value="CRITICA">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Título del vencimiento"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción opcional"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date">Fecha y Hora *</Label>
            <Input
              id="date"
              type="datetime-local"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignee">Responsable</Label>
              <Select value={formData.assigneeId} onValueChange={(value) => setFormData({ ...formData, assigneeId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar responsable" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin asignar</SelectItem>
                  <SelectItem value="agent-1">Juan Pérez</SelectItem>
                  <SelectItem value="agent-2">María García</SelectItem>
                  <SelectItem value="agent-3">Carlos López</SelectItem>
                  <SelectItem value="agent-4">Ana Martín</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="office">Oficina</Label>
              <Select value={formData.officeId} onValueChange={(value) => setFormData({ ...formData, officeId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar oficina" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin oficina</SelectItem>
                  <SelectItem value="madrid">Madrid Centro</SelectItem>
                  <SelectItem value="barcelona">Barcelona</SelectItem>
                  <SelectItem value="valencia">Valencia</SelectItem>
                  <SelectItem value="sevilla">Sevilla</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Creando...' : 'Crear Vencimiento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}