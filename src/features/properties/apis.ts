import { Property, PropertyFilters, PropertiesResponse, PropertyFormData } from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

// Create persistent mock data store
let cachedMockProperties: Property[] | null = null;

function getMockProperties(): Property[] {
  if (!cachedMockProperties) {
    cachedMockProperties = generateMockProperties(50);
  }
  return cachedMockProperties;
}

export async function getProperties(filters: PropertyFilters = {}): Promise<PropertiesResponse> {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Usar datos mock persistentes para desarrollo
  const mockProperties = getMockProperties();
  
  // Aplicar filtros básicos
  let filteredProperties = mockProperties;
  
  if (filters.q) {
    const searchTerm = filters.q.toLowerCase();
    filteredProperties = filteredProperties.filter(p => 
      p.titulo.toLowerCase().includes(searchTerm) ||
      p.direccion.toLowerCase().includes(searchTerm) ||
      p.ciudad.toLowerCase().includes(searchTerm)
    );
  }
  
  if (filters.estado) {
    filteredProperties = filteredProperties.filter(p => p.estado === filters.estado);
  }
  
  if (filters.tipo) {
    filteredProperties = filteredProperties.filter(p => p.tipo === filters.tipo);
  }
  
  if (filters.ciudad) {
    filteredProperties = filteredProperties.filter(p => p.ciudad === filters.ciudad);
  }
  
  if (filters.priceMin) {
    filteredProperties = filteredProperties.filter(p => p.precio >= filters.priceMin!);
  }
  
  if (filters.priceMax) {
    filteredProperties = filteredProperties.filter(p => p.precio <= filters.priceMax!);
  }
  
  if (filters.habitaciones) {
    filteredProperties = filteredProperties.filter(p => p.habitaciones >= filters.habitaciones!);
  }
  
  if (filters.exclusiva !== undefined) {
    filteredProperties = filteredProperties.filter(p => p.exclusiva === filters.exclusiva);
  }
  
  // Aplicar ordenamiento
  if (filters.sort) {
    const [field, order] = filters.sort.split(':');
    filteredProperties.sort((a, b) => {
      const aValue = (a as any)[field];
      const bValue = (b as any)[field];
      
      if (order === 'desc') {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });
  }
  
  // Aplicar paginación
  const page = filters.page || 0;
  const size = filters.size || 20;
  const start = page * size;
  const end = start + size;
  const paginatedProperties = filteredProperties.slice(start, end);
  
  return {
    data: paginatedProperties,
    total: filteredProperties.length,
    page,
    size,
    totalPages: Math.ceil(filteredProperties.length / size)
  };
}

export async function getProperty(id: string): Promise<Property> {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Buscar en datos mock persistentes
  const mockProperties = getMockProperties();
  const property = mockProperties.find(p => p.id === id);
  
  if (!property) {
    throw new Error(`Propiedad con ID ${id} no encontrada`);
  }
  
  return property;
}

export async function createProperty(data: PropertyFormData): Promise<Property> {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Crear nueva propiedad con datos mock
  const newProperty: Property = {
    id: Math.random().toString(36).substr(2, 9),
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    actividad: {
      visitas: 0,
      consultas: 0,
      guardados: 0
    },
    pricing: {
      precioOriginal: data.precio,
      historialPrecios: [{
        precio: data.precio,
        fecha: new Date().toISOString(),
        motivo: 'Precio inicial'
      }]
    }
  };
  
  return newProperty;
}

export async function updateProperty(id: string, data: Partial<PropertyFormData>): Promise<Property> {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // Simular actualización de propiedad
  const existingProperty = await getProperty(id);
  const updatedProperty: Property = {
    ...existingProperty,
    ...data,
    updatedAt: new Date().toISOString()
  };
  
  return updatedProperty;
}

export async function deleteProperty(id: string): Promise<void> {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Simular eliminación (en una app real se removería de la base de datos)
  console.log(`Propiedad ${id} eliminada`);
}

export async function publishProperty(id: string, portals: string[] = ['idealista', 'fotocasa']): Promise<Property> {
  // Simulamos la publicación en portales
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simular publicación
  const existingProperty = await getProperty(id);
  const publishedProperty: Property = {
    ...existingProperty,
    publishedAt: new Date().toISOString(),
    portalSync: portals.reduce((acc, portal) => ({
      ...acc,
      [portal]: true
    }), {}),
    updatedAt: new Date().toISOString()
  };
  
  return publishedProperty;
}

export async function bulkDeleteProperties(ids: string[]): Promise<void> {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Simular eliminación masiva
  console.log(`${ids.length} propiedades eliminadas:`, ids);
}

export async function bulkUpdateProperties(ids: string[], updates: Partial<Property>): Promise<void> {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // Simular actualización masiva
  console.log(`${ids.length} propiedades actualizadas:`, { ids, updates });
}

export async function exportProperties(filters: PropertyFilters = {}): Promise<void> {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Generar datos mock para exportar
  const propertiesResponse = await getProperties(filters);
  const properties = propertiesResponse.data;
  
  // Crear CSV mock
  const csvHeaders = 'ID,Título,Dirección,Ciudad,Tipo,Precio,M2,Habitaciones,Baños,Estado,Exclusiva,Agente\n';
  const csvRows = properties.map(p => 
    `${p.id},"${p.titulo}","${p.direccion}","${p.ciudad}","${p.tipo}",${p.precio},${p.m2},${p.habitaciones},${p.banos},"${p.estado}",${p.exclusiva ? 'Sí' : 'No'},"${p.agente || ''}"`
  ).join('\n');
  
  const csvContent = csvHeaders + csvRows;
  
  // Simular descarga de CSV
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = `propiedades-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

export async function importProperties(file: File): Promise<{ success: number; errors: number; messages: string[] }> {
  // Simular delay de red para importación
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simular resultado de importación
  const success = Math.floor(Math.random() * 50) + 10;
  const errors = Math.floor(Math.random() * 5);
  
  return {
    success,
    errors,
    messages: [
      `${success} propiedades importadas correctamente`,
      errors > 0 ? `${errors} propiedades con errores` : 'Sin errores',
      'Importación completada'
    ]
  };
}

// Funciones auxiliares para mock data y desarrollo
export function generateMockProperty(overrides: Partial<Property> = {}): Property {
  const tipos = ['piso', 'atico', 'duplex', 'casa', 'chalet', 'estudio', 'loft'] as const;
  const estados = ['borrador', 'activo', 'vendido', 'alquilado'] as const;
  const ciudades = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao', 'Málaga'];
  const agentes = ['Ana García', 'Carlos López', 'María Rodríguez', 'Juan Martín', 'Laura Sánchez'];

  const id = Math.random().toString(36).substr(2, 9);
  const tipo = tipos[Math.floor(Math.random() * tipos.length)];
  const estado = estados[Math.floor(Math.random() * estados.length)];
  const ciudad = ciudades[Math.floor(Math.random() * ciudades.length)];
  const precio = Math.floor(Math.random() * 800000) + 100000;
  const m2 = Math.floor(Math.random() * 200) + 50;
  
  return {
    id,
    titulo: `${tipo.charAt(0).toUpperCase() + tipo.slice(1)} en ${ciudad}`,
    direccion: `Calle Ejemplo ${Math.floor(Math.random() * 100) + 1}`,
    ciudad,
    tipo,
    precio,
    m2,
    habitaciones: Math.floor(Math.random() * 5) + 1,
    banos: Math.floor(Math.random() * 3) + 1,
    estado,
    exclusiva: Math.random() > 0.6,
    agente: agentes[Math.floor(Math.random() * agentes.length)],
    descripcion: `Excelente ${tipo} en ${ciudad} con gran potencial`,
    caracteristicas: ['Exterior', 'Luminoso', 'Céntrico'].slice(0, Math.floor(Math.random() * 3) + 1),
    createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    actividad: {
      visitas: Math.floor(Math.random() * 100),
      consultas: Math.floor(Math.random() * 20),
      guardados: Math.floor(Math.random() * 30)
    },
    pricing: {
      precioOriginal: precio,
      historialPrecios: [{
        precio,
        fecha: new Date().toISOString(),
        motivo: 'Precio inicial'
      }]
    },
    ...overrides
  };
}

export function generateMockProperties(count: number = 50): Property[] {
  return Array.from({ length: count }, () => generateMockProperty());
}