import { 
  Offer, 
  OfferEvent, 
  CounterOffer,
  OfferFormData, 
  CounterOfferFormData, 
  OffersFilters, 
  OffersResponse, 
  OfferStats,
  BulkAction 
} from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

// API Functions
export async function getOffers(filters: OffersFilters = {}): Promise<OffersResponse> {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== 'all') {
      params.append(key, String(value));
    }
  });

  const response = await fetch(`${API_BASE}/operations/offers?${params}`);
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

export async function createOffer(data: OfferFormData): Promise<Offer> {
  const response = await fetch(`${API_BASE}/operations/offers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estado: 'abierta'
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

export async function getOffer(id: string): Promise<Offer> {
  const response = await fetch(`${API_BASE}/operations/offers/${id}`);
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

export async function updateOffer(id: string, data: Partial<OfferFormData>): Promise<Offer> {
  const response = await fetch(`${API_BASE}/operations/offers/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...data,
      updatedAt: new Date().toISOString()
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

export async function deleteOffer(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/operations/offers/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
}

export async function createCounterOffer(offerId: string, data: CounterOfferFormData): Promise<CounterOffer> {
  const response = await fetch(`${API_BASE}/operations/offers/${offerId}/counter`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...data,
      createdAt: new Date().toISOString()
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

export async function acceptOffer(id: string, notes?: string): Promise<Offer> {
  const response = await fetch(`${API_BASE}/operations/offers/${id}/accept`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ notes }),
  });
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

export async function rejectOffer(id: string, notes?: string): Promise<Offer> {
  const response = await fetch(`${API_BASE}/operations/offers/${id}/reject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ notes }),
  });
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

export async function getOfferTimeline(id: string): Promise<OfferEvent[]> {
  const response = await fetch(`${API_BASE}/operations/offers/${id}/timeline`);
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

export async function getOfferStats(): Promise<OfferStats> {
  const response = await fetch(`${API_BASE}/operations/offers/stats`);
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

export async function bulkOfferAction(action: BulkAction): Promise<void> {
  const response = await fetch(`${API_BASE}/operations/offers/bulk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(action),
  });
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
}

// Mock Data Generation
export function generateMockOffers(count: number = 25): Offer[] {
  const clientes = [
    { id: 'client-1', nombre: 'Ana García', email: 'ana.garcia@email.com', telefono: '666123456' },
    { id: 'client-2', nombre: 'Carlos López', email: 'carlos.lopez@email.com', telefono: '666234567' },
    { id: 'client-3', nombre: 'María Rodríguez', email: 'maria.rodriguez@email.com', telefono: '666345678' },
    { id: 'client-4', nombre: 'José Martín', email: 'jose.martin@email.com', telefono: '666456789' },
    { id: 'client-5', nombre: 'Laura Sánchez', email: 'laura.sanchez@email.com', telefono: '666567890' },
    { id: 'client-6', nombre: 'Pedro Ruiz', email: 'pedro.ruiz@email.com', telefono: '666678901' },
    { id: 'client-7', nombre: 'Carmen Vega', email: 'carmen.vega@email.com', telefono: '666789012' },
    { id: 'client-8', nombre: 'Antonio Silva', email: 'antonio.silva@email.com', telefono: '666890123' }
  ];

  const properties = [
    { id: 'prop-1', title: 'Piso en Malasaña', address: 'Calle Fuencarral 45, Madrid', price: 350000 },
    { id: 'prop-2', title: 'Ático en Salamanca', address: 'Calle Serrano 123, Madrid', price: 750000 },
    { id: 'prop-3', title: 'Casa en Las Rozas', address: 'Urbanización Monte Rozas, Las Rozas', price: 850000 },
    { id: 'prop-4', title: 'Loft en Chueca', address: 'Calle Hortaleza 67, Madrid', price: 420000 },
    { id: 'prop-5', title: 'Dúplex en Chamberí', address: 'Calle Almagro 34, Madrid', price: 580000 },
    { id: 'prop-6', title: 'Estudio en Sol', address: 'Plaza del Sol 12, Madrid', price: 280000 },
    { id: 'prop-7', title: 'Casa en Pozuelo', address: 'Avenida de Europa 28, Pozuelo', price: 920000 },
    { id: 'prop-8', title: 'Piso en Retiro', address: 'Calle Alfonso XII 56, Madrid', price: 650000 }
  ];

  const agentes = [
    { id: 'agent-1', nombre: 'Pedro Ruiz' },
    { id: 'agent-2', nombre: 'Carmen Vega' },
    { id: 'agent-3', nombre: 'Antonio Silva' },
    { id: 'agent-4', nombre: 'Isabel Torres' }
  ];

  const estados: Array<'abierta' | 'counter' | 'aceptada' | 'rechazada' | 'expirada'> = 
    ['abierta', 'counter', 'aceptada', 'rechazada', 'expirada'];

  const condicionesTemplates = [
    'Oferta condicionada a obtención de hipoteca al 80% en 30 días',
    'Pago al contado, entrega inmediata',
    'Oferta válida con reserva de 6.000€, resto en escritura',
    'Condicionado a visita técnica satisfactoria',
    'Pago 50% al contrato, 50% a la entrega de llaves',
    'Oferta con mobiliario incluido según inventario',
    'Condicionado a venta previa de vivienda actual'
  ];

  return Array.from({ length: count }, (_, index) => {
    const cliente = clientes[index % clientes.length];
    const property = properties[index % properties.length];
    const agente = agentes[index % agentes.length];
    const estado = estados[Math.floor(Math.random() * estados.length)];
    
    // Crear fecha base (últimos 90 días)
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - Math.floor(Math.random() * 90));
    
    // Fecha de vencimiento (7-30 días desde creación)
    const vencimiento = new Date(baseDate);
    vencimiento.setDate(vencimiento.getDate() + (7 + Math.floor(Math.random() * 23)));
    
    // Si es expirada, vencimiento en el pasado
    if (estado === 'expirada') {
      vencimiento.setDate(vencimiento.getDate() - Math.floor(Math.random() * 30));
    }
    
    // Actualización reciente para algunos estados
    const updatedAt = ['counter', 'aceptada', 'rechazada'].includes(estado) 
      ? new Date(baseDate.getTime() + Math.random() * (Date.now() - baseDate.getTime()))
      : baseDate;

    // Generar importe realista (70-120% del precio de la propiedad)
    const priceFactor = 0.7 + Math.random() * 0.5; // 70%-120%
    const importe = Math.round(property.price * priceFactor);

    // Generar contraofertas para estado 'counter'
    const counterOffers: CounterOffer[] = estado === 'counter' ? [
      {
        id: `counter-${index}-1`,
        offerId: `offer-${index + 1}`,
        importe: importe + (Math.random() > 0.5 ? 10000 : -5000),
        condiciones: 'Contraoferta con ajuste en el precio y plazos',
        notas: 'El propietario acepta pero con modificaciones en el precio',
        createdBy: 'agent-1',
        createdByName: 'Pedro Ruiz',
        createdAt: new Date(updatedAt.getTime() + 3600000).toISOString()
      }
    ] : [];

    return {
      id: `offer-${index + 1}`,
      clienteId: cliente.id,
      clienteNombre: cliente.nombre,
      clienteEmail: cliente.email,
      clienteTelefono: cliente.telefono,
      propertyId: property.id,
      propertyTitle: property.title,
      propertyAddress: property.address,
      propertyPrice: property.price,
      agenteId: agente.id,
      agenteNombre: agente.nombre,
      importe,
      condiciones: condicionesTemplates[Math.floor(Math.random() * condicionesTemplates.length)],
      estado,
      venceEl: vencimiento.toISOString().split('T')[0],
      notas: Math.random() > 0.6 ? 'Cliente muy interesado, respuesta rápida esperada' : undefined,
      createdAt: baseDate.toISOString(),
      updatedAt: updatedAt.toISOString(),
      counterOffers
    };
  });
}

export function generateMockOfferEvents(offerId: string, offer: Offer): OfferEvent[] {
  const events: OfferEvent[] = [];
  
  // Evento de creación
  events.push({
    id: `event-${offerId}-create`,
    offerId,
    type: 'create',
    at: offer.createdAt,
    by: offer.agenteId,
    byName: offer.agenteNombre,
    notes: 'Oferta creada',
    data: {
      importe: offer.importe,
      condiciones: offer.condiciones
    }
  });

  // Eventos adicionales basados en el estado
  if (offer.estado === 'counter' && offer.counterOffers?.length) {
    offer.counterOffers.forEach((counter, index) => {
      events.push({
        id: `event-${offerId}-counter-${index}`,
        offerId,
        type: 'counter',
        at: counter.createdAt,
        by: counter.createdBy,
        byName: counter.createdByName,
        notes: counter.notas || 'Contraoferta realizada',
        data: {
          importe: counter.importe,
          condiciones: counter.condiciones
        }
      });
    });
  }

  if (offer.estado === 'aceptada') {
    events.push({
      id: `event-${offerId}-accept`,
      offerId,
      type: 'accept',
      at: offer.updatedAt,
      by: offer.agenteId,
      byName: offer.agenteNombre,
      notes: 'Oferta aceptada por el propietario'
    });
  }

  if (offer.estado === 'rechazada') {
    events.push({
      id: `event-${offerId}-reject`,
      offerId,
      type: 'reject',
      at: offer.updatedAt,
      by: offer.agenteId,
      byName: offer.agenteNombre,
      notes: 'Oferta rechazada por el propietario'
    });
  }

  if (offer.estado === 'expirada') {
    events.push({
      id: `event-${offerId}-expire`,
      offerId,
      type: 'expire',
      at: offer.venceEl + 'T23:59:59.000Z',
      by: 'system',
      byName: 'Sistema',
      notes: 'Oferta expirada automáticamente'
    });
  }

  return events.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
}

// Simulación de datos adicionales
export function generateMockClients() {
  return [
    { id: 'client-1', nombre: 'Ana García', email: 'ana.garcia@email.com' },
    { id: 'client-2', nombre: 'Carlos López', email: 'carlos.lopez@email.com' },
    { id: 'client-3', nombre: 'María Rodríguez', email: 'maria.rodriguez@email.com' },
    { id: 'client-4', nombre: 'José Martín', email: 'jose.martin@email.com' },
    { id: 'client-5', nombre: 'Laura Sánchez', email: 'laura.sanchez@email.com' }
  ];
}

export function generateMockProperties() {
  return [
    { id: 'prop-1', title: 'Piso en Malasaña', address: 'Calle Fuencarral 45, Madrid', price: 350000 },
    { id: 'prop-2', title: 'Ático en Salamanca', address: 'Calle Serrano 123, Madrid', price: 750000 },
    { id: 'prop-3', title: 'Casa en Las Rozas', address: 'Urbanización Monte Rozas, Las Rozas', price: 850000 },
    { id: 'prop-4', title: 'Loft en Chueca', address: 'Calle Hortaleza 67, Madrid', price: 420000 },
    { id: 'prop-5', title: 'Dúplex en Chamberí', address: 'Calle Almagro 34, Madrid', price: 580000 }
  ];
}

export function generateMockAgents() {
  return [
    { id: 'agent-1', nombre: 'Pedro Ruiz' },
    { id: 'agent-2', nombre: 'Carmen Vega' },
    { id: 'agent-3', nombre: 'Antonio Silva' },
    { id: 'agent-4', nombre: 'Isabel Torres' }
  ];
}