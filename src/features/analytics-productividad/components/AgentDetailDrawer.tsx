import React, { useState } from 'react';
import { useProductivityFilters, useAgentDetail } from '../hooks';
import { DrawerProps } from '../types';
import { formatDateTime, formatDurationH } from '../utils';

const TABS = [
  { key: 'activity', label: 'Actividad' },
  { key: 'response', label: 'Respuesta' },
  { key: 'sla', label: 'SLA' },
  { key: 'visits', label: 'Visitas' },
  { key: 'pipeline', label: 'Pipeline' }
];

export function AgentDetailDrawer({ agentId, isOpen, onClose }: DrawerProps) {
  const { filters } = useProductivityFilters();
  const [activeTab, setActiveTab] = useState('activity');
  const { data, loading, error } = useAgentDetail(agentId, {
    from: filters.from,
    to: filters.to
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gray-500 bg-opacity-75" onClick={onClose}></div>
        
        <section className="absolute inset-y-0 right-0 flex max-w-full pl-10">
          <div className="w-screen max-w-md">
            <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
              {/* Header */}
              <div className="px-4 sm:px-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">
                      {data?.agent.name || 'Detalle del Agente'}
                    </h2>
                    {data && (
                      <div className="mt-1 text-sm text-gray-500">
                        {data.agent.team} • {data.agent.office}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    className="ml-3 flex h-7 w-7 items-center justify-center rounded-md bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-500"
                  >
                    <span className="sr-only">Cerrar panel</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {loading ? (
                <div className="flex-1 px-4 py-6 sm:px-6">
                  <div className="animate-pulse space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              ) : error ? (
                <div className="flex-1 px-4 py-6 sm:px-6">
                  <div className="text-center text-red-600">Error: {error}</div>
                </div>
              ) : data ? (
                <>
                  {/* Stats Summary */}
                  <div className="px-4 py-4 sm:px-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg bg-blue-50 p-3">
                        <div className="text-sm text-blue-600">Actividades</div>
                        <div className="text-xl font-semibold text-blue-900">
                          {data.stats.totalActivities}
                        </div>
                      </div>
                      <div className="rounded-lg bg-green-50 p-3">
                        <div className="text-sm text-green-600">Contratos</div>
                        <div className="text-xl font-semibold text-green-900">
                          {data.stats.contractsSigned}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Tabs */}
                  <div className="px-4 sm:px-6">
                    <div className="border-b border-gray-200">
                      <nav className="-mb-px flex space-x-8">
                        {TABS.map((tab) => (
                          <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                              activeTab === tab.key
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </nav>
                    </div>
                  </div>
                  
                  {/* Tab Content */}
                  <div className="flex-1 px-4 py-6 sm:px-6">
                    {activeTab === 'activity' && (
                      <div className="space-y-4">
                        <div className="text-sm font-medium text-gray-700">Actividades Recientes</div>
                        <div className="space-y-2">
                          {data.recentActivities.map((activity) => (
                            <div key={activity.id} className="rounded-lg border bg-white p-3">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full ${
                                    activity.type === 'call' ? 'bg-blue-500' :
                                    activity.type === 'email' ? 'bg-green-500' :
                                    activity.type === 'visit' ? 'bg-purple-500' :
                                    'bg-yellow-500'
                                  }`}></div>
                                  <span className="text-sm font-medium text-blue-600">
                                    {activity.ref}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  {activity.time}
                                </div>
                              </div>
                              <div className="text-sm text-gray-600">
                                {activity.type === 'call' && activity.duration && `Duración: ${activity.duration}`}
                                {activity.type === 'email' && activity.subject && activity.subject}
                                {activity.type === 'visit' && activity.location && activity.location}
                                {activity.type === 'task' && activity.description && activity.description}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {activeTab === 'response' && (
                      <div className="space-y-4">
                        <div className="text-sm font-medium text-gray-700">Tiempos de Respuesta</div>
                        <div className="space-y-3">
                          <div className="rounded-lg bg-gray-50 p-3">
                            <div className="text-sm text-gray-600">Tiempo 1er Contacto (P50)</div>
                            <div className="text-lg font-semibold text-gray-900">2.5h</div>
                          </div>
                          <div className="rounded-lg bg-gray-50 p-3">
                            <div className="text-sm text-gray-600">Tiempo 1er Contacto (P90)</div>
                            <div className="text-lg font-semibold text-gray-900">8.2h</div>
                          </div>
                          <div className="rounded-lg bg-gray-50 p-3">
                            <div className="text-sm text-gray-600">Tiempo a 1era Visita</div>
                            <div className="text-lg font-semibold text-gray-900">1.8d</div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {activeTab === 'sla' && (
                      <div className="space-y-4">
                        <div className="text-sm font-medium text-gray-700">Cumplimiento SLA</div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between rounded-lg bg-green-50 p-3">
                            <div>
                              <div className="text-sm text-green-600">SLA Contacto</div>
                              <div className="text-xs text-green-500">≤ 4 horas</div>
                            </div>
                            <div className="text-lg font-semibold text-green-900">94%</div>
                          </div>
                          <div className="flex items-center justify-between rounded-lg bg-yellow-50 p-3">
                            <div>
                              <div className="text-sm text-yellow-600">SLA Seguimiento</div>
                              <div className="text-xs text-yellow-500">≤ 2 días</div>
                            </div>
                            <div className="text-lg font-semibold text-yellow-900">87%</div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {activeTab === 'visits' && (
                      <div className="space-y-4">
                        <div className="text-sm font-medium text-gray-700">Visitas de Campo</div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-lg bg-gray-50 p-3 text-center">
                            <div className="text-lg font-semibold text-gray-900">{data.stats.visitsCompleted}</div>
                            <div className="text-xs text-gray-600">Completadas</div>
                          </div>
                          <div className="rounded-lg bg-gray-50 p-3 text-center">
                            <div className="text-lg font-semibold text-gray-900">92%</div>
                            <div className="text-xs text-gray-600">Ratio Éxito</div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {activeTab === 'pipeline' && (
                      <div className="space-y-4">
                        <div className="text-sm font-medium text-gray-700">Estado del Pipeline</div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between rounded-lg border bg-white p-3">
                            <span className="text-sm text-gray-600">Leads Activos</span>
                            <span className="font-medium">42</span>
                          </div>
                          <div className="flex items-center justify-between rounded-lg border bg-white p-3">
                            <span className="text-sm text-gray-600">Deals Abiertos</span>
                            <span className="font-medium">12</span>
                          </div>
                          <div className="flex items-center justify-between rounded-lg border bg-white p-3">
                            <span className="text-sm text-gray-600">Ofertas Creadas</span>
                            <span className="font-medium">{data.stats.offersCreated}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Pending Tasks */}
                    {activeTab === 'activity' && data.pendingTasks.length > 0 && (
                      <div className="mt-6 space-y-2">
                        <div className="text-sm font-medium text-gray-700">Tareas Pendientes</div>
                        <div className="space-y-2">
                          {data.pendingTasks.map((task) => (
                            <div key={task.id} className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-blue-600">
                                  {task.ref}
                                </span>
                                <span className="text-xs text-red-600">
                                  Vence: {formatDateTime(task.due)}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600">
                                {task.description}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 px-4 py-6 sm:px-6">
                  <div className="text-center text-gray-500">No hay datos disponibles</div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}