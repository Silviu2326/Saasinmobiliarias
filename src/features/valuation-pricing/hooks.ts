import { useState, useEffect, useCallback, useMemo } from 'react';
import * as api from './apis';
import type {
  Subject,
  Recommendation,
  ElasticityAnalysis,
  DomCurve,
  OfferSimulation,
  NetWaterfall,
  CompetitorRecord,
  MarketBands,
  ChannelRule,
  ChannelPreview,
  Scenario,
  PricePlan,
  AuditEvent,
  Goal,
  Constraints,
  Alert,
  ExportOptions
} from './types';

export const usePricing = (propertyId: string) => {
  const [subject, setSubject] = useState<Subject | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!propertyId) return;
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [subjectData, recsData] = await Promise.all([
          api.getSubject(propertyId),
          api.getRecommendations(propertyId)
        ]);
        setSubject(subjectData);
        setRecommendations(recsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading pricing data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [propertyId]);

  const refreshFromAvm = useCallback(async () => {
    if (!propertyId) return;
    setLoading(true);
    try {
      const updated = await api.refreshFromAvm(propertyId);
      setSubject(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error refreshing AVM');
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  const getSuggestions = useCallback(async (goal: Goal, constraints: Constraints) => {
    if (!subject) return [];
    setLoading(true);
    try {
      const suggestions = await api.getSuggestions({
        subject,
        goal,
        constraints
      });
      setRecommendations(suggestions);
      return suggestions;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error getting suggestions');
      return [];
    } finally {
      setLoading(false);
    }
  }, [subject]);

  return {
    subject,
    recommendations,
    loading,
    error,
    refreshFromAvm,
    getSuggestions
  };
};

export const useElasticity = (subject: Subject | null) => {
  const [analysis, setAnalysis] = useState<ElasticityAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!subject) return;
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getElasticity(subject);
        setAnalysis(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading elasticity');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [subject]);

  return { analysis, loading, error };
};

export const useDomCurve = (subject: Subject | null) => {
  const [curve, setCurve] = useState<DomCurve | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!subject) return;
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getDomCurve(subject);
        setCurve(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading DOM curve');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [subject]);

  return { curve, loading, error };
};

export const useOfferSimulator = () => {
  const [simulation, setSimulation] = useState<OfferSimulation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const simulate = useCallback(async (params: {
    price: number;
    strategy: Goal;
    constraints: Constraints;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.simulateOffers(params);
      setSimulation(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error simulating offers');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { simulation, simulate, loading, error };
};

export const useNetWaterfall = (price: number) => {
  const [waterfall, setWaterfall] = useState<NetWaterfall | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!price) return;
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getNetWaterfall(price);
        setWaterfall(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error calculating waterfall');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [price]);

  return { waterfall, loading, error };
};

export const useCompetitors = (filters: {
  lat?: number;
  lng?: number;
  radius?: number;
  type?: string;
  sqm?: number;
  state?: string;
}) => {
  const [competitors, setCompetitors] = useState<CompetitorRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getCompetitors(filters);
        setCompetitors(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading competitors');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters.lat, filters.lng, filters.radius, filters.type, filters.sqm, filters.state]);

  const watchCompetitor = useCallback(async (competitorId: string) => {
    try {
      await api.watchCompetitor(competitorId);
      // Update local state if needed
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error watching competitor');
    }
  }, []);

  return { competitors, loading, error, watchCompetitor };
};

export const useBands = (area: { lat: number; lng: number; type: string }) => {
  const [bands, setBands] = useState<MarketBands | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!area.lat || !area.lng) return;
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getBands(area);
        setBands(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading market bands');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [area.lat, area.lng, area.type]);

  return { bands, loading, error };
};

export const useChannels = () => {
  const [channels, setChannels] = useState<ChannelRule[]>([]);
  const [previews, setPreviews] = useState<ChannelPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getChannels();
        setChannels(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading channels');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const preview = useCallback(async (price: number, channelIds: string[]) => {
    setLoading(true);
    try {
      const data = await api.previewChannels({ price, channelIds });
      setPreviews(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error previewing channels');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const apply = useCallback(async (price: number, channelIds: string[]) => {
    setLoading(true);
    try {
      const result = await api.applyToChannels({ price, channelIds });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error applying to channels');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { channels, previews, preview, apply, loading, error };
};

export const useScenarios = () => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getScenarios();
        setScenarios(data);
        const baseline = data.find(s => s.isBaseline);
        if (baseline) setActiveScenario(baseline);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading scenarios');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const createScenario = useCallback(async (scenario: Omit<Scenario, 'id' | 'createdAt' | 'lastModified'>) => {
    setLoading(true);
    try {
      const created = await api.createScenario(scenario);
      setScenarios(prev => [...prev, created]);
      return created;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating scenario');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateScenario = useCallback(async (id: string, updates: Partial<Scenario>) => {
    setLoading(true);
    try {
      const updated = await api.updateScenario(id, updates);
      setScenarios(prev => prev.map(s => s.id === id ? updated : s));
      if (activeScenario?.id === id) setActiveScenario(updated);
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating scenario');
      return null;
    } finally {
      setLoading(false);
    }
  }, [activeScenario]);

  const deleteScenario = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await api.deleteScenario(id);
      setScenarios(prev => prev.filter(s => s.id !== id));
      if (activeScenario?.id === id) setActiveScenario(null);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting scenario');
      return false;
    } finally {
      setLoading(false);
    }
  }, [activeScenario]);

  const compareScenarios = useCallback((scenarioIds: string[]) => {
    return scenarios.filter(s => scenarioIds.includes(s.id));
  }, [scenarios]);

  return {
    scenarios,
    activeScenario,
    setActiveScenario,
    createScenario,
    updateScenario,
    deleteScenario,
    compareScenarios,
    loading,
    error
  };
};

export const usePricePlan = (propertyId?: string) => {
  const [plan, setPlan] = useState<PricePlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!propertyId) return;
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getPricePlan(propertyId);
        setPlan(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading price plan');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [propertyId]);

  const createPlan = useCallback(async (newPlan: Omit<PricePlan, 'id' | 'createdAt' | 'lastUpdated'>) => {
    setLoading(true);
    try {
      const created = await api.createPricePlan(newPlan);
      setPlan(created);
      return created;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating price plan');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePlan = useCallback(async (updates: Partial<PricePlan>) => {
    if (!plan) return null;
    setLoading(true);
    try {
      const updated = await api.updatePricePlan(plan.id, updates);
      setPlan(updated);
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating price plan');
      return null;
    } finally {
      setLoading(false);
    }
  }, [plan]);

  const executeStep = useCallback(async (stepIndex: number) => {
    if (!plan) return false;
    setLoading(true);
    try {
      const result = await api.executePriceStep(plan.id, stepIndex);
      if (result) {
        const updated = await api.getPricePlan(plan.propertyId);
        setPlan(updated);
      }
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error executing price step');
      return false;
    } finally {
      setLoading(false);
    }
  }, [plan]);

  return {
    plan,
    createPlan,
    updatePlan,
    executeStep,
    loading,
    error
  };
};

export const useAudit = (propertyId?: string) => {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!propertyId) return;
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getAuditEvents(propertyId);
        setEvents(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading audit events');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [propertyId]);

  const logEvent = useCallback(async (event: Omit<AuditEvent, 'id' | 'at'>) => {
    try {
      const created = await api.createAuditEvent(event);
      setEvents(prev => [created, ...prev]);
      return created;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error logging audit event');
      return null;
    }
  }, []);

  return { events, logEvent, loading, error };
};

export const useAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const addAlert = useCallback((alert: Omit<Alert, 'id' | 'createdAt'>) => {
    const newAlert: Alert = {
      ...alert,
      id: `alert-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setAlerts(prev => [...prev, newAlert]);
    return newAlert;
  }, []);

  const dismissAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  const acknowledgeAlert = useCallback((id: string, userId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === id 
        ? { ...a, acknowledged: true, acknowledgedBy: userId, acknowledgedAt: new Date().toISOString() }
        : a
    ));
  }, []);

  return { alerts, addAlert, dismissAlert, acknowledgeAlert };
};

export const useExports = () => {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportData = useCallback(async (options: ExportOptions, data: any) => {
    setExporting(true);
    setError(null);
    try {
      const result = await api.exportData(options, data);
      // Trigger download
      const blob = new Blob([result.content], { type: result.mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error exporting data');
      return false;
    } finally {
      setExporting(false);
    }
  }, []);

  return { exportData, exporting, error };
};