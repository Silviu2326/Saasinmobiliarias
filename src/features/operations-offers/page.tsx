import React, { useState } from 'react';
import { Offer, CounterOfferFormData, OfferFormData } from './types';
import { useOffers, useSelection, useOfferStats } from './hooks';
import { exportOffersToCSV } from './utils';
import OffersToolbar from './components/OffersToolbar';
import OffersFilters from './components/OffersFilters';
import OffersTable from './components/OffersTable';
import OfferForm from './components/OfferForm';
import CounterOfferDialog from './components/CounterOfferDialog';
import OfferDetailsDrawer from './components/OfferDetailsDrawer';

export default function OffersPage() {
  const {
    offers,
    filters,
    isLoading,
    error,
    updateFilters,
    createOffer,
    updateOffer,
    acceptOffer,
    rejectOffer,
    createCounterOffer,
    bulkAction
  } = useOffers();

  const {
    selectedIds,
    selectedCount,
    toggleSelection,
    toggleAll,
    clearSelection,
    isSelected,
    isAllSelected,
    isPartiallySelected
  } = useSelection();

  const stats = useOfferStats(offers);

  // Dialog states
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [showCounterDialog, setShowCounterDialog] = useState(false);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle new offer
  const handleNewOffer = () => {
    setEditingOffer(null);
    setShowOfferForm(true);
  };

  // Handle edit offer
  const handleEditOffer = (offer: Offer) => {
    setEditingOffer(offer);
    setShowOfferForm(true);
  };

  // Handle offer form submit
  const handleOfferFormSubmit = async (data: OfferFormData) => {
    setIsSubmitting(true);
    try {
      if (editingOffer) {
        await updateOffer(editingOffer.id, data);
      } else {
        await createOffer(data);
      }
      setShowOfferForm(false);
      setEditingOffer(null);
    } catch (error) {
      console.error('Error saving offer:', error);
      alert('Error al guardar la oferta');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle accept offer
  const handleAcceptOffer = async (offer: Offer) => {
    const confirmed = confirm(`¿Confirmas que quieres aceptar la oferta de ${offer.clienteNombre} por ${offer.importe.toLocaleString()}€?`);
    if (!confirmed) return;

    try {
      await acceptOffer(offer.id);
      setShowDetailsDrawer(false);
      alert('Oferta aceptada exitosamente');
    } catch (error) {
      console.error('Error accepting offer:', error);
      alert('Error al aceptar la oferta');
    }
  };

  // Handle reject offer
  const handleRejectOffer = async (offer: Offer) => {
    const reason = prompt('Motivo del rechazo (opcional):');
    if (reason === null) return; // User cancelled

    try {
      await rejectOffer(offer.id, reason || undefined);
      setShowDetailsDrawer(false);
      alert('Oferta rechazada');
    } catch (error) {
      console.error('Error rejecting offer:', error);
      alert('Error al rechazar la oferta');
    }
  };

  // Handle counter offer
  const handleCounterOffer = (offer: Offer) => {
    setSelectedOffer(offer);
    setShowCounterDialog(true);
  };

  // Handle counter offer submit
  const handleCounterOfferSubmit = async (data: CounterOfferFormData) => {
    if (!selectedOffer) return;

    setIsSubmitting(true);
    try {
      await createCounterOffer(selectedOffer.id, data);
      setShowCounterDialog(false);
      setShowDetailsDrawer(false);
      setSelectedOffer(null);
      alert('Contraoferta enviada exitosamente');
    } catch (error) {
      console.error('Error creating counter offer:', error);
      alert('Error al enviar la contraoferta');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle offer details
  const handleOfferClick = (offer: Offer) => {
    setSelectedOffer(offer);
    setShowDetailsDrawer(true);
  };

  // Handle bulk accept
  const handleBulkAccept = async () => {
    if (selectedIds.length === 0) return;

    const confirmed = confirm(`¿Confirmas que quieres aceptar ${selectedIds.length} ofertas seleccionadas?`);
    if (!confirmed) return;

    try {
      await bulkAction('accept', selectedIds);
      clearSelection();
      alert(`${selectedIds.length} ofertas aceptadas exitosamente`);
    } catch (error) {
      console.error('Error in bulk accept:', error);
      alert('Error al aceptar las ofertas');
    }
  };

  // Handle bulk reject
  const handleBulkReject = async () => {
    if (selectedIds.length === 0) return;

    const reason = prompt('Motivo del rechazo (opcional):');
    if (reason === null) return; // User cancelled

    try {
      await bulkAction('reject', selectedIds, reason || undefined);
      clearSelection();
      alert(`${selectedIds.length} ofertas rechazadas`);
    } catch (error) {
      console.error('Error in bulk reject:', error);
      alert('Error al rechazar las ofertas');
    }
  };

  // Handle export CSV
  const handleExportCSV = () => {
    try {
      const dataToExport = selectedIds.length > 0 
        ? offers.filter(offer => selectedIds.includes(offer.id))
        : offers;

      const csvContent = exportOffersToCSV(dataToExport);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `ofertas_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      if (selectedIds.length > 0) {
        clearSelection();
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Error al exportar los datos');
    }
  };

  // Handle reset filters
  const handleResetFilters = () => {
    updateFilters({
      q: undefined,
      propertyId: undefined,
      clienteId: undefined,
      estado: 'all',
      precioMin: undefined,
      precioMax: undefined,
      agenteId: undefined,
      fechaDesde: undefined,
      fechaHasta: undefined,
      vencimiento: 'all',
      page: undefined,
      sortBy: undefined,
      sortOrder: undefined
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar las ofertas</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toolbar */}
      <OffersToolbar
        onNewOffer={handleNewOffer}
        onExportCSV={handleExportCSV}
        selectedCount={selectedCount}
        onBulkAccept={handleBulkAccept}
        onBulkReject={handleBulkReject}
        stats={stats}
        isLoading={isLoading}
      />

      {/* Filters */}
      <OffersFilters
        filters={filters}
        onFiltersChange={updateFilters}
        onReset={handleResetFilters}
      />

      {/* Table */}
      <div className="px-6 py-6">
        <OffersTable
          offers={offers}
          selectedIds={selectedIds}
          onToggleSelection={toggleSelection}
          onToggleAll={toggleAll}
          isAllSelected={isAllSelected(offers.map(o => o.id))}
          isPartiallySelected={isPartiallySelected(offers.map(o => o.id))}
          onOfferClick={handleOfferClick}
          onAcceptOffer={handleAcceptOffer}
          onRejectOffer={handleRejectOffer}
          onCounterOffer={handleCounterOffer}
          isLoading={isLoading}
        />
      </div>

      {/* Dialogs and Drawers */}
      <OfferForm
        isOpen={showOfferForm}
        onClose={() => {
          setShowOfferForm(false);
          setEditingOffer(null);
        }}
        onSubmit={handleOfferFormSubmit}
        initialData={editingOffer ? {
          clienteId: editingOffer.clienteId,
          propertyId: editingOffer.propertyId,
          importe: editingOffer.importe,
          condiciones: editingOffer.condiciones,
          venceEl: editingOffer.venceEl,
          notas: editingOffer.notas
        } : undefined}
        isLoading={isSubmitting}
      />

      <CounterOfferDialog
        isOpen={showCounterDialog}
        onClose={() => {
          setShowCounterDialog(false);
          setSelectedOffer(null);
        }}
        onSubmit={handleCounterOfferSubmit}
        offer={selectedOffer}
        isLoading={isSubmitting}
      />

      <OfferDetailsDrawer
        isOpen={showDetailsDrawer}
        onClose={() => {
          setShowDetailsDrawer(false);
          setSelectedOffer(null);
        }}
        offer={selectedOffer}
        onAcceptOffer={handleAcceptOffer}
        onRejectOffer={handleRejectOffer}
        onCounterOffer={handleCounterOffer}
        onEditOffer={handleEditOffer}
      />
    </div>
  );
}