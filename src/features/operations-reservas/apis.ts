import { 
  Reserva, 
  ReservaFormData, 
  ReservaSignData, 
  ReservaCancelData,
  ReservasFilters, 
  ReservasResponse, 
  ReservaStats,
  ReservaPago,
  BulkReservaAction 
} from './types';

// Mock data for development
const mockReservas: Reserva[] = [
  {
    id: '1',
    ofertaId: 'offer-1',
    clienteId: 'client-1',
    clienteNombre: 'Juan Pérez',
    clienteEmail: 'juan@email.com',
    clienteTelefono: '+34 666 111 222',
    propertyId: 'prop-1',
    propertyTitle: 'Piso en Centro',
    propertyAddress: 'Calle Mayor 123',
    propertyPrice: 250000,
    agenteId: 'agent-1',
    agenteNombre: 'María García',
    tipo: 'senal',
    importe: 25000,
    estado: 'firmada',
    venceEl: '2024-03-15',
    condiciones: 'Señal del 10% sobre precio de venta',
    notas: 'Cliente muy interesado',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    signedAt: '2024-01-16T14:30:00Z',
    signedBy: 'agent-1',
    payments: [
      {
        id: 'payment-1',
        reservaId: '1',
        concepto: 'Señal inicial',
        importe: 25000,
        dueDate: '2024-01-20',
        paidAt: '2024-01-18T09:00:00Z',
        paidBy: 'client-1',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-18T09:00:00Z'
      }
    ]
  },
  {
    id: '2',
    clienteId: 'client-2',
    clienteNombre: 'Ana López',
    clienteEmail: 'ana@email.com',
    propertyId: 'prop-2',
    propertyTitle: 'Casa en Urbanización',
    propertyAddress: 'Av. Libertad 456',
    propertyPrice: 350000,
    agenteId: 'agent-2',
    agenteNombre: 'Carlos Ruiz',
    tipo: 'arras',
    importe: 35000,
    estado: 'borrador',
    venceEl: '2024-03-30',
    condiciones: 'Arras del 10% con penalización doble',
    createdAt: '2024-01-20T15:30:00Z',
    updatedAt: '2024-01-20T15:30:00Z'
  }
];

export const reservasApi = {
  // GET /operations/reservas
  getReservas: async (filters: ReservasFilters = {}): Promise<ReservasResponse> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filtered = [...mockReservas];
    
    if (filters.q) {
      const query = filters.q.toLowerCase();
      filtered = filtered.filter(r => 
        r.clienteNombre.toLowerCase().includes(query) ||
        r.propertyTitle.toLowerCase().includes(query) ||
        r.propertyAddress.toLowerCase().includes(query)
      );
    }
    
    if (filters.estado && filters.estado !== 'all') {
      filtered = filtered.filter(r => r.estado === filters.estado);
    }
    
    if (filters.tipo && filters.tipo !== 'all') {
      filtered = filtered.filter(r => r.tipo === filters.tipo);
    }
    
    if (filters.propertyId) {
      filtered = filtered.filter(r => r.propertyId === filters.propertyId);
    }
    
    if (filters.clienteId) {
      filtered = filtered.filter(r => r.clienteId === filters.clienteId);
    }
    
    if (filters.agenteId) {
      filtered = filtered.filter(r => r.agenteId === filters.agenteId);
    }
    
    if (filters.fechaDesde) {
      filtered = filtered.filter(r => r.createdAt >= filters.fechaDesde!);
    }
    
    if (filters.fechaHasta) {
      filtered = filtered.filter(r => r.createdAt <= filters.fechaHasta!);
    }
    
    if (filters.vencimiento && filters.vencimiento !== 'all') {
      const today = new Date().toISOString().split('T')[0];
      if (filters.vencimiento === 'proximas') {
        filtered = filtered.filter(r => r.venceEl >= today);
      } else if (filters.vencimiento === 'vencidas') {
        filtered = filtered.filter(r => r.venceEl < today);
      }
    }
    
    const total = filtered.length;
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;
    
    const reservas = filtered.slice(offset, offset + limit);
    const totalPages = Math.ceil(total / limit);
    
    return {
      reservas,
      total,
      page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };
  },

  // POST /operations/reservas
  createReserva: async (data: ReservaFormData): Promise<Reserva> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newReserva: Reserva = {
      id: `reserva-${Date.now()}`,
      ...data,
      clienteNombre: 'Cliente Nuevo', // Would be fetched from clienteId
      propertyTitle: 'Propiedad Nueva', // Would be fetched from propertyId
      propertyAddress: 'Dirección Nueva',
      agenteId: 'current-agent',
      agenteNombre: 'Agente Actual',
      estado: 'borrador',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockReservas.push(newReserva);
    return newReserva;
  },

  // GET /operations/reservas/:id
  getReserva: async (id: string): Promise<Reserva | null> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockReservas.find(r => r.id === id) || null;
  },

  // PUT /operations/reservas/:id
  updateReserva: async (id: string, data: Partial<ReservaFormData>): Promise<Reserva> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = mockReservas.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error('Reserva not found');
    }
    
    mockReservas[index] = {
      ...mockReservas[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    return mockReservas[index];
  },

  // DELETE /operations/reservas/:id
  deleteReserva: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = mockReservas.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error('Reserva not found');
    }
    
    mockReservas.splice(index, 1);
  },

  // POST /operations/reservas/:id/sign
  signReserva: async (id: string, data: ReservaSignData): Promise<Reserva> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = mockReservas.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error('Reserva not found');
    }
    
    mockReservas[index] = {
      ...mockReservas[index],
      estado: 'firmada',
      signedAt: new Date().toISOString(),
      signedBy: 'current-agent',
      notas: data.notes || mockReservas[index].notas,
      updatedAt: new Date().toISOString()
    };
    
    return mockReservas[index];
  },

  // POST /operations/reservas/:id/cancel
  cancelReserva: async (id: string, data: ReservaCancelData): Promise<Reserva> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = mockReservas.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error('Reserva not found');
    }
    
    mockReservas[index] = {
      ...mockReservas[index],
      estado: 'cancelada',
      cancelReason: data.reason,
      canceledAt: new Date().toISOString(),
      canceledBy: 'current-agent',
      notas: data.notes || mockReservas[index].notas,
      updatedAt: new Date().toISOString()
    };
    
    return mockReservas[index];
  },

  // GET /operations/reservas/:id/payments
  getReservaPayments: async (id: string): Promise<ReservaPago[]> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const reserva = mockReservas.find(r => r.id === id);
    return reserva?.payments || [];
  },

  // GET /operations/reservas/stats
  getReservasStats: async (filters: Partial<ReservasFilters> = {}): Promise<ReservaStats> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filtered = [...mockReservas];
    
    if (filters.fechaDesde) {
      filtered = filtered.filter(r => r.createdAt >= filters.fechaDesde!);
    }
    
    if (filters.fechaHasta) {
      filtered = filtered.filter(r => r.createdAt <= filters.fechaHasta!);
    }
    
    const total = filtered.length;
    const borrador = filtered.filter(r => r.estado === 'borrador').length;
    const firmada = filtered.filter(r => r.estado === 'firmada').length;
    const cancelada = filtered.filter(r => r.estado === 'cancelada').length;
    
    const importeTotal = filtered.reduce((sum, r) => sum + r.importe, 0);
    const importePromedio = total > 0 ? importeTotal / total : 0;
    
    const tasaConversion = total > 0 ? (firmada / total) * 100 : 0;
    const tiempoPromedio = 7; // Mock value
    
    return {
      total,
      borrador,
      firmada,
      cancelada,
      importeTotal,
      importePromedio,
      tasaConversion,
      tiempoPromedio
    };
  },

  // POST /operations/reservas/bulk
  bulkAction: async (action: BulkReservaAction): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (action.action === 'delete') {
      action.reservaIds.forEach(id => {
        const index = mockReservas.findIndex(r => r.id === id);
        if (index !== -1) {
          mockReservas.splice(index, 1);
        }
      });
    } else if (action.action === 'sign') {
      action.reservaIds.forEach(id => {
        const index = mockReservas.findIndex(r => r.id === id);
        if (index !== -1) {
          mockReservas[index].estado = 'firmada';
          mockReservas[index].signedAt = new Date().toISOString();
          mockReservas[index].signedBy = 'current-agent';
          mockReservas[index].updatedAt = new Date().toISOString();
        }
      });
    } else if (action.action === 'cancel') {
      action.reservaIds.forEach(id => {
        const index = mockReservas.findIndex(r => r.id === id);
        if (index !== -1) {
          mockReservas[index].estado = 'cancelada';
          mockReservas[index].cancelReason = action.reason || 'Cancelación masiva';
          mockReservas[index].canceledAt = new Date().toISOString();
          mockReservas[index].canceledBy = 'current-agent';
          mockReservas[index].updatedAt = new Date().toISOString();
        }
      });
    }
  }
};