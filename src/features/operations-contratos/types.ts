export interface Contract {
  id: string;
  tipo: 'compraventa' | 'alquiler' | 'exclusiva';
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  clienteId: string;
  clienteNombre: string;
  clienteEmail?: string;
  propietarioId?: string;
  propietarioNombre?: string;
  estado: 'borrador' | 'generado' | 'firmado' | 'anulado';
  version: number;
  honorarios: number;
  fechaInicio?: string;
  fechaVencimiento?: string;
  fechasClaves?: Record<string, string>;
  adjuntos?: ContractAttachment[];
  notas?: string;
  generatedAt?: string;
  signedAt?: string;
  createdAt: string;
  updatedAt: string;
  reservaId?: string;
  versions?: ContractVersion[];
}

export interface ContractVersion {
  id: string;
  contractId: string;
  version: number;
  createdAt: string;
  by: string;
  byName: string;
  notes?: string;
  changes?: Record<string, any>;
}

export interface ContractAttachment {
  id: string;
  contractId: string;
  filename: string;
  size: number;
  type: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
  url?: string;
}

export interface ContractFormData {
  tipo: 'compraventa' | 'alquiler' | 'exclusiva';
  propertyId: string;
  clienteId: string;
  propietarioId?: string;
  honorarios: number;
  fechaInicio?: string;
  fechaVencimiento?: string;
  fechasClaves?: Record<string, string>;
  notas?: string;
  reservaId?: string;
}

export interface ContractsFilters {
  q?: string;
  tipo?: 'all' | 'compraventa' | 'alquiler' | 'exclusiva';
  estado?: 'all' | 'borrador' | 'generado' | 'firmado' | 'anulado';
  propertyId?: string;
  clienteId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ContractsResponse {
  contracts: Contract[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ContractStats {
  total: number;
  borradores: number;
  generados: number;
  firmados: number;
  anulados: number;
  honorariosTotal: number;
  honorariosPromedio: number;
}

export interface GenerateFromTemplateData {
  templateId: string;
  templateName: string;
  variables: Record<string, any>;
}

export interface ContractTemplate {
  id: string;
  name: string;
  type: 'compraventa' | 'alquiler' | 'exclusiva';
  variables: string[];
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContractSignature {
  id: string;
  contractId: string;
  signerName: string;
  signerType: 'client' | 'owner' | 'agent';
  signedAt: string;
  ipAddress?: string;
  location?: string;
}

export interface BulkContractAction {
  action: 'delete' | 'export' | 'generate' | 'sign';
  contractIds: string[];
  notes?: string;
  templateId?: string;
}