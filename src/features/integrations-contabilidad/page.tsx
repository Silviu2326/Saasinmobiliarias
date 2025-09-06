import React from 'react';
import { motion } from 'framer-motion';
import { 
  useProviders, 
  useMappings, 
  useSyncQueue, 
  useBanking, 
  useSii, 
  useReports,
  useImportExport 
} from './hooks';
import { 
  getProviderStatusColor, 
  getProviderStatusText, 
  getJobStatusColor, 
  getJobStatusText, 
  formatMoney,
  formatDate 
} from './utils';

// Simple components (reusing pattern from telephony integration)
function SimpleCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
}

function Badge({ children, variant = 'default', className = '' }: { 
  children: React.ReactNode; 
  variant?: 'default' | 'success' | 'warning' | 'error';
  className?: string;
}) {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}

function Button({ 
  children, 
  onClick, 
  variant = 'default', 
  size = 'md',
  disabled = false,
  className = '' 
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md';
  disabled?: boolean;
  className?: string;
}) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors';
  const variantClasses = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50',
    ghost: 'text-gray-700 hover:bg-gray-100 disabled:opacity-50',
  };
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
}

function LoadingSkeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

// Status utilities
function getProviderStatusVariant(status: string): 'success' | 'warning' | 'error' | 'default' {
  switch (status) {
    case 'CONNECTED': return 'success';
    case 'ERROR': return 'error';
    default: return 'default';
  }
}

function getJobStatusVariant(status: string): 'success' | 'warning' | 'error' | 'default' {
  switch (status) {
    case 'ok': return 'success';
    case 'pending': return 'warning';
    case 'error': return 'error';
    default: return 'default';
  }
}

// Provider card component
function ProviderCard({ provider }: { provider: any }) {
  const [connecting, setConnecting] = React.useState(false);
  
  const handleConnect = () => {
    setConnecting(true);
    setTimeout(() => setConnecting(false), 2000);
  };

  return (
    <SimpleCard>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold text-gray-600">
              {provider.name.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{provider.name}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant={getProviderStatusVariant(provider.status)}>
                {getProviderStatusText(provider.status)}
              </Badge>
              {provider.plan && (
                <Badge variant="default">{provider.plan}</Badge>
              )}
            </div>
          </div>
        </div>
        {provider.lastSyncAt && (
          <div className="text-right">
            <div className="text-sm text-gray-500">Última sync</div>
            <div className="text-xs text-gray-400">
              {formatDate(provider.lastSyncAt)}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-1">
          {provider.features.invoices && <Badge variant="outline">📄 Facturas</Badge>}
          {provider.features.expenses && <Badge variant="outline">💳 Gastos</Badge>}
          {provider.features.banking && <Badge variant="outline">🏦 Bancos</Badge>}
          {provider.features.reports && <Badge variant="outline">📊 Informes</Badge>}
          {provider.features.sii && <Badge variant="outline">🇪🇸 SII</Badge>}
        </div>
      </div>

      <div className="flex space-x-2">
        <Button
          onClick={handleConnect}
          disabled={connecting}
          className="flex-1"
        >
          {connecting ? 'Conectando...' : provider.status === 'CONNECTED' ? 'Reconectar' : 'Conectar'}
        </Button>
        <Button variant="outline">
          Configurar
        </Button>
        <Button variant="ghost" size="sm">
          Probar
        </Button>
      </div>
    </SimpleCard>
  );
}

// ERP Providers grid component
function ErpProvidersGrid() {
  const { providers, isLoading } = useProviders();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <LoadingSkeleton key={i} className="h-56" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {providers.map((provider) => (
        <motion.div
          key={provider.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ProviderCard provider={provider} />
        </motion.div>
      ))}
    </div>
  );
}

// Import/Export bar
function ImportExportBar() {
  const { exportConfig, importConfig, isExporting, isImporting } = useImportExport();

  const handleExport = () => {
    exportConfig();
  };

  const handleImport = () => {
    // Simple implementation - would show file picker in real app
    console.log('Import functionality would open file picker');
  };

  return (
    <SimpleCard>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? '📥 Exportando...' : '📥 Exportar Config'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleImport}
            disabled={isImporting}
          >
            {isImporting ? '📤 Importando...' : '📤 Importar Config'}
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            🔗 Probar Conexiones
          </Button>
          <Button size="sm">
            🔄 Sincronizar Ahora
          </Button>
        </div>
      </div>
    </SimpleCard>
  );
}

// Sync Status Panel
function SyncStatusPanel() {
  const { jobs, isLoading } = useSyncQueue();

  if (isLoading) {
    return (
      <SimpleCard>
        <h3 className="font-semibold text-gray-900 mb-4">Estado de Sincronización</h3>
        <LoadingSkeleton className="h-32" />
      </SimpleCard>
    );
  }

  return (
    <SimpleCard>
      <h3 className="font-semibold text-gray-900 mb-4">Estado de Sincronización</h3>
      <div className="space-y-3">
        {jobs.slice(0, 5).map((job) => (
          <div key={job.id} className="flex items-center justify-between p-3 border rounded">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <Badge variant={getJobStatusVariant(job.status)}>
                  {getJobStatusText(job.status)}
                </Badge>
                <span className="text-sm font-medium">
                  {job.type} - {job.entity || 'N/A'}
                </span>
              </div>
              {job.message && (
                <div className="text-xs text-gray-500 mt-1">{job.message}</div>
              )}
            </div>
            <div className="text-xs text-gray-400">
              {formatDate(job.scheduledAt)}
            </div>
          </div>
        ))}
        {jobs.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No hay trabajos recientes
          </div>
        )}
      </div>
    </SimpleCard>
  );
}

// Bank Connections Panel
function BankConnectionsPanel() {
  const { connections, isLoading } = useBanking();

  if (isLoading) {
    return (
      <SimpleCard>
        <h3 className="font-semibold text-gray-900 mb-4">Conexiones Bancarias</h3>
        <LoadingSkeleton className="h-24" />
      </SimpleCard>
    );
  }

  return (
    <SimpleCard>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Conexiones Bancarias</h3>
        <Button size="sm" variant="outline">+ Conectar Banco</Button>
      </div>
      <div className="space-y-3">
        {connections.map((conn) => (
          <div key={conn.id} className="flex items-center justify-between p-3 border rounded">
            <div>
              <div className="font-medium">{conn.name}</div>
              <div className="text-sm text-gray-500">
                {conn.iban && `****${conn.iban.slice(-4)}`}
                {conn.balance !== undefined && ` • ${formatMoney(conn.balance)}`}
              </div>
            </div>
            <Badge variant={conn.status === 'connected' ? 'success' : 'default'}>
              {conn.status === 'connected' ? 'Conectado' : 'Desconectado'}
            </Badge>
          </div>
        ))}
        {connections.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No hay conexiones bancarias
          </div>
        )}
      </div>
    </SimpleCard>
  );
}

// SII/AEAT Panel
function SiiAeatPanel() {
  const { status, isLoading } = useSii();

  if (isLoading) {
    return (
      <SimpleCard>
        <h3 className="font-semibold text-gray-900 mb-4">SII/AEAT</h3>
        <LoadingSkeleton className="h-24" />
      </SimpleCard>
    );
  }

  if (!status) return null;

  return (
    <SimpleCard>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">SII/AEAT</h3>
        <Badge variant={status.enabled ? 'success' : 'default'}>
          {status.enabled ? `Activo (${status.environment})` : 'Inactivo'}
        </Badge>
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-blue-600">{status.queuedItems}</div>
          <div className="text-xs text-gray-500">En cola</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-red-600">{status.errors24h}</div>
          <div className="text-xs text-gray-500">Errores 24h</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-600">
            {status.recentSubmissions.reduce((acc, sub) => acc + sub.accepted, 0)}
          </div>
          <div className="text-xs text-gray-500">Aceptados</div>
        </div>
      </div>
    </SimpleCard>
  );
}

// Reports Shortcuts
function ReportsShortcuts() {
  const { shortcuts, isLoading } = useReports();

  if (isLoading) {
    return (
      <SimpleCard>
        <h3 className="font-semibold text-gray-900 mb-4">Informes</h3>
        <LoadingSkeleton className="h-32" />
      </SimpleCard>
    );
  }

  return (
    <SimpleCard>
      <h3 className="font-semibold text-gray-900 mb-4">Accesos Rápidos - Informes</h3>
      <div className="grid grid-cols-2 gap-3">
        {shortcuts.map((shortcut) => (
          <div
            key={shortcut.id}
            className={`p-3 border rounded-lg text-center cursor-pointer transition-colors
              ${shortcut.available 
                ? 'hover:bg-gray-50 text-gray-900' 
                : 'opacity-50 cursor-not-allowed text-gray-400'
              }`}
          >
            <div className="text-2xl mb-1">{shortcut.icon}</div>
            <div className="text-sm font-medium">{shortcut.name}</div>
            <div className="text-xs text-gray-500">{shortcut.description}</div>
          </div>
        ))}
      </div>
    </SimpleCard>
  );
}

// Placeholder component for development sections
function DevelopmentPlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <SimpleCard>
      <div className="text-center py-8">
        <div className="text-4xl mb-4">🚧</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
        <div className="mt-4">
          <Badge>En desarrollo</Badge>
        </div>
      </div>
    </SimpleCard>
  );
}

// Main page component
export default function ContabilidadIntegrationsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b pb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Integraciones de Contabilidad
        </h1>
        <p className="text-gray-600 mt-2">
          Centraliza las integraciones contables con ERPs, bancos y pasarelas: mapea el plan de cuentas,
          configura impuestos y centros de coste, gestiona políticas de sincronización y monitoriza SII/AEAT.
        </p>
      </div>

      {/* Import/Export and Actions Bar */}
      <ImportExportBar />

      {/* ERP Providers Grid */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Proveedores ERP y Pasarelas
        </h2>
        <ErpProvidersGrid />
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          <DevelopmentPlaceholder
            title="Mapeo Plan de Cuentas"
            description="Mapea entidades de InmoFlow con cuentas contables del ERP"
          />
          <DevelopmentPlaceholder
            title="Perfiles de Impuestos"
            description="Configura IVA, IRPF, recargo de equivalencia y períodos fiscales"
          />
          <DevelopmentPlaceholder
            title="Centros de Coste"
            description="Define centros por oficina, equipo o proyecto"
          />
          <DevelopmentPlaceholder
            title="Configuración de Divisas"
            description="Moneda base, tipos de cambio y políticas de redondeo"
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <DevelopmentPlaceholder
            title="Políticas de Sincronización"
            description="Configura triggers, ventanas temporales y reconciliación"
          />
          <SyncStatusPanel />
          <BankConnectionsPanel />
          <DevelopmentPlaceholder
            title="Vista Previa de Asientos"
            description="Previsualiza asientos contables antes de enviar al ERP"
          />
          <SiiAeatPanel />
          <ReportsShortcuts />
        </div>
      </div>

      {/* Full Width - Logs Table */}
      <DevelopmentPlaceholder
        title="Logs de Integración Contable"
        description="Historial completo de sincronizaciones, conexiones y operaciones con trazabilidad"
      />

      {/* Footer Info */}
      <div className="border-t pt-6">
        <div className="text-center text-sm text-gray-500">
          <p>
            🔒 Todas las credenciales y configuraciones se almacenan de forma segura y encriptada.
            Cualquier cambio en mappings o impuestos se registra en el audit trail.
          </p>
          <p className="mt-2">
            Para configuración avanzada de SII/AEAT o resolución de errores, contacta con el equipo contable.
          </p>
        </div>
      </div>
    </div>
  );
}