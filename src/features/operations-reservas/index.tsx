import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ReservasToolbar from './ReservasToolbar';
import ReservasFilters from './ReservasFilters';
import ReservasTable from './ReservasTable';
import ReservaForm from './ReservaForm';
import ReservaDetailsDrawer from './ReservaDetailsDrawer';
import CancelDialog from './CancelDialog';
import { reservasApi } from './apis';
import type { 
  Reserva, 
  ReservaFormData, 
  ReservasFilters as ReservasFiltersType, 
  ReservaSignData,
  ReservaCancelData,
  BulkReservaAction 
} from './types';

export default function ReservasPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Data states
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [reservaToCancel, setReservaToCancel] = useState<Reserva | null>(null);
  
  // Form states
  const [editingReserva, setEditingReserva] = useState<Reserva | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [isBulkCanceling, setIsBulkCanceling] = useState(false);
  
  // Pagination and filters
  const [filters, setFilters] = useState<ReservasFiltersType>({});
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Get prefill data from URL params
  const getPrefilledData = useCallback(() => {
    const ofertaId = searchParams.get('offerId');
    const clienteId = searchParams.get('clienteId');
    const propertyId = searchParams.get('propertyId');
    const importe = searchParams.get('importe');
    
    if (ofertaId || clienteId || propertyId || importe) {
      return {
        ofertaId: ofertaId || undefined,
        clienteId: clienteId || '',
        propertyId: propertyId || '',
        importe: importe ? parseInt(importe) : 0
      };
    }
    return undefined;
  }, [searchParams]);

  // Load reservas
  const loadReservas = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await reservasApi.getReservas({ ...filters, page });
      setReservas(response.reservas);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error loading reservas:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    loadReservas();
  }, [loadReservas]);

  // Auto-open form if there's prefilled data
  useEffect(() => {
    const prefilledData = getPrefilledData();
    if (prefilledData && !showForm) {
      setShowForm(true);
    }
  }, [getPrefilledData, showForm]);

  // Handlers
  const handleNew = () => {
    setEditingReserva(null);
    setShowForm(true);
  };

  const handleEdit = (reserva: Reserva) => {
    setEditingReserva(reserva);
    setShowForm(true);
  };

  const handleViewDetails = (reserva: Reserva) => {
    setSelectedReserva(reserva);
    setShowDetails(true);
  };

  const handleFormSubmit = async (data: ReservaFormData) => {
    setIsSubmitting(true);
    try {
      if (editingReserva) {
        await reservasApi.updateReserva(editingReserva.id, data);
      } else {
        await reservasApi.createReserva(data);
      }
      setShowForm(false);
      setEditingReserva(null);
      await loadReservas();
      
      // Clear URL params after successful creation
      if (!editingReserva) {
        setSearchParams({});
      }
    } catch (error) {
      console.error('Error saving reserva:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingReserva(null);
    // Clear URL params if canceling new reserva
    if (!editingReserva) {
      setSearchParams({});
    }
  };

  const handleSign = async (id: string) => {
    try {
      setIsSigning(true);
      const signData: ReservaSignData = {
        notes: 'Reserva firmada desde la interfaz'
      };
      await reservasApi.signReserva(id, signData);
      await loadReservas();
    } catch (error) {
      console.error('Error signing reserva:', error);
    } finally {
      setIsSigning(false);
    }
  };

  const handleCancel = (reserva: Reserva) => {
    setReservaToCancel(reserva);
    setShowCancelDialog(true);
  };

  const handleCancelConfirm = async (data: ReservaCancelData) => {
    if (!reservaToCancel) return;
    
    setIsCanceling(true);
    try {
      await reservasApi.cancelReserva(reservaToCancel.id, data);
      setShowCancelDialog(false);
      setReservaToCancel(null);
      await loadReservas();
    } catch (error) {
      console.error('Error canceling reserva:', error);
      throw error;
    } finally {
      setIsCanceling(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar esta reserva?')) {
      try {
        await reservasApi.deleteReserva(id);
        await loadReservas();
      } catch (error) {
        console.error('Error deleting reserva:', error);
      }
    }
  };

  const handleGenerateContract = (reserva: Reserva) => {
    // Navigate to contracts page with reserva data
    navigate(`/operations/contratos?reservaId=${reserva.id}`);
  };

  // Selection handlers
  const handleSelectToggle = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === reservas.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(reservas.map(r => r.id)));
    }
  };

  // Bulk actions
  const handleBulkSign = async () => {
    if (selectedIds.size === 0) return;
    
    setIsSigning(true);
    try {
      const action: BulkReservaAction = {
        action: 'sign',
        reservaIds: Array.from(selectedIds),
        notes: 'Firmadas mediante acción masiva'
      };
      await reservasApi.bulkAction(action);
      setSelectedIds(new Set());
      await loadReservas();
    } catch (error) {
      console.error('Error bulk signing:', error);
    } finally {
      setIsSigning(false);
    }
  };

  const handleBulkCancel = async () => {
    if (selectedIds.size === 0) return;
    
    const reason = prompt('Motivo de cancelación masiva:');
    if (!reason) return;
    
    setIsBulkCanceling(true);
    try {
      const action: BulkReservaAction = {
        action: 'cancel',
        reservaIds: Array.from(selectedIds),
        reason,
        notes: 'Canceladas mediante acción masiva'
      };
      await reservasApi.bulkAction(action);
      setSelectedIds(new Set());
      await loadReservas();
    } catch (error) {
      console.error('Error bulk canceling:', error);
    } finally {
      setIsBulkCanceling(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    
    if (confirm(`¿Está seguro de que desea eliminar ${selectedIds.size} reserva(s)?`)) {
      try {
        const action: BulkReservaAction = {
          action: 'delete',
          reservaIds: Array.from(selectedIds)
        };
        await reservasApi.bulkAction(action);
        setSelectedIds(new Set());
        await loadReservas();
      } catch (error) {
        console.error('Error bulk deleting:', error);
      }
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Mock export functionality
      const dataToExport = selectedIds.size > 0 
        ? reservas.filter(r => selectedIds.has(r.id))
        : reservas;
      
      console.log('Exporting reservas:', dataToExport);
      alert(`Exportando ${dataToExport.length} reserva(s)...`);
    } catch (error) {
      console.error('Error exporting:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFiltersChange = (newFilters: ReservasFiltersType) => {
    setFilters(newFilters);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reservas</h1>
          <p className="text-gray-600">
            Gestión de reservas y señales de propiedades
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <ReservasToolbar
        selectedCount={selectedIds.size}
        onNew={handleNew}
        onExport={handleExport}
        onBulkSign={handleBulkSign}
        onBulkCancel={handleBulkCancel}
        onBulkDelete={handleBulkDelete}
        isExporting={isExporting}
        isSigning={isSigning}
        isCanceling={isBulkCanceling}
      />

      {/* Filters */}
      <ReservasFilters
        filters={filters}
        onChange={handleFiltersChange}
      />

      {/* Results summary */}
      {!isLoading && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            Mostrando {reservas.length} de {total} reserva(s)
            {selectedIds.size > 0 && (
              <span className="ml-2 text-blue-600 font-medium">
                • {selectedIds.size} seleccionada(s)
              </span>
            )}
          </p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Cargando reservas...</p>
          </div>
        ) : (
          <ReservasTable
            reservas={reservas}
            selectedIds={selectedIds}
            onSelectToggle={handleSelectToggle}
            onSelectAll={handleSelectAll}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSign={handleSign}
            onCancel={handleCancel}
            onViewDetails={handleViewDetails}
            onGenerateContract={handleGenerateContract}
          />
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between flex-1 sm:hidden">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-700">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Página <span className="font-medium">{page}</span> de{' '}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingReserva ? 'Editar Reserva' : 'Nueva Reserva'}
                </h2>
                <button
                  onClick={handleFormCancel}
                  disabled={isSubmitting}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <ReservaForm
                reserva={editingReserva}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
                ofertaId={searchParams.get('offerId') || undefined}
                prefilledData={getPrefilledData()}
              />
            </div>
          </div>
        </div>
      )}

      {/* Details Drawer */}
      <ReservaDetailsDrawer
        reserva={selectedReserva}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        onEdit={() => {
          if (selectedReserva) {
            handleEdit(selectedReserva);
            setShowDetails(false);
          }
        }}
        onSign={() => {
          if (selectedReserva) {
            handleSign(selectedReserva.id);
            setShowDetails(false);
          }
        }}
        onCancel={() => {
          if (selectedReserva) {
            handleCancel(selectedReserva);
            setShowDetails(false);
          }
        }}
        onGenerateContract={(reserva) => {
          handleGenerateContract(reserva);
          setShowDetails(false);
        }}
      />

      {/* Cancel Dialog */}
      <CancelDialog
        isOpen={showCancelDialog}
        onClose={() => {
          setShowCancelDialog(false);
          setReservaToCancel(null);
        }}
        onConfirm={handleCancelConfirm}
        isLoading={isCanceling}
        reservaTitle={reservaToCancel?.propertyTitle}
      />
    </div>
  );
}