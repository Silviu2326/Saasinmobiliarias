export type DsrType = 
  | "access"
  | "rectification"
  | "erasure"
  | "portability"
  | "restriction"
  | "objection";

export type DsrStatus = "open" | "in_progress" | "done" | "rejected";

export interface DsrRequest {
  id: string;
  subject: string;
  email?: string;
  type: DsrType;
  status: DsrStatus;
  description?: string;
  createdAt: string;
  dueAt: string;
  completedAt?: string;
  assignedTo?: string;
  notes?: string;
}

export interface Consent {
  id: string;
  subject: string;
  email?: string;
  purpose: string;
  granted: boolean;
  evidence?: string;
  at: string;
  by: string;
  origin?: string;
  ip?: string;
  revokedAt?: string;
  revokedReason?: string;
}

export interface ActivityRecord {
  id: string;
  name: string;
  purpose: string;
  legalBase: string;
  dataCategories: string[];
  dataSubjects: string[];
  recipients: string[];
  retention: string;
  safeguards?: string;
  intlTransfers?: boolean;
  transferDetails?: string;
  version: string;
  updatedAt: string;
  updatedBy: string;
}

export interface PrivacyNotice {
  id: string;
  title: string;
  content: string;
  version: string;
  status: "draft" | "published" | "archived";
  type: "website" | "form" | "contract" | "email";
  updatedAt: string;
  updatedBy: string;
  publishedAt?: string;
  effectiveDate?: string;
  previousVersionId?: string;
}

export interface CookieItem {
  id: string;
  name: string;
  provider: string;
  purpose: string;
  duration: string;
  category: "necessary" | "analytics" | "marketing" | "other";
  description?: string;
  domain?: string;
  httpOnly?: boolean;
  secure?: boolean;
}

export interface CookieCategory {
  id: string;
  name: string;
  description: string;
  required: boolean;
  cookies: CookieItem[];
}

export interface RetentionRule {
  id: string;
  entity: string;
  action: "anonymize" | "delete";
  afterDays: number;
  enabled: boolean;
  description?: string;
  legalBasis?: string;
  lastRun?: string;
  nextRun?: string;
}

export interface Breach {
  id: string;
  date: string;
  discoveryDate: string;
  systems: string[];
  dataCategories: string[];
  affected: number;
  risk: "low" | "medium" | "high";
  description: string;
  measures?: string;
  notifiedAEPD?: boolean;
  notifiedAEPDDate?: string;
  notifiedSubjects?: boolean;
  notifiedSubjectsDate?: string;
  status: "open" | "investigating" | "contained" | "resolved";
  assignedTo?: string;
}

export interface DataMapEntry {
  id: string;
  system: string;
  description?: string;
  dataCategories: string[];
  purposes: string[];
  processors?: string[];
  processorContracts?: boolean;
  intlTransfers?: boolean;
  transferMechanism?: string;
  accessControls?: string[];
  dataOwner?: string;
  technicalContact?: string;
}

export interface ComplianceMetrics {
  score: number;
  level: "high" | "medium" | "low";
  pendingDsr: number;
  overdueDsr: number;
  activeBreaches: number;
  highRiskBreaches: number;
  missingPolicies: string[];
  lastAudit?: string;
  nextAudit?: string;
  issues: ComplianceIssue[];
}

export interface ComplianceIssue {
  type: string;
  severity: "critical" | "warning" | "info";
  message: string;
  action?: string;
  link?: string;
}

export interface RgpdExport {
  exportDate: string;
  dsr: DsrRequest[];
  consents: Consent[];
  ropa: ActivityRecord[];
  policies: PrivacyNotice[];
  breaches: Breach[];
  dataMap: DataMapEntry[];
}