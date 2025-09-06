import { useState } from 'react';
import { Shield, AlertCircle, CheckCircle, Settings, RefreshCw } from 'lucide-react';
import { useEidasProvider } from '../hooks';
import { formatDate } from '../utils';

export function ProviderBadge() {
  const { data: provider, refetch, isLoading } = useEidasProvider();
  const [showConfig, setShowConfig] = useState(false);
  const [configForm, setConfigForm] = useState({
    providerName: '',
    endpoint: '',
    certificate: '',
    environment: 'sandbox' as 'sandbox' | 'production',
  });

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'connected':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bg: 'bg-green-50 border-green-200',
          label: 'Conectado',
          description: 'Proveedor eIDAS configurado y operativo',
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bg: 'bg-red-50 border-red-200',
          label: 'Error',
          description: 'Error en la conexión con el proveedor',
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-yellow-600',
          bg: 'bg-yellow-50 border-yellow-200',
          label: 'No configurado',
          description: 'Proveedor de firma electrónica no configurado',
        };
    }
  };

  const handleConfigSave = async () => {
    // Simulamos la configuración
    await new Promise(resolve => setTimeout(resolve, 1000));
    setShowConfig(false);
    refetch();
  };

  const statusInfo = getStatusInfo(provider?.status || 'not_configured');
  const StatusIcon = statusInfo.icon;

  if (isLoading) {
    return (
      <div className="bg-white border rounded-lg p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg p-4 ${statusInfo.bg}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <StatusIcon className={`h-5 w-5 mt-0.5 ${statusInfo.color}`} />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-gray-900">Proveedor eIDAS</h4>
              <span className={`px-2 py-0.5 text-xs rounded-full ${statusInfo.color} bg-white/50`}>
                {statusInfo.label}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{statusInfo.description}</p>
            
            {provider?.provider && (
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="h-3 w-3 text-gray-400" />
                  <span className="text-gray-700">Proveedor: {provider.provider}</span>
                </div>
                {provider.lastCheck && (
                  <div className="text-xs text-gray-500">
                    Última verificación: {formatDate(provider.lastCheck)}
                  </div>
                )}
                {provider.capabilities && provider.capabilities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {provider.capabilities.map((capability, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-xs bg-white/75 text-gray-700 rounded"
                      >
                        {capability === 'qualified_signature' ? 'Firma cualificada' :
                         capability === 'timestamp' ? 'Sellado de tiempo' :
                         capability}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-1 text-gray-400 hover:text-gray-600"
            title="Actualizar estado"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowConfig(true)}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-white/50"
          >
            <Settings className="inline h-3 w-3 mr-1" />
            Configurar
          </button>
        </div>
      </div>

      {showConfig && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h5 className="font-medium mb-3">Configurar proveedor eIDAS</h5>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Nombre del proveedor
              </label>
              <select
                value={configForm.providerName}
                onChange={(e) => setConfigForm({ ...configForm, providerName: e.target.value })}
                className="w-full px-2 py-1 text-sm border rounded"
              >
                <option value="">Seleccionar proveedor</option>
                <option value="firma_ejemplo">Firma Ejemplo S.L.</option>
                <option value="cert_digital">CertDigital España</option>
                <option value="eidas_test">eIDAS Test Provider</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Endpoint API
              </label>
              <input
                type="url"
                value={configForm.endpoint}
                onChange={(e) => setConfigForm({ ...configForm, endpoint: e.target.value })}
                placeholder="https://api.proveedor-eidas.com/v1"
                className="w-full px-2 py-1 text-sm border rounded"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Certificado cliente
              </label>
              <textarea
                value={configForm.certificate}
                onChange={(e) => setConfigForm({ ...configForm, certificate: e.target.value })}
                rows={3}
                placeholder="-----BEGIN CERTIFICATE-----..."
                className="w-full px-2 py-1 text-sm border rounded font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Entorno
              </label>
              <div className="flex gap-3">
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="radio"
                    checked={configForm.environment === 'sandbox'}
                    onChange={() => setConfigForm({ ...configForm, environment: 'sandbox' })}
                  />
                  Sandbox
                </label>
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="radio"
                    checked={configForm.environment === 'production'}
                    onChange={() => setConfigForm({ ...configForm, environment: 'production' })}
                  />
                  Producción
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleConfigSave}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Guardar configuración
              </button>
              <button
                onClick={() => setShowConfig(false)}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>

          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
            <h6 className="font-medium text-blue-900 mb-1">Nota sobre eIDAS</h6>
            <p className="text-blue-800">
              La configuración de proveedores eIDAS requiere certificados válidos y acuerdos comerciales.
              Contacte con su proveedor de servicios de confianza para obtener las credenciales necesarias.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}