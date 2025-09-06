import React, { useState } from 'react';
import { 
  Search, 
  Upload, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Send,
  Filter,
  Image,
  FileText,
  Globe,
  RotateCw
} from 'lucide-react';

interface Property {
  id: string;
  reference: string;
  address: string;
  price: number;
  status: 'published' | 'unpublished' | 'pending';
  type: string;
  rooms: number;
  bathrooms: number;
  area: number;
}

interface Portal {
  id: string;
  name: string;
  logo: string;
  status: 'connected' | 'error' | 'expired';
  lastSync?: string;
}

interface PublicationResult {
  propertyId: string;
  propertyRef: string;
  portalId: string;
  portalName: string;
  status: 'success' | 'error' | 'pending';
  message?: string;
  timestamp: string;
}

interface PortalConfig {
  [portalId: string]: {
    title: string;
    longDescription: string;
    shortDescription: string;
    images: File[];
    category?: string;
    propertyType?: string;
  };
}

const Portales: React.FC = () => {
  const [selectedProperties, setSelectedProperties] = useState<Set<string>>(new Set());
  const [selectedPortals, setSelectedPortals] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [resultsFilter, setResultsFilter] = useState<string>('all');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publicationResults, setPublicationResults] = useState<PublicationResult[]>([]);
  const [portalConfig, setPortalConfig] = useState<PortalConfig>({});
  const [activeConfigTab, setActiveConfigTab] = useState<string>('idealista');

  // Mock data
  const properties: Property[] = [
    { 
      id: '1', 
      reference: 'REF001', 
      address: 'Calle Gran Vía 123, Madrid', 
      price: 450000, 
      status: 'unpublished',
      type: 'Piso',
      rooms: 3,
      bathrooms: 2,
      area: 120
    },
    { 
      id: '2', 
      reference: 'REF002', 
      address: 'Paseo de Gracia 45, Barcelona', 
      price: 650000, 
      status: 'published',
      type: 'Ático',
      rooms: 4,
      bathrooms: 3,
      area: 180
    },
    { 
      id: '3', 
      reference: 'REF003', 
      address: 'Calle Alcalá 78, Madrid', 
      price: 380000, 
      status: 'unpublished',
      type: 'Piso',
      rooms: 2,
      bathrooms: 1,
      area: 90
    },
    { 
      id: '4', 
      reference: 'REF004', 
      address: 'Avenida Diagonal 234, Barcelona', 
      price: 890000, 
      status: 'pending',
      type: 'Casa',
      rooms: 5,
      bathrooms: 4,
      area: 250
    },
  ];

  const portals: Portal[] = [
    { 
      id: 'idealista', 
      name: 'Idealista', 
      logo: '🏠', 
      status: 'connected',
      lastSync: '2024-01-15 10:30'
    },
    { 
      id: 'fotocasa', 
      name: 'Fotocasa', 
      logo: '🏡', 
      status: 'connected',
      lastSync: '2024-01-15 09:45'
    },
    { 
      id: 'habitaclia', 
      name: 'Habitaclia', 
      logo: '🏘️', 
      status: 'expired',
      lastSync: '2024-01-10 14:20'
    },
    { 
      id: 'pisos', 
      name: 'Pisos.com', 
      logo: '🏢', 
      status: 'error',
      lastSync: '2024-01-14 16:15'
    },
  ];

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPrice = (!priceRange.min || property.price >= parseInt(priceRange.min)) &&
                        (!priceRange.max || property.price <= parseInt(priceRange.max));
    
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    
    return matchesSearch && matchesPrice && matchesStatus;
  });

  const filteredResults = publicationResults.filter(result => {
    return resultsFilter === 'all' || result.status === resultsFilter;
  });

  const handleSelectAllProperties = () => {
    if (selectedProperties.size === filteredProperties.length) {
      setSelectedProperties(new Set());
    } else {
      setSelectedProperties(new Set(filteredProperties.map(p => p.id)));
    }
  };

  const handlePropertyToggle = (propertyId: string) => {
    const newSelected = new Set(selectedProperties);
    if (newSelected.has(propertyId)) {
      newSelected.delete(propertyId);
    } else {
      newSelected.add(propertyId);
    }
    setSelectedProperties(newSelected);
  };

  const handlePortalToggle = (portalId: string) => {
    const newSelected = new Set(selectedPortals);
    if (newSelected.has(portalId)) {
      newSelected.delete(portalId);
    } else {
      newSelected.add(portalId);
    }
    setSelectedPortals(newSelected);
  };

  const handlePublish = async () => {
    setShowConfirmModal(false);
    setIsPublishing(true);
    setPublicationResults([]);

    // Simulate publication process
    const results: PublicationResult[] = [];
    
    for (const propertyId of selectedProperties) {
      const property = properties.find(p => p.id === propertyId);
      if (!property) continue;

      for (const portalId of selectedPortals) {
        const portal = portals.find(p => p.id === portalId);
        if (!portal) continue;

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const result: PublicationResult = {
          propertyId: property.id,
          propertyRef: property.reference,
          portalId: portal.id,
          portalName: portal.name,
          status: Math.random() > 0.2 ? 'success' : 'error',
          message: Math.random() > 0.2 ? 'Publicado correctamente' : 'Error de conexión',
          timestamp: new Date().toISOString()
        };

        results.push(result);
        setPublicationResults([...results]);
      }
    }

    setIsPublishing(false);
  };

  const handleRetryPublication = (propertyId: string, portalId: string) => {
    const existingResults = publicationResults.filter(
      r => !(r.propertyId === propertyId && r.portalId === portalId)
    );

    const property = properties.find(p => p.id === propertyId);
    const portal = portals.find(p => p.id === portalId);

    if (property && portal) {
      const newResult: PublicationResult = {
        propertyId: property.id,
        propertyRef: property.reference,
        portalId: portal.id,
        portalName: portal.name,
        status: 'success',
        message: 'Republicado correctamente',
        timestamp: new Date().toISOString()
      };

      setPublicationResults([...existingResults, newResult]);
    }
  };

  const handleImageUpload = (portalId: string, files: FileList | null) => {
    if (!files) return;
    
    const fileArray = Array.from(files);
    setPortalConfig(prev => ({
      ...prev,
      [portalId]: {
        ...prev[portalId],
        images: fileArray
      }
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'success':
      case 'published':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'error':
      case 'expired':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      published: 'bg-green-100 text-green-800',
      unpublished: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      success: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      connected: 'bg-green-100 text-green-800',
      expired: 'bg-orange-100 text-orange-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800'}`}>
        {status === 'published' ? 'Publicado' : 
         status === 'unpublished' ? 'No publicado' :
         status === 'pending' ? 'Pendiente' :
         status === 'connected' ? 'Conectado' :
         status === 'expired' ? 'Expirado' :
         status === 'error' ? 'Error' :
         status === 'success' ? 'Éxito' : status}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Publicación en Portales</h1>
        <p className="text-gray-600">Gestiona y publica tus inmuebles en los principales portales inmobiliarios</p>
      </div>

      {/* Search and Actions Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por referencia o dirección..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSelectAllProperties}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {selectedProperties.size === filteredProperties.length ? 'Limpiar selección' : 'Seleccionar todo'}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {selectedProperties.size} inmuebles · {selectedPortals.size} portales
            </span>
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={selectedProperties.size === 0 || selectedPortals.size === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Publicar en portales
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Properties Selection */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Selección de Inmuebles</h2>
              <div className="mt-3 flex gap-2">
                <input
                  type="number"
                  placeholder="Precio mín."
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Precio máx."
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos los estados</option>
                  <option value="published">Publicados</option>
                  <option value="unpublished">No publicados</option>
                  <option value="pending">Pendientes</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedProperties.size === filteredProperties.length && filteredProperties.length > 0}
                        onChange={handleSelectAllProperties}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Referencia
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dirección
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProperties.map((property) => (
                    <tr key={property.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedProperties.has(property.id)}
                          onChange={() => handlePropertyToggle(property.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {property.reference}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {property.address}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        €{property.price.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(property.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Portals Selection */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Portales Conectados</h2>
            </div>
            <div className="p-4 space-y-3">
              {portals.map((portal) => (
                <div key={portal.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedPortals.has(portal.id)}
                      onChange={() => handlePortalToggle(portal.id)}
                      disabled={portal.status !== 'connected'}
                      className="rounded border-gray-300 disabled:opacity-50"
                    />
                    <span className="text-2xl">{portal.logo}</span>
                    <div>
                      <p className="font-medium text-gray-900">{portal.name}</p>
                      <p className="text-xs text-gray-500">Última sincr.: {portal.lastSync}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(portal.status)}
                    {getStatusBadge(portal.status)}
                    {(portal.status === 'expired' || portal.status === 'error') && (
                      <button className="p-1 text-gray-500 hover:text-blue-600">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Configuration */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Configuración Personalizada</h2>
            </div>
            <div className="p-4">
              <div className="flex gap-2 mb-4 border-b">
                {portals.filter(p => selectedPortals.has(p.id)).map((portal) => (
                  <button
                    key={portal.id}
                    onClick={() => setActiveConfigTab(portal.id)}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      activeConfigTab === portal.id
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {portal.name}
                  </button>
                ))}
              </div>

              {selectedPortals.size > 0 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Título
                    </label>
                    <input
                      type="text"
                      placeholder="Título personalizado para el portal"
                      value={portalConfig[activeConfigTab]?.title || ''}
                      onChange={(e) => setPortalConfig(prev => ({
                        ...prev,
                        [activeConfigTab]: {
                          ...prev[activeConfigTab],
                          title: e.target.value
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción larga
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Descripción detallada del inmueble"
                      value={portalConfig[activeConfigTab]?.longDescription || ''}
                      onChange={(e) => setPortalConfig(prev => ({
                        ...prev,
                        [activeConfigTab]: {
                          ...prev[activeConfigTab],
                          longDescription: e.target.value
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción corta
                    </label>
                    <input
                      type="text"
                      placeholder="Descripción breve (máx. 100 caracteres)"
                      value={portalConfig[activeConfigTab]?.shortDescription || ''}
                      onChange={(e) => setPortalConfig(prev => ({
                        ...prev,
                        [activeConfigTab]: {
                          ...prev[activeConfigTab],
                          shortDescription: e.target.value
                        }
                      }))}
                      maxLength={100}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fotos específicas
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleImageUpload(activeConfigTab, e.target.files)}
                        className="hidden"
                        id={`file-upload-${activeConfigTab}`}
                      />
                      <label
                        htmlFor={`file-upload-${activeConfigTab}`}
                        className="cursor-pointer"
                      >
                        <Image className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          Arrastra fotos aquí o haz clic para seleccionar
                        </p>
                        {portalConfig[activeConfigTab]?.images?.length > 0 && (
                          <p className="text-xs text-blue-600 mt-2">
                            {portalConfig[activeConfigTab].images.length} fotos seleccionadas
                          </p>
                        )}
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Categoría
                      </label>
                      <select
                        value={portalConfig[activeConfigTab]?.category || ''}
                        onChange={(e) => setPortalConfig(prev => ({
                          ...prev,
                          [activeConfigTab]: {
                            ...prev[activeConfigTab],
                            category: e.target.value
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Seleccionar categoría</option>
                        <option value="venta">Venta</option>
                        <option value="alquiler">Alquiler</option>
                        <option value="vacacional">Alquiler vacacional</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de inmueble
                      </label>
                      <select
                        value={portalConfig[activeConfigTab]?.propertyType || ''}
                        onChange={(e) => setPortalConfig(prev => ({
                          ...prev,
                          [activeConfigTab]: {
                            ...prev[activeConfigTab],
                            propertyType: e.target.value
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Seleccionar tipo</option>
                        <option value="piso">Piso</option>
                        <option value="casa">Casa</option>
                        <option value="atico">Ático</option>
                        <option value="duplex">Dúplex</option>
                        <option value="local">Local comercial</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Results Panel */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Panel de Estado y Resultados</h2>
              {isPublishing && (
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm">Publicando...</span>
                </div>
              )}
            </div>
            {publicationResults.length > 0 && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setResultsFilter('all')}
                  className={`px-3 py-1 text-sm rounded-lg ${
                    resultsFilter === 'all' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Todos ({publicationResults.length})
                </button>
                <button
                  onClick={() => setResultsFilter('success')}
                  className={`px-3 py-1 text-sm rounded-lg ${
                    resultsFilter === 'success' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Éxito ({publicationResults.filter(r => r.status === 'success').length})
                </button>
                <button
                  onClick={() => setResultsFilter('error')}
                  className={`px-3 py-1 text-sm rounded-lg ${
                    resultsFilter === 'error' 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Errores ({publicationResults.filter(r => r.status === 'error').length})
                </button>
                <button
                  onClick={() => setResultsFilter('pending')}
                  className={`px-3 py-1 text-sm rounded-lg ${
                    resultsFilter === 'pending' 
                      ? 'bg-yellow-100 text-yellow-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Pendientes ({publicationResults.filter(r => r.status === 'pending').length})
                </button>
              </div>
            )}
          </div>
          
          <div className="p-4">
            {publicationResults.length === 0 ? (
              <div className="text-center py-12">
                <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">
                  Los resultados de publicación aparecerán aquí
                </p>
                <p className="text-gray-400 text-xs mt-2">
                  Selecciona inmuebles y portales para comenzar
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Inmueble
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Portal
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mensaje
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredResults.map((result, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {result.propertyRef}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {result.portalName}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(result.status)}
                            {getStatusBadge(result.status)}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {result.message}
                        </td>
                        <td className="px-4 py-3">
                          {result.status === 'error' && (
                            <button
                              onClick={() => handleRetryPublication(result.propertyId, result.portalId)}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                            >
                              <RotateCw className="w-3 h-3" />
                              Reintentar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirmar Publicación Masiva
            </h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Inmuebles seleccionados:</span>
                <span className="font-medium">{selectedProperties.size}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Portales seleccionados:</span>
                <span className="font-medium">{selectedPortals.size}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total publicaciones:</span>
                <span className="font-medium text-blue-600">
                  {selectedProperties.size * selectedPortals.size}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Fecha y hora:</span>
                <span className="font-medium">
                  {new Date().toLocaleString('es-ES')}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handlePublish}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Confirmar y Publicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portales;