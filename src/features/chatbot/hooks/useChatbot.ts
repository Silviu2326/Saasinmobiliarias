import { useState, useEffect, useCallback } from 'react';
import { ChatbotConfig, ChatbotFlow } from '../index';
import { chatbotService, ChatbotAnalytics } from '../services/chatbotService';

interface UseChatbotReturn {
  // State
  chatbot: ChatbotConfig;
  loading: boolean;
  error: string | null;
  
  // Actions
  updateConfig: (config: Partial<ChatbotConfig>) => Promise<void>;
  updateAppearance: (appearance: Partial<ChatbotConfig['appearance']>) => Promise<void>;
  updateFlows: (flows: ChatbotFlow[]) => Promise<void>;
  toggleChatbot: () => Promise<void>;
  refreshData: () => Promise<void>;
  
  // File uploads
  uploadBotAvatar: (file: File) => Promise<void>;
  uploadCompanyLogo: (file: File) => Promise<void>;
}

const initialChatbotState: ChatbotConfig = {
  id: '',
  name: '',
  prompt: '',
  isActive: false,
  appearance: {
    primaryColor: '#3B82F6',
    botAvatar: '',
    companyLogo: '',
    welcomeMessage: '',
    position: 'bottom-right',
    proactiveMessages: []
  },
  flows: [],
  analytics: {
    conversations: 0,
    leads: 0,
    commonQuestions: []
  },
  createdAt: '',
  updatedAt: ''
};

export const useChatbot = (): UseChatbotReturn => {
  const [chatbot, setChatbot] = useState<ChatbotConfig>(initialChatbotState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial chatbot data
  const loadChatbotData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await chatbotService.getConfig();
      setChatbot(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading chatbot configuration';
      setError(errorMessage);
      console.error('Error loading chatbot data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    loadChatbotData();
  }, [loadChatbotData]);

  // Update general configuration
  const updateConfig = useCallback(async (config: Partial<ChatbotConfig>) => {
    try {
      setError(null);
      
      // Optimistic update
      setChatbot(prev => ({
        ...prev,
        ...config,
        updatedAt: new Date().toISOString()
      }));

      const updatedChatbot = await chatbotService.updateConfig(config);
      setChatbot(updatedChatbot);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating configuration';
      setError(errorMessage);
      
      // Revert optimistic update by reloading data
      await loadChatbotData();
      
      throw err; // Re-throw for component error handling
    }
  }, [loadChatbotData]);

  // Update appearance settings
  const updateAppearance = useCallback(async (appearance: Partial<ChatbotConfig['appearance']>) => {
    try {
      setError(null);
      
      // Optimistic update
      setChatbot(prev => ({
        ...prev,
        appearance: { ...prev.appearance, ...appearance },
        updatedAt: new Date().toISOString()
      }));

      const updatedChatbot = await chatbotService.updateAppearance(appearance);
      setChatbot(updatedChatbot);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating appearance';
      setError(errorMessage);
      
      // Revert optimistic update
      await loadChatbotData();
      
      throw err;
    }
  }, [loadChatbotData]);

  // Update conversation flows
  const updateFlows = useCallback(async (flows: ChatbotFlow[]) => {
    try {
      setError(null);
      
      // Optimistic update
      setChatbot(prev => ({
        ...prev,
        flows,
        updatedAt: new Date().toISOString()
      }));

      const updatedChatbot = await chatbotService.updateFlows(flows);
      setChatbot(updatedChatbot);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating conversation flows';
      setError(errorMessage);
      
      // Revert optimistic update
      await loadChatbotData();
      
      throw err;
    }
  }, [loadChatbotData]);

  // Toggle chatbot active status
  const toggleChatbot = useCallback(async () => {
    try {
      setError(null);
      const newStatus = !chatbot.isActive;
      
      // Optimistic update
      setChatbot(prev => ({
        ...prev,
        isActive: newStatus,
        updatedAt: new Date().toISOString()
      }));

      const updatedChatbot = await chatbotService.toggleStatus(newStatus);
      setChatbot(updatedChatbot);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error toggling chatbot status';
      setError(errorMessage);
      
      // Revert optimistic update
      await loadChatbotData();
      
      throw err;
    }
  }, [chatbot.isActive, loadChatbotData]);

  // Upload bot avatar
  const uploadBotAvatar = useCallback(async (file: File) => {
    try {
      setError(null);
      
      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }
      
      if (file.size > 1024 * 1024) { // 1MB limit
        throw new Error('Image file must be smaller than 1MB');
      }

      const url = await chatbotService.uploadFile(file, 'avatar');
      
      await updateAppearance({ botAvatar: url });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error uploading bot avatar';
      setError(errorMessage);
      throw err;
    }
  }, [updateAppearance]);

  // Upload company logo
  const uploadCompanyLogo = useCallback(async (file: File) => {
    try {
      setError(null);
      
      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }
      
      if (file.size > 1024 * 1024) { // 1MB limit
        throw new Error('Image file must be smaller than 1MB');
      }

      const url = await chatbotService.uploadFile(file, 'logo');
      
      await updateAppearance({ companyLogo: url });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error uploading company logo';
      setError(errorMessage);
      throw err;
    }
  }, [updateAppearance]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await loadChatbotData();
  }, [loadChatbotData]);

  return {
    // State
    chatbot,
    loading,
    error,
    
    // Actions
    updateConfig,
    updateAppearance,
    updateFlows,
    toggleChatbot,
    refreshData,
    
    // File uploads
    uploadBotAvatar,
    uploadCompanyLogo,
  };
};

// Hook for chatbot analytics
export const useChatbotAnalytics = (timeRange: '7d' | '30d' | '90d' = '30d') => {
  const [analytics, setAnalytics] = useState<ChatbotAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await chatbotService.getAnalytics(timeRange);
      setAnalytics(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading analytics';
      setError(errorMessage);
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const exportAnalytics = useCallback(async (format: 'csv' | 'json' = 'csv') => {
    try {
      const blob = await chatbotService.exportAnalytics(format, timeRange);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chatbot-analytics-${timeRange}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting analytics:', err);
      throw err;
    }
  }, [timeRange]);

  return {
    analytics,
    loading,
    error,
    refreshAnalytics: loadAnalytics,
    exportAnalytics,
  };
};

// Hook for chatbot conversations
export const useChatbotConversations = (filters?: {
  status?: 'active' | 'completed' | 'transferred';
  dateRange?: 'today' | 'week' | 'month' | 'all';
  search?: string;
}) => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { conversations: data, total: totalCount } = await chatbotService.getConversations(filters);
      setConversations(data);
      setTotal(totalCount);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading conversations';
      setError(errorMessage);
      console.error('Error loading conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const exportConversations = useCallback(async (format: 'csv' | 'json' = 'csv') => {
    try {
      const blob = await chatbotService.exportConversations(format, {
        status: filters?.status,
        dateRange: filters?.dateRange
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chatbot-conversations.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting conversations:', err);
      throw err;
    }
  }, [filters]);

  return {
    conversations,
    total,
    loading,
    error,
    refreshConversations: loadConversations,
    exportConversations,
  };
};