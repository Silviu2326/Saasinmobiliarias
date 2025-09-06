import type {
  ProviderInfo,
  PaymentMethodCfg,
  CheckoutLink,
  Charge,
  Refund,
  Dispute,
  Plan,
  Subscription,
  Payout,
  ReconciliationItem,
  WebhookConfig,
  LogItem,
  ConnectData,
  ProviderConfig,
  ChargeFilters,
  DisputeFilters,
  SubscriptionFilters,
  PayoutFilters,
  LogFilters
} from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

// Simulated data for development
const mockProviders: ProviderInfo[] = [
  {
    id: "stripe",
    name: "Stripe",
    logo: "/logos/stripe.svg",
    status: "LIVE",
    methods: ["card", "apple_pay", "google_pay", "sepa_debit"],
    currencies: ["EUR", "USD", "GBP"],
    lastSyncAt: "2024-01-15T10:30:00Z"
  },
  {
    id: "paypal",
    name: "PayPal",
    logo: "/logos/paypal.svg",
    status: "TEST",
    methods: ["paypal", "card"],
    currencies: ["EUR", "USD"],
    lastSyncAt: "2024-01-15T09:15:00Z"
  },
  {
    id: "redsys",
    name: "Redsys",
    logo: "/logos/redsys.svg",
    status: "LIVE",
    methods: ["card", "bizum"],
    currencies: ["EUR"],
    lastSyncAt: "2024-01-15T11:00:00Z"
  },
  {
    id: "adyen",
    name: "Adyen",
    logo: "/logos/adyen.svg",
    status: "DISCONNECTED",
    methods: ["card", "sepa_debit", "ideal", "sofort"],
    currencies: ["EUR", "USD", "GBP"],
  }
];

const mockCharges: Charge[] = [
  {
    id: "ch_1234567890",
    providerId: "stripe",
    customer: "Juan Pérez",
    customerEmail: "juan@example.com",
    amount: 29.99,
    currency: "EUR",
    method: "card",
    status: "succeeded",
    ref: { invoiceId: "INV-2024-001" },
    createdAt: "2024-01-15T10:30:00Z"
  },
  {
    id: "ch_0987654321",
    providerId: "redsys",
    customer: "María García",
    customerEmail: "maria@example.com",
    amount: 150.00,
    currency: "EUR",
    method: "bizum",
    status: "pending",
    ref: { contractId: "CONT-2024-015" },
    createdAt: "2024-01-15T11:15:00Z"
  }
];

// Provider APIs
export const providersApi = {
  async getProviders(): Promise<ProviderInfo[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockProviders;
  },

  async connectProvider(id: string, data: ConnectData): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const provider = mockProviders.find(p => p.id === id);
    if (provider) {
      provider.status = data.mode === "live" ? "LIVE" : "TEST";
    }
  },

  async testProvider(id: string): Promise<{ success: boolean; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return { success: true, message: "Conexión exitosa" };
  },

  async getProviderConfig(id: string): Promise<ProviderConfig> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      methods: [
        { id: "card", name: "Tarjeta", enabled: true, requires3ds: false, feePct: 2.9, feeFixed: 0.30 },
        { id: "apple_pay", name: "Apple Pay", enabled: true, requires3ds: false, feePct: 2.9, feeFixed: 0.30 }
      ],
      currencies: {
        base: "EUR",
        allowed: ["EUR", "USD"],
        rounding: 2
      },
      branding: {
        color: "#635BFF",
        receiptText: "Gracias por su compra"
      },
      webhooks: {
        url: "https://api.example.com/webhooks/payments",
        secret: "whsec_••••••••••••••••",
        events: ["payment.succeeded", "payment.failed"],
        enabled: true
      },
      risk: {
        force3ds: false,
        scoreThreshold: 80,
        maxTicketAmount: 1000,
        blockedCountries: ["XX"],
        allowedRetries: 3
      }
    };
  },

  async updateProviderConfig(id: string, config: Partial<ProviderConfig>): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 600));
  },

  async setProviderMode(id: string, mode: "test" | "live"): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const provider = mockProviders.find(p => p.id === id);
    if (provider) {
      provider.status = mode === "live" ? "LIVE" : "TEST";
    }
  }
};

// Payment Methods APIs
export const methodsApi = {
  async getMethods(): Promise<PaymentMethodCfg[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [
      { id: "card", name: "Tarjeta", enabled: true, requires3ds: false, minAmount: 1, maxAmount: 5000, feePct: 2.9, feeFixed: 0.30 },
      { id: "bizum", name: "Bizum", enabled: true, requires3ds: false, minAmount: 0.50, maxAmount: 1000, feePct: 1.5, feeFixed: 0 },
      { id: "apple_pay", name: "Apple Pay", enabled: false, requires3ds: false, feePct: 2.9, feeFixed: 0.30 }
    ];
  },

  async updateMethod(method: PaymentMethodCfg): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
  }
};

// Checkout Links APIs
export const checkoutLinksApi = {
  async getCheckoutLinks(params?: { status?: string; from?: string; to?: string; q?: string }): Promise<CheckoutLink[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return [
      {
        id: "link_123456",
        url: "https://checkout.example.com/pay/link_123456",
        qrUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://checkout.example.com/pay/link_123456",
        concept: "Consultoría desarrollo web",
        amount: 500.00,
        currency: "EUR",
        status: "active",
        ref: { invoiceId: "INV-2024-003" },
        visits: 12,
        conversions: 1,
        expireAt: "2024-02-15T23:59:59Z",
        createdAt: "2024-01-15T08:00:00Z"
      }
    ];
  },

  async createCheckoutLink(data: Omit<CheckoutLink, "id" | "url" | "qrUrl" | "visits" | "conversions" | "createdAt">): Promise<CheckoutLink> {
    await new Promise(resolve => setTimeout(resolve, 600));
    const id = `link_${Math.random().toString(36).substring(2, 15)}`;
    const url = `https://checkout.example.com/pay/${id}`;
    return {
      ...data,
      id,
      url,
      qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`,
      visits: 0,
      conversions: 0,
      createdAt: new Date().toISOString()
    };
  },

  async updateCheckoutLink(id: string, data: Partial<CheckoutLink>): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
  },

  async disableCheckoutLink(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
  }
};

// Charges APIs
export const chargesApi = {
  async getCharges(filters: ChargeFilters = {}): Promise<{ data: Charge[]; total: number; page: number; pages: number }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const filteredCharges = mockCharges.filter(charge => {
      if (filters.status && charge.status !== filters.status) return false;
      if (filters.provider && charge.providerId !== filters.provider) return false;
      if (filters.customer && !charge.customer.toLowerCase().includes(filters.customer.toLowerCase())) return false;
      return true;
    });

    const page = filters.page ?? 1;
    const size = filters.size ?? 25;
    const start = (page - 1) * size;
    const end = start + size;

    return {
      data: filteredCharges.slice(start, end),
      total: filteredCharges.length,
      page,
      pages: Math.ceil(filteredCharges.length / size)
    };
  },

  async getCharge(id: string): Promise<Charge> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const charge = mockCharges.find(c => c.id === id);
    if (!charge) throw new Error("Charge not found");
    return charge;
  },

  async refundCharge(id: string, data: { amount?: number; reason?: string }): Promise<Refund> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      id: `re_${Math.random().toString(36).substring(2, 15)}`,
      chargeId: id,
      amount: data.amount ?? 100,
      reason: data.reason,
      createdAt: new Date().toISOString()
    };
  },

  async getReceipt(id: string): Promise<Blob> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return new Blob(["Mock receipt content"], { type: "application/pdf" });
  }
};

// Disputes APIs
export const disputesApi = {
  async getDisputes(filters: DisputeFilters = {}): Promise<Dispute[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return [
      {
        id: "dp_123456789",
        chargeId: "ch_1234567890",
        status: "needs_response",
        amount: 29.99,
        currency: "EUR",
        dueBy: "2024-02-01T23:59:59Z",
        updatedAt: "2024-01-16T14:30:00Z"
      }
    ];
  },

  async respondToDispute(id: string, evidence: FormData): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
  },

  async uploadEvidence(id: string, files: FormData): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 800));
  }
};

// Plans and Subscriptions APIs
export const plansApi = {
  async getPlans(): Promise<Plan[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [
      {
        id: "plan_basic",
        name: "Plan Básico",
        amount: 9.99,
        currency: "EUR",
        interval: "month",
        trialDays: 14
      },
      {
        id: "plan_premium",
        name: "Plan Premium",
        amount: 99.99,
        currency: "EUR",
        interval: "year",
        trialDays: 30
      }
    ];
  },

  async createPlan(data: Omit<Plan, "id">): Promise<Plan> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      ...data,
      id: `plan_${Math.random().toString(36).substring(2, 15)}`
    };
  }
};

export const subscriptionsApi = {
  async getSubscriptions(filters: SubscriptionFilters = {}): Promise<Subscription[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return [
      {
        id: "sub_123456789",
        planId: "plan_basic",
        customer: "cliente@example.com",
        status: "active",
        currentPeriodEnd: "2024-02-15T23:59:59Z",
        defaultMethod: "card",
        createdAt: "2024-01-15T10:00:00Z"
      }
    ];
  },

  async createSubscription(data: Omit<Subscription, "id" | "createdAt">): Promise<Subscription> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return {
      ...data,
      id: `sub_${Math.random().toString(36).substring(2, 15)}`,
      createdAt: new Date().toISOString()
    };
  },

  async updateSubscription(id: string, data: Partial<Subscription>): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
};

// Payouts APIs
export const payoutsApi = {
  async getPayouts(filters: PayoutFilters = {}): Promise<Payout[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return [
      {
        id: "po_123456789",
        providerId: "stripe",
        date: "2024-01-18",
        gross: 1250.00,
        fees: 45.50,
        net: 1204.50,
        status: "scheduled",
        iban: "ES91 2100 0418 45 0200051332"
      }
    ];
  },

  async simulatePayouts(): Promise<Payout[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return [
      {
        id: "po_sim_001",
        providerId: "stripe",
        date: "2024-01-19",
        gross: 850.00,
        fees: 31.20,
        net: 818.80,
        status: "scheduled",
        iban: "ES91 2100 0418 45 0200051332"
      }
    ];
  }
};

// Reconciliation APIs
export const reconciliationApi = {
  async getReconciliation(params: { from: string; to: string; office?: string }): Promise<ReconciliationItem[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return [
      {
        id: "rec_001",
        chargeId: "ch_1234567890",
        invoiceId: "INV-2024-001",
        match: "exact",
        delta: 0
      },
      {
        id: "rec_002",
        chargeId: "ch_0987654321",
        match: "none",
        delta: 150.00,
        note: "Sin factura asociada"
      }
    ];
  },

  async resolveReconciliation(items: ReconciliationItem[]): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 700));
  }
};

// Webhooks APIs
export const webhooksApi = {
  async getWebhooks(): Promise<WebhookConfig[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [
      {
        url: "https://api.example.com/webhooks/payments",
        secret: "whsec_••••••••••••••••",
        events: ["payment.succeeded", "payment.failed", "refund.created"],
        enabled: true
      }
    ];
  },

  async createWebhook(data: WebhookConfig): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
  },

  async testWebhook(url: string, event: string): Promise<{ success: boolean; response: string }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      success: true,
      response: "200 OK - Event received successfully"
    };
  }
};

// Logs APIs
export const logsApi = {
  async getLogs(filters: LogFilters = {}): Promise<{ data: LogItem[]; total: number; page: number; pages: number }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockLogs: LogItem[] = [
      {
        id: "log_001",
        at: "2024-01-15T10:30:15Z",
        providerId: "stripe",
        type: "payment.created",
        entity: "ch_1234567890",
        result: "ok",
        message: "Payment created successfully"
      },
      {
        id: "log_002",
        at: "2024-01-15T10:30:20Z",
        providerId: "stripe",
        type: "webhook.sent",
        entity: "ch_1234567890",
        result: "error",
        message: "Webhook endpoint returned 500"
      }
    ];

    const page = filters.page ?? 1;
    const size = filters.size ?? 25;
    const start = (page - 1) * size;
    const end = start + size;

    return {
      data: mockLogs.slice(start, end),
      total: mockLogs.length,
      page,
      pages: Math.ceil(mockLogs.length / size)
    };
  }
};