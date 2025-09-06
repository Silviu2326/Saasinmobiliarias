import { useState } from 'react';
import { X, Plus, Trash2, Calendar, Mail, Clock } from 'lucide-react';
import { useAuditSchedules } from '../hooks';
import { validateSchedule, validateCronExpression } from '../schema';
import { formatCronDescription } from '../utils';
import type { Schedule, AuditQuery } from '../types';

interface SchedulerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  filters: AuditQuery;
}

export function SchedulerDialog({ isOpen, onClose, filters }: SchedulerDialogProps) {
  const { schedules, createSchedule, updateSchedule, deleteSchedule } = useAuditSchedules();
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  
  const [formData, setFormData] = useState({
    name: '',
    cron: '0 9 * * 1', // Lunes a las 9:00
    emails: [''],
    format: 'csv' as 'csv' | 'json',
    enabled: true,
  });
  
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const commonCronExpressions = [
    { cron: '0 9 * * *', label: 'Diariamente a las 9:00' },
    { cron: '0 9 * * 1', label: 'Semanalmente (Lunes 9:00)' },
    { cron: '0 9 1 * *', label: 'Mensualmente (día 1, 9:00)' },
    { cron: '0 0 1 1 *', label: 'Anualmente (1 enero, 00:00)' },
  ];

  const addEmail = () => {
    setFormData({ ...formData, emails: [...formData.emails, ''] });
  };

  const removeEmail = (index: number) => {
    const newEmails = formData.emails.filter((_, i) => i !== index);
    setFormData({ ...formData, emails: newEmails.length ? newEmails : [''] });
  };

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...formData.emails];
    newEmails[index] = value;
    setFormData({ ...formData, emails: newEmails });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const dataToValidate = {
      ...formData,
      emails: formData.emails.filter(email => email.trim() !== ''),
      filters,
    };

    const validation = validateSchedule(dataToValidate);
    const cronValidation = validateCronExpression(formData.cron);
    
    const allErrors = [...validation.errors, ...cronValidation.errors];
    
    if (allErrors.length > 0) {
      setErrors(allErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      await createSchedule({
        ...dataToValidate,
        filters,
      });
      
      // Reset form
      setFormData({
        name: '',
        cron: '0 9 * * 1',
        emails: [''],
        format: 'csv',
        enabled: true,
      });
      setErrors([]);
      setActiveTab('list');
    } catch (error) {
      setErrors(['Error al crear el horario programado']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (scheduleId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este horario?')) {
      try {
        await deleteSchedule(scheduleId);
      } catch (error) {
        console.error('Error deleting schedule:', error);
      }
    }
  };

  const toggleSchedule = async (schedule: Schedule) => {
    try {
      await updateSchedule(schedule.id, { enabled: !schedule.enabled });
    } catch (error) {
      console.error('Error updating schedule:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-50" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">Programar Informes de Auditoría</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="border-b">
            <div className="flex">
              {[
                { id: 'create', label: 'Crear Nuevo', icon: Plus },
                { id: 'list', label: 'Mis Horarios', icon: Calendar },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[70vh]">
            {activeTab === 'create' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errors.length > 0 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <ul className="text-sm text-red-700 space-y-1">
                      {errors.map((error, i) => (
                        <li key={i}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del horario
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Informe Semanal de Auditoría"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Programación
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={formData.cron}
                      onChange={(e) => setFormData({ ...formData, cron: e.target.value })}
                      placeholder="0 9 * * 1"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      required
                    />
                    <div className="text-xs text-gray-600">
                      {formatCronDescription(formData.cron)}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {commonCronExpressions.map((expr) => (
                        <button
                          key={expr.cron}
                          type="button"
                          onClick={() => setFormData({ ...formData, cron: expr.cron })}
                          className="px-2 py-1 text-xs border rounded hover:bg-gray-50 text-left"
                        >
                          {expr.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emails destinatarios
                  </label>
                  <div className="space-y-2">
                    {formData.emails.map((email, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => updateEmail(index, e.target.value)}
                          placeholder="usuario@ejemplo.com"
                          className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        {formData.emails.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeEmail(index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addEmail}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <Plus className="h-4 w-4" />
                      Añadir email
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Formato
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="csv"
                        checked={formData.format === 'csv'}
                        onChange={(e) => setFormData({ ...formData, format: e.target.value as any })}
                      />
                      CSV
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="json"
                        checked={formData.format === 'json'}
                        onChange={(e) => setFormData({ ...formData, format: e.target.value as any })}
                      />
                      JSON
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.enabled}
                      onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    />
                    Activar horario inmediatamente
                  </label>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creando...' : 'Crear Horario'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'list' && (
              <div className="space-y-4">
                {schedules.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No hay horarios programados</p>
                    <button
                      onClick={() => setActiveTab('create')}
                      className="mt-2 text-blue-600 hover:text-blue-800"
                    >
                      Crear el primero
                    </button>
                  </div>
                ) : (
                  schedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className={`border rounded-lg p-4 ${
                        schedule.enabled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{schedule.name}</h4>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${
                              schedule.enabled
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {schedule.enabled ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>

                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {formatCronDescription(schedule.cron)}
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              {schedule.emails.length} destinatario{schedule.emails.length !== 1 ? 's' : ''}
                            </div>
                            {schedule.nextRunAt && (
                              <div className="text-xs text-gray-500">
                                Próxima ejecución: {formatCronDescription(schedule.nextRunAt)}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleSchedule(schedule)}
                            className="px-3 py-1 text-xs border rounded hover:bg-gray-50"
                          >
                            {schedule.enabled ? 'Pausar' : 'Activar'}
                          </button>
                          <button
                            onClick={() => handleDelete(schedule.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}