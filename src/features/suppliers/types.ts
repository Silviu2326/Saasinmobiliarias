export interface Supplier {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  categorias: SupplierCategory[];
  zonas: string[];
  rating: number;
  estado: 'activo' | 'inactivo';
  tarifaBase?: number;
  notas?: string;
  servicios?: SupplierService[];
  documentos?: SupplierDocument[];
  createdAt: string;
  updatedAt: string;
}

export type SupplierCategory = 'foto' | 'reforma' | 'limpieza' | 'legales' | 'otros';

export interface SupplierService {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  unidad: 'hora' | 'servicio' | 'proyecto' | 'm2';
}

export interface SupplierDocument {
  id: string;
  tipo: 'contrato' | 'seguro' | 'licencia' | 'certificado' | 'otro';
  nombre: string;
  url?: string;
  fechaExpiracion?: string;
}

export interface PropertyAttachment {
  propertyId: string;
  propertyTitle: string;
  propertyAddress: string;
  attachedDate: string;
  servicios: string[];
  estado: 'activo' | 'pausado' | 'finalizado';
}

export interface SupplierFilters {
  q?: string;
  categoria?: string;
  zona?: string;
  rating?: number;
  estado?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface SupplierFormData {
  nombre: string;
  email: string;
  telefono: string;
  categorias: SupplierCategory[];
  zonas: string[];
  tarifaBase?: number;
  notas?: string;
  estado?: 'activo' | 'inactivo';
}

export interface AttachPropertyData {
  supplierId: string;
  propertyId: string;
  servicios: string[];
  notas?: string;
}