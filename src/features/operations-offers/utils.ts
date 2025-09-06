import { Offer, OffersFilters, OfferStats } from './types';
import { OFFER_ESTADOS } from './schema';

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// Format date
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

// Format relative date
export function formatRelativeDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Hoy';
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `Hace ${weeks} semana${weeks > 1 ? 's' : ''}`;
    } else {
      return formatDate(dateString);
    }
  } catch {
    return dateString;
  }
}

// Check if offer is expiring soon (within 7 days)
export function isOfferExpiringSoon(venceEl: string): boolean {
  try {
    const vencimiento = new Date(venceEl);
    const now = new Date();
    const diffMs = vencimiento.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    return diffDays <= 7 && diffDays >= 0;
  } catch {
    return false;
  }
}

// Check if offer is expired
export function isOfferExpired(venceEl: string): boolean {
  try {
    const vencimiento = new Date(venceEl);
    const now = new Date();
    
    return vencimiento < now;
  } catch {
    return false;
  }
}

// Get days until expiration
export function getDaysUntilExpiration(venceEl: string): number {
  try {
    const vencimiento = new Date(venceEl);
    const now = new Date();
    const diffMs = vencimiento.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    return diffDays;
  } catch {
    return 0;
  }
}

// Get offer status color
export function getOfferStatusColor(estado: string): string {
  const estadoData = OFFER_ESTADOS.find(e => e.value === estado);
  return estadoData?.color || 'text-gray-800 bg-gray-100';
}

// Get offer status label
export function getOfferStatusLabel(estado: string): string {
  const estadoData = OFFER_ESTADOS.find(e => e.value === estado);
  return estadoData?.label || estado;
}

// Get urgency indicator
export function getOfferUrgency(offer: Offer): 'high' | 'medium' | 'low' {
  if (offer.estado === 'expirada') return 'low';
  if (offer.estado === 'aceptada' || offer.estado === 'rechazada') return 'low';
  
  const daysLeft = getDaysUntilExpiration(offer.venceEl);
  
  if (daysLeft < 0) return 'high'; // Vencida
  if (daysLeft <= 3) return 'high'; // 3 días o menos
  if (daysLeft <= 7) return 'medium'; // 1 semana o menos
  
  return 'low';
}

// Calculate offer acceptance rate
export function calculateAcceptanceRate(offers: Offer[]): number {
  const totalFinished = offers.filter(o => 
    ['aceptada', 'rechazada', 'expirada'].includes(o.estado)
  ).length;
  
  if (totalFinished === 0) return 0;
  
  const accepted = offers.filter(o => o.estado === 'aceptada').length;
  return Math.round((accepted / totalFinished) * 100);
}

// Calculate average days to resolution
export function calculateAverageResolutionDays(offers: Offer[]): number {
  const resolvedOffers = offers.filter(o => 
    ['aceptada', 'rechazada', 'expirada'].includes(o.estado)
  );
  
  if (resolvedOffers.length === 0) return 0;
  
  const totalDays = resolvedOffers.reduce((sum, offer) => {
    const created = new Date(offer.createdAt);
    const updated = new Date(offer.updatedAt);
    const days = Math.ceil((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    return sum + days;
  }, 0);
  
  return Math.round(totalDays / resolvedOffers.length);
}

// Sort offers by multiple criteria
export function sortOffers(offers: Offer[], sortBy: string, sortOrder: 'asc' | 'desc' = 'desc'): Offer[] {
  return [...offers].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'importe':
        comparison = a.importe - b.importe;
        break;
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'updatedAt':
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
      case 'venceEl':
        comparison = new Date(a.venceEl).getTime() - new Date(b.venceEl).getTime();
        break;
      case 'clienteNombre':
        comparison = a.clienteNombre.localeCompare(b.clienteNombre);
        break;
      case 'propertyTitle':
        comparison = a.propertyTitle.localeCompare(b.propertyTitle);
        break;
      case 'estado':
        comparison = a.estado.localeCompare(b.estado);
        break;
      default:
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });
}

// Filter offers
export function filterOffers(offers: Offer[], filters: OffersFilters): Offer[] {
  return offers.filter(offer => {
    // Text search
    if (filters.q) {
      const query = filters.q.toLowerCase();
      const searchableText = [
        offer.clienteNombre,
        offer.propertyTitle,
        offer.propertyAddress,
        offer.condiciones,
        offer.notas || ''
      ].join(' ').toLowerCase();
      
      if (!searchableText.includes(query)) {
        return false;
      }
    }

    // Property filter
    if (filters.propertyId && offer.propertyId !== filters.propertyId) {
      return false;
    }

    // Client filter
    if (filters.clienteId && offer.clienteId !== filters.clienteId) {
      return false;
    }

    // Status filter
    if (filters.estado && filters.estado !== 'all' && offer.estado !== filters.estado) {
      return false;
    }

    // Price range filter
    if (filters.precioMin && offer.importe < filters.precioMin) {
      return false;
    }
    if (filters.precioMax && offer.importe > filters.precioMax) {
      return false;
    }

    // Agent filter
    if (filters.agenteId && offer.agenteId !== filters.agenteId) {
      return false;
    }

    // Date range filter
    if (filters.fechaDesde) {
      const createdDate = new Date(offer.createdAt).toISOString().split('T')[0];
      if (createdDate < filters.fechaDesde) {
        return false;
      }
    }
    if (filters.fechaHasta) {
      const createdDate = new Date(offer.createdAt).toISOString().split('T')[0];
      if (createdDate > filters.fechaHasta) {
        return false;
      }
    }

    // Expiration filter
    if (filters.vencimiento && filters.vencimiento !== 'all') {
      if (filters.vencimiento === 'proximas') {
        if (!isOfferExpiringSoon(offer.venceEl) || isOfferExpired(offer.venceEl)) {
          return false;
        }
      } else if (filters.vencimiento === 'vencidas') {
        if (!isOfferExpired(offer.venceEl)) {
          return false;
        }
      }
    }

    return true;
  });
}

// Generate stats from offers
export function generateOfferStats(offers: Offer[]): OfferStats {
  const stats = {
    total: offers.length,
    abiertas: 0,
    counter: 0,
    aceptadas: 0,
    rechazadas: 0,
    expiradas: 0,
    importeTotal: 0,
    importePromedio: 0,
    tasaAceptacion: 0,
    tiempoPromedio: 0
  };

  if (offers.length === 0) return stats;

  // Count by status and sum amounts
  offers.forEach(offer => {
    switch (offer.estado) {
      case 'abierta':
        stats.abiertas++;
        break;
      case 'counter':
        stats.counter++;
        break;
      case 'aceptada':
        stats.aceptadas++;
        break;
      case 'rechazada':
        stats.rechazada++;
        break;
      case 'expirada':
        stats.expiradas++;
        break;
    }
    
    stats.importeTotal += offer.importe;
  });

  stats.importePromedio = Math.round(stats.importeTotal / offers.length);
  stats.tasaAceptacion = calculateAcceptanceRate(offers);
  stats.tiempoPromedio = calculateAverageResolutionDays(offers);

  return stats;
}

// Export offers to CSV
export function exportOffersToCSV(offers: Offer[]): string {
  const headers = [
    'ID',
    'Fecha',
    'Cliente',
    'Email Cliente',
    'Teléfono Cliente',
    'Propiedad',
    'Dirección',
    'Precio Propiedad',
    'Importe Oferta',
    'Estado',
    'Agente',
    'Vencimiento',
    'Condiciones',
    'Notas',
    'Actualizada'
  ];

  const rows = offers.map(offer => [
    offer.id,
    formatDate(offer.createdAt),
    offer.clienteNombre,
    offer.clienteEmail || '',
    offer.clienteTelefono || '',
    offer.propertyTitle,
    offer.propertyAddress,
    offer.propertyPrice || '',
    offer.importe,
    getOfferStatusLabel(offer.estado),
    offer.agenteNombre,
    formatDate(offer.venceEl),
    `"${offer.condiciones.replace(/"/g, '""')}"`, // Escape quotes
    `"${(offer.notas || '').replace(/"/g, '""')}"`, // Escape quotes
    formatDate(offer.updatedAt)
  ]);

  return [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');
}

// Debounce function
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Parse URL query params to filters
export function parseFiltersFromQuery(searchParams: URLSearchParams): OffersFilters {
  const filters: OffersFilters = {};

  if (searchParams.get('q')) filters.q = searchParams.get('q')!;
  if (searchParams.get('estado')) filters.estado = searchParams.get('estado') as any;
  if (searchParams.get('propertyId')) filters.propertyId = searchParams.get('propertyId')!;
  if (searchParams.get('clienteId')) filters.clienteId = searchParams.get('clienteId')!;
  if (searchParams.get('agenteId')) filters.agenteId = searchParams.get('agenteId')!;
  if (searchParams.get('vencimiento')) filters.vencimiento = searchParams.get('vencimiento') as any;
  if (searchParams.get('fechaDesde')) filters.fechaDesde = searchParams.get('fechaDesde')!;
  if (searchParams.get('fechaHasta')) filters.fechaHasta = searchParams.get('fechaHasta')!;
  if (searchParams.get('precioMin')) filters.precioMin = parseInt(searchParams.get('precioMin')!);
  if (searchParams.get('precioMax')) filters.precioMax = parseInt(searchParams.get('precioMax')!);
  if (searchParams.get('page')) filters.page = parseInt(searchParams.get('page')!);
  if (searchParams.get('sortBy')) filters.sortBy = searchParams.get('sortBy')!;
  if (searchParams.get('sortOrder')) filters.sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc';

  return filters;
}

// Build query params from filters
export function buildQueryFromFilters(filters: OffersFilters): string {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== 'all') {
      params.set(key, String(value));
    }
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}