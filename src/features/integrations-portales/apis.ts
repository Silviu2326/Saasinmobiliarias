import type {
  PortalInfo,
  PortalConfig,
  Credentials,
  SyncJob,
  PortalStats,
  LogEntry,
  AuditEvent,
  ConnectionTest,
  ImportExportConfig,
  LogFilters
} from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

// Mock data for demonstration
const mockPortals: PortalInfo[] = [
  {
    id: "idealista",
    name: "Idealista",
    logo: "🏠",
    mode: "API",
    status: "CONNECTED",
    lastSyncAt: "2024-01-15T10:30:00Z",
    description: "Portal líder en España",
    apiVersion: "v3",
    supportedActions: ["create", "update", "delete"],
    websiteUrl: "https://www.idealista.com"
  },
  {
    id: "fotocasa",
    name: "Fotocasa",
    logo: "📸",
    mode: "API",
    status: "TOKEN_EXPIRED",
    lastSyncAt: "2024-01-14T15:45:00Z",
    description: "Portal con enfoque fotográfico",
    apiVersion: "v2",
    supportedActions: ["create", "update"],
    websiteUrl: "https://www.fotocasa.es"
  },
  {
    id: "habitaclia",
    name: "Habitaclia",
    logo: "🏘️",
    mode: "API",
    status: "CONNECTED",
    lastSyncAt: "2024-01-15T09:15:00Z",
    description: "Portal especializado en Cataluña",
    apiVersion: "v1",
    supportedActions: ["create", "update", "delete"],
    websiteUrl: "https://www.habitaclia.com"
  },
  {
    id: "pisos.com",
    name: "Pisos.com",
    logo: "🏢",
    mode: "FEED",
    status: "DISCONNECTED",
    description: "Portal tradicional",
    apiVersion: "v1",
    supportedActions: ["create"],
    websiteUrl: "https://www.pisos.com"
  }
];

const mockJobs: SyncJob[] = [
  {
    id: "job1",
    portalId: "idealista",
    action: "create",
    entity: "property",
    ref: "PROP001",
    status: "ok",
    durationMs: 1250,
    attempts: 1,
    message: "Propiedad creada exitosamente",
    at: "2024-01-15T10:30:00Z",
    startedAt: "2024-01-15T10:29:58Z",
    completedAt: "2024-01-15T10:30:00Z"
  },
  {
    id: "job2",
    portalId: "fotocasa",
    action: "update",
    entity: "property",
    ref: "PROP002",
    status: "error",
    durationMs: 5000,
    attempts: 3,
    message: "Token de acceso expirado",
    at: "2024-01-15T10:25:00Z"
  }
];

export const fetchPortals = async (): Promise<PortalInfo[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockPortals), 300);
  });
};

export const fetchPortalStatus = async (portalId: string): Promise<PortalInfo> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const portal = mockPortals.find(p => p.id === portalId);
      if (portal) {
        resolve(portal);
      } else {
        reject(new Error(`Portal ${portalId} not found`));
      }
    }, 200);
  });
};

export const connectPortal = async (portalId: string, credentials: Partial<Credentials>): Promise<{ success: boolean; message: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: `Conectado exitosamente a ${portalId}`
      });
    }, 1500);
  });
};

export const disconnectPortal = async (portalId: string): Promise<{ success: boolean; message: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: `Desconectado de ${portalId}`
      });
    }, 800);
  });
};

export const fetchPortalConfig = async (portalId: string): Promise<PortalConfig> => {
  const mockConfig: PortalConfig = {
    credentials: {
      mode: "apikey",
      alias: `${portalId}-prod`,
      officeScope: "global",
      updatedAt: "2024-01-10T12:00:00Z",
      apikey: {
        apiKey: "sk_test_123456789abcdef",
        accountId: "acc_123456",
        region: "eu-west-1"
      }
    },
    publishDefaults: {
      titleTpl: "{{propertyType}} de {{numRooms}} habitaciones en {{address}}",
      descTpl: "{{description}} Superficie: {{sqm}}m². Características: {{features}}.",
      pricePolicy: {
        currency: "EUR",
        marginPct: 0,
        rounding: 1000
      },
      photosPolicy: {
        min: 3,
        max: 20,
        watermark: false,
        quality: 85
      },
      visibility: "public",
      autoRenew: true,
      contactPhone: "+34 900 123 456"
    },
    mappings: [
      { from: "type", to: "propertyType", required: true },
      { from: "rooms", to: "numRooms", required: false },
      { from: "location", to: "address", required: true },
      { from: "cost", to: "price", required: true, transform: "stringify" }
    ],
    advanced: {
      syncFrequencyMin: 15,
      throttleReqPerMin: 60,
      deletePolicy: "pause",
      duplicatePolicy: "skip",
      errorRetryCount: 3,
      backoffMultiplier: 2
    },
    updatedAt: "2024-01-10T12:00:00Z",
    updatedBy: "admin@inmofow.com"
  };

  return new Promise((resolve) => {
    setTimeout(() => resolve(mockConfig), 400);
  });
};

export const savePortalConfig = async (portalId: string, config: Partial<PortalConfig>): Promise<{ success: boolean; message: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: "Configuración guardada exitosamente"
      });
    }, 600);
  });
};

export const testConnection = async (portalId: string): Promise<ConnectionTest> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% success rate
      resolve({
        portalId,
        success,
        latencyMs: success ? Math.floor(Math.random() * 1000) + 200 : undefined,
        message: success ? "Conexión exitosa" : "Error de autenticación",
        testedAt: new Date().toISOString(),
        details: success ? {
          authValid: true,
          endpointReachable: true,
          apiVersion: "v3",
          rateLimitRemaining: 450
        } : {
          authValid: false,
          endpointReachable: true
        }
      });
    }, 2000);
  });
};

export const fetchSyncStatus = async (portalId: string): Promise<SyncJob[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const portalJobs = mockJobs.filter(job => job.portalId === portalId);
      resolve(portalJobs);
    }, 250);
  });
};

export const retryFailedJobs = async (portalId: string): Promise<{ success: boolean; retriedCount: number }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const failedJobs = mockJobs.filter(job => job.portalId === portalId && job.status === "error");
      resolve({
        success: true,
        retriedCount: failedJobs.length
      });
    }, 1000);
  });
};

export const fetchPortalStats = async (portalId: string, from?: string, to?: string): Promise<PortalStats> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockStats: PortalStats = {
        from: from || "2024-01-01",
        to: to || "2024-01-15",
        activeListings: Math.floor(Math.random() * 500) + 100,
        leads: Math.floor(Math.random() * 200) + 50,
        errors24h: Math.floor(Math.random() * 5),
        cost: Math.random() * 1000 + 200,
        cpl: Math.random() * 50 + 10,
        cpa: Math.random() * 200 + 50,
        duplicatesPct: Math.random() * 10,
        avgResponseTime: Math.floor(Math.random() * 1000) + 300,
        totalRequests: Math.floor(Math.random() * 10000) + 1000,
        successRate: 90 + Math.random() * 10
      };
      resolve(mockStats);
    }, 350);
  });
};

export const fetchLogs = async (filters: LogFilters): Promise<{ logs: LogEntry[]; total: number; page: number; totalPages: number }> => {
  const mockLogs: LogEntry[] = [
    {
      id: "log1",
      timestamp: "2024-01-15T10:30:00Z",
      portalId: "idealista",
      portalName: "Idealista",
      action: "create",
      entity: "property",
      entityId: "PROP001",
      result: "ok",
      message: "Propiedad publicada",
      duration: 1250,
      user: "admin@inmoflow.com"
    },
    {
      id: "log2",
      timestamp: "2024-01-15T10:25:00Z",
      portalId: "fotocasa",
      portalName: "Fotocasa",
      action: "update",
      entity: "property",
      entityId: "PROP002",
      result: "error",
      message: "Token expirado",
      duration: 5000,
      user: "system"
    }
  ];

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        logs: mockLogs,
        total: mockLogs.length,
        page: filters.page || 1,
        totalPages: Math.ceil(mockLogs.length / (filters.size || 20))
      });
    }, 300);
  });
};

export const fetchAuditTrail = async (portalId?: string): Promise<AuditEvent[]> => {
  const mockAudit: AuditEvent[] = [
    {
      id: "audit1",
      timestamp: "2024-01-15T09:00:00Z",
      portalId: "idealista",
      portalName: "Idealista",
      eventType: "credential_update",
      user: "admin@inmoflow.com",
      description: "Actualizada API key",
      oldValue: { apiKey: "sk_old_***" },
      newValue: { apiKey: "sk_new_***" },
      ipAddress: "192.168.1.100"
    },
    {
      id: "audit2",
      timestamp: "2024-01-14T16:30:00Z",
      portalId: "fotocasa",
      portalName: "Fotocasa",
      eventType: "mapping_change",
      user: "marketing@inmoflow.com",
      description: "Modificado mapeo de campos",
      oldValue: { mappings: 4 },
      newValue: { mappings: 5 }
    }
  ];

  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = portalId 
        ? mockAudit.filter(event => event.portalId === portalId)
        : mockAudit;
      resolve(filtered);
    }, 400);
  });
};

export const exportConfigs = async (): Promise<ImportExportConfig> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const config: ImportExportConfig = {
        portals: {
          idealista: {
            config: {
              publishDefaults: {
                titleTpl: "{{propertyType}} en {{address}}",
                descTpl: "{{description}}",
                pricePolicy: { currency: "EUR", rounding: 1000 },
                photosPolicy: { min: 3, max: 15 },
                visibility: "public"
              },
              mappings: [
                { from: "type", to: "propertyType", required: true },
                { from: "location", to: "address", required: true }
              ],
              advanced: {
                syncFrequencyMin: 15,
                throttleReqPerMin: 60,
                deletePolicy: "pause",
                duplicatePolicy: "skip",
                errorRetryCount: 3,
                backoffMultiplier: 2
              },
              updatedAt: "2024-01-10T12:00:00Z",
              updatedBy: "admin@inmoflow.com"
            },
            credentials: {
              mode: "apikey",
              alias: "idealista-prod",
              officeScope: "global"
            }
          }
        },
        exportedAt: new Date().toISOString(),
        exportedBy: "admin@inmoflow.com",
        version: "1.0.0"
      };
      resolve(config);
    }, 1000);
  });
};

export const importConfigs = async (config: ImportExportConfig): Promise<{ success: boolean; imported: number; errors: string[] }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const portals = Object.keys(config.portals);
      resolve({
        success: true,
        imported: portals.length,
        errors: []
      });
    }, 1500);
  });
};