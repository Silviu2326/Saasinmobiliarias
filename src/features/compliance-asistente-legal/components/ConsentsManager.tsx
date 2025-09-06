import { useState, useEffect } from 'react';
import { Check, X, RefreshCw, Shield, Calendar, Globe } from 'lucide-react';
import { useConsents } from '../hooks';
import { formatDate, maskEmail } from '../utils';
import type { Consent } from '../types';

export function ConsentsManager() {
  const [subject, setSubject] = useState('');
  const [searchSubject, setSearchSubject] = useState('');
  const { consents, upsert, revoke, isLoading } = useConsents(searchSubject);

  const [formData, setFormData] = useState({
    purpose: 'marketing' as Consent['purpose'],
    granted: false,
    evidence: '',
    origin: 'web_form',
    ip: '',
  });

  const purposes = [
    { value: 'marketing', label: 'Marketing general', description: 'Comunicaciones comerciales' },
    { value: 'email', label: 'Email marketing', description: 'Newsletters y ofertas por email' },
    { value: 'whatsapp', label: 'WhatsApp', description: 'Mensajes por WhatsApp Business' },
    { value: 'portales', label: 'Portales inmobiliarios', description: 'Publicación en portales' },
  ];

  const handleSearch = () => {
    if (subject) {
      setSearchSubject(subject);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchSubject) return;

    await upsert.mutateAsync({
      subject: searchSubject,
      ...formData,
      at: new Date().toISOString(),
      by: 'current_user',
    });

    setFormData({
      purpose: 'marketing',
      granted: false,
      evidence: '',
      origin: 'web_form',
      ip: '',
    });
  };

  const handleRevoke = async (consentId: string) => {
    if (!confirm('¿Confirma la revocación del consentimiento?')) return;
    await revoke.mutateAsync(consentId);
  };

  const getConsentStatus = (consent: Consent) => {
    if (consent.revokedAt) return 'revoked';
    return consent.granted ? 'granted' : 'denied';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'granted':
        return 'bg-green-100 text-green-800';
      case 'denied':
        return 'bg-red-100 text-red-800';
      case 'revoked':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold mb-4">Gestión de Consentimientos RGPD</h3>
        
        <div className="flex gap-2">
          <input
            type="email"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="email@ejemplo.com"
            className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Buscar
          </button>
        </div>
      </div>

      {searchSubject && (
        <>
          <div className="p-6 border-b bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Consentimientos de {maskEmail(searchSubject)}</h4>
              <button
                onClick={() => setSearchSubject('')}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Nueva búsqueda
              </button>
            </div>

            {isLoading ? (
              <div className="animate-pulse space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {consents && consents.length > 0 ? (
                  consents.map((consent) => {
                    const status = getConsentStatus(consent);
                    return (
                      <div
                        key={consent.id}
                        className="border rounded-lg p-4 bg-white"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h5 className="font-medium">
                                {purposes.find(p => p.value === consent.purpose)?.label}
                              </h5>
                              <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusBadge(status)}`}>
                                {status === 'granted' ? 'Concedido' : status === 'denied' ? 'Denegado' : 'Revocado'}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(consent.at)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                <span>Origen: {consent.origin}</span>
                              </div>
                              {consent.evidence && (
                                <div className="flex items-center gap-1 col-span-2">
                                  <Shield className="h-3 w-3" />
                                  <span>Evidencia: {consent.evidence}</span>
                                </div>
                              )}
                              {consent.ip && (
                                <div className="text-xs text-gray-500">
                                  IP: {consent.ip}
                                </div>
                              )}
                            </div>

                            {consent.revokedAt && (
                              <div className="mt-2 text-sm text-orange-600">
                                Revocado el {formatDate(consent.revokedAt)}
                              </div>
                            )}
                          </div>

                          {status === 'granted' && !consent.revokedAt && (
                            <button
                              onClick={() => handleRevoke(consent.id)}
                              disabled={revoke.isPending}
                              className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Revocar consentimiento"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No se encontraron consentimientos para este sujeto
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-6">
            <h4 className="font-medium mb-4">Registrar nuevo consentimiento</h4>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Propósito
                </label>
                <select
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value as Consent['purpose'] })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {purposes.map(p => (
                    <option key={p.value} value={p.value}>
                      {p.label} - {p.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado del consentimiento
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={formData.granted === true}
                      onChange={() => setFormData({ ...formData, granted: true })}
                    />
                    <span className="flex items-center gap-1">
                      <Check className="h-4 w-4 text-green-600" />
                      Concedido
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={formData.granted === false}
                      onChange={() => setFormData({ ...formData, granted: false })}
                    />
                    <span className="flex items-center gap-1">
                      <X className="h-4 w-4 text-red-600" />
                      Denegado
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Origen
                </label>
                <select
                  value={formData.origin}
                  onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="web_form">Formulario web</option>
                  <option value="app">Aplicación móvil</option>
                  <option value="phone">Teléfono</option>
                  <option value="email">Email</option>
                  <option value="presencial">Presencial</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Evidencia (opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.evidence}
                    onChange={(e) => setFormData({ ...formData, evidence: e.target.value })}
                    placeholder="ID documento, grabación..."
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    IP (opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.ip}
                    onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
                    placeholder="192.168.1.1"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={upsert.isPending}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {upsert.isPending ? 'Guardando...' : 'Registrar consentimiento'}
              </button>

              {upsert.isSuccess && (
                <div className="p-3 bg-green-50 text-green-700 rounded-lg">
                  ✓ Consentimiento registrado exitosamente
                </div>
              )}
            </form>
          </div>
        </>
      )}
    </div>
  );
}