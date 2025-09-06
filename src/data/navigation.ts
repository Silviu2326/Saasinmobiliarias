import { NavCategory } from '../types/navigation';

export const navigationCategories: NavCategory[] = [
  {
    id: 'main',
    label: 'Principal',
    icon: 'Home',
    items: [
      { id: 'inicio', label: 'Inicio', path: '/' },
      { id: 'dashboard', label: 'Dashboard', path: '/dashboard' }
    ]
  },
  {
    id: 'crm',
    label: 'CRM',
    icon: 'Users',
    items: [
      { id: 'leads', label: 'Leads', path: '/crm/leads' },
      { id: 'clientes', label: 'Clientes', path: '/crm/clientes' },
      { id: 'propietarios', label: 'Propietarios', path: '/crm/propietarios' },
      { id: 'tareas', label: 'Tareas', path: '/crm/tareas' },
      { id: 'cartera', label: 'Cartera', path: '/crm/cartera' }
    ]
  },
  {
    id: 'properties',
    label: 'Inmuebles',
    icon: 'Building',
    items: [
      { id: 'inmuebles', label: 'Inmuebles', path: '/properties/inmuebles' },
      { id: 'mapa', label: 'Mapa', path: '/properties/mapa' },
      { id: 'llaves', label: 'Llaves', path: '/properties/llaves' },
      { id: 'incidencias', label: 'Incidencias', path: '/properties/incidencias' },
      { id: 'proveedores', label: 'Proveedores', path: '/properties/proveedores' },
      { id: 'visitas', label: 'Visitas', path: '/properties/visitas' },
      { id: 'calendario', label: 'Calendario', path: '/properties/calendario' },
      { id: 'checkin', label: 'Check-in', path: '/properties/checkin' },
      { id: 'route-planner', label: 'Route Planner', path: '/properties/route-planner', starred: true }
    ]
  },
  {
    id: 'operations',
    label: 'Operaciones',
    icon: 'Briefcase',
    items: [
      { id: 'ofertas', label: 'Ofertas & Negociación', path: '/operations/ofertas' },
      { id: 'reservas', label: 'Reservas/Arras', path: '/operations/reservas' },
      { id: 'contratos', label: 'Contratos (Firma)', path: '/operations/contratos' },
      { id: 'due-dates', label: 'Due Dates', path: '/operations/due-dates' }
    ]
  },
  {
    id: 'valuation',
    label: 'Valuación & Pricing',
    icon: 'Calculator',
    items: [
      { id: 'avm', label: 'AVM ligero', path: '/valuation/avm', starred: true },
      { id: 'comparables', label: 'Comparables', path: '/valuation/comparables' },
      { id: 'pricing', label: 'Pricing dinámico', path: '/valuation/pricing', starred: true }
    ]
  },
  {
    id: 'marketing',
    label: 'Marketing',
    icon: 'Megaphone',
    items: [
      { id: 'portales', label: 'Portales (Publicación)', path: '/marketing/portales' },
      { id: 'rpa', label: 'RPA de Portales', path: '/marketing/rpa', starred: true },
      { id: 'landings', label: 'Landings', path: '/marketing/landings' },
      { id: 'campanas', label: 'Campañas', path: '/marketing/campanas' },
      { id: 'ab-testing', label: 'A/B Testing', path: '/marketing/ab-testing' },
      { id: 'pixel', label: 'Pixel/UTM', path: '/marketing/pixel' },
      { id: 'chatbot', label: 'Chatbot', path: '/marketing/chatbot' }
    ]
  },
  {
    id: 'ai-media',
    label: 'IA & Medios',
    icon: 'Bot',
    items: [
      { id: 'photo-coach', label: 'Photo Coach', path: '/ai-media/photo-coach', starred: true },
      { id: 'virtual-staging', label: 'Virtual Staging', path: '/ai-media/virtual-staging', starred: true }
    ]
  },
  {
    id: 'demand',
    label: 'Demanda',
    icon: 'TrendingUp',
    items: [
      { id: 'radar', label: 'Radar de Demanda', path: '/demand/radar', starred: true }
    ]
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    icon: 'Store',
    items: [
      { id: 'co-exclusivas', label: 'Co-exclusivas', path: '/marketplace/co-exclusivas', starred: true },
      { id: 'reglas', label: 'Reglas & Reparto', path: '/marketplace/reglas' },
      { id: 'trazabilidad', label: 'Trazabilidad', path: '/marketplace/trazabilidad' }
    ]
  },
  {
    id: 'compliance',
    label: 'Compliance',
    icon: 'Shield',
    items: [
      { id: 'asistente-legal', label: 'Asistente Legal', path: '/compliance/asistente-legal', starred: true },
      { id: 'rgpd', label: 'RGPD/DSR', path: '/compliance/rgpd' },
      { id: 'kyc', label: 'KYC/AML', path: '/compliance/kyc' },
      { id: 'auditoria', label: 'Auditoría', path: '/compliance/auditoria' }
    ]
  },
  {
    id: 'finance',
    label: 'Finanzas',
    icon: 'DollarSign',
    items: [
      { id: 'comisiones', label: 'Comisiones', path: '/finance/comisiones' },
      { id: 'liquidaciones', label: 'Liquidaciones', path: '/finance/liquidaciones' },
      { id: 'facturas', label: 'Facturas', path: '/finance/facturas' },
      { id: 'gastos', label: 'Gastos', path: '/finance/gastos' },
      { id: 'forecast', label: 'Forecast', path: '/finance/forecast' }
    ]
  },
  {
    id: 'analytics',
    label: 'Analítica',
    icon: 'BarChart3',
    items: [
      { id: 'kpis', label: 'KPIs', path: '/analytics/kpis' },
      { id: 'conversion', label: 'Conversión', path: '/analytics/conversion' },
      { id: 'cohortes', label: 'Cohortes', path: '/analytics/cohortes' },
      { id: 'productividad', label: 'Productividad', path: '/analytics/productividad' }
    ]
  },
  {
    id: 'integrations',
    label: 'Integraciones',
    icon: 'Zap',
    items: [
      { id: 'portales-int', label: 'Portales', path: '/integrations/portales' },
      { id: 'firma-digital', label: 'Firma Digital', path: '/integrations/firma-digital' },
      { id: 'telefonia', label: 'Telefonía/WhatsApp', path: '/integrations/telefonia' },
      { id: 'contabilidad', label: 'Contabilidad', path: '/integrations/contabilidad' },
      { id: 'pagos', label: 'Pagos', path: '/integrations/pagos' }
    ]
  },
  {
    id: 'system',
    label: 'Sistema',
    icon: 'Settings',
    items: [
      { id: 'usuarios', label: 'Usuarios', path: '/system/usuarios' },
      { id: 'equipos', label: 'Equipos & Permisos', path: '/system/equipos' },
      { id: 'multi-sede', label: 'Multi-sede', path: '/system/multi-sede' },
      { id: 'plantillas', label: 'Plantillas', path: '/system/plantillas' },
      { id: 'web-settings', label: 'Web Settings', path: '/system/web-settings' }
    ]
  },
  {
    id: 'help',
    label: 'Ayuda',
    icon: 'HelpCircle',
    items: [
      { id: 'guias', label: 'Guías', path: '/help/guias' },
      { id: 'changelog', label: 'Changelog', path: '/help/changelog' },
      { id: 'soporte', label: 'Soporte', path: '/help/soporte' }
    ]
  }
];