import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { TrendingUp, DollarSign, Target, Users, Mail, MessageSquare, Globe, Zap } from 'lucide-react';
import { Campana } from '../index';

interface CampanasStatsProps {
  campanas: Campana[];
}

export const CampanasStats: React.FC<CampanasStatsProps> = ({ campanas }) => {
  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'email':
        return '#3B82F6'; // blue
      case 'sms':
        return '#10B981'; // green
      case 'portales':
        return '#8B5CF6'; // purple
      case 'rpa':
        return '#F59E0B'; // orange
      default:
        return '#6B7280'; // gray
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      case 'portales':
        return <Globe className="h-4 w-4" />;
      case 'rpa':
        return <Zap className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  // Datos para gráfico de barras - ROI por tipo de campaña
  const roiPorTipo = campanas.reduce((acc, campana) => {
    const existing = acc.find(item => item.tipo === campana.tipo);
    if (existing) {
      existing.roi = (existing.roi + campana.metricas.roi) / 2;
      existing.campanas += 1;
    } else {
      acc.push({
        tipo: campana.tipo,
        roi: campana.metricas.roi,
        campanas: 1,
        color: getTipoColor(campana.tipo)
      });
    }
    return acc;
  }, [] as Array<{ tipo: string; roi: number; campanas: number; color: string }>);

  // Datos para gráfico circular - Distribución de presupuesto por tipo
  const presupuestoPorTipo = campanas.reduce((acc, campana) => {
    const existing = acc.find(item => item.name === campana.tipo);
    if (existing) {
      existing.value += campana.presupuesto;
    } else {
      acc.push({
        name: campana.tipo,
        value: campana.presupuesto,
        fill: getTipoColor(campana.tipo)
      });
    }
    return acc;
  }, [] as Array<{ name: string; value: number; fill: string }>);

  // Datos para gráfico de líneas - Evolución del CTR
  const ctrEvolution = campanas
    .sort((a, b) => new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime())
    .slice(-10) // Últimas 10 campañas
    .map(campana => ({
      nombre: campana.nombre.substring(0, 15) + '...',
      ctr: campana.metricas.ctr,
      conversiones: campana.metricas.conversiones,
      fecha: new Date(campana.fechaCreacion).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
    }));

  // Datos para gráfico de área - Gasto vs Presupuesto
  const gastoPorMes = campanas.reduce((acc, campana) => {
    const mes = new Date(campana.fechaCreacion).toLocaleDateString('es-ES', { year: 'numeric', month: 'short' });
    const existing = acc.find(item => item.mes === mes);
    if (existing) {
      existing.presupuesto += campana.presupuesto;
      existing.gastado += campana.gastado;
    } else {
      acc.push({
        mes,
        presupuesto: campana.presupuesto,
        gastado: campana.gastado
      });
    }
    return acc;
  }, [] as Array<{ mes: string; presupuesto: number; gastado: number }>);

  // Métricas generales
  const totalPresupuesto = campanas.reduce((sum, c) => sum + c.presupuesto, 0);
  const totalGastado = campanas.reduce((sum, c) => sum + c.gastado, 0);
  const roiPromedio = campanas.reduce((sum, c) => sum + c.metricas.roi, 0) / (campanas.length || 1);
  const ctrPromedio = campanas.reduce((sum, c) => sum + c.metricas.ctr, 0) / (campanas.length || 1);
  const totalConversiones = campanas.reduce((sum, c) => sum + c.metricas.conversiones, 0);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.name.includes('%') ? `${entry.value}%` : 
                entry.name.includes('€') ? `€${entry.value.toLocaleString()}` : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 capitalize">{data.name}</p>
          <p className="text-sm" style={{ color: data.fill }}>
            €{data.value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Métricas Clave */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Métricas Clave</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-2">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">€{totalPresupuesto.toLocaleString()}</p>
            <p className="text-xs text-gray-600">Presupuesto Total</p>
            <p className="text-xs text-gray-500">€{totalGastado.toLocaleString()} gastado</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-2">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{roiPromedio.toFixed(1)}%</p>
            <p className="text-xs text-gray-600">ROI Promedio</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-2">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{ctrPromedio.toFixed(2)}%</p>
            <p className="text-xs text-gray-600">CTR Promedio</p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-2">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalConversiones}</p>
            <p className="text-xs text-gray-600">Total Conversiones</p>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ROI por Tipo de Campaña */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">ROI por Tipo de Campaña</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={roiPorTipo}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="tipo" 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
              />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="roi" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                {roiPorTipo.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribución del Presupuesto */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución del Presupuesto</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={presupuestoPorTipo}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {presupuestoPorTipo.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            {presupuestoPorTipo.map((entry, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.fill }}></div>
                <span className="text-sm text-gray-600 capitalize">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Evolución del CTR */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolución del CTR</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ctrEvolution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="fecha" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="ctr" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gasto vs Presupuesto por Mes */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Gasto vs Presupuesto</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={gastoPorMes}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="presupuesto"
                stackId="1"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="gastado"
                stackId="2"
                stroke="#EF4444"
                fill="#EF4444"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-4 flex justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Presupuesto</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Gastado</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Campaigns */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Campañas con Mejor Rendimiento</h3>
        <div className="space-y-3">
          {campanas
            .sort((a, b) => b.metricas.roi - a.metricas.roi)
            .slice(0, 5)
            .map((campana, index) => (
              <div key={campana.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                    <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`p-1 rounded ${campana.tipo === 'email' ? 'bg-blue-100' : 
                      campana.tipo === 'sms' ? 'bg-green-100' : 
                      campana.tipo === 'portales' ? 'bg-purple-100' : 'bg-orange-100'}`}>
                      {getTipoIcon(campana.tipo)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{campana.nombre}</p>
                      <p className="text-xs text-gray-500">
                        {campana.metricas.conversiones} conversiones • CTR: {campana.metricas.ctr}%
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">{campana.metricas.roi}% ROI</p>
                  <p className="text-xs text-gray-500">€{campana.gastado.toLocaleString()} gastado</p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};