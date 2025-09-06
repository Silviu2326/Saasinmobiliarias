import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Filter,
  SlidersHorizontal,
  MapPin,
  Home,
  DollarSign,
  Bed,
  Bath,
  Square,
  Heart,
  Share2,
  Eye,
  HandshakeIcon,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { CoExclusivaCard } from './components/CoExclusivaCard';
import { CoExclusivasFiltersComponent } from './components/CoExclusivasFilters';
import { CoExclusivaDetailModal } from './components/CoExclusivaDetailModal';
import { useCoExclusivas } from './hooks/useCoExclusivas';

export interface CoExclusiva {
  id: string;
  titulo: string;
  descripcion: string;
  precio: number;
  ubicacion: {
    direccion: string;
    ciudad: string;
    codigoPostal: string;
    coordenadas: {
      lat: number;
      lng: number;
    };
  };
  tipo: 'piso' | 'chalet' | 'local' | 'oficina' | 'terreno' | 'garaje';
  caracteristicas: {
    habitaciones: number;
    banos: number;
    superficie: number;
    terraza?: boolean;
    jardin?: boolean;
    garaje?: boolean;
    ascensor?: boolean;
  };
  estado: 'disponible' | 'reservada' | 'vendida';
  imagenes: string[];
  colaboracion: {
    porcentajeHonorarios: number;
    condiciones: string;
    tipoColaboracion: 'venta' | 'alquiler' | 'ambos';
  };
  agencia: {
    nombre: string;
    contacto: string;
    telefono: string;
    email: string;
    logo?: string;
  };
  fechaPublicacion: string;
  fechaModificacion: string;
  destacada: boolean;
  favorita?: boolean;
}

export interface CoExclusivasFilters {
  ubicacion?: string;
  tipo?: string;
  precioMin?: number;
  precioMax?: number;
  habitaciones?: number;
  banos?: number;
  estado?: string;
  tipoColaboracion?: string;
}

export default function CoExclusivasPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProperty, setSelectedProperty] = useState<CoExclusiva | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showNewPropertyForm, setShowNewPropertyForm] = useState(false);
  
  const {
    propiedades,
    loading,
    error,
    filters,
    pagination,
    updateFilters,
    nextPage,
    prevPage,
    toggleFavorite,
    addProperty,
    updateProperty,
    deleteProperty
  } = useCoExclusivas();

  const handlePropertyClick = (property: CoExclusiva) => {
    setSelectedProperty(property);
  };

  const handleCloseModal = () => {
    setSelectedProperty(null);
  };

  const handleAddProperty = () => {
    setShowNewPropertyForm(true);
  };

  const handleFiltersChange = (newFilters: CoExclusivasFilters) => {
    updateFilters(newFilters);
    setShowFilters(false);
  };

  const clearFilters = () => {
    updateFilters({});
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar propiedades</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <HandshakeIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Co-exclusivas</h1>
                <p className="text-xs text-gray-500">Marketplace de propiedades colaborativas</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por ubicación, tipo..."
                  className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => updateFilters({ ubicacion: e.target.value })}
                />
              </div>

              {/* Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`relative p-2 border border-gray-300 rounded-lg hover:bg-gray-50 ${
                  activeFiltersCount > 0 ? 'bg-blue-50 border-blue-300' : ''
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              {/* Add Property Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddProperty}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Añadir Propiedad
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border-b border-gray-200 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <CoExclusivasFiltersComponent
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClear={clearFilters}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="bg-gray-100 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Filtros activos:</span>
                <div className="flex flex-wrap gap-2">
                  {filters.ubicacion && (
                    <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      <MapPin className="h-3 w-3 mr-1" />
                      {filters.ubicacion}
                      <button
                        onClick={() => updateFilters({ ubicacion: undefined })}
                        className="ml-1 hover:text-blue-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {filters.tipo && (
                    <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      <Home className="h-3 w-3 mr-1" />
                      {filters.tipo}
                      <button
                        onClick={() => updateFilters({ tipo: undefined })}
                        className="ml-1 hover:text-green-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {(filters.precioMin || filters.precioMax) && (
                    <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                      <DollarSign className="h-3 w-3 mr-1" />
                      {filters.precioMin ? `€${filters.precioMin}+` : ''} 
                      {filters.precioMin && filters.precioMax ? ' - ' : ''}
                      {filters.precioMax ? `€${filters.precioMax}` : ''}
                      <button
                        onClick={() => updateFilters({ precioMin: undefined, precioMax: undefined })}
                        className="ml-1 hover:text-purple-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Limpiar todos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <p className="text-sm text-gray-600">
              {loading ? 'Cargando...' : `${pagination.total} propiedades encontradas`}
            </p>
            {pagination.total > 0 && (
              <p className="text-sm text-gray-500">
                Página {pagination.currentPage} de {pagination.totalPages}
              </p>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Properties Grid/List */}
        {!loading && propiedades && propiedades.length > 0 && (
          <motion.div
            layout
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }
          >
            <AnimatePresence>
              {propiedades?.map((propiedad) => (
                <motion.div
                  key={propiedad.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <CoExclusivaCard
                    propiedad={propiedad}
                    viewMode={viewMode}
                    onClick={handlePropertyClick}
                    onToggleFavorite={toggleFavorite}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && propiedades && propiedades.length === 0 && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <HandshakeIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron propiedades
              </h3>
              <p className="text-gray-500 mb-6">
                {activeFiltersCount > 0
                  ? 'No hay propiedades que coincidan con los filtros seleccionados.'
                  : 'Aún no hay propiedades disponibles para co-exclusiva.'}
              </p>
              <div className="space-x-3">
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                  >
                    Limpiar filtros
                  </button>
                )}
                <button
                  onClick={handleAddProperty}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Añadir primera propiedad
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-8">
            <button
              onClick={prevPage}
              disabled={pagination.currentPage === 1}
              className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => {/* TODO: go to page */}}
                    className={`px-3 py-2 text-sm border rounded-lg ${
                      pagination.currentPage === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              onClick={nextPage}
              disabled={pagination.currentPage === pagination.totalPages}
              className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        )}
      </div>

      {/* Property Detail Modal */}
      <AnimatePresence>
        {selectedProperty && (
          <CoExclusivaDetailModal
            propiedad={selectedProperty}
            onClose={handleCloseModal}
            onToggleFavorite={toggleFavorite}
          />
        )}
      </AnimatePresence>

      {/* Floating Action Button (Mobile) */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleAddProperty}
          className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center"
        >
          <Plus className="h-6 w-6" />
        </motion.button>
      </div>
    </div>
  );
}