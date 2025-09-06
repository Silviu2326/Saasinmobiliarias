export interface ABTest {
  id: string;
  name: string;
  hypothesis: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  createdAt: string;
  startDate?: string;
  endDate?: string;
  variants: {
    id: string;
    name: string;
    description: string;
    trafficPercentage: number;
    metrics: {
      impressions: number;
      clicks: number;
      conversions: number;
      ctr: number;
      conversionRate: number;
    };
  }[];
  goal: {
    metric: 'ctr' | 'openRate' | 'conversions';
    description: string;
  };
  winner?: string;
  significance?: number;
  results?: {
    date: string;
    variantA: {
      impressions: number;
      clicks: number;
      conversions: number;
    };
    variantB: {
      impressions: number;
      clicks: number;
      conversions: number;
    };
  }[];
}

// Mock data for demonstration
const mockTests: ABTest[] = [
  {
    id: '1',
    name: 'Email Subject Line Test',
    hypothesis: 'Un asunto más personalizado aumentará la tasa de apertura',
    status: 'active',
    createdAt: '2025-01-15T10:00:00Z',
    startDate: '2025-01-20T00:00:00Z',
    endDate: '2025-02-20T00:00:00Z',
    variants: [
      {
        id: 'a',
        name: 'Variante A (Control)',
        description: 'Descubre nuestras ofertas exclusivas',
        trafficPercentage: 50,
        metrics: {
          impressions: 1500,
          clicks: 240,
          conversions: 36,
          ctr: 16.0,
          conversionRate: 15.0
        }
      },
      {
        id: 'b',
        name: 'Variante B',
        description: 'Juan, ofertas personalizadas para ti',
        trafficPercentage: 50,
        metrics: {
          impressions: 1450,
          clicks: 290,
          conversions: 52,
          ctr: 20.0,
          conversionRate: 17.9
        }
      }
    ],
    goal: {
      metric: 'openRate',
      description: 'Tasa de apertura de emails'
    },
    winner: 'b',
    significance: 95.2,
    results: [
      {
        date: '2025-01-21',
        variantA: { impressions: 150, clicks: 24, conversions: 3 },
        variantB: { impressions: 145, clicks: 29, conversions: 5 }
      },
      {
        date: '2025-01-22',
        variantA: { impressions: 180, clicks: 28, conversions: 4 },
        variantB: { impressions: 175, clicks: 35, conversions: 6 }
      }
    ]
  },
  {
    id: '2',
    name: 'Landing Page CTA Button',
    hypothesis: 'Un botón de CTA en verde convertirá mejor que en azul',
    status: 'completed',
    createdAt: '2025-01-10T08:30:00Z',
    startDate: '2025-01-12T00:00:00Z',
    endDate: '2025-01-26T00:00:00Z',
    variants: [
      {
        id: 'a',
        name: 'Variante A (Control)',
        description: 'Botón azul "Solicitar información"',
        trafficPercentage: 50,
        metrics: {
          impressions: 2800,
          clicks: 168,
          conversions: 25,
          ctr: 6.0,
          conversionRate: 14.9
        }
      },
      {
        id: 'b',
        name: 'Variante B',
        description: 'Botón verde "Obtener mi valoración gratis"',
        trafficPercentage: 50,
        metrics: {
          impressions: 2750,
          clicks: 192,
          conversions: 31,
          ctr: 7.0,
          conversionRate: 16.1
        }
      }
    ],
    goal: {
      metric: 'conversions',
      description: 'Conversiones de formulario'
    },
    winner: 'b',
    significance: 92.1
  },
  {
    id: '3',
    name: 'WhatsApp Message Template',
    hypothesis: 'Un mensaje más casual generará más respuestas',
    status: 'draft',
    createdAt: '2025-01-25T14:20:00Z',
    variants: [
      {
        id: 'a',
        name: 'Variante A (Control)',
        description: 'Mensaje formal institucional',
        trafficPercentage: 50,
        metrics: {
          impressions: 0,
          clicks: 0,
          conversions: 0,
          ctr: 0,
          conversionRate: 0
        }
      },
      {
        id: 'b',
        name: 'Variante B',
        description: 'Mensaje casual y personalizado',
        trafficPercentage: 50,
        metrics: {
          impressions: 0,
          clicks: 0,
          conversions: 0,
          ctr: 0,
          conversionRate: 0
        }
      }
    ],
    goal: {
      metric: 'ctr',
      description: 'Tasa de respuesta'
    }
  }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const abTestingService = {
  async getTests(): Promise<ABTest[]> {
    await delay(500);
    return [...mockTests];
  },

  async getTestById(id: string): Promise<ABTest | null> {
    await delay(300);
    const test = mockTests.find(t => t.id === id);
    return test ? { ...test } : null;
  },

  async createTest(testData: Omit<ABTest, 'id' | 'createdAt'>): Promise<ABTest> {
    await delay(800);
    const newTest: ABTest = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...testData
    };
    mockTests.push(newTest);
    return { ...newTest };
  },

  async updateTest(id: string, updates: Partial<ABTest>): Promise<ABTest | null> {
    await delay(600);
    const index = mockTests.findIndex(t => t.id === id);
    if (index === -1) return null;
    
    mockTests[index] = { ...mockTests[index], ...updates };
    return { ...mockTests[index] };
  },

  async deleteTest(id: string): Promise<boolean> {
    await delay(400);
    const index = mockTests.findIndex(t => t.id === id);
    if (index === -1) return false;
    
    mockTests.splice(index, 1);
    return true;
  },

  async startTest(id: string): Promise<ABTest | null> {
    return this.updateTest(id, { 
      status: 'active', 
      startDate: new Date().toISOString() 
    });
  },

  async pauseTest(id: string): Promise<ABTest | null> {
    return this.updateTest(id, { status: 'paused' });
  },

  async completeTest(id: string): Promise<ABTest | null> {
    return this.updateTest(id, { 
      status: 'completed', 
      endDate: new Date().toISOString() 
    });
  }
};