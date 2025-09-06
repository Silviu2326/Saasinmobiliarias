export type Severity = "low" | "med" | "high";
export type Result = "ok" | "error";
export type Origin = "web" | "api" | "task";
export type ExportFormat = "csv" | "json";
export type ExportStatus = "queued" | "processing" | "done" | "failed";

export interface AuditEvent {
  id: string;
  at: string;
  actor: string;
  role?: string;
  origin: Origin;
  entity: string;
  ref?: string;
  action: string;
  severity: Severity;
  result: Result;
  ip?: string;
  userAgent?: string;
  before?: Record<string, any>;
  after?: Record<string, any>;
  payload?: Record<string, any>;
  evidence?: string[];
  hash?: string;
  chainHash?: string;
  description?: string;
  location?: string;
  sessionId?: string;
}

export interface AuditQuery {
  q?: string;
  from?: string;
  to?: string;
  actor?: string;
  role?: string;
  origin?: Origin;
  entity?: string;
  action?: string;
  severity?: Severity;
  result?: Result;
  page?: number;
  size?: number;
  sort?: string;
}

export interface AuditResponse {
  items: AuditEvent[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ExportJob {
  id: string;
  status: ExportStatus;
  format: ExportFormat;
  filters: AuditQuery;
  url?: string;
  createdAt: string;
  completedAt?: string;
  error?: string;
  downloadCount: number;
  expiresAt: string;
}

export interface Schedule {
  id: string;
  name: string;
  cron: string;
  emails: string[];
  format: ExportFormat;
  filters: AuditQuery;
  enabled: boolean;
  createdAt: string;
  createdBy: string;
  lastRunAt?: string;
  nextRunAt?: string;
}

export interface RetentionInfo {
  policy: string;
  retentionDays: number;
  nextPurgeAt?: string;
  itemsForPurge: number;
  legalHold?: boolean;
  legalHoldReason?: string;
}

export interface IntegrityInfo {
  chained: boolean;
  lastVerifiedAt?: string;
  ok?: boolean;
  totalEvents: number;
  verifiedEvents: number;
  brokenChain?: boolean;
  lastBlockHash?: string;
}

export interface AuditDiff {
  field: string;
  before: any;
  after: any;
  type: 'added' | 'removed' | 'modified';
}

export interface Evidence {
  id: string;
  filename: string;
  type: 'text' | 'json' | 'image' | 'pdf' | 'other';
  size: number;
  url?: string;
  content?: string;
  hash?: string;
  uploadedAt: string;
}