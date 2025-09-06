import type { 
  Invoice, 
  InvoiceQuery, 
  InvoiceListResponse, 
  InvoiceFormData, 
  Payment, 
  CreditNoteRequest,
  RecurrenceConfig,
  EInvoiceStatus,
  AuditEvent,
  ExportOptions
} from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

// Datos simulados
const mockInvoices: Invoice[] = [
  {
    id: "1",
    type: "VENTA",
    status: "EMITIDA",
    series: "FAC",
    number: "FAC0001",
    date: "2024-01-15",
    dueDate: "2024-02-14",
    customer: {
      id: "c1",
      name: "Acme Corp S.L.",
      nif: "B12345678",
      email: "facturacion@acme.com",
      address: "Calle Mayor 123, Madrid"
    },
    lines: [
      {
        id: "l1",
        concept: "Consultoría IT",
        description: "Servicios de consultoría tecnológica",
        qty: 10,
        price: 100,
        iva: 21,
        ret: 15,
        discount: 0,
        total: 1060,
        baseAmount: 1000,
        ivaAmount: 210,
        retAmount: 150
      }
    ],
    base: 1000,
    ivaTotal: 210,
    retTotal: 150,
    total: 1060,
    paid: 500,
    balance: 560,
    paymentMethod: "TRANSFER",
    taxRegime: "GENERAL",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z"
  },
  {
    id: "2",
    type: "VENTA",
    status: "PAGADA",
    series: "FAC",
    number: "FAC0002",
    date: "2024-01-20",
    dueDate: "2024-02-19",
    customer: {
      id: "c2",
      name: "Tech Solutions S.L.",
      nif: "B87654321",
      email: "admin@techsolutions.com",
      address: "Avenida Libertad 45, Barcelona"
    },
    lines: [
      {
        id: "l2",
        concept: "Licencia software",
        qty: 1,
        price: 2000,
        iva: 21,
        discount: 10,
        total: 1890,
        baseAmount: 1800,
        ivaAmount: 378,
        retAmount: 0
      }
    ],
    base: 1800,
    ivaTotal: 378,
    retTotal: 0,
    total: 2178,
    paid: 2178,
    balance: 0,
    createdAt: "2024-01-20T10:00:00Z",
    updatedAt: "2024-01-25T15:30:00Z"
  }
];

const mockPayments: Payment[] = [
  {
    id: "p1",
    invoiceId: "1",
    date: "2024-01-25",
    amount: 500,
    method: "TRANSFER",
    reference: "TRF-001",
    createdAt: "2024-01-25T10:00:00Z"
  }
];

const mockAuditEvents: AuditEvent[] = [
  {
    id: "a1",
    invoiceId: "1",
    event: "CREATE",
    description: "Factura creada",
    actor: "user@example.com",
    timestamp: "2024-01-15T10:00:00Z"
  },
  {
    id: "a2",
    invoiceId: "1",
    event: "ISSUE",
    description: "Factura emitida",
    actor: "user@example.com",
    timestamp: "2024-01-15T10:05:00Z"
  }
];

// Simulación de delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// API Functions

/* Facturas */
export async function getInvoices(query: InvoiceQuery = {}): Promise<InvoiceListResponse> {
  await delay(500);
  
  let filteredInvoices = [...mockInvoices];
  
  // Aplicar filtros
  if (query.q) {
    const searchTerm = query.q.toLowerCase();
    filteredInvoices = filteredInvoices.filter(invoice =>
      invoice.number.toLowerCase().includes(searchTerm) ||
      invoice.customer?.name.toLowerCase().includes(searchTerm) ||
      invoice.customer?.nif.toLowerCase().includes(searchTerm)
    );
  }
  
  if (query.type) {
    filteredInvoices = filteredInvoices.filter(invoice => invoice.type === query.type);
  }
  
  if (query.status) {
    filteredInvoices = filteredInvoices.filter(invoice => invoice.status === query.status);
  }
  
  if (query.series) {
    filteredInvoices = filteredInvoices.filter(invoice => invoice.series === query.series);
  }
  
  if (query.customerId) {
    filteredInvoices = filteredInvoices.filter(invoice => invoice.customer?.id === query.customerId);
  }
  
  if (query.from) {
    filteredInvoices = filteredInvoices.filter(invoice => invoice.date >= query.from!);
  }
  
  if (query.to) {
    filteredInvoices = filteredInvoices.filter(invoice => invoice.date <= query.to!);
  }
  
  if (query.paid !== undefined) {
    filteredInvoices = filteredInvoices.filter(invoice => 
      query.paid ? invoice.balance === 0 : invoice.balance > 0
    );
  }
  
  // Ordenar
  if (query.sort) {
    const [field, direction] = query.sort.split(':');
    filteredInvoices.sort((a, b) => {
      const aVal = (a as any)[field];
      const bVal = (b as any)[field];
      const modifier = direction === 'desc' ? -1 : 1;
      return aVal < bVal ? -modifier : aVal > bVal ? modifier : 0;
    });
  }
  
  // Paginación
  const page = query.page || 1;
  const size = query.size || 25;
  const start = (page - 1) * size;
  const end = start + size;
  const paginatedInvoices = filteredInvoices.slice(start, end);
  
  // Calcular totales
  const totalAmounts = filteredInvoices.reduce(
    (acc, invoice) => ({
      base: acc.base + invoice.base,
      iva: acc.iva + invoice.ivaTotal,
      total: acc.total + invoice.total,
      paid: acc.paid + invoice.paid,
      pending: acc.pending + invoice.balance
    }),
    { base: 0, iva: 0, total: 0, paid: 0, pending: 0 }
  );
  
  return {
    invoices: paginatedInvoices,
    total: filteredInvoices.length,
    page,
    size,
    totalPages: Math.ceil(filteredInvoices.length / size),
    totalAmounts
  };
}

export async function getInvoice(id: string): Promise<Invoice> {
  await delay(300);
  const invoice = mockInvoices.find(inv => inv.id === id);
  if (!invoice) {
    throw new Error('Factura no encontrada');
  }
  return invoice;
}

export async function createInvoice(data: InvoiceFormData): Promise<Invoice> {
  await delay(800);
  
  const newId = (mockInvoices.length + 1).toString();
  const lines = data.lines.map(line => ({
    ...line,
    id: crypto.randomUUID(),
    total: (line.qty * line.price) * (1 + (line.iva / 100)) * (1 - (line.discount || 0) / 100),
    baseAmount: line.qty * line.price * (1 - (line.discount || 0) / 100),
    ivaAmount: line.qty * line.price * (1 - (line.discount || 0) / 100) * (line.iva / 100),
    retAmount: line.ret ? line.qty * line.price * (1 - (line.discount || 0) / 100) * (line.ret / 100) : 0
  }));
  
  const base = lines.reduce((sum, line) => sum + line.baseAmount, 0);
  const ivaTotal = lines.reduce((sum, line) => sum + line.ivaAmount, 0);
  const retTotal = lines.reduce((sum, line) => sum + (line.retAmount || 0), 0);
  const total = base + ivaTotal - retTotal;
  
  const newInvoice: Invoice = {
    id: newId,
    ...data,
    lines,
    status: "BORRADOR",
    number: `${data.series}${(mockInvoices.length + 1).toString().padStart(4, '0')}`,
    base,
    ivaTotal,
    retTotal,
    total,
    paid: 0,
    balance: total,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  mockInvoices.push(newInvoice);
  return newInvoice;
}

export async function updateInvoice(id: string, data: Partial<InvoiceFormData>): Promise<Invoice> {
  await delay(600);
  
  const index = mockInvoices.findIndex(inv => inv.id === id);
  if (index === -1) {
    throw new Error('Factura no encontrada');
  }
  
  const updated = {
    ...mockInvoices[index],
    ...data,
    updatedAt: new Date().toISOString()
  };
  
  mockInvoices[index] = updated;
  return updated;
}

export async function issueInvoice(id: string): Promise<Invoice> {
  await delay(400);
  
  const index = mockInvoices.findIndex(inv => inv.id === id);
  if (index === -1) {
    throw new Error('Factura no encontrada');
  }
  
  if (mockInvoices[index].status !== 'BORRADOR') {
    throw new Error('Solo se pueden emitir facturas en borrador');
  }
  
  mockInvoices[index].status = 'EMITIDA';
  mockInvoices[index].updatedAt = new Date().toISOString();
  
  return mockInvoices[index];
}

export async function cancelInvoice(id: string): Promise<Invoice> {
  await delay(400);
  
  const index = mockInvoices.findIndex(inv => inv.id === id);
  if (index === -1) {
    throw new Error('Factura no encontrada');
  }
  
  mockInvoices[index].status = 'ANULADA';
  mockInvoices[index].updatedAt = new Date().toISOString();
  
  return mockInvoices[index];
}

export async function sendInvoice(id: string): Promise<{ success: boolean; message: string }> {
  await delay(1000);
  
  const index = mockInvoices.findIndex(inv => inv.id === id);
  if (index === -1) {
    throw new Error('Factura no encontrada');
  }
  
  mockInvoices[index].status = 'ENVIADA';
  mockInvoices[index].updatedAt = new Date().toISOString();
  
  return {
    success: true,
    message: 'Factura enviada por email correctamente'
  };
}

export async function getInvoicePdf(id: string): Promise<Blob> {
  await delay(800);
  // Simular generación de PDF
  const pdfContent = `PDF simulado para factura ${id}`;
  return new Blob([pdfContent], { type: 'application/pdf' });
}

/* Pagos */
export async function getInvoicePayments(invoiceId: string): Promise<Payment[]> {
  await delay(300);
  return mockPayments.filter(payment => payment.invoiceId === invoiceId);
}

export async function createPayment(invoiceId: string, paymentData: Omit<Payment, 'id' | 'invoiceId' | 'createdAt'>): Promise<Payment> {
  await delay(600);
  
  const newPayment: Payment = {
    id: crypto.randomUUID(),
    invoiceId,
    ...paymentData,
    createdAt: new Date().toISOString()
  };
  
  mockPayments.push(newPayment);
  
  // Actualizar el saldo de la factura
  const invoiceIndex = mockInvoices.findIndex(inv => inv.id === invoiceId);
  if (invoiceIndex !== -1) {
    mockInvoices[invoiceIndex].paid += paymentData.amount;
    mockInvoices[invoiceIndex].balance -= paymentData.amount;
    
    if (mockInvoices[invoiceIndex].balance <= 0) {
      mockInvoices[invoiceIndex].status = 'PAGADA';
    }
    
    mockInvoices[invoiceIndex].updatedAt = new Date().toISOString();
  }
  
  return newPayment;
}

export async function deletePayment(invoiceId: string, paymentId: string): Promise<void> {
  await delay(400);
  
  const paymentIndex = mockPayments.findIndex(p => p.id === paymentId && p.invoiceId === invoiceId);
  if (paymentIndex === -1) {
    throw new Error('Pago no encontrado');
  }
  
  const payment = mockPayments[paymentIndex];
  mockPayments.splice(paymentIndex, 1);
  
  // Actualizar el saldo de la factura
  const invoiceIndex = mockInvoices.findIndex(inv => inv.id === invoiceId);
  if (invoiceIndex !== -1) {
    mockInvoices[invoiceIndex].paid -= payment.amount;
    mockInvoices[invoiceIndex].balance += payment.amount;
    
    if (mockInvoices[invoiceIndex].balance > 0 && mockInvoices[invoiceIndex].status === 'PAGADA') {
      mockInvoices[invoiceIndex].status = 'EMITIDA';
    }
    
    mockInvoices[invoiceIndex].updatedAt = new Date().toISOString();
  }
}

/* Abonos */
export async function createCreditNote(invoiceId: string, request: CreditNoteRequest): Promise<Invoice> {
  await delay(800);
  
  const originalInvoice = mockInvoices.find(inv => inv.id === invoiceId);
  if (!originalInvoice) {
    throw new Error('Factura original no encontrada');
  }
  
  const creditNote: Invoice = {
    ...originalInvoice,
    id: crypto.randomUUID(),
    number: `${originalInvoice.series}R${(mockInvoices.length + 1).toString().padStart(4, '0')}`,
    date: new Date().toISOString().split('T')[0],
    status: 'EMITIDA',
    total: request.type === 'TOTAL' ? -originalInvoice.total : -(request.amounts?.total || 0),
    base: request.type === 'TOTAL' ? -originalInvoice.base : -(request.amounts?.base || 0),
    ivaTotal: request.type === 'TOTAL' ? -originalInvoice.ivaTotal : -(request.amounts?.iva || 0),
    paid: 0,
    balance: request.type === 'TOTAL' ? -originalInvoice.total : -(request.amounts?.total || 0),
    references: {
      ...originalInvoice.references,
      originalInvoiceId: invoiceId
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  mockInvoices.push(creditNote);
  return creditNote;
}

/* Recurrentes */
export async function createRecurrence(invoiceId: string, config: RecurrenceConfig): Promise<void> {
  await delay(600);
  
  const index = mockInvoices.findIndex(inv => inv.id === invoiceId);
  if (index === -1) {
    throw new Error('Factura no encontrada');
  }
  
  mockInvoices[index].recurrence = {
    freq: config.frequency,
    day: config.day,
    until: config.until,
    updatePrices: config.updatePrices
  };
  
  mockInvoices[index].updatedAt = new Date().toISOString();
}

export async function getRecurrence(invoiceId: string): Promise<RecurrenceConfig | null> {
  await delay(300);
  
  const invoice = mockInvoices.find(inv => inv.id === invoiceId);
  if (!invoice || !invoice.recurrence) {
    return null;
  }
  
  return {
    frequency: invoice.recurrence.freq,
    day: invoice.recurrence.day,
    until: invoice.recurrence.until,
    updatePrices: invoice.recurrence.updatePrices,
    active: true
  };
}

/* Export/Import */
export async function exportInvoices(options: ExportOptions): Promise<Blob> {
  await delay(1000);
  
  const { invoices } = await getInvoices(options.filters);
  let content = '';
  let mimeType = '';
  let filename = '';
  
  switch (options.format) {
    case 'CSV':
      const headers = ['Número', 'Fecha', 'Cliente', 'Base', 'IVA', 'Total', 'Estado'];
      const rows = invoices.map(inv => [
        inv.number,
        inv.date,
        inv.customer?.name || '',
        inv.base.toString(),
        inv.ivaTotal.toString(),
        inv.total.toString(),
        inv.status
      ]);
      
      content = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      mimeType = 'text/csv';
      filename = 'facturas.csv';
      break;
      
    case 'JSON':
      content = JSON.stringify(invoices, null, 2);
      mimeType = 'application/json';
      filename = 'facturas.json';
      break;
      
    case 'IVA_BOOK':
      // Simulación de libro de IVA
      const vatBook = invoices
        .filter(inv => inv.status !== 'BORRADOR')
        .map(inv => ({
          fecha: inv.date,
          numero: inv.number,
          cliente: inv.customer?.name || '',
          nif: inv.customer?.nif || '',
          base: inv.base,
          iva21: inv.lines.filter(l => l.iva === 21).reduce((sum, l) => sum + l.ivaAmount, 0),
          iva10: inv.lines.filter(l => l.iva === 10).reduce((sum, l) => sum + l.ivaAmount, 0),
          iva4: inv.lines.filter(l => l.iva === 4).reduce((sum, l) => sum + l.ivaAmount, 0),
          total: inv.total
        }));
      
      const vatHeaders = ['Fecha', 'Número', 'Cliente', 'NIF', 'Base', 'IVA 21%', 'IVA 10%', 'IVA 4%', 'Total'];
      const vatRows = vatBook.map(entry => [
        entry.fecha,
        entry.numero,
        entry.cliente,
        entry.nif,
        entry.base.toString(),
        entry.iva21.toString(),
        entry.iva10.toString(),
        entry.iva4.toString(),
        entry.total.toString()
      ]);
      
      content = [vatHeaders.join(','), ...vatRows.map(row => row.join(','))].join('\n');
      mimeType = 'text/csv';
      filename = 'libro-iva.csv';
      break;
  }
  
  return new Blob([content], { type: mimeType });
}

export async function importInvoices(file: File): Promise<{ success: number; errors: string[] }> {
  await delay(2000);
  
  // Simulación de importación
  return {
    success: 5,
    errors: ['Línea 3: Cliente no encontrado', 'Línea 7: Formato de fecha incorrecto']
  };
}

/* e-Invoice / FacturaE */
export async function generateEInvoice(invoiceId: string): Promise<{ xml: string; url: string }> {
  await delay(1500);
  
  const invoice = mockInvoices.find(inv => inv.id === invoiceId);
  if (!invoice) {
    throw new Error('Factura no encontrada');
  }
  
  // Simulación de XML FacturaE v3.2
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<fe:Facturae version="3.2" xmlns:fe="http://www.facturae.gob.es/formato/Versiones/Facturaev3_2.xml">
  <FileHeader>
    <SchemaVersion>3.2</SchemaVersion>
    <Modality>I</Modality>
    <InvoiceIssuerType>EM</InvoiceIssuerType>
  </FileHeader>
  <Parties>
    <SellerParty>
      <TaxIdentification>
        <PersonTypeCode>J</PersonTypeCode>
        <ResidenceTypeCode>R</ResidenceTypeCode>
        <TaxIdentificationNumber>A12345678</TaxIdentificationNumber>
      </TaxIdentification>
      <LegalEntity>
        <CorporateName>Mi Empresa S.L.</CorporateName>
      </LegalEntity>
    </SellerParty>
    <BuyerParty>
      <TaxIdentification>
        <PersonTypeCode>J</PersonTypeCode>
        <ResidenceTypeCode>R</ResidenceTypeCode>
        <TaxIdentificationNumber>${invoice.customer?.nif}</TaxIdentificationNumber>
      </TaxIdentification>
      <LegalEntity>
        <CorporateName>${invoice.customer?.name}</CorporateName>
      </LegalEntity>
    </BuyerParty>
  </Parties>
  <Invoices>
    <Invoice>
      <InvoiceHeader>
        <InvoiceNumber>${invoice.number}</InvoiceNumber>
        <InvoiceSeriesCode>${invoice.series}</InvoiceSeriesCode>
        <InvoiceDocumentType>FC</InvoiceDocumentType>
        <TypeCode>OO</TypeCode>
      </InvoiceHeader>
      <InvoiceIssueData>
        <IssueDate>${invoice.date}</IssueDate>
        <InvoiceCurrencyCode>EUR</InvoiceCurrencyCode>
        <TaxCurrencyCode>EUR</TaxCurrencyCode>
        <LanguageName>es</LanguageName>
      </InvoiceIssueData>
    </Invoice>
  </Invoices>
</fe:Facturae>`;

  return {
    xml,
    url: `/temp/einvoice-${invoiceId}.xml`
  };
}

export async function sendEInvoice(invoiceId: string): Promise<EInvoiceStatus> {
  await delay(2000);
  
  return {
    generated: true,
    sent: true,
    sentAt: new Date().toISOString(),
    generatedAt: new Date().toISOString()
  };
}

export async function getEInvoiceStatus(invoiceId: string): Promise<EInvoiceStatus> {
  await delay(300);
  
  return {
    generated: true,
    sent: false,
    generatedAt: new Date().toISOString()
  };
}

/* Auditoría */
export async function getAuditTrail(invoiceId: string): Promise<AuditEvent[]> {
  await delay(400);
  return mockAuditEvents.filter(event => event.invoiceId === invoiceId);
}