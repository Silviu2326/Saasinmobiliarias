import React, { useState, useEffect } from 'react';
import { PropertyMapPoint, MapSettings } from '../types';
import { clusterProperties, getBoundsFromProperties, formatMapPrice, getPropertyStatusColor, getPropertyTypeIcon } from '../utils';
import MarkerCard from './MarkerCard';

interface PropertiesMapProps {
  properties: PropertyMapPoint[];
  settings: MapSettings;
  onPropertySelect: (property: PropertyMapPoint) => void;
  onBoundsChange: (bounds: any) => void;
  selectedPropertyId?: string;
}

export default function PropertiesMap({
  properties,
  settings,
  onPropertySelect,
  onBoundsChange,
  selectedPropertyId
}: PropertiesMapProps) {
  const [selectedCluster, setSelectedCluster] = useState<any>(null);
  const [zoom, setZoom] = useState(settings.zoom);
  const [center, setCenter] = useState({ lat: 40.4168, lng: -3.7038 }); // Madrid by default

  // Get clusters based on zoom level and settings
  const clusters = settings.clusterEnabled 
    ? clusterProperties(properties, zoom)
    : properties.map(prop => ({
        lat: prop.lat,
        lng: prop.lng,
        properties: [prop],
        isCluster: false
      }));

  // Calculate bounds for current properties (only when properties actually change)
  useEffect(() => {
    if (properties.length > 0) {
      const bounds = getBoundsFromProperties(properties);
      if (bounds) {
        // Use a timeout to debounce bounds updates
        const timeoutId = setTimeout(() => {
          onBoundsChange(bounds);
        }, 100);
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [properties.length, onBoundsChange]); // Only depend on length to prevent loops

  // Handle zoom change
  const handleZoomChange = (newZoom: number) => {
    setZoom(Math.max(1, Math.min(18, newZoom)));
  };

  // Handle cluster click
  const handleClusterClick = (cluster: any) => {
    if (cluster.isCluster) {
      setSelectedCluster(cluster);
    } else {
      onPropertySelect(cluster.properties[0]);
    }
  };

  // Simulate map pan
  const handlePan = (direction: 'up' | 'down' | 'left' | 'right') => {
    const panDistance = 0.01 / zoom; // Smaller pan at higher zoom
    setCenter(prev => {
      switch (direction) {
        case 'up':
          return { ...prev, lat: prev.lat + panDistance };
        case 'down':
          return { ...prev, lat: prev.lat - panDistance };
        case 'left':
          return { ...prev, lng: prev.lng - panDistance };
        case 'right':
          return { ...prev, lng: prev.lng + panDistance };
        default:
          return prev;
      }
    });
  };

  return (
    <div className="relative h-full bg-gray-100 rounded-lg overflow-hidden">
      {/* Map placeholder with grid */}
      <div 
        className="w-full h-full relative"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      >
        {/* Map controls */}
        <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
          {/* Zoom controls */}
          <div className="bg-white rounded-md shadow-lg">
            <button
              onClick={() => handleZoomChange(zoom + 1)}
              className="block w-10 h-10 flex items-center justify-center border-b border-gray-200 hover:bg-gray-50 rounded-t-md"
            >
              <span className="text-lg font-bold">+</span>
            </button>
            <div className="px-2 py-1 text-xs text-center border-b border-gray-200 bg-gray-50">
              {zoom}
            </div>
            <button
              onClick={() => handleZoomChange(zoom - 1)}
              className="block w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-b-md"
            >
              <span className="text-lg font-bold">−</span>
            </button>
          </div>

          {/* Pan controls */}
          <div className="bg-white rounded-md shadow-lg">
            <div className="grid grid-cols-3 gap-0">
              <div></div>
              <button
                onClick={() => handlePan('up')}
                className="w-10 h-8 flex items-center justify-center hover:bg-gray-50 rounded-tl-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <div></div>
              
              <button
                onClick={() => handlePan('left')}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                className="w-8 h-8 flex items-center justify-center bg-gray-100 cursor-default"
              >
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              </button>
              <button
                onClick={() => handlePan('right')}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <div></div>
              <button
                onClick={() => handlePan('down')}
                className="w-10 h-8 flex items-center justify-center hover:bg-gray-50 rounded-br-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div></div>
            </div>
          </div>
        </div>

        {/* Properties/Clusters */}
        <div className="absolute inset-0 p-8">
          {clusters.map((cluster, index) => {
            const isSelected = selectedPropertyId && cluster.properties.some(p => p.id === selectedPropertyId);
            
            return (
              <div
                key={`cluster-${index}`}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                style={{
                  left: `${((cluster.lng + 3.7038) * 100 + 50) % 100}%`,
                  top: `${(50 - (cluster.lat - 40.4168) * 200) % 100}%`
                }}
                onClick={() => handleClusterClick(cluster)}
              >
                {cluster.isCluster ? (
                  // Cluster marker
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ${
                      cluster.properties.length > 10 ? 'bg-red-500' :
                      cluster.properties.length > 5 ? 'bg-orange-500' :
                      'bg-blue-500'
                    }`}>
                      {cluster.properties.length}
                    </div>
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-4 border-l-transparent border-r-transparent border-t-current"></div>
                  </div>
                ) : (
                  // Individual property marker
                  <div className="relative">
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs shadow-lg border-2 ${
                        isSelected ? 'border-yellow-400' : 'border-white'
                      }`}
                      style={{ backgroundColor: getPropertyStatusColor(cluster.properties[0].status) }}
                    >
                      <span className="text-lg">
                        {getPropertyTypeIcon(cluster.properties[0].type)}
                      </span>
                    </div>
                    <div 
                      className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-4 border-l-transparent border-r-transparent"
                      style={{ 
                        borderTopColor: getPropertyStatusColor(cluster.properties[0].status),
                        filter: isSelected ? 'drop-shadow(0 0 2px #facc15)' : 'none'
                      }}
                    ></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Map info */}
        <div className="absolute bottom-4 left-4 bg-white rounded-md shadow-lg px-3 py-2 text-sm">
          <div>Centro: {center.lat.toFixed(4)}, {center.lng.toFixed(4)}</div>
          <div>Zoom: {zoom}</div>
          <div>Propiedades: {properties.length}</div>
          <div>Clusters: {clusters.length}</div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 right-16 bg-white rounded-md shadow-lg px-3 py-2">
          <div className="text-sm font-medium mb-2">Leyenda</div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Activo</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Vendido</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-violet-500"></div>
              <span>Alquilado</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              <span>Borrador</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cluster details popup */}
      {selectedCluster && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-96 overflow-y-auto">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium">
                {selectedCluster.properties.length} Propiedades en esta zona
              </h3>
              <button
                onClick={() => setSelectedCluster(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-3">
              {selectedCluster.properties.map((property: PropertyMapPoint) => (
                <MarkerCard
                  key={property.id}
                  property={property}
                  onClick={() => {
                    onPropertySelect(property);
                    setSelectedCluster(null);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}