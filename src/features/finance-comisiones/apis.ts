import {
  CommissionItem,
  CommissionPlan,
  CommissionsResponse,
  CommissionsFilters,
  SettlementResult,
  Payout,
  ReconciliationIssue,
  CommissionKPIs,
  CommissionForecast,
  AuditTrailEntry,
  CommissionAdjustment,
  CalculationPreview,
} from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockCommissions: CommissionItem[] = [
  {
    id: "1",
    source: "CONTRATO",
    ref: "CNT-2024-001",
    date: "2024-01-15",
    agentId: "agent1",
    agentName: "Juan Pérez",
    officeId: "office1",
    officeName: "Madrid Centro",
    baseAmount: 15000,
    planId: "plan1",
    rateApplied: 10,
    commissionAmount: 1500,
    status: "PENDIENTE",
  },
  {
    id: "2",
    source: "COBRO",
    ref: "COB-2024-002",
    date: "2024-01-18",
    agentId: "agent2",
    agentName: "María García",
    officeId: "office1",
    officeName: "Madrid Centro",
    baseAmount: 8000,
    planId: "plan1",
    rateApplied: 8,
    commissionAmount: 640,
    status: "APROBADO",
  },
];

const mockPlans: CommissionPlan[] = [
  {
    id: "plan1",
    name: "Plan Básico Ventas",
    scope: "AGENTE",
    priority: 1,
    rules: [
      { min: 0, max: 5000, rate: 8 },
      { min: 5000, max: 20000, rate: 10 },
      { min: 20000, rate: 12 },
    ],
    minPayout: 100,
    cap: 5000,
    split: { agent: 80, office: 20 },
    conditions: { type: "VENTA" },
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

const mockPayouts: Payout[] = [
  {
    id: "payout1",
    agentId: "agent1",
    agentName: "Juan Pérez",
    period: "2024-01",
    gross: 1500,
    withholdings: 150,
    net: 1350,
    method: "TRANSFER",
    status: "PENDIENTE",
    createdAt: "2024-02-01T00:00:00Z",
  },
];

const mockIssues: ReconciliationIssue[] = [
  {
    id: "issue1",
    type: "FACTURA",
    ref: "FAC-2024-001",
    amount: 1200,
    status: "OPEN",
    note: "Factura pendiente de reconciliar",
  },
];

export async function getCommissions(filters: CommissionsFilters): Promise<CommissionsResponse> {
  await delay(500);
  
  let filteredItems = [...mockCommissions];
  
  if (filters.q) {
    const query = filters.q.toLowerCase();
    filteredItems = filteredItems.filter(item => 
      item.ref.toLowerCase().includes(query) ||
      item.agentName.toLowerCase().includes(query)
    );
  }
  
  if (filters.status) {
    filteredItems = filteredItems.filter(item => item.status === filters.status);
  }
  
  if (filters.agent) {
    filteredItems = filteredItems.filter(item => item.agentId === filters.agent);
  }
  
  const page = filters.page || 1;
  const size = filters.size || 25;
  const start = (page - 1) * size;
  const items = filteredItems.slice(start, start + size);
  
  return {
    items,
    total: filteredItems.length,
    page,
    size,
    totalPages: Math.ceil(filteredItems.length / size),
  };
}

export async function recalculateCommissions(itemIds: string[]): Promise<void> {
  await delay(1000);
  console.log("Recalculating commissions for items:", itemIds);
}

export async function adjustCommission(adjustment: Omit<CommissionAdjustment, "id" | "createdAt" | "createdBy">): Promise<void> {
  await delay(500);
  console.log("Adjusting commission:", adjustment);
}

export async function getCommissionAudit(itemId: string): Promise<AuditTrailEntry[]> {
  await delay(300);
  return [
    {
      id: "audit1",
      itemId,
      action: "CREATED",
      details: { baseAmount: 15000, rate: 10 },
      timestamp: "2024-01-15T10:00:00Z",
      actor: "system",
    },
    {
      id: "audit2",
      itemId,
      action: "APPROVED",
      details: { approvedBy: "manager1" },
      timestamp: "2024-01-16T14:30:00Z",
      actor: "manager1",
    },
  ];
}

export async function getCommissionPlans(): Promise<CommissionPlan[]> {
  await delay(300);
  return [...mockPlans];
}

export async function createCommissionPlan(plan: Omit<CommissionPlan, "id" | "updatedAt">): Promise<CommissionPlan> {
  await delay(500);
  const newPlan: CommissionPlan = {
    ...plan,
    id: `plan-${Date.now()}`,
    updatedAt: new Date().toISOString(),
  };
  mockPlans.push(newPlan);
  return newPlan;
}

export async function updateCommissionPlan(id: string, plan: Partial<CommissionPlan>): Promise<CommissionPlan> {
  await delay(500);
  const index = mockPlans.findIndex(p => p.id === id);
  if (index === -1) throw new Error("Plan not found");
  
  const updatedPlan = { ...mockPlans[index], ...plan, updatedAt: new Date().toISOString() };
  mockPlans[index] = updatedPlan;
  return updatedPlan;
}

export async function deleteCommissionPlan(id: string): Promise<void> {
  await delay(300);
  const index = mockPlans.findIndex(p => p.id === id);
  if (index === -1) throw new Error("Plan not found");
  mockPlans.splice(index, 1);
}

export async function previewPlanCalculation(payload: {
  baseAmount: number;
  planId: string;
}): Promise<CalculationPreview> {
  await delay(200);
  const plan = mockPlans.find(p => p.id === payload.planId);
  if (!plan) throw new Error("Plan not found");
  
  return {
    baseAmount: payload.baseAmount,
    planApplied: plan,
    calculation: [
      { step: 1, min: 0, max: 5000, rate: 8, amount: 400 },
      { step: 2, min: 5000, max: payload.baseAmount, rate: 10, amount: (payload.baseAmount - 5000) * 0.1 },
    ],
    totalCommission: 400 + (payload.baseAmount - 5000) * 0.1,
    split: plan.split,
  };
}

export async function createSettlement(settlement: {
  period: string;
  itemIds: string[];
}): Promise<SettlementResult> {
  await delay(1000);
  return {
    id: `settlement-${Date.now()}`,
    period: settlement.period,
    items: settlement.itemIds,
    gross: 2140,
    adjustments: 0,
    net: 2140,
    createdAt: new Date().toISOString(),
  };
}

export async function getPayouts(filters: {
  period?: string;
  agent?: string;
  status?: string;
}): Promise<Payout[]> {
  await delay(400);
  let filtered = [...mockPayouts];
  
  if (filters.agent) {
    filtered = filtered.filter(p => p.agentId === filters.agent);
  }
  
  if (filters.status) {
    filtered = filtered.filter(p => p.status === filters.status);
  }
  
  return filtered;
}

export async function updatePayoutStatus(id: string, data: {
  status?: string;
  paidAt?: string;
}): Promise<Payout> {
  await delay(300);
  const payout = mockPayouts.find(p => p.id === id);
  if (!payout) throw new Error("Payout not found");
  
  Object.assign(payout, data);
  return payout;
}

export async function getPayoutReceipt(id: string): Promise<Blob> {
  await delay(500);
  const content = `Recibo de Pago #${id}\nFecha: ${new Date().toLocaleDateString()}\nImporte: 1.350,00 €`;
  return new Blob([content], { type: "text/plain" });
}

export async function getReconciliation(filters: {
  period?: string;
  office?: string;
}): Promise<ReconciliationIssue[]> {
  await delay(400);
  return [...mockIssues];
}

export async function resolveReconciliationIssue(id: string, note?: string): Promise<void> {
  await delay(300);
  const issue = mockIssues.find(i => i.id === id);
  if (issue) {
    issue.status = "RESOLVED";
    issue.resolvedAt = new Date().toISOString();
    issue.resolvedBy = "current-user";
    if (note) issue.note = note;
  }
}

export async function exportCommissions(payload: {
  filters: CommissionsFilters;
  format: "csv" | "json";
}): Promise<Blob> {
  await delay(800);
  const data = await getCommissions(payload.filters);
  
  if (payload.format === "csv") {
    const csv = [
      "ID,Source,Ref,Date,Agent,Base Amount,Commission,Status",
      ...data.items.map(item => 
        `${item.id},${item.source},${item.ref},${item.date},${item.agentName},${item.baseAmount},${item.commissionAmount},${item.status}`
      )
    ].join("\n");
    
    return new Blob([csv], { type: "text/csv" });
  }
  
  return new Blob([JSON.stringify(data.items, null, 2)], { type: "application/json" });
}

export async function importCommissions(file: File): Promise<{
  imported: number;
  errors: string[];
}> {
  await delay(1000);
  return {
    imported: 15,
    errors: ["Row 3: Invalid date format", "Row 7: Missing agent ID"],
  };
}

export async function getCommissionsForecast(filters: {
  period?: string;
}): Promise<CommissionForecast> {
  await delay(600);
  return {
    period: filters.period || new Date().toISOString().slice(0, 7),
    projected: 45000,
    trend: 12.5,
    margin: 8.2,
    assumptions: {
      conversionRate: 0.75,
      averageCommission: 1200,
      pipeline: 50,
    },
  };
}

export async function getCommissionsKPIs(filters: {
  from?: string;
  to?: string;
  office?: string;
}): Promise<CommissionKPIs> {
  await delay(500);
  return {
    totalCommissions: 125000,
    pendingAmount: 15000,
    averageCommission: 1250,
    topAgents: [
      { agentId: "agent1", agentName: "Juan Pérez", total: 8500 },
      { agentId: "agent2", agentName: "María García", total: 6200 },
      { agentId: "agent3", agentName: "Carlos López", total: 5800 },
    ],
    liquidationRate: 85.5,
    backlogByOffice: [
      { officeId: "office1", officeName: "Madrid Centro", count: 12, amount: 8500 },
      { officeId: "office2", officeName: "Barcelona", count: 8, amount: 6500 },
    ],
  };
}