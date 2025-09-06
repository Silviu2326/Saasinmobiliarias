export interface CoExclusiva {
  id: string;
  titulo: string;
  descripcion: string;
  precio: number;
  ubicacion: {
    direccion: string;
    ciudad: string;
    codigoPostal: string;
    latitud: number;
    longitud: number;
  };
  caracteristicas: {
    tipoInmueble: 'piso' | 'chalet' | 'local' | 'oficina' | 'garaje' | 'trastero';
    superficie: number;
    habitaciones: number;
    banos: number;
    planta?: number;
    ascensor?: boolean;
    terraza?: boolean;
    jardin?: boolean;
    piscina?: boolean;
    garaje?: boolean;
  };
  imagenes: {
    url: string;
    esPortada: boolean;
    descripcion?: string;
  }[];
  estado: 'disponible' | 'reservada' | 'vendida' | 'retirada';
  colaboracion: {
    porcentajeComision: number;
    condiciones: string;
    tipoColaboracion: 'venta' | 'alquiler' | 'ambos';
  };
  propietario: {
    nombre: string;
    telefono: string;
    email: string;
    inmobiliaria: string;
  };
  fechaCreacion: string;
  fechaActualizacion: string;
  destacada: boolean;
  visitas: number;
  favoritos: number;
}

export interface CoExclusivasFilters {
  ciudad?: string;
  codigoPostal?: string;
  tipoInmueble?: string;
  precioMin?: number;
  precioMax?: number;
  habitacionesMin?: number;
  habitacionesMax?: number;
  banosMin?: number;
  banosMax?: number;
  superficieMin?: number;
  superficieMax?: number;
  estado?: string;
  destacada?: boolean;
}

export interface CoExclusivasPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CoExclusivasResponse {
  coExclusivas: CoExclusiva[];
  pagination: CoExclusivasPagination;
}

export interface CoExclusivasStats {
  totalPropiedades: number;
  disponibles: number;
  reservadas: number;
  vendidas: number;
  totalVisitas: number;
  totalFavoritos: number;
  valorPromedio: number;
  propiedadesDestacadas: number;
}

// Mock data for demonstration
const mockCoExclusivas: CoExclusiva[] = [
  {
    id: '1',
    titulo: 'Piso luminoso en el centro de Madrid',
    descripcion: 'Espectacular piso de 120m² totalmente reformado en una de las mejores zonas de Madrid. Cuenta con amplios espacios, mucha luz natural y acabados de primera calidad. Ideal para familias que buscan comodidad en el centro de la ciudad.',
    precio: 450000,
    ubicacion: {
      direccion: 'Calle Gran Vía, 45',
      ciudad: 'Madrid',
      codigoPostal: '28013',
      latitud: 40.4200,
      longitud: -3.7025
    },
    caracteristicas: {
      tipoInmueble: 'piso',
      superficie: 120,
      habitaciones: 3,
      banos: 2,
      planta: 4,
      ascensor: true,
      terraza: true,
      garaje: true
    },
    imagenes: [
      {
        url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
        esPortada: true,
        descripcion: 'Salón principal'
      },
      {
        url: 'https://images.unsplash.com/photo-1560448075-bb485b067938?w=800',
        esPortada: false,
        descripcion: 'Cocina moderna'
      },
      {
        url: 'https://images.unsplash.com/photo-1560448204-61dc36dc98c8?w=800',
        esPortada: false,
        descripcion: 'Dormitorio principal'
      }
    ],
    estado: 'disponible',
    colaboracion: {
      porcentajeComision: 50,
      condiciones: 'División igualitaria de honorarios. Colaboración en visitas y gestión.',
      tipoColaboracion: 'venta'
    },
    propietario: {
      nombre: 'María García',
      telefono: '+34 666 123 456',
      email: 'maria.garcia@inmobiliaria.com',
      inmobiliaria: 'García Propiedades'
    },
    fechaCreacion: '2025-01-15T10:00:00Z',
    fechaActualizacion: '2025-01-20T15:30:00Z',
    destacada: true,
    visitas: 245,
    favoritos: 18
  },
  {
    id: '2',
    titulo: 'Chalet independiente con jardín',
    descripcion: 'Impresionante chalet de 250m² con parcela de 500m². Diseño moderno con todas las comodidades. Perfecto para familias que buscan espacio y tranquilidad sin renunciar a las comunicaciones.',
    precio: 750000,
    ubicacion: {
      direccion: 'Calle de los Rosales, 12',
      ciudad: 'Las Rozas de Madrid',
      codigoPostal: '28232',
      latitud: 40.4930,
      longitud: -3.8734
    },
    caracteristicas: {
      tipoInmueble: 'chalet',
      superficie: 250,
      habitaciones: 4,
      banos: 3,
      planta: 2,
      terraza: true,
      jardin: true,
      piscina: true,
      garaje: true
    },
    imagenes: [
      {
        url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
        esPortada: true,
        descripcion: 'Fachada principal'
      },
      {
        url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
        esPortada: false,
        descripcion: 'Jardín y piscina'
      }
    ],
    estado: 'disponible',
    colaboracion: {
      porcentajeComision: 40,
      condiciones: 'Colaboración preferente para agencias con experiencia en chalets de lujo.',
      tipoColaboracion: 'venta'
    },
    propietario: {
      nombre: 'Carlos Rodríguez',
      telefono: '+34 655 987 321',
      email: 'carlos@luxuryproperties.es',
      inmobiliaria: 'Luxury Properties Madrid'
    },
    fechaCreacion: '2025-01-18T14:20:00Z',
    fechaActualizacion: '2025-01-22T11:45:00Z',
    destacada: false,
    visitas: 132,
    favoritos: 12
  },
  {
    id: '3',
    titulo: 'Local comercial en zona comercial',
    descripcion: 'Local comercial de 80m² en planta baja con gran escaparate. Situado en zona de alto tránsito peatonal. Ideal para cualquier tipo de negocio.',
    precio: 180000,
    ubicacion: {
      direccion: 'Avenida de América, 88',
      ciudad: 'Madrid',
      codigoPostal: '28028',
      latitud: 40.4400,
      longitud: -3.6778
    },
    caracteristicas: {
      tipoInmueble: 'local',
      superficie: 80,
      habitaciones: 0,
      banos: 1,
      planta: 0
    },
    imagenes: [
      {
        url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800',
        esPortada: true,
        descripcion: 'Interior del local'
      }
    ],
    estado: 'disponible',
    colaboracion: {
      porcentajeComision: 60,
      condiciones: 'Comisión preferente para agente que cierre la venta.',
      tipoColaboracion: 'venta'
    },
    propietario: {
      nombre: 'Ana López',
      telefono: '+34 677 456 789',
      email: 'ana@comercialproperties.com',
      inmobiliaria: 'Comercial Properties'
    },
    fechaCreacion: '2025-01-20T09:15:00Z',
    fechaActualizacion: '2025-01-20T09:15:00Z',
    destacada: false,
    visitas: 89,
    favoritos: 5
  },
  {
    id: '4',
    titulo: 'Ático con terraza panorámica',
    descripcion: 'Exclusivo ático de 100m² con terraza de 40m² y vistas panorámicas a la ciudad. Completamente reformado con materiales de alta calidad.',
    precio: 620000,
    ubicacion: {
      direccion: 'Calle Serrano, 156',
      ciudad: 'Madrid',
      codigoPostal: '28006',
      latitud: 40.4378,
      longitud: -3.6795
    },
    caracteristicas: {
      tipoInmueble: 'piso',
      superficie: 100,
      habitaciones: 2,
      banos: 2,
      planta: 8,
      ascensor: true,
      terraza: true
    },
    imagenes: [
      {
        url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800',
        esPortada: true,
        descripcion: 'Terraza con vistas'
      },
      {
        url: 'https://images.unsplash.com/photo-1600566753051-6057f8bfb1be?w=800',
        esPortada: false,
        descripcion: 'Salón moderno'
      }
    ],
    estado: 'reservada',
    colaboracion: {
      porcentajeComision: 45,
      condiciones: 'Colaboración activa en marketing y presentación de ofertas.',
      tipoColaboracion: 'venta'
    },
    propietario: {
      nombre: 'Roberto Martín',
      telefono: '+34 644 321 987',
      email: 'roberto@premiumhomes.es',
      inmobiliaria: 'Premium Homes'
    },
    fechaCreacion: '2025-01-12T16:40:00Z',
    fechaActualizacion: '2025-01-25T10:20:00Z',
    destacada: true,
    visitas: 198,
    favoritos: 24
  }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const coExclusivasService = {
  async getCoExclusivas(
    filters: CoExclusivasFilters = {},
    page: number = 1,
    limit: number = 12
  ): Promise<CoExclusivasResponse> {
    await delay(800);
    
    let filteredData = [...mockCoExclusivas];

    // Apply filters
    if (filters.ciudad) {
      filteredData = filteredData.filter(item => 
        item.ubicacion.ciudad.toLowerCase().includes(filters.ciudad!.toLowerCase())
      );
    }

    if (filters.codigoPostal) {
      filteredData = filteredData.filter(item => 
        item.ubicacion.codigoPostal.includes(filters.codigoPostal!)
      );
    }

    if (filters.tipoInmueble) {
      filteredData = filteredData.filter(item => 
        item.caracteristicas.tipoInmueble === filters.tipoInmueble
      );
    }

    if (filters.precioMin) {
      filteredData = filteredData.filter(item => item.precio >= filters.precioMin!);
    }

    if (filters.precioMax) {
      filteredData = filteredData.filter(item => item.precio <= filters.precioMax!);
    }

    if (filters.habitacionesMin) {
      filteredData = filteredData.filter(item => 
        item.caracteristicas.habitaciones >= filters.habitacionesMin!
      );
    }

    if (filters.habitacionesMax) {
      filteredData = filteredData.filter(item => 
        item.caracteristicas.habitaciones <= filters.habitacionesMax!
      );
    }

    if (filters.banosMin) {
      filteredData = filteredData.filter(item => 
        item.caracteristicas.banos >= filters.banosMin!
      );
    }

    if (filters.banosMax) {
      filteredData = filteredData.filter(item => 
        item.caracteristicas.banos <= filters.banosMax!
      );
    }

    if (filters.estado) {
      filteredData = filteredData.filter(item => item.estado === filters.estado);
    }

    if (filters.destacada) {
      filteredData = filteredData.filter(item => item.destacada);
    }

    // Sort by featured first, then by date
    filteredData.sort((a, b) => {
      if (a.destacada && !b.destacada) return -1;
      if (!a.destacada && b.destacada) return 1;
      return new Date(b.fechaActualizacion).getTime() - new Date(a.fechaActualizacion).getTime();
    });

    // Pagination
    const total = filteredData.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return {
      coExclusivas: paginatedData,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  },

  async getCoExclusivaById(id: string): Promise<CoExclusiva | null> {
    await delay(400);
    const coExclusiva = mockCoExclusivas.find(item => item.id === id);
    return coExclusiva ? { ...coExclusiva } : null;
  },

  async createCoExclusiva(data: Omit<CoExclusiva, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'visitas' | 'favoritos'>): Promise<CoExclusiva> {
    await delay(1000);
    const newCoExclusiva: CoExclusiva = {
      id: Date.now().toString(),
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
      visitas: 0,
      favoritos: 0,
      ...data
    };
    mockCoExclusivas.unshift(newCoExclusiva);
    return { ...newCoExclusiva };
  },

  async updateCoExclusiva(id: string, data: Partial<CoExclusiva>): Promise<CoExclusiva | null> {
    await delay(800);
    const index = mockCoExclusivas.findIndex(item => item.id === id);
    if (index === -1) return null;

    mockCoExclusivas[index] = {
      ...mockCoExclusivas[index],
      ...data,
      fechaActualizacion: new Date().toISOString()
    };
    return { ...mockCoExclusivas[index] };
  },

  async deleteCoExclusiva(id: string): Promise<boolean> {
    await delay(500);
    const index = mockCoExclusivas.findIndex(item => item.id === id);
    if (index === -1) return false;

    mockCoExclusivas.splice(index, 1);
    return true;
  },

  async toggleFavorito(id: string): Promise<CoExclusiva | null> {
    await delay(300);
    const coExclusiva = mockCoExclusivas.find(item => item.id === id);
    if (!coExclusiva) return null;

    // This would normally track user favorites, for now just increment/decrement
    coExclusiva.favoritos = Math.max(0, coExclusiva.favoritos + (Math.random() > 0.5 ? 1 : -1));
    return { ...coExclusiva };
  },

  async incrementarVisitas(id: string): Promise<void> {
    await delay(100);
    const coExclusiva = mockCoExclusivas.find(item => item.id === id);
    if (coExclusiva) {
      coExclusiva.visitas++;
    }
  },

  async getStats(): Promise<CoExclusivasStats> {
    await delay(500);
    
    const totalPropiedades = mockCoExclusivas.length;
    const disponibles = mockCoExclusivas.filter(p => p.estado === 'disponible').length;
    const reservadas = mockCoExclusivas.filter(p => p.estado === 'reservada').length;
    const vendidas = mockCoExclusivas.filter(p => p.estado === 'vendida').length;
    const totalVisitas = mockCoExclusivas.reduce((sum, p) => sum + p.visitas, 0);
    const totalFavoritos = mockCoExclusivas.reduce((sum, p) => sum + p.favoritos, 0);
    const valorPromedio = totalPropiedades > 0 
      ? mockCoExclusivas.reduce((sum, p) => sum + p.precio, 0) / totalPropiedades 
      : 0;
    const propiedadesDestacadas = mockCoExclusivas.filter(p => p.destacada).length;

    return {
      totalPropiedades,
      disponibles,
      reservadas,
      vendidas,
      totalVisitas,
      totalFavoritos,
      valorPromedio,
      propiedadesDestacadas
    };
  }
};