import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  RouteVisit, 
  OptimizedRoute, 
  RouteOptimizationSettings, 
  RoutePlannerFilters, 
  RouteStats 
} from './types';
import { 
  generateMockRoutingVisits, 
  generateMockOptimizedRoutes, 
  optimizeRoute as apiOptimizeRoute 
} from './apis';
import { 
  optimizeRouteNearestNeighbor, 
  calculateRouteStats, 
  validateRoute, 
  generateRouteExport,
  sortVisitsByPriority 
} from './utils';
import RoutePlannerToolbar from './components/RoutePlannerToolbar';
import RouteBuilder from './components/RouteBuilder';
import OptimizationDialog from './components/OptimizationDialog';

export default function RoutePlannerPage() {
  // Data state
  const [availableVisits, setAvailableVisits] = useState<RouteVisit[]>([]);
  const [currentRoute, setCurrentRoute] = useState<OptimizedRoute | null>(null);
  const [savedRoutes, setSavedRoutes] = useState<OptimizedRoute[]>([]);
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<RouteVisit | null>(null);
  
  // Dialog states
  const [showOptimizationDialog, setShowOptimizationDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState<RoutePlannerFilters>({
    fecha: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
    estado: 'all',
    prioridad: 'all'
  });

  // Default optimization settings
  const [optimizationSettings, setOptimizationSettings] = useState<RouteOptimizationSettings>({
    startLocation: {
      lat: 40.4168,
      lng: -3.7038,
      address: 'Oficina Central, Madrid',
      name: 'Oficina'
    },
    startTime: '09:00',
    averageVisitDuration: 60,
    averageSpeedKmh: 30,
    includeTrafficBuffer: true,
    trafficBufferPercent: 20,
    prioritizeTimeWindows: true
  });

  // Calculate route stats - using useMemo for performance
  const routeStats: RouteStats | null = useMemo(() => {
    return currentRoute ? calculateRouteStats(currentRoute) : null;
  }, [currentRoute]);

  // Load initial data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load available visits for routing
      const visits = generateMockRoutingVisits(12);
      setAvailableVisits(sortVisitsByPriority(visits));
      
      // Load saved routes
      const routes = generateMockOptimizedRoutes(3);
      setSavedRoutes(routes);
      
      // Set active route if exists
      const activeRoute = routes.find(r => r.status === 'active');
      if (activeRoute) {
        setCurrentRoute(activeRoute);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Create new route - memoized for performance
  const handleNewRoute = useCallback(() => {
    if (hasUnsavedChanges) {
      if (!confirm('¿Descartar los cambios no guardados?')) return;
    }

    const newRoute: OptimizedRoute = {
      id: `route-${Date.now()}`,
      agenteId: 'current-agent',
      agenteNombre: 'Usuario Actual',
      fecha: filters.fecha || new Date().toISOString().split('T')[0],
      stops: [],
      totalDistance: 0,
      totalTime: 0,
      totalVisits: 0,
      startLocation: optimizationSettings.startLocation,
      optimizationMethod: 'manual',
      createdAt: new Date().toISOString(),
      status: 'draft'
    };

    setCurrentRoute(newRoute);
    setHasUnsavedChanges(false);
  }, [hasUnsavedChanges, filters.fecha, optimizationSettings.startLocation]);

  // Handle route changes - memoized for performance
  const handleRouteChange = useCallback((updatedRoute: OptimizedRoute) => {
    setCurrentRoute(updatedRoute);
    setHasUnsavedChanges(true);
  }, []);

  // Handle optimization
  const handleOptimize = async (settings: RouteOptimizationSettings) => {
    if (!currentRoute) return;

    setIsOptimizing(true);
    setOptimizationSettings(settings);
    setShowOptimizationDialog(false);

    try {
      // Get visits to optimize (either from current route or available visits)
      const visitsToOptimize = currentRoute.stops.length > 0 
        ? currentRoute.stops.map(stop => stop.visit)
        : availableVisits.filter(v => v.confirmado); // Only confirmed visits

      if (visitsToOptimize.length === 0) {
        alert('No hay visitas para optimizar. Agrega visitas a la ruta primero.');
        return;
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Use local optimization algorithm
      const optimizedStops = optimizeRouteNearestNeighbor(visitsToOptimize, settings);
      
      const totalDistance = optimizedStops.reduce((sum, stop) => sum + (stop.travelDistance || 0), 0);
      const totalTime = optimizedStops.reduce((sum, stop) => sum + (stop.travelTime || 0) + stop.visit.tiempoEstimado, 0);

      const optimizedRoute: OptimizedRoute = {
        ...currentRoute,
        stops: optimizedStops,
        totalDistance: Math.round(totalDistance * 10) / 10,
        totalTime: Math.round(totalTime),
        totalVisits: optimizedStops.length,
        startLocation: settings.startLocation,
        optimizationMethod: 'nearest-neighbor',
        createdAt: new Date().toISOString()
      };

      // Validate the route
      const validation = validateRoute(optimizedRoute, settings);
      if (!validation.isValid) {
        console.warn('Route validation errors:', validation.errors);
      }
      if (validation.warnings.length > 0) {
        console.warn('Route validation warnings:', validation.warnings);
      }

      setCurrentRoute(optimizedRoute);
      setHasUnsavedChanges(true);

      // Show results
      const stats = calculateRouteStats(optimizedRoute);
      alert(`Ruta optimizada exitosamente!\n\nVisitas: ${stats.totalVisits}\nDistancia: ${stats.totalDistance}km\nTiempo: ${Math.round(stats.totalTime/60)}h ${stats.totalTime%60}m\nEficiencia: ${stats.efficiency}%`);

    } catch (error) {
      console.error('Error optimizing route:', error);
      alert('Error al optimizar la ruta. Inténtalo de nuevo.');
    } finally {
      setIsOptimizing(false);
    }
  };

  // Handle save route
  const handleSaveRoute = async () => {
    if (!currentRoute) return;

    try {
      setIsLoading(true);
      
      // Simulate API save
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const savedRoute = {
        ...currentRoute,
        status: 'active' as const
      };

      // Update saved routes
      setSavedRoutes(prev => {
        const filtered = prev.filter(r => r.id !== savedRoute.id);
        return [...filtered, savedRoute];
      });

      setCurrentRoute(savedRoute);
      setHasUnsavedChanges(false);
      
      alert('Ruta guardada exitosamente');
    } catch (error) {
      console.error('Error saving route:', error);
      alert('Error al guardar la ruta');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle export route
  const handleExportRoute = () => {
    if (!currentRoute) return;

    const csvContent = generateRouteExport(currentRoute);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `ruta_${currentRoute.id}_${currentRoute.fecha}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Handle load route dialog
  const handleLoadRoute = () => {
    setShowLoadDialog(true);
  };

  // Handle select saved route
  const handleSelectSavedRoute = (route: OptimizedRoute) => {
    if (hasUnsavedChanges) {
      if (!confirm('¿Descartar los cambios no guardados?')) return;
    }

    setCurrentRoute(route);
    setHasUnsavedChanges(false);
    setShowLoadDialog(false);
  };

  // Handle visit select for details
  const handleVisitSelect = (visit: RouteVisit) => {
    setSelectedVisit(visit);
    // In a real app, this might open a detailed modal
    alert(`Detalles de visita:\n\nCliente: ${visit.clienteNombre}\nPropiedad: ${visit.propertyTitle}\nHorario: ${visit.ventanaHoraria}\nPrioridad: ${visit.prioridad}\nDuración: ${visit.tiempoEstimado}min`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toolbar */}
      <RoutePlannerToolbar
        onNewRoute={handleNewRoute}
        onLoadRoute={handleLoadRoute}
        onExportRoute={handleExportRoute}
        onOptimizeRoute={() => setShowOptimizationDialog(true)}
        selectedRoute={currentRoute}
        routeStats={routeStats}
        isLoading={isOptimizing}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      {/* Main Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <svg className="animate-spin w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="text-gray-600">Cargando planificador de rutas...</span>
            </div>
          </div>
        ) : (
          <RouteBuilder
            availableVisits={availableVisits}
            currentRoute={currentRoute}
            onRouteChange={handleRouteChange}
            onVisitSelect={handleVisitSelect}
            isOptimizing={isOptimizing}
          />
        )}
      </div>

      {/* Floating Save Button */}
      {hasUnsavedChanges && currentRoute && (
        <button
          onClick={handleSaveRoute}
          className="fixed bottom-6 right-6 px-4 py-2 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>Guardar Ruta</span>
        </button>
      )}

      {/* Optimization Dialog */}
      <OptimizationDialog
        isOpen={showOptimizationDialog}
        onClose={() => setShowOptimizationDialog(false)}
        onOptimize={handleOptimize}
        currentSettings={optimizationSettings}
        isLoading={isOptimizing}
      />

      {/* Load Route Dialog */}
      {showLoadDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Cargar Ruta Guardada</h3>
                <button
                  onClick={() => setShowLoadDialog(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-3 overflow-y-auto max-h-80">
              {savedRoutes.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-gray-500">No hay rutas guardadas</p>
                </div>
              ) : (
                savedRoutes.map((route) => (
                  <div
                    key={route.id}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleSelectSavedRoute(route)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          Ruta {route.agenteNombre}
                        </h4>
                        <p className="text-xs text-gray-500">{route.fecha}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        route.status === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {route.status === 'active' ? 'Activa' : 'Borrador'}
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 space-x-4">
                      <span>{route.totalVisits} visitas</span>
                      <span>{route.totalDistance}km</span>
                      <span>{Math.round(route.totalTime/60)}h {route.totalTime%60}m</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}