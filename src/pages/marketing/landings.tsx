import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Copy, 
  Trash2, 
  Archive,
  BarChart3,
  TrendingUp,
  MousePointer,
  Globe,
  MoreVertical,
  ChevronRight,
  Layout,
  Palette,
  Settings,
  Rocket,
  Users,
  Mail,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

interface Landing {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft' | 'archived';
  template: string;
  domain: string;
  createdAt: string;
  updatedAt: string;
  metrics: {
    visits: number;
    leads: number;
    conversionRate: number;
    ctr: number;
  };
  thumbnail: string;
  author: string;
  abTesting?: {
    enabled: boolean;
    variants: number;
  };
}

const Landings: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'dashboard' | 'landings' | 'templates'>('dashboard');
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [selectedLanding, setSelectedLanding] = useState<Landing | null>(null);

  // Mock data
  const landings: Landing[] = [
    {
      id: '1',
      title: 'Promoción Torre Marina',
      slug: 'promo-torre-marina',
      status: 'published',
      template: 'real-estate',
      domain: 'torre-marina.example.com',
      createdAt: '2024-02-01',
      updatedAt: '2024-02-15',
      metrics: {
        visits: 1234,
        leads: 87,
        conversionRate: 7.05,
        ctr: 12.3
      },
      thumbnail: '/api/placeholder/400/300',
      author: 'Ana García',
      abTesting: {
        enabled: true,
        variants: 2
      }
    },
    {
      id: '2',
      title: 'Evento Open House',
      slug: 'open-house-2024',
      status: 'published',
      template: 'event',
      domain: 'openhouse.example.com',
      createdAt: '2024-02-10',
      updatedAt: '2024-02-20',
      metrics: {
        visits: 892,
        leads: 45,
        conversionRate: 5.04,
        ctr: 8.7
      },
      thumbnail: '/api/placeholder/400/300',
      author: 'Carlos Mendoza'
    },
    {
      id: '3',
      title: 'Residencial Vista Hermosa',
      slug: 'vista-hermosa',
      status: 'draft',
      template: 'real-estate',
      domain: 'vista-hermosa.example.com',
      createdAt: '2024-02-18',
      updatedAt: '2024-02-22',
      metrics: {
        visits: 0,
        leads: 0,
        conversionRate: 0,
        ctr: 0
      },
      thumbnail: '/api/placeholder/400/300',
      author: 'María López'
    }
  ];

  const templates = [
    { id: '1', name: 'Inmobiliaria Moderna', category: 'real-estate', thumbnail: '/api/placeholder/300/200' },
    { id: '2', name: 'Promoción Premium', category: 'real-estate', thumbnail: '/api/placeholder/300/200' },
    { id: '3', name: 'Evento Corporativo', category: 'event', thumbnail: '/api/placeholder/300/200' },
    { id: '4', name: 'Landing Minimalista', category: 'generic', thumbnail: '/api/placeholder/300/200' },
    { id: '5', name: 'Showcase Productos', category: 'generic', thumbnail: '/api/placeholder/300/200' },
    { id: '6', name: 'Promoción Especial', category: 'promotion', thumbnail: '/api/placeholder/300/200' }
  ];

  const totalMetrics = {
    totalVisits: landings.reduce((acc, l) => acc + l.metrics.visits, 0),
    totalLeads: landings.reduce((acc, l) => acc + l.metrics.leads, 0),
    avgConversion: landings.filter(l => l.status === 'published').reduce((acc, l) => acc + l.metrics.conversionRate, 0) / landings.filter(l => l.status === 'published').length || 0,
    activeLandings: landings.filter(l => l.status === 'published').length
  };

  const filteredLandings = landings.filter(landing => {
    const matchesSearch = landing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         landing.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || landing.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'published': return <CheckCircle className="w-4 h-4" />;
      case 'draft': return <Clock className="w-4 h-4" />;
      case 'archived': return <Archive className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const WizardComponent = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Crear Nueva Landing</h2>
              <p className="text-gray-600 mt-1">Paso {wizardStep} de 4</p>
            </div>
            <button
              onClick={() => setShowWizard(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="flex items-center mt-6 space-x-2">
            {[
              { step: 1, label: 'Plantilla', icon: Layout },
              { step: 2, label: 'Diseño', icon: Palette },
              { step: 3, label: 'SEO', icon: Settings },
              { step: 4, label: 'Publicar', icon: Rocket }
            ].map((item, index) => (
              <React.Fragment key={item.step}>
                <div className={`flex items-center ${wizardStep >= item.step ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    wizardStep >= item.step ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="ml-2 font-medium hidden sm:block">{item.label}</span>
                </div>
                {index < 3 && (
                  <div className={`flex-1 h-0.5 ${
                    wizardStep > item.step ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {wizardStep === 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Selecciona una Plantilla</h3>
              <div className="mb-4 flex gap-2">
                <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg">Todas</button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Inmobiliarias</button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Eventos</button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Promociones</button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Genéricas</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {templates.map(template => (
                  <div key={template.id} className="border rounded-lg overflow-hidden hover:border-blue-500 cursor-pointer transition-all hover:shadow-lg">
                    <img src={template.thumbnail} alt={template.name} className="w-full h-40 object-cover" />
                    <div className="p-3">
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-gray-500 capitalize">{template.category.replace('-', ' ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {wizardStep === 2 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Personaliza tu Diseño</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Layout className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">Editor Drag & Drop</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">+ Texto</button>
                  <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">+ Imagen</button>
                  <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">+ Formulario</button>
                  <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">+ Mapa</button>
                  <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">+ Botón CTA</button>
                </div>
              </div>
            </div>
          )}

          {wizardStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Configuración SEO y Analítica</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Título</label>
                <input type="text" className="w-full px-4 py-2 border rounded-lg" placeholder="Título para buscadores" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Descripción</label>
                <textarea className="w-full px-4 py-2 border rounded-lg" rows={3} placeholder="Descripción para buscadores" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
                <input type="text" className="w-full px-4 py-2 border rounded-lg" placeholder="palabra1, palabra2, palabra3" />
              </div>
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Integraciones</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span>Google Analytics</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span>Meta Pixel (Facebook)</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span>Google Tag Manager</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {wizardStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Publicación y Dominio</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL de la Landing</label>
                <div className="flex">
                  <select className="px-4 py-2 border rounded-l-lg bg-gray-50">
                    <option>https://</option>
                    <option>http://</option>
                  </select>
                  <input type="text" className="flex-1 px-4 py-2 border-t border-b" placeholder="mi-landing" />
                  <select className="px-4 py-2 border rounded-r-lg bg-gray-50">
                    <option>.tudominio.com</option>
                    <option>.landing.system</option>
                    <option>Dominio personalizado</option>
                  </select>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">Opciones de Publicación</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="radio" name="publish" className="mr-2" defaultChecked />
                    <span>Publicar inmediatamente</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="publish" className="mr-2" />
                    <span>Guardar como borrador</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="publish" className="mr-2" />
                    <span>Programar publicación</span>
                  </label>
                </div>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Configuración Adicional</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span>Habilitar A/B Testing</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span>Activar notificaciones de leads</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span>Conectar con CRM interno</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-between">
          <button
            onClick={() => wizardStep > 1 && setWizardStep(wizardStep - 1)}
            className={`px-6 py-2 rounded-lg ${
              wizardStep === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border hover:bg-gray-50'
            }`}
            disabled={wizardStep === 1}
          >
            Anterior
          </button>
          <button
            onClick={() => {
              if (wizardStep < 4) {
                setWizardStep(wizardStep + 1);
              } else {
                setShowWizard(false);
                setWizardStep(1);
              }
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            {wizardStep === 4 ? 'Crear Landing' : 'Siguiente'}
            {wizardStep < 4 && <ChevronRight className="w-4 h-4 ml-2" />}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Landing Pages</h1>
              <p className="text-gray-600">Crea y gestiona tus páginas de aterrizaje</p>
            </div>
            <button
              onClick={() => setShowWizard(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5 mr-2" />
              Crear Landing
            </button>
          </div>

          <div className="flex space-x-1 mt-6">
            <button
              onClick={() => setSelectedTab('dashboard')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                selectedTab === 'dashboard'
                  ? 'bg-gray-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setSelectedTab('landings')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                selectedTab === 'landings'
                  ? 'bg-gray-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mis Landings
            </button>
            <button
              onClick={() => setSelectedTab('templates')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                selectedTab === 'templates'
                  ? 'bg-gray-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Plantillas
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Landings Activas</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{totalMetrics.activeLandings}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Globe className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total de Visitas</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{totalMetrics.totalVisits.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Leads Generados</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{totalMetrics.totalLeads}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Tasa de Conversión</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{totalMetrics.avgConversion.toFixed(1)}%</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Rendimiento por Landing</h3>
                <div className="space-y-4">
                  {landings.filter(l => l.status === 'published').map(landing => (
                    <div key={landing.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">{landing.title}</p>
                          <p className="text-sm text-gray-500">{landing.metrics.visits} visitas</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{landing.metrics.conversionRate}%</p>
                        <p className="text-xs text-gray-500">conversión</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Actividad Reciente</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm">Nueva landing publicada: <span className="font-medium">Torre Marina</span></p>
                      <p className="text-xs text-gray-500">Hace 2 horas</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm">15 nuevos leads en <span className="font-medium">Open House</span></p>
                      <p className="text-xs text-gray-500">Hace 5 horas</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Edit className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm">Landing editada: <span className="font-medium">Vista Hermosa</span></p>
                      <p className="text-xs text-gray-500">Hace 1 día</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'landings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar landings..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    className="px-4 py-2 border rounded-lg bg-white"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                  >
                    <option value="all">Todos los estados</option>
                    <option value="published">Publicadas</option>
                    <option value="draft">Borradores</option>
                    <option value="archived">Archivadas</option>
                  </select>
                  <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center">
                    <Filter className="w-4 h-4 mr-2" />
                    Más filtros
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLandings.map(landing => (
                  <div key={landing.id} className="bg-white border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img src={landing.thumbnail} alt={landing.title} className="w-full h-48 object-cover" />
                      <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(landing.status)}`}>
                        {getStatusIcon(landing.status)}
                        {landing.status === 'published' ? 'Publicada' : landing.status === 'draft' ? 'Borrador' : 'Archivada'}
                      </div>
                      {landing.abTesting?.enabled && (
                        <div className="absolute top-3 left-3 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                          A/B Test
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1">{landing.title}</h3>
                      <p className="text-sm text-gray-500 mb-3">{landing.domain}</p>
                      
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                          <p className="text-xl font-bold">{landing.metrics.visits}</p>
                          <p className="text-xs text-gray-500">Visitas</p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded-lg">
                          <p className="text-xl font-bold">{landing.metrics.leads}</p>
                          <p className="text-xs text-gray-500">Leads</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <span>CTR: {landing.metrics.ctr}%</span>
                        <span>Conv: {landing.metrics.conversionRate}%</span>
                      </div>

                      <div className="flex gap-2">
                        <button className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center justify-center">
                          <Eye className="w-4 h-4 mr-1" />
                          Vista previa
                        </button>
                        <button className="flex-1 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 flex items-center justify-center">
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </button>
                        <button className="p-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Integraciones Activas</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">HubSpot</p>
                      <p className="text-sm text-gray-500">87 leads sincronizados</p>
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>

                <div className="border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Mailchimp</p>
                      <p className="text-sm text-gray-500">234 contactos</p>
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>

                <div className="border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">CRM Interno</p>
                      <p className="text-sm text-gray-500">Sincronización activa</p>
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'templates' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Categorías de Plantillas</h3>
                <div className="flex gap-2 flex-wrap">
                  <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg">Todas</button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Inmobiliarias</button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Eventos</button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Promociones</button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Genéricas</button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">E-commerce</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...templates, ...templates].map((template, index) => (
                  <div key={`${template.id}-${index}`} className="border rounded-lg overflow-hidden hover:shadow-lg transition-all cursor-pointer">
                    <img src={template.thumbnail} alt={template.name} className="w-full h-48 object-cover" />
                    <div className="p-4">
                      <h4 className="font-medium mb-1">{template.name}</h4>
                      <p className="text-sm text-gray-500 capitalize mb-3">{template.category.replace('-', ' ')}</p>
                      <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Usar Plantilla
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {showWizard && <WizardComponent />}
    </div>
  );
};

export default Landings;