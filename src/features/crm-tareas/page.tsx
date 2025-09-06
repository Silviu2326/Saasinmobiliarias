import React, { useState, useEffect, useRef } from 'react';
import TareaForm from './components/TareaForm';
import TareaTable from './components/TareaTable';
import KanbanBoard from './components/KanbanBoard';
import TareaStats from './components/TareaStats';
import {
  Tarea,
  TareaFilters,
  getTareas,
  createTarea,
  updateTarea,
  deleteTarea,
  bulkUpdateTareas,
  importTareas,
  exportTareas,
  calcularTareaStats,
  filtrarTareasAtrasadas,
  filtrarTareasCriticas
} from './apis';

type ViewMode = 'table' | 'kanban';

export default function TareasPage() {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<TareaFilters>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editingTarea, setEditingTarea] = useState<Tarea | undefined>();
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadTareas();
  }, [filters]);

  useEffect(() => {
    const atrasadas = filtrarTareasAtrasadas(tareas);
    const criticas = filtrarTareasCriticas(tareas);
    
    if (atrasadas.length > 0) {
      console.log('Tareas atrasadas:', atrasadas);
    }
    
    if (criticas.length > 0) {
      console.log('Tareas críticas (vencen en <24h):', criticas);
    }
  }, [tareas]);

  const loadTareas = async () => {
    setLoading(true);
    try {
      const data = await getTareas(filters);
      setTareas(data);
    } catch (error) {
      console.error('Error loading tareas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: Partial<Tarea>) => {
    try {
      await createTarea(data);
      setShowForm(false);
      loadTareas();
    } catch (error) {
      console.error('Error creating tarea:', error);
    }
  };

  const handleUpdate = async (data: Partial<Tarea>) => {
    if (!editingTarea) return;
    try {
      await updateTarea(editingTarea.id, data);
      setEditingTarea(undefined);
      setShowForm(false);
      loadTareas();
    } catch (error) {
      console.error('Error updating tarea:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta tarea?')) return;
    try {
      await deleteTarea(id);
      loadTareas();
    } catch (error) {
      console.error('Error deleting tarea:', error);
    }
  };

  const handleStatusChange = async (id: string, estado: Tarea['estado']) => {
    try {
      const updateData: Partial<Tarea> = { estado };
      if (estado === 'hecha') {
        updateData.completadaAt = new Date().toISOString();
      }
      await updateTarea(id, updateData);
      loadTareas();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleBulkUpdate = async (updates: Partial<Tarea>) => {
    if (selectedIds.size === 0) return;
    try {
      await bulkUpdateTareas(Array.from(selectedIds), updates);
      setSelectedIds(new Set());
      setShowBulkUpdate(false);
      loadTareas();
    } catch (error) {
      console.error('Error bulk updating tareas:', error);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importTareas(file);
      loadTareas();
    } catch (error) {
      console.error('Error importing tareas:', error);
    }
  };

  const handleExport = async () => {
    try {
      await exportTareas(filters);
    } catch (error) {
      console.error('Error exporting tareas:', error);
    }
  };

  const handleStatsFilterClick = (tipo: string) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    switch (tipo) {
      case 'todas':
        setFilters({});
        break;
      case 'pendiente':
      case 'en_progreso':
      case 'hecha':
        setFilters({ estado: tipo });
        break;
      case 'atrasadas':
        setFilters({ vencimiento: 'atrasadas' });
        break;
      case 'hoy':
        setFilters({ vencimiento: 'hoy' });
        break;
      case 'semana':
        setFilters({ vencimiento: 'semana' });
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
    if (selectedIds.size === tareas.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(tareas.map(t => t.id)));
    }
  };

  const stats = calcularTareaStats(tareas);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">CRM - Tareas</h1>
        <p className="text-gray-600">Ejecución operativa con SLA y seguimiento</p>
      </div>

      <TareaStats stats={stats} onFilterChange={handleStatsFilterClick} />

      <div className="my-6 flex justify-between items-center">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setEditingTarea(undefined);
              setShowForm(true);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Nueva Tarea
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
          {selectedIds.size > 0 && (
            <button
              onClick={() => setShowBulkUpdate(true)}
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
            >
              Actualizar ({selectedIds.size})
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 rounded-md ${viewMode === 'table' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Tabla
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-4 py-2 rounded-md ${viewMode === 'kanban' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Kanban
          </button>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <input
            type="text"
            value={filters.q || ''}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            placeholder="Buscar..."
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filters.estado || ''}
            onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_progreso">En Progreso</option>
            <option value="hecha">Hecha</option>
          </select>
          <select
            value={filters.prioridad || ''}
            onChange={(e) => setFilters({ ...filters, prioridad: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las prioridades</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
          <input
            type="text"
            value={filters.asignadoA || ''}
            onChange={(e) => setFilters({ ...filters, asignadoA: e.target.value })}
            placeholder="Asignado a..."
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
        ) : viewMode === 'table' ? (
          <TareaTable
            tareas={tareas}
            selectedIds={selectedIds}
            onSelectToggle={toggleSelect}
            onSelectAll={toggleSelectAll}
            onEdit={(tarea) => {
              setEditingTarea(tarea);
              setShowForm(true);
            }}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />
        ) : (
          <KanbanBoard
            tareas={tareas}
            onStatusChange={handleStatusChange}
            onEdit={(tarea) => {
              setEditingTarea(tarea);
              setShowForm(true);
            }}
          />
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingTarea ? 'Editar Tarea' : 'Nueva Tarea'}
            </h2>
            <TareaForm
              tarea={editingTarea}
              onSubmit={editingTarea ? handleUpdate : handleCreate}
              onCancel={() => {
                setShowForm(false);
                setEditingTarea(undefined);
              }}
            />
          </div>
        </div>
      )}

      {showBulkUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">
              Actualizar {selectedIds.size} tareas
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cambiar estado a:
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBulkUpdate({ estado: 'pendiente' })}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Pendiente
                  </button>
                  <button
                    onClick={() => handleBulkUpdate({ estado: 'en_progreso' })}
                    className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                  >
                    En Progreso
                  </button>
                  <button
                    onClick={() => handleBulkUpdate({ estado: 'hecha', completadaAt: new Date().toISOString() })}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                  >
                    Completar
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cambiar prioridad a:
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBulkUpdate({ prioridad: 'baja' })}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  >
                    Baja
                  </button>
                  <button
                    onClick={() => handleBulkUpdate({ prioridad: 'media' })}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                  >
                    Media
                  </button>
                  <button
                    onClick={() => handleBulkUpdate({ prioridad: 'alta' })}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Alta
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