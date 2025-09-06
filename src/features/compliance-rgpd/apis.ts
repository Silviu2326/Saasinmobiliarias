import type {
  DsrRequest,
  Consent,
  ActivityRecord,
  PrivacyNotice,
  CookieItem,
  CookieCategory,
  RetentionRule,
  Breach,
  DataMapEntry,
  ComplianceMetrics,
  RgpdExport
} from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// DSR APIs
export const dsrApi = {
  async getStatus(ref: string): Promise<DsrRequest> {
    await delay(500);
    return {
      id: ref,
      subject: "John Doe",
      email: "john@example.com",
      type: "access",
      status: "in_progress",
      description: "Solicitud de acceso a datos personales",
      createdAt: new Date().toISOString(),
      dueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  },

  async createRequest(data: Partial<DsrRequest>): Promise<DsrRequest> {
    await delay(500);
    return {
      id: `DSR-${Date.now()}`,
      subject: data.subject || "",
      email: data.email,
      type: data.type || "access",
      status: "open",
      description: data.description,
      createdAt: new Date().toISOString(),
      dueAt: data.dueAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  },

  async exportData(ref: string): Promise<Blob> {
    await delay(1000);
    const data = { subject: "John Doe", data: "Personal data export" };
    return new Blob([JSON.stringify(data)], { type: "application/json" });
  },

  async deleteData(ref: string): Promise<{ success: boolean; message: string }> {
    await delay(1000);
    return { success: true, message: "Datos eliminados correctamente" };
  },

  async list(): Promise<DsrRequest[]> {
    await delay(500);
    return [
      {
        id: "DSR-001",
        subject: "Jane Smith",
        type: "erasure",
        status: "open",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        dueAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "DSR-002",
        subject: "Bob Johnson",
        type: "access",
        status: "done",
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        dueAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
  },
};

// Consentimientos APIs
export const consentsApi = {
  async getBySubject(subject: string): Promise<Consent[]> {
    await delay(500);
    return [
      {
        id: "CONS-001",
        subject,
        purpose: "Marketing por email",
        granted: true,
        at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        by: "Web form",
        origin: "Landing page",
      },
      {
        id: "CONS-002",
        subject,
        purpose: "WhatsApp comercial",
        granted: false,
        at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        by: "Call center",
        revokedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        revokedReason: "No desea recibir comunicaciones",
      },
    ];
  },

  async create(data: Partial<Consent>): Promise<Consent> {
    await delay(500);
    return {
      id: `CONS-${Date.now()}`,
      subject: data.subject || "",
      purpose: data.purpose || "",
      granted: data.granted || false,
      evidence: data.evidence,
      at: new Date().toISOString(),
      by: data.by || "System",
      origin: data.origin,
      ip: data.ip,
    };
  },

  async revoke(id: string, reason?: string): Promise<Consent> {
    await delay(500);
    return {
      id,
      subject: "John Doe",
      purpose: "Marketing",
      granted: false,
      at: new Date().toISOString(),
      by: "User request",
      revokedAt: new Date().toISOString(),
      revokedReason: reason,
    };
  },
};

// RoPA APIs
export const ropaApi = {
  async list(): Promise<ActivityRecord[]> {
    await delay(500);
    return [
      {
        id: "ROPA-001",
        name: "Gestión de clientes",
        purpose: "Gestión de relación comercial",
        legalBase: "Ejecución de contrato",
        dataCategories: ["Identificación", "Contacto", "Económicos"],
        dataSubjects: ["Clientes", "Potenciales clientes"],
        recipients: ["Equipo comercial", "Administración"],
        retention: "5 años desde fin de relación",
        version: "1.0",
        updatedAt: new Date().toISOString(),
        updatedBy: "Admin",
      },
    ];
  },

  async create(data: Partial<ActivityRecord>): Promise<ActivityRecord> {
    await delay(500);
    return {
      id: `ROPA-${Date.now()}`,
      name: data.name || "",
      purpose: data.purpose || "",
      legalBase: data.legalBase || "",
      dataCategories: data.dataCategories || [],
      dataSubjects: data.dataSubjects || [],
      recipients: data.recipients || [],
      retention: data.retention || "",
      safeguards: data.safeguards,
      intlTransfers: data.intlTransfers,
      transferDetails: data.transferDetails,
      version: "1.0",
      updatedAt: new Date().toISOString(),
      updatedBy: "Current User",
    };
  },

  async update(id: string, data: Partial<ActivityRecord>): Promise<ActivityRecord> {
    await delay(500);
    return {
      ...data,
      id,
      name: data.name || "",
      purpose: data.purpose || "",
      legalBase: data.legalBase || "",
      dataCategories: data.dataCategories || [],
      dataSubjects: data.dataSubjects || [],
      recipients: data.recipients || [],
      retention: data.retention || "",
      version: "1.1",
      updatedAt: new Date().toISOString(),
      updatedBy: "Current User",
    };
  },

  async delete(id: string): Promise<{ success: boolean }> {
    await delay(500);
    return { success: true };
  },

  async export(): Promise<Blob> {
    await delay(1000);
    const data = await this.list();
    return new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  },
};

// Avisos de privacidad APIs
export const noticesApi = {
  async list(): Promise<PrivacyNotice[]> {
    await delay(500);
    return [
      {
        id: "NOTICE-001",
        title: "Política de Privacidad Web",
        content: "Contenido de la política...",
        version: "2.0",
        status: "published",
        type: "website",
        updatedAt: new Date().toISOString(),
        updatedBy: "Legal Team",
        publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
  },

  async create(data: Partial<PrivacyNotice>): Promise<PrivacyNotice> {
    await delay(500);
    return {
      id: `NOTICE-${Date.now()}`,
      title: data.title || "",
      content: data.content || "",
      version: "1.0",
      status: "draft",
      type: data.type || "website",
      updatedAt: new Date().toISOString(),
      updatedBy: "Current User",
    };
  },

  async update(id: string, data: Partial<PrivacyNotice>): Promise<PrivacyNotice> {
    await delay(500);
    return {
      ...data,
      id,
      title: data.title || "",
      content: data.content || "",
      version: data.version || "1.0",
      status: data.status || "draft",
      type: data.type || "website",
      updatedAt: new Date().toISOString(),
      updatedBy: "Current User",
    };
  },

  async preview(id: string): Promise<string> {
    await delay(500);
    return `<html><body><h1>Preview de Política</h1><p>Contenido...</p></body></html>`;
  },
};

// Cookies APIs
export const cookiesApi = {
  async getCategories(): Promise<CookieCategory[]> {
    await delay(500);
    return [
      {
        id: "necessary",
        name: "Necesarias",
        description: "Cookies esenciales para el funcionamiento",
        required: true,
        cookies: [],
      },
      {
        id: "analytics",
        name: "Analíticas",
        description: "Cookies para análisis de uso",
        required: false,
        cookies: [],
      },
    ];
  },

  async createCategory(data: Partial<CookieCategory>): Promise<CookieCategory> {
    await delay(500);
    return {
      id: `CAT-${Date.now()}`,
      name: data.name || "",
      description: data.description || "",
      required: data.required || false,
      cookies: [],
    };
  },

  async listCookies(): Promise<CookieItem[]> {
    await delay(500);
    return [
      {
        id: "COOKIE-001",
        name: "_ga",
        provider: "Google Analytics",
        purpose: "Análisis de tráfico",
        duration: "2 años",
        category: "analytics",
        domain: ".example.com",
        secure: true,
      },
    ];
  },

  async createCookie(data: Partial<CookieItem>): Promise<CookieItem> {
    await delay(500);
    return {
      id: `COOKIE-${Date.now()}`,
      name: data.name || "",
      provider: data.provider || "",
      purpose: data.purpose || "",
      duration: data.duration || "",
      category: data.category || "other",
      domain: data.domain,
      httpOnly: data.httpOnly,
      secure: data.secure,
    };
  },
};

// Políticas de retención APIs
export const retentionApi = {
  async getPolicies(): Promise<RetentionRule[]> {
    await delay(500);
    return [
      {
        id: "RET-001",
        entity: "Lead inactivo",
        action: "delete",
        afterDays: 365,
        enabled: true,
        description: "Eliminar leads sin actividad después de 1 año",
        legalBasis: "Art. 5.1.e RGPD - Limitación del plazo de conservación",
      },
    ];
  },

  async createPolicy(data: Partial<RetentionRule>): Promise<RetentionRule> {
    await delay(500);
    return {
      id: `RET-${Date.now()}`,
      entity: data.entity || "",
      action: data.action || "delete",
      afterDays: data.afterDays || 365,
      enabled: data.enabled !== false,
      description: data.description,
      legalBasis: data.legalBasis,
    };
  },

  async preview(policyId: string): Promise<{ affected: number; entities: string[] }> {
    await delay(1000);
    return {
      affected: Math.floor(Math.random() * 100) + 10,
      entities: ["Lead-001", "Lead-002", "Lead-003"],
    };
  },
};

// Brechas APIs
export const breachesApi = {
  async list(): Promise<Breach[]> {
    await delay(500);
    return [
      {
        id: "BREACH-001",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        discoveryDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        systems: ["CRM", "Email"],
        dataCategories: ["Contacto", "Identificación"],
        affected: 150,
        risk: "medium",
        description: "Acceso no autorizado a base de datos de contactos",
        status: "investigating",
      },
    ];
  },

  async create(data: Partial<Breach>): Promise<Breach> {
    await delay(500);
    return {
      id: `BREACH-${Date.now()}`,
      date: data.date || new Date().toISOString(),
      discoveryDate: data.discoveryDate || new Date().toISOString(),
      systems: data.systems || [],
      dataCategories: data.dataCategories || [],
      affected: data.affected || 0,
      risk: data.risk || "low",
      description: data.description || "",
      measures: data.measures,
      status: "open",
    };
  },

  async update(id: string, data: Partial<Breach>): Promise<Breach> {
    await delay(500);
    return {
      ...data,
      id,
      date: data.date || new Date().toISOString(),
      discoveryDate: data.discoveryDate || new Date().toISOString(),
      systems: data.systems || [],
      dataCategories: data.dataCategories || [],
      affected: data.affected || 0,
      risk: data.risk || "low",
      description: data.description || "",
      status: data.status || "open",
    };
  },
};

// Mapa de datos APIs
export const dataMapApi = {
  async list(): Promise<DataMapEntry[]> {
    await delay(500);
    return [
      {
        id: "MAP-001",
        system: "CRM Principal",
        description: "Sistema de gestión de relaciones con clientes",
        dataCategories: ["Identificación", "Contacto", "Transacciones"],
        purposes: ["Gestión comercial", "Marketing"],
        processors: ["Salesforce", "Mailchimp"],
        processorContracts: true,
        intlTransfers: true,
        transferMechanism: "Cláusulas contractuales tipo",
        accessControls: ["MFA", "RBAC"],
        dataOwner: "Director Comercial",
        technicalContact: "IT Manager",
      },
    ];
  },

  async create(data: Partial<DataMapEntry>): Promise<DataMapEntry> {
    await delay(500);
    return {
      id: `MAP-${Date.now()}`,
      system: data.system || "",
      description: data.description,
      dataCategories: data.dataCategories || [],
      purposes: data.purposes || [],
      processors: data.processors,
      processorContracts: data.processorContracts,
      intlTransfers: data.intlTransfers,
      transferMechanism: data.transferMechanism,
      accessControls: data.accessControls,
      dataOwner: data.dataOwner,
      technicalContact: data.technicalContact,
    };
  },
};

// Overview API
export const overviewApi = {
  async getMetrics(): Promise<ComplianceMetrics> {
    await delay(500);
    const pendingDsr = 3;
    const overdueDsr = 1;
    const activeBreaches = 1;
    const highRiskBreaches = 0;
    const missingPolicies = ["Cookie Policy"];

    let score = 100;
    score -= overdueDsr * 20;
    score -= activeBreaches * 10;
    score -= highRiskBreaches * 25;
    score -= missingPolicies.length * 5;
    score = Math.max(0, score);

    const level = score >= 80 ? "high" : score >= 50 ? "medium" : "low";

    return {
      score,
      level,
      pendingDsr,
      overdueDsr,
      activeBreaches,
      highRiskBreaches,
      missingPolicies,
      lastAudit: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      nextAudit: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      issues: [
        ...(overdueDsr > 0
          ? [{
              type: "dsr",
              severity: "critical" as const,
              message: `${overdueDsr} solicitud(es) DSR vencida(s)`,
              action: "Revisar inmediatamente",
            }]
          : []),
        ...(activeBreaches > 0
          ? [{
              type: "breach",
              severity: "warning" as const,
              message: `${activeBreaches} brecha(s) activa(s)`,
              action: "Continuar investigación",
            }]
          : []),
      ],
    };
  },
};

// Export completo
export const rgpdExportApi = {
  async generatePack(): Promise<RgpdExport> {
    await delay(2000);
    const [dsr, consents, ropa, policies, breaches, dataMap] = await Promise.all([
      dsrApi.list(),
      consentsApi.getBySubject("*"),
      ropaApi.list(),
      noticesApi.list(),
      breachesApi.list(),
      dataMapApi.list(),
    ]);

    return {
      exportDate: new Date().toISOString(),
      dsr,
      consents,
      ropa,
      policies,
      breaches,
      dataMap,
    };
  },
};