export type KycState = "NUEVO" | "EN_REVISION" | "APROBADO" | "RECHAZADO" | "PEND_INFO";
export type RiskLevel = "BAJO" | "MEDIO" | "ALTO" | "CRITICO";
export type DocType = "DNI" | "NIE" | "PASAPORTE";
export type ApplicantKind = "CLIENTE" | "PROPIETARIO";
export type DocumentType = "ID" | "SELFIE" | "ADDRESS" | "OTHER";
export type Channel = "web" | "portales" | "oficina" | "whatsapp";
export type ScreeningList = "PEP" | "OFAC" | "UE" | "OTRA";
export type DecisionAction = "approve" | "reject" | "need_info";

export interface Applicant {
  id: string;
  createdAt: string;
  kind: ApplicantKind;
  name: string;
  docType: DocType;
  docId: string;
  docExpiry?: string;
  country?: string;
  address?: string;
  email?: string;
  phone?: string;
  channel?: Channel;
  officeId?: string;
  agentId?: string;
  state: KycState;
  risk: RiskLevel;
  riskScore?: number;
  flags?: string[];
  submittedAt?: string;
  decidedAt?: string;
  decidedBy?: string;
  decisionReason?: string;
}

export interface ScreeningMatch {
  list: ScreeningList;
  name: string;
  country?: string;
  similarity: number;
  details?: string;
}

export interface RiskScore {
  score: number;
  level: RiskLevel;
  flags: string[];
  recommendation?: string;
  factors: {
    documentValid: boolean;
    livenessPass: boolean;
    addressVerified: boolean;
    pepMatch: boolean;
    sanctionsMatch: boolean;
    docExpiring: boolean;
  };
}

export interface DocumentRef {
  id: string;
  type: DocumentType;
  name: string;
  url?: string;
  uploadedAt: string;
  valid?: boolean;
  notes?: string;
  size?: number;
  mimeType?: string;
}

export interface Decision {
  action: DecisionAction;
  reason?: string;
  at: string;
  by: string;
  notes?: string;
}

export interface WebhookConfig {
  id?: string;
  url: string;
  secret: string;
  events: string[];
  enabled: boolean;
  lastTriggered?: string;
}

export interface AuditEvent {
  id: string;
  at: string;
  actor: string;
  action: string;
  applicantId: string;
  payload?: Record<string, any>;
}

export interface KycFilters {
  from?: string;
  to?: string;
  estado?: KycState;
  riesgo?: RiskLevel;
  canal?: Channel;
  oficina?: string;
  agente?: string;
  q?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface LivenessResult {
  success: boolean;
  confidence: number;
  poses: {
    frontal: boolean;
    leftTurn: boolean;
    rightTurn: boolean;
    smile: boolean;
  };
}

export interface AddressVerification {
  verified: boolean;
  method: "utility_bill" | "bank_statement" | "iban" | "other";
  confidence: number;
  matchedFields: string[];
  issues?: string[];
}

export interface KycStats {
  total: number;
  nuevo: number;
  enRevision: number;
  aprobado: number;
  rechazado: number;
  pendInfo: number;
  riesgoAlto: number;
  riesgoCritico: number;
}