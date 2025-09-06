import type { InvoiceFormData, InvoiceLine, Party, PaymentMethod, CreditNoteRequest, RecurrenceConfig } from './types';

// Validación de formulario de factura
export const validateInvoiceForm = (data: InvoiceFormData): string[] => {
  const errors: string[] = [];
  
  // Campos obligatorios
  if (!data.series || data.series.trim() === '') {
    errors.push('La serie es obligatoria');
  }
  
  if (!data.date || data.date.trim() === '') {
    errors.push('La fecha es obligatoria');
  }
  
  // Validar fecha válida
  if (data.date && isNaN(Date.parse(data.date))) {
    errors.push('La fecha no tiene un formato válido');
  }
  
  // Validar fecha de vencimiento
  if (data.dueDate && isNaN(Date.parse(data.dueDate))) {
    errors.push('La fecha de vencimiento no tiene un formato válido');
  }
  
  if (data.date && data.dueDate && new Date(data.dueDate) < new Date(data.date)) {
    errors.push('La fecha de vencimiento no puede ser anterior a la fecha de emisión');
  }
  
  // Validar cliente/proveedor según tipo
  if (data.type === 'VENTA' && !data.customer) {
    errors.push('El cliente es obligatorio para facturas de venta');
  }
  
  if (data.type === 'COMPRA' && !data.supplier) {
    errors.push('El proveedor es obligatorio para facturas de compra');
  }
  
  // Validar que tenga al menos una línea
  if (!data.lines || data.lines.length === 0) {
    errors.push('Debe incluir al menos una línea de factura');
  }
  
  // Validar líneas
  data.lines?.forEach((line, index) => {
    const lineErrors = validateInvoiceLine(line);
    lineErrors.forEach(error => errors.push(`Línea ${index + 1}: ${error}`));
  });
  
  return errors;
};

// Validación de línea de factura
export const validateInvoiceLine = (line: Omit<InvoiceLine, 'id' | 'total' | 'baseAmount' | 'ivaAmount' | 'retAmount'>): string[] => {
  const errors: string[] = [];
  
  if (!line.concept || line.concept.trim() === '') {
    errors.push('El concepto es obligatorio');
  }
  
  if (!line.qty || line.qty <= 0) {
    errors.push('La cantidad debe ser mayor que 0');
  }
  
  if (line.price < 0) {
    errors.push('El precio no puede ser negativo');
  }
  
  // Validar tipos de IVA permitidos
  const validVatRates = [0, 4, 10, 21];
  if (!validVatRates.includes(line.iva)) {
    errors.push('El tipo de IVA debe ser 0%, 4%, 10% o 21%');
  }
  
  // Validar retención IRPF
  if (line.ret && (line.ret < 0 || line.ret > 21)) {
    errors.push('La retención IRPF debe estar entre 0% y 21%');
  }
  
  // Validar descuento
  if (line.discount && (line.discount < 0 || line.discount > 100)) {
    errors.push('El descuento debe estar entre 0% y 100%');
  }
  
  return errors;
};

// Validación de parte (cliente/proveedor)
export const validateParty = (party: Party): string[] => {
  const errors: string[] = [];
  
  if (!party.name || party.name.trim() === '') {
    errors.push('El nombre es obligatorio');
  }
  
  if (!party.nif || party.nif.trim() === '') {
    errors.push('El NIF/CIF es obligatorio');
  }
  
  // Validar formato básico de NIF/CIF
  const nifRegex = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i;
  const cifRegex = /^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/i;
  
  if (party.nif && !nifRegex.test(party.nif) && !cifRegex.test(party.nif)) {
    errors.push('El formato del NIF/CIF no es válido');
  }
  
  // Validar email si se proporciona
  if (party.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(party.email)) {
    errors.push('El formato del email no es válido');
  }
  
  return errors;
};

// Validación de pagos
export const validatePayment = (payment: { amount: number; method: PaymentMethod; date: string; reference?: string }, invoiceBalance: number): string[] => {
  const errors: string[] = [];
  
  if (!payment.amount || payment.amount <= 0) {
    errors.push('El importe debe ser mayor que 0');
  }
  
  if (payment.amount > invoiceBalance) {
    errors.push('El importe no puede ser mayor que el saldo pendiente');
  }
  
  if (!payment.date || payment.date.trim() === '') {
    errors.push('La fecha es obligatoria');
  }
  
  if (payment.date && isNaN(Date.parse(payment.date))) {
    errors.push('La fecha no tiene un formato válido');
  }
  
  if (!payment.method) {
    errors.push('El método de pago es obligatorio');
  }
  
  const validMethods: PaymentMethod[] = ['TRANSFER', 'CARD', 'CASH', 'OTHER'];
  if (!validMethods.includes(payment.method)) {
    errors.push('El método de pago no es válido');
  }
  
  return errors;
};

// Validación de abono/nota de crédito
export const validateCreditNote = (request: CreditNoteRequest, originalInvoice: { total: number; balance: number }): string[] => {
  const errors: string[] = [];
  
  if (!request.reason || request.reason.trim() === '') {
    errors.push('El motivo del abono es obligatorio');
  }
  
  if (request.type === 'PARTIAL') {
    if (!request.amounts) {
      errors.push('Los importes son obligatorios para abono parcial');
    }
    
    if (request.amounts && request.amounts.total > originalInvoice.total) {
      errors.push('El importe del abono no puede ser mayor que el total de la factura');
    }
    
    if (!request.lines || request.lines.length === 0) {
      errors.push('Debe seleccionar al menos una línea para abono parcial');
    }
  }
  
  return errors;
};

// Validación de configuración de recurrencia
export const validateRecurrence = (config: RecurrenceConfig): string[] => {
  const errors: string[] = [];
  
  if (!config.frequency) {
    errors.push('La frecuencia es obligatoria');
  }
  
  const validFrequencies = ['M', 'Q', 'Y'];
  if (config.frequency && !validFrequencies.includes(config.frequency)) {
    errors.push('La frecuencia debe ser mensual (M), trimestral (Q) o anual (Y)');
  }
  
  if (config.day && (config.day < 1 || config.day > 28)) {
    errors.push('El día debe estar entre 1 y 28');
  }
  
  if (config.until && isNaN(Date.parse(config.until))) {
    errors.push('La fecha final no tiene un formato válido');
  }
  
  if (config.until && new Date(config.until) <= new Date()) {
    errors.push('La fecha final debe ser posterior a la fecha actual');
  }
  
  return errors;
};

// Validación de importación CSV
export const validateImportCsv = (file: File): string[] => {
  const errors: string[] = [];
  
  if (!file.type.includes('csv') && !file.name.endsWith('.csv')) {
    errors.push('El archivo debe ser un CSV');
  }
  
  if (file.size > 5 * 1024 * 1024) {
    errors.push('El archivo debe ser menor a 5MB');
  }
  
  return errors;
};

// Validación de filtros de búsqueda
export const validateInvoiceFilters = (filters: any): string[] => {
  const errors: string[] = [];
  
  if (filters.page && (typeof filters.page !== 'number' || filters.page < 1)) {
    errors.push('La página debe ser un número positivo');
  }
  
  if (filters.size && (typeof filters.size !== 'number' || filters.size < 10 || filters.size > 100)) {
    errors.push('El tamaño de página debe estar entre 10 y 100');
  }
  
  if (filters.from && filters.to && new Date(filters.from) > new Date(filters.to)) {
    errors.push('La fecha desde debe ser anterior a la fecha hasta');
  }
  
  if (filters.dueFrom && filters.dueTo && new Date(filters.dueFrom) > new Date(filters.dueTo)) {
    errors.push('El vencimiento desde debe ser anterior al vencimiento hasta');
  }
  
  return errors;
};

// Validación de exportación
export const validateExport = (options: { format: string; from?: string; to?: string }): string[] => {
  const errors: string[] = [];
  
  const validFormats = ['CSV', 'JSON', 'IVA_BOOK'];
  if (!validFormats.includes(options.format)) {
    errors.push('El formato de exportación no es válido');
  }
  
  if (options.format === 'IVA_BOOK') {
    if (!options.from || !options.to) {
      errors.push('Las fechas desde y hasta son obligatorias para el libro de IVA');
    }
    
    if (options.from && options.to && new Date(options.from) > new Date(options.to)) {
      errors.push('La fecha desde debe ser anterior a la fecha hasta');
    }
  }
  
  return errors;
};

// Validación de serie de factura
export const validateInvoiceSeries = (series: string): string[] => {
  const errors: string[] = [];
  
  if (!series || series.trim() === '') {
    errors.push('La serie es obligatoria');
  }
  
  if (series && series.length > 10) {
    errors.push('La serie no puede tener más de 10 caracteres');
  }
  
  if (series && !/^[A-Z0-9]+$/.test(series)) {
    errors.push('La serie solo puede contener letras mayúsculas y números');
  }
  
  return errors;
};

// Validación de estado de factura para transiciones
export const validateInvoiceStatusTransition = (currentStatus: string, newStatus: string): string[] => {
  const errors: string[] = [];
  
  const validTransitions: Record<string, string[]> = {
    'BORRADOR': ['EMITIDA', 'ANULADA'],
    'EMITIDA': ['ENVIADA', 'PAGADA', 'ANULADA'],
    'ENVIADA': ['PAGADA', 'VENCIDA', 'ANULADA'],
    'PAGADA': [],
    'VENCIDA': ['PAGADA'],
    'ANULADA': []
  };
  
  if (!validTransitions[currentStatus]?.includes(newStatus)) {
    errors.push(`No se puede cambiar el estado de ${currentStatus} a ${newStatus}`);
  }
  
  return errors;
};