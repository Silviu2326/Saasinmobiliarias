import React from 'react';
import { motion } from 'framer-motion';
import { useRealTimeUpdates, useProviders, useLiveStatus } from './hooks';

// Simple components
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
    case 'TOKEN_EXPIRED': return 'warning';
    case 'ERROR': return 'error';
    default: return 'default';
  }
}

function getProviderStatusText(status: string): string {
  switch (status) {
    case 'CONNECTED': return 'Conectado';
    case 'DISCONNECTED': return 'Desconectado';
    case 'TOKEN_EXPIRED': return 'Token expirado';
    case 'ERROR': return 'Error';
    default: return 'Desconocido';
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
            <Badge variant={getProviderStatusVariant(provider.status)}>
              {getProviderStatusText(provider.status)}
            </Badge>
          </div>
        </div>
        {provider.balance !== undefined && (
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900">€{provider.balance.toFixed(2)}</div>
            <div className="text-xs text-gray-500">Saldo</div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-1">
          {provider.supports.voice && <Badge>📞 Voz</Badge>}
          {provider.supports.sms && <Badge>💬 SMS</Badge>}
          {provider.supports.whatsapp && <Badge>💚 WhatsApp</Badge>}
        </div>
        {provider.lastLatencyMs && (
          <span className="text-xs text-gray-500">{provider.lastLatencyMs}ms</span>
        )}
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
      </div>
    </SimpleCard>
  );
}

// Providers grid component
function ProvidersGrid() {
  const { providers, isLoading } = useProviders();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <LoadingSkeleton key={i} className="h-48" />
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

// Live status bar
function LiveStatusBar() {
  const { status, isLoading } = useLiveStatus();

  if (isLoading) {
    return <LoadingSkeleton className="h-16" />;
  }

  if (!status) return null;

  return (
    <SimpleCard>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Agentes:</span>
            <Badge variant="success">{status.agentsOnline} online</Badge>
            <Badge variant="warning">{status.agentsBusy} ocupados</Badge>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Llamadas:</span>
            <Badge>{status.callsInProgress} activas</Badge>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Tiempo espera:</span>
            <Badge variant={status.avgWaitTime > 60 ? 'error' : status.avgWaitTime > 30 ? 'warning' : 'success'}>
              {status.avgWaitTime}s promedio
            </Badge>
          </div>
        </div>

        <div className="text-xs text-gray-500">
          Actualizado: {new Date(status.timestamp).toLocaleTimeString('es-ES')}
        </div>
      </div>
    </SimpleCard>
  );
}

// Placeholder component for development sections
function DevelopmentPlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <SimpleCard>
      <div className="text-center py-12">
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
export default function TelefoniaIntegrationsPage() {
  useRealTimeUpdates();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b pb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Integraciones de Telefonía (VoIP & SMS)
        </h1>
        <p className="text-gray-600 mt-2">
          Centraliza y gestiona todas tus integraciones de telefonía: conecta proveedores,
          administra números, configura ruteo, grabaciones y monitoriza la calidad en tiempo real.
        </p>
      </div>

      {/* Live Status Bar */}
      <LiveStatusBar />

      {/* Import/Export Bar */}
      <SimpleCard>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Configuración</h3>
            <p className="text-sm text-gray-500">
              Exporta o importa la configuración completa de telefonía
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">📥 Exportar</Button>
            <Button variant="outline" size="sm">📤 Importar</Button>
          </div>
        </div>
      </SimpleCard>

      {/* Providers Grid */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Proveedores de Telefonía
        </h2>
        <ProvidersGrid />
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          <DevelopmentPlaceholder
            title="Gestión de Números"
            description="Administra números por oficina y agente con grabación configurable"
          />
          <DevelopmentPlaceholder
            title="Reglas de Ruteo"
            description="Define ruteo por horarios, IVR, ring groups y fallbacks"
          />
          <DevelopmentPlaceholder
            title="Constructor de Flujos IVR"
            description="Diseñador visual drag & drop para flujos de llamada interactivos"
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <DevelopmentPlaceholder
            title="Plantillas SMS/WhatsApp"
            description="Gestiona plantillas con variables dinámicas para mensajería"
          />
          <DevelopmentPlaceholder
            title="Monitor de Calidad"
            description="Métricas ASR, MOS, Jitter y % caídas con alertas automáticas"
          />
          <DevelopmentPlaceholder
            title="Uso y Costes"
            description="Análisis de consumo, minutos y costes por proveedor/oficina"
          />
          <DevelopmentPlaceholder
            title="Webhooks"
            description="URLs de callback para eventos de voz, SMS y WhatsApp"
          />
        </div>
      </div>

      {/* Full Width - Call Logs */}
      <DevelopmentPlaceholder
        title="Historial de Llamadas y SMS"
        description="Logs completos con filtros, grabaciones, transcripciones y trazabilidad"
      />

      {/* Footer Info */}
      <div className="border-t pt-6">
        <div className="text-center text-sm text-gray-500">
          <p>
            🔒 Todas las credenciales se almacenan de forma segura y encriptada.
            Los datos son actualizados en tiempo real desde los proveedores.
          </p>
          <p className="mt-2">
            Para soporte técnico o configuración avanzada, contacta con el equipo de sistemas.
          </p>
        </div>
      </div>
    </div>
  );
}