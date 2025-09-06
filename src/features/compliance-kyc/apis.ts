import type {
  Applicant,
  KycFilters,
  KycStats,
  DocumentRef,
  Decision,
  ScreeningMatch,
  RiskScore,
  WebhookConfig,
  AuditEvent,
  LivenessResult,
  AddressVerification,
} from "./types";
import { calculateRiskScore, generateApplicantId, maskDocId } from "./utils";

const API = import.meta.env.VITE_API_BASE_URL ?? "/api";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data generation
const mockApplicants: Applicant[] = Array.from({ length: 120 }, (_, i) => {
  const createdDays = Math.floor(Math.random() * 90);
  const states: Applicant["state"][] = ["NUEVO", "EN_REVISION", "APROBADO", "RECHAZADO", "PEND_INFO"];
  const risks: Applicant["risk"][] = ["BAJO", "MEDIO", "ALTO", "CRITICO"];
  const kinds: Applicant["kind"][] = ["CLIENTE", "PROPIETARIO"];
  const docTypes: Applicant["docType"][] = ["DNI", "NIE", "PASAPORTE"];
  const channels: Applicant["channel"][] = ["web", "portales", "oficina", "whatsapp"];
  
  const state = states[Math.floor(Math.random() * states.length)];
  const risk = risks[Math.floor(Math.random() * risks.length)];
  const riskScore = risk === "BAJO" ? Math.random() * 30 : 
                   risk === "MEDIO" ? 30 + Math.random() * 30 :
                   risk === "ALTO" ? 60 + Math.random() * 20 : 80 + Math.random() * 20;

  return {
    id: generateApplicantId(),
    createdAt: new Date(Date.now() - createdDays * 24 * 60 * 60 * 1000).toISOString(),
    kind: kinds[Math.floor(Math.random() * kinds.length)],
    name: `${["Juan", "María", "Carlos", "Ana", "Luis", "Carmen"][Math.floor(Math.random() * 6)]} ${["García", "López", "Martín", "González", "Rodríguez"][Math.floor(Math.random() * 5)]}`,
    docType: docTypes[Math.floor(Math.random() * docTypes.length)],
    docId: `${Math.random().toString().substring(2, 10)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
    docExpiry: new Date(Date.now() + (Math.random() * 1000 + 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    country: "ESP",
    address: `Calle ${["Mayor", "Real", "Constitución", "España", "Libertad"][Math.floor(Math.random() * 5)]}, ${Math.floor(Math.random() * 100) + 1}`,
    email: `user${i}@example.com`,
    phone: `6${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
    channel: channels[Math.floor(Math.random() * channels.length)],
    officeId: `office-${Math.floor(Math.random() * 5) + 1}`,
    agentId: `agent-${Math.floor(Math.random() * 10) + 1}`,
    state,
    risk,
    riskScore: Math.round(riskScore),
    flags: risk === "CRITICO" ? ["Lista de sanciones", "Documento caducado"] :
           risk === "ALTO" ? ["Coincidencia PEP"] :
           risk === "MEDIO" ? ["Documento próximo a caducar"] : [],
    submittedAt: state !== "NUEVO" ? new Date(Date.now() - (createdDays - 1) * 24 * 60 * 60 * 1000).toISOString() : undefined,
    decidedAt: ["APROBADO", "RECHAZADO"].includes(state) ? new Date(Date.now() - Math.floor(Math.random() * createdDays) * 24 * 60 * 60 * 1000).toISOString() : undefined,
    decidedBy: ["APROBADO", "RECHAZADO"].includes(state) ? "compliance@example.com" : undefined,
  };
});

export async function getApplicants(filters: KycFilters): Promise<{
  data: Applicant[];
  total: number;
  stats: KycStats;
}> {
  await delay(600);

  let filtered = [...mockApplicants];

  // Apply filters
  if (filters.from) {
    filtered = filtered.filter(a => new Date(a.createdAt) >= new Date(filters.from!));
  }
  if (filters.to) {
    filtered = filtered.filter(a => new Date(a.createdAt) <= new Date(filters.to!));
  }
  if (filters.estado) {
    filtered = filtered.filter(a => a.state === filters.estado);
  }
  if (filters.riesgo) {
    filtered = filtered.filter(a => a.risk === filters.riesgo);
  }
  if (filters.canal) {
    filtered = filtered.filter(a => a.channel === filters.canal);
  }
  if (filters.oficina) {
    filtered = filtered.filter(a => a.officeId === filters.oficina);
  }
  if (filters.agente) {
    filtered = filtered.filter(a => a.agentId === filters.agente);
  }
  if (filters.q) {
    const query = filters.q.toLowerCase();
    filtered = filtered.filter(a => 
      a.name.toLowerCase().includes(query) ||
      a.docId.toLowerCase().includes(query) ||
      a.email?.toLowerCase().includes(query)
    );
  }

  const total = filtered.length;

  // Sort
  if (filters.sort) {
    const [field, direction] = filters.sort.split('-');
    filtered.sort((a, b) => {
      const aVal = (a as any)[field];
      const bVal = (b as any)[field];
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return direction === 'desc' ? -comparison : comparison;
    });
  }

  // Paginate
  const page = filters.page || 0;
  const size = filters.size || 25;
  const paginated = filtered.slice(page * size, (page + 1) * size);

  // Calculate stats
  const stats: KycStats = {
    total: mockApplicants.length,
    nuevo: mockApplicants.filter(a => a.state === "NUEVO").length,
    enRevision: mockApplicants.filter(a => a.state === "EN_REVISION").length,
    aprobado: mockApplicants.filter(a => a.state === "APROBADO").length,
    rechazado: mockApplicants.filter(a => a.state === "RECHAZADO").length,
    pendInfo: mockApplicants.filter(a => a.state === "PEND_INFO").length,
    riesgoAlto: mockApplicants.filter(a => a.risk === "ALTO").length,
    riesgoCritico: mockApplicants.filter(a => a.risk === "CRITICO").length,
  };

  return { data: paginated, total, stats };
}

export async function createApplicant(data: Partial<Applicant>): Promise<Applicant> {
  await delay(400);

  const newApplicant: Applicant = {
    id: generateApplicantId(),
    createdAt: new Date().toISOString(),
    state: "NUEVO",
    risk: "BAJO",
    riskScore: 0,
    flags: [],
    ...data,
  } as Applicant;

  mockApplicants.unshift(newApplicant);
  return newApplicant;
}

export async function getApplicant(id: string): Promise<Applicant | null> {
  await delay(300);
  return mockApplicants.find(a => a.id === id) || null;
}

export async function updateApplicant(id: string, updates: Partial<Applicant>): Promise<Applicant | null> {
  await delay(400);

  const index = mockApplicants.findIndex(a => a.id === id);
  if (index === -1) return null;

  mockApplicants[index] = { ...mockApplicants[index], ...updates };
  return mockApplicants[index];
}

export async function submitApplicant(id: string): Promise<Applicant | null> {
  await delay(500);

  const applicant = await updateApplicant(id, {
    state: "EN_REVISION",
    submittedAt: new Date().toISOString(),
  });

  return applicant;
}

export async function makeDecision(id: string, decision: Decision): Promise<Applicant | null> {
  await delay(600);

  const newState = decision.action === "approve" ? "APROBADO" : 
                  decision.action === "reject" ? "RECHAZADO" : "PEND_INFO";

  const applicant = await updateApplicant(id, {
    state: newState,
    decidedAt: new Date().toISOString(),
    decidedBy: "current-user@example.com",
    decisionReason: decision.reason,
  });

  return applicant;
}

export async function uploadDocument(applicantId: string, file: File, type: DocumentRef["type"]): Promise<DocumentRef> {
  await delay(800);

  const document: DocumentRef = {
    id: `doc-${Date.now()}`,
    type,
    name: file.name,
    url: URL.createObjectURL(file),
    uploadedAt: new Date().toISOString(),
    size: file.size,
    mimeType: file.type,
    valid: Math.random() > 0.1, // 90% success rate
  };

  return document;
}

export async function getApplicantDocuments(applicantId: string): Promise<DocumentRef[]> {
  await delay(300);

  // Mock documents
  return [
    {
      id: "doc-1",
      type: "ID",
      name: "dni_frente.jpg",
      uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      valid: true,
      size: 1024000,
      mimeType: "image/jpeg",
    },
    {
      id: "doc-2",
      type: "SELFIE",
      name: "selfie_liveness.jpg",
      uploadedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      valid: true,
      size: 512000,
      mimeType: "image/jpeg",
    },
  ];
}

export async function performLivenessCheck(applicantId: string): Promise<LivenessResult> {
  await delay(2000);

  const confidence = 0.6 + Math.random() * 0.4;
  
  return {
    success: confidence >= 0.75,
    confidence,
    poses: {
      frontal: true,
      leftTurn: Math.random() > 0.1,
      rightTurn: Math.random() > 0.1,
      smile: Math.random() > 0.2,
    },
  };
}

export async function verifyAddress(applicantId: string, method: string): Promise<AddressVerification> {
  await delay(1500);

  const confidence = 0.7 + Math.random() * 0.3;
  
  return {
    verified: confidence >= 0.8,
    method: method as any,
    confidence,
    matchedFields: ["name", "address"],
    issues: confidence < 0.8 ? ["Dirección no coincide exactamente"] : undefined,
  };
}

export async function performScreening(name: string, docId: string, country: string): Promise<ScreeningMatch[]> {
  await delay(1000);

  const matches: ScreeningMatch[] = [];

  // Simulate some matches based on name
  if (name.toLowerCase().includes("juan")) {
    matches.push({
      list: "PEP",
      name: "Juan Carlos García Mendez",
      country: "ESP",
      similarity: 0.78,
      details: "Político local 2018-2022",
    });
  }

  if (name.toLowerCase().includes("carlos")) {
    matches.push({
      list: "OFAC",
      name: "Carlos Rodriguez Martinez",
      country: "COL",
      similarity: 0.82,
      details: "Lista OFAC 2020",
    });
  }

  return matches;
}

export async function calculateRisk(applicantId: string): Promise<RiskScore> {
  await delay(500);

  const applicant = await getApplicant(applicantId);
  if (!applicant) throw new Error("Applicant not found");

  const documents = await getApplicantDocuments(applicantId);
  const screeningResults = await performScreening(applicant.name, applicant.docId, applicant.country || "ESP");

  return calculateRiskScore(applicant, documents, screeningResults);
}

export async function downloadApplicantZip(applicantId: string): Promise<Blob> {
  await delay(1000);
  
  // Mock ZIP file
  const content = `Expediente KYC: ${applicantId}\nGenerado: ${new Date().toISOString()}`;
  return new Blob([content], { type: "application/zip" });
}

export async function getWebhooks(): Promise<WebhookConfig[]> {
  await delay(300);

  return [
    {
      id: "webhook-1",
      url: "https://api.example.com/kyc/webhook",
      secret: "secret_key_123",
      events: ["kyc.submitted", "kyc.approved", "kyc.rejected"],
      enabled: true,
      lastTriggered: new Date(Date.now() - 60000).toISOString(),
    },
  ];
}

export async function createWebhook(config: Omit<WebhookConfig, "id">): Promise<WebhookConfig> {
  await delay(400);

  return {
    id: `webhook-${Date.now()}`,
    ...config,
  };
}

export async function testWebhook(id: string): Promise<{ success: boolean; response?: string }> {
  await delay(800);

  return {
    success: Math.random() > 0.2,
    response: Math.random() > 0.2 ? "200 OK" : "404 Not Found",
  };
}

export async function importApplicants(data: any[]): Promise<{
  success: number;
  errors: Array<{ row: number; error: string }>;
}> {
  await delay(1200);

  const errors: Array<{ row: number; error: string }> = [];
  let success = 0;

  data.forEach((item, index) => {
    if (!item.name || !item.docId || !item.kind) {
      errors.push({ row: index + 1, error: "Campos obligatorios faltantes" });
    } else {
      success++;
    }
  });

  return { success, errors };
}

export async function exportApplicants(applicantIds: string[]): Promise<Blob> {
  await delay(800);

  const applicants = mockApplicants.filter(a => applicantIds.includes(a.id));
  const csvContent = `ID,Name,Document,State,Risk\n${applicants.map(a => 
    `${a.id},${a.name},${a.docType} ${maskDocId(a.docId)},${a.state},${a.risk}`
  ).join('\n')}`;

  return new Blob([csvContent], { type: "text/csv" });
}

export async function getAuditTrail(applicantId?: string): Promise<AuditEvent[]> {
  await delay(400);

  return [
    {
      id: "audit-1",
      at: new Date(Date.now() - 3600000).toISOString(),
      actor: "user@example.com",
      action: "applicant.created",
      applicantId: applicantId || "KYC123",
      payload: { kind: "CLIENTE", channel: "web" },
    },
    {
      id: "audit-2",
      at: new Date(Date.now() - 1800000).toISOString(),
      actor: "user@example.com",
      action: "document.uploaded",
      applicantId: applicantId || "KYC123",
      payload: { type: "ID", valid: true },
    },
    {
      id: "audit-3",
      at: new Date(Date.now() - 900000).toISOString(),
      actor: "compliance@example.com",
      action: "decision.made",
      applicantId: applicantId || "KYC123",
      payload: { action: "approve", reason: "Documentación completa" },
    },
  ];
}