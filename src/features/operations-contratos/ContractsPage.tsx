import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ContractsToolbar from './ContractsToolbar';
import ContractsFilters from './ContractsFilters';
import ContractsTable from './ContractsTable';
import ContractForm from './ContractForm';
import ContractDetailsDrawer from './ContractDetailsDrawer';
import GenerateFromTemplateDialog from './GenerateFromTemplateDialog';
import type { 
  Contract, 
  ContractsFilters as Filters, 
  ContractFormData,
  GenerateFromTemplateData,
  BulkContractAction 
} from './types';
import { contractsApi } from './apis';

export default function ContractsPage() {
  const [searchParams] = useSearchParams();
  const reservaId = searchParams.get('reservaId');

  // Data state
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [contractToGenerate, setContractToGenerate] = useState<string | null>(null);

  // Filters
  const [filters, setFilters] = useState<Filters>({
    page: 1,
    limit: 10
  });

  // Loading states
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadContracts();
  }, [filters]);

  useEffect(() => {
    if (reservaId && !showForm) {
      handleNew();
    }
  }, [reservaId]);

  const loadContracts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await contractsApi.getContracts(filters);
      setContracts(response.contracts);
    } catch (err) {
      setError('Error al cargar contratos');
      console.error('Error loading contracts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setEditingContract(null);
    setShowForm(true);
  };

  const handleEdit = (contract: Contract) => {
    setEditingContract(contract);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingContract(null);
  };

  const handleSubmitForm = async (data: ContractFormData) => {
    try {
      setIsSubmitting(true);
      
      if (editingContract) {
        await contractsApi.updateContract(editingContract.id, data);
      } else {
        await contractsApi.createContract(data);
      }
      
      await loadContracts();
      handleCloseForm();
    } catch (err) {
      console.error('Error submitting contract:', err);
      alert('Error al guardar el contrato');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este contrato?')) return;
    
    try {
      await contractsApi.deleteContract(id);
      await loadContracts();
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (err) {
      console.error('Error deleting contract:', err);
      alert('Error al eliminar el contrato');
    }
  };

  const handleGenerate = async (id: string) => {
    setContractToGenerate(id);
    setShowGenerateDialog(true);
  };

  const handleGenerateFromTemplate = async (data: GenerateFromTemplateData) => {
    if (!contractToGenerate) return;

    try {
      setIsGenerating(true);
      await contractsApi.generateFromTemplate(contractToGenerate, data);
      await loadContracts();
      setShowGenerateDialog(false);
      setContractToGenerate(null);
    } catch (err) {
      console.error('Error generating contract:', err);
      alert('Error al generar el contrato');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSign = async (id: string) => {
    if (!confirm('¿Proceder con la firma simulada del contrato?')) return;
    
    try {
      await contractsApi.signContract(id);
      await loadContracts();
    } catch (err) {
      console.error('Error signing contract:', err);
      alert('Error al firmar el contrato');
    }
  };

  const handleViewDetails = (contract: Contract) => {
    setSelectedContract(contract);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedContract(null);
  };

  const handleSelectToggle = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === contracts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(contracts.map(c => c.id)));
    }
  };

  const handleImportTemplate = async (file: File) => {
    try {
      setIsImporting(true);
      // Simulate import process
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Plantilla importada correctamente (simulado)');
    } catch (err) {
      console.error('Error importing template:', err);
      alert('Error al importar la plantilla');
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      // Simulate PDF export
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('PDF exportado correctamente (simulado)');
    } catch (err) {
      console.error('Error exporting PDF:', err);
      alert('Error al exportar PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const handleBulkAction = async (action: 'delete' | 'generate' | 'sign') => {
    if (selectedIds.size === 0) return;

    const actionNames = {
      delete: 'eliminar',
      generate: 'generar',
      sign: 'firmar'
    };

    if (!confirm(`¿Está seguro de ${actionNames[action]} ${selectedIds.size} contratos?`)) return;

    try {
      const bulkAction: BulkContractAction = {
        action,
        contractIds: Array.from(selectedIds)
      };

      if (action === 'generate') {
        setIsGenerating(true);
      } else if (action === 'sign') {
        setIsSigning(true);
      }

      await contractsApi.bulkAction(bulkAction);
      await loadContracts();
      setSelectedIds(new Set());
    } catch (err) {
      console.error(`Error in bulk ${action}:`, err);
      alert(`Error al ${actionNames[action]} contratos`);
    } finally {
      setIsGenerating(false);
      setIsSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-gray-600">Cargando contratos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-red-800">{error}</span>
          <button
            onClick={loadContracts}
            className="ml-4 text-red-600 hover:text-red-800 underline"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contratos</h1>
          <p className="text-gray-600">Gestión de contratos y documentos legales</p>
        </div>
      </div>

      <ContractsToolbar
        selectedCount={selectedIds.size}
        onNew={handleNew}
        onImportTemplate={handleImportTemplate}
        onExportPDF={handleExportPDF}
        onBulkDelete={() => handleBulkAction('delete')}
        onBulkGenerate={() => handleBulkAction('generate')}
        onBulkSign={() => handleBulkAction('sign')}
        isImporting={isImporting}
        isExporting={isExporting}
        isGenerating={isGenerating}
        isSigning={isSigning}
      />

      <ContractsFilters
        filters={filters}
        onChange={setFilters}
      />

      <div className="bg-white rounded-lg shadow">
        <ContractsTable
          contracts={contracts}
          selectedIds={selectedIds}
          onSelectToggle={handleSelectToggle}
          onSelectAll={handleSelectAll}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onGenerate={handleGenerate}
          onSign={handleSign}
          onViewDetails={handleViewDetails}
        />
      </div>

      {/* Contract Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingContract ? 'Editar Contrato' : 'Nuevo Contrato'}
                </h2>
                <button
                  onClick={handleCloseForm}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={isSubmitting}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <ContractForm
                contract={editingContract}
                onSubmit={handleSubmitForm}
                onCancel={handleCloseForm}
                reservaId={reservaId}
              />
            </div>
          </div>
        </div>
      )}

      {/* Contract Details Drawer */}
      <ContractDetailsDrawer
        contract={selectedContract}
        isOpen={showDetails}
        onClose={handleCloseDetails}
        onEdit={() => {
          if (selectedContract) {
            handleEdit(selectedContract);
            setShowDetails(false);
          }
        }}
        onGenerate={() => {
          if (selectedContract) {
            handleGenerate(selectedContract.id);
            setShowDetails(false);
          }
        }}
        onSign={() => {
          if (selectedContract) {
            handleSign(selectedContract.id);
            setShowDetails(false);
          }
        }}
      />

      {/* Generate from Template Dialog */}
      <GenerateFromTemplateDialog
        contractId={contractToGenerate}
        isOpen={showGenerateDialog}
        onClose={() => {
          setShowGenerateDialog(false);
          setContractToGenerate(null);
        }}
        onSubmit={handleGenerateFromTemplate}
        isLoading={isGenerating}
      />
    </div>
  );
}