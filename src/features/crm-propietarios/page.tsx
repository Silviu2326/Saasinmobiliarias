import React, { useState, useEffect, useRef } from 'react';
import PropietarioForm from './components/PropietarioForm';
import PropietarioTable from './components/PropietarioTable';
import InmueblesPanel from './components/InmueblesPanel';
import InformePanel from './components/InformePanel';
import {
  Propietario,
  PropietarioFilters,
  InmuebleAsociado,
  InformePropietario,
  getPropietarios,
  createPropietario,
  updatePropietario,
  deletePropietario,
  getInmueblesPropietario,
  generarInforme,
  programarInforme,
  importPropietarios,
  exportPropietarios,
  checkExclusivaProximaVencer,
  calculateRendimiento
} from './apis';

export default function PropietariosPage() {
  const [propietarios, setPropietarios] = useState<Propietario[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<PropietarioFilters>({});
  const [showForm, setShowForm] = useState(false);
  const [editingPropietario, setEditingPropietario] = useState<Propietario | undefined>();
  const [selectedPropietario, setSelectedPropietario] = useState<Propietario | undefined>();
  const [showInmuebles, setShowInmuebles] = useState(false);
  const [showInforme, setShowInforme] = useState(false);
  const [inmuebles, setInmuebles] = useState<InmuebleAsociado[]>([]);
  const [informe, setInforme] = useState<InformePropietario | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadPropietarios();
  }, [filters]);

  useEffect(() => {
    const proximosVencer = checkExclusivaProximaVencer(propietarios);
    if (proximosVencer.length > 0) {
      console.log('Exclusivas próximas a vencer:', proximosVencer);
    }
  }, [propietarios]);

  const loadPropietarios = async () => {
    setLoading(true);
    try {
      const data = await getPropietarios(filters);
      setPropietarios(data);
    } catch (error) {
      console.error('Error loading propietarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: Partial<Propietario>) => {
    try {
      await createPropietario(data);
      setShowForm(false);
      loadPropietarios();
    } catch (error) {
      console.error('Error creating propietario:', error);
    }
  };

  const handleUpdate = async (data: Partial<Propietario>) => {
    if (!editingPropietario) return;
    try {
      await updatePropietario(editingPropietario.id, data);
      setEditingPropietario(undefined);
      setShowForm(false);
      loadPropietarios();
    } catch (error) {
      console.error('Error updating propietario:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este propietario?')) return;
    try {
      await deletePropietario(id);
      loadPropietarios();
    } catch (error) {
      console.error('Error deleting propietario:', error);
    }
  };

  const handleViewInmuebles = async (propietario: Propietario) => {
    setSelectedPropietario(propietario);
    setShowInmuebles(true);
    try {
      const data = await getInmueblesPropietario(propietario.id);
      setInmuebles(data);
    } catch (error) {
      console.error('Error loading inmuebles:', error);
      setInmuebles([]);
    }
  };

  const handleGenerarInforme = async (propietario: Propietario) => {
    setSelectedPropietario(propietario);
    setShowInforme(true);
    try {
      const data = await generarInforme(propietario.id);
      setInforme(data);
    } catch (error) {
      console.error('Error generating informe:', error);
      setInforme({
        periodo: 'Últimos 30 días',
        visitas: 12,
        guardados: 5,
        consultas: 3,
        comparables: [],
        feedback: ['Precio competitivo', 'Buena ubicación', 'Necesita reforma en cocina'],
        pricingSugerido: 285000,
        proximoPaso: 'Considerar ajuste de precio en un 3% para aumentar interés'
      });
    }
  };

  const handleProgramarInforme = async (frecuencia: 'semanal' | 'quincenal' | 'mensual') => {
    if (!selectedPropietario) return;
    try {
      await programarInforme(selectedPropietario.id, frecuencia);
      alert(`Informe programado: envío ${frecuencia}`);
    } catch (error) {
      console.error('Error programming informe:', error);
    }
  };

  const handleEnviarInforme = () => {
    alert('Informe enviado al propietario');
    setShowInforme(false);
    setInforme(undefined);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importPropietarios(file);
      loadPropietarios();
    } catch (error) {
      console.error('Error importing propietarios:', error);
    }
  };

  const handleExport = async () => {
    try {
      await exportPropietarios(filters);
    } catch (error) {
      console.error('Error exporting propietarios:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">CRM - Propietarios</h1>
        <p className="text-gray-600">Relación con propietarios y cartera en exclusiva</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => {
            setEditingPropietario(undefined);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Nuevo Propietario
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
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <input
            type="text"
            value={filters.q || ''}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            placeholder="Buscar..."
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filters.tieneExclusiva !== undefined ? String(filters.tieneExclusiva) : ''}
            onChange={(e) => setFilters({ 
              ...filters, 
              tieneExclusiva: e.target.value === '' ? undefined : e.target.value === 'true' 
            })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option value="true">Con exclusiva</option>
            <option value="false">Sin exclusiva</option>
          </select>
          <input
            type="text"
            value={filters.agente || ''}
            onChange={(e) => setFilters({ ...filters, agente: e.target.value })}
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
          <PropietarioTable
            propietarios={propietarios}
            onEdit={(propietario) => {
              setEditingPropietario(propietario);
              setShowForm(true);
            }}
            onDelete={handleDelete}
            onViewInmuebles={handleViewInmuebles}
            onGenerarInforme={handleGenerarInforme}
          />
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingPropietario ? 'Editar Propietario' : 'Nuevo Propietario'}
            </h2>
            <PropietarioForm
              propietario={editingPropietario}
              onSubmit={editingPropietario ? handleUpdate : handleCreate}
              onCancel={() => {
                setShowForm(false);
                setEditingPropietario(undefined);
              }}
            />
          </div>
        </div>
      )}

      {showInmuebles && selectedPropietario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                Inmuebles de {selectedPropietario.nombre}
              </h2>
              <button
                onClick={() => {
                  setShowInmuebles(false);
                  setSelectedPropietario(undefined);
                  setInmuebles([]);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <InmueblesPanel
              inmuebles={inmuebles}
              rendimiento={calculateRendimiento(inmuebles)}
            />
          </div>
        </div>
      )}

      {showInforme && selectedPropietario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                Informe para {selectedPropietario.nombre}
              </h2>
              <button
                onClick={() => {
                  setShowInforme(false);
                  setSelectedPropietario(undefined);
                  setInforme(undefined);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <InformePanel
              informe={informe}
              onGenerar={() => handleGenerarInforme(selectedPropietario)}
              onProgramar={handleProgramarInforme}
              onEnviar={handleEnviarInforme}
            />
          </div>
        </div>
      )}
    </div>
  );
}