import { useState } from 'react';
import { UserCheck, AlertTriangle, Shield, FileText, Search } from 'lucide-react';
import { useKycAml } from '../hooks';
import { maskDocId, formatDate } from '../utils';
import type { KycCheck } from '../types';

export function KycAmlPanel() {
  const { check, isChecking, progress } = useKycAml();
  const [result, setResult] = useState<{ kyc: KycCheck; aml: any } | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    docId: '',
    docType: 'dni' as KycCheck['docType'],
    birthDate: '',
    country: 'ES',
    isPep: false,
    justification: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const checkResult = await check(formData);
    setResult(checkResult);
  };

  const getRiskLevel = (score?: number) => {
    if (!score) return { level: 'low', color: 'text-green-600', bg: 'bg-green-100' };
    if (score > 80) return { level: 'high', color: 'text-red-600', bg: 'bg-red-100' };
    if (score > 50) return { level: 'medium', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'low', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const getVerificationStatus = (status: KycCheck['verificationStatus']) => {
    const map = {
      pending: { label: 'Pendiente', color: 'bg-gray-100 text-gray-800' },
      verified: { label: 'Verificado', color: 'bg-green-100 text-green-800' },
      failed: { label: 'Fallido', color: 'bg-red-100 text-red-800' },
      manual_review: { label: 'Revisión manual', color: 'bg-yellow-100 text-yellow-800' },
    };
    return map[status];
  };

  const downloadReport = () => {
    if (!result) return;
    
    const report = {
      kycData: result.kyc,
      amlScreening: result.aml,
      generatedAt: new Date().toISOString(),
      generatedBy: 'compliance_officer',
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kyc-report-${result.kyc.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold mb-2">Verificación KYC/AML</h3>
        <p className="text-sm text-gray-600">
          Verificación básica de identidad y screening contra listas de sanciones
        </p>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Documento de identidad
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.docType}
                  onChange={(e) => setFormData({ ...formData, docType: e.target.value as KycCheck['docType'] })}
                  className="px-3 py-2 border rounded-lg"
                >
                  <option value="dni">DNI</option>
                  <option value="nie">NIE</option>
                  <option value="passport">Pasaporte</option>
                </select>
                <input
                  type="text"
                  value={formData.docId}
                  onChange={(e) => setFormData({ ...formData, docId: e.target.value })}
                  placeholder="12345678A"
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de nacimiento
              </label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                País de residencia
              </label>
              <select
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="ES">España</option>
                <option value="FR">Francia</option>
                <option value="DE">Alemania</option>
                <option value="IT">Italia</option>
                <option value="PT">Portugal</option>
                <option value="GB">Reino Unido</option>
                <option value="US">Estados Unidos</option>
                <option value="OTHER">Otro</option>
              </select>
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-gray-50">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isPep}
                onChange={(e) => setFormData({ ...formData, isPep: e.target.checked })}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <span className="font-medium">Persona políticamente expuesta (PEP)</span>
            </label>
            
            {formData.isPep && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Justificación / Cargo
                </label>
                <textarea
                  value={formData.justification}
                  onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Describa el cargo o relación política..."
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isChecking}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isChecking ? 'Verificando...' : 'Iniciar verificación KYC/AML'}
          </button>
        </form>

        {isChecking && (
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Progreso de verificación</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 text-sm text-gray-500">
              {progress < 50 && 'Verificando identidad...'}
              {progress >= 50 && progress < 80 && 'Consultando listas AML...'}
              {progress >= 80 && 'Generando informe...'}
            </div>
          </div>
        )}

        {result && (
          <div className="mt-6 space-y-4">
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Resultado KYC
              </h4>
              
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Estado de verificación:</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getVerificationStatus(result.kyc.verificationStatus).color}`}>
                    {getVerificationStatus(result.kyc.verificationStatus).label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Nombre:</span>
                    <p className="font-medium">{result.kyc.fullName}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Documento:</span>
                    <p className="font-medium">{maskDocId(result.kyc.docId)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">País:</span>
                    <p className="font-medium">{result.kyc.country}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">PEP:</span>
                    <p className={`font-medium ${result.kyc.isPep ? 'text-orange-600' : 'text-green-600'}`}>
                      {result.kyc.isPep ? 'Sí' : 'No'}
                    </p>
                  </div>
                </div>

                {result.kyc.verifiedAt && (
                  <div className="text-xs text-gray-500">
                    Verificado: {formatDate(result.kyc.verifiedAt)}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Screening AML
              </h4>
              
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Resultado screening:</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    result.aml.clear 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {result.aml.clear ? 'Limpio' : 'Coincidencias encontradas'}
                  </span>
                </div>

                {result.kyc.amlRiskScore !== undefined && (
                  <div>
                    <span className="text-sm text-gray-600">Score de riesgo AML:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            getRiskLevel(result.kyc.amlRiskScore).level === 'high'
                              ? 'bg-red-500'
                              : getRiskLevel(result.kyc.amlRiskScore).level === 'medium'
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${result.kyc.amlRiskScore}%` }}
                        />
                      </div>
                      <span className={`text-sm font-medium ${getRiskLevel(result.kyc.amlRiskScore).color}`}>
                        {result.kyc.amlRiskScore.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}

                {result.aml.flags && result.aml.flags.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-600">Alertas:</span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {result.aml.flags.map((flag: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded"
                        >
                          <AlertTriangle className="inline h-3 w-3 mr-1" />
                          {flag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {result.kyc.flags && result.kyc.flags.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-600">Banderas KYC:</span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {result.kyc.flags.map((flag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded"
                        >
                          {flag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={downloadReport}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Descargar informe KYC
              </button>
              <button
                onClick={() => {
                  setResult(null);
                  setFormData({
                    fullName: '',
                    docId: '',
                    docType: 'dni',
                    birthDate: '',
                    country: 'ES',
                    isPep: false,
                    justification: '',
                  });
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Nueva verificación
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}