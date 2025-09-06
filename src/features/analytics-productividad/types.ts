export type GroupBy = "day" | "week" | "month";

export interface ActivityPoint {
  date: string;
  calls: number;
  emails: number;
  messages: number;
  tasksDone: number;
  visits: number;
}

export interface ResponseStats {
  agentId?: string;
  agentName?: string;
  p50FirstContact: number;
  p90FirstContact: number;
  p50FirstVisit: number;
  p90FirstVisit: number;
  p50ToOffer: number;
  p90ToOffer: number;
}

export interface SlaStats {
  contactSlaPct: number;
  followupSlaPct: number;
  breaches: number;
  topBreaches: Array<{
    id: string;
    ref: string;
    hoursLate: number;
    agentName: string;
  }>;
}

export interface TasksStats {
  agentId: string;
  agentName: string;
  created: number;
  completed: number;
  onTime: number;
  late: number;
  avgDelayDays: number;
}

export interface FieldStats {
  agentId?: string;
  checkins: number;
  plannedVisits: number;
  doneVisits: number;
  routeHours?: number;
  kms?: number;
}

export interface PipelineLoad {
  agentId: string;
  agentName: string;
  activeLeads: number;
  openDeals: number;
  avgAgeDays: number;
  byStage: Array<{
    stage: string;
    count: number;
    avgAgeDays: number;
  }>;
  overloaded?: boolean;
}

export interface LeaderboardRow {
  agentId: string;
  agentName: string;
  score: number;
  activities: number;
  firstContactP50: number;
  visits: number;
  offers: number;
  contracts: number;
  slaPct: number;
}

export interface CapacitySuggestion {
  moveFrom: string;
  moveTo: string;
  leads: number;
  reason: string;
}

export interface ProductivityFilters {
  from?: string;
  to?: string;
  office?: string;
  team?: string;
  agent?: string;
  canal?: 'tel' | 'email' | 'whatsapp' | 'visita';
  tipo?: 'venta' | 'alquiler';
  portal?: string;
  campaña?: string;
  dayStartHour?: number;
  groupBy?: GroupBy;
}

export interface KpiData {
  label: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
  };
  unit?: string;
}

export interface WorkloadData {
  dayOfWeek: number;
  hour: number;
  intensity: number;
  type: 'calls' | 'emails' | 'tasks' | 'visits';
}

export interface AgentDetail {
  agent: {
    id: string;
    name: string;
    team: string;
    office: string;
  };
  stats: {
    totalActivities: number;
    callsCompleted: number;
    emailsSent: number;
    tasksCompleted: number;
    visitsCompleted: number;
    offersCreated: number;
    contractsSigned: number;
  };
  recentActivities: Array<{
    id: string;
    type: 'call' | 'email' | 'visit' | 'task';
    ref: string;
    time: string;
    duration?: string;
    subject?: string;
    location?: string;
    description?: string;
  }>;
  pendingTasks: Array<{
    id: string;
    ref: string;
    description: string;
    due: string;
  }>;
}

export interface ExportFormat {
  type: 'CSV' | 'JSON' | 'PNG';
  label: string;
}

export interface ComponentProps {
  onAgentClick?: (agentId: string) => void;
}

export interface DrawerProps {
  agentId: string;
  isOpen: boolean;
  onClose: () => void;
}