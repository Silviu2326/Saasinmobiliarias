import { 
  ActivityPoint, 
  ResponseStats, 
  SlaStats, 
  TasksStats, 
  FieldStats, 
  PipelineLoad, 
  LeaderboardRow,
  CapacitySuggestion,
  GroupBy 
} from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

interface ProductivityFilters {
  from?: string;
  to?: string;
  office?: string;
  team?: string;
  agent?: string;
  canal?: string;
  tipo?: string;
  portal?: string;
  campaña?: string;
  dayStartHour?: number;
  groupBy?: GroupBy;
}

// Simulated API responses
const simulateApiResponse = <T>(data: T, delay = 300): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

// Activity and times
export async function fetchProductivityActivity(filters: ProductivityFilters): Promise<ActivityPoint[]> {
  const params = new URLSearchParams(filters as any);
  
  // Simulated data
  const mockData: ActivityPoint[] = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    calls: Math.floor(Math.random() * 50) + 20,
    emails: Math.floor(Math.random() * 100) + 30,
    messages: Math.floor(Math.random() * 150) + 50,
    tasksDone: Math.floor(Math.random() * 30) + 10,
    visits: Math.floor(Math.random() * 15) + 5
  }));

  return simulateApiResponse(mockData);
}

export async function fetchResponseTimes(filters: ProductivityFilters): Promise<ResponseStats[]> {
  const params = new URLSearchParams(filters as any);
  
  // Simulated data
  const mockData: ResponseStats[] = [
    {
      agentId: '1',
      agentName: 'Ana García',
      p50FirstContact: 2.5,
      p90FirstContact: 8,
      p50FirstVisit: 24,
      p90FirstVisit: 72,
      p50ToOffer: 48,
      p90ToOffer: 120
    },
    {
      agentId: '2',
      agentName: 'Carlos López',
      p50FirstContact: 3,
      p90FirstContact: 10,
      p50FirstVisit: 36,
      p90FirstVisit: 96,
      p50ToOffer: 60,
      p90ToOffer: 144
    },
    {
      agentId: '3',
      agentName: 'María Rodríguez',
      p50FirstContact: 1.5,
      p90FirstContact: 6,
      p50FirstVisit: 18,
      p90FirstVisit: 48,
      p50ToOffer: 36,
      p90ToOffer: 96
    }
  ];

  return simulateApiResponse(mockData);
}

export async function fetchSlaCompliance(
  filters: ProductivityFilters & { xh?: number; yd?: number }
): Promise<SlaStats> {
  const params = new URLSearchParams(filters as any);
  
  // Simulated data
  const mockData: SlaStats = {
    contactSlaPct: 87.5,
    followupSlaPct: 92.3,
    breaches: 23,
    topBreaches: [
      { id: '1', ref: 'LEAD-1234', hoursLate: 4.5, agentName: 'Ana García' },
      { id: '2', ref: 'LEAD-1235', hoursLate: 3.2, agentName: 'Carlos López' },
      { id: '3', ref: 'LEAD-1236', hoursLate: 2.8, agentName: 'María Rodríguez' },
      { id: '4', ref: 'LEAD-1237', hoursLate: 2.1, agentName: 'Juan Martín' },
      { id: '5', ref: 'LEAD-1238', hoursLate: 1.9, agentName: 'Ana García' }
    ]
  };

  return simulateApiResponse(mockData);
}

export async function fetchTasksStats(filters: ProductivityFilters): Promise<TasksStats[]> {
  const params = new URLSearchParams(filters as any);
  
  // Simulated data
  const mockData: TasksStats[] = [
    { agentId: '1', agentName: 'Ana García', created: 45, completed: 40, onTime: 35, late: 5, avgDelayDays: 1.2 },
    { agentId: '2', agentName: 'Carlos López', created: 38, completed: 32, onTime: 28, late: 4, avgDelayDays: 0.8 },
    { agentId: '3', agentName: 'María Rodríguez', created: 52, completed: 48, onTime: 44, late: 4, avgDelayDays: 0.6 },
    { agentId: '4', agentName: 'Juan Martín', created: 41, completed: 36, onTime: 31, late: 5, avgDelayDays: 1.5 },
    { agentId: '5', agentName: 'Laura Sánchez', created: 37, completed: 33, onTime: 30, late: 3, avgDelayDays: 0.4 }
  ];

  return simulateApiResponse(mockData);
}

// Field and pipeline
export async function fetchFieldStats(filters: ProductivityFilters): Promise<FieldStats> {
  const params = new URLSearchParams(filters as any);
  
  // Simulated data
  const mockData: FieldStats = {
    checkins: 245,
    plannedVisits: 120,
    doneVisits: 108,
    routeHours: 186,
    kms: 2450
  };

  return simulateApiResponse(mockData);
}

export async function fetchPipelineLoad(filters: ProductivityFilters): Promise<PipelineLoad[]> {
  const params = new URLSearchParams(filters as any);
  
  // Simulated data
  const mockData: PipelineLoad[] = [
    {
      agentId: '1',
      agentName: 'Ana García',
      activeLeads: 42,
      openDeals: 12,
      avgAgeDays: 15,
      byStage: [
        { stage: 'Contacto inicial', count: 18, avgAgeDays: 3 },
        { stage: 'Cualificación', count: 12, avgAgeDays: 8 },
        { stage: 'Visita', count: 8, avgAgeDays: 12 },
        { stage: 'Oferta', count: 4, avgAgeDays: 20 }
      ],
      overloaded: false
    },
    {
      agentId: '2',
      agentName: 'Carlos López',
      activeLeads: 68,
      openDeals: 18,
      avgAgeDays: 22,
      byStage: [
        { stage: 'Contacto inicial', count: 28, avgAgeDays: 5 },
        { stage: 'Cualificación', count: 20, avgAgeDays: 12 },
        { stage: 'Visita', count: 14, avgAgeDays: 18 },
        { stage: 'Oferta', count: 6, avgAgeDays: 28 }
      ],
      overloaded: true
    },
    {
      agentId: '3',
      agentName: 'María Rodríguez',
      activeLeads: 35,
      openDeals: 10,
      avgAgeDays: 12,
      byStage: [
        { stage: 'Contacto inicial', count: 14, avgAgeDays: 2 },
        { stage: 'Cualificación', count: 10, avgAgeDays: 6 },
        { stage: 'Visita', count: 7, avgAgeDays: 10 },
        { stage: 'Oferta', count: 4, avgAgeDays: 18 }
      ],
      overloaded: false
    }
  ];

  return simulateApiResponse(mockData);
}

// Ranking / Detail
export async function fetchLeaderboard(
  filters: ProductivityFilters & { metric?: 'activity' | 'results' }
): Promise<LeaderboardRow[]> {
  const params = new URLSearchParams(filters as any);
  
  // Simulated data
  const mockData: LeaderboardRow[] = [
    {
      agentId: '1',
      agentName: 'Ana García',
      score: 92,
      activities: 245,
      firstContactP50: 2.5,
      visits: 28,
      offers: 15,
      contracts: 8,
      slaPct: 94
    },
    {
      agentId: '3',
      agentName: 'María Rodríguez',
      score: 88,
      activities: 312,
      firstContactP50: 1.5,
      visits: 35,
      offers: 18,
      contracts: 10,
      slaPct: 96
    },
    {
      agentId: '2',
      agentName: 'Carlos López',
      score: 78,
      activities: 198,
      firstContactP50: 3.0,
      visits: 22,
      offers: 12,
      contracts: 5,
      slaPct: 85
    },
    {
      agentId: '4',
      agentName: 'Juan Martín',
      score: 75,
      activities: 176,
      firstContactP50: 3.5,
      visits: 20,
      offers: 10,
      contracts: 4,
      slaPct: 82
    },
    {
      agentId: '5',
      agentName: 'Laura Sánchez',
      score: 72,
      activities: 165,
      firstContactP50: 4.0,
      visits: 18,
      offers: 9,
      contracts: 3,
      slaPct: 80
    }
  ];

  return simulateApiResponse(mockData);
}

export async function fetchAgentDetail(
  agentId: string,
  filters: { from?: string; to?: string }
): Promise<any> {
  const params = new URLSearchParams(filters as any);
  
  // Simulated data
  const mockData = {
    agent: {
      id: agentId,
      name: 'Ana García',
      team: 'Ventas Madrid',
      office: 'Madrid Centro'
    },
    stats: {
      totalActivities: 245,
      callsCompleted: 120,
      emailsSent: 85,
      tasksCompleted: 40,
      visitsCompleted: 28,
      offersCreated: 15,
      contractsSigned: 8
    },
    recentActivities: [
      { id: '1', type: 'call', ref: 'LEAD-1234', time: '10:30', duration: '5 min' },
      { id: '2', type: 'email', ref: 'LEAD-1235', time: '11:15', subject: 'Propuesta comercial' },
      { id: '3', type: 'visit', ref: 'LEAD-1236', time: '15:00', location: 'Calle Mayor 15' },
      { id: '4', type: 'task', ref: 'TASK-456', time: '16:30', description: 'Enviar documentación' },
      { id: '5', type: 'call', ref: 'LEAD-1237', time: '17:00', duration: '8 min' }
    ],
    pendingTasks: [
      { id: '1', ref: 'TASK-457', description: 'Llamar a cliente potencial', due: '2024-01-15 10:00' },
      { id: '2', ref: 'TASK-458', description: 'Preparar oferta', due: '2024-01-15 14:00' },
      { id: '3', ref: 'TASK-459', description: 'Visita de seguimiento', due: '2024-01-16 11:00' }
    ]
  };

  return simulateApiResponse(mockData);
}

// Capacity
export async function fetchCapacityPlan(payload: {
  demanda: number;
  objetivos: any;
  limites: any;
}): Promise<CapacitySuggestion[]> {
  // Simulated data
  const mockData: CapacitySuggestion[] = [
    {
      moveFrom: 'Carlos López',
      moveTo: 'María Rodríguez',
      leads: 15,
      reason: 'Carlos tiene 68 leads activos vs. María con 35. Equilibrar carga.'
    },
    {
      moveFrom: 'Ana García',
      moveTo: 'Laura Sánchez',
      leads: 8,
      reason: 'Laura tiene capacidad adicional para 8 leads más sin sobrecarga.'
    }
  ];

  return simulateApiResponse(mockData);
}

// Export
export async function exportProductivityData(format: 'CSV' | 'JSON' | 'PNG', data: any): Promise<Blob> {
  // Simulated export
  if (format === 'CSV') {
    const csv = 'Agent,Activities,Visits,Offers,Contracts\nAna García,245,28,15,8\nCarlos López,198,22,12,5';
    return new Blob([csv], { type: 'text/csv' });
  } else if (format === 'JSON') {
    return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  } else {
    // PNG would require canvas rendering - returning placeholder
    return new Blob(['PNG data placeholder'], { type: 'image/png' });
  }
}