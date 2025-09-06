import { z } from "zod";

export const applicantSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  docType: z.enum(["DNI", "NIE", "PASAPORTE"]),
  docId: z.string().min(8, "Documento inválido"),
  docExpiry: z.string().optional(),
  country: z.string().optional(),
  address: z.string().optional(),
  email: z.string().email("Email inválido").optional(),
  phone: z.string().optional(),
  kind: z.enum(["CLIENTE", "PROPIETARIO"]),
  channel: z.enum(["web", "portales", "oficina", "whatsapp"]).optional(),
  officeId: z.string().optional(),
  agentId: z.string().optional(),
});

export const kycFiltersSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  estado: z.enum(["NUEVO", "EN_REVISION", "APROBADO", "RECHAZADO", "PEND_INFO"]).optional(),
  riesgo: z.enum(["BAJO", "MEDIO", "ALTO", "CRITICO"]).optional(),
  canal: z.enum(["web", "portales", "oficina", "whatsapp"]).optional(),
  oficina: z.string().optional(),
  agente: z.string().optional(),
  q: z.string().optional(),
  page: z.number().min(0).optional(),
  size: z.number().min(1).max(100).optional(),
  sort: z.string().optional(),
});

export const decisionSchema = z.object({
  action: z.enum(["approve", "reject", "need_info"]),
  reason: z.string().optional(),
  notes: z.string().optional(),
}).refine(data => {
  if (data.action === "reject" || data.action === "need_info") {
    return data.reason && data.reason.length > 0;
  }
  return true;
}, { message: "Debe proporcionar un motivo para rechazar o requerir información" });

export const webhookConfigSchema = z.object({
  url: z.string().url("URL inválida"),
  secret: z.string().min(8, "Secret debe tener al menos 8 caracteres"),
  events: z.array(z.string()).min(1, "Debe seleccionar al menos un evento"),
  enabled: z.boolean(),
});

export const documentUploadSchema = z.object({
  type: z.enum(["ID", "SELFIE", "ADDRESS", "OTHER"]),
  file: z.any(),
}).refine(data => {
  if (data.file) {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    return allowedTypes.includes(data.file.type) && data.file.size <= maxSize;
  }
  return false;
}, { message: "Solo se permiten archivos PDF, JPG o PNG de máximo 10MB" });

export const importDataSchema = z.object({
  name: z.string().min(1),
  docType: z.enum(["DNI", "NIE", "PASAPORTE"]),
  docId: z.string().min(8),
  kind: z.enum(["CLIENTE", "PROPIETARIO"]),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  channel: z.string().optional(),
});

export function validateDocExpiry(expiryDate: string): { status: "ok" | "warning" | "expired"; message?: string } {
  const expiry = new Date(expiryDate);
  const now = new Date();
  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return { status: "expired", message: "Documento caducado" };
  } else if (diffDays < 90) {
    return { status: "warning", message: `Caduca en ${diffDays} días` };
  }
  
  return { status: "ok" };
}

export function validateDocId(docType: string, docId: string): boolean {
  switch (docType) {
    case "DNI":
      return /^[0-9]{8}[A-Z]$/.test(docId);
    case "NIE":
      return /^[XYZ][0-9]{7}[A-Z]$/.test(docId);
    case "PASAPORTE":
      return docId.length >= 6 && docId.length <= 9;
    default:
      return false;
  }
}

export function validateIban(iban: string): boolean {
  // Simplified IBAN validation
  const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$/;
  return ibanRegex.test(iban.replace(/\s/g, ""));
}