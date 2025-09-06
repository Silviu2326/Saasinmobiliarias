export type PortalMode = "API" | "FEED";
export type PortalStatus = "DISCONNECTED" | "CONNECTED" | "TOKEN_EXPIRED" | "ERROR" | "PAUSED";
export type JobStatus = "ok" | "error" | "pending";
export type JobAction = "create" | "update" | "delete";
export type CredentialMode = "oauth" | "apikey" | "creds";
export type Currency = "EUR" | "USD" | "GBP";
export type Visibility = "public" | "private";

export interface PortalInfo {
  id: string;
  name: string;
  logo: string;
  mode: PortalMode;
  status: PortalStatus;
  lastSyncAt?: string;
  description?: string;
  apiVersion?: string;
  supportedActions?: JobAction[];
  websiteUrl?: string;
}

export interface OAuthCredentials {
  clientId?: string;
  clientSecret?: string;
  token?: string;
  refreshToken?: string;
}

export interface ApiKeyCredentials {
  apiKey: string;
  accountId?: string;
  region?: string;
  environment?: string;
}

export interface UsernameCredentials {
  username: string;
  password: string;
  clientId?: string;
  domain?: string;
}

export interface Credentials {
  mode: CredentialMode;
  alias: string;
  officeScope?: string;
  updatedAt: string;
  expiresAt?: string;
  oauth?: OAuthCredentials;
  apikey?: ApiKeyCredentials;
  creds?: UsernameCredentials;
}

export interface PricePolicy {
  rounding?: number;
  marginPct?: number;
  currency: Currency;
  minPrice?: number;
  maxPrice?: number;
}

export interface PhotosPolicy {
  min?: number;
  max?: number;
  watermark?: boolean;
  quality?: number;
  resize?: boolean;
  maxWidth?: number;
}

export interface PublishDefaults {
  titleTpl: string;
  descTpl: string;
  pricePolicy: PricePolicy;
  photosPolicy: PhotosPolicy;
  contactPhone?: string;
  visibility: Visibility;
  autoRenew?: boolean;
  categories?: string[];
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface FieldMap {
  from: string;
  to: string;
  required?: boolean;
  transform?: string;
  defaultValue?: string;
  validation?: string;
}

export interface AdvancedConfig {
  syncFrequencyMin: number;
  throttleReqPerMin: number;
  deletePolicy: "remove" | "pause" | "archive";
  duplicatePolicy: "skip" | "update" | "create";
  errorRetryCount: number;
  backoffMultiplier: number;
}

export interface PortalConfig {
  credentials?: Credentials;
  publishDefaults: PublishDefaults;
  mappings: FieldMap[];
  advanced: AdvancedConfig;
  updatedAt: string;
  updatedBy: string;
}

export interface SyncJob {
  id: string;
  portalId: string;
  action: JobAction;
  entity: "property";
  ref: string;
  status: JobStatus;
  durationMs?: number;
  attempts: number;
  message?: string;
  at: string;
  startedAt?: string;
  completedAt?: string;
  requestSize?: number;
  responseSize?: number;
}

export interface PortalStats {
  from: string;
  to: string;
  activeListings: number;
  leads: number;
  errors24h: number;
  cost?: number;
  cpl?: number;
  cpa?: number;
  duplicatesPct?: number;
  avgResponseTime?: number;
  totalRequests: number;
  successRate: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  portalId: string;
  portalName: string;
  action: JobAction;
  entity: string;
  entityId: string;
  result: JobStatus;
  message?: string;
  duration?: number;
  user?: string;
  requestData?: any;
  responseData?: any;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  portalId: string;
  portalName: string;
  eventType: "credential_update" | "mapping_change" | "config_change" | "publish_action";
  user: string;
  description: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
}

export interface ConnectionTest {
  portalId: string;
  success: boolean;
  latencyMs?: number;
  message?: string;
  testedAt: string;
  details?: {
    authValid: boolean;
    endpointReachable: boolean;
    apiVersion?: string;
    rateLimitRemaining?: number;
  };
}

export interface ImportExportConfig {
  portals: {
    [portalId: string]: {
      config: Omit<PortalConfig, 'credentials'>;
      credentials?: {
        mode: CredentialMode;
        alias: string;
        officeScope?: string;
      };
    };
  };
  exportedAt: string;
  exportedBy: string;
  version: string;
}

export interface SampleProperty {
  address: string;
  sqm: number;
  numRooms: number;
  price: number;
  propertyType: string;
  description: string;
  features: string[];
  photos: string[];
}

export interface PortalFilters {
  status?: PortalStatus;
  mode?: PortalMode;
  search?: string;
}

export interface LogFilters {
  portal?: string;
  action?: JobAction;
  result?: JobStatus;
  from?: string;
  to?: string;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}