import { z } from "zod";

// Connection schemas
export const oauthConfigSchema = z.object({
  clientId: z.string().min(1, "Client ID es obligatorio"),
  clientSecret: z.string().min(1, "Client Secret es obligatorio"),
  redirectUri: z.string().url("Redirect URI debe ser una URL válida").refine(
    (url) => url.startsWith("https://"),
    "Redirect URI debe usar HTTPS"
  ),
});

export const apiKeyConfigSchema = z.object({
  apiKey: z.string().min(1, "API Key es obligatorio"),
  accountSid: z.string().optional(),
  region: z.string().optional(),
});

export const credentialsConfigSchema = z.object({
  username: z.string().min(1, "Usuario es obligatorio"),
  password: z.string().min(1, "Contraseña es obligatoria"),
  tenant: z.string().optional(),
});

export const webhooksConfigSchema = z.object({
  voice: z.string().url("URL de webhook de voz debe ser válida").optional(),
  sms: z.string().url("URL de webhook de SMS debe ser válida").optional(),
});

export const connectionConfigSchema = z.object({
  mode: z.enum(["OAUTH", "API_KEY", "CREDENTIALS"]),
  oauth: oauthConfigSchema.optional(),
  apiKey: apiKeyConfigSchema.optional(),
  credentials: credentialsConfigSchema.optional(),
  webhooks: webhooksConfigSchema.optional(),
});

// Phone number schemas
export const e164Schema = z.string().regex(
  /^\+[1-9]\d{1,14}$/,
  "Número debe estar en formato E.164 (+1234567890)"
);

export const phoneNumberSchema = z.object({
  id: z.string().optional(),
  e164: e164Schema,
  providerId: z.string().min(1, "Proveedor es obligatorio"),
  officeId: z.string().optional(),
  agentId: z.string().optional(),
  callerId: e164Schema.optional(),
  recording: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
});

// Routing schemas
export const routingActionSchema = z.object({
  type: z.enum(["AGENT", "RING_GROUP", "IVR", "VOICEMAIL", "QUEUE", "WEBHOOK"]),
  ref: z.string().optional(),
  fallback: z.string().optional(),
  timeout: z.number().min(5).max(300).optional(),
});

export const routingConditionSchema = z.object({
  hours: z.string().optional(),
  ivrOption: z.string().optional(),
  priority: z.number().min(1).max(100).optional(),
  fallback: z.string().optional(),
});

export const routingRuleSchema = z.object({
  id: z.string().optional(),
  numberId: z.string().min(1, "Número es obligatorio"),
  condition: routingConditionSchema,
  action: routingActionSchema,
  priority: z.number().min(1).max(100),
  enabled: z.boolean().default(true),
  name: z.string().max(100).optional(),
});

// SMS Template schemas
export const smsTemplateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nombre es obligatorio").max(100),
  channel: z.enum(["CALL", "SMS", "WHATSAPP"]),
  lang: z.enum(["es", "en", "ca"]),
  body: z.string()
    .min(1, "Cuerpo del mensaje es obligatorio")
    .max(1000, "Máximo 1000 caracteres"),
  variables: z.array(z.string()),
  isActive: z.boolean().default(true),
}).refine((data) => {
  // Validate that all declared variables exist in the body
  const declaredVars = data.variables;
  const bodyVars = Array.from(data.body.matchAll(/\{\{(\w+)\}\}/g), m => m[1]);
  const unusedVars = declaredVars.filter(v => !bodyVars.includes(v));
  const undeclaredVars = bodyVars.filter(v => !declaredVars.includes(v));
  
  return unusedVars.length === 0 && undeclaredVars.length === 0;
}, {
  message: "Las variables declaradas deben coincidir con las variables usadas en el cuerpo del mensaje",
});

// Webhook schemas
export const webhookConfigSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nombre es obligatorio").max(100),
  url: z.string().url("URL debe ser válida").refine(
    (url) => url.startsWith("https://"),
    "URL debe usar HTTPS"
  ),
  secret: z.string().min(8, "Secret debe tener al menos 8 caracteres").optional(),
  events: z.array(z.string()).min(1, "Debe seleccionar al menos un evento"),
  isActive: z.boolean().default(true),
  providerId: z.string().min(1, "Proveedor es obligatorio"),
});

// Queue schemas
export const queueConfigSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nombre es obligatorio").max(100),
  maxWaitTime: z.number().min(30).max(1800), // 30 seconds to 30 minutes
  musicOnHold: z.string().optional(),
  strategy: z.enum(["round-robin", "least-busy", "random", "longest-idle"]),
  slaThreshold: z.number().min(10).max(300), // 10 seconds to 5 minutes
  agents: z.array(z.string()),
  numberId: z.string().min(1, "Número es obligatorio"),
  isActive: z.boolean().default(true),
});

// Schedule schemas
export const workingHoursSchema = z.object({
  open: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato: HH:MM"),
  close: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato: HH:MM"),
  enabled: z.boolean(),
});

export const holidaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato: YYYY-MM-DD"),
  name: z.string().min(1, "Nombre es obligatorio").max(100),
});

export const scheduleConfigSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nombre es obligatorio").max(100),
  timezone: z.string().min(1, "Zona horaria es obligatoria"),
  workingHours: z.record(z.string(), workingHoursSchema),
  holidays: z.array(holidaySchema),
  afterHoursAction: routingActionSchema,
  holidayAction: routingActionSchema,
});

// Recording schemas
export const recordingConfigSchema = z.object({
  enabled: z.boolean(),
  retentionDays: z.number().min(7).max(365),
  encryption: z.boolean().default(false),
  downloadable: z.boolean().default(true),
});

// Call flow schemas
export const flowNodeSchema = z.object({
  id: z.string(),
  type: z.enum(["menu", "transfer", "queue", "voicemail", "tts", "webhook"]),
  x: z.number(),
  y: z.number(),
  data: z.record(z.any()),
});

export const flowEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string().optional(),
});

export const flowSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nombre es obligatorio").max(100),
  description: z.string().max(500).optional(),
  nodes: z.array(flowNodeSchema),
  edges: z.array(flowEdgeSchema),
  isActive: z.boolean().default(false),
  numberId: z.string().optional(),
}).refine((data) => {
  // Validate no loops in the flow
  const nodeIds = data.nodes.map(n => n.id);
  const edges = data.edges;
  
  // Simple cycle detection using DFS
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  
  function hasCycle(nodeId: string): boolean {
    if (recursionStack.has(nodeId)) return true;
    if (visited.has(nodeId)) return false;
    
    visited.add(nodeId);
    recursionStack.add(nodeId);
    
    const outgoingEdges = edges.filter(e => e.source === nodeId);
    for (const edge of outgoingEdges) {
      if (hasCycle(edge.target)) return true;
    }
    
    recursionStack.delete(nodeId);
    return false;
  }
  
  for (const nodeId of nodeIds) {
    if (!visited.has(nodeId) && hasCycle(nodeId)) {
      return false;
    }
  }
  
  return true;
}, {
  message: "El flujo no puede contener bucles infinitos",
});

// Filter schemas
export const callLogFiltersSchema = z.object({
  providerId: z.string().optional(),
  number: z.string().optional(),
  agentId: z.string().optional(),
  officeId: z.string().optional(),
  channel: z.enum(["CALL", "SMS", "WHATSAPP"]).optional(),
  direction: z.enum(["IN", "OUT"]).optional(),
  status: z.enum(["answered", "busy", "no_answer", "failed", "sent", "received"]).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  q: z.string().optional(),
  page: z.number().min(1).optional(),
  size: z.number().min(1).max(100).optional(),
  sort: z.string().optional(),
});

export const usageFiltersSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato: YYYY-MM-DD"),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato: YYYY-MM-DD"),
  providerId: z.string().optional(),
  officeId: z.string().optional(),
});

export const qualityFiltersSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato: YYYY-MM-DD"),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato: YYYY-MM-DD"),
  providerId: z.string().optional(),
});

// Test schemas
export const testConnectionSchema = z.object({
  providerId: z.string().min(1, "Proveedor es obligatorio"),
});

export const testSmsSchema = z.object({
  to: e164Schema,
  templateId: z.string().min(1, "Plantilla es obligatoria"),
  variables: z.record(z.string()),
});

// Import/Export schemas
export const importConfigSchema = z.object({
  version: z.string(),
  timestamp: z.string(),
  providers: z.array(z.any()).optional(),
  numbers: z.array(phoneNumberSchema).optional(),
  rules: z.array(routingRuleSchema).optional(),
  templates: z.array(smsTemplateSchema).optional(),
  webhooks: z.array(webhookConfigSchema).optional(),
  queues: z.array(queueConfigSchema).optional(),
  schedules: z.array(scheduleConfigSchema).optional(),
});