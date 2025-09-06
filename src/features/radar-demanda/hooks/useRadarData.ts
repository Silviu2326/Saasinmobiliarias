import { useState, useEffect, useCallback } from 'react';
import { 
  radarService, 
  RadarDashboardData, 
  RadarConfig, 
  TrendData, 
  SocialMention, 
  ContentItem 
} from '../services/radarService';

export interface DateRange {
  start: string;
  end: string;
}

export interface UseRadarDataReturn {
  // Data
  dashboardData: RadarDashboardData | null;
  config: RadarConfig | null;
  
  // Loading states
  loading: boolean;
  configLoading: boolean;
  trendsLoading: boolean;
  socialLoading: boolean;
  contentLoading: boolean;
  
  // Errors
  error: string | null;
  
  // Actions
  refreshDashboard: () => Promise<void>;
  refreshTrends: () => Promise<void>;
  refreshSocial: () => Promise<void>;
  refreshContent: () => Promise<void>;
  updateConfig: (newConfig: RadarConfig) => Promise<void>;
  exportData: (type: 'trends' | 'social' | 'content', format?: 'csv' | 'json') => Promise<string>;
  
  // Date range
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
}

const getDefaultDateRange = (): DateRange => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30); // Last 30 days
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  };
};

export const useRadarData = (): UseRadarDataReturn => {
  // State
  const [dashboardData, setDashboardData] = useState<RadarDashboardData | null>(null);
  const [config, setConfig] = useState<RadarConfig | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange());
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [configLoading, setConfigLoading] = useState(false);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [contentLoading, setContentLoading] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);

  // Load initial configuration
  const loadConfig = useCallback(async () => {
    try {
      setConfigLoading(true);
      setError(null);
      const configData = await radarService.getRadarConfig();
      setConfig(configData);
    } catch (err) {
      setError('Error al cargar la configuración del radar');
      console.error('Error loading radar config:', err);
    } finally {
      setConfigLoading(false);
    }
  }, []);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await radarService.getDashboardData(dateRange);
      setDashboardData(data);
    } catch (err) {
      setError('Error al cargar los datos del radar');
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  // Refresh entire dashboard
  const refreshDashboard = useCallback(async () => {
    await loadDashboardData();
  }, [loadDashboardData]);

  // Refresh individual components
  const refreshTrends = useCallback(async () => {
    if (!config) return;
    
    try {
      setTrendsLoading(true);
      setError(null);
      const trends = await radarService.getTrendsData(config.keywords, dateRange);
      setDashboardData(prev => prev ? { ...prev, trends } : null);
    } catch (err) {
      setError('Error al actualizar las tendencias');
      console.error('Error refreshing trends:', err);
    } finally {
      setTrendsLoading(false);
    }
  }, [config, dateRange]);

  const refreshSocial = useCallback(async () => {
    if (!config) return;
    
    try {
      setSocialLoading(true);
      setError(null);
      const socialMentions = await radarService.getSocialMentions(config.keywords, dateRange);
      setDashboardData(prev => prev ? { ...prev, socialMentions } : null);
    } catch (err) {
      setError('Error al actualizar las menciones sociales');
      console.error('Error refreshing social mentions:', err);
    } finally {
      setSocialLoading(false);
    }
  }, [config, dateRange]);

  const refreshContent = useCallback(async () => {
    try {
      setContentLoading(true);
      setError(null);
      const content = await radarService.getContentData(undefined, dateRange);
      setDashboardData(prev => prev ? { ...prev, content } : null);
    } catch (err) {
      setError('Error al actualizar el contenido');
      console.error('Error refreshing content:', err);
    } finally {
      setContentLoading(false);
    }
  }, [dateRange]);

  // Update configuration
  const updateConfig = useCallback(async (newConfig: RadarConfig) => {
    try {
      setConfigLoading(true);
      setError(null);
      const savedConfig = await radarService.saveRadarConfig(newConfig);
      setConfig(savedConfig);
      
      // Refresh dashboard with new config
      await loadDashboardData();
    } catch (err) {
      setError('Error al guardar la configuración');
      console.error('Error updating config:', err);
      throw err;
    } finally {
      setConfigLoading(false);
    }
  }, [loadDashboardData]);

  // Export data
  const exportData = useCallback(async (
    type: 'trends' | 'social' | 'content', 
    format: 'csv' | 'json' = 'csv'
  ): Promise<string> => {
    try {
      const exportUrl = await radarService.exportData(type, format);
      
      // Trigger download
      const link = document.createElement('a');
      link.href = exportUrl;
      link.download = `radar_${type}_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return exportUrl;
    } catch (err) {
      setError('Error al exportar los datos');
      console.error('Error exporting data:', err);
      throw err;
    }
  }, []);

  // Update date range handler
  const handleDateRangeChange = useCallback((range: DateRange) => {
    setDateRange(range);
  }, []);

  // Load initial data
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    if (config) {
      loadDashboardData();
    }
  }, [config, loadDashboardData]);

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    if (!dashboardData) return;

    const interval = setInterval(() => {
      loadDashboardData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [dashboardData, loadDashboardData]);

  return {
    // Data
    dashboardData,
    config,
    
    // Loading states
    loading,
    configLoading,
    trendsLoading,
    socialLoading,
    contentLoading,
    
    // Error
    error,
    
    // Actions
    refreshDashboard,
    refreshTrends,
    refreshSocial,
    refreshContent,
    updateConfig,
    exportData,
    
    // Date range
    dateRange,
    setDateRange: handleDateRangeChange
  };
};