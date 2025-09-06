export interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  estado: 'en_transito' | 'almacenado' | 'distribuido' | 'entregado' | 'vencido' | 'retirado';
  proveedor: {
    nombre: string;
    origen: string;
    contacto: string;
    certificaciones: string[];
  };
  fechas: {
    fabricacion: string;
    caducidad: string;
    recepcion?: string;
  };
  temperatura: {
    minima: number;
    maxima: number;
    actual?: number;
  };
  ubicacionActual?: string;
  cantidadInicial: number;
  cantidadActual: number;
  unidadMedida: string;
  lote: string;
  certificaciones: {
    nombre: string;
    archivo: string;
    fechaEmision: string;
    fechaVencimiento?: string;
  }[];
  imagenes: string[];
  historial: {
    id: string;
    fecha: string;
    evento: string;
    descripcion: string;
    ubicacion: string;
    usuario: string;
    temperatura?: number;
    humedad?: number;
  }[];
  alertas: {
    id: string;
    tipo: 'temperatura' | 'caducidad' | 'ubicacion' | 'calidad' | 'documentacion';
    severidad: 'baja' | 'media' | 'alta' | 'critica';
    mensaje: string;
    fechaCreacion: string;
    estado: 'activa' | 'resuelta' | 'ignorada';
  }[];
  codigoQR: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface TrazabilidadFilters {
  search?: string;
  categoria?: string;
  estado?: string;
  proveedor?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  ubicacion?: string;
  alertas?: boolean;
  proximoVencimiento?: boolean;
}

export interface TrazabilidadStats {
  totalProductos: number;
  productosEnTransito: number;
  productosAlmacenados: number;
  productosDistribuidos: number;
  alertasActivas: number;
  proximosVencer: number;
  temperaturaPromedio: number;
  eficienciaDistribucion: number;
  categorias: {
    nombre: string;
    cantidad: number;
    porcentaje: number;
  }[];
  estadosDistribucion: {
    estado: string;
    cantidad: number;
    porcentaje: number;
  }[];
  alertasPorTipo: {
    tipo: string;
    cantidad: number;
  }[];
  tendenciasMensuales: {
    mes: string;
    productos: number;
    alertas: number;
    distribuciones: number;
  }[];
}

export interface TrazabilidadResponse {
  data: Producto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Mock data
const mockProductos: Producto[] = [
  {
    id: '1',
    codigo: 'ALM-2024-001',
    nombre: 'Leche Fresca Premium',
    categoria: 'Lácteos',
    descripcion: 'Leche fresca pasteurizada de alta calidad',
    estado: 'almacenado',
    proveedor: {
      nombre: 'Granja Los Prados',
      origen: 'Cantabria, España',
      contacto: '+34 942 123 456',
      certificaciones: ['ISO 22000', 'Agricultura Ecológica', 'Bienestar Animal']
    },
    fechas: {
      fabricacion: '2025-01-20T08:00:00Z',
      caducidad: '2025-02-05T23:59:59Z',
      recepcion: '2025-01-21T10:30:00Z'
    },
    temperatura: {
      minima: 2,
      maxima: 6,
      actual: 4
    },
    ubicacionActual: 'Almacén A - Sector 2',
    cantidadInicial: 500,
    cantidadActual: 500,
    unidadMedida: 'litros',
    lote: 'LP-2024-0120',
    certificaciones: [
      {
        nombre: 'Certificado Sanitario',
        archivo: '/docs/cert-sanitario-001.pdf',
        fechaEmision: '2025-01-19T00:00:00Z'
      },
      {
        nombre: 'Análisis Microbiológico',
        archivo: '/docs/analisis-micro-001.pdf',
        fechaEmision: '2025-01-20T00:00:00Z'
      }
    ],
    imagenes: [
      '/images/productos/leche-001.jpg',
      '/images/lotes/lp-2024-0120.jpg'
    ],
    historial: [
      {
        id: '1-1',
        fecha: '2025-01-20T08:00:00Z',
        evento: 'Producción Iniciada',
        descripcion: 'Inicio del proceso de pasteurización',
        ubicacion: 'Planta de Producción - Granja Los Prados',
        usuario: 'María González',
        temperatura: 75
      },
      {
        id: '1-2',
        fecha: '2025-01-20T12:30:00Z',
        evento: 'Control de Calidad',
        descripcion: 'Análisis microbiológico y químico completado',
        ubicacion: 'Laboratorio de Calidad',
        usuario: 'Dr. Carlos Martín',
        temperatura: 4,
        humedad: 65
      },
      {
        id: '1-3',
        fecha: '2025-01-21T06:00:00Z',
        evento: 'Transporte Iniciado',
        descripcion: 'Carga en camión refrigerado TR-2024-15',
        ubicacion: 'Muelle de Carga - Granja Los Prados',
        usuario: 'Juan Pérez',
        temperatura: 3
      },
      {
        id: '1-4',
        fecha: '2025-01-21T10:30:00Z',
        evento: 'Recepción en Almacén',
        descripcion: 'Producto recibido y almacenado correctamente',
        ubicacion: 'Almacén A - Sector 2',
        usuario: 'Ana López',
        temperatura: 4,
        humedad: 60
      }
    ],
    alertas: [],
    codigoQR: 'QR-ALM-2024-001',
    fechaCreacion: '2025-01-20T08:00:00Z',
    fechaActualizacion: '2025-01-21T10:30:00Z'
  },
  {
    id: '2',
    codigo: 'FRT-2024-002',
    nombre: 'Tomates Cherry Ecológicos',
    categoria: 'Frutas y Verduras',
    descripcion: 'Tomates cherry de cultivo ecológico',
    estado: 'en_transito',
    proveedor: {
      nombre: 'Huerta Verde SL',
      origen: 'Almería, España',
      contacto: '+34 950 654 321',
      certificaciones: ['Certificación Ecológica UE', 'Global G.A.P.']
    },
    fechas: {
      fabricacion: '2025-01-22T06:00:00Z',
      caducidad: '2025-01-29T23:59:59Z'
    },
    temperatura: {
      minima: 8,
      maxima: 12,
      actual: 10
    },
    cantidadInicial: 200,
    cantidadActual: 200,
    unidadMedida: 'kg',
    lote: 'HV-2024-0122',
    certificaciones: [
      {
        nombre: 'Certificado Ecológico',
        archivo: '/docs/cert-eco-002.pdf',
        fechaEmision: '2025-01-15T00:00:00Z',
        fechaVencimiento: '2025-07-15T00:00:00Z'
      }
    ],
    imagenes: [
      '/images/productos/tomate-002.jpg'
    ],
    historial: [
      {
        id: '2-1',
        fecha: '2025-01-22T06:00:00Z',
        evento: 'Recolección',
        descripcion: 'Recolección manual de tomates cherry',
        ubicacion: 'Invernadero 3 - Huerta Verde',
        usuario: 'Pedro Ruiz'
      },
      {
        id: '2-2',
        fecha: '2025-01-22T14:00:00Z',
        evento: 'Envasado',
        descripcion: 'Envasado en cajas de 5kg',
        ubicacion: 'Centro de Envasado',
        usuario: 'Carmen Silva'
      },
      {
        id: '2-3',
        fecha: '2025-01-22T18:30:00Z',
        evento: 'Transporte en Curso',
        descripcion: 'En ruta hacia centro de distribución',
        ubicacion: 'Carretera A-92, km 245',
        usuario: 'Miguel Torres',
        temperatura: 10
      }
    ],
    alertas: [
      {
        id: 'alert-2-1',
        tipo: 'caducidad',
        severidad: 'media',
        mensaje: 'Producto próximo a caducar en 7 días',
        fechaCreacion: '2025-01-22T20:00:00Z',
        estado: 'activa'
      }
    ],
    codigoQR: 'QR-FRT-2024-002',
    fechaCreacion: '2025-01-22T06:00:00Z',
    fechaActualizacion: '2025-01-22T18:30:00Z'
  },
  {
    id: '3',
    codigo: 'CAR-2024-003',
    nombre: 'Pechuga de Pollo',
    categoria: 'Cárnicos',
    descripcion: 'Pechuga de pollo fresco sin antibióticos',
    estado: 'distribuido',
    proveedor: {
      nombre: 'Avícola San Juan',
      origen: 'Murcia, España',
      contacto: '+34 968 789 123',
      certificaciones: ['IFS Food', 'Halal', 'Sin Antibióticos']
    },
    fechas: {
      fabricacion: '2025-01-19T04:00:00Z',
      caducidad: '2025-01-26T23:59:59Z',
      recepcion: '2025-01-19T16:00:00Z'
    },
    temperatura: {
      minima: 0,
      maxima: 4,
      actual: 2
    },
    ubicacionActual: 'Supermercado Central - Calle Mayor 45',
    cantidadInicial: 300,
    cantidadActual: 125,
    unidadMedida: 'kg',
    lote: 'ASJ-2024-0119',
    certificaciones: [
      {
        nombre: 'Certificado Sanitario Veterinario',
        archivo: '/docs/cert-vet-003.pdf',
        fechaEmision: '2025-01-18T00:00:00Z'
      }
    ],
    imagenes: [
      '/images/productos/pollo-003.jpg'
    ],
    historial: [
      {
        id: '3-1',
        fecha: '2025-01-19T04:00:00Z',
        evento: 'Procesado',
        descripcion: 'Sacrificio y procesado del pollo',
        ubicacion: 'Matadero - Avícola San Juan',
        usuario: 'José Martínez',
        temperatura: 2
      },
      {
        id: '3-2',
        fecha: '2025-01-19T16:00:00Z',
        evento: 'Recepción en Centro',
        descripcion: 'Llegada al centro de distribución',
        ubicacion: 'Centro Distribución Principal',
        usuario: 'Laura Fernández',
        temperatura: 1
      },
      {
        id: '3-3',
        fecha: '2025-01-21T08:00:00Z',
        evento: 'Distribución',
        descripcion: 'Enviado a supermercados de la zona',
        ubicacion: 'Supermercado Central',
        usuario: 'David García',
        temperatura: 2
      }
    ],
    alertas: [
      {
        id: 'alert-3-1',
        tipo: 'caducidad',
        severidad: 'alta',
        mensaje: 'Producto caduca en 5 días',
        fechaCreacion: '2025-01-21T12:00:00Z',
        estado: 'activa'
      }
    ],
    codigoQR: 'QR-CAR-2024-003',
    fechaCreacion: '2025-01-19T04:00:00Z',
    fechaActualizacion: '2025-01-21T08:00:00Z'
  },
  {
    id: '4',
    codigo: 'PAN-2024-004',
    nombre: 'Pan Integral Artesano',
    categoria: 'Panadería',
    descripcion: 'Pan integral elaborado con masa madre',
    estado: 'vencido',
    proveedor: {
      nombre: 'Panadería El Horno Dorado',
      origen: 'Madrid, España',
      contacto: '+34 915 432 109',
      certificaciones: ['Artesano Certificado', 'Sin Conservantes']
    },
    fechas: {
      fabricacion: '2025-01-18T05:00:00Z',
      caducidad: '2025-01-21T23:59:59Z',
      recepcion: '2025-01-18T08:00:00Z'
    },
    temperatura: {
      minima: 18,
      maxima: 25,
      actual: 22
    },
    ubicacionActual: 'Almacén B - Productos Vencidos',
    cantidadInicial: 100,
    cantidadActual: 45,
    unidadMedida: 'unidades',
    lote: 'PHD-2024-0118',
    certificaciones: [
      {
        nombre: 'Certificado de Elaboración Artesana',
        archivo: '/docs/cert-artesano-004.pdf',
        fechaEmision: '2025-01-17T00:00:00Z'
      }
    ],
    imagenes: [
      '/images/productos/pan-004.jpg'
    ],
    historial: [
      {
        id: '4-1',
        fecha: '2025-01-18T05:00:00Z',
        evento: 'Elaboración',
        descripcion: 'Horneado completado',
        ubicacion: 'Panadería El Horno Dorado',
        usuario: 'Francisco Molina'
      },
      {
        id: '4-2',
        fecha: '2025-01-18T08:00:00Z',
        evento: 'Distribución Inicial',
        descripcion: 'Enviado a puntos de venta',
        ubicacion: 'Varios puntos de venta',
        usuario: 'Antonio Ruiz'
      },
      {
        id: '4-3',
        fecha: '2025-01-22T09:00:00Z',
        evento: 'Producto Vencido',
        descripcion: 'Movido a zona de productos vencidos',
        ubicacion: 'Almacén B - Productos Vencidos',
        usuario: 'Sistema Automático'
      }
    ],
    alertas: [
      {
        id: 'alert-4-1',
        tipo: 'caducidad',
        severidad: 'critica',
        mensaje: 'Producto vencido - Retirar inmediatamente',
        fechaCreacion: '2025-01-22T00:01:00Z',
        estado: 'activa'
      }
    ],
    codigoQR: 'QR-PAN-2024-004',
    fechaCreacion: '2025-01-18T05:00:00Z',
    fechaActualizacion: '2025-01-22T09:00:00Z'
  }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const trazabilidadService = {
  async getProductos(
    filters: TrazabilidadFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<TrazabilidadResponse> {
    await delay(800);

    let filteredData = [...mockProductos];

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredData = filteredData.filter(producto =>
        producto.nombre.toLowerCase().includes(searchLower) ||
        producto.codigo.toLowerCase().includes(searchLower) ||
        producto.categoria.toLowerCase().includes(searchLower) ||
        producto.proveedor.nombre.toLowerCase().includes(searchLower)
      );
    }

    if (filters.categoria) {
      filteredData = filteredData.filter(producto =>
        producto.categoria === filters.categoria
      );
    }

    if (filters.estado) {
      filteredData = filteredData.filter(producto =>
        producto.estado === filters.estado
      );
    }

    if (filters.proveedor) {
      filteredData = filteredData.filter(producto =>
        producto.proveedor.nombre.toLowerCase().includes(filters.proveedor!.toLowerCase())
      );
    }

    if (filters.fechaDesde) {
      filteredData = filteredData.filter(producto =>
        new Date(producto.fechaCreacion) >= new Date(filters.fechaDesde!)
      );
    }

    if (filters.fechaHasta) {
      filteredData = filteredData.filter(producto =>
        new Date(producto.fechaCreacion) <= new Date(filters.fechaHasta!)
      );
    }

    if (filters.ubicacion) {
      filteredData = filteredData.filter(producto =>
        producto.ubicacionActual?.toLowerCase().includes(filters.ubicacion!.toLowerCase())
      );
    }

    if (filters.alertas) {
      filteredData = filteredData.filter(producto =>
        producto.alertas.some(alerta => alerta.estado === 'activa')
      );
    }

    if (filters.proximoVencimiento) {
      const proximoVencimiento = new Date();
      proximoVencimiento.setDate(proximoVencimiento.getDate() + 7);
      filteredData = filteredData.filter(producto =>
        new Date(producto.fechas.caducidad) <= proximoVencimiento &&
        new Date(producto.fechas.caducidad) > new Date()
      );
    }

    // Sort by creation date (newest first)
    filteredData.sort((a, b) =>
      new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
    );

    // Pagination
    const total = filteredData.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      total,
      page,
      limit,
      totalPages
    };
  },

  async getProducto(id: string): Promise<Producto | null> {
    await delay(400);
    const producto = mockProductos.find(p => p.id === id);
    return producto ? { ...producto } : null;
  },

  async createProducto(data: Omit<Producto, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'historial' | 'alertas' | 'codigoQR'>): Promise<Producto> {
    await delay(1200);

    const newProducto: Producto = {
      id: Date.now().toString(),
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
      historial: [
        {
          id: `${Date.now()}-1`,
          fecha: new Date().toISOString(),
          evento: 'Registro de Producto',
          descripcion: 'Producto registrado en el sistema de trazabilidad',
          ubicacion: data.ubicacionActual || 'Sistema',
          usuario: 'Usuario Actual'
        }
      ],
      alertas: [],
      codigoQR: `QR-${data.codigo}`,
      ...data
    };

    mockProductos.unshift(newProducto);
    return { ...newProducto };
  },

  async updateProducto(id: string, data: Partial<Producto>): Promise<Producto | null> {
    await delay(600);

    const index = mockProductos.findIndex(p => p.id === id);
    if (index === -1) return null;

    const updatedProducto = {
      ...mockProductos[index],
      ...data,
      fechaActualizacion: new Date().toISOString()
    };

    // Add history entry for update
    if (data.estado || data.ubicacionActual) {
      updatedProducto.historial.push({
        id: `${Date.now()}-update`,
        fecha: new Date().toISOString(),
        evento: 'Actualización de Estado',
        descripcion: `Estado actualizado: ${data.estado || 'Sin cambios'}`,
        ubicacion: data.ubicacionActual || updatedProducto.ubicacionActual || 'Sistema',
        usuario: 'Usuario Actual'
      });
    }

    mockProductos[index] = updatedProducto;
    return { ...updatedProducto };
  },

  async deleteProducto(id: string): Promise<boolean> {
    await delay(500);
    const index = mockProductos.findIndex(p => p.id === id);
    if (index === -1) return false;

    mockProductos.splice(index, 1);
    return true;
  },

  async getStats(): Promise<TrazabilidadStats> {
    await delay(600);

    const totalProductos = mockProductos.length;
    const productosEnTransito = mockProductos.filter(p => p.estado === 'en_transito').length;
    const productosAlmacenados = mockProductos.filter(p => p.estado === 'almacenado').length;
    const productosDistribuidos = mockProductos.filter(p => p.estado === 'distribuido').length;

    const alertasActivas = mockProductos.reduce((acc, p) =>
      acc + p.alertas.filter(a => a.estado === 'activa').length, 0
    );

    const proximosVencer = mockProductos.filter(p => {
      const proximoVencimiento = new Date();
      proximoVencimiento.setDate(proximoVencimiento.getDate() + 7);
      return new Date(p.fechas.caducidad) <= proximoVencimiento &&
             new Date(p.fechas.caducidad) > new Date();
    }).length;

    const temperaturaPromedio = mockProductos
      .filter(p => p.temperatura.actual)
      .reduce((acc, p) => acc + (p.temperatura.actual || 0), 0) /
      mockProductos.filter(p => p.temperatura.actual).length || 0;

    // Categories distribution
    const categoriesMap = new Map();
    mockProductos.forEach(p => {
      categoriesMap.set(p.categoria, (categoriesMap.get(p.categoria) || 0) + 1);
    });

    const categorias = Array.from(categoriesMap.entries()).map(([nombre, cantidad]) => ({
      nombre,
      cantidad,
      porcentaje: (cantidad / totalProductos) * 100
    }));

    // Estado distribution
    const estadosMap = new Map();
    mockProductos.forEach(p => {
      estadosMap.set(p.estado, (estadosMap.get(p.estado) || 0) + 1);
    });

    const estadosDistribucion = Array.from(estadosMap.entries()).map(([estado, cantidad]) => ({
      estado,
      cantidad,
      porcentaje: (cantidad / totalProductos) * 100
    }));

    // Alerts by type
    const alertasMap = new Map();
    mockProductos.forEach(p => {
      p.alertas.forEach(a => {
        if (a.estado === 'activa') {
          alertasMap.set(a.tipo, (alertasMap.get(a.tipo) || 0) + 1);
        }
      });
    });

    const alertasPorTipo = Array.from(alertasMap.entries()).map(([tipo, cantidad]) => ({
      tipo,
      cantidad
    }));

    // Monthly trends (mock data)
    const tendenciasMensuales = [
      { mes: 'Ene', productos: 45, alertas: 8, distribuciones: 32 },
      { mes: 'Feb', productos: 52, alertas: 12, distribuciones: 38 },
      { mes: 'Mar', productos: 48, alertas: 6, distribuciones: 41 },
      { mes: 'Abr', productos: 61, alertas: 9, distribuciones: 47 },
      { mes: 'May', productos: 55, alertas: 11, distribuciones: 43 },
      { mes: 'Jun', productos: 58, alertas: 7, distribuciones: 49 }
    ];

    return {
      totalProductos,
      productosEnTransito,
      productosAlmacenados,
      productosDistribuidos,
      alertasActivas,
      proximosVencer,
      temperaturaPromedio: Number(temperaturaPromedio.toFixed(1)),
      eficienciaDistribucion: 87.5,
      categorias,
      estadosDistribucion,
      alertasPorTipo,
      tendenciasMensuales
    };
  },

  async addHistoryEvent(id: string, evento: {
    evento: string;
    descripcion: string;
    ubicacion: string;
    usuario: string;
    temperatura?: number;
    humedad?: number;
  }): Promise<Producto | null> {
    await delay(400);

    const index = mockProductos.findIndex(p => p.id === id);
    if (index === -1) return null;

    const newEvent = {
      id: `${Date.now()}-event`,
      fecha: new Date().toISOString(),
      ...evento
    };

    mockProductos[index].historial.push(newEvent);
    mockProductos[index].fechaActualizacion = new Date().toISOString();

    return { ...mockProductos[index] };
  },

  async resolveAlert(id: string, alertId: string): Promise<boolean> {
    await delay(300);

    const producto = mockProductos.find(p => p.id === id);
    if (!producto) return false;

    const alertIndex = producto.alertas.findIndex(a => a.id === alertId);
    if (alertIndex === -1) return false;

    producto.alertas[alertIndex].estado = 'resuelta';
    producto.fechaActualizacion = new Date().toISOString();

    return true;
  },

  async generateQRCode(id: string): Promise<string> {
    await delay(200);
    const producto = mockProductos.find(p => p.id === id);
    if (!producto) throw new Error('Producto no encontrado');

    // In a real implementation, this would generate an actual QR code
    return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`;
  },

  async exportData(filters: TrazabilidadFilters = {}): Promise<Blob> {
    await delay(1000);

    const { data } = await this.getProductos(filters, 1, 1000);
    const csvContent = [
      'Código,Nombre,Categoría,Estado,Proveedor,Fecha Fabricación,Fecha Caducidad,Cantidad Actual,Ubicación',
      ...data.map(p => [
        p.codigo,
        p.nombre,
        p.categoria,
        p.estado,
        p.proveedor.nombre,
        p.fechas.fabricacion,
        p.fechas.caducidad,
        p.cantidadActual,
        p.ubicacionActual || ''
      ].join(','))
    ].join('\n');

    return new Blob([csvContent], { type: 'text/csv' });
  }
};