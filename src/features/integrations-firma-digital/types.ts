export type EidasLevel = "SES" | "AES" | "QES";
export type ProviderStatus = "DISCONNECTED" | "CONNECTED" | "TOKEN_EXPIRED" | "ERROR";
export type EnvelopeStatus = "draft" | "sent" | "viewed" | "signed" | "declined" | "expired" | "canceled";
export type SignerStatus = EnvelopeStatus | "pending";
export type AuthMethod = "EMAIL" | "OTP_SMS" | "KBA";
export type SignerRole = "CLIENTE" | "PROPIETARIO" | "AGENCIA" | "TESTIGO";
export type TemplateType = "MANDATO" | "ENCARGO" | "CONTRATO" | "ANEXO" | "SEPA" | "DPA";
export type Language = "es" | "en" | "ca" | "gl" | "eu";
export type FlowSequence = "SECUENCIAL" | "PARALELO";
export type ConnectionType = "oauth" | "apikey" | "credentials";

export interface ProviderInfo {
  id: string;
  name: string;
  logo: string;
  supports: {
    ses: boolean;
    aes: boolean;
    qes: boolean;
  };
  status: ProviderStatus;
  credits: number;
  lastUsedAt?: string;
  connectionType: ConnectionType;
  description: string;
}

export interface ProviderConnection {
  id: string;
  type: ConnectionType;
  credentials: {
    clientId?: string;
    clientSecret?: string;
    apiKey?: string;
    username?: string;
    password?: string;
    accountId?: string;
    region?: string;
    redirectUri?: string;
  };
  isActive: boolean;
  expiresAt?: string;
  lastTestAt?: string;
}

export interface Template {
  id: string;
  name: string;
  type: TemplateType;
  lang: Language;
  officeId?: string;
  variables: string[];
  content: string;
  signatureFields: SignatureField[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface SignatureField {
  id: string;
  type: "signature" | "initial" | "checkbox" | "text" | "date";
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  required: boolean;
  signerId?: string;
  label?: string;
}

export interface Signer {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role: SignerRole;
  auth: AuthMethod;
  order: number;
  status?: SignerStatus;
  signedAt?: string;
  viewedAt?: string;
  declinedAt?: string;
  declineReason?: string;
}

export interface Flow {
  id: string;
  name: string;
  description?: string;
  defaultProviderId?: string;
  reminders: {
    everyDays: number;
    max: number;
  };
  expiresInDays: number;
  sequence: FlowSequence;
  signers: Signer[];
  requiredAttachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Envelope {
  id: string;
  templateId: string;
  flowId?: string;
  providerId: string;
  status: EnvelopeStatus;
  subject: string;
  message?: string;
  createdAt: string;
  sentAt?: string;
  expiresAt?: string;
  completedAt?: string;
  signers: Signer[];
  hash?: string;
  tsaTimestamp?: string;
  documentUrl?: string;
  evidenceUrl?: string;
  metadata?: Record<string, any>;
}

export interface WebhookConfig {
  id?: string;
  url: string;
  secret: string;
  events: string[];
  enabled: boolean;
  lastTriggeredAt?: string;
  failureCount?: number;
}

export interface LogItem {
  id: string;
  timestamp: string;
  providerId: string;
  action: string;
  result: "ok" | "error";
  message?: string;
  metadata?: Record<string, any>;
  userId?: string;
  envelopeId?: string;
}

export interface EvidenceReport {
  envelopeId: string;
  documentHash: string;
  tsaTimestamp: string;
  signers: Array<{
    id: string;
    name: string;
    email: string;
    ip: string;
    userAgent: string;
    geolocation?: {
      latitude: number;
      longitude: number;
      city?: string;
      country?: string;
    };
    authMethod: AuthMethod;
    authDetails?: {
      otpVerified?: boolean;
      phoneNumber?: string;
      kbaScore?: number;
    };
    signedAt: string;
    certificateInfo?: {
      issuer: string;
      serialNumber: string;
      validFrom: string;
      validTo: string;
      eidasLevel: EidasLevel;
    };
  }>;
  auditTrail: Array<{
    timestamp: string;
    action: string;
    actor: string;
    details: string;
  }>;
}

export interface BrandingConfig {
  id?: string;
  providerId: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  senderName: string;
  emailSubjectTemplate: string;
  emailBodyTemplate: string;
  legalFooter: string;
  language: Language;
}

export interface CreditsUsage {
  providerId: string;
  providerName: string;
  currentCredits: number;
  usedThisMonth: number;
  monthlyLimit?: number;
  costPerSignature: number;
  lastRefillAt?: string;
  nextRefillAt?: string;
  alertThreshold: number;
}

export interface AuditTrailEntry {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: string;
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  ipAddress: string;
  userAgent: string;
}

export interface ComponentProps {
  onConnect?: (providerId: string) => void;
  onSettings?: (providerId: string) => void;
  onEdit?: (id: string) => void;
  onDetails?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface DrawerProps extends ModalProps {
  providerId?: string;
  templateId?: string;
  envelopeId?: string;
}