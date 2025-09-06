import { ChatbotConfig, ChatbotFlow } from '../index';

export interface ChatbotAnalytics {
  conversations: number;
  leads: number;
  commonQuestions: string[];
  conversionRate: number;
  averageRating: number;
  monthlyStats: {
    conversations: number;
    leads: number;
    growth: number;
  };
}

export interface ChatbotConversation {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userPhone?: string;
  startTime: string;
  endTime?: string;
  status: 'active' | 'completed' | 'transferred';
  messages: Array<{
    id: string;
    sender: 'bot' | 'user';
    content: string;
    timestamp: string;
    type: 'text' | 'option' | 'form';
  }>;
  rating?: number;
  leadCaptured: boolean;
  source: string;
}

class ChatbotService {
  private readonly baseURL = '/api/chatbot';

  /**
   * Get chatbot configuration
   */
  async getConfig(): Promise<ChatbotConfig> {
    try {
      const response = await fetch(`${this.baseURL}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching chatbot config: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in getConfig:', error);
      // Return mock data for development
      return this.getMockConfig();
    }
  }

  /**
   * Update chatbot general configuration
   */
  async updateConfig(config: Partial<ChatbotConfig>): Promise<ChatbotConfig> {
    try {
      const response = await fetch(`${this.baseURL}/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error(`Error updating chatbot config: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in updateConfig:', error);
      throw error;
    }
  }

  /**
   * Update chatbot appearance settings
   */
  async updateAppearance(appearance: Partial<ChatbotConfig['appearance']>): Promise<ChatbotConfig> {
    try {
      const response = await fetch(`${this.baseURL}/appearance`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ appearance }),
      });

      if (!response.ok) {
        throw new Error(`Error updating chatbot appearance: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in updateAppearance:', error);
      throw error;
    }
  }

  /**
   * Update conversation flows
   */
  async updateFlows(flows: ChatbotFlow[]): Promise<ChatbotConfig> {
    try {
      const response = await fetch(`${this.baseURL}/flows`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ flows }),
      });

      if (!response.ok) {
        throw new Error(`Error updating chatbot flows: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in updateFlows:', error);
      throw error;
    }
  }

  /**
   * Toggle chatbot active status
   */
  async toggleStatus(isActive: boolean): Promise<ChatbotConfig> {
    try {
      const response = await fetch(`${this.baseURL}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) {
        throw new Error(`Error toggling chatbot status: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in toggleStatus:', error);
      throw error;
    }
  }

  /**
   * Get chatbot analytics
   */
  async getAnalytics(timeRange: '7d' | '30d' | '90d' = '30d'): Promise<ChatbotAnalytics> {
    try {
      const response = await fetch(`${this.baseURL}/analytics?range=${timeRange}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching chatbot analytics: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in getAnalytics:', error);
      // Return mock data for development
      return this.getMockAnalytics();
    }
  }

  /**
   * Get chatbot conversations
   */
  async getConversations(filters?: {
    status?: 'active' | 'completed' | 'transferred';
    dateRange?: 'today' | 'week' | 'month' | 'all';
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ conversations: ChatbotConversation[]; total: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.dateRange) queryParams.append('dateRange', filters.dateRange);
      if (filters?.search) queryParams.append('search', filters.search);
      if (filters?.limit) queryParams.append('limit', filters.limit.toString());
      if (filters?.offset) queryParams.append('offset', filters.offset.toString());

      const response = await fetch(`${this.baseURL}/conversations?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching conversations: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in getConversations:', error);
      // Return mock data for development
      return this.getMockConversations();
    }
  }

  /**
   * Get a specific conversation by ID
   */
  async getConversation(conversationId: string): Promise<ChatbotConversation> {
    try {
      const response = await fetch(`${this.baseURL}/conversations/${conversationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching conversation: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in getConversation:', error);
      throw error;
    }
  }

  /**
   * Export analytics data
   */
  async exportAnalytics(format: 'csv' | 'json' = 'csv', timeRange: '7d' | '30d' | '90d' = '30d'): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseURL}/export/analytics?format=${format}&range=${timeRange}`, {
        method: 'GET',
        headers: {
          'Accept': format === 'csv' ? 'text/csv' : 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error exporting analytics: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error in exportAnalytics:', error);
      throw error;
    }
  }

  /**
   * Export conversations data
   */
  async exportConversations(format: 'csv' | 'json' = 'csv', filters?: {
    status?: 'active' | 'completed' | 'transferred';
    dateRange?: 'today' | 'week' | 'month' | 'all';
  }): Promise<Blob> {
    try {
      const queryParams = new URLSearchParams({ format });
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.dateRange) queryParams.append('dateRange', filters.dateRange);

      const response = await fetch(`${this.baseURL}/export/conversations?${queryParams}`, {
        method: 'GET',
        headers: {
          'Accept': format === 'csv' ? 'text/csv' : 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error exporting conversations: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error in exportConversations:', error);
      throw error;
    }
  }

  /**
   * Upload file (avatar, logo)
   */
  async uploadFile(file: File, type: 'avatar' | 'logo'): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch(`${this.baseURL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error uploading file: ${response.statusText}`);
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error in uploadFile:', error);
      throw error;
    }
  }

  /**
   * Test chatbot flow
   */
  async testFlow(flowId: string, input: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ flowId, input }),
      });

      if (!response.ok) {
        throw new Error(`Error testing flow: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in testFlow:', error);
      throw error;
    }
  }

  // Mock data methods for development
  private getMockConfig(): ChatbotConfig {
    return {
      id: 'chatbot_123',
      name: 'Asistente Inmobiliario',
      prompt: 'Eres un asistente amigable y experto en ventas de inmuebles. Ayuda a los usuarios con sus consultas sobre propiedades, precios y servicios disponibles.',
      isActive: true,
      appearance: {
        primaryColor: '#3B82F6',
        botAvatar: '',
        companyLogo: '',
        welcomeMessage: '¡Hola! Soy tu asistente inmobiliario. ¿En qué puedo ayudarte hoy?',
        position: 'bottom-right',
        proactiveMessages: [
          '¿Necesitas ayuda encontrando una propiedad?',
          '¿Tienes alguna pregunta sobre nuestros servicios?',
          '¿Te interesa conocer las propiedades disponibles en tu zona?'
        ]
      },
      flows: [
        {
          id: 'flow_1',
          name: 'Captura de Leads',
          nodes: [
            {
              id: 'start',
              type: 'message',
              position: { x: 300, y: 100 },
              data: {
                title: 'Mensaje de Bienvenida',
                content: '¡Hola! ¿En qué puedo ayudarte?'
              }
            }
          ],
          connections: []
        }
      ],
      analytics: {
        conversations: 1247,
        leads: 384,
        commonQuestions: [
          '¿Cuál es el precio de esta propiedad?',
          '¿En qué zona está ubicada?',
          '¿Cuántas habitaciones tiene?',
          '¿Está disponible para visitar?',
          '¿Qué documentos necesito?'
        ]
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString()
    };
  }

  private getMockAnalytics(): ChatbotAnalytics {
    return {
      conversations: 1247,
      leads: 384,
      commonQuestions: [
        '¿Cuál es el precio de esta propiedad?',
        '¿En qué zona está ubicada?',
        '¿Cuántas habitaciones tiene?',
        '¿Está disponible para visitar?',
        '¿Qué documentos necesito?'
      ],
      conversionRate: 30.8,
      averageRating: 4.2,
      monthlyStats: {
        conversations: 456,
        leads: 138,
        growth: 12.5
      }
    };
  }

  private getMockConversations(): { conversations: ChatbotConversation[]; total: number } {
    return {
      conversations: [
        {
          id: '1',
          userId: 'user_123',
          userName: 'Ana García',
          userEmail: 'ana@email.com',
          userPhone: '+34 666 123 456',
          startTime: '2024-01-08T10:30:00',
          endTime: '2024-01-08T10:45:00',
          status: 'completed',
          leadCaptured: true,
          source: 'Página principal',
          rating: 5,
          messages: [
            { id: 'm1', sender: 'bot', content: '¡Hola! ¿En qué puedo ayudarte?', timestamp: '2024-01-08T10:30:00', type: 'text' },
            { id: 'm2', sender: 'user', content: 'Busco un piso de 2 habitaciones', timestamp: '2024-01-08T10:30:30', type: 'text' },
          ]
        }
      ],
      total: 1
    };
  }
}

export const chatbotService = new ChatbotService();