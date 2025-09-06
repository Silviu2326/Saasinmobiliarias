import React, { useState, useEffect, useRef } from 'react';
import LeadForm from './components/LeadForm';
import LeadFilters from './components/LeadFilters';
import LeadTable from './components/LeadTable';
import {
  Lead,
  LeadFilters as Filters,
  getLeads,
  createLead,
  updateLead,
  deleteLead,
  exportLeads,
  importLeads,
  calculateScore
} from './apis';

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Filters>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadLeads();
  }, [filters]);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const data = await getLeads(filters);
      const leadsWithScore = data.map((lead: Lead) => ({
        ...lead,
        score: calculateScore(lead)
      }));
      setLeads(leadsWithScore);
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: Partial<Lead>) => {
    try {
      await createLead(data);
      setShowForm(false);
      loadLeads();
    } catch (error) {
      console.error('Error creating lead:', error);
    }
  };

  const handleUpdate = async (data: Partial<Lead>) => {
    if (!editingLead) return;
    try {
      await updateLead(editingLead.id, data);
      setEditingLead(undefined);
      setShowForm(false);
      loadLeads();
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este lead?')) return;
    try {
      await deleteLead(id);
      loadLeads();
    } catch (error) {
      console.error('Error deleting lead:', error);
    }
  };

  const handleDeleteSelected = async () => {
    if (!confirm(`¿Eliminar ${selectedIds.size} leads seleccionados?`)) return;
    try {
      await Promise.all(Array.from(selectedIds).map(id => deleteLead(id)));
      setSelectedIds(new Set());
      loadLeads();
    } catch (error) {
      console.error('Error deleting leads:', error);
    }
  };

  const handleStatusChange = async (id: string, estado: Lead['estado']) => {
    try {
      await updateLead(id, { estado });
      loadLeads();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importLeads(file);
      loadLeads();
    } catch (error) {
      console.error('Error importing leads:', error);
    }
  };

  const handleExport = async () => {
    try {
      await exportLeads(filters);
    } catch (error) {
      console.error('Error exporting leads:', error);
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
    if (selectedIds.size === leads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(leads.map(l => l.id)));
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">CRM - Leads</h1>
        <p className="text-gray-600">Gestión de leads y oportunidades</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => {
            setEditingLead(undefined);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Nuevo Lead
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
            onClick={handleDeleteSelected}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Eliminar ({selectedIds.size})
          </button>
        )}
      </div>

      <LeadFilters filters={filters} onChange={setFilters} />

      <div className="mt-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : (
          <LeadTable
            leads={leads}
            selectedIds={selectedIds}
            onSelectToggle={toggleSelect}
            onSelectAll={toggleSelectAll}
            onEdit={(lead) => {
              setEditingLead(lead);
              setShowForm(true);
            }}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingLead ? 'Editar Lead' : 'Nuevo Lead'}
            </h2>
            <LeadForm
              lead={editingLead}
              onSubmit={editingLead ? handleUpdate : handleCreate}
              onCancel={() => {
                setShowForm(false);
                setEditingLead(undefined);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}