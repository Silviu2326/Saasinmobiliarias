import React from 'react';
import { useExports } from '../hooks';

const EXPORT_FORMATS = [
  { type: 'CSV' as const, label: 'Exportar CSV', icon: '📄' },
  { type: 'JSON' as const, label: 'Exportar JSON', icon: '📄' },
  { type: 'PNG' as const, label: 'Exportar PNG', icon: '🖼️' }
];

export function ExportBar() {
  const { exportData, loading } = useExports();

  const handleExport = async (format: 'CSV' | 'JSON' | 'PNG') => {
    // Mock data for export
    const mockData = {
      agents: [
        { name: 'Ana García', activities: 245, visits: 28, offers: 15, contracts: 8 },
        { name: 'Carlos López', activities: 198, visits: 22, offers: 12, contracts: 5 },
        { name: 'María Rodríguez', activities: 312, visits: 35, offers: 18, contracts: 10 }
      ],
      summary: {
        totalActivities: 755,
        totalVisits: 85,
        totalOffers: 45,
        totalContracts: 23
      },
      period: {
        from: '2024-01-01',
        to: '2024-01-31'
      }
    };

    const filename = `productividad_${new Date().toISOString().split('T')[0]}`;
    await exportData(format, mockData, filename);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="text-sm text-gray-600">Exportar:</div>
      
      {EXPORT_FORMATS.map((format) => (
        <button
          key={format.type}
          onClick={() => handleExport(format.type)}
          disabled={loading}
          className="flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 disabled:opacity-50"
        >
          <span>{format.icon}</span>
          <span>{format.type}</span>
        </button>
      ))}
      
      {/* Advanced Export Options */}
      <div className="relative ml-2">
        <button className="flex items-center gap-1 rounded-md bg-blue-100 px-3 py-1 text-sm text-blue-700 hover:bg-blue-200">
          <span>⚙️</span>
          <span>Opciones</span>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {/* Dropdown would go here */}
      </div>
      
      {loading && (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
          <span>Exportando...</span>
        </div>
      )}
    </div>
  );
}