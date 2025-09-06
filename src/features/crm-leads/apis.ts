const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

export interface Lead {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  canal: 'web' | 'portal' | 'whatsapp' | 'referido';
  origen?: string;
  estado: 'nuevo' | 'contactado' | 'calificado' | 'perdido';
  interes: 'alquiler' | 'compra';
  presupuestoMin?: number;
  presupuestoMax?: number;
  zonasInteres: string[];
  notas?: string;
  agente?: string;
  createdAt: string;
  updatedAt: string;
  fuenteUTM?: string;
  ultimaInteraccion?: string;
  duplicadoDe?: string;
  score?: number;
}

export interface LeadFilters {
  q?: string;
  canal?: string;
  estado?: string;
  agente?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  page?: number;
  limit?: number;
  orderBy?: string;
}

export async function getLeads(filters: LeadFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, String(value));
  });
  
  const response = await fetch(`${API_BASE}/crm/leads?${params}`);
  if (!response.ok) throw new Error('Error al obtener leads');
  return response.json();
}

export async function getLead(id: string) {
  const response = await fetch(`${API_BASE}/crm/leads/${id}`);
  if (!response.ok) throw new Error('Error al obtener lead');
  return response.json();
}

export async function createLead(data: Partial<Lead>) {
  const response = await fetch(`${API_BASE}/crm/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Error al crear lead');
  return response.json();
}

export async function updateLead(id: string, data: Partial<Lead>) {
  const response = await fetch(`${API_BASE}/crm/leads/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Error al actualizar lead');
  return response.json();
}

export async function deleteLead(id: string) {
  const response = await fetch(`${API_BASE}/crm/leads/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Error al eliminar lead');
  return response.json();
}

export async function mergeLeads(leadIds: string[], targetId: string) {
  const response = await fetch(`${API_BASE}/crm/leads/merge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ leadIds, targetId })
  });
  if (!response.ok) throw new Error('Error al fusionar leads');
  return response.json();
}

export async function importLeads(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE}/crm/leads/import`, {
    method: 'POST',
    body: formData
  });
  if (!response.ok) throw new Error('Error al importar leads');
  return response.json();
}

export async function exportLeads(filters: LeadFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, String(value));
  });
  
  const response = await fetch(`${API_BASE}/crm/leads/export?${params}`);
  if (!response.ok) throw new Error('Error al exportar leads');
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
}

export function detectDuplicates(leads: Lead[]): Map<string, Lead[]> {
  const duplicates = new Map<string, Lead[]>();
  
  leads.forEach(lead => {
    const key = `${lead.email?.toLowerCase()}_${lead.telefono}`;
    if (!duplicates.has(key)) {
      duplicates.set(key, []);
    }
    duplicates.get(key)!.push(lead);
  });
  
  return new Map([...duplicates.entries()].filter(([_, leads]) => leads.length > 1));
}

export function calculateScore(lead: Lead): number {
  let score = 0;
  
  if (lead.canal === 'web') score += 20;
  if (lead.canal === 'portal') score += 15;
  if (lead.canal === 'whatsapp') score += 25;
  if (lead.canal === 'referido') score += 30;
  
  if (lead.estado === 'calificado') score += 30;
  if (lead.estado === 'contactado') score += 20;
  
  if (lead.presupuestoMax && lead.presupuestoMax > 500000) score += 20;
  
  const daysSinceCreation = Math.floor((Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  if (daysSinceCreation < 1) score += 15;
  else if (daysSinceCreation < 3) score += 10;
  else if (daysSinceCreation < 7) score += 5;
  
  return Math.min(100, score);
}