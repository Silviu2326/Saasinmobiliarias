import React, { useState, useEffect, useRef } from 'react';
import InmuebleForm from './components/InmuebleForm';
import CarteraTable from './components/CarteraTable';
import CarteraStats from './components/CarteraStats';
import InmuebleDetails from './components/InmuebleDetails';
import {
  InmuebleCartera,
  CarteraFilters,
  AnalisisComparativo,
  getCartera,
  createInmueble,
  updateInmueble,
  deleteInmueble,
  bulkUpdateInmuebles,
  publicarEnPortales,
  despublicarDePortales,
  getAnalisisComparativo,
  ajustarPrecio,
  generarInformeCartera,
  importCartera,
  exportCartera,
  calcularCarteraStats,
  calcularScore,
  detectarOportunidades
} from './apis';

export default function CarteraPage() {
  const [inmuebles, setInmuebles] = useState<InmuebleCartera[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<CarteraFilters>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editingInmueble, setEditingInmueble] = useState<InmuebleCartera | undefined>();
  const [selectedInmueble, setSelectedInmueble] = useState<InmuebleCartera | undefined>();
  const [showDetails, setShowDetails] = useState(false);
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);
  const [analisisComparativo, setAnalisisComparativo] = useState<AnalisisComparativo | undefined>();
  const [showOportunidades, setShowOportunidades] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadCartera();
  }, [filters]);

  useEffect(() => {
    if (inmuebles.length > 0) {
      const oportunidades = detectarOportunidades(inmuebles);
      console.log('Oportunidades detectadas:', oportunidades);
      
      if (oportunidades.bajaPrecio.length > 0 || 
          oportunidades.pocaActividad.length > 0 || 
          oportunidades.exclusivaVencimiento.length > 0) {
        // Aquí se podrían mostrar notificaciones
      }
    }
  }, [inmuebles]);

  const loadCartera = async () => {
    setLoading(true);
    try {
      let data = await getCartera(filters);
      // Calcular scores si no están calculados
      data = data.map((inmueble: InmuebleCartera) => ({
        ...inmueble,
        score: inmueble.score || calcularScore(inmueble),
        precioM2: Math.round(inmueble.precio / inmueble.m2)
      }));
      setInmuebles(data);
    } catch (error) {
      console.error('Error loading cartera:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: Partial<InmuebleCartera>) => {
    try {
      await createInmueble({
        ...data,
        fechaCaptacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString(),
        diasEnCartera: 0,
        visitas: 0,
        guardados: 0,
        consultas: 0,
        visitasFisicas: 0,
        fotos: [],
        documentos: [],
        portales: [],
        publicado: false,
        destacado: false,
        precioOriginal: data.precio || 0,
        score: 0,
        probabilidadVenta: 50,
        competencia: 0
      });
      setShowForm(false);
      loadCartera();
    } catch (error) {
      console.error('Error creating inmueble:', error);
    }
  };

  const handleUpdate = async (data: Partial<InmuebleCartera>) => {
    if (!editingInmueble) return;
    try {
      await updateInmueble(editingInmueble.id, {
        ...data,
        fechaActualizacion: new Date().toISOString()
      });
      setEditingInmueble(undefined);
      setShowForm(false);
      loadCartera();
    } catch (error) {
      console.error('Error updating inmueble:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este inmueble?')) return;
    try {
      await deleteInmueble(id);
      loadCartera();
    } catch (error) {
      console.error('Error deleting inmueble:', error);
    }
  };

  const handleViewDetails = async (inmueble: InmuebleCartera) => {
    setSelectedInmueble(inmueble);
    setShowDetails(true);
    
    try {
      const analisis = await getAnalisisComparativo(inmueble.id);
      setAnalisisComparativo(analisis);
    } catch (error) {
      console.error('Error loading análisis comparativo:', error);
      // Mock data for demo
      setAnalisisComparativo({
        inmuebleId: inmueble.id,
        precioSugerido: inmueble.precio * 0.98,
        variacionMercado: -2.5,
        indiceCompetitividad: 72,
        comparables: [
          {
            id: '1',
            referencia: 'REF001',
            precio: inmueble.precio * 1.05,
            m2: inmueble.m2 + 10,
            precioM2: Math.round((inmueble.precio * 1.05) / (inmueble.m2 + 10)),
            distancia: 150,
            estado: 'vendido'
          },
          {
            id: '2',
            referencia: 'REF002',
            precio: inmueble.precio * 0.92,
            m2: inmueble.m2 - 5,
            precioM2: Math.round((inmueble.precio * 0.92) / (inmueble.m2 - 5)),
            distancia: 220,
            estado: 'activo'
          }
        ]
      });
    }
  };

  const handleTogglePublicacion = async (id: string, publicado: boolean) => {
    try {
      const portales = ['Idealista', 'Fotocasa']; // Portales por defecto
      if (publicado) {
        await publicarEnPortales(id, portales);
      } else {
        await despublicarDePortales(id, portales);
      }
      loadCartera();
    } catch (error) {
      console.error('Error toggling publicación:', error);
    }
  };

  const handleAjustarPrecio = async (nuevoPrecio: number, motivo: string) => {
    if (!selectedInmueble) return;
    try {
      await ajustarPrecio(selectedInmueble.id, nuevoPrecio, motivo);
      loadCartera();
      setShowDetails(false);
    } catch (error) {
      console.error('Error ajustando precio:', error);
    }
  };

  const handlePublicarPortales = async (portales: string[]) => {
    if (!selectedInmueble) return;
    try {
      await publicarEnPortales(selectedInmueble.id, portales);
      loadCartera();
    } catch (error) {
      console.error('Error publicando en portales:', error);
    }
  };

  const handleBulkUpdate = async (updates: Partial<InmuebleCartera>) => {
    if (selectedIds.size === 0) return;
    try {
      await bulkUpdateInmuebles(Array.from(selectedIds), updates);
      setSelectedIds(new Set());
      setShowBulkUpdate(false);
      loadCartera();
    } catch (error) {
      console.error('Error bulk updating inmuebles:', error);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importCartera(file);
      loadCartera();
    } catch (error) {
      console.error('Error importing cartera:', error);
    }
  };

  const handleExport = async () => {
    try {
      await exportCartera(filters);
    } catch (error) {
      console.error('Error exporting cartera:', error);
    }
  };

  const handleGenerarInforme = async () => {
    try {
      await generarInformeCartera(filters);
    } catch (error) {
      console.error('Error generando informe:', error);
    }
  };

  const handleStatsFilterClick = (tipo: string) => {
    switch (tipo) {
      case 'todos':
        setFilters({});
        break;
      case 'activo':
      case 'vendido':
      case 'reservado':
        setFilters({ estado: tipo });
        break;
      case 'exclusiva':
        setFilters({ exclusiva: true });
        break;
      case 'publicado':
        setFilters({ publicado: true });
        break;
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === inmuebles.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(inmuebles.map(i => i.id)));
    }
  };

  const stats = calcularCarteraStats(inmuebles);
  const oportunidades = detectarOportunidades(inmuebles);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">CRM - Cartera</h1>
        <p className="text-gray-600">Gestión integral de la cartera de inmuebles</p>
      </div>

      <CarteraStats stats={stats} onFilterChange={handleStatsFilterClick} />

      {/* Alertas de Oportunidades */}
      {(oportunidades.bajaPrecio.length > 0 || 
        oportunidades.pocaActividad.length > 0 || 
        oportunidades.exclusivaVencimiento.length > 0) && (
        <div className="my-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-medium text-yellow-800 mb-2">⚠️ Oportunidades Detectadas</h3>
          <div className="flex gap-4 text-sm">
            {oportunidades.bajaPrecio.length > 0 && (
              <span className="text-yellow-700">
                📉 {oportunidades.bajaPrecio.length} con precio bajo
              </span>
            )}
            {oportunidades.pocaActividad.length > 0 && (
              <span className="text-yellow-700">
                📊 {oportunidades.pocaActividad.length} con poca actividad
              </span>
            )}
            {oportunidades.exclusivaVencimiento.length > 0 && (
              <span className="text-yellow-700">
                🔒 {oportunidades.exclusivaVencimiento.length} exclusivas vencen pronto
              </span>
            )}
          </div>
        </div>
      )}

      <div className="my-6 flex justify-between items-center">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setEditingInmueble(undefined);
              setShowForm(true);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Nuevo Inmueble
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Importar CSV
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleImport}
            className="hidden"
          />
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
          >
            Exportar CSV
          </button>
          <button
            onClick={handleGenerarInforme}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Generar Informe PDF
          </button>
          {selectedIds.size > 0 && (
            <button
              onClick={() => setShowBulkUpdate(true)}
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
            >
              Actualizar ({selectedIds.size})
            </button>
          )}
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <input
            type="text"
            value={filters.q || ''}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            placeholder="Buscar..."
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filters.zona || ''}
            onChange={(e) => setFilters({ ...filters, zona: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las zonas</option>
            <option value="Centro">Centro</option>
            <option value="Norte">Norte</option>
            <option value="Sur">Sur</option>
            <option value="Este">Este</option>
            <option value="Oeste">Oeste</option>
          </select>
          <select
            value={filters.tipologia || ''}
            onChange={(e) => setFilters({ ...filters, tipologia: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las tipologías</option>
            <option value="piso">Piso</option>
            <option value="atico">Ático</option>
            <option value="duplex">Dúplex</option>
            <option value="casa">Casa</option>
            <option value="chalet">Chalet</option>
          </select>
          <select
            value={filters.estado || ''}
            onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="reservado">Reservado</option>
            <option value="vendido">Vendido</option>
            <option value="retirado">Retirado</option>
          </select>
          <input
            type="text"
            value={filters.agenteComercial || ''}
            onChange={(e) => setFilters({ ...filters, agenteComercial: e.target.value })}
            placeholder="Agente..."
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setFilters({})}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Limpiar
          </button>
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : (
          <CarteraTable
            inmuebles={inmuebles}
            selectedIds={selectedIds}
            onSelectToggle={toggleSelect}
            onSelectAll={toggleSelectAll}
            onEdit={(inmueble) => {
              setEditingInmueble(inmueble);
              setShowForm(true);
            }}
            onDelete={handleDelete}
            onViewDetails={handleViewDetails}
            onTogglePublicacion={handleTogglePublicacion}
          />
        )}
      </div>

      {/* Modal Formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingInmueble ? 'Editar Inmueble' : 'Nuevo Inmueble'}
            </h2>
            <InmuebleForm
              inmueble={editingInmueble}
              onSubmit={editingInmueble ? handleUpdate : handleCreate}
              onCancel={() => {
                setShowForm(false);
                setEditingInmueble(undefined);
              }}
            />
          </div>
        </div>
      )}

      {/* Modal Detalles */}
      {showDetails && selectedInmueble && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Detalles del Inmueble</h2>
              <button
                onClick={() => {
                  setShowDetails(false);
                  setSelectedInmueble(undefined);
                  setAnalisisComparativo(undefined);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <InmuebleDetails
              inmueble={selectedInmueble}
              analisisComparativo={analisisComparativo}
              onAjustarPrecio={handleAjustarPrecio}
              onPublicarPortales={handlePublicarPortales}
            />
          </div>
        </div>
      )}

      {/* Modal Actualización Masiva */}
      {showBulkUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">
              Actualizar {selectedIds.size} inmuebles
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cambiar estado a:
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleBulkUpdate({ estado: 'activo' })}
                    className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                  >
                    Activo
                  </button>
                  <button
                    onClick={() => handleBulkUpdate({ estado: 'reservado' })}
                    className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                  >
                    Reservado
                  </button>
                  <button
                    onClick={() => handleBulkUpdate({ estado: 'vendido' })}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                  >
                    Vendido
                  </button>
                  <button
                    onClick={() => handleBulkUpdate({ estado: 'retirado' })}
                    className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                  >
                    Retirado
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Publicación:
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBulkUpdate({ publicado: true })}
                    className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                  >
                    Publicar
                  </button>
                  <button
                    onClick={() => handleBulkUpdate({ publicado: false })}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                  >
                    Despublicar
                  </button>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  onClick={() => setShowBulkUpdate(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}