import { 
  ProviderInfo, 
  ProviderConnection,
  Template, 
  Flow, 
  Envelope, 
  WebhookConfig, 
  LogItem,
  EvidenceReport,
  BrandingConfig,
  CreditsUsage,
  AuditTrailEntry
} from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

// Simulated API responses
const simulateApiResponse = <T>(data: T, delay = 300): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

// Providers and connection
export async function fetchProviders(): Promise<ProviderInfo[]> {
  const mockProviders: ProviderInfo[] = [
    {
      id: 'signaturit',
      name: 'Signaturit',
      logo: '/logos/signaturit.svg',
      supports: { ses: true, aes: true, qes: true },
      status: 'CONNECTED',
      credits: 245,
      lastUsedAt: '2024-01-15T10:30:00Z',
      connectionType: 'oauth',
      description: 'Plataforma europea de firma electrónica conforme a eIDAS'
    },
    {
      id: 'docusign',
      name: 'DocuSign',
      logo: '/logos/docusign.svg',
      supports: { ses: true, aes: false, qes: false },
      status: 'TOKEN_EXPIRED',
      credits: 89,
      lastUsedAt: '2024-01-12T14:20:00Z',
      connectionType: 'oauth',
      description: 'Líder mundial en firma electrónica'
    },
    {
      id: 'adobe-sign',
      name: 'Adobe Sign',
      logo: '/logos/adobe.svg',
      supports: { ses: true, aes: true, qes: false },
      status: 'DISCONNECTED',
      credits: 0,
      connectionType: 'apikey',
      description: 'Solución de firma electrónica de Adobe'
    },
    {
      id: 'uanataca',
      name: 'Uanataca',
      logo: '/logos/uanataca.svg',
      supports: { ses: true, aes: true, qes: true },
      status: 'CONNECTED',
      credits: 156,
      lastUsedAt: '2024-01-14T09:15:00Z',
      connectionType: 'credentials',
      description: 'Proveedor español de certificados digitales'
    }
  ];

  return simulateApiResponse(mockProviders);
}

export async function connectProvider(providerId: string, credentials: any): Promise<ProviderConnection> {
  const mockConnection: ProviderConnection = {
    id: `conn-${providerId}-${Date.now()}`,
    type: credentials.type,
    credentials: {
      ...credentials,
      clientSecret: credentials.clientSecret ? '***' : undefined,
      apiKey: credentials.apiKey ? '***' : undefined,
      password: credentials.password ? '***' : undefined
    },
    isActive: true,
    lastTestAt: new Date().toISOString()
  };

  return simulateApiResponse(mockConnection, 1000);
}

export async function testProviderConnection(providerId: string): Promise<{ success: boolean; latency?: number; error?: string }> {
  const latency = Math.floor(Math.random() * 500) + 100;
  const success = Math.random() > 0.1; // 90% success rate

  if (success) {
    return simulateApiResponse({ success: true, latency }, latency);
  } else {
    return simulateApiResponse({ success: false, error: 'Connection timeout' }, latency);
  }
}

export async function fetchProviderConfig(providerId: string): Promise<any> {
  const mockConfig = {
    providerId,
    credentials: { clientId: 'client_123', region: 'eu' },
    branding: {
      primaryColor: '#2563eb',
      secondaryColor: '#f3f4f6',
      senderName: 'Tu Inmobiliaria',
      logo: '/logo.png'
    },
    defaults: {
      reminderDays: 3,
      expirationDays: 30,
      language: 'es'
    }
  };

  return simulateApiResponse(mockConfig);
}

export async function updateProviderConfig(providerId: string, config: any): Promise<void> {
  return simulateApiResponse(undefined, 500);
}

export async function fetchProviderCredits(providerId: string): Promise<CreditsUsage> {
  const mockCredits: CreditsUsage = {
    providerId,
    providerName: 'Signaturit',
    currentCredits: 245,
    usedThisMonth: 67,
    monthlyLimit: 500,
    costPerSignature: 0.75,
    lastRefillAt: '2024-01-01T00:00:00Z',
    nextRefillAt: '2024-02-01T00:00:00Z',
    alertThreshold: 50
  };

  return simulateApiResponse(mockCredits);
}

// Templates
export async function fetchTemplates(filters: { type?: string; office?: string; lang?: string } = {}): Promise<Template[]> {
  const mockTemplates: Template[] = [
    {
      id: 'tpl-1',
      name: 'Mandato de Gestión Comercial',
      type: 'MANDATO',
      lang: 'es',
      officeId: 'office-1',
      variables: ['cliente.nombre', 'cliente.dni', 'propiedad.direccion', 'propiedad.ref'],
      content: 'Contenido del mandato...',
      signatureFields: [
        { id: 'sig-1', type: 'signature', x: 100, y: 600, width: 200, height: 80, page: 1, required: true, signerId: 'client' }
      ],
      createdAt: '2024-01-10T10:00:00Z',
      updatedAt: '2024-01-10T10:00:00Z',
      createdBy: 'user-1'
    },
    {
      id: 'tpl-2',
      name: 'Contrato de Arrendamiento',
      type: 'CONTRATO',
      lang: 'es',
      variables: ['inquilino.nombre', 'propietario.nombre', 'propiedad.direccion', 'renta.importe'],
      content: 'Contenido del contrato...',
      signatureFields: [
        { id: 'sig-2', type: 'signature', x: 100, y: 550, width: 200, height: 80, page: 2, required: true, signerId: 'tenant' },
        { id: 'sig-3', type: 'signature', x: 350, y: 550, width: 200, height: 80, page: 2, required: true, signerId: 'landlord' }
      ],
      createdAt: '2024-01-08T15:30:00Z',
      updatedAt: '2024-01-12T09:15:00Z',
      createdBy: 'user-2'
    }
  ];

  return simulateApiResponse(mockTemplates);
}

export async function createTemplate(template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Promise<Template> {
  const newTemplate: Template = {
    ...template,
    id: `tpl-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return simulateApiResponse(newTemplate, 800);
}

export async function updateTemplate(id: string, template: Partial<Template>): Promise<Template> {
  const updatedTemplate: Template = {
    id,
    name: template.name || 'Template Updated',
    type: template.type || 'CONTRATO',
    lang: template.lang || 'es',
    variables: template.variables || [],
    content: template.content || '',
    signatureFields: template.signatureFields || [],
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: new Date().toISOString(),
    createdBy: 'user-1'
  };

  return simulateApiResponse(updatedTemplate, 600);
}

export async function deleteTemplate(id: string): Promise<void> {
  return simulateApiResponse(undefined, 400);
}

// Flows
export async function fetchFlows(): Promise<Flow[]> {
  const mockFlows: Flow[] = [
    {
      id: 'flow-1',
      name: 'Flujo Mandato Simple',
      description: 'Firma simple del propietario para mandato de gestión',
      defaultProviderId: 'signaturit',
      reminders: { everyDays: 3, max: 3 },
      expiresInDays: 15,
      sequence: 'SECUENCIAL',
      signers: [
        { name: '{{propietario.nombre}}', email: '{{propietario.email}}', role: 'PROPIETARIO', auth: 'EMAIL', order: 1 }
      ],
      createdAt: '2024-01-05T12:00:00Z',
      updatedAt: '2024-01-05T12:00:00Z'
    },
    {
      id: 'flow-2',
      name: 'Flujo Contrato Arrendamiento',
      description: 'Firma secuencial: inquilino primero, después propietario',
      defaultProviderId: 'signaturit',
      reminders: { everyDays: 2, max: 5 },
      expiresInDays: 30,
      sequence: 'SECUENCIAL',
      signers: [
        { name: '{{inquilino.nombre}}', email: '{{inquilino.email}}', role: 'CLIENTE', auth: 'OTP_SMS', order: 1 },
        { name: '{{propietario.nombre}}', email: '{{propietario.email}}', role: 'PROPIETARIO', auth: 'EMAIL', order: 2 }
      ],
      requiredAttachments: ['dni', 'nomina'],
      createdAt: '2024-01-03T14:30:00Z',
      updatedAt: '2024-01-10T11:20:00Z'
    }
  ];

  return simulateApiResponse(mockFlows);
}

export async function createFlow(flow: Omit<Flow, 'id' | 'createdAt' | 'updatedAt'>): Promise<Flow> {
  const newFlow: Flow = {
    ...flow,
    id: `flow-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return simulateApiResponse(newFlow, 600);
}

// Envelopes
export async function fetchEnvelopes(filters: {
  status?: string;
  providerId?: string;
  templateId?: string;
  office?: string;
  from?: string;
  to?: string;
  q?: string;
} = {}): Promise<Envelope[]> {
  const mockEnvelopes: Envelope[] = [
    {
      id: 'env-1',
      templateId: 'tpl-1',
      providerId: 'signaturit',
      status: 'signed',
      subject: 'Mandato de gestión - Piso Calle Mayor 15',
      message: 'Por favor, firme este mandato de gestión comercial',
      createdAt: '2024-01-15T09:00:00Z',
      sentAt: '2024-01-15T09:05:00Z',
      completedAt: '2024-01-15T14:30:00Z',
      expiresAt: '2024-01-30T23:59:59Z',
      signers: [
        {
          id: 'signer-1',
          name: 'Juan García',
          email: 'juan.garcia@email.com',
          role: 'PROPIETARIO',
          auth: 'EMAIL',
          order: 1,
          status: 'signed',
          signedAt: '2024-01-15T14:30:00Z',
          viewedAt: '2024-01-15T14:25:00Z'
        }
      ],
      hash: 'sha256:abc123def456...',
      tsaTimestamp: '2024-01-15T14:30:15Z',
      documentUrl: '/documents/env-1-signed.pdf',
      evidenceUrl: '/evidence/env-1-evidence.pdf'
    },
    {
      id: 'env-2',
      templateId: 'tpl-2',
      providerId: 'signaturit',
      status: 'sent',
      subject: 'Contrato de arrendamiento - Apartamento Zona Centro',
      createdAt: '2024-01-16T11:30:00Z',
      sentAt: '2024-01-16T11:35:00Z',
      expiresAt: '2024-02-15T23:59:59Z',
      signers: [
        {
          id: 'signer-2',
          name: 'María López',
          email: 'maria.lopez@email.com',
          role: 'CLIENTE',
          auth: 'OTP_SMS',
          order: 1,
          status: 'viewed',
          viewedAt: '2024-01-16T15:20:00Z'
        },
        {
          id: 'signer-3',
          name: 'Pedro Martín',
          email: 'pedro.martin@email.com',
          role: 'PROPIETARIO',
          auth: 'EMAIL',
          order: 2,
          status: 'pending'
        }
      ]
    }
  ];

  return simulateApiResponse(mockEnvelopes);
}

export async function createEnvelope(envelope: {
  templateId: string;
  providerId: string;
  subject: string;
  message?: string;
  signers: Array<{ name: string; email: string; role: string; auth: string }>;
  expiresInDays?: number;
}): Promise<Envelope> {
  const newEnvelope: Envelope = {
    id: `env-${Date.now()}`,
    ...envelope,
    status: 'draft',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + (envelope.expiresInDays || 30) * 24 * 60 * 60 * 1000).toISOString(),
    signers: envelope.signers.map((s, i) => ({ ...s, order: i + 1, status: 'pending' as any }))
  };

  return simulateApiResponse(newEnvelope, 1000);
}

export async function sendEnvelope(envelopeId: string): Promise<void> {
  return simulateApiResponse(undefined, 800);
}

export async function remindEnvelope(envelopeId: string): Promise<void> {
  return simulateApiResponse(undefined, 400);
}

export async function cancelEnvelope(envelopeId: string): Promise<void> {
  return simulateApiResponse(undefined, 400);
}

export async function downloadEnvelopeDocument(envelopeId: string): Promise<Blob> {
  // Simulate PDF download
  return simulateApiResponse(new Blob(['PDF content'], { type: 'application/pdf' }));
}

export async function fetchEvidenceReport(envelopeId: string): Promise<EvidenceReport> {
  const mockEvidence: EvidenceReport = {
    envelopeId,
    documentHash: 'sha256:abc123def456789...',
    tsaTimestamp: '2024-01-15T14:30:15Z',
    signers: [
      {
        id: 'signer-1',
        name: 'Juan García',
        email: 'juan.garcia@email.com',
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        geolocation: {
          latitude: 40.4168,
          longitude: -3.7038,
          city: 'Madrid',
          country: 'Spain'
        },
        authMethod: 'EMAIL',
        signedAt: '2024-01-15T14:30:00Z',
        certificateInfo: {
          issuer: 'AC Signaturit',
          serialNumber: 'SN123456789',
          validFrom: '2024-01-01T00:00:00Z',
          validTo: '2025-01-01T00:00:00Z',
          eidasLevel: 'AES'
        }
      }
    ],
    auditTrail: [
      {
        timestamp: '2024-01-15T09:00:00Z',
        action: 'Document created',
        actor: 'system',
        details: 'Envelope created from template tpl-1'
      },
      {
        timestamp: '2024-01-15T09:05:00Z',
        action: 'Document sent',
        actor: 'user@company.com',
        details: 'Sent to juan.garcia@email.com'
      },
      {
        timestamp: '2024-01-15T14:25:00Z',
        action: 'Document viewed',
        actor: 'juan.garcia@email.com',
        details: 'Opened document for review'
      },
      {
        timestamp: '2024-01-15T14:30:00Z',
        action: 'Document signed',
        actor: 'juan.garcia@email.com',
        details: 'Signed with AES certificate'
      }
    ]
  };

  return simulateApiResponse(mockEvidence);
}

// Webhooks
export async function fetchWebhooks(): Promise<WebhookConfig[]> {
  const mockWebhooks: WebhookConfig[] = [
    {
      id: 'wh-1',
      url: 'https://myapp.com/webhooks/signature',
      secret: 'wh_secret_123',
      events: ['envelope.sent', 'envelope.viewed', 'envelope.signed', 'envelope.declined'],
      enabled: true,
      lastTriggeredAt: '2024-01-15T14:30:00Z',
      failureCount: 0
    }
  ];

  return simulateApiResponse(mockWebhooks);
}

export async function createWebhook(webhook: Omit<WebhookConfig, 'id'>): Promise<WebhookConfig> {
  const newWebhook: WebhookConfig = {
    ...webhook,
    id: `wh-${Date.now()}`
  };

  return simulateApiResponse(newWebhook);
}

export async function testWebhook(webhookId: string): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  const success = Math.random() > 0.2; // 80% success rate
  
  if (success) {
    return simulateApiResponse({ success: true, statusCode: 200 });
  } else {
    return simulateApiResponse({ success: false, statusCode: 404, error: 'Webhook endpoint not found' });
  }
}

// Logs
export async function fetchLogs(filters: {
  providerId?: string;
  action?: string;
  result?: string;
  from?: string;
  to?: string;
  q?: string;
  page?: number;
  size?: number;
} = {}): Promise<{ items: LogItem[]; total: number }> {
  const mockLogs: LogItem[] = [
    {
      id: 'log-1',
      timestamp: '2024-01-15T14:30:00Z',
      providerId: 'signaturit',
      action: 'envelope.signed',
      result: 'ok',
      message: 'Envelope env-1 successfully signed',
      userId: 'user-1',
      envelopeId: 'env-1'
    },
    {
      id: 'log-2',
      timestamp: '2024-01-15T09:05:00Z',
      providerId: 'signaturit',
      action: 'envelope.sent',
      result: 'ok',
      message: 'Envelope env-1 sent to juan.garcia@email.com',
      userId: 'user-1',
      envelopeId: 'env-1'
    },
    {
      id: 'log-3',
      timestamp: '2024-01-14T16:22:00Z',
      providerId: 'docusign',
      action: 'connection.test',
      result: 'error',
      message: 'Token expired - please reconnect',
      userId: 'user-2'
    }
  ];

  return simulateApiResponse({
    items: mockLogs,
    total: mockLogs.length
  });
}

// Audit Trail
export async function fetchAuditTrail(filters: {
  resourceType?: string;
  resourceId?: string;
  userId?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
} = {}): Promise<{ items: AuditTrailEntry[]; total: number }> {
  const mockAuditTrail: AuditTrailEntry[] = [
    {
      id: 'audit-1',
      timestamp: '2024-01-15T14:30:00Z',
      userId: 'user-1',
      userEmail: 'admin@company.com',
      action: 'envelope.signed',
      resourceType: 'envelope',
      resourceId: 'env-1',
      details: 'Envelope signed by Juan García',
      ipAddress: '192.168.1.50',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    },
    {
      id: 'audit-2',
      timestamp: '2024-01-15T09:00:00Z',
      userId: 'user-1',
      userEmail: 'admin@company.com',
      action: 'envelope.created',
      resourceType: 'envelope',
      resourceId: 'env-1',
      details: 'Envelope created from template Mandato de gestión',
      changes: {
        after: { templateId: 'tpl-1', subject: 'Mandato de gestión - Piso Calle Mayor 15' }
      },
      ipAddress: '192.168.1.50',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
  ];

  return simulateApiResponse({
    items: mockAuditTrail,
    total: mockAuditTrail.length
  });
}

// Import/Export
export async function exportTemplates(templateIds: string[]): Promise<Blob> {
  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    templates: templateIds.map(id => ({ id, name: `Template ${id}` }))
  };

  return simulateApiResponse(
    new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  );
}

export async function importTemplates(file: File): Promise<{ success: boolean; imported: number; errors?: string[] }> {
  return simulateApiResponse({
    success: true,
    imported: 3,
    errors: []
  }, 1500);
}