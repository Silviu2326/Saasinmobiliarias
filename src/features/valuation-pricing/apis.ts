import type {
  Subject,
  Recommendation,
  ElasticityAnalysis,
  DomCurve,
  OfferSimulation,
  NetWaterfall,
  CompetitorRecord,
  MarketBands,
  ChannelRule,
  ChannelPreview,
  Scenario,
  PricePlan,
  AuditEvent,
  Alert,
  PricingMetrics,
  ExportOptions,
  PricingFilters,
  Goal,
  Constraints
} from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";
const DELAY = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data generators
const generateMockRecommendations = (subject: Subject, goal: Goal, constraints: Constraints): Recommendation[] => {
  const basePrice = subject.avmValue || 250000;
  const recommendations: Recommendation[] = [];
  
  // Conservative recommendation
  const conservativePrice = basePrice * 0.95;
  recommendations.push({
    id: 'rec-conservative',
    listPrice: Math.round(conservativePrice),
    anchorPrice: Math.round(conservativePrice * 1.08),
    minAcceptable: Math.max(constraints.minOwner, Math.round(conservativePrice * 0.92)),
    confidence: 'HIGH',
    reasons: [
      'Precio basado en comparables recientes',
      'Alta probabilidad de venta rápida',
      'Evita filtros de búsqueda críticos'
    ],
    domP50: 25,
    closeProb30d: 0.85,
    closeProb60d: 0.95,
    closeProb90d: 0.98,
    expectedNetOwner: Math.round(conservativePrice * 0.88),
    competitivePosition: 'AT'
  });
  
  // Optimistic recommendation
  const optimisticPrice = basePrice * 1.05;
  recommendations.push({
    id: 'rec-optimistic',
    listPrice: Math.round(optimisticPrice),
    anchorPrice: Math.round(optimisticPrice * 1.12),
    minAcceptable: Math.max(constraints.minOwner, Math.round(optimisticPrice * 0.90)),
    confidence: 'MEDIUM',
    reasons: [
      'Mercado favorable en la zona',
      'Características premium del inmueble',
      'Demanda superior a la oferta'
    ],
    domP50: 45,
    closeProb30d: 0.65,
    closeProb60d: 0.85,
    closeProb90d: 0.92,
    expectedNetOwner: Math.round(optimisticPrice * 0.87),
    competitivePosition: 'ABOVE'
  });
  
  // Aggressive recommendation (for MAX_PRECIO goal)
  if (goal === 'MAX_PRECIO') {
    const aggressivePrice = basePrice * 1.15;
    recommendations.push({
      id: 'rec-aggressive',
      listPrice: Math.round(aggressivePrice),
      anchorPrice: Math.round(aggressivePrice * 1.15),
      minAcceptable: Math.max(constraints.minOwner, Math.round(aggressivePrice * 0.88)),
      confidence: 'LOW',
      reasons: [
        'Maximización de ingresos',
        'Propiedad única en el mercado',
        'Margen para negociación'
      ],
      domP50: 85,
      closeProb30d: 0.35,
      closeProb60d: 0.65,
      closeProb90d: 0.80,
      expectedNetOwner: Math.round(aggressivePrice * 0.85),
      competitivePosition: 'ABOVE',
      riskFactors: [
        'Tiempo de venta extendido',
        'Posible pérdida de compradores',
        'Requiere estrategia de escalones'
      ]
    });
  }
  
  return recommendations;
};

const generateElasticityData = (subject: Subject): ElasticityAnalysis => {
  const basePrice = subject.avmValue || 250000;
  const points = [];
  
  // Generate elasticity curve points
  for (let i = 0.8; i <= 1.3; i += 0.05) {
    const price = Math.round(basePrice * i);
    const baseDemand = 100;
    const elasticity = -1.2; // Typical real estate elasticity
    const demand = Math.max(5, baseDemand * Math.pow(i, elasticity) + (Math.random() - 0.5) * 10);
    
    points.push({
      price,
      demand: Math.round(demand),
      demandLow: Math.round(demand * 0.85),
      demandHigh: Math.round(demand * 1.15),
      visits: Math.round(demand * 0.3),
      leads: Math.round(demand * 0.15),
      offers: Math.round(demand * 0.05)
    });
  }
  
  return {
    points,
    elasticityCoeff: -1.2,
    optimalPrice: Math.round(basePrice * 0.98),
    confidenceInterval: {
      low: 0.75,
      high: 0.92
    },
    r2Score: 0.87,
    lastUpdated: new Date().toISOString()
  };
};

const generateDomCurve = (subject: Subject): DomCurve => {
  const basePrice = subject.avmValue || 250000;
  const points = [];
  
  // Generate DOM curve points
  for (let i = 0.85; i <= 1.2; i += 0.025) {
    const price = Math.round(basePrice * i);
    const baseDom = 30;
    const domMultiplier = Math.pow((i - 0.8) / 0.4, 2.5); // Non-linear increase
    const p50 = Math.round(baseDom * domMultiplier + (Math.random() - 0.5) * 5);
    const p90 = Math.round(p50 * 2.2);
    const p10 = Math.round(p50 * 0.4);
    
    points.push({
      price,
      p50: Math.max(5, p50),
      p90: Math.max(10, p90),
      p10: Math.max(1, p10),
      sampleSize: Math.floor(Math.random() * 50) + 20
    });
  }
  
  return {
    points,
    targetDom: 45,
    marketMedian: 38,
    lastUpdated: new Date().toISOString()
  };
};

const generateOfferSimulation = (price: number, goal: Goal): OfferSimulation => {
  const baseOfferRatio = goal === 'RAPIDEZ' ? 0.95 : goal === 'EQUILIBRIO' ? 0.92 : 0.88;
  const expectedOfferPrice = price * baseOfferRatio;
  
  return {
    price,
    probAboveMin: goal === 'RAPIDEZ' ? 0.85 : goal === 'EQUILIBRIO' ? 0.75 : 0.65,
    probClose30: goal === 'RAPIDEZ' ? 0.75 : goal === 'EQUILIBRIO' ? 0.60 : 0.45,
    probClose60: goal === 'RAPIDEZ' ? 0.92 : goal === 'EQUILIBRIO' ? 0.85 : 0.70,
    probClose90: goal === 'RAPIDEZ' ? 0.98 : goal === 'EQUILIBRIO' ? 0.95 : 0.88,
    expectedDiscountPct: (1 - baseOfferRatio) * 100,
    expectedOffers: goal === 'RAPIDEZ' ? 3.2 : goal === 'EQUILIBRIO' ? 2.1 : 1.4,
    offerDistribution: [
      {
        range: `${Math.round(price * 0.85)}-${Math.round(price * 0.90)}`,
        probability: 0.25,
        avgAmount: Math.round(price * 0.875)
      },
      {
        range: `${Math.round(price * 0.90)}-${Math.round(price * 0.95)}`,
        probability: 0.45,
        avgAmount: Math.round(price * 0.925)
      },
      {
        range: `${Math.round(price * 0.95)}-${Math.round(price * 1.00)}`,
        probability: 0.25,
        avgAmount: Math.round(price * 0.975)
      },
      {
        range: `≥${Math.round(price)}`,
        probability: 0.05,
        avgAmount: Math.round(price * 1.02)
      }
    ],
    negotiationRounds: goal === 'RAPIDEZ' ? 1.5 : goal === 'EQUILIBRIO' ? 2.2 : 3.1,
    timeToDecision: goal === 'RAPIDEZ' ? 48 : goal === 'EQUILIBRIO' ? 72 : 120
  };
};

const generateNetWaterfall = (price: number): NetWaterfall => {
  const agencyFee = price * 0.03; // 3% agency fee
  const notaryFee = 1200;
  const registryFee = 800;
  const itp = price * 0.006; // 0.6% ITP approximation
  const mortgage = price * 0.4; // 40% pending mortgage
  
  const items = [
    {
      label: 'Precio de venta',
      amount: price,
      percentage: 100,
      kind: 'net' as const,
      description: 'Precio bruto de venta'
    },
    {
      label: 'Honorarios agencia',
      amount: -agencyFee,
      percentage: -3,
      kind: 'fee' as const,
      description: 'Comisión comercial'
    },
    {
      label: 'Gastos notariales',
      amount: -notaryFee,
      kind: 'cost' as const,
      description: 'Notaría y registro'
    },
    {
      label: 'Registro propiedad',
      amount: -registryFee,
      kind: 'cost' as const,
      description: 'Inscripción registral'
    },
    {
      label: 'ITP',
      amount: -itp,
      percentage: -0.6,
      kind: 'tax' as const,
      description: 'Impuesto transmisiones',
      optional: true
    },
    {
      label: 'Cancelación hipoteca',
      amount: -mortgage,
      percentage: -40,
      kind: 'cost' as const,
      description: 'Hipoteca pendiente'
    }
  ];
  
  const netOwner = price - agencyFee - notaryFee - registryFee - itp - mortgage;
  
  return {
    price,
    grossAmount: price,
    items,
    netOwner: Math.max(0, netOwner),
    effectiveYield: netOwner / price,
    breakdownByCategory: {
      fee: agencyFee,
      cost: notaryFee + registryFee + mortgage,
      tax: itp,
      net: netOwner
    },
    lastUpdated: new Date().toISOString()
  };
};

const generateCompetitors = (subject: Subject): CompetitorRecord[] => {
  const competitors: CompetitorRecord[] = [];
  const basePrice = subject.avmValue || 250000;
  
  for (let i = 0; i < 8; i++) {
    const priceVariation = 0.85 + Math.random() * 0.3; // ±15% variation
    const price = Math.round(basePrice * priceVariation);
    const area = subject.area + (Math.random() - 0.5) * 20;
    
    competitors.push({
      id: `comp-${i + 1}`,
      title: `Inmueble comparable ${i + 1}`,
      address: `Calle Competidor ${i + 1}, ${subject.city || 'Madrid'}`,
      distance: Math.round(Math.random() * 1500 + 200), // 200-1700m
      price,
      ppsqm: Math.round(price / area),
      area: Math.round(area),
      rooms: subject.rooms + Math.floor((Math.random() - 0.5) * 2),
      dom: Math.floor(Math.random() * 120 + 5),
      lastPriceChange: Math.random() > 0.6 ? {
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        oldPrice: Math.round(price * 1.05),
        newPrice: price,
        changePercent: -4.8
      } : undefined,
      visits: Math.floor(Math.random() * 50 + 10),
      leads: Math.floor(Math.random() * 15 + 2),
      status: ['ACTIVE', 'UNDER_OFFER', 'SOLD'][Math.floor(Math.random() * 3)] as any,
      url: `https://idealista.com/inmueble/${i + 1}`,
      source: ['IDEALISTA', 'FOTOCASA', 'HABITACLIA'][Math.floor(Math.random() * 3)] as any,
      similarity: Math.random() * 0.3 + 0.7, // 70-100% similarity
      photos: Math.floor(Math.random() * 20 + 5),
      lastSeen: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
    });
  }
  
  return competitors;
};

const generateChannelRules = (): ChannelRule[] => [
  {
    channel: 'idealista',
    name: 'Idealista',
    rounding: '95',
    marginPct: 0,
    currency: 'EUR',
    minStep: 5000,
    maxPhotos: 50,
    requiresDescription: true,
    feeStructure: {
      listingFee: 300,
      successFee: 2.5
    },
    active: true
  },
  {
    channel: 'fotocasa',
    name: 'Fotocasa',
    rounding: '000',
    currency: 'EUR',
    minStep: 1000,
    maxPhotos: 30,
    requiresDescription: true,
    feeStructure: {
      monthlyFee: 150
    },
    active: true
  },
  {
    channel: 'habitaclia',
    name: 'Habitaclia',
    rounding: '99',
    currency: 'EUR',
    minStep: 1000,
    maxPhotos: 25,
    feeStructure: {
      listingFee: 200,
      successFee: 2.0
    },
    active: true
  },
  {
    channel: 'yaencontre',
    name: 'Yaencontré',
    rounding: 'NONE',
    currency: 'EUR',
    minStep: 500,
    maxPhotos: 40,
    active: false
  }
];

// API Functions
export const getSubject = async (propertyId: string): Promise<Subject> => {
  await DELAY(300);
  
  return {
    id: propertyId,
    address: 'Calle Ejemplo 123, Madrid',
    area: 95,
    rooms: 3,
    bathrooms: 2,
    propertyType: 'apartment',
    condition: 'good',
    buildingYear: 2005,
    coordinates: [40.4168, -3.7038],
    neighborhood: 'Chamberí',
    postalCode: '28010',
    city: 'Madrid',
    province: 'Madrid',
    features: ['terraza', 'ascensor', 'calefaccion'],
    avmValue: 285000,
    avmRange: {
      low: 270000,
      high: 300000,
      confidence: 0.87
    },
    lastUpdated: new Date().toISOString()
  };
};

export const refreshSubjectFromAvm = async (propertyId: string): Promise<Subject> => {
  await DELAY(800);
  return getSubject(propertyId);
};

export const getPricingSuggestions = async (
  subject: Subject, 
  goal: Goal, 
  constraints: Constraints
): Promise<Recommendation[]> => {
  await DELAY(600);
  return generateMockRecommendations(subject, goal, constraints);
};

export const applyRecommendation = async (
  recommendationId: string,
  scenarioId: string
): Promise<{ success: boolean; scenarioId: string }> => {
  await DELAY(400);
  return {
    success: true,
    scenarioId: `scenario-${Date.now()}`
  };
};

export const getElasticityAnalysis = async (subject: Subject): Promise<ElasticityAnalysis> => {
  await DELAY(700);
  return generateElasticityData(subject);
};

export const getDomCurve = async (subject: Subject): Promise<DomCurve> => {
  await DELAY(500);
  return generateDomCurve(subject);
};

export const simulateOffers = async (
  price: number, 
  goal: Goal, 
  constraints: Constraints
): Promise<OfferSimulation> => {
  await DELAY(600);
  return generateOfferSimulation(price, goal);
};

export const calculateNetWaterfall = async (price: number, propertyId?: string): Promise<NetWaterfall> => {
  await DELAY(300);
  return generateNetWaterfall(price);
};

export const getCompetitors = async (filters: {
  lat?: number;
  lng?: number;
  radius?: number;
  type?: string;
  sqm?: number;
  state?: string;
}): Promise<CompetitorRecord[]> => {
  await DELAY(800);
  // In real implementation, would filter based on parameters
  const mockSubject: Subject = {
    id: 'mock',
    address: 'Mock',
    area: filters.sqm || 95,
    rooms: 3,
    bathrooms: 2,
    propertyType: filters.type || 'apartment',
    condition: 'good',
    buildingYear: 2005,
    city: 'Madrid',
    avmValue: 285000
  };
  return generateCompetitors(mockSubject);
};

export const getMarketBands = async (filters: {
  lat?: number;
  lng?: number;
  type?: string;
}): Promise<MarketBands> => {
  await DELAY(450);
  
  return {
    area: 'Chamberí, Madrid',
    propertyType: filters.type || 'apartment',
    sampleSize: 147,
    pricePerM2: {
      p25: 2850,
      p50: 3200,
      p75: 3650,
      p90: 4100,
      p95: 4500
    },
    totalPrice: {
      p25: 240000,
      p50: 285000,
      p75: 340000,
      p90: 420000,
      p95: 500000
    },
    subjectPosition: {
      pricePercentile: 52,
      band: 'P50_P75'
    },
    lastUpdated: new Date().toISOString()
  };
};

export const getChannels = async (): Promise<ChannelRule[]> => {
  await DELAY(200);
  return generateChannelRules();
};

export const previewChannelPricing = async (
  price: number,
  channels: string[]
): Promise<ChannelPreview[]> => {
  await DELAY(400);
  const rules = generateChannelRules().filter(r => channels.includes(r.channel));
  
  return rules.map(rule => {
    let displayPrice = price;
    
    // Apply rounding
    switch (rule.rounding) {
      case '99':
        displayPrice = Math.floor(displayPrice / 1000) * 1000 + 999;
        break;
      case '95':
        displayPrice = Math.floor(displayPrice / 1000) * 1000 + 995;
        break;
      case '000':
        displayPrice = Math.round(displayPrice / 1000) * 1000;
        break;
    }
    
    // Apply margin
    if (rule.marginPct) {
      displayPrice *= (1 + rule.marginPct / 100);
    }
    
    return {
      channel: rule.channel,
      displayPrice: Math.round(displayPrice),
      originalPrice: price,
      adjustments: {
        rounding: displayPrice - price,
        margin: rule.marginPct ? price * (rule.marginPct / 100) : 0,
        fees: rule.feeStructure?.listingFee || 0
      },
      estimatedReach: Math.floor(Math.random() * 50000 + 10000),
      competitorCount: Math.floor(Math.random() * 25 + 5),
      avgDom: Math.floor(Math.random() * 30 + 35)
    };
  });
};

export const applyToChannels = async (
  propertyId: string,
  channelPricing: ChannelPreview[]
): Promise<{ success: boolean; publishedChannels: string[] }> => {
  await DELAY(1200);
  return {
    success: true,
    publishedChannels: channelPricing.map(cp => cp.channel)
  };
};

export const getScenarios = async (propertyId?: string): Promise<Scenario[]> => {
  await DELAY(400);
  
  const baseScenario: Scenario = {
    id: 'scenario-baseline',
    name: 'Baseline',
    type: 'BASELINE',
    goal: 'EQUILIBRIO',
    constraints: {
      minOwner: 260000,
      bankAppraisal: 300000
    },
    listPrice: 285000,
    anchorPrice: 308000,
    minAcceptable: 265000,
    expectedOutcome: {
      domP50: 42,
      closeProb60d: 0.78,
      netOwner: 245000,
      totalRevenue: 285000
    },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    lastModified: new Date().toISOString(),
    createdBy: 'usuario-actual',
    isBaseline: true
  };
  
  return [baseScenario];
};

export const createScenario = async (scenario: Partial<Scenario>): Promise<Scenario> => {
  await DELAY(500);
  
  return {
    id: `scenario-${Date.now()}`,
    name: scenario.name || 'Nuevo Escenario',
    type: scenario.type || 'PERSONALIZADO',
    goal: scenario.goal || 'EQUILIBRIO',
    constraints: scenario.constraints || { minOwner: 250000 },
    listPrice: scenario.listPrice || 285000,
    anchorPrice: scenario.anchorPrice || 308000,
    minAcceptable: scenario.minAcceptable || 265000,
    expectedOutcome: {
      domP50: 45,
      closeProb60d: 0.75,
      netOwner: 240000,
      totalRevenue: scenario.listPrice || 285000
    },
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    createdBy: 'usuario-actual'
  };
};

export const createPricePlan = async (plan: Partial<PricePlan>): Promise<PricePlan> => {
  await DELAY(600);
  
  return {
    id: `plan-${Date.now()}`,
    propertyId: plan.propertyId || 'property-1',
    scenarioId: plan.scenarioId || 'scenario-1',
    steps: plan.steps || [],
    currentStep: 0,
    nextReviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    autoExecute: plan.autoExecute || false,
    notifications: plan.notifications || {
      email: true,
      sms: false,
      dashboard: true
    },
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  };
};

export const getAuditLog = async (propertyId?: string): Promise<AuditEvent[]> => {
  await DELAY(350);
  
  const events: AuditEvent[] = [];
  const actions = [
    'Precio actualizado',
    'Escenario creado',
    'Recomendación aplicada',
    'Simulación ejecutada',
    'Canal actualizado'
  ];
  
  for (let i = 0; i < 15; i++) {
    events.push({
      id: `audit-${i + 1}`,
      at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      user: `user-${Math.floor(Math.random() * 3) + 1}`,
      userName: ['Ana García', 'Carlos López', 'María Rodríguez'][Math.floor(Math.random() * 3)],
      action: actions[Math.floor(Math.random() * actions.length)],
      category: ['PRICE_CHANGE', 'SCENARIO', 'CHANNEL', 'SIMULATION'][Math.floor(Math.random() * 4)] as any,
      payload: {
        oldPrice: 280000,
        newPrice: 275000,
        reason: 'Ajuste de mercado'
      },
      ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`
    });
  }
  
  return events.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
};

export const createAuditEvent = async (event: Partial<AuditEvent>): Promise<AuditEvent> => {
  await DELAY(200);
  
  return {
    id: `audit-${Date.now()}`,
    at: new Date().toISOString(),
    user: event.user || 'current-user',
    userName: event.userName || 'Usuario Actual',
    action: event.action || 'Acción realizada',
    category: event.category || 'PRICE_CHANGE',
    payload: event.payload,
    oldValue: event.oldValue,
    newValue: event.newValue,
    reason: event.reason,
    ipAddress: '192.168.1.100'
  };
};

export const exportPricingData = async (
  propertyId: string,
  options: ExportOptions
): Promise<{ success: boolean; downloadUrl: string; filename: string }> => {
  await DELAY(2000); // Simulate longer processing for export
  
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `pricing-${propertyId}-${timestamp}.${options.format.toLowerCase()}`;
  
  return {
    success: true,
    downloadUrl: `/downloads/${filename}`,
    filename
  };
};

export const getPricingMetrics = async (
  propertyId: string,
  dateFrom: string,
  dateTo: string
): Promise<PricingMetrics> => {
  await DELAY(600);
  
  return {
    propertyId,
    period: { from: dateFrom, to: dateTo },
    priceHistory: [
      {
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        price: 295000,
        reason: 'Precio inicial'
      },
      {
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        price: 285000,
        reason: 'Ajuste estratégico'
      },
      {
        date: new Date().toISOString().split('T')[0],
        price: 275000,
        reason: 'Respuesta al mercado'
      }
    ],
    performanceMetrics: {
      avgDom: 38,
      totalVisits: 127,
      totalLeads: 23,
      totalOffers: 4,
      conversionRate: 0.18,
      avgOfferRatio: 0.93
    },
    competitorComparison: {
      similarProperties: 12,
      avgCompetitorPrice: 282000,
      priceAdvantage: -2.5,
      marketShare: 0.08
    },
    forecast: {
      expectedSaleDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      expectedPrice: 272000,
      confidence: 0.78
    }
  };
};