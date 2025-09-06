import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Calendar,
  Download,
  RefreshCw,
  AlertTriangle,
  Radar,
  TrendingUp,
  Bell,
  Activity
} from 'lucide-react';

import { TrendGraph } from './components/TrendGraph';
import { KeywordTracker } from './components/KeywordTracker';
import { SocialMentions } from './components/SocialMentions';
import { ContentRadar } from './components/ContentRadar';
import { ConfigurationModal } from './components/ConfigurationModal';
import { useRadarData } from './hooks/useRadarData';

export default function RadarDemandaPage() {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);

  const {
    dashboardData,
    config,
    loading,
    configLoading,
    trendsLoading,
    socialLoading,
    contentLoading,
    error,
    refreshDashboard,
    refreshTrends,
    refreshSocial,
    refreshContent,
    updateConfig,
    exportData,
    dateRange,
    setDateRange
  } = useRadarData();

  const handleConfigSave = async (newConfig: any) => {
    await updateConfig(newConfig);
    setShowConfigModal(false);
  };

  const handleExportWidget = async (widgetType: 'trends' | 'social' | 'content') => {
    try {
      await exportData(widgetType);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleAddKeyword = async (keyword: string) => {
    if (!config) return;
    const newConfig = {
      ...config,
      keywords: [...config.keywords, keyword]
    };
    await updateConfig(newConfig);
  };

  const handleRemoveKeyword = async (keyword: string) => {
    if (!config) return;
    const newConfig = {
      ...config,
      keywords: config.keywords.filter(k => k !== keyword)
    };
    await updateConfig(newConfig);
  };

  const getAlertCount = () => {
    if (!dashboardData) return 0;
    return dashboardData.alerts.filter(alert => alert.severity === 'high').length;
  };

  const getDashboardStats = () => {
    if (!dashboardData) return { trends: 0, mentions: 0, articles: 0, alerts: 0 };
    
    return {
      trends: dashboardData.trends.filter(t => t.growthRate > 5).length,
      mentions: dashboardData.socialMentions.length,
      articles: dashboardData.content.filter(c => {
        const isRecent = (Date.now() - new Date(c.publishedAt).getTime()) < (24 * 60 * 60 * 1000);
        return isRecent;
      }).length,
      alerts: getAlertCount()
    };
  };

  const stats = getDashboardStats();

  if (loading && !dashboardData) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4" />
          <div className="text-xl font-semibold text-gray-900 mb-2">Iniciando Radar de Demanda</div>
          <div className="text-gray-600">Cargando datos del mercado...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <div className="text-xl font-semibold text-red-900 mb-2">Error al cargar el radar</div>
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={refreshDashboard}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Radar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Radar de Demanda</h1>
              <p className="text-gray-600">Detección temprana de oportunidades de mercado</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Date Range Selector */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
              <Calendar className="w-4 h-4 text-gray-500" />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="text-sm border-none focus:ring-0"
              />
              <span className="text-gray-400">-</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="text-sm border-none focus:ring-0"
              />
            </div>

            {/* Global Actions */}
            <button
              onClick={refreshDashboard}
              disabled={loading}
              className="p-2 text-gray-600 hover:bg-white hover:shadow-sm rounded-lg border border-gray-200 transition-all"
              title="Actualizar todos los datos"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setShowConfigModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
            >
              <Settings className="w-4 h-4" />
              Configurar Radar
            </button>
          </div>
        </div>

        {/* Dashboard Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Tendencias Activas</div>
                <div className="text-3xl font-bold text-gray-900">{stats.trends}</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Menciones Hoy</div>
                <div className="text-3xl font-bold text-gray-900">{stats.mentions}</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Download className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Artículos Nuevos</div>
                <div className="text-3xl font-bold text-gray-900">{stats.articles}</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Bell className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Alertas Críticas</div>
                <div className="text-3xl font-bold text-gray-900">{stats.alerts}</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Active Alerts */}
        {dashboardData?.alerts && dashboardData.alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8 p-4 bg-gradient-to-r from-amber-50 to-red-50 border border-amber-200 rounded-xl"
          >
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold text-amber-800">Alertas Recientes</h3>
            </div>
            <div className="space-y-2">
              {dashboardData.alerts.slice(0, 2).map(alert => (
                <div key={alert.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      alert.severity === 'high' ? 'bg-red-500' :
                      alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <span className="text-gray-900">{alert.message}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(alert.createdAt).toLocaleTimeString('es-ES', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Dashboard Widgets Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {/* Trends Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {dashboardData?.trends && (
            <TrendGraph
              trends={dashboardData.trends}
              loading={trendsLoading}
              onRefresh={refreshTrends}
              onExport={() => handleExportWidget('trends')}
            />
          )}
        </motion.div>

        {/* Keyword Tracker Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {config && dashboardData?.trends && (
            <KeywordTracker
              trends={dashboardData.trends}
              keywords={config.keywords}
              loading={trendsLoading}
              onAddKeyword={handleAddKeyword}
              onRemoveKeyword={handleRemoveKeyword}
              onRefresh={refreshTrends}
            />
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Social Mentions Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {dashboardData?.socialMentions && (
            <SocialMentions
              mentions={dashboardData.socialMentions}
              loading={socialLoading}
              onRefresh={refreshSocial}
            />
          )}
        </motion.div>

        {/* Content Radar Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {dashboardData?.content && (
            <ContentRadar
              content={dashboardData.content}
              loading={contentLoading}
              onRefresh={refreshContent}
            />
          )}
        </motion.div>
      </div>

      {/* Configuration Modal */}
      <ConfigurationModal
        isOpen={showConfigModal}
        config={config}
        loading={configLoading}
        onClose={() => setShowConfigModal(false)}
        onSave={handleConfigSave}
      />

      {/* Last Update Info */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <div className="flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4" />
          <span>
            Última actualización: {new Date().toLocaleTimeString('es-ES', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })} • Próxima actualización automática en 5 minutos
          </span>
        </div>
      </div>
    </div>
  );
}