import type { 
  DsrStatus, 
  RgpdExport,
  ComplianceMetrics
} from "./types";

export function statusColor(status: DsrStatus | "open" | "investigating" | "contained" | "resolved"): string {
  const colors = {
    open: "bg-yellow-100 text-yellow-800",
    in_progress: "bg-blue-100 text-blue-800",
    investigating: "bg-orange-100 text-orange-800",
    done: "bg-green-100 text-green-800",
    completed: "bg-green-100 text-green-800",
    contained: "bg-indigo-100 text-indigo-800",
    resolved: "bg-gray-100 text-gray-800",
    rejected: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function riskColor(risk: "low" | "medium" | "high"): string {
  const colors = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  };
  return colors[risk];
}

export function complianceColor(level: "low" | "medium" | "high"): string {
  const colors = {
    high: "bg-green-500",
    medium: "bg-yellow-500",
    low: "bg-red-500",
  };
  return colors[level];
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function daysUntil(date: string | Date): number {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = d.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function isOverdue(date: string | Date): boolean {
  return daysUntil(date) < 0;
}

export function exportToCsv(data: any[], filename: string): void {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          if (Array.isArray(value)) return `"${value.join("; ")}"`;
          if (typeof value === "string" && value.includes(",")) return `"${value}"`;
          return value ?? "";
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToJson(data: any, filename: string): void {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.json`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function buildRgpdPack(data: RgpdExport): Promise<Blob> {
  const packContent = {
    exportDate: data.exportDate,
    summary: {
      totalDsr: data.dsr.length,
      totalConsents: data.consents.length,
      totalActivities: data.ropa.length,
      totalPolicies: data.policies.length,
      totalBreaches: data.breaches.length,
      totalSystems: data.dataMap.length,
    },
    data,
  };

  return new Blob([JSON.stringify(packContent, null, 2)], {
    type: "application/json",
  });
}

export function generateCookieBanner(): string {
  return `<!-- Cookie Consent Banner -->
<div id="cookie-banner" style="position:fixed;bottom:0;width:100%;background:#fff;padding:20px;box-shadow:0 -2px 10px rgba(0,0,0,0.1);z-index:9999;">
  <div style="max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;">
    <p style="margin:0;padding-right:20px;">
      Utilizamos cookies para mejorar tu experiencia. Al continuar navegando, aceptas nuestra 
      <a href="/privacy" style="color:#0066cc;">Política de Privacidad</a>.
    </p>
    <div>
      <button onclick="acceptAllCookies()" style="background:#0066cc;color:#fff;border:none;padding:10px 20px;margin-right:10px;cursor:pointer;">
        Aceptar todas
      </button>
      <button onclick="manageCookies()" style="background:#fff;color:#0066cc;border:1px solid #0066cc;padding:10px 20px;cursor:pointer;">
        Gestionar preferencias
      </button>
    </div>
  </div>
</div>
<script>
function acceptAllCookies() {
  localStorage.setItem('cookieConsent', JSON.stringify({all: true, timestamp: Date.now()}));
  document.getElementById('cookie-banner').style.display = 'none';
}
function manageCookies() {
  window.location.href = '/privacy/cookies';
}
if (localStorage.getItem('cookieConsent')) {
  document.getElementById('cookie-banner').style.display = 'none';
}
</script>`;
}

export function getDsrTypeName(type: string): string {
  const names: Record<string, string> = {
    access: "Acceso",
    rectification: "Rectificación",
    erasure: "Supresión",
    portability: "Portabilidad",
    restriction: "Limitación",
    objection: "Oposición",
  };
  return names[type] || type;
}

export function getCookieCategoryName(category: string): string {
  const names: Record<string, string> = {
    necessary: "Necesarias",
    analytics: "Analíticas",
    marketing: "Marketing",
    other: "Otras",
  };
  return names[category] || category;
}

export function calculateComplianceScore(metrics: ComplianceMetrics): {
  score: number;
  details: string[];
} {
  let score = 100;
  const details: string[] = [];

  if (metrics.overdueDsr > 0) {
    score -= metrics.overdueDsr * 20;
    details.push(`-${metrics.overdueDsr * 20} pts: ${metrics.overdueDsr} DSR vencidos`);
  }

  if (metrics.activeBreaches > 0) {
    score -= metrics.activeBreaches * 10;
    details.push(`-${metrics.activeBreaches * 10} pts: ${metrics.activeBreaches} brechas activas`);
  }

  if (metrics.highRiskBreaches > 0) {
    score -= metrics.highRiskBreaches * 25;
    details.push(`-${metrics.highRiskBreaches * 25} pts: ${metrics.highRiskBreaches} brechas de alto riesgo`);
  }

  if (metrics.missingPolicies.length > 0) {
    score -= metrics.missingPolicies.length * 5;
    details.push(`-${metrics.missingPolicies.length * 5} pts: ${metrics.missingPolicies.length} políticas faltantes`);
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    details,
  };
}