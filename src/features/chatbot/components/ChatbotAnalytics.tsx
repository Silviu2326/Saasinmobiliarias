import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MessageCircle, 
  Mail,
  Calendar,
  ArrowUp,
  ArrowDown,
  HelpCircle,
  Target,
  Clock,
  Activity,
  Download,
  Filter
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';

interface ChatbotAnalyticsProps {
  analytics: {
    conversations: number;
    leads: number;
    commonQuestions: string[];
  };
}

export const ChatbotAnalytics: React.FC<ChatbotAnalyticsProps> = ({ analytics }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [activeChart, setActiveChart] = useState<'conversations' | 'leads' | 'satisfaction'>('conversations');

  // Mock data for charts
  const conversationsData = [
    { date: '2024-01-01', conversations: 45, leads: 12, satisfaction: 4.2 },
    { date: '2024-01-02', conversations: 52, leads: 15, satisfaction: 4.1 },
    { date: '2024-01-03', conversations: 38, leads: 9, satisfaction: 4.3 },
    { date: '2024-01-04', conversations: 61, leads: 18, satisfaction: 4.0 },
    { date: '2024-01-05', conversations: 47, leads: 13, satisfaction: 4.2 },
    { date: '2024-01-06', conversations: 55, leads: 16, satisfaction: 4.4 },
    { date: '2024-01-07', conversations: 43, leads: 11, satisfaction: 4.1 },
  ];

  const hourlyData = [
    { hour: '00:00', activity: 5 },
    { hour: '02:00', activity: 3 },
    { hour: '04:00', activity: 2 },
    { hour: '06:00', activity: 8 },
    { hour: '08:00', activity: 15 },
    { hour: '10:00', activity: 25 },
    { hour: '12:00', activity: 35 },
    { hour: '14:00', activity: 30 },
    { hour: '16:00', activity: 28 },
    { hour: '18:00', activity: 22 },
    { hour: '20:00', activity: 18 },
    { hour: '22:00', activity: 12 },
  ];

  const topicsData = [
    { name: 'Precios', value: 35, color: '#3B82F6' },
    { name: 'Ubicación', value: 25, color: '#10B981' },
    { name: 'Características', value: 20, color: '#8B5CF6' },
    { name: 'Disponibilidad', value: 15, color: '#F59E0B' },
    { name: 'Otros', value: 5, color: '#EF4444' },
  ];

  const satisfactionData = [
    { rating: '5 ⭐', count: 120 },
    { rating: '4 ⭐', count: 85 },
    { rating: '3 ⭐', count: 25 },
    { rating: '2 ⭐', count: 8 },
    { rating: '1 ⭐', count: 3 },
  ];

  const stats = [
    {
      label: 'Conversaciones Totales',
      value: '1,247',
      change: '+12.5%',
      changeType: 'positive',
      icon: MessageCircle,
      color: 'bg-blue-500'
    },
    {
      label: 'Leads Capturados',
      value: '384',
      change: '+8.2%',
      changeType: 'positive',
      icon: Target,
      color: 'bg-green-500'
    },
    {
      label: 'Tasa de Conversión',
      value: '30.8%',
      change: '-2.1%',
      changeType: 'negative',
      icon: TrendingUp,
      color: 'bg-purple-500'
    },
    {
      label: 'Satisfacción Media',
      value: '4.2/5',
      change: '+0.3',
      changeType: 'positive',
      icon: Users,
      color: 'bg-orange-500'
    }
  ];

  const renderStatCard = (stat: typeof stats[0], index: number) => (
    <motion.div
      key={stat.label}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{stat.label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
          <div className="flex items-center mt-2">
            {stat.changeType === 'positive' ? (
              <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm ${
              stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
            }`}>
              {stat.change}
            </span>
            <span className="text-sm text-gray-500 ml-2">vs mes anterior</span>
          </div>
        </div>
        <div className={`p-3 rounded-lg ${stat.color}`}>
          <stat.icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  const renderTimeRangeSelector = () => (
    <div className="flex space-x-2">
      {[
        { value: '7d', label: '7 días' },
        { value: '30d', label: '30 días' },
        { value: '90d', label: '90 días' }
      ].map((option) => (
        <button
          key={option.value}
          onClick={() => setTimeRange(option.value as typeof timeRange)}
          className={`px-3 py-2 text-sm rounded-lg transition-colors ${
            timeRange === option.value
              ? 'bg-blue-100 text-blue-700 border border-blue-200'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Analíticas del Chatbot</h3>
              <p className="text-sm text-gray-600 mt-1">Rendimiento y métricas clave</p>
            </div>
            <div className="flex items-center space-x-4">
              {renderTimeRangeSelector()}
              <button className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(renderStatCard)}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversations & Leads Trend */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-900">Tendencia de Conversaciones</h4>
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveChart('conversations')}
                  className={`px-3 py-1 text-xs rounded ${
                    activeChart === 'conversations' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Conversaciones
                </button>
                <button
                  onClick={() => setActiveChart('leads')}
                  className={`px-3 py-1 text-xs rounded ${
                    activeChart === 'leads' 
                      ? 'bg-green-100 text-green-700' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Leads
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={conversationsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(date) => new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString('es-ES')}
                  formatter={(value, name) => [
                    value, 
                    name === 'conversations' ? 'Conversaciones' : 'Leads'
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey={activeChart}
                  stroke={activeChart === 'conversations' ? '#3B82F6' : '#10B981'}
                  fill={activeChart === 'conversations' ? '#3B82F6' : '#10B981'}
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity by Hour */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900">Actividad por Hora</h4>
            <p className="text-sm text-gray-600 mt-1">Distribución horaria de conversaciones</p>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="hour" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip />
                <Bar 
                  dataKey="activity" 
                  fill="#8B5CF6" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Topics and Satisfaction */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Common Topics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900">Temas Más Consultados</h4>
            <p className="text-sm text-gray-600 mt-1">Distribución por categorías</p>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={topicsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {topicsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Porcentaje']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {topicsData.map((topic) => (
                <div key={topic.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: topic.color }}
                    ></div>
                    <span className="text-gray-700">{topic.name}</span>
                  </div>
                  <span className="font-medium text-gray-900">{topic.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Satisfaction Ratings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900">Valoraciones de Satisfacción</h4>
            <p className="text-sm text-gray-600 mt-1">Distribución de calificaciones</p>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart 
                data={satisfactionData} 
                layout="horizontal"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" stroke="#6b7280" fontSize={12} />
                <YAxis 
                  type="category" 
                  dataKey="rating" 
                  stroke="#6b7280" 
                  fontSize={12}
                  width={50}
                />
                <Tooltip />
                <Bar 
                  dataKey="count" 
                  fill="#F59E0B" 
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center">
              <div className="text-3xl font-bold text-gray-900">4.2</div>
              <div className="text-sm text-gray-600">Puntuación media</div>
              <div className="text-xs text-gray-500 mt-1">Basado en 241 valoraciones</div>
            </div>
          </div>
        </div>
      </div>

      {/* Common Questions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">Preguntas Más Frecuentes</h4>
              <p className="text-sm text-gray-600 mt-1">Lista de consultas comunes</p>
            </div>
            <HelpCircle className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {analytics.commonQuestions.length > 0 ? (
              analytics.commonQuestions.map((question, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{question}</p>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <Activity className="h-3 w-3 mr-1" />
                      <span>Consultado {Math.floor(Math.random() * 50 + 10)} veces esta semana</span>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <HelpCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm">No hay preguntas registradas aún</p>
                <p className="text-xs mt-1">Las preguntas más frecuentes aparecerán aquí</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};