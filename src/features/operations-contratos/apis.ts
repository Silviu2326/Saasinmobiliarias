import type {
  Contract,
  ContractFormData,
  ContractsFilters,
  ContractsResponse,
  ContractStats,
  ContractVersion,
  GenerateFromTemplateData,
  ContractTemplate,
  BulkContractAction
} from './types';

const mockContracts: Contract[] = [
  {
    id: '1',
    tipo: 'compraventa',
    propertyId: 'prop-1',
    propertyTitle: 'Casa en Las Condes',
    propertyAddress: 'Av. Las Condes 1234',
    clienteId: 'client-1',
    clienteNombre: 'Juan Pérez',
    clienteEmail: 'juan@email.com',
    propietarioId: 'owner-1',
    propietarioNombre: 'María García',
    estado: 'firmado',
    version: 2,
    honorarios: 5000000,
    fechaInicio: '2024-01-15',
    fechaVencimiento: '2024-03-15',
    generatedAt: '2024-01-10T10:00:00Z',
    signedAt: '2024-01-15T14:30:00Z',
    createdAt: '2024-01-05T09:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z'
  },
  {
    id: '2',
    tipo: 'alquiler',
    propertyId: 'prop-2',
    propertyTitle: 'Departamento Providencia',
    propertyAddress: 'Providencia 2567',
    clienteId: 'client-2',
    clienteNombre: 'Ana López',
    estado: 'generado',
    version: 1,
    honorarios: 800000,
    fechaInicio: '2024-02-01',
    fechaVencimiento: '2025-02-01',
    generatedAt: '2024-01-25T11:00:00Z',
    createdAt: '2024-01-20T10:30:00Z',
    updatedAt: '2024-01-25T11:00:00Z'
  },
  {
    id: '3',
    tipo: 'exclusiva',
    propertyId: 'prop-3',
    propertyTitle: 'Oficina Vitacura',
    propertyAddress: 'Vitacura 890',
    clienteId: 'client-3',
    clienteNombre: 'Carlos Silva',
    propietarioId: 'owner-2',
    propietarioNombre: 'Roberto Muñoz',
    estado: 'borrador',
    version: 1,
    honorarios: 1200000,
    createdAt: '2024-01-28T16:00:00Z',
    updatedAt: '2024-01-28T16:00:00Z'
  }
];

const mockTemplates: ContractTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Plantilla Compraventa Estándar',
    type: 'compraventa',
    variables: ['cliente_nombre', 'propietario_nombre', 'propiedad_direccion', 'precio', 'fecha_escritura'],
    content: 'Contrato de compraventa entre {{cliente_nombre}} y {{propietario_nombre}}...',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'tpl-2', 
    name: 'Plantilla Alquiler Residencial',
    type: 'alquiler',
    variables: ['arrendatario_nombre', 'arrendador_nombre', 'propiedad_direccion', 'canon_mensual', 'duracion_meses'],
    content: 'Contrato de arrendamiento entre {{arrendatario_nombre}} y {{arrendador_nombre}}...',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

const mockVersions: ContractVersion[] = [
  {
    id: 'v-1',
    contractId: '1',
    version: 1,
    createdAt: '2024-01-05T09:00:00Z',
    by: 'agent-1',
    byName: 'Pedro Agente',
    notes: 'Versión inicial del contrato'
  },
  {
    id: 'v-2',
    contractId: '1',
    version: 2,
    createdAt: '2024-01-15T14:30:00Z',
    by: 'agent-1',
    byName: 'Pedro Agente',
    notes: 'Actualización post-firma con anexos'
  }
];

export const contractsApi = {
  getContracts: async (filters: ContractsFilters = {}): Promise<ContractsResponse> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filtered = [...mockContracts];
    
    if (filters.q) {
      const query = filters.q.toLowerCase();
      filtered = filtered.filter(contract => 
        contract.clienteNombre.toLowerCase().includes(query) ||
        contract.propertyTitle.toLowerCase().includes(query) ||
        contract.propertyAddress.toLowerCase().includes(query)
      );
    }
    
    if (filters.tipo && filters.tipo !== 'all') {
      filtered = filtered.filter(contract => contract.tipo === filters.tipo);
    }
    
    if (filters.estado && filters.estado !== 'all') {
      filtered = filtered.filter(contract => contract.estado === filters.estado);
    }
    
    if (filters.propertyId) {
      filtered = filtered.filter(contract => contract.propertyId === filters.propertyId);
    }
    
    if (filters.clienteId) {
      filtered = filtered.filter(contract => contract.clienteId === filters.clienteId);
    }
    
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedContracts = filtered.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filtered.length / limit);
    
    return {
      contracts: paginatedContracts,
      total: filtered.length,
      page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };
  },

  getContract: async (id: string): Promise<Contract> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const contract = mockContracts.find(c => c.id === id);
    if (!contract) {
      throw new Error('Contrato no encontrado');
    }
    
    return {
      ...contract,
      versions: mockVersions.filter(v => v.contractId === id)
    };
  },

  createContract: async (data: ContractFormData): Promise<Contract> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newContract: Contract = {
      id: `contract-${Date.now()}`,
      tipo: data.tipo,
      propertyId: data.propertyId,
      propertyTitle: 'Propiedad Sample',
      propertyAddress: 'Dirección Sample',
      clienteId: data.clienteId,
      clienteNombre: 'Cliente Sample',
      propietarioId: data.propietarioId,
      propietarioNombre: data.propietarioId ? 'Propietario Sample' : undefined,
      estado: 'borrador',
      version: 1,
      honorarios: data.honorarios,
      fechaInicio: data.fechaInicio,
      fechaVencimiento: data.fechaVencimiento,
      fechasClaves: data.fechasClaves,
      notas: data.notas,
      reservaId: data.reservaId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockContracts.push(newContract);
    return newContract;
  },

  updateContract: async (id: string, data: Partial<ContractFormData>): Promise<Contract> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const contractIndex = mockContracts.findIndex(c => c.id === id);
    if (contractIndex === -1) {
      throw new Error('Contrato no encontrado');
    }
    
    mockContracts[contractIndex] = {
      ...mockContracts[contractIndex],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    return mockContracts[contractIndex];
  },

  deleteContract: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const contractIndex = mockContracts.findIndex(c => c.id === id);
    if (contractIndex === -1) {
      throw new Error('Contrato no encontrado');
    }
    
    mockContracts.splice(contractIndex, 1);
  },

  generateFromTemplate: async (contractId: string, data: GenerateFromTemplateData): Promise<Contract> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const contractIndex = mockContracts.findIndex(c => c.id === contractId);
    if (contractIndex === -1) {
      throw new Error('Contrato no encontrado');
    }
    
    mockContracts[contractIndex] = {
      ...mockContracts[contractIndex],
      estado: 'generado',
      generatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return mockContracts[contractIndex];
  },

  signContract: async (id: string): Promise<Contract> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const contractIndex = mockContracts.findIndex(c => c.id === id);
    if (contractIndex === -1) {
      throw new Error('Contrato no encontrado');
    }
    
    if (mockContracts[contractIndex].estado !== 'generado') {
      throw new Error('Solo se pueden firmar contratos generados');
    }
    
    mockContracts[contractIndex] = {
      ...mockContracts[contractIndex],
      estado: 'firmado',
      signedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return mockContracts[contractIndex];
  },

  getContractVersions: async (contractId: string): Promise<ContractVersion[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return mockVersions.filter(v => v.contractId === contractId);
  },

  getTemplates: async (): Promise<ContractTemplate[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockTemplates;
  },

  getStats: async (): Promise<ContractStats> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const total = mockContracts.length;
    const borradores = mockContracts.filter(c => c.estado === 'borrador').length;
    const generados = mockContracts.filter(c => c.estado === 'generado').length;
    const firmados = mockContracts.filter(c => c.estado === 'firmado').length;
    const anulados = mockContracts.filter(c => c.estado === 'anulado').length;
    const honorariosTotal = mockContracts.reduce((sum, c) => sum + c.honorarios, 0);
    const honorariosPromedio = total > 0 ? honorariosTotal / total : 0;
    
    return {
      total,
      borradores,
      generados,
      firmados,
      anulados,
      honorariosTotal,
      honorariosPromedio
    };
  },

  bulkAction: async (action: BulkContractAction): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    switch (action.action) {
      case 'delete':
        action.contractIds.forEach(id => {
          const index = mockContracts.findIndex(c => c.id === id);
          if (index !== -1) {
            mockContracts.splice(index, 1);
          }
        });
        break;
      case 'generate':
        action.contractIds.forEach(id => {
          const contractIndex = mockContracts.findIndex(c => c.id === id);
          if (contractIndex !== -1) {
            mockContracts[contractIndex].estado = 'generado';
            mockContracts[contractIndex].generatedAt = new Date().toISOString();
            mockContracts[contractIndex].updatedAt = new Date().toISOString();
          }
        });
        break;
      case 'sign':
        action.contractIds.forEach(id => {
          const contractIndex = mockContracts.findIndex(c => c.id === id);
          if (contractIndex !== -1 && mockContracts[contractIndex].estado === 'generado') {
            mockContracts[contractIndex].estado = 'firmado';
            mockContracts[contractIndex].signedAt = new Date().toISOString();
            mockContracts[contractIndex].updatedAt = new Date().toISOString();
          }
        });
        break;
    }
  }
};