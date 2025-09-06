import { z } from "zod";

// Base schemas
const currencySchema = z.enum(["EUR", "USD", "GBP"]);

// Provider connection schemas
export const connectProviderSchema = z.object({
  mode: z.enum(["test", "live"]),
  type: z.enum(["oauth", "apikey", "credentials"]),
  credentials: z.record(z.string()).refine(
    (creds) => Object.keys(creds).length > 0,
    { message: "Al menos una credencial es requerida" }
  ),
  office: z.string().optional(),
  currencies: z.array(z.string()).min(1, "Al menos una moneda es requerida")
});

// Payment method schemas
export const paymentMethodSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "El nombre es requerido"),
  enabled: z.boolean(),
  requires3ds: z.boolean().optional(),
  minAmount: z.number().min(0, "El importe mínimo debe ser >= 0").optional(),
  maxAmount: z.number().min(0, "El importe máximo debe ser >= 0").optional(),
  feePct: z.number().min(0, "El porcentaje debe ser >= 0").max(10, "El porcentaje debe ser <= 10").optional(),
  feeFixed: z.number().min(0, "La comisión fija debe ser >= 0").optional()
}).refine(
  (data) => !data.minAmount || !data.maxAmount || data.maxAmount >= data.minAmount,
  {
    message: "El importe máximo debe ser >= al importe mínimo",
    path: ["maxAmount"]
  }
);

// Checkout link schemas
export const checkoutLinkSchema = z.object({
  concept: z.string().min(1, "El concepto es requerido"),
  amount: z.number().min(0.01, "El importe debe ser > 0"),
  currency: currencySchema,
  ref: z.object({
    invoiceId: z.string().optional(),
    contractId: z.string().optional()
  }).optional(),
  expireAt: z.string().optional()
}).refine(
  (data) => {
    if (data.expireAt) {
      const expireDate = new Date(data.expireAt);
      const now = new Date();
      return expireDate > now;
    }
    return true;
  },
  {
    message: "La fecha de expiración debe ser futura",
    path: ["expireAt"]
  }
);

// Refund schemas
export const refundSchema = z.object({
  amount: z.number().min(0.01, "El importe debe ser > 0").optional(),
  reason: z.string().max(500, "El motivo no puede exceder 500 caracteres").optional(),
  chargeId: z.string().min(1, "ID del cargo es requerido")
});

// Plan schemas
export const planSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  amount: z.number().min(0.01, "El precio debe ser > 0"),
  currency: currencySchema,
  interval: z.enum(["month", "quarter", "year"]),
  trialDays: z.number().min(0, "Los días de prueba deben ser >= 0").optional(),
  taxPct: z.number().min(0, "El porcentaje de impuestos debe ser >= 0").max(100, "El porcentaje de impuestos debe ser <= 100").optional()
});

// Subscription schemas
export const subscriptionSchema = z.object({
  planId: z.string().min(1, "El plan es requerido"),
  customer: z.string().email("Debe ser un email válido"),
  defaultMethod: z.string().optional()
});

// Webhook schemas
export const webhookSchema = z.object({
  url: z.string().url("Debe ser una URL válida").refine(
    (url) => url.startsWith("https://"),
    { message: "La URL debe usar HTTPS" }
  ),
  secret: z.string().min(8, "El secreto debe tener al menos 8 caracteres"),
  events: z.array(z.string()).min(1, "Al menos un evento es requerido"),
  enabled: z.boolean()
});

// Risk rule schemas
export const riskRuleSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  type: z.enum(["score", "3ds", "limit", "blacklist", "country"]),
  condition: z.string().min(1, "La condición es requerida"),
  action: z.enum(["allow", "require3ds", "block"]),
  enabled: z.boolean()
});

// Provider config schemas
export const providerConfigSchema = z.object({
  methods: z.array(paymentMethodSchema),
  currencies: z.object({
    base: z.string().min(1, "La moneda base es requerida"),
    allowed: z.array(z.string()).min(1, "Al menos una moneda permitida es requerida"),
    rounding: z.number().min(0).max(4, "El redondeo debe estar entre 0 y 4 decimales")
  }),
  branding: z.object({
    logo: z.string().url("Debe ser una URL válida").optional(),
    color: z.string().regex(/^#[0-9A-F]{6}$/i, "Debe ser un color hexadecimal válido").optional(),
    receiptText: z.string().max(200, "El texto del recibo no puede exceder 200 caracteres").optional(),
    legalFooter: z.string().max(500, "El pie legal no puede exceder 500 caracteres").optional()
  }),
  webhooks: webhookSchema,
  risk: z.object({
    force3ds: z.boolean(),
    scoreThreshold: z.number().min(0, "El umbral debe ser >= 0").max(100, "El umbral debe ser <= 100"),
    maxTicketAmount: z.number().min(0, "El límite debe ser >= 0").optional(),
    blockedCountries: z.array(z.string().length(2, "Debe ser un código de país de 2 letras")),
    allowedRetries: z.number().min(0, "Los reintentos deben ser >= 0").max(10, "Los reintentos deben ser <= 10")
  })
});

// Filters schemas
export const chargeFiltersSchema = z.object({
  status: z.enum(["succeeded", "pending", "failed", "refunded"]).optional(),
  method: z.string().optional(),
  provider: z.string().optional(),
  office: z.string().optional(),
  customer: z.string().optional(),
  ref: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.number().min(1, "La página debe ser >= 1").optional(),
  size: z.number().min(1, "El tamaño debe ser >= 1").max(100, "El tamaño debe ser <= 100").optional(),
  sort: z.string().optional()
}).refine(
  (data) => {
    if (data.from && data.to) {
      const fromDate = new Date(data.from);
      const toDate = new Date(data.to);
      return fromDate <= toDate;
    }
    return true;
  },
  {
    message: "La fecha desde debe ser <= a la fecha hasta",
    path: ["to"]
  }
);

export const disputeFiltersSchema = z.object({
  status: z.enum(["needs_response", "under_review", "won", "lost"]).optional(),
  provider: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional()
}).refine(
  (data) => {
    if (data.from && data.to) {
      const fromDate = new Date(data.from);
      const toDate = new Date(data.to);
      return fromDate <= toDate;
    }
    return true;
  },
  {
    message: "La fecha desde debe ser <= a la fecha hasta",
    path: ["to"]
  }
);

export const subscriptionFiltersSchema = z.object({
  status: z.enum(["active", "paused", "canceled", "past_due"]).optional(),
  planId: z.string().optional(),
  customer: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional()
}).refine(
  (data) => {
    if (data.from && data.to) {
      const fromDate = new Date(data.from);
      const toDate = new Date(data.to);
      return fromDate <= toDate;
    }
    return true;
  },
  {
    message: "La fecha desde debe ser <= a la fecha hasta",
    path: ["to"]
  }
);

export const payoutFiltersSchema = z.object({
  provider: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  status: z.enum(["scheduled", "paid", "failed"]).optional()
}).refine(
  (data) => {
    if (data.from && data.to) {
      const fromDate = new Date(data.from);
      const toDate = new Date(data.to);
      return fromDate <= toDate;
    }
    return true;
  },
  {
    message: "La fecha desde debe ser <= a la fecha hasta",
    path: ["to"]
  }
);

export const logFiltersSchema = z.object({
  provider: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  q: z.string().optional(),
  page: z.number().min(1, "La página debe ser >= 1").optional(),
  size: z.number().min(1, "El tamaño debe ser >= 1").max(100, "El tamaño debe ser <= 100").optional(),
  sort: z.string().optional()
}).refine(
  (data) => {
    if (data.from && data.to) {
      const fromDate = new Date(data.from);
      const toDate = new Date(data.to);
      return fromDate <= toDate;
    }
    return true;
  },
  {
    message: "La fecha desde debe ser <= a la fecha hasta",
    path: ["to"]
  }
);

// Export types inferred from schemas
export type ConnectProviderInput = z.infer<typeof connectProviderSchema>;
export type PaymentMethodInput = z.infer<typeof paymentMethodSchema>;
export type CheckoutLinkInput = z.infer<typeof checkoutLinkSchema>;
export type RefundInput = z.infer<typeof refundSchema>;
export type PlanInput = z.infer<typeof planSchema>;
export type SubscriptionInput = z.infer<typeof subscriptionSchema>;
export type WebhookInput = z.infer<typeof webhookSchema>;
export type RiskRuleInput = z.infer<typeof riskRuleSchema>;
export type ProviderConfigInput = z.infer<typeof providerConfigSchema>;
export type ChargeFiltersInput = z.infer<typeof chargeFiltersSchema>;
export type DisputeFiltersInput = z.infer<typeof disputeFiltersSchema>;
export type SubscriptionFiltersInput = z.infer<typeof subscriptionFiltersSchema>;
export type PayoutFiltersInput = z.infer<typeof payoutFiltersSchema>;
export type LogFiltersInput = z.infer<typeof logFiltersSchema>;