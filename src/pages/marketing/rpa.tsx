import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCw, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  Plus,
  Settings,
  Activity,
  Link2,
  Bell,
  BarChart3,
  Calendar,
  Filter,
  Download,
  Upload,
  Eye,
  Edit2,
  Trash2,
  RefreshCw,
  Shield,
  Users,
  Database,
  Zap,
  TrendingUp,
  Timer,
  AlertTriangle
} from 'lucide-react';

interface ProcessStats {
  total: number;
  active: number;
  completed: number;
  failed: number;
  queued: number;
  timeSaved: number;
  errorReduction: number;
}

interface RPAProcess {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'completed' | 'failed' | 'queued' | 'paused';
  lastRun: string;
  nextRun?: string;
  duration: number;
  success: number;
  errors: number;
  priority: 'high' | 'medium' | 'low';
  schedule?: string;
}

interface Integration {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  totalSyncs: number;
  errors: number;
}

interface ExecutionLog {
  id: string;
  processId: string;
  processName: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: 'success' | 'failed' | 'warning';
  details: string;
  retries: number;
}

export default function RPAAutomation() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'processes' | 'integrations' | 'monitor' | 'settings'>('dashboard');
  const [selectedProcess, setSelectedProcess] = useState<string | null>(null);
  const [showNewProcessModal, setShowNewProcessModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const stats: ProcessStats = {
    total: 156,
    active: 12,
    completed: 128,
    failed: 4,
    queued: 8,
    timeSaved: 342,
    errorReduction: 87
  };

  const processes: RPAProcess[] = [
    {
      id: '1',
      name: 'Publicación masiva en portales',
      type: 'Publicación',
      status: 'active',
      lastRun: '2024-01-15 14:30',
      nextRun: '2024-01-15 16:30',
      duration: 45,
      success: 98,
      errors: 2,
      priority: 'high',
      schedule: 'Cada 2 horas'
    },
    {
      id: '2',
      name: 'Actualización de precios CRM',
      type: 'Sincronización',
      status: 'completed',
      lastRun: '2024-01-15 14:00',
      nextRun: '2024-01-15 18:00',
      duration: 12,
      success: 100,
      errors: 0,
      priority: 'medium',
      schedule: 'Cada 4 horas'
    },
    {
      id: '3',
      name: 'Envío de newsletters',
      type: 'Email Marketing',
      status: 'queued',
      lastRun: '2024-01-15 08:00',
      nextRun: '2024-01-15 17:00',
      duration: 20,
      success: 95,
      errors: 5,
      priority: 'medium',
      schedule: 'Diario a las 17:00'
    },
    {
      id: '4',
      name: 'Respaldo de base de datos',
      type: 'Sistema',
      status: 'active',
      lastRun: '2024-01-15 03:00',
      duration: 180,
      success: 100,
      errors: 0,
      priority: 'high',
      schedule: 'Diario a las 03:00'
    },
    {
      id: '5',
      name: 'Análisis de competencia',
      type: 'Análisis',
      status: 'failed',
      lastRun: '2024-01-15 12:00',
      duration: 0,
      success: 88,
      errors: 12,
      priority: 'low',
      schedule: 'Semanal'
    }
  ];

  const integrations: Integration[] = [
    {
      id: '1',
      name: 'Idealista',
      type: 'Portal Inmobiliario',
      status: 'connected',
      lastSync: '2024-01-15 14:45',
      totalSyncs: 1247,
      errors: 3
    },
    {
      id: '2',
      name: 'Fotocasa',
      type: 'Portal Inmobiliario',
      status: 'connected',
      lastSync: '2024-01-15 14:40',
      totalSyncs: 1189,
      errors: 1
    },
    {
      id: '3',
      name: 'HubSpot CRM',
      type: 'CRM',
      status: 'connected',
      lastSync: '2024-01-15 14:30',
      totalSyncs: 3456,
      errors: 0
    },
    {
      id: '4',
      name: 'Mailchimp',
      type: 'Email Marketing',
      status: 'error',
      lastSync: '2024-01-15 10:00',
      totalSyncs: 567,
      errors: 15
    },
    {
      id: '5',
      name: 'Google Analytics',
      type: 'Analítica',
      status: 'connected',
      lastSync: '2024-01-15 14:00',
      totalSyncs: 8901,
      errors: 0
    }
  ];

  const executionLogs: ExecutionLog[] = [
    {
      id: '1',
      processId: '1',
      processName: 'Publicación masiva en portales',
      startTime: '2024-01-15 14:30:00',
      endTime: '2024-01-15 15:15:00',
      duration: 45,
      status: 'success',
      details: '250 propiedades publicadas correctamente',
      retries: 0
    },
    {
      id: '2',
      processId: '2',
      processName: 'Actualización de precios CRM',
      startTime: '2024-01-15 14:00:00',
      endTime: '2024-01-15 14:12:00',
      duration: 12,
      status: 'success',
      details: '1,234 registros actualizados',
      retries: 0
    },
    {
      id: '3',
      processId: '5',
      processName: 'Análisis de competencia',
      startTime: '2024-01-15 12:00:00',
      endTime: '2024-01-15 12:00:15',
      duration: 0,
      status: 'failed',
      details: 'Error de conexión con API externa',
      retries: 3
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'connected':
      case 'success':
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'queued':
      case 'warning':
      case 'paused':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
      case 'error':
      case 'disconnected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="h-4 w-4" />;
      case 'completed':
      case 'success':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'failed':
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      case 'queued':
        return <Clock className="h-4 w-4" />;
      case 'paused':
        return <Pause className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Procesos Totales</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-green-600 mt-1">+12% este mes</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En Ejecución</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              <div className="flex items-center mt-1">
                <div className="flex -space-x-1">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  ))}
                </div>
                <span className="text-xs text-gray-500 ml-2">Activos ahora</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Play className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tiempo Ahorrado</p>
              <p className="text-2xl font-bold text-gray-900">{stats.timeSaved}h</p>
              <p className="text-xs text-blue-600 mt-1">Este mes</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Timer className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Reducción Errores</p>
              <p className="text-2xl font-bold text-gray-900">{stats.errorReduction}%</p>
              <p className="text-xs text-green-600 mt-1">vs. manual</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Process Status Overview */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Estado de Procesos</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700">
            Ver todos →
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            <p className="text-xs text-gray-600">Completados</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-2">
              <Play className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            <p className="text-xs text-gray-600">Activos</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mb-2">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.queued}</p>
            <p className="text-xs text-gray-600">En Cola</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-2">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.failed}</p>
            <p className="text-xs text-gray-600">Fallidos</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-2">
              <Pause className="h-6 w-6 text-gray-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">4</p>
            <p className="text-xs text-gray-600">Pausados</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
          <div className="space-y-3">
            {executionLogs.slice(0, 3).map((log) => (
              <div key={log.id} className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${getStatusColor(log.status)}`}>
                  {getStatusIcon(log.status)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{log.processName}</p>
                  <p className="text-xs text-gray-500">{log.details}</p>
                  <p className="text-xs text-gray-400 mt-1">{log.startTime}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximas Ejecuciones</h3>
          <div className="space-y-3">
            {processes
              .filter(p => p.nextRun)
              .sort((a, b) => (a.nextRun! > b.nextRun! ? 1 : -1))
              .slice(0, 3)
              .map((process) => (
                <div key={process.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{process.name}</p>
                      <p className="text-xs text-gray-500">{process.schedule}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-600">{process.nextRun}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderProcesses = () => (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowNewProcessModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Proceso
          </button>
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="completed">Completados</option>
            <option value="failed">Fallidos</option>
            <option value="queued">En cola</option>
          </select>
          <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Processes Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proceso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Programación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Última Ejecución
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rendimiento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prioridad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {processes
                .filter(p => filterStatus === 'all' || p.status === filterStatus)
                .map((process) => (
                  <tr key={process.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{process.name}</div>
                        <div className="text-xs text-gray-500">{process.type}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(process.status)}`}>
                        {getStatusIcon(process.status)}
                        <span className="ml-1">{process.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{process.schedule || 'Manual'}</div>
                      {process.nextRun && (
                        <div className="text-xs text-gray-500">Próxima: {process.nextRun}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {process.lastRun}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900">{process.success}%</span>
                            <span className="text-xs text-gray-500 ml-1">éxito</span>
                          </div>
                          <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-1">
                            <div 
                              className={`h-1.5 rounded-full ${process.success >= 95 ? 'bg-green-500' : process.success >= 80 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${process.success}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                        process.priority === 'high' ? 'bg-red-100 text-red-700' :
                        process.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {process.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {process.status === 'active' ? (
                          <button className="text-yellow-600 hover:text-yellow-700">
                            <Pause className="h-4 w-4" />
                          </button>
                        ) : (
                          <button className="text-green-600 hover:text-green-700">
                            <Play className="h-4 w-4" />
                          </button>
                        )}
                        <button className="text-blue-600 hover:text-blue-700">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-700">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderIntegrations = () => (
    <div className="space-y-6">
      {/* Add Integration Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Integraciones Activas</h3>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Añadir Integración
        </button>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((integration) => (
          <div key={integration.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${getStatusColor(integration.status)}`}>
                  <Link2 className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-semibold text-gray-900">{integration.name}</h4>
                  <p className="text-xs text-gray-500">{integration.type}</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(integration.status)}`}>
                {integration.status === 'connected' ? 'Conectado' : 
                 integration.status === 'error' ? 'Error' : 'Desconectado'}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Última sincronización:</span>
                <span className="text-gray-900">{integration.lastSync}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total sincronizaciones:</span>
                <span className="text-gray-900">{integration.totalSyncs.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Errores:</span>
                <span className={integration.errors > 0 ? 'text-red-600 font-medium' : 'text-gray-900'}>
                  {integration.errors}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <button className="text-sm text-blue-600 hover:text-blue-700">
                Configurar
              </button>
              <div className="flex items-center space-x-2">
                <button className="text-gray-600 hover:text-gray-700">
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button className="text-gray-600 hover:text-gray-700">
                  <Settings className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Available Integrations */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Integraciones Disponibles</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {['Habitaclia', 'Pisos.com', 'Salesforce', 'Zoho CRM', 'SendGrid', 'Slack', 'Microsoft Teams', 'Zapier'].map((name) => (
            <button
              key={name}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="text-center">
                <Database className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-700">{name}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMonitor = () => (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Últimas 24 horas</option>
            <option>Última semana</option>
            <option>Último mes</option>
          </select>
          <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Todos los procesos</option>
            {processes.map(p => (
              <option key={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </button>
          <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Execution Logs Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Registro de Ejecuciones</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proceso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inicio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duración
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detalles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reintentos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {executionLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {log.processName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.startTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.endTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.duration > 0 ? `${log.duration} min` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                      {getStatusIcon(log.status)}
                      <span className="ml-1">{log.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {log.details}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.retries}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-700">
                        <Eye className="h-4 w-4" />
                      </button>
                      {log.status === 'failed' && (
                        <button className="text-orange-600 hover:text-orange-700">
                          <RotateCw className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alerts Configuration */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración de Alertas</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Procesos Críticos Fallidos</p>
                <p className="text-xs text-gray-500">Notificar inmediatamente cuando un proceso de alta prioridad falle</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Procesos Demorados</p>
                <p className="text-xs text-gray-500">Alertar cuando un proceso exceda el tiempo esperado en más del 50%</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      {/* Permissions */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Permisos y Roles</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Administrador</p>
                <p className="text-xs text-gray-500">Acceso completo a todos los procesos y configuraciones</p>
              </div>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-700">
              Configurar →
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Operador</p>
                <p className="text-xs text-gray-500">Puede ejecutar y monitorear procesos</p>
              </div>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-700">
              Configurar →
            </button>
          </div>
        </div>
      </div>

      {/* Execution Parameters */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Parámetros de Ejecución</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reintentos Automáticos
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>3 intentos</option>
              <option>5 intentos</option>
              <option>10 intentos</option>
              <option>Sin límite</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Intervalo entre Reintentos
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>30 segundos</option>
              <option>1 minuto</option>
              <option>5 minutos</option>
              <option>15 minutos</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Horario de Ejecución Permitido
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="time"
                defaultValue="08:00"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="time"
                defaultValue="20:00"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Audit Log */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Registro de Auditoría</h3>
          <button className="flex items-center text-sm text-blue-600 hover:text-blue-700">
            <Download className="h-4 w-4 mr-1" />
            Exportar
          </button>
        </div>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="p-1.5 bg-gray-100 rounded">
              <Settings className="h-3 w-3 text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">Admin modificó configuración de "Publicación masiva"</p>
              <p className="text-xs text-gray-500">Hace 2 horas</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="p-1.5 bg-green-100 rounded">
              <Plus className="h-3 w-3 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">Usuario creó nuevo proceso "Análisis de competencia"</p>
              <p className="text-xs text-gray-500">Hace 5 horas</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="p-1.5 bg-red-100 rounded">
              <Trash2 className="h-3 w-3 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">Admin eliminó proceso "Test Process"</p>
              <p className="text-xs text-gray-500">Ayer a las 16:30</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">RPA Automation Center</h1>
                <p className="text-xs text-gray-500">Automatización de Procesos Robóticos</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                <BarChart3 className="h-4 w-4 mr-2" />
                Reportes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Activity },
              { id: 'processes', label: 'Procesos', icon: Zap },
              { id: 'integrations', label: 'Integraciones', icon: Link2 },
              { id: 'monitor', label: 'Monitor', icon: Eye },
              { id: 'settings', label: 'Configuración', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center px-1 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'processes' && renderProcesses()}
        {activeTab === 'integrations' && renderIntegrations()}
        {activeTab === 'monitor' && renderMonitor()}
        {activeTab === 'settings' && renderSettings()}
      </div>

      {/* New Process Modal */}
      {showNewProcessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Crear Nuevo Proceso</h2>
              <button
                onClick={() => setShowNewProcessModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Proceso
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Actualización de inventario"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Proceso
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Publicación</option>
                  <option>Sincronización</option>
                  <option>Email Marketing</option>
                  <option>Análisis</option>
                  <option>Sistema</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Programación
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Manual</option>
                  <option>Cada hora</option>
                  <option>Cada 2 horas</option>
                  <option>Diario</option>
                  <option>Semanal</option>
                  <option>Mensual</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prioridad
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Alta</option>
                  <option>Media</option>
                  <option>Baja</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewProcessModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Crear Proceso
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}