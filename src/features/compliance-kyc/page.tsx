import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react";
import { KycToolbar } from "./components/KycToolbar";
import { KycFilters } from "./components/KycFilters";
import { useKycList, useFilters, useSelection } from "./hooks";
import { getStateColor, getRiskColor, formatDate, maskDocId, getChannelLabel } from "./utils";
import type { Applicant } from "./types";

// Simplified components for the basic implementation
function ApplicantsTable({ 
  applicants, 
  selectedIds, 
  onRowClick, 
  onToggleSelect 
}: { 
  applicants: Applicant[];
  selectedIds: string[];
  onRowClick: (applicant: Applicant) => void;
  onToggleSelect: (id: string) => void;
}) {
  return (
    <div className="border rounded-lg">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  className="rounded"
                  onChange={(e) => {
                    if (e.target.checked) {
                      applicants.forEach(a => {
                        if (!selectedIds.includes(a.id)) {
                          onToggleSelect(a.id);
                        }
                      });
                    } else {
                      selectedIds.forEach(id => onToggleSelect(id));
                    }
                  }}
                />
              </th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Alta
              </th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Doc ID
              </th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Riesgo
              </th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Canal
              </th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {applicants.map((applicant) => (
              <tr
                key={applicant.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onRowClick(applicant)}
              >
                <td className="p-3" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(applicant.id)}
                    onChange={() => onToggleSelect(applicant.id)}
                    className="rounded"
                  />
                </td>
                <td className="p-3 text-sm text-gray-900">
                  {formatDate(applicant.createdAt)}
                </td>
                <td className="p-3 text-sm font-medium text-gray-900">
                  {applicant.name}
                </td>
                <td className="p-3 text-sm text-gray-900">
                  {applicant.kind}
                </td>
                <td className="p-3 text-sm text-gray-900 font-mono">
                  {applicant.docType} {maskDocId(applicant.docId)}
                </td>
                <td className="p-3">
                  <Badge className={getRiskColor(applicant.risk)}>
                    {applicant.risk}
                  </Badge>
                </td>
                <td className="p-3">
                  <Badge className={getStateColor(applicant.state)}>
                    {applicant.state.replace('_', ' ')}
                  </Badge>
                </td>
                <td className="p-3 text-sm text-gray-900">
                  {applicant.channel ? getChannelLabel(applicant.channel) : '-'}
                </td>
                <td className="p-3" onClick={(e) => e.stopPropagation()}>
                  <button className="text-blue-600 hover:text-blue-800 text-sm">
                    Ver detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {applicants.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No hay expedientes KYC para mostrar</p>
          <p className="text-sm mt-1">Ajusta los filtros o crea un nuevo expediente</p>
        </div>
      )}
    </div>
  );
}

export default function KycPage() {
  const { filters, updateFilters } = useFilters();
  const { selected, toggle, clearSelection } = useSelection();
  const { data, isLoading } = useKycList(filters);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);

  const applicants = data?.data || [];
  const total = data?.total || 0;
  const stats = data?.stats || {
    total: 0,
    nuevo: 0,
    enRevision: 0,
    aprobado: 0,
    rechazado: 0,
    pendInfo: 0,
    riesgoAlto: 0,
    riesgoCritico: 0,
  };

  const handleNewApplicant = () => {
    console.log("New applicant wizard");
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk ${action} for:`, selected);
  };

  const handleImport = () => {
    console.log("Import CSV");
  };

  const handleExport = () => {
    console.log("Export data");
  };

  const handleWebhooks = () => {
    console.log("Open webhooks panel");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8" />
            Compliance  KYC
          </h1>
          <p className="text-gray-600 mt-1">
            Gestión de expedientes de Know Your Customer y verificación de identidad
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Nuevos</p>
                <p className="text-xl font-bold">{stats.nuevo}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">En Revisión</p>
                <p className="text-xl font-bold">{stats.enRevision}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Aprobados</p>
                <p className="text-xl font-bold">{stats.aprobado}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Rechazados</p>
                <p className="text-xl font-bold">{stats.rechazado}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pend. Info</p>
                <p className="text-xl font-bold">{stats.pendInfo}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Riesgo Alto</p>
                <p className="text-xl font-bold">{stats.riesgoAlto}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Crítico</p>
                <p className="text-xl font-bold">{stats.riesgoCritico}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <KycToolbar
        selectedCount={selected.length}
        onNewApplicant={handleNewApplicant}
        onBulkApprove={() => handleBulkAction("approve")}
        onBulkReject={() => handleBulkAction("reject")}
        onBulkRequestInfo={() => handleBulkAction("request_info")}
        onImport={handleImport}
        onExport={handleExport}
        onWebhooksClick={handleWebhooks}
      />

      {/* Filters */}
      <KycFilters
        filters={filters}
        onFiltersChange={updateFilters}
      />

      {/* Main Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Expedientes KYC ({total})</span>
            {isLoading && (
              <Badge variant="secondary">Cargando...</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ApplicantsTable
            applicants={applicants}
            selectedIds={selected}
            onRowClick={setSelectedApplicant}
            onToggleSelect={toggle}
          />
        </CardContent>
      </Card>

      {/* Pagination */}
      {total > (filters.size || 25) && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Mostrando {(filters.page || 0) * (filters.size || 25) + 1} a{" "}
            {Math.min(((filters.page || 0) + 1) * (filters.size || 25), total)} de {total} resultados
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={(filters.page || 0) === 0}
              onClick={() => updateFilters({ page: (filters.page || 0) - 1 })}
              className="px-3 py-2 text-sm border rounded disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="px-3 py-2 text-sm">
              Página {(filters.page || 0) + 1} de {Math.ceil(total / (filters.size || 25))}
            </span>
            <button
              disabled={((filters.page || 0) + 1) * (filters.size || 25) >= total}
              onClick={() => updateFilters({ page: (filters.page || 0) + 1 })}
              className="px-3 py-2 text-sm border rounded disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Selected Applicant Detail Modal (simplified) */}
      {selectedApplicant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Expediente KYC - {selectedApplicant.name}</CardTitle>
                <button
                  onClick={() => setSelectedApplicant(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Nombre:</span>
                    <div className="font-medium">{selectedApplicant.name}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Tipo:</span>
                    <div className="font-medium">{selectedApplicant.kind}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Documento:</span>
                    <div className="font-medium font-mono">
                      {selectedApplicant.docType} {maskDocId(selectedApplicant.docId)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Estado:</span>
                    <Badge className={getStateColor(selectedApplicant.state)}>
                      {selectedApplicant.state.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-600">Riesgo:</span>
                    <div className="flex items-center gap-2">
                      <Badge className={getRiskColor(selectedApplicant.risk)}>
                        {selectedApplicant.risk}
                      </Badge>
                      {selectedApplicant.riskScore && (
                        <span className="text-xs text-gray-500">
                          ({selectedApplicant.riskScore}/100)
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Canal:</span>
                    <div className="font-medium">
                      {selectedApplicant.channel ? getChannelLabel(selectedApplicant.channel) : '-'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <div className="font-medium">{selectedApplicant.email || '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Teléfono:</span>
                    <div className="font-medium">{selectedApplicant.phone || '-'}</div>
                  </div>
                </div>

                {selectedApplicant.flags && selectedApplicant.flags.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 text-red-600">Banderas de Riesgo</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedApplicant.flags.map((flag, index) => (
                        <Badge key={index} variant="secondary" className="bg-red-100 text-red-800">
                          {flag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    Expediente creado: {formatDate(selectedApplicant.createdAt)}
                  </p>
                  {selectedApplicant.decidedAt && (
                    <p className="text-xs text-gray-500">
                      Decisión tomada: {formatDate(selectedApplicant.decidedAt)} por {selectedApplicant.decidedBy}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}