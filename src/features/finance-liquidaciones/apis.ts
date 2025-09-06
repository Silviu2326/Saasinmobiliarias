import type {
  Settlement,
  SettlementLine,
  SettlementQuery,
  SettlementResponse,
  CommissionItem,
  Payout,
  AuditEntry,
  SettlementSummary,
  Office,
  Team,
  Agent,
  Adjustment,
} from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Datos simulados
const MOCK_OFFICES: Office[] = [
  { id: 'office-1', name: 'Oficina Centro', code: 'CTR' },
  { id: 'office-2', name: 'Oficina Norte', code: 'NOR' },
  { id: 'office-3', name: 'Oficina Sur', code: 'SUR' },
];

const MOCK_TEAMS: Team[] = [
  { id: 'team-1', name: 'Equipo Ventas A', officeId: 'office-1', officeName: 'Oficina Centro' },
  { id: 'team-2', name: 'Equipo Ventas B', officeId: 'office-1', officeName: 'Oficina Centro' },
  { id: 'team-3', name: 'Equipo Alquileres', officeId: 'office-2', officeName: 'Oficina Norte' },
];

const MOCK_AGENTS: Agent[] = [
  { id: 'agent-1', name: 'María García', email: 'maria@ejemplo.com', teamId: 'team-1', teamName: 'Equipo Ventas A', officeId: 'office-1', officeName: 'Oficina Centro' },
  { id: 'agent-2', name: 'Carlos López', email: 'carlos@ejemplo.com', teamId: 'team-1', teamName: 'Equipo Ventas A', officeId: 'office-1', officeName: 'Oficina Centro' },
  { id: 'agent-3', name: 'Ana Martín', email: 'ana@ejemplo.com', teamId: 'team-2', teamName: 'Equipo Ventas B', officeId: 'office-1', officeName: 'Oficina Centro' },
  { id: 'agent-4', name: 'Pedro Sánchez', email: 'pedro@ejemplo.com', teamId: 'team-3', teamName: 'Equipo Alquileres', officeId: 'office-2', officeName: 'Oficina Norte' },
];

const MOCK_SETTLEMENTS: Settlement[] = Array.from({ length: 25 }, (_, i) => {
  const office = MOCK_OFFICES[i % MOCK_OFFICES.length];
  const date = new Date(2024, i % 12, Math.floor(i / 12) + 1);
  const period = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  
  return {
    id: `settlement-${i + 1}`,
    name: `Liquidación ${office.name} ${period}`,
    period,
    officeId: office.id,
    officeName: office.name,
    linesCount: Math.floor(Math.random() * 50) + 10,
    gross: Math.floor(Math.random() * 50000) + 10000,
    withholdings: Math.floor(Math.random() * 5000) + 1000,
    net: 0, // Se calcula después
    status: (['BORRADOR', 'APROBADA', 'CERRADA'] as const)[Math.floor(Math.random() * 3)],
    createdBy: 'admin@ejemplo.com',
    createdByName: 'Administrador',
    createdAt: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toISOString(),
    origin: (['VENTA', 'ALQUILER', 'MIXTO'] as const)[Math.floor(Math.random() * 3)],
  };
});

// Calcular neto
MOCK_SETTLEMENTS.forEach(s => {
  s.net = s.gross - s.withholdings;
});

const MOCK_COMMISSION_ITEMS: CommissionItem[] = Array.from({ length: 200 }, (_, i) => {
  const agent = MOCK_AGENTS[i % MOCK_AGENTS.length];
  const date = new Date(2024, Math.floor(i / 50), (i % 28) + 1);
  
  return {
    id: `commission-${i + 1}`,
    date: date.toISOString().split('T')[0],
    source: (['OFERTA', 'RESERVA', 'CONTRATO', 'COBRO'] as const)[Math.floor(Math.random() * 4)],
    ref: `REF-${1000 + i}`,
    entityId: `entity-${i + 1}`,
    agentId: agent.id,
    agentName: agent.name,
    teamId: agent.teamId,
    teamName: agent.teamName,
    baseAmount: Math.floor(Math.random() * 10000) + 1000,
    commissionRate: Math.random() * 0.05 + 0.01, // 1-6%
    commissionAmount: 0, // Se calcula después
    status: (['PENDIENTE', 'APROBADA', 'LIQUIDADA'] as const)[Math.floor(Math.random() * 3)],
    origin: (['VENTA', 'ALQUILER'] as const)[Math.floor(Math.random() * 2)],
  };
});

// Calcular comisiones
MOCK_COMMISSION_ITEMS.forEach(item => {
  item.commissionAmount = Math.floor(item.baseAmount * (item.commissionRate || 0.03));
});

export const settlementsApi = {
  // Liquidaciones
  async getSettlements(query: SettlementQuery): Promise<SettlementResponse> {
    await delay(600);
    
    let filtered = [...MOCK_SETTLEMENTS];
    
    // Aplicar filtros
    if (query.period) {
      filtered = filtered.filter(s => s.period === query.period);
    }
    
    if (query.office) {
      filtered = filtered.filter(s => s.officeId === query.office);
    }
    
    if (query.status) {
      filtered = filtered.filter(s => s.status === query.status);
    }
    
    if (query.origin) {
      filtered = filtered.filter(s => s.origin === query.origin);
    }
    
    if (query.q) {
      const q = query.q.toLowerCase();
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(q) ||
        s.officeName?.toLowerCase().includes(q) ||
        s.createdByName?.toLowerCase().includes(q)
      );
    }
    
    if (query.from) {
      filtered = filtered.filter(s => s.createdAt >= query.from + 'T00:00:00.000Z');
    }
    
    if (query.to) {
      filtered = filtered.filter(s => s.createdAt <= query.to + 'T23:59:59.999Z');
    }
    
    // Ordenar
    const sort = query.sort || '-createdAt';
    const [field, direction] = sort.startsWith('-') ? [sort.substring(1), 'desc'] : [sort, 'asc'];
    
    filtered.sort((a, b) => {
      let aVal = (a as any)[field];
      let bVal = (b as any)[field];
      
      if (field === 'createdAt' || field === 'updatedAt') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      
      const result = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return direction === 'desc' ? -result : result;
    });
    
    // Paginación
    const page = query.page || 1;
    const size = query.size || 25;
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    
    const items = filtered.slice(startIndex, endIndex);
    const total = filtered.length;
    const totalPages = Math.ceil(total / size);
    
    return { items, total, page, totalPages };
  },

  async getSettlement(id: string): Promise<Settlement | null> {
    await delay(400);
    return MOCK_SETTLEMENTS.find(s => s.id === id) || null;
  },

  async createSettlement(data: any): Promise<Settlement> {
    await delay(1000);
    
    const newSettlement: Settlement = {
      id: `settlement-${Date.now()}`,
      name: data.name,
      period: data.period,
      officeId: data.officeId,
      officeName: data.officeName,
      teamId: data.teamId,
      teamName: data.teamName,
      agentId: data.agentId,
      agentName: data.agentName,
      linesCount: data.lines?.length || 0,
      gross: data.gross || 0,
      withholdings: data.withholdings || 0,
      net: (data.gross || 0) - (data.withholdings || 0),
      status: 'BORRADOR',
      createdBy: 'current-user@ejemplo.com',
      createdByName: 'Usuario Actual',
      createdAt: new Date().toISOString(),
      origin: data.origin || 'MIXTO',
      notes: data.notes,
    };
    
    return newSettlement;
  },

  async updateSettlement(id: string, updates: Partial<Settlement>): Promise<Settlement> {
    await delay(500);
    
    const settlement = MOCK_SETTLEMENTS.find(s => s.id === id);
    if (!settlement) {
      throw new Error('Liquidación no encontrada');
    }
    
    return {
      ...settlement,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
  },

  async recalculateSettlement(id: string): Promise<{ success: boolean; message: string }> {
    await delay(2000);
    return {
      success: true,
      message: 'Liquidación recalculada con las reglas actuales',
    };
  },

  async closeSettlement(id: string, data: any): Promise<{ success: boolean; message: string }> {
    await delay(800);
    return {
      success: true,
      message: 'Período cerrado exitosamente',
    };
  },

  async reopenSettlement(id: string): Promise<{ success: boolean; message: string }> {
    await delay(600);
    return {
      success: true,
      message: 'Liquidación reabierta para edición',
    };
  },

  // Líneas de liquidación
  async getSettlementLines(settlementId: string): Promise<SettlementLine[]> {
    await delay(500);
    
    return Array.from({ length: Math.floor(Math.random() * 30) + 10 }, (_, i) => {
      const agent = MOCK_AGENTS[i % MOCK_AGENTS.length];
      const date = new Date(2024, Math.floor(i / 10), (i % 28) + 1);
      const baseAmount = Math.floor(Math.random() * 5000) + 500;
      const commissionAmount = Math.floor(baseAmount * 0.03);
      const adjustments = Math.floor(Math.random() * 200) - 100;
      
      return {
        id: `line-${settlementId}-${i + 1}`,
        settlementId,
        date: date.toISOString().split('T')[0],
        source: (['OFERTA', 'RESERVA', 'CONTRATO', 'COBRO'] as const)[Math.floor(Math.random() * 4)],
        ref: `REF-${2000 + i}`,
        entityId: `entity-${i + 1}`,
        agentId: agent.id,
        agentName: agent.name,
        teamId: agent.teamId,
        teamName: agent.teamName,
        baseAmount,
        rateApplied: 0.03,
        commissionAmount,
        adjustments,
        netAmount: commissionAmount + adjustments,
        adjustmentHistory: [],
      };
    });
  },

  async adjustSettlementLine(settlementId: string, data: any): Promise<{ success: boolean; adjustment: Adjustment }> {
    await delay(600);
    
    const adjustment: Adjustment = {
      id: `adj-${Date.now()}`,
      lineId: data.lineId,
      type: data.type,
      value: data.value,
      reason: data.reason,
      amount: data.type === 'PERCENT' ? Math.floor(data.originalAmount * data.value / 100) : data.value,
      appliedBy: 'current-user@ejemplo.com',
      appliedByName: 'Usuario Actual',
      appliedAt: new Date().toISOString(),
      attachmentUrl: data.attachmentUrl,
    };
    
    return { success: true, adjustment };
  },

  // Pagos
  async getPayouts(settlementId: string): Promise<Payout[]> {
    await delay(400);
    
    return Array.from({ length: Math.floor(Math.random() * 5) + 2 }, (_, i) => {
      const agent = MOCK_AGENTS[i % MOCK_AGENTS.length];
      const gross = Math.floor(Math.random() * 5000) + 1000;
      const withholdings = Math.floor(gross * 0.15);
      
      return {
        id: `payout-${settlementId}-${i + 1}`,
        settlementId,
        agentId: agent.id,
        agentName: agent.name,
        teamId: agent.teamId,
        teamName: agent.teamName,
        gross,
        withholdings,
        net: gross - withholdings,
        method: (['TRANSFER', 'CASH', 'OTHER'] as const)[Math.floor(Math.random() * 3)],
        status: (['PENDIENTE', 'ENVIADO', 'CONCILIADO'] as const)[Math.floor(Math.random() * 3)],
        createdAt: new Date().toISOString(),
        iban: i % 2 === 0 ? 'ES21 1465 0100 72 2030876293' : undefined,
        concept: `Liquidación ${settlementId}`,
      };
    });
  },

  async generatePayouts(settlementId: string): Promise<{ success: boolean; count: number }> {
    await delay(1000);
    return { success: true, count: Math.floor(Math.random() * 5) + 2 };
  },

  async updatePayoutStatus(payoutId: string, status: string): Promise<{ success: boolean }> {
    await delay(300);
    return { success: true };
  },

  async getPayoutReceipt(payoutId: string): Promise<{ url: string }> {
    await delay(500);
    return { url: `/api/finance/payouts/${payoutId}/receipt.pdf` };
  },

  // Comisiones elegibles
  async getEligibleCommissions(filters: any): Promise<CommissionItem[]> {
    await delay(800);
    
    let filtered = MOCK_COMMISSION_ITEMS.filter(item => item.status !== 'LIQUIDADA');
    
    if (filters.period) {
      const period = filters.period;
      filtered = filtered.filter(item => {
        const itemPeriod = item.date.substring(0, 7); // YYYY-MM
        return itemPeriod === period;
      });
    }
    
    if (filters.office) {
      const officeAgents = MOCK_AGENTS.filter(a => a.officeId === filters.office).map(a => a.id);
      filtered = filtered.filter(item => officeAgents.includes(item.agentId));
    }
    
    if (filters.team) {
      const teamAgents = MOCK_AGENTS.filter(a => a.teamId === filters.team).map(a => a.id);
      filtered = filtered.filter(item => teamAgents.includes(item.agentId));
    }
    
    if (filters.agent) {
      filtered = filtered.filter(item => item.agentId === filters.agent);
    }
    
    if (filters.origin && filters.origin !== 'MIXTO') {
      filtered = filtered.filter(item => item.origin === filters.origin);
    }
    
    if (filters.onlyApproved) {
      filtered = filtered.filter(item => item.status === 'APROBADA');
    }
    
    return filtered;
  },

  // Resumen de liquidación
  async getSettlementSummary(settlementId: string): Promise<SettlementSummary> {
    await delay(500);
    
    const lines = await this.getSettlementLines(settlementId);
    
    // Agrupar por agente
    const byAgentMap = new Map();
    lines.forEach(line => {
      if (!byAgentMap.has(line.agentId)) {
        byAgentMap.set(line.agentId, {
          agentId: line.agentId,
          agentName: line.agentName,
          linesCount: 0,
          gross: 0,
          adjustments: 0,
          net: 0,
        });
      }
      const agent = byAgentMap.get(line.agentId);
      agent.linesCount++;
      agent.gross += line.commissionAmount;
      agent.adjustments += line.adjustments;
      agent.net += line.netAmount;
    });
    
    // Agrupar por fuente
    const bySourceMap = new Map();
    lines.forEach(line => {
      if (!bySourceMap.has(line.source)) {
        bySourceMap.set(line.source, { source: line.source, count: 0, amount: 0 });
      }
      const source = bySourceMap.get(line.source);
      source.count++;
      source.amount += line.netAmount;
    });
    
    const totals = {
      lines: lines.length,
      gross: lines.reduce((sum, l) => sum + l.commissionAmount, 0),
      withholdings: 0,
      adjustments: lines.reduce((sum, l) => sum + l.adjustments, 0),
      net: lines.reduce((sum, l) => sum + l.netAmount, 0),
    };
    
    totals.withholdings = Math.floor(totals.gross * 0.15);
    
    return {
      byAgent: Array.from(byAgentMap.values()),
      bySource: Array.from(bySourceMap.values()),
      totals,
    };
  },

  // Auditoría
  async getAuditTrail(settlementId: string): Promise<AuditEntry[]> {
    await delay(400);
    
    return Array.from({ length: Math.floor(Math.random() * 10) + 5 }, (_, i) => {
      const actions = ['CREATED', 'RECALCULATED', 'LINE_ADJUSTED', 'STATUS_CHANGED', 'PAYOUT_GENERATED'];
      const actors = ['admin@ejemplo.com', 'manager@ejemplo.com', 'current-user@ejemplo.com'];
      
      return {
        id: `audit-${settlementId}-${i + 1}`,
        settlementId,
        action: actions[i % actions.length],
        actor: actors[i % actors.length],
        actorName: 'Usuario Sistema',
        timestamp: new Date(Date.now() - i * 2 * 60 * 60 * 1000).toISOString(),
        details: {
          action: actions[i % actions.length],
          context: 'Settlement management',
        },
      };
    });
  },

  // Maestros
  async getOffices(): Promise<Office[]> {
    await delay(200);
    return MOCK_OFFICES;
  },

  async getTeams(officeId?: string): Promise<Team[]> {
    await delay(200);
    return officeId ? MOCK_TEAMS.filter(t => t.officeId === officeId) : MOCK_TEAMS;
  },

  async getAgents(teamId?: string, officeId?: string): Promise<Agent[]> {
    await delay(200);
    
    let filtered = [...MOCK_AGENTS];
    
    if (teamId) {
      filtered = filtered.filter(a => a.teamId === teamId);
    } else if (officeId) {
      filtered = filtered.filter(a => a.officeId === officeId);
    }
    
    return filtered;
  },

  // Exportación
  async exportSettlement(settlementId: string, format: 'csv' | 'json'): Promise<{ url: string }> {
    await delay(1500);
    return { url: `/api/finance/settlements/${settlementId}/export.${format}` };
  },
};