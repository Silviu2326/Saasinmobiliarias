import { z } from 'zod';

export const expenseTypeSchema = z.enum([
  'OPERATIONAL',
  'MARKETING', 
  'ADMINISTRATIVE',
  'MAINTENANCE',
  'INSURANCE',
  'UTILITIES',
  'OTHER'
]);

export const expenseStatusSchema = z.enum([
  'PENDING',
  'APPROVED',
  'REJECTED',
  'PAID',
  'CANCELLED'
]);

export const paymentMethodSchema = z.enum([
  'TRANSFER',
  'CARD',
  'CASH',
  'CHECK',
  'OTHER'
]);

export const recurrenceFrequencySchema = z.enum(['M', 'Q', 'Y', 'W']);

export const taxRegimeSchema = z.enum(['GENERAL', 'EXEMPT', 'REVERSE_CHARGE']);

export const supplierSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'El nombre del proveedor es requerido'),
  nif: z.string().min(1, 'El NIF es requerido'),
  address: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  city: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  category: z.string().optional()
});

export const expenseLineSchema = z.object({
  concept: z.string().min(1, 'El concepto es requerido'),
  description: z.string().optional(),
  qty: z.number().min(0.01, 'La cantidad debe ser mayor a 0'),
  price: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
  iva: z.number().min(0, 'El IVA debe ser mayor o igual a 0'),
  ret: z.number().min(0, 'La retención debe ser mayor o igual a 0').optional(),
  discount: z.number().min(0, 'El descuento debe ser mayor o igual a 0').optional(),
  categoryId: z.string().min(1, 'La categoría es requerida')
});

export const recurrenceSchema = z.object({
  freq: recurrenceFrequencySchema,
  day: z.number().min(1).max(31).optional(),
  until: z.string().optional(),
  updatePrices: z.boolean().optional()
});

export const referencesSchema = z.object({
  contractId: z.string().optional(),
  operationId: z.string().optional(),
  propertyId: z.string().optional()
});

export const expenseFormSchema = z.object({
  type: expenseTypeSchema,
  series: z.string().min(1, 'La serie es requerida'),
  number: z.string().min(1, 'El número es requerido'),
  date: z.string().min(1, 'La fecha es requerida'),
  dueDate: z.string().optional(),
  supplierId: z.string().optional(),
  categoryId: z.string().min(1, 'La categoría es requerida'),
  lines: z.array(expenseLineSchema).min(1, 'Debe tener al menos una línea'),
  notes: z.string().optional(),
  paymentMethod: paymentMethodSchema.optional(),
  taxRegime: taxRegimeSchema.optional(),
  recurrence: recurrenceSchema.optional(),
  references: referencesSchema.optional()
});

export const expenseQuerySchema = z.object({
  q: z.string().optional(),
  type: expenseTypeSchema.optional(),
  status: expenseStatusSchema.optional(),
  series: z.string().optional(),
  supplierId: z.string().optional(),
  categoryId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  dueFrom: z.string().optional(),
  dueTo: z.string().optional(),
  paid: z.boolean().optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  page: z.number().min(1).default(1),
  size: z.number().min(1).max(100).default(25),
  sort: z.string().default('date:desc')
});

export const expenseCategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'El nombre de la categoría es requerido'),
  type: expenseTypeSchema,
  description: z.string().optional(),
  budget: z.number().min(0, 'El presupuesto debe ser mayor o igual a 0').optional(),
  color: z.string().optional(),
  isActive: z.boolean().default(true)
});

export const paymentSchema = z.object({
  id: z.string().optional(),
  expenseId: z.string().min(1, 'El ID del gasto es requerido'),
  date: z.string().min(1, 'La fecha es requerida'),
  amount: z.number().min(0.01, 'El monto debe ser mayor a 0'),
  method: paymentMethodSchema,
  reference: z.string().optional(),
  notes: z.string().optional()
});

export type ExpenseFormData = z.infer<typeof expenseFormSchema>;
export type ExpenseQuery = z.infer<typeof expenseQuerySchema>;
export type ExpenseCategory = z.infer<typeof expenseCategorySchema>;
export type Payment = z.infer<typeof paymentSchema>;
export type Supplier = z.infer<typeof supplierSchema>;
export type ExpenseLine = z.infer<typeof expenseLineSchema>;