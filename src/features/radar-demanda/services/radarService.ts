export interface RadarConfig {
  id?: string;
  keywords: string[];
  competitors: string[];
  sources: string[];
  alertsEnabled: boolean;
  emailNotifications: boolean;
}

export interface TrendData {
  keyword: string;
  data: {
    date: string;
    value: number;
    relatedQueries?: string[];
  }[];
  totalSearches: number;
  growthRate: number;
}

export interface SocialMention {
  id: string;
  platform: 'twitter' | 'reddit' | 'linkedin' | 'instagram';
  content: string;
  author: string;
  createdAt: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  engagement: {
    likes: number;
    shares: number;
    comments: number;
  };
  url: string;
}

export interface ContentItem {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  category: string;
  engagement: {
    shares: number;
    comments: number;
    views: number;
  };
  excerpt: string;
  tags: string[];
}

export interface RadarDashboardData {
  trends: TrendData[];
  socialMentions: SocialMention[];
  content: ContentItem[];
  alerts: {
    id: string;
    type: 'trend_spike' | 'mention_surge' | 'content_viral';
    message: string;
    severity: 'low' | 'medium' | 'high';
    createdAt: string;
  }[];
}

// Mock data for demonstration
const mockConfig: RadarConfig = {
  keywords: ['inmobiliaria', 'vivienda madrid', 'comprar casa', 'inversión inmobiliaria'],
  competitors: ['idealista', 'fotocasa', 'habitaclia'],
  sources: ['expansion.com', 'eleconomista.es', 'abc.es'],
  alertsEnabled: true,
  emailNotifications: true
};

const generateMockTrends = (keywords: string[]): TrendData[] => {
  return keywords.map(keyword => ({
    keyword,
    totalSearches: Math.floor(Math.random() * 100000) + 10000,
    growthRate: (Math.random() - 0.5) * 20,
    data: Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        value: Math.floor(Math.random() * 100) + 20,
        relatedQueries: [
          `${keyword} precio`,
          `${keyword} zona norte`,
          `${keyword} 2025`
        ]
      };
    })
  }));
};

const generateMockSocialMentions = (keywords: string[]): SocialMention[] => {
  const platforms: SocialMention['platform'][] = ['twitter', 'reddit', 'linkedin', 'instagram'];
  const sentiments: SocialMention['sentiment'][] = ['positive', 'negative', 'neutral'];
  
  return Array.from({ length: 20 }, (_, i) => ({
    id: `mention_${i}`,
    platform: platforms[Math.floor(Math.random() * platforms.length)],
    content: `Interesante análisis sobre ${keywords[Math.floor(Math.random() * keywords.length)]}. El mercado está evolucionando rápidamente y hay nuevas oportunidades surgiendo.`,
    author: `Usuario${i + 1}`,
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
    engagement: {
      likes: Math.floor(Math.random() * 500),
      shares: Math.floor(Math.random() * 100),
      comments: Math.floor(Math.random() * 50)
    },
    url: `https://example.com/post/${i}`
  }));
};

const generateMockContent = (): ContentItem[] => {
  const sources = ['Expansión', 'El Economista', 'ABC Economía', 'Idealista News', 'Fotocasa Blog'];
  const categories = ['Mercado', 'Inversión', 'Tendencias', 'Análisis', 'Noticias'];
  
  return Array.from({ length: 15 }, (_, i) => ({
    id: `content_${i}`,
    title: `Análisis del mercado inmobiliario: Tendencias ${2025} - Oportunidades de inversión`,
    source: sources[Math.floor(Math.random() * sources.length)],
    url: `https://example.com/article/${i}`,
    publishedAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
    category: categories[Math.floor(Math.random() * categories.length)],
    engagement: {
      shares: Math.floor(Math.random() * 1000),
      comments: Math.floor(Math.random() * 200),
      views: Math.floor(Math.random() * 10000) + 1000
    },
    excerpt: 'El mercado inmobiliario muestra señales de recuperación con un incremento del 15% en las búsquedas de vivienda...',
    tags: ['inmobiliaria', 'inversión', 'tendencias', 'madrid']
  }));
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const radarService = {
  // Configuration endpoints
  async getRadarConfig(): Promise<RadarConfig> {
    await delay(300);
    return { ...mockConfig };
  },

  async saveRadarConfig(config: RadarConfig): Promise<RadarConfig> {
    await delay(500);
    return { ...config, id: Date.now().toString() };
  },

  // Data endpoints
  async getTrendsData(keywords?: string[], dateRange?: { start: string; end: string }): Promise<TrendData[]> {
    await delay(800);
    const keywordsToUse = keywords || mockConfig.keywords;
    return generateMockTrends(keywordsToUse);
  },

  async getSocialMentions(keywords?: string[], dateRange?: { start: string; end: string }): Promise<SocialMention[]> {
    await delay(600);
    const keywordsToUse = keywords || mockConfig.keywords;
    return generateMockSocialMentions(keywordsToUse);
  },

  async getContentData(topics?: string[], dateRange?: { start: string; end: string }): Promise<ContentItem[]> {
    await delay(700);
    return generateMockContent();
  },

  async getDashboardData(dateRange?: { start: string; end: string }): Promise<RadarDashboardData> {
    await delay(1000);
    
    const [trends, socialMentions, content] = await Promise.all([
      this.getTrendsData(undefined, dateRange),
      this.getSocialMentions(undefined, dateRange),
      this.getContentData(undefined, dateRange)
    ]);

    const alerts = [
      {
        id: 'alert_1',
        type: 'trend_spike' as const,
        message: 'Pico de búsquedas para "vivienda madrid" (+45% en las últimas 24h)',
        severity: 'high' as const,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'alert_2',
        type: 'mention_surge' as const,
        message: 'Incremento de menciones sobre "inversión inmobiliaria" en redes sociales',
        severity: 'medium' as const,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      }
    ];

    return {
      trends,
      socialMentions,
      content,
      alerts
    };
  },

  // Export functionality
  async exportData(type: 'trends' | 'social' | 'content', format: 'csv' | 'json' = 'csv'): Promise<string> {
    await delay(500);
    
    if (format === 'csv') {
      // Mock CSV export
      return 'data:text/csv;charset=utf-8,Keyword,Date,Value,Growth\n' +
             'inmobiliaria,2025-01-15,85,15%\n' +
             'vivienda madrid,2025-01-15,92,8%\n';
    }
    
    return JSON.stringify({ exported: true, timestamp: new Date().toISOString() });
  },

  // Alert management
  async createAlert(keyword: string, threshold: number): Promise<{ success: boolean }> {
    await delay(300);
    return { success: true };
  },

  async getAlerts(): Promise<RadarDashboardData['alerts']> {
    await delay(200);
    return [
      {
        id: 'alert_1',
        type: 'trend_spike',
        message: 'Pico de búsquedas para "vivienda madrid" (+45% en las últimas 24h)',
        severity: 'high',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ];
  }
};