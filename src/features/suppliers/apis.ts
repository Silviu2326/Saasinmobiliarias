import { Supplier, SupplierFilters, SupplierFormData, AttachPropertyData, SupplierService, PropertyAttachment } from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

// Suppliers API
export async function getSuppliers(filters: SupplierFilters = {}): Promise<{ data: Supplier[]; total: number; page: number; size: number }> {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, String(value));
    }
  });

  const response = await fetch(`${API_BASE}/suppliers?${params}`);
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

export async function getSupplier(id: string): Promise<Supplier> {
  const response = await fetch(`${API_BASE}/suppliers/${id}`);
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

export async function createSupplier(data: SupplierFormData): Promise<Supplier> {
  const response = await fetch(`${API_BASE}/suppliers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

export async function updateSupplier(id: string, data: Partial<SupplierFormData>): Promise<Supplier> {
  const response = await fetch(`${API_BASE}/suppliers/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

export async function deleteSupplier(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/suppliers/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
}

export async function bulkDeleteSuppliers(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/suppliers/bulk-delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ids }),
  });
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
}

// Services API
export async function getSupplierServices(id: string): Promise<SupplierService[]> {
  const response = await fetch(`${API_BASE}/suppliers/${id}/services`);
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

// Property attachment API
export async function attachProperty(data: AttachPropertyData): Promise<PropertyAttachment> {
  const response = await fetch(`${API_BASE}/suppliers/${data.supplierId}/attach-property`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

export async function getSupplierProperties(supplierId: string): Promise<PropertyAttachment[]> {
  const response = await fetch(`${API_BASE}/suppliers/${supplierId}/properties`);
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

// Import/Export functions
export async function exportSuppliers(filters: SupplierFilters = {}): Promise<void> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, String(value));
    }
  });

  const response = await fetch(`${API_BASE}/suppliers/export?${params}`);
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `proveedores-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

export async function importSuppliers(file: File): Promise<{ success: number; errors: number }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/suppliers/import`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

// Mock data generation
export function generateMockSuppliers(count: number = 30): Supplier[] {
  const nombres = [
    'Foto Profesional Madrid', 'Reformas García', 'Limpieza Total', 'Abogados & Asociados', 
    'Constructora Pérez', 'Fotografía Inmobiliaria', 'Limpiezas Express', 'Despacho Jurídico López',
    'Reformas Integrales', 'Studio Foto Casa', 'Servicios de Limpieza', 'Asesoría Legal Inmobiliaria',
    'Obras y Reformas SL', 'Imagen Inmobiliaria', 'Clean & Shine', 'Bufete Martínez'
  ];

  const emails = [
    'info@fotoprofesional.com', 'contacto@reformasgarcia.es', 'admin@limpiezatotal.com',
    'despacho@abogados.com', 'obras@constructoraperez.es', 'hola@fotoinmobiliaria.com'
  ];

  const telefonos = [
    '915234567', '916345678', '917456789', '918567890', '919678901', '910789012'
  ];

  const zonas = ['Madrid Centro', 'Madrid Norte', 'Madrid Sur', 'Barcelona', 'Valencia', 'Sevilla'];
  const categorias = ['foto', 'reforma', 'limpieza', 'legales', 'otros'] as const;

  return Array.from({ length: count }, (_, index) => {
    const categoria = categorias[Math.floor(Math.random() * categorias.length)];
    const numCategorias = Math.floor(Math.random() * 2) + 1;
    const supplierCategorias = Array.from({ length: numCategorias }, () => 
      categorias[Math.floor(Math.random() * categorias.length)]
    ).filter((value, index, self) => self.indexOf(value) === index);

    const numZonas = Math.floor(Math.random() * 3) + 1;
    const supplierZonas = Array.from({ length: numZonas }, () => 
      zonas[Math.floor(Math.random() * zonas.length)]
    ).filter((value, index, self) => self.indexOf(value) === index);

    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 365));

    return {
      id: `supplier-${index + 1}`,
      nombre: nombres[index % nombres.length],
      email: emails[index % emails.length].replace('@', `${index + 1}@`),
      telefono: telefonos[index % telefonos.length],
      categorias: supplierCategorias,
      zonas: supplierZonas,
      rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 - 5.0 rating
      estado: Math.random() > 0.1 ? 'activo' : 'inactivo',
      tarifaBase: Math.floor(Math.random() * 100) + 25,
      notas: Math.random() > 0.6 ? 'Proveedor recomendado por la calidad de sus servicios' : undefined,
      servicios: generateMockServices(categoria, Math.floor(Math.random() * 4) + 1),
      createdAt: createdDate.toISOString(),
      updatedAt: createdDate.toISOString()
    };
  });
}

function generateMockServices(categoria: string, count: number): SupplierService[] {
  const servicesByCategory: Record<string, { nombre: string; precio: number; unidad: 'hora' | 'servicio' | 'proyecto' | 'm2' }[]> = {
    foto: [
      { nombre: 'Reportaje fotográfico básico', precio: 80, unidad: 'servicio' },
      { nombre: 'Fotografía profesional premium', precio: 150, unidad: 'servicio' },
      { nombre: 'Tour virtual 360°', precio: 200, unidad: 'servicio' },
      { nombre: 'Retoque fotográfico', precio: 15, unidad: 'hora' }
    ],
    reforma: [
      { nombre: 'Reforma integral', precio: 400, unidad: 'm2' },
      { nombre: 'Pintura interior', precio: 12, unidad: 'm2' },
      { nombre: 'Instalación suelos', precio: 25, unidad: 'm2' },
      { nombre: 'Reforma baño completo', precio: 3500, unidad: 'proyecto' }
    ],
    limpieza: [
      { nombre: 'Limpieza general', precio: 15, unidad: 'hora' },
      { nombre: 'Limpieza profunda post-obra', precio: 25, unidad: 'hora' },
      { nombre: 'Limpieza de cristales', precio: 80, unidad: 'servicio' },
      { nombre: 'Mantenimiento semanal', precio: 200, unidad: 'servicio' }
    ],
    legales: [
      { nombre: 'Consultoría jurídica', precio: 120, unidad: 'hora' },
      { nombre: 'Redacción contrato compraventa', precio: 300, unidad: 'servicio' },
      { nombre: 'Gestión escrituras', precio: 500, unidad: 'servicio' },
      { nombre: 'Asesoría fiscal inmobiliaria', precio: 100, unidad: 'hora' }
    ],
    otros: [
      { nombre: 'Tasación inmobiliaria', precio: 250, unidad: 'servicio' },
      { nombre: 'Certificado energético', precio: 120, unidad: 'servicio' },
      { nombre: 'Instalación alarma', precio: 200, unidad: 'servicio' },
      { nombre: 'Mantenimiento general', precio: 35, unidad: 'hora' }
    ]
  };

  const availableServices = servicesByCategory[categoria] || servicesByCategory.otros;
  
  return Array.from({ length: Math.min(count, availableServices.length) }, (_, index) => {
    const service = availableServices[index];
    return {
      id: `service-${Math.random().toString(36).substr(2, 9)}`,
      nombre: service.nombre,
      descripcion: `Descripción detallada del servicio: ${service.nombre.toLowerCase()}`,
      precio: service.precio,
      unidad: service.unidad
    };
  });
}