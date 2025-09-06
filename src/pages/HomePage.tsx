import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Building, 
  TrendingUp, 
  Calculator,
  DollarSign,
  BarChart3,
  Calendar
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const quickStats = [
    { label: 'Leads Activos', value: '128', icon: Users, color: 'blue' },
    { label: 'Inmuebles', value: '45', icon: Building, color: 'green' },
    { label: 'Ventas del Mes', value: '€2.4M', icon: TrendingUp, color: 'purple' },
    { label: 'Comisiones', value: '€45K', icon: DollarSign, color: 'yellow' }
  ];

  const recentActivity = [
    { action: 'Nuevo lead registrado', time: 'Hace 5 min', type: 'lead' },
    { action: 'Visita programada', time: 'Hace 15 min', type: 'visit' },
    { action: 'Contrato firmado', time: 'Hace 1 hora', type: 'contract' },
    { action: 'Inmueble publicado', time: 'Hace 2 horas', type: 'property' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bienvenido de vuelta</h1>
          <p className="text-gray-600 mt-1">Aquí tienes un resumen de tu actividad de hoy</p>
        </div>
        <Link
          to="/dashboard"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Ver Dashboard
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Actividad Reciente</h2>
            <Link to="/dashboard" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Ver todo
            </Link>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/crm/leads"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <span className="text-sm font-medium">Nuevo Lead</span>
            </Link>
            <Link
              to="/properties/inmuebles"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <Building className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <span className="text-sm font-medium">Añadir Inmueble</span>
            </Link>
            <Link
              to="/properties/visitas"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <span className="text-sm font-medium">Programar Visita</span>
            </Link>
            <Link
              to="/analytics/kpis"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <BarChart3 className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <span className="text-sm font-medium">Ver Analytics</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};