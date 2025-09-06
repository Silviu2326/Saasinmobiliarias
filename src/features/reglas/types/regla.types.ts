export type TriggerType = 
  | 'nuevo_lead' 
  | 'inmueble_creado' 
  | 'inmueble_actualizado'
  | 'contacto_recibido'
  | 'visita_programada'
  | 'oferta_creada'
  | 'contrato_firmado'
  | 'precio_actualizado';

export type OperatorType = 
  | 'equals' 
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'greater_equal'
  | 'less_equal'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'in_array'
  | 'not_in_array'
  | 'is_empty'
  | 'is_not_empty';

export type LogicalOperator = 'AND' | 'OR';

export type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'select' | 'multiselect';

export interface Field {
  key: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  description?: string;
}

export interface Condition {
  id: string;
  field: string;
  operator: OperatorType;
  value: any;
  logicalOperator?: LogicalOperator;
}

export type ActionType = 
  | 'enviar_email'
  | 'asignar_agente'
  | 'agregar_etiqueta'
  | 'crear_tarea'
  | 'actualizar_campo'
  | 'ejecutar_webhook'
  | 'notificar_slack'
  | 'cambiar_estado'
  | 'asignar_equipo';

export interface ActionConfig {
  type: ActionType;
  parameters: Record<string, any>;
  description?: string;
}

export interface Regla {
  id: string;
  nombre: string;
  descripcion?: string;
  trigger: TriggerType;
  condiciones: Condition[];
  acciones: ActionConfig[];
  activa: boolean;
  prioridad: number;
  fechaCreacion: string;
  fechaActualizacion: string;
  ultimaEjecucion?: string;
  totalEjecuciones: number;
  createdBy: string;
  updatedBy: string;
}

export interface ReglaEjecucion {
  id: string;
  reglaId: string;
  nombreRegla: string;
  timestamp: string;
  exitosa: boolean;
  datos: Record<string, any>;
  resultado?: string;
  error?: string;
  tiempoEjecucion: number;
  accionesEjecutadas: string[];
}

export interface CreateReglaRequest {
  nombre: string;
  descripcion?: string;
  trigger: TriggerType;
  condiciones: Condition[];
  acciones: ActionConfig[];
  activa?: boolean;
  prioridad?: number;
}

export interface UpdateReglaRequest {
  nombre?: string;
  descripcion?: string;
  trigger?: TriggerType;
  condiciones?: Condition[];
  acciones?: ActionConfig[];
  prioridad?: number;
}

export interface ReglaStats {
  totalReglas: number;
  reglasActivas: number;
  reglasInactivas: number;
  totalEjecuciones: number;
  ejecucionesExitosas: number;
  ejecucionesFallidas: number;
  ultimaEjecucion?: string;
}

// Campos disponibles por trigger
export const CAMPOS_POR_TRIGGER: Record<TriggerType, Field[]> = {
  nuevo_lead: [
    { key: 'lead.nombre', label: 'Nombre del Lead', type: 'string' },
    { key: 'lead.email', label: 'Email', type: 'string' },
    { key: 'lead.telefono', label: 'Teléfono', type: 'string' },
    { key: 'lead.origen', label: 'Origen', type: 'select', options: [
      { value: 'web', label: 'Sitio Web' },
      { value: 'idealista', label: 'Idealista' },
      { value: 'fotocasa', label: 'Fotocasa' },
      { value: 'referido', label: 'Referido' }
    ]},
    { key: 'lead.presupuesto', label: 'Presupuesto', type: 'number' },
    { key: 'lead.zona_interes', label: 'Zona de Interés', type: 'string' },
    { key: 'lead.tipo_inmueble', label: 'Tipo de Inmueble', type: 'select', options: [
      { value: 'piso', label: 'Piso' },
      { value: 'casa', label: 'Casa' },
      { value: 'local', label: 'Local' },
      { value: 'oficina', label: 'Oficina' }
    ]}
  ],
  inmueble_creado: [
    { key: 'inmueble.precio', label: 'Precio', type: 'number' },
    { key: 'inmueble.tipo', label: 'Tipo', type: 'select', options: [
      { value: 'piso', label: 'Piso' },
      { value: 'casa', label: 'Casa' },
      { value: 'local', label: 'Local' },
      { value: 'oficina', label: 'Oficina' }
    ]},
    { key: 'inmueble.provincia', label: 'Provincia', type: 'string' },
    { key: 'inmueble.ciudad', label: 'Ciudad', type: 'string' },
    { key: 'inmueble.habitaciones', label: 'Habitaciones', type: 'number' },
    { key: 'inmueble.superficie', label: 'Superficie (m²)', type: 'number' },
    { key: 'inmueble.estado', label: 'Estado', type: 'select', options: [
      { value: 'disponible', label: 'Disponible' },
      { value: 'reservado', label: 'Reservado' },
      { value: 'vendido', label: 'Vendido' }
    ]},
    { key: 'inmueble.agente_asignado', label: 'Agente Asignado', type: 'string' }
  ],
  inmueble_actualizado: [
    { key: 'inmueble.precio', label: 'Precio', type: 'number' },
    { key: 'inmueble.precio_anterior', label: 'Precio Anterior', type: 'number' },
    { key: 'inmueble.estado', label: 'Estado', type: 'select', options: [
      { value: 'disponible', label: 'Disponible' },
      { value: 'reservado', label: 'Reservado' },
      { value: 'vendido', label: 'Vendido' }
    ]},
    { key: 'inmueble.estado_anterior', label: 'Estado Anterior', type: 'string' },
    { key: 'inmueble.dias_en_mercado', label: 'Días en Mercado', type: 'number' }
  ],
  contacto_recibido: [
    { key: 'contacto.nombre', label: 'Nombre', type: 'string' },
    { key: 'contacto.email', label: 'Email', type: 'string' },
    { key: 'contacto.mensaje', label: 'Mensaje', type: 'string' },
    { key: 'contacto.inmueble_referencia', label: 'Referencia Inmueble', type: 'string' },
    { key: 'contacto.hora', label: 'Hora del Contacto', type: 'date' }
  ],
  visita_programada: [
    { key: 'visita.fecha', label: 'Fecha de Visita', type: 'date' },
    { key: 'visita.cliente_nombre', label: 'Nombre Cliente', type: 'string' },
    { key: 'visita.inmueble_precio', label: 'Precio Inmueble', type: 'number' },
    { key: 'visita.tipo', label: 'Tipo de Visita', type: 'select', options: [
      { value: 'presencial', label: 'Presencial' },
      { value: 'virtual', label: 'Virtual' }
    ]}
  ],
  oferta_creada: [
    { key: 'oferta.importe', label: 'Importe', type: 'number' },
    { key: 'oferta.precio_inmueble', label: 'Precio Inmueble', type: 'number' },
    { key: 'oferta.porcentaje_descuento', label: '% Descuento', type: 'number' },
    { key: 'oferta.dias_validez', label: 'Días de Validez', type: 'number' }
  ],
  contrato_firmado: [
    { key: 'contrato.valor', label: 'Valor del Contrato', type: 'number' },
    { key: 'contrato.tipo', label: 'Tipo', type: 'select', options: [
      { value: 'venta', label: 'Venta' },
      { value: 'alquiler', label: 'Alquiler' }
    ]},
    { key: 'contrato.comision', label: 'Comisión', type: 'number' },
    { key: 'contrato.agente', label: 'Agente', type: 'string' }
  ],
  precio_actualizado: [
    { key: 'precio.nuevo', label: 'Precio Nuevo', type: 'number' },
    { key: 'precio.anterior', label: 'Precio Anterior', type: 'number' },
    { key: 'precio.diferencia', label: 'Diferencia', type: 'number' },
    { key: 'precio.porcentaje_cambio', label: '% Cambio', type: 'number' }
  ]
};

// Configuraciones de acciones
export const CONFIGURACIONES_ACCION: Record<ActionType, { 
  label: string; 
  description: string; 
  parameters: Array<{ key: string; label: string; type: string; required: boolean; options?: { value: string; label: string }[] }> 
}> = {
  enviar_email: {
    label: 'Enviar Email',
    description: 'Envía un email automático',
    parameters: [
      { key: 'destinatario', label: 'Destinatario', type: 'string', required: true },
      { key: 'asunto', label: 'Asunto', type: 'string', required: true },
      { key: 'plantilla', label: 'Plantilla', type: 'select', required: true, options: [
        { value: 'bienvenida_lead', label: 'Bienvenida Lead' },
        { value: 'nuevo_inmueble', label: 'Nuevo Inmueble' },
        { value: 'precio_reducido', label: 'Precio Reducido' }
      ]}
    ]
  },
  asignar_agente: {
    label: 'Asignar Agente',
    description: 'Asigna automáticamente a un agente',
    parameters: [
      { key: 'agente_id', label: 'Agente', type: 'select', required: true, options: [
        { value: 'auto', label: 'Asignación Automática' },
        { value: 'maria_garcia', label: 'María García' },
        { value: 'juan_lopez', label: 'Juan López' },
        { value: 'ana_martin', label: 'Ana Martín' }
      ]},
      { key: 'motivo', label: 'Motivo', type: 'string', required: false }
    ]
  },
  agregar_etiqueta: {
    label: 'Agregar Etiqueta',
    description: 'Añade una etiqueta al elemento',
    parameters: [
      { key: 'etiqueta', label: 'Etiqueta', type: 'string', required: true },
      { key: 'color', label: 'Color', type: 'select', required: false, options: [
        { value: 'blue', label: 'Azul' },
        { value: 'red', label: 'Rojo' },
        { value: 'green', label: 'Verde' },
        { value: 'yellow', label: 'Amarillo' }
      ]}
    ]
  },
  crear_tarea: {
    label: 'Crear Tarea',
    description: 'Crea una tarea automáticamente',
    parameters: [
      { key: 'titulo', label: 'Título', type: 'string', required: true },
      { key: 'descripcion', label: 'Descripción', type: 'string', required: false },
      { key: 'asignado_a', label: 'Asignado a', type: 'select', required: true, options: [
        { value: 'maria_garcia', label: 'María García' },
        { value: 'juan_lopez', label: 'Juan López' },
        { value: 'ana_martin', label: 'Ana Martín' }
      ]},
      { key: 'prioridad', label: 'Prioridad', type: 'select', required: true, options: [
        { value: 'alta', label: 'Alta' },
        { value: 'media', label: 'Media' },
        { value: 'baja', label: 'Baja' }
      ]}
    ]
  },
  actualizar_campo: {
    label: 'Actualizar Campo',
    description: 'Actualiza un campo específico',
    parameters: [
      { key: 'campo', label: 'Campo', type: 'string', required: true },
      { key: 'valor', label: 'Valor', type: 'string', required: true }
    ]
  },
  ejecutar_webhook: {
    label: 'Ejecutar Webhook',
    description: 'Ejecuta una llamada HTTP externa',
    parameters: [
      { key: 'url', label: 'URL', type: 'string', required: true },
      { key: 'metodo', label: 'Método', type: 'select', required: true, options: [
        { value: 'GET', label: 'GET' },
        { value: 'POST', label: 'POST' },
        { value: 'PUT', label: 'PUT' }
      ]},
      { key: 'headers', label: 'Headers (JSON)', type: 'string', required: false }
    ]
  },
  notificar_slack: {
    label: 'Notificar Slack',
    description: 'Envía una notificación a Slack',
    parameters: [
      { key: 'canal', label: 'Canal', type: 'string', required: true },
      { key: 'mensaje', label: 'Mensaje', type: 'string', required: true }
    ]
  },
  cambiar_estado: {
    label: 'Cambiar Estado',
    description: 'Cambia el estado del elemento',
    parameters: [
      { key: 'nuevo_estado', label: 'Nuevo Estado', type: 'select', required: true, options: [
        { value: 'activo', label: 'Activo' },
        { value: 'inactivo', label: 'Inactivo' },
        { value: 'pendiente', label: 'Pendiente' },
        { value: 'completado', label: 'Completado' }
      ]}
    ]
  },
  asignar_equipo: {
    label: 'Asignar Equipo',
    description: 'Asigna a un equipo específico',
    parameters: [
      { key: 'equipo_id', label: 'Equipo', type: 'select', required: true, options: [
        { value: 'ventas', label: 'Equipo de Ventas' },
        { value: 'alquileres', label: 'Equipo de Alquileres' },
        { value: 'premium', label: 'Equipo Premium' }
      ]}
    ]
  }
};

export const TRIGGERS_DISPONIBLES: Record<TriggerType, { 
  label: string; 
  description: string; 
  icon: string;
  category: string;
}> = {
  nuevo_lead: {
    label: 'Nuevo Lead Creado',
    description: 'Se ejecuta cuando se registra un nuevo lead',
    icon: '👤',
    category: 'CRM'
  },
  inmueble_creado: {
    label: 'Inmueble Creado',
    description: 'Se ejecuta cuando se crea un nuevo inmueble',
    icon: '🏠',
    category: 'Inmuebles'
  },
  inmueble_actualizado: {
    label: 'Inmueble Actualizado',
    description: 'Se ejecuta cuando se modifica un inmueble',
    icon: '📝',
    category: 'Inmuebles'
  },
  contacto_recibido: {
    label: 'Contacto Recibido',
    description: 'Se ejecuta cuando llega una consulta',
    icon: '✉️',
    category: 'Comunicación'
  },
  visita_programada: {
    label: 'Visita Programada',
    description: 'Se ejecuta cuando se agenda una visita',
    icon: '📅',
    category: 'Visitas'
  },
  oferta_creada: {
    label: 'Oferta Creada',
    description: 'Se ejecuta cuando se crea una oferta',
    icon: '💰',
    category: 'Operaciones'
  },
  contrato_firmado: {
    label: 'Contrato Firmado',
    description: 'Se ejecuta cuando se firma un contrato',
    icon: '📋',
    category: 'Operaciones'
  },
  precio_actualizado: {
    label: 'Precio Actualizado',
    description: 'Se ejecuta cuando cambia el precio de un inmueble',
    icon: '📊',
    category: 'Pricing'
  }
};