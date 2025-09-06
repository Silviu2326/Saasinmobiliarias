import { useState } from 'react';
import { Shield, Download, Trash2, Search, Clock, AlertTriangle } from 'lucide-react';
import { useDsrActions } from '../hooks';
import { dsrTypeLabel, statusToBadge, getDaysUntilDeadline, generateDsrSla, formatDate } from '../utils';
import type { DsrType } from '../types';

export function DSRActions() {
  const { createRequest, checkStatus, exportData, deleteData } = useDsrActions();
  const [activeTab, setActiveTab] = useState<'create' | 'status' | 'export' | 'delete'>('create');
  const [searchRef, setSearchRef] = useState('');
  const [statusResult, setStatusResult] = useState<any>(null);

  const [formData, setFormData] = useState({
    subject: '',
    type: 'access' as DsrType,
    contactEmail: '',
    reason: '',
  });

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    await createRequest.mutateAsync(formData);
    setFormData({
      subject: '',
      type: 'access',
      contactEmail: '',
      reason: '',
    });
  };

  const handleCheckStatus = async () => {
    if (!searchRef) return;
    const result = await checkStatus(searchRef);
    setStatusResult(result);
  };

  const handleExport = async () => {
    if (!searchRef) return;
    const result = await exportData.mutateAsync(searchRef);
    
    const blob = new Blob([JSON.stringify(result.data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dsr-export-${searchRef}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async () => {
    if (!searchRef) return;
    if (!confirm('¿Confirma la eliminación de datos? Esta acción es irreversible.')) return;
    
    await deleteData.mutateAsync(searchRef);
    setSearchRef('');
  };

  const dsrTypes: DsrType[] = ['access', 'rectification', 'erasure', 'portability', 'restriction', 'objection'];

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="border-b">
        <div className="flex">
          {[
            { id: 'create', label: 'Nueva solicitud', icon: Shield },
            { id: 'status', label: 'Ver estado', icon: Search },
            { id: 'export', label: 'Exportar datos', icon: Download },
            { id: 'delete', label: 'Eliminar datos', icon: Trash2 },
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

      <div className="p-6">
        {activeTab === 'create' && (
          <form onSubmit={handleCreateRequest} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Identificador del sujeto
              </label>
              <input
                type="email"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="email@ejemplo.com"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de solicitud
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as DsrType })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {dsrTypes.map(type => (
                  <option key={type} value={type}>
                    {dsrTypeLabel(type)}
                  </option>
                ))}
              </select>
              <div className="mt-1 text-xs text-gray-500">
                {generateDsrSla(formData.type).description}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email de contacto
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="contacto@ejemplo.com"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo (opcional)
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Describa el motivo de la solicitud..."
              />
            </div>

            <button
              type="submit"
              disabled={createRequest.isPending}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {createRequest.isPending ? 'Creando...' : 'Crear solicitud DSR'}
            </button>

            {createRequest.isSuccess && (
              <div className="p-3 bg-green-50 text-green-700 rounded-lg">
                ✓ Solicitud creada exitosamente. Referencia: {createRequest.data?.id}
              </div>
            )}
          </form>
        )}

        {(activeTab === 'status' || activeTab === 'export' || activeTab === 'delete') && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Referencia o Email
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchRef}
                  onChange={(e) => setSearchRef(e.target.value)}
                  placeholder="DSR-123456 o email@ejemplo.com"
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {activeTab === 'status' && (
                  <button
                    onClick={handleCheckStatus}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Buscar
                  </button>
                )}
                {activeTab === 'export' && (
                  <button
                    onClick={handleExport}
                    disabled={exportData.isPending}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {exportData.isPending ? 'Exportando...' : 'Exportar'}
                  </button>
                )}
                {activeTab === 'delete' && (
                  <button
                    onClick={handleDelete}
                    disabled={deleteData.isPending}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {deleteData.isPending ? 'Eliminando...' : 'Eliminar'}
                  </button>
                )}
              </div>
            </div>

            {activeTab === 'status' && statusResult && (
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Solicitud {statusResult.id}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${statusToBadge(statusResult.status).color}`}>
                    {statusToBadge(statusResult.status).label}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Tipo:</span>
                    <span className="ml-2 font-medium">{dsrTypeLabel(statusResult.type)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Sujeto:</span>
                    <span className="ml-2 font-medium">{statusResult.subject}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Creado:</span>
                    <span className="ml-2">{formatDate(statusResult.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">Vence:</span>
                    <span className="ml-2">{formatDate(statusResult.dueAt)}</span>
                    {getDaysUntilDeadline(statusResult.dueAt) < 3 && (
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>
                      {getDaysUntilDeadline(statusResult.dueAt) > 0
                        ? `Quedan ${getDaysUntilDeadline(statusResult.dueAt)} días`
                        : 'Vencido'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'export' && exportData.isSuccess && (
              <div className="p-3 bg-green-50 text-green-700 rounded-lg">
                ✓ Datos exportados exitosamente
              </div>
            )}

            {activeTab === 'delete' && deleteData.isSuccess && (
              <div className="p-3 bg-green-50 text-green-700 rounded-lg">
                ✓ Datos eliminados y registro de auditoría creado
              </div>
            )}

            {activeTab === 'delete' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-900 mb-2">⚠️ Advertencia</h4>
                <p className="text-sm text-red-700">
                  La eliminación de datos es permanente y cumple con el derecho de supresión del RGPD.
                  Se creará un registro de auditoría de esta acción.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}