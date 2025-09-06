import { 
  Regla, 
  ReglaEjecucion, 
  CreateReglaRequest, 
  UpdateReglaRequest, 
  ReglaStats,
  TriggerType 
} from '../types/regla.types';

// Mock data for development
const mockReglas: Regla[] = [
  {
    id: '1',
    nombre: 'Lead Premium Madrid',
    descripcion: 'Asignar leads de alta gama en Madrid al equipo premium',
    trigger: 'nuevo_lead',
    condiciones: [
      {
        id: '1',
        field: 'lead.presupuesto',
        operator: 'greater_than',
        value: 500000
      },
      {
        id: '2',
        field: 'lead.zona_interes',
        operator: 'contains',
        value: 'Madrid',
        logicalOperator: 'AND'
      }
    ],
    acciones: [
      {
        type: 'asignar_agente',
        parameters: {
          agente_id: 'maria_garcia',
          motivo: 'Lead premium detectado'
        }
      },
      {
        type: 'agregar_etiqueta',
        parameters: {
          etiqueta: 'VIP',
          color: 'red'
        }
      },
      {
        type: 'enviar_email',
        parameters: {
          destinatario: 'equipo-premium@inmobiliaria.com',
          asunto: 'Nuevo Lead VIP - Madrid',
          plantilla: 'bienvenida_lead'
        }
      }
    ],
    activa: true,
    prioridad: 1,
    fechaCreacion: '2024-01-10T09:00:00Z',
    fechaActualizacion: '2024-01-15T14:30:00Z',
    ultimaEjecucion: '2024-01-15T10:20:00Z',
    totalEjecuciones: 23,
    createdBy: 'admin',
    updatedBy: 'maria_garcia'
  },
  {
    id: '2',
    nombre: 'Precio Reducido Automático',
    descripcion: 'Notificar cuando un inmueble lleva más de 60 días sin actividad',
    trigger: 'inmueble_actualizado',
    condiciones: [
      {
        id: '1',
        field: 'inmueble.dias_en_mercado',
        operator: 'greater_than',
        value: 60
      }
    ],
    acciones: [
      {
        type: 'crear_tarea',
        parameters: {
          titulo: 'Revisar precio de inmueble',
          descripcion: 'El inmueble lleva más de 60 días en el mercado',
          asignado_a: 'juan_lopez',
          prioridad: 'media'
        }
      },
      {
        type: 'notificar_slack',
        parameters: {
          canal: '#ventas',
          mensaje: 'Inmueble REF-{inmueble.referencia} necesita revisión de precio'
        }
      }
    ],
    activa: true,
    prioridad: 2,
    fechaCreacion: '2024-01-08T11:00:00Z',
    fechaActualizacion: '2024-01-12T16:45:00Z',
    ultimaEjecucion: '2024-01-14T09:15:00Z',
    totalEjecuciones: 12,
    createdBy: 'juan_lopez',
    updatedBy: 'juan_lopez'
  },
  {
    id: '3',
    nombre: 'Contacto Fuera de Horario',
    descripcion: 'Respuesta automática para contactos fuera del horario laboral',
    trigger: 'contacto_recibido',
    condiciones: [
      {
        id: '1',
        field: 'contacto.hora',
        operator: 'less_than',
        value: '09:00'
      },
      {
        id: '2',
        field: 'contacto.hora',
        operator: 'greater_than',
        value: '18:00',
        logicalOperator: 'OR'
      }
    ],
    acciones: [
      {
        type: 'enviar_email',
        parameters: {
          destinatario: '{contacto.email}',
          asunto: 'Hemos recibido tu consulta',
          plantilla: 'respuesta_automatica'
        }
      },
      {
        type: 'crear_tarea',
        parameters: {
          titulo: 'Contactar cliente - {contacto.nombre}',
          descripcion: 'Contacto recibido fuera de horario',
          asignado_a: 'auto',
          prioridad: 'baja'
        }
      }
    ],
    activa: false,
    prioridad: 3,
    fechaCreacion: '2024-01-05T15:20:00Z',
    fechaActualizacion: '2024-01-10T12:10:00Z',
    ultimaEjecucion: '2024-01-09T20:30:00Z',
    totalEjecuciones: 45,
    createdBy: 'ana_martin',
    updatedBy: 'admin'
  },
  {
    id: '4',
    nombre: 'Oferta Competitiva',
    descripcion: 'Alertar cuando una oferta supera el 90% del precio de venta',
    trigger: 'oferta_creada',
    condiciones: [
      {
        id: '1',
        field: 'oferta.porcentaje_descuento',
        operator: 'less_than',
        value: 10
      }
    ],
    acciones: [
      {
        type: 'asignar_agente',
        parameters: {
          agente_id: 'maria_garcia',
          motivo: 'Oferta muy competitiva'
        }
      },
      {
        type: 'agregar_etiqueta',
        parameters: {
          etiqueta: 'OFERTA_ALTA',
          color: 'green'
        }
      }
    ],
    activa: true,
    prioridad: 1,
    fechaCreacion: '2024-01-12T10:30:00Z',
    fechaActualizacion: '2024-01-14T08:20:00Z',
    ultimaEjecucion: '2024-01-15T11:45:00Z',
    totalEjecuciones: 8,
    createdBy: 'maria_garcia',
    updatedBy: 'maria_garcia'
  },
  {
    id: '5',
    nombre: 'Inmueble Sin Fotos',
    descripcion: 'Alertar cuando se crea un inmueble sin fotografías',
    trigger: 'inmueble_creado',
    condiciones: [
      {
        id: '1',
        field: 'inmueble.num_fotos',
        operator: 'equals',
        value: 0
      }
    ],
    acciones: [
      {
        type: 'crear_tarea',
        parameters: {
          titulo: 'Subir fotos - {inmueble.referencia}',
          descripcion: 'Inmueble creado sin fotografías',
          asignado_a: 'ana_martin',
          prioridad: 'alta'
        }
      },
      {
        type: 'cambiar_estado',
        parameters: {
          nuevo_estado: 'pendiente'
        }
      }
    ],
    activa: true,
    prioridad: 2,
    fechaCreacion: '2024-01-15T14:15:00Z',
    fechaActualizacion: '2024-01-15T14:15:00Z',
    totalEjecuciones: 3,
    createdBy: 'ana_martin',
    updatedBy: 'ana_martin'
  }
];

const mockEjecuciones: ReglaEjecucion[] = [
  {
    id: '1',
    reglaId: '1',
    nombreRegla: 'Lead Premium Madrid',
    timestamp: '2024-01-15T10:20:00Z',
    exitosa: true,
    datos: {
      lead: {
        nombre: 'Carlos Rodríguez',
        email: 'carlos@email.com',
        presupuesto: 750000,
        zona_interes: 'Madrid Centro'
      }
    },
    resultado: 'Lead asignado a María García y etiquetado como VIP',
    tiempoEjecucion: 234,
    accionesEjecutadas: ['asignar_agente', 'agregar_etiqueta', 'enviar_email']
  },
  {
    id: '2',
    reglaId: '2',
    nombreRegla: 'Precio Reducido Automático',
    timestamp: '2024-01-14T09:15:00Z',
    exitosa: true,
    datos: {
      inmueble: {
        referencia: 'REF001',
        dias_en_mercado: 65,
        precio: 450000
      }
    },
    resultado: 'Tarea creada para revisión de precio',
    tiempoEjecucion: 156,
    accionesEjecutadas: ['crear_tarea', 'notificar_slack']
  },
  {
    id: '3',
    reglaId: '4',
    nombreRegla: 'Oferta Competitiva',
    timestamp: '2024-01-15T11:45:00Z',
    exitosa: false,
    datos: {
      oferta: {
        importe: 420000,
        precio_inmueble: 450000,
        porcentaje_descuento: 6.7
      }
    },
    error: 'Error al asignar agente: usuario no disponible',
    tiempoEjecucion: 1200,
    accionesEjecutadas: ['agregar_etiqueta']
  }
];

class ReglasService {
  private baseUrl = '/api/reglas';

  // Simulate API delay
  private delay(ms: number = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getReglas(): Promise<Regla[]> {
    await this.delay();
    return [...mockReglas].sort((a, b) => a.prioridad - b.prioridad);
  }

  async getRegla(id: string): Promise<Regla | null> {
    await this.delay();
    return mockReglas.find(regla => regla.id === id) || null;
  }

  async createRegla(data: CreateReglaRequest): Promise<Regla> {
    await this.delay();
    
    const newRegla: Regla = {
      id: Date.now().toString(),
      nombre: data.nombre,
      descripcion: data.descripcion,
      trigger: data.trigger,
      condiciones: data.condiciones,
      acciones: data.acciones,
      activa: data.activa ?? true,
      prioridad: data.prioridad ?? mockReglas.length + 1,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
      totalEjecuciones: 0,
      createdBy: 'current_user', // En una app real, esto vendría del contexto de usuario
      updatedBy: 'current_user'
    };

    mockReglas.push(newRegla);
    return newRegla;
  }

  async updateRegla(id: string, data: UpdateReglaRequest): Promise<Regla> {
    await this.delay();
    
    const reglaIndex = mockReglas.findIndex(regla => regla.id === id);
    if (reglaIndex === -1) {
      throw new Error('Regla no encontrada');
    }

    const updatedRegla = {
      ...mockReglas[reglaIndex],
      ...data,
      fechaActualizacion: new Date().toISOString(),
      updatedBy: 'current_user'
    };

    mockReglas[reglaIndex] = updatedRegla;
    return updatedRegla;
  }

  async deleteRegla(id: string): Promise<void> {
    await this.delay();
    
    const reglaIndex = mockReglas.findIndex(regla => regla.id === id);
    if (reglaIndex === -1) {
      throw new Error('Regla no encontrada');
    }

    mockReglas.splice(reglaIndex, 1);
  }

  async toggleRegla(id: string): Promise<Regla> {
    await this.delay();
    
    const reglaIndex = mockReglas.findIndex(regla => regla.id === id);
    if (reglaIndex === -1) {
      throw new Error('Regla no encontrada');
    }

    mockReglas[reglaIndex].activa = !mockReglas[reglaIndex].activa;
    mockReglas[reglaIndex].fechaActualizacion = new Date().toISOString();
    mockReglas[reglaIndex].updatedBy = 'current_user';

    return mockReglas[reglaIndex];
  }

  async duplicateRegla(id: string): Promise<Regla> {
    await this.delay();
    
    const originalRegla = mockReglas.find(regla => regla.id === id);
    if (!originalRegla) {
      throw new Error('Regla no encontrada');
    }

    const duplicatedRegla: Regla = {
      ...originalRegla,
      id: Date.now().toString(),
      nombre: `${originalRegla.nombre} (Copia)`,
      activa: false,
      prioridad: mockReglas.length + 1,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
      totalEjecuciones: 0,
      ultimaEjecucion: undefined,
      createdBy: 'current_user',
      updatedBy: 'current_user'
    };

    mockReglas.push(duplicatedRegla);
    return duplicatedRegla;
  }

  async reorderReglas(reorderedIds: string[]): Promise<Regla[]> {
    await this.delay();
    
    // Update priorities based on new order
    reorderedIds.forEach((id, index) => {
      const regla = mockReglas.find(r => r.id === id);
      if (regla) {
        regla.prioridad = index + 1;
        regla.fechaActualizacion = new Date().toISOString();
        regla.updatedBy = 'current_user';
      }
    });

    return this.getReglas();
  }

  async getEjecuciones(reglaId?: string): Promise<ReglaEjecucion[]> {
    await this.delay();
    
    let ejecuciones = [...mockEjecuciones];
    
    if (reglaId) {
      ejecuciones = ejecuciones.filter(ejecucion => ejecucion.reglaId === reglaId);
    }
    
    return ejecuciones.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async getStats(): Promise<ReglaStats> {
    await this.delay();
    
    const totalReglas = mockReglas.length;
    const reglasActivas = mockReglas.filter(r => r.activa).length;
    const reglasInactivas = totalReglas - reglasActivas;
    
    const totalEjecuciones = mockReglas.reduce((sum, regla) => sum + regla.totalEjecuciones, 0);
    const ejecucionesExitosas = mockEjecuciones.filter(e => e.exitosa).length;
    const ejecucionesFallidas = mockEjecuciones.length - ejecucionesExitosas;
    
    const ultimaEjecucion = mockReglas
      .filter(r => r.ultimaEjecucion)
      .sort((a, b) => new Date(b.ultimaEjecucion!).getTime() - new Date(a.ultimaEjecucion!).getTime())[0]?.ultimaEjecucion;

    return {
      totalReglas,
      reglasActivas,
      reglasInactivas,
      totalEjecuciones,
      ejecucionesExitosas,
      ejecucionesFallidas,
      ultimaEjecucion
    };
  }

  async testRegla(id: string, testData: any): Promise<{ success: boolean; result: string; actions: string[] }> {
    await this.delay(1000);
    
    const regla = mockReglas.find(r => r.id === id);
    if (!regla) {
      throw new Error('Regla no encontrada');
    }

    // Simulate rule evaluation
    const success = Math.random() > 0.2; // 80% success rate for demo
    
    return {
      success,
      result: success 
        ? 'Regla evaluada exitosamente. Todas las condiciones se cumplieron.'
        : 'La regla no se ejecutó. Las condiciones no se cumplieron.',
      actions: success ? regla.acciones.map(a => a.type) : []
    };
  }

  // Helper methods for field validation and suggestions
  getAvailableFields(trigger: TriggerType): string[] {
    // This would return available fields based on the trigger type
    // Implementation would depend on your data schema
    return [];
  }

  getOperatorsForField(fieldType: string): string[] {
    const operatorMap = {
      string: ['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with', 'is_empty', 'is_not_empty'],
      number: ['equals', 'not_equals', 'greater_than', 'less_than', 'greater_equal', 'less_equal'],
      boolean: ['equals', 'not_equals'],
      date: ['equals', 'not_equals', 'greater_than', 'less_than', 'greater_equal', 'less_equal'],
      select: ['equals', 'not_equals', 'in_array', 'not_in_array']
    };
    
    return operatorMap[fieldType as keyof typeof operatorMap] || [];
  }
}

export const reglasService = new ReglasService();