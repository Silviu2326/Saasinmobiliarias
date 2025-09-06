import type { KycState, RiskLevel, Applicant, ScreeningMatch, RiskScore } from "./types";

export function maskDocId(docId: string): string {
  if (docId.length <= 4) return docId;
  const visible = 2;
  const masked = "*".repeat(docId.length - visible * 2);
  return docId.slice(0, visible) + masked + docId.slice(-visible);
}

export function validateIban(iban: string): boolean {
  // Simplified IBAN checksum validation
  const ibanCode = iban.replace(/\s/g, "").toUpperCase();
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(ibanCode)) return false;
  
  // Move first 4 chars to end and convert letters to numbers
  const rearranged = ibanCode.slice(4) + ibanCode.slice(0, 4);
  const numericString = rearranged.replace(/[A-Z]/g, (char) => 
    (char.charCodeAt(0) - 55).toString()
  );
  
  // Calculate mod 97
  let remainder = 0;
  for (let i = 0; i < numericString.length; i++) {
    remainder = (remainder * 10 + parseInt(numericString[i])) % 97;
  }
  
  return remainder === 1;
}

export function expiryStatus(expiryDate: string): { status: "ok" | "warning" | "expired"; message?: string } {
  const expiry = new Date(expiryDate);
  const now = new Date();
  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return { status: "expired", message: "Caducado" };
  } else if (diffDays < 90) {
    return { status: "warning", message: `${diffDays}d` };
  }
  
  return { status: "ok" };
}

export function riskLevelFrom(score: number): RiskLevel {
  if (score >= 80) return "CRITICO";
  if (score >= 60) return "ALTO";
  if (score >= 30) return "MEDIO";
  return "BAJO";
}

export function calculateRiskScore(applicant: Applicant, documents: any[], screeningResults: ScreeningMatch[]): RiskScore {
  let score = 0;
  const flags: string[] = [];
  
  const factors = {
    documentValid: true,
    livenessPass: true,
    addressVerified: true,
    pepMatch: false,
    sanctionsMatch: false,
    docExpiring: false,
  };

  // Document expiry check
  if (applicant.docExpiry) {
    const expiryCheck = expiryStatus(applicant.docExpiry);
    if (expiryCheck.status === "expired") {
      score += 30;
      flags.push("Documento caducado");
      factors.documentValid = false;
    } else if (expiryCheck.status === "warning") {
      score += 10;
      flags.push("Documento próximo a caducar");
      factors.docExpiring = true;
    }
  }

  // Document validation
  const idDoc = documents.find(d => d.type === "ID");
  if (!idDoc || !idDoc.valid) {
    score += 25;
    flags.push("Documento no válido");
    factors.documentValid = false;
  }

  // Liveness check
  const selfieDoc = documents.find(d => d.type === "SELFIE");
  if (!selfieDoc || !selfieDoc.valid) {
    score += 20;
    flags.push("Prueba de vida no superada");
    factors.livenessPass = false;
  }

  // Address verification
  const addressDoc = documents.find(d => d.type === "ADDRESS");
  if (!addressDoc || !addressDoc.valid) {
    score += 15;
    flags.push("Dirección no verificada");
    factors.addressVerified = false;
  }

  // PEP/Sanctions screening
  const pepMatch = screeningResults.find(m => m.list === "PEP" && m.similarity >= 0.85);
  const sanctionsMatch = screeningResults.find(m => (m.list === "OFAC" || m.list === "UE") && m.similarity >= 0.85);

  if (pepMatch) {
    score += 40;
    flags.push("Coincidencia PEP");
    factors.pepMatch = true;
  }

  if (sanctionsMatch) {
    score += 50;
    flags.push("Lista de sanciones");
    factors.sanctionsMatch = true;
  }

  // High similarity matches requiring review
  const reviewMatches = screeningResults.filter(m => m.similarity >= 0.75 && m.similarity < 0.85);
  if (reviewMatches.length > 0) {
    score += reviewMatches.length * 5;
    flags.push(`${reviewMatches.length} coincidencias para revisar`);
  }

  const level = riskLevelFrom(score);
  let recommendation = "";

  switch (level) {
    case "BAJO":
      recommendation = "Aprobación automática recomendada";
      break;
    case "MEDIO":
      recommendation = "Revisión manual recomendada";
      break;
    case "ALTO":
      recommendation = "Requiere aprobación supervisora";
      break;
    case "CRITICO":
      recommendation = "Rechazar o escalado a compliance";
      break;
  }

  return {
    score,
    level,
    flags,
    recommendation,
    factors,
  };
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatPhone(phone: string): string {
  // Simple Spanish phone formatting
  if (phone.length === 9) {
    return `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`;
  }
  return phone;
}

export function getStateColor(state: KycState): string {
  switch (state) {
    case "NUEVO":
      return "bg-gray-100 text-gray-800";
    case "EN_REVISION":
      return "bg-blue-100 text-blue-800";
    case "APROBADO":
      return "bg-green-100 text-green-800";
    case "RECHAZADO":
      return "bg-red-100 text-red-800";
    case "PEND_INFO":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function getRiskColor(risk: RiskLevel): string {
  switch (risk) {
    case "BAJO":
      return "bg-green-100 text-green-800";
    case "MEDIO":
      return "bg-yellow-100 text-yellow-800";
    case "ALTO":
      return "bg-orange-100 text-orange-800";
    case "CRITICO":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function getChannelLabel(channel: string): string {
  const labels: Record<string, string> = {
    web: "Web",
    portales: "Portales",
    oficina: "Oficina",
    whatsapp: "WhatsApp",
  };
  return labels[channel] || channel;
}

export function generateApplicantId(): string {
  return `KYC${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
}

export function extractMrzData(file: File): Promise<{ docId: string; expiry: string; nationality: string } | null> {
  // Simulate MRZ extraction
  return new Promise((resolve) => {
    setTimeout(() => {
      if (Math.random() > 0.1) { // 90% success rate
        resolve({
          docId: `12345678${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
          expiry: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000 * 3).toISOString().split('T')[0],
          nationality: "ESP",
        });
      } else {
        resolve(null);
      }
    }, 1500);
  });
}

export function simulateLivenessCheck(): Promise<{ success: boolean; confidence: number }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const confidence = 0.6 + Math.random() * 0.4; // 0.6 to 1.0
      resolve({
        success: confidence >= 0.75,
        confidence,
      });
    }, 2000);
  });
}

export function filtersToQueryString(filters: Record<string, any>): string {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, value.toString());
    }
  });
  
  return params.toString();
}

export function queryStringToFilters(queryString: string): Record<string, any> {
  const params = new URLSearchParams(queryString);
  const filters: Record<string, any> = {};
  
  params.forEach((value, key) => {
    if (key === "page" || key === "size") {
      filters[key] = parseInt(value);
    } else {
      filters[key] = value;
    }
  });
  
  return filters;
}

export function exportToCSV(applicants: Applicant[]): string {
  const headers = [
    "ID",
    "Fecha Alta",
    "Nombre",
    "Tipo",
    "Documento",
    "Estado",
    "Riesgo",
    "Puntuación",
    "Canal",
    "Email",
    "Teléfono",
  ];

  const rows = applicants.map(applicant => [
    applicant.id,
    formatDate(applicant.createdAt),
    applicant.name,
    applicant.kind,
    `${applicant.docType} ${maskDocId(applicant.docId)}`,
    applicant.state,
    applicant.risk,
    applicant.riskScore?.toString() || "",
    applicant.channel || "",
    applicant.email || "",
    applicant.phone || "",
  ]);

  return [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
}