export type DsrType = 
  | "access"
  | "rectification"
  | "erasure"
  | "portability"
  | "restriction"
  | "objection";

export interface DsrRequest {
  id: string;
  subject: string;
  type: DsrType;
  status: "open" | "in_progress" | "done" | "rejected";
  createdAt: string;
  dueAt: string;
  responseData?: any;
  notes?: string;
}

export interface Consent {
  id: string;
  subject: string;
  purpose: "marketing" | "whatsapp" | "email" | "portales";
  granted: boolean;
  evidence?: string;
  at: string;
  by: string;
  origin?: string;
  ip?: string;
  revokedAt?: string;
}

export interface AuditEvent {
  id: string;
  at: string;
  actor: string;
  action: string;
  entity: string;
  ref?: string;
  details?: Record<string, any>;
  severity: "low" | "medium" | "high";
}

export interface ChecklistItem {
  id: string;
  label: string;
  required: boolean;
  done: boolean;
  evidence?: string;
  blocker?: boolean;
  notes?: string;
  category?: string;
}

export interface KycCheck {
  id: string;
  fullName: string;
  docId: string;
  docType: "dni" | "nie" | "passport";
  birthDate: string;
  country: string;
  isPep: boolean;
  amlRiskScore?: number;
  verificationStatus: "pending" | "verified" | "failed" | "manual_review";
  verifiedAt?: string;
  flags?: string[];
}

export interface LegalDocument {
  id: string;
  template: "mandate" | "dpa" | "privacy_clauses" | "assignment";
  variables: Record<string, string>;
  version: number;
  createdAt: string;
  createdBy: string;
  status: "draft" | "final" | "signed";
  content?: string;
}

export interface DpiaReport {
  id: string;
  scope: string;
  context: string;
  risks: {
    id: string;
    category: "legal" | "security" | "operational";
    description: string;
    score: number;
    mitigation?: string;
  }[];
  measures: string[];
  responsible: string;
  createdAt: string;
  status: "draft" | "approved" | "pending_review";
}

export interface ComplianceOverview {
  status: "ok" | "warning" | "critical";
  pendingDsr: number;
  expiredDsr: number;
  missingConsents: number;
  checklistProgress: number;
  checklistTotal: number;
  kycPending: number;
  auditEvents24h: number;
  issues: string[];
}

export interface EidasProvider {
  status: "not_configured" | "connected" | "error";
  provider?: string;
  lastCheck?: string;
  capabilities?: string[];
}