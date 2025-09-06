import React, { useState, useEffect, useRef } from 'react';
import ClienteForm from './components/ClienteForm';
import ClienteTable from './components/ClienteTable';
import MatchesPanel from './components/MatchesPanel';
import {
  Cliente,
  ClienteFilters,
  Match,
  getClientes,
  createCliente,
  updateCliente,
  deleteCliente,
  getMatches,
  addToWishlist,
  importClientes,
  exportClientes
} from './apis';

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ClienteFilters>({});
  const [showForm, setShowForm] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | undefined>();
  const [showMatches, setShowMatches] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | undefined>();
  const [matches, setMatches] = useState<Match[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadClientes();
  }, [filters]);

  const loadClientes = async () => {
    setLoading(true);
    try {
      const data = await getClientes(filters);
      setClientes(data);
    } catch (error) {
      console.error('Error loading clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: Partial<Cliente>) => {
    try {
      await createCliente(data);
      setShowForm(false);
      loadClientes();
    } catch (error) {
      console.error('Error creating cliente:', error);
    }
  };

  const handleUpdate = async (data: Partial<Cliente>) => {
    if (!editingCliente) return;
    try {
      await updateCliente(editingCliente.id, data);
      setEditingCliente(undefined);
      setShowForm(false);
      loadClientes();
    } catch (error) {
      console.error('Error updating cliente:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este cliente?')) return;
    try {
      await deleteCliente(id);
      loadClientes();
    } catch (error) {
      console.error('Error deleting cliente:', error);
    }
  };

  const handleViewMatches = async (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setShowMatches(true);
    try {
      const matchesData = await getMatches(cliente.id);
      setMatches(matchesData);
    } catch (error) {
      console.error('Error loading matches:', error);
      setMatches([]);
    }
  };

  const handleAddToWishlist = async (inmuebleId: string) => {
    if (!selectedCliente) return;
    try {
      await addToWishlist(selectedCliente.id, inmuebleId);
      alert('Inmueble añadido a la wishlist');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
  };

  const handleShare = (inmuebleId: string) => {
    console.log('Compartir inmueble:', inmuebleId);
    alert('Funcionalidad de compartir en desarrollo');
  };

  const handleScheduleVisit = (inmuebleId: string) => {
    console.log('Agendar visita:', inmuebleId);
    alert('Funcionalidad de agendar visita en desarrollo');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importClientes(file);
      loadClientes();
    } catch (error) {
      console.error('Error importing clientes:', error);
    }
  };

  const handleExport = async () => {
    try {
      await exportClientes(filters);
    } catch (error) {
      console.error('Error exporting clientes:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">CRM - Clientes</h1>
        <p className="text-gray-600">Gestión de demanda y matching con inmuebles</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => {
            setEditingCliente(undefined);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Nuevo Cliente
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
            value={filters.tipo || ''}
            onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los tipos</option>
            <option value="comprador">Comprador</option>
            <option value="inquilino">Inquilino</option>
          </select>
          <select
            value={filters.estado || ''}
            onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="en_pausa">En pausa</option>
            <option value="ganado">Ganado</option>
            <option value="perdido">Perdido</option>
          </select>
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
          <ClienteTable
            clientes={clientes}
            onEdit={(cliente) => {
              setEditingCliente(cliente);
              setShowForm(true);
            }}
            onDelete={handleDelete}
            onViewMatches={handleViewMatches}
          />
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
            </h2>
            <ClienteForm
              cliente={editingCliente}
              onSubmit={editingCliente ? handleUpdate : handleCreate}
              onCancel={() => {
                setShowForm(false);
                setEditingCliente(undefined);
              }}
            />
          </div>
        </div>
      )}

      {showMatches && selectedCliente && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                Matches para {selectedCliente.nombre}
              </h2>
              <button
                onClick={() => {
                  setShowMatches(false);
                  setSelectedCliente(undefined);
                  setMatches([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <MatchesPanel
              matches={matches}
              onAddToWishlist={handleAddToWishlist}
              onShare={handleShare}
              onScheduleVisit={handleScheduleVisit}
            />
          </div>
        </div>
      )}
    </div>
  );
}