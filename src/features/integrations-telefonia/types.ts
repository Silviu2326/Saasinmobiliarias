export type ProviderStatus = "DISCONNECTED" | "CONNECTED" | "TOKEN_EXPIRED" | "ERROR";
export type Channel = "CALL" | "SMS" | "WHATSAPP";
export type Direction = "IN" | "OUT";
export type ConnectMode = "OAUTH" | "API_KEY" | "CREDENTIALS";
export type RoutingActionType = "AGENT" | "RING_GROUP" | "IVR" | "VOICEMAIL" | "QUEUE" | "WEBHOOK";
export type CallStatus = "answered" | "busy" | "no_answer" | "failed" | "sent" | "received";
export type Language = "es" | "en" | "ca";

export interface ProviderInfo {
  id: string;
  name: string;
  logo: string;
  status: ProviderStatus;
  balance?: number;
  lastLatencyMs?: number;
  supports: {
    voice: boolean;
    sms: boolean;
    whatsapp?: boolean;
  };
  connectMode: ConnectMode;
  lastUpdated?: string;
}

export interface ConnectionConfig {
  mode: ConnectMode;
  oauth?: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };
  apiKey?: {
    apiKey: string;
    accountSid?: string;
    region?: string;
  };
  credentials?: {
    username: string;
    password: string;
    tenant?: string;
  };
  webhooks?: {
    voice?: string;
    sms?: string;
  };
}

export interface PhoneNumber {
  id: string;
  e164: string;
  providerId: string;
  officeId?: string;
  agentId?: string;
  callerId?: string;
  recording: boolean;
  tags?: string[];
  purchaseDate?: string;
  monthlyCost?: number;
}

export interface RoutingCondition {
  hours?: string;
  ivrOption?: string;
  priority?: number;
  fallback?: string;
}

export interface RoutingAction {
  type: RoutingActionType;
  ref?: string;
  fallback?: string;
  timeout?: number;
}

export interface RoutingRule {
  id: string;
  numberId: string;
  condition: RoutingCondition;
  action: RoutingAction;
  priority: number;
  enabled: boolean;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Flow {
  id: string;
  name: string;
  description?: string;
  json: any;
  isActive: boolean;
  numberId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SmsTemplate {
  id: string;
  name: string;
  channel: Channel;
  lang: Language;
  body: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QualityStats {
  from: string;
  to: string;
  asr: number; // Answer Seizure Rate
  jitterMs: number;
  mos: number; // Mean Opinion Score
  dropPct: number;
  providerId: string;
  totalCalls: number;
  avgDuration: number;
}

export interface UsageRow {
  date: string;
  providerId: string;
  inMinutes: number;
  outMinutes: number;
  smsIn: number;
  smsOut: number;
  whatsappIn?: number;
  whatsappOut?: number;
  cost: number;
  officeId?: string;
}

export interface CallLog {
  id: string;
  at: string;
  channel: Channel;
  direction: Direction;
  from: string;
  to: string;
  agentId?: string;
  officeId?: string;
  durationSec?: number;
  recordingUrl?: string;
  status: CallStatus;
  cost?: number;
  providerId: string;
  transcript?: string;
  meta?: Record<string, any>;
}

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  secret?: string;
  events: string[];
  isActive: boolean;
  providerId: string;
  lastTriggered?: string;
  createdAt: string;
}

export interface QueueConfig {
  id: string;
  name: string;
  maxWaitTime: number;
  musicOnHold?: string;
  strategy: "round-robin" | "least-busy" | "random" | "longest-idle";
  slaThreshold: number;
  agents: string[];
  numberId: string;
  isActive: boolean;
}

export interface ScheduleConfig {
  id: string;
  name: string;
  timezone: string;
  workingHours: {
    [key: string]: { // monday, tuesday, etc.
      open: string;
      close: string;
      enabled: boolean;
    };
  };
  holidays: Array<{
    date: string;
    name: string;
  }>;
  afterHoursAction: RoutingAction;
  holidayAction: RoutingAction;
}

export interface LiveStatus {
  agentsOnline: number;
  agentsBusy: number;
  activeQueues: number;
  avgWaitTime: number;
  callsInProgress: number;
  timestamp: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, any>;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
}

export interface TestResult {
  success: boolean;
  latencyMs?: number;
  error?: string;
  timestamp: string;
}

export interface ImportExportConfig {
  version: string;
  timestamp: string;
  providers: ProviderInfo[];
  numbers: PhoneNumber[];
  rules: RoutingRule[];
  templates: SmsTemplate[];
  webhooks: WebhookConfig[];
  queues: QueueConfig[];
  schedules: ScheduleConfig[];
}

// Filter interfaces
export interface CallLogFilters {
  providerId?: string;
  number?: string;
  agentId?: string;
  officeId?: string;
  channel?: Channel;
  direction?: Direction;
  status?: CallStatus;
  from?: string;
  to?: string;
  q?: string; // search query
  page?: number;
  size?: number;
  sort?: string;
}

export interface UsageFilters {
  from: string;
  to: string;
  providerId?: string;
  officeId?: string;
}

export interface QualityFilters {
  from: string;
  to: string;
  providerId?: string;
}