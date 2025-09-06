import { z } from 'zod';

export const ConnectionTypeSchema = z.enum(['oauth', 'apikey', 'credentials']);
export const EidasLevelSchema = z.enum(['SES', 'AES', 'QES']);
export const ProviderStatusSchema = z.enum(['DISCONNECTED', 'CONNECTED', 'TOKEN_EXPIRED', 'ERROR']);
export const EnvelopeStatusSchema = z.enum(['draft', 'sent', 'viewed', 'signed', 'declined', 'expired', 'canceled']);
export const AuthMethodSchema = z.enum(['EMAIL', 'OTP_SMS', 'KBA']);
export const SignerRoleSchema = z.enum(['CLIENTE', 'PROPIETARIO', 'AGENCIA', 'TESTIGO']);
export const TemplateTypeSchema = z.enum(['MANDATO', 'ENCARGO', 'CONTRATO', 'ANEXO', 'SEPA', 'DPA']);
export const LanguageSchema = z.enum(['es', 'en', 'ca', 'gl', 'eu']);
export const FlowSequenceSchema = z.enum(['SECUENCIAL', 'PARALELO']);

// OAuth Connection Schema
export const OAuthCredentialsSchema = z.object({
  type: z.literal('oauth'),
  clientId: z.string().min(1, 'Client ID is required'),
  clientSecret: z.string().min(1, 'Client Secret is required'),
  redirectUri: z.string().url('Invalid redirect URI').optional(),
  region: z.string().optional()
});

// API Key Connection Schema
export const ApiKeyCredentialsSchema = z.object({
  type: z.literal('apikey'),
  apiKey: z.string().min(1, 'API Key is required'),
  accountId: z.string().optional(),
  region: z.string().optional()
});

// Credentials Connection Schema
export const CredentialsSchema = z.object({
  type: z.literal('credentials'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  accountId: z.string().optional()
});

export const ConnectionCredentialsSchema = z.discriminatedUnion('type', [
  OAuthCredentialsSchema,
  ApiKeyCredentialsSchema,
  CredentialsSchema
]);

// Template Schema
export const SignatureFieldSchema = z.object({
  id: z.string(),
  type: z.enum(['signature', 'initial', 'checkbox', 'text', 'date']),
  x: z.number().min(0),
  y: z.number().min(0),
  width: z.number().min(10),
  height: z.number().min(10),
  page: z.number().int().min(1),
  required: z.boolean().default(true),
  signerId: z.string().optional(),
  label: z.string().optional()
});

export const TemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(100),
  type: TemplateTypeSchema,
  lang: LanguageSchema.default('es'),
  officeId: z.string().optional(),
  content: z.string().min(1, 'Template content is required'),
  variables: z.array(z.string()).default([]),
  signatureFields: z.array(SignatureFieldSchema).min(1, 'At least one signature field is required')
});

// Signer Schema
export const SignerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Signer name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number (E.164 format)').optional(),
  role: SignerRoleSchema,
  auth: AuthMethodSchema,
  order: z.number().int().min(1)
}).refine((data) => {
  // If OTP_SMS is selected, phone is required
  if (data.auth === 'OTP_SMS' && !data.phone) {
    return false;
  }
  return true;
}, {
  message: 'Phone number is required when using OTP_SMS authentication',
  path: ['phone']
});

// Flow Schema
export const FlowSchema = z.object({
  name: z.string().min(1, 'Flow name is required').max(100),
  description: z.string().max(500).optional(),
  defaultProviderId: z.string().optional(),
  reminders: z.object({
    everyDays: z.number().int().min(1).max(30),
    max: z.number().int().min(1).max(10)
  }),
  expiresInDays: z.number().int().min(1).max(365),
  sequence: FlowSequenceSchema,
  signers: z.array(SignerSchema).min(1, 'At least one signer is required'),
  requiredAttachments: z.array(z.string()).optional()
}).refine((data) => {
  // Check order coherence for sequential flows
  if (data.sequence === 'SECUENCIAL') {
    const orders = data.signers.map(s => s.order).sort((a, b) => a - b);
    for (let i = 0; i < orders.length; i++) {
      if (orders[i] !== i + 1) {
        return false;
      }
    }
  }
  return true;
}, {
  message: 'Sequential flow must have consecutive order numbers starting from 1',
  path: ['signers']
});

// Envelope Schema
export const EnvelopeSchema = z.object({
  templateId: z.string().min(1, 'Template ID is required'),
  providerId: z.string().min(1, 'Provider ID is required'),
  subject: z.string().min(1, 'Subject is required').max(200),
  message: z.string().max(1000).optional(),
  signers: z.array(SignerSchema.omit({ id: true })).min(1, 'At least one signer is required'),
  expiresInDays: z.number().int().min(1).max(365).default(30)
});

// Webhook Schema
export const WebhookSchema = z.object({
  url: z.string().url('Invalid webhook URL').refine(
    (url) => url.startsWith('https://'),
    { message: 'Webhook URL must use HTTPS' }
  ),
  secret: z.string().min(8, 'Secret must be at least 8 characters long'),
  events: z.array(z.string()).min(1, 'At least one event must be selected'),
  enabled: z.boolean().default(true)
});

// Branding Schema
export const BrandingSchema = z.object({
  providerId: z.string().min(1, 'Provider ID is required'),
  logo: z.string().url().optional(),
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color'),
  secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color'),
  senderName: z.string().min(1, 'Sender name is required').max(50),
  emailSubjectTemplate: z.string().min(1, 'Email subject template is required').max(200),
  emailBodyTemplate: z.string().min(1, 'Email body template is required').max(2000),
  legalFooter: z.string().max(1000).optional(),
  language: LanguageSchema.default('es')
});

// Filters Schema
export const EnvelopeFiltersSchema = z.object({
  status: EnvelopeStatusSchema.optional(),
  providerId: z.string().optional(),
  templateId: z.string().optional(),
  office: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  q: z.string().optional()
});

export const TemplateFiltersSchema = z.object({
  type: TemplateTypeSchema.optional(),
  office: z.string().optional(),
  lang: LanguageSchema.optional()
});

export const LogFiltersSchema = z.object({
  providerId: z.string().optional(),
  action: z.string().optional(),
  result: z.enum(['ok', 'error']).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  q: z.string().optional(),
  page: z.number().int().min(1).default(1),
  size: z.number().int().min(1).max(100).default(25)
});

// Validation helpers
export const validateTemplate = (data: unknown) => {
  return TemplateSchema.safeParse(data);
};

export const validateFlow = (data: unknown) => {
  return FlowSchema.safeParse(data);
};

export const validateEnvelope = (data: unknown) => {
  return EnvelopeSchema.safeParse(data);
};

export const validateWebhook = (data: unknown) => {
  return WebhookSchema.safeParse(data);
};

export const validateConnectionCredentials = (data: unknown) => {
  return ConnectionCredentialsSchema.safeParse(data);
};

export const validateBranding = (data: unknown) => {
  return BrandingSchema.safeParse(data);
};

// Template variable validation
export const validateTemplateVariables = (content: string, variables: string[]): string[] => {
  const missingVariables: string[] = [];
  const variableRegex = /\{\{([^}]+)\}\}/g;
  let match;
  
  while ((match = variableRegex.exec(content)) !== null) {
    const variable = match[1].trim();
    if (!variables.includes(variable)) {
      missingVariables.push(variable);
    }
  }
  
  return missingVariables;
};

// Phone number validation for E.164 format
export const validatePhoneNumber = (phone: string): boolean => {
  const e164Regex = /^\+?[1-9]\d{1,14}$/;
  return e164Regex.test(phone);
};

// URL validation for webhooks
export const validateWebhookUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

// Signature field validation
export const validateSignatureField = (field: any, pageCount: number): string[] => {
  const errors: string[] = [];
  
  if (field.page > pageCount) {
    errors.push(`Page ${field.page} does not exist (document has ${pageCount} pages)`);
  }
  
  if (field.x + field.width > 595) { // A4 width in points
    errors.push('Signature field exceeds page width');
  }
  
  if (field.y + field.height > 842) { // A4 height in points
    errors.push('Signature field exceeds page height');
  }
  
  return errors;
};