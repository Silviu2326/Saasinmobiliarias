import type {
  DsrRequest,
  Consent,
  AuditEvent,
  ChecklistItem,
  KycCheck,
  LegalDocument,
  DpiaReport,
  ComplianceOverview,
  EidasProvider,
} from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const complianceApi = {
  dsr: {
    async getStatus(ref: string): Promise<DsrRequest> {
      await delay(500);
      return {
        id: ref,
        subject: 'user@example.com',
        type: 'access',
        status: 'in_progress',
        createdAt: new Date().toISOString(),
        dueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
    },

    async createRequest(data: Partial<DsrRequest>): Promise<DsrRequest> {
      await delay(600);
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      
      return {
        id: `DSR-${Date.now()}`,
        subject: data.subject || '',
        type: data.type || 'access',
        status: 'open',
        createdAt: new Date().toISOString(),
        dueAt: dueDate.toISOString(),
        ...data,
      };
    },

    async exportData(ref: string): Promise<{ url: string; data: any }> {
      await delay(800);
      return {
        url: `/exports/${ref}.json`,
        data: {
          subject: ref,
          exportedAt: new Date().toISOString(),
          personalData: {
            profile: { name: 'John Doe', email: 'user@example.com' },
            properties: [],
            inquiries: [],
            documents: [],
          },
        },
      };
    },

    async deleteData(ref: string): Promise<{ success: boolean; audit: string }> {
      await delay(1000);
      return {
        success: true,
        audit: `AUDIT-${Date.now()}`,
      };
    },
  },

  consents: {
    async getBySubject(subject: string): Promise<Consent[]> {
      await delay(400);
      return [
        {
          id: '1',
          subject,
          purpose: 'marketing',
          granted: true,
          at: new Date().toISOString(),
          by: 'user',
          origin: 'web_form',
        },
        {
          id: '2',
          subject,
          purpose: 'whatsapp',
          granted: false,
          at: new Date().toISOString(),
          by: 'user',
          origin: 'app',
        },
      ];
    },

    async upsert(consent: Partial<Consent>): Promise<Consent> {
      await delay(500);
      return {
        id: consent.id || `CONSENT-${Date.now()}`,
        subject: consent.subject || '',
        purpose: consent.purpose || 'marketing',
        granted: consent.granted || false,
        at: new Date().toISOString(),
        by: 'current_user',
        ...consent,
      };
    },

    async revoke(id: string): Promise<{ success: boolean }> {
      await delay(400);
      return { success: true };
    },
  },

  kyc: {
    async check(data: Partial<KycCheck>): Promise<KycCheck> {
      await delay(1500);
      const riskScore = Math.random() * 100;
      const isPep = Math.random() > 0.9;
      
      return {
        id: `KYC-${Date.now()}`,
        fullName: data.fullName || '',
        docId: data.docId || '',
        docType: data.docType || 'dni',
        birthDate: data.birthDate || '',
        country: data.country || 'ES',
        isPep: data.isPep || isPep,
        amlRiskScore: riskScore,
        verificationStatus: riskScore > 80 ? 'manual_review' : 'verified',
        verifiedAt: new Date().toISOString(),
        flags: isPep ? ['PEP'] : riskScore > 60 ? ['MEDIUM_RISK'] : [],
      };
    },

    async amlScreen(docId: string): Promise<{ clear: boolean; flags: string[] }> {
      await delay(1000);
      const clear = Math.random() > 0.1;
      return {
        clear,
        flags: clear ? [] : ['SANCTIONS_MATCH', 'HIGH_RISK_COUNTRY'],
      };
    },
  },

  documents: {
    async generate(doc: Partial<LegalDocument>): Promise<LegalDocument> {
      await delay(700);
      const templates: Record<string, string> = {
        mandate: 'MANDATO DE VENTA\n\n{client_name} autoriza a {agency_name}...',
        dpa: 'ENCARGO DE TRATAMIENTO\n\n{agency_name} como encargado...',
        privacy_clauses: 'CLÁUSULAS RGPD\n\n1. Responsable: {agency_name}...',
        assignment: 'CONTRATO DE CESIÓN\n\n{client_name} cede a {agency_name}...',
      };

      let content = templates[doc.template || 'mandate'] || '';
      
      if (doc.variables) {
        Object.entries(doc.variables).forEach(([key, value]) => {
          content = content.replace(new RegExp(`{${key}}`, 'g'), value);
        });
      }

      return {
        id: `DOC-${Date.now()}`,
        template: doc.template || 'mandate',
        variables: doc.variables || {},
        version: 1,
        createdAt: new Date().toISOString(),
        createdBy: 'current_user',
        status: 'draft',
        content,
      };
    },

    async getById(id: string): Promise<LegalDocument> {
      await delay(400);
      return {
        id,
        template: 'mandate',
        variables: { client_name: 'Cliente', agency_name: 'Agencia' },
        version: 1,
        createdAt: new Date().toISOString(),
        createdBy: 'user',
        status: 'draft',
      };
    },

    async getTemplates(): Promise<string[]> {
      await delay(300);
      return ['mandate', 'dpa', 'privacy_clauses', 'assignment'];
    },
  },

  audit: {
    async getEvents(filters: any): Promise<{ items: AuditEvent[]; total: number }> {
      await delay(500);
      const events: AuditEvent[] = Array.from({ length: 10 }, (_, i) => ({
        id: `AUDIT-${i}`,
        at: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
        actor: `user${i % 3}`,
        action: ['create', 'update', 'delete', 'access'][i % 4],
        entity: ['property', 'client', 'document', 'consent'][i % 4],
        ref: `REF-${i}`,
        severity: (['low', 'medium', 'high'] as const)[i % 3],
      }));

      return { items: events, total: 50 };
    },

    async log(event: Partial<AuditEvent>): Promise<AuditEvent> {
      await delay(300);
      return {
        id: `AUDIT-${Date.now()}`,
        at: new Date().toISOString(),
        actor: 'current_user',
        action: event.action || 'unknown',
        entity: event.entity || 'system',
        severity: event.severity || 'low',
        ...event,
      };
    },
  },

  checklists: {
    async getByType(type: 'venta' | 'alquiler', ref?: string): Promise<ChecklistItem[]> {
      await delay(400);
      const baseItems: ChecklistItem[] = [
        { id: '1', label: 'Verificación identidad cliente', required: true, done: false, category: 'KYC' },
        { id: '2', label: 'Firma DPA con proveedor', required: true, done: false, category: 'Legal' },
        { id: '3', label: 'Consentimientos RGPD', required: true, done: false, category: 'RGPD' },
        { id: '4', label: 'Mandato firmado', required: true, done: false, category: 'Legal' },
      ];

      if (type === 'venta') {
        baseItems.push(
          { id: '5', label: 'Certificado energético (CEE)', required: true, done: false, category: 'Docs' },
          { id: '6', label: 'Nota simple actualizada', required: true, done: false, category: 'Docs' }
        );
      } else {
        baseItems.push(
          { id: '5', label: 'Inventario firmado', required: false, done: false, category: 'Docs' },
          { id: '6', label: 'Seguro de hogar', required: true, done: false, category: 'Docs' }
        );
      }

      return baseItems;
    },

    async save(items: ChecklistItem[]): Promise<{ success: boolean }> {
      await delay(500);
      return { success: true };
    },
  },

  dpia: {
    async create(report: Partial<DpiaReport>): Promise<DpiaReport> {
      await delay(800);
      return {
        id: `DPIA-${Date.now()}`,
        scope: report.scope || '',
        context: report.context || '',
        risks: report.risks || [],
        measures: report.measures || [],
        responsible: report.responsible || 'DPO',
        createdAt: new Date().toISOString(),
        status: 'draft',
      };
    },

    async getById(id: string): Promise<DpiaReport> {
      await delay(400);
      return {
        id,
        scope: 'Procesamiento de datos en operación inmobiliaria',
        context: 'Venta de inmueble residencial',
        risks: [
          { id: '1', category: 'legal', description: 'Incumplimiento RGPD', score: 3 },
          { id: '2', category: 'security', description: 'Brecha de datos', score: 4 },
        ],
        measures: ['Cifrado', 'Control de acceso', 'Auditoría'],
        responsible: 'DPO',
        createdAt: new Date().toISOString(),
        status: 'approved',
      };
    },
  },

  eidas: {
    async getProviderStatus(): Promise<EidasProvider> {
      await delay(300);
      return {
        status: Math.random() > 0.5 ? 'connected' : 'not_configured',
        provider: 'Example eIDAS Provider',
        lastCheck: new Date().toISOString(),
        capabilities: ['qualified_signature', 'timestamp'],
      };
    },

    async configureProvider(config: any): Promise<{ success: boolean }> {
      await delay(600);
      return { success: true };
    },
  },

  overview: {
    async getComplianceStatus(): Promise<ComplianceOverview> {
      await delay(500);
      const pendingDsr = Math.floor(Math.random() * 5);
      const expiredDsr = Math.floor(Math.random() * 2);
      const missingConsents = Math.floor(Math.random() * 3);
      const checklistProgress = Math.floor(Math.random() * 10);
      const checklistTotal = 10;

      const issues = [];
      if (expiredDsr > 0) issues.push(`${expiredDsr} solicitudes DSR vencidas`);
      if (missingConsents > 0) issues.push(`${missingConsents} consentimientos pendientes`);
      if (checklistProgress < checklistTotal) {
        issues.push(`Checklist incompleto (${checklistProgress}/${checklistTotal})`);
      }

      return {
        status: expiredDsr > 0 ? 'critical' : pendingDsr > 2 ? 'warning' : 'ok',
        pendingDsr,
        expiredDsr,
        missingConsents,
        checklistProgress,
        checklistTotal,
        kycPending: Math.floor(Math.random() * 3),
        auditEvents24h: Math.floor(Math.random() * 100),
        issues,
      };
    },
  },
};