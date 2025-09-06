import type {
  ProviderInfo,
  ConnectionConfig,
  PhoneNumber,
  RoutingRule,
  Flow,
  SmsTemplate,
  QualityStats,
  UsageRow,
  CallLog,
  WebhookConfig,
  QueueConfig,
  ScheduleConfig,
  LiveStatus,
  AuditEvent,
  TestResult,
  CallLogFilters,
  UsageFilters,
  QualityFilters,
} from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

// Simulated delay for realistic API behavior
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data generators
const mockProviders: ProviderInfo[] = [
  {
    id: "twilio",
    name: "Twilio",
    logo: "/logos/twilio.svg",
    status: "CONNECTED",
    balance: 156.75,
    lastLatencyMs: 45,
    supports: { voice: true, sms: true, whatsapp: true },
    connectMode: "API_KEY",
    lastUpdated: "2024-01-15T10:30:00Z",
  },
  {
    id: "vonage",
    name: "Vonage",
    logo: "/logos/vonage.svg",
    status: "DISCONNECTED",
    supports: { voice: true, sms: true },
    connectMode: "OAUTH",
  },
  {
    id: "plivo",
    name: "Plivo",
    logo: "/logos/plivo.svg",
    status: "TOKEN_EXPIRED",
    balance: 89.23,
    lastLatencyMs: 67,
    supports: { voice: true, sms: true },
    connectMode: "API_KEY",
    lastUpdated: "2024-01-10T14:22:00Z",
  },
  {
    id: "telnyx",
    name: "Telnyx",
    logo: "/logos/telnyx.svg",
    status: "ERROR",
    supports: { voice: true, sms: true, whatsapp: false },
    connectMode: "CREDENTIALS",
  },
];

const mockNumbers: PhoneNumber[] = [
  {
    id: "num-1",
    e164: "+34900123456",
    providerId: "twilio",
    officeId: "office-madrid",
    agentId: "agent-001",
    callerId: "+34900123456",
    recording: true,
    tags: ["ventas", "principal"],
    purchaseDate: "2024-01-01",
    monthlyCost: 12.5,
  },
  {
    id: "num-2",
    e164: "+34900654321",
    providerId: "twilio",
    officeId: "office-barcelona",
    recording: false,
    tags: ["soporte"],
    purchaseDate: "2024-01-05",
    monthlyCost: 12.5,
  },
];

/* PROVIDERS */
export const getProviders = async (): Promise<ProviderInfo[]> => {
  await delay();
  return mockProviders;
};

export const connectProvider = async (
  id: string,
  config: ConnectionConfig
): Promise<{ success: boolean; message?: string }> => {
  await delay(1000);
  
  // Simulate different outcomes
  if (id === "telnyx") {
    return { success: false, message: "Credenciales inválidas" };
  }
  
  return { success: true };
};

export const testProviderConnection = async (id: string): Promise<TestResult> => {
  await delay(800);
  
  if (id === "vonage") {
    return {
      success: false,
      error: "Proveedor no conectado",
      timestamp: new Date().toISOString(),
    };
  }
  
  return {
    success: true,
    latencyMs: Math.floor(Math.random() * 100) + 20,
    timestamp: new Date().toISOString(),
  };
};

export const getProviderConfig = async (id: string): Promise<any> => {
  await delay();
  return {
    recording: { enabled: true, retentionDays: 90 },
    queues: [],
    schedules: [],
  };
};

export const updateProviderConfig = async (id: string, config: any): Promise<void> => {
  await delay();
  // Simulate successful update
};

export const getProviderBalance = async (id: string): Promise<number> => {
  await delay();
  const provider = mockProviders.find(p => p.id === id);
  return provider?.balance ?? 0;
};

/* NUMBERS */
export const getNumbers = async (filters?: {
  provider?: string;
  office?: string;
  agent?: string;
}): Promise<PhoneNumber[]> => {
  await delay();
  let results = [...mockNumbers];
  
  if (filters?.provider) {
    results = results.filter(n => n.providerId === filters.provider);
  }
  if (filters?.office) {
    results = results.filter(n => n.officeId === filters.office);
  }
  if (filters?.agent) {
    results = results.filter(n => n.agentId === filters.agent);
  }
  
  return results;
};

export const assignNumber = async (data: {
  numberId: string;
  officeId?: string;
  agentId?: string;
}): Promise<void> => {
  await delay();
  // Simulate successful assignment
};

export const purchaseNumber = async (data: {
  providerId: string;
  countryCode: string;
  areaCode?: string;
}): Promise<PhoneNumber> => {
  await delay(2000);
  
  return {
    id: `num-${Date.now()}`,
    e164: `+${data.countryCode}${Math.floor(Math.random() * 900000000) + 100000000}`,
    providerId: data.providerId,
    recording: false,
    tags: [],
    purchaseDate: new Date().toISOString().split('T')[0],
    monthlyCost: 12.5,
  };
};

/* ROUTING & FLOWS */
export const getRoutingRules = async (numberId?: string): Promise<RoutingRule[]> => {
  await delay();
  
  const mockRules: RoutingRule[] = [
    {
      id: "rule-1",
      numberId: "num-1",
      condition: { hours: "09:00-18:00" },
      action: { type: "AGENT", ref: "agent-001" },
      priority: 1,
      enabled: true,
      name: "Horario comercial",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "rule-2",
      numberId: "num-1",
      condition: { hours: "18:00-09:00" },
      action: { type: "VOICEMAIL", fallback: "sms" },
      priority: 2,
      enabled: true,
      name: "Fuera de horario",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
  ];
  
  if (numberId) {
    return mockRules.filter(r => r.numberId === numberId);
  }
  
  return mockRules;
};

export const saveRoutingRules = async (rules: RoutingRule[]): Promise<void> => {
  await delay();
  // Simulate successful save
};

export const getFlows = async (): Promise<Flow[]> => {
  await delay();
  
  return [
    {
      id: "flow-1",
      name: "IVR Principal",
      description: "Menú principal de atención al cliente",
      json: {
        nodes: [
          { id: "start", type: "menu", x: 100, y: 100, data: { message: "Bienvenido" } },
          { id: "sales", type: "transfer", x: 300, y: 50, data: { agent: "ventas" } },
          { id: "support", type: "queue", x: 300, y: 150, data: { queue: "soporte" } },
        ],
        edges: [
          { id: "e1", source: "start", target: "sales", label: "1" },
          { id: "e2", source: "start", target: "support", label: "2" },
        ],
      },
      isActive: true,
      numberId: "num-1",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-10T00:00:00Z",
    },
  ];
};

export const saveFlow = async (flow: Partial<Flow>): Promise<Flow> => {
  await delay();
  
  const now = new Date().toISOString();
  return {
    id: flow.id || `flow-${Date.now()}`,
    name: flow.name || "Nuevo Flujo",
    description: flow.description,
    json: flow.json || { nodes: [], edges: [] },
    isActive: flow.isActive ?? false,
    numberId: flow.numberId,
    createdAt: flow.id ? "2024-01-01T00:00:00Z" : now,
    updatedAt: now,
  };
};

/* SMS TEMPLATES */
export const getSmsTemplates = async (): Promise<SmsTemplate[]> => {
  await delay();
  
  return [
    {
      id: "tpl-1",
      name: "Confirmación Cita",
      channel: "SMS",
      lang: "es",
      body: "Hola {{nombre}}, confirmamos tu cita para el {{fecha}} a las {{hora}}. Ref: {{ref}}",
      variables: ["nombre", "fecha", "hora", "ref"],
      isActive: true,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "tpl-2",
      name: "Bienvenida WhatsApp",
      channel: "WHATSAPP",
      lang: "es",
      body: "¡Bienvenido {{nombre}}! Gracias por contactarnos. ¿En qué podemos ayudarte?",
      variables: ["nombre"],
      isActive: true,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
    },
  ];
};

export const saveSmsTemplate = async (template: Partial<SmsTemplate>): Promise<SmsTemplate> => {
  await delay();
  
  const now = new Date().toISOString();
  return {
    id: template.id || `tpl-${Date.now()}`,
    name: template.name || "Nueva Plantilla",
    channel: template.channel || "SMS",
    lang: template.lang || "es",
    body: template.body || "",
    variables: template.variables || [],
    isActive: template.isActive ?? true,
    createdAt: template.id ? "2024-01-01T00:00:00Z" : now,
    updatedAt: now,
  };
};

export const deleteSmsTemplate = async (id: string): Promise<void> => {
  await delay();
  // Simulate successful deletion
};

export const sendTestSms = async (data: {
  to: string;
  templateId: string;
  variables: Record<string, string>;
}): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  await delay(1500);
  
  if (Math.random() > 0.1) {
    return {
      success: true,
      messageId: `msg-${Date.now()}`,
    };
  } else {
    return {
      success: false,
      error: "Número no válido",
    };
  }
};

/* QUALITY, USAGE & COSTS */
export const getQualityStats = async (filters: QualityFilters): Promise<QualityStats[]> => {
  await delay();
  
  return [
    {
      from: filters.from,
      to: filters.to,
      asr: 85.6,
      jitterMs: 12.3,
      mos: 4.2,
      dropPct: 2.1,
      providerId: filters.providerId || "twilio",
      totalCalls: 1250,
      avgDuration: 185,
    },
  ];
};

export const getUsageStats = async (filters: UsageFilters): Promise<UsageRow[]> => {
  await delay();
  
  const dates = [];
  const start = new Date(filters.from);
  const end = new Date(filters.to);
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d).toISOString().split('T')[0]);
  }
  
  return dates.map(date => ({
    date,
    providerId: filters.providerId || "twilio",
    inMinutes: Math.floor(Math.random() * 300) + 50,
    outMinutes: Math.floor(Math.random() * 200) + 30,
    smsIn: Math.floor(Math.random() * 50) + 5,
    smsOut: Math.floor(Math.random() * 100) + 10,
    whatsappIn: Math.floor(Math.random() * 20),
    whatsappOut: Math.floor(Math.random() * 30),
    cost: Math.random() * 50 + 10,
    officeId: filters.officeId,
  }));
};

export const getCostBreakdown = async (filters: UsageFilters): Promise<any> => {
  await delay();
  
  return {
    total: 145.67,
    breakdown: {
      voice: { inbound: 45.23, outbound: 67.89 },
      sms: { inbound: 12.34, outbound: 15.67 },
      whatsapp: { inbound: 2.11, outbound: 2.43 },
    },
  };
};

/* WEBHOOKS */
export const getWebhooks = async (): Promise<WebhookConfig[]> => {
  await delay();
  
  return [
    {
      id: "wh-1",
      name: "Eventos de llamadas",
      url: "https://api.ejemplo.com/webhooks/calls",
      secret: "wh_secret_123",
      events: ["call.started", "call.answered", "call.ended"],
      isActive: true,
      providerId: "twilio",
      lastTriggered: "2024-01-15T14:30:00Z",
      createdAt: "2024-01-01T00:00:00Z",
    },
  ];
};

export const saveWebhook = async (webhook: Partial<WebhookConfig>): Promise<WebhookConfig> => {
  await delay();
  
  const now = new Date().toISOString();
  return {
    id: webhook.id || `wh-${Date.now()}`,
    name: webhook.name || "Nuevo Webhook",
    url: webhook.url || "",
    secret: webhook.secret,
    events: webhook.events || [],
    isActive: webhook.isActive ?? true,
    providerId: webhook.providerId || "twilio",
    lastTriggered: webhook.lastTriggered,
    createdAt: webhook.id ? "2024-01-01T00:00:00Z" : now,
  };
};

export const testWebhook = async (webhookId: string): Promise<TestResult> => {
  await delay(1000);
  
  return {
    success: Math.random() > 0.2,
    latencyMs: Math.floor(Math.random() * 500) + 100,
    error: Math.random() > 0.8 ? "Timeout" : undefined,
    timestamp: new Date().toISOString(),
  };
};

/* CALL LOGS */
export const getCallLogs = async (filters: CallLogFilters): Promise<{
  data: CallLog[];
  total: number;
  page: number;
  size: number;
}> => {
  await delay();
  
  const mockLogs: CallLog[] = Array.from({ length: 50 }, (_, i) => ({
    id: `log-${i}`,
    at: new Date(Date.now() - i * 3600000).toISOString(),
    channel: Math.random() > 0.7 ? "SMS" : "CALL",
    direction: Math.random() > 0.5 ? "IN" : "OUT",
    from: `+3490012${String(i).padStart(4, '0')}`,
    to: `+3490098${String(i).padStart(4, '0')}`,
    agentId: Math.random() > 0.5 ? "agent-001" : undefined,
    officeId: Math.random() > 0.5 ? "office-madrid" : "office-barcelona",
    durationSec: Math.random() > 0.3 ? Math.floor(Math.random() * 600) + 30 : undefined,
    recordingUrl: Math.random() > 0.5 ? `/recordings/rec-${i}.mp3` : undefined,
    status: ["answered", "busy", "no_answer", "failed"][Math.floor(Math.random() * 4)] as any,
    cost: Math.random() * 2 + 0.1,
    providerId: "twilio",
    transcript: Math.random() > 0.7 ? "Transcripción de ejemplo..." : undefined,
    meta: { userAgent: "SIP/2.0" },
  }));
  
  const page = filters.page || 1;
  const size = filters.size || 25;
  const start = (page - 1) * size;
  const end = start + size;
  
  return {
    data: mockLogs.slice(start, end),
    total: mockLogs.length,
    page,
    size,
  };
};

/* LIVE STATUS */
export const getLiveStatus = async (): Promise<LiveStatus> => {
  await delay();
  
  return {
    agentsOnline: 12,
    agentsBusy: 3,
    activeQueues: 2,
    avgWaitTime: 45,
    callsInProgress: 8,
    timestamp: new Date().toISOString(),
  };
};

/* AUDIT TRAIL */
export const getAuditEvents = async (resourceId?: string): Promise<AuditEvent[]> => {
  await delay();
  
  return [
    {
      id: "audit-1",
      timestamp: new Date().toISOString(),
      userId: "user-001",
      action: "UPDATE",
      resource: "routing_rule",
      resourceId: resourceId || "rule-1",
      details: { field: "action", operation: "change_destination" },
      oldValues: { type: "AGENT", ref: "agent-002" },
      newValues: { type: "AGENT", ref: "agent-001" },
    },
  ];
};

/* IMPORT/EXPORT */
export const exportConfig = async (): Promise<any> => {
  await delay(1000);
  
  return {
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    providers: mockProviders,
    numbers: mockNumbers,
    rules: await getRoutingRules(),
    templates: await getSmsTemplates(),
    webhooks: await getWebhooks(),
    queues: [],
    schedules: [],
  };
};

export const importConfig = async (config: any): Promise<{ success: boolean; errors?: string[] }> => {
  await delay(2000);
  
  if (Math.random() > 0.1) {
    return { success: true };
  } else {
    return {
      success: false,
      errors: ["Versión no compatible", "Falta campo obligatorio: providerId"],
    };
  }
};