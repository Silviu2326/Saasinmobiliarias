import { Assumptions, ForecastFilters, Scenario } from './types';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateAssumptions(data: Partial<Assumptions>): ValidationResult {
  const errors: Record<string, string> = {};

  // Validaciones de tasas de conversión (entre 0 y 1)
  if (data.convLeadVisit !== undefined) {
    if (data.convLeadVisit < 0 || data.convLeadVisit > 1) {
      errors.convLeadVisit = 'La conversión Lead→Visita debe estar entre 0 y 1';
    }
  }

  if (data.convVisitOffer !== undefined) {
    if (data.convVisitOffer < 0 || data.convVisitOffer > 1) {
      errors.convVisitOffer = 'La conversión Visita→Oferta debe estar entre 0 y 1';
    }
  }

  if (data.convOfferReservation !== undefined) {
    if (data.convOfferReservation < 0 || data.convOfferReservation > 1) {
      errors.convOfferReservation = 'La conversión Oferta→Reserva debe estar entre 0 y 1';
    }
  }

  if (data.convReservationContract !== undefined) {
    if (data.convReservationContract < 0 || data.convReservationContract > 1) {
      errors.convReservationContract = 'La conversión Reserva→Contrato debe estar entre 0 y 1';
    }
  }

  // Validaciones de tickets (≥ 0)
  if (data.avgTicketSale !== undefined && data.avgTicketSale < 0) {
    errors.avgTicketSale = 'El ticket medio de venta debe ser mayor o igual a 0';
  }

  if (data.avgTicketRent !== undefined && data.avgTicketRent < 0) {
    errors.avgTicketRent = 'El ticket medio de alquiler debe ser mayor o igual a 0';
  }

  // Validaciones de porcentajes (entre 0 y 1)
  if (data.feesPctSale !== undefined) {
    if (data.feesPctSale < 0 || data.feesPctSale > 1) {
      errors.feesPctSale = 'El porcentaje de honorarios de venta debe estar entre 0 y 1';
    }
  }

  if (data.feesPctRent !== undefined) {
    if (data.feesPctRent < 0 || data.feesPctRent > 1) {
      errors.feesPctRent = 'El porcentaje de honorarios de alquiler debe estar entre 0 y 1';
    }
  }

  if (data.commissionPct !== undefined) {
    if (data.commissionPct < 0 || data.commissionPct > 1) {
      errors.commissionPct = 'El porcentaje de comisión debe estar entre 0 y 1';
    }
  }

  // Validación de días del ciclo (> 0)
  if (data.cycleDays !== undefined && data.cycleDays <= 0) {
    errors.cycleDays = 'Los días del ciclo deben ser mayor a 0';
  }

  // Validaciones opcionales (≥ 0)
  if (data.fixedCosts !== undefined && data.fixedCosts < 0) {
    errors.fixedCosts = 'Los costos fijos deben ser mayor o igual a 0';
  }

  if (data.cac !== undefined && data.cac < 0) {
    errors.cac = 'El CAC debe ser mayor o igual a 0';
  }

  // Validación de estacionalidad (12 elementos, cada uno 0-2)
  if (data.seasonality) {
    if (data.seasonality.length !== 12) {
      errors.seasonality = 'La estacionalidad debe tener exactamente 12 valores (uno por mes)';
    } else {
      const invalidSeasonality = data.seasonality.some(factor => factor < 0 || factor > 2);
      if (invalidSeasonality) {
        errors.seasonality = 'Cada factor de estacionalidad debe estar entre 0 y 2';
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateForecastFilters(data: Partial<ForecastFilters>): ValidationResult {
  const errors: Record<string, string> = {};

  // Validación de fechas
  if (!data.from) {
    errors.from = 'La fecha inicial es requerida';
  }

  if (!data.to) {
    errors.to = 'La fecha final es requerida';
  }

  if (data.from && data.to) {
    const fromDate = new Date(data.from);
    const toDate = new Date(data.to);
    
    if (fromDate >= toDate) {
      errors.to = 'La fecha final debe ser posterior a la fecha inicial';
    }

    // Máximo 36 meses de proyección
    const monthsDiff = (toDate.getFullYear() - fromDate.getFullYear()) * 12 + 
                      (toDate.getMonth() - fromDate.getMonth());
    
    if (monthsDiff > 36) {
      errors.to = 'El máximo período de proyección es 36 meses';
    }
  }

  // Validación de moneda
  if (!data.currency) {
    errors.currency = 'La moneda es requerida';
  } else if (!['EUR', 'USD', 'GBP'].includes(data.currency)) {
    errors.currency = 'La moneda debe ser EUR, USD o GBP';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateScenario(data: Partial<Scenario>): ValidationResult {
  const errors: Record<string, string> = {};

  // Campos requeridos
  if (!data.name?.trim()) {
    errors.name = 'El nombre del escenario es requerido';
  }

  if (!data.kind) {
    errors.kind = 'El tipo de escenario es requerido';
  } else if (!['BASELINE', 'OPTIMISTIC', 'PESSIMISTIC', 'CUSTOM'].includes(data.kind)) {
    errors.kind = 'El tipo de escenario debe ser BASELINE, OPTIMISTIC, PESSIMISTIC o CUSTOM';
  }

  // Validación de supuestos
  if (data.assumptions) {
    const assumptionsResult = validateAssumptions(data.assumptions);
    if (!assumptionsResult.isValid) {
      Object.assign(errors, assumptionsResult.errors);
    }
  }

  // Validación de longitud del nombre
  if (data.name && data.name.length > 100) {
    errors.name = 'El nombre del escenario no puede tener más de 100 caracteres';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateAssumptionField(field: keyof Assumptions, value: any): string | null {
  const data = { [field]: value } as Partial<Assumptions>;
  const result = validateAssumptions(data);
  return result.errors[field] || null;
}

export function sanitizeAssumptions(data: Partial<Assumptions>): Partial<Assumptions> {
  return {
    ...data,
    // Asegurarse de que los valores numéricos estén en los rangos correctos
    convLeadVisit: data.convLeadVisit !== undefined ? Math.max(0, Math.min(1, data.convLeadVisit)) : undefined,
    convVisitOffer: data.convVisitOffer !== undefined ? Math.max(0, Math.min(1, data.convVisitOffer)) : undefined,
    convOfferReservation: data.convOfferReservation !== undefined ? Math.max(0, Math.min(1, data.convOfferReservation)) : undefined,
    convReservationContract: data.convReservationContract !== undefined ? Math.max(0, Math.min(1, data.convReservationContract)) : undefined,
    avgTicketSale: data.avgTicketSale !== undefined ? Math.max(0, data.avgTicketSale) : undefined,
    avgTicketRent: data.avgTicketRent !== undefined ? Math.max(0, data.avgTicketRent) : undefined,
    feesPctSale: data.feesPctSale !== undefined ? Math.max(0, Math.min(1, data.feesPctSale)) : undefined,
    feesPctRent: data.feesPctRent !== undefined ? Math.max(0, Math.min(1, data.feesPctRent)) : undefined,
    cycleDays: data.cycleDays !== undefined ? Math.max(1, data.cycleDays) : undefined,
    commissionPct: data.commissionPct !== undefined ? Math.max(0, Math.min(1, data.commissionPct)) : undefined,
    fixedCosts: data.fixedCosts !== undefined ? Math.max(0, data.fixedCosts) : undefined,
    cac: data.cac !== undefined ? Math.max(0, data.cac) : undefined,
    seasonality: data.seasonality?.map(factor => Math.max(0, Math.min(2, factor))) || undefined
  };
}