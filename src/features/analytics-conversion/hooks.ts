import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ConversionFilters,
  FunnelPoint,
  StageStats,
  TimeStats,
  DropoffReason,
  AttributionRow,
  AttributionModel,
  AgentPerf,
  PortalPerf,
  CohortRow,
  KpiData,
  ExportOptions,
} from "./types";
import {
  fetchConversionFunnel,
  fetchStages,
  fetchTimeToConvert,
  fetchDropoffs,
  fetchAttribution,
  fetchAgentsPerformance,
  fetchPortalsPerformance,
  fetchCohorts,
  exportConversionData,
} from "./apis";
import { validateConversionFilters } from "./schema";

export const useConversionFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const filters: ConversionFilters = {
    from: searchParams.get("from") || undefined,
    to: searchParams.get("to") || undefined,
    canal: searchParams.get("canal") as ConversionFilters["canal"] || undefined,
    campana: searchParams.get("campana") || undefined,
    portal: searchParams.get("portal") || undefined,
    agente: searchParams.get("agente") || undefined,
    equipo: searchParams.get("equipo") || undefined,
    oficina: searchParams.get("oficina") || undefined,
    dispositivo: searchParams.get("dispositivo") as ConversionFilters["dispositivo"] || undefined,
    tipo: searchParams.get("tipo") as ConversionFilters["tipo"] || undefined,
    origen: searchParams.get("origen") as ConversionFilters["origen"] || undefined,
  };
  
  const updateFilters = useCallback((newFilters: Partial<ConversionFilters>) => {
    const validation = validateConversionFilters({ ...filters, ...newFilters });
    
    if (!validation.success) {
      console.error("Invalid filters:", validation.error);
      return;
    }
    
    const params = new URLSearchParams();
    Object.entries({ ...filters, ...newFilters }).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);
  
  const resetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);
  
  return { filters, updateFilters, resetFilters };
};

export const useConversionData = (filters: ConversionFilters) => {
  const [funnel, setFunnel] = useState<FunnelPoint[]>([]);
  const [stages, setStages] = useState<StageStats[]>([]);
  const [timeStats, setTimeStats] = useState<TimeStats[]>([]);
  const [dropoffs, setDropoffs] = useState<DropoffReason[]>([]);
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      
      setLoading(true);
      setError(null);
      
      try {
        const [funnelRes, stagesRes, timeRes, dropoffsRes] = await Promise.all([
          fetchConversionFunnel(filters),
          fetchStages(filters),
          fetchTimeToConvert(filters),
          fetchDropoffs(filters),
        ]);
        
        setFunnel(funnelRes.funnel);
        setKpis(funnelRes.kpis);
        setStages(stagesRes.stages);
        setTimeStats(timeRes.timeStats);
        setDropoffs(dropoffsRes.dropoffs);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setError(err.message || "Error al cargar datos de conversión");
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [filters]);
  
  return { funnel, stages, timeStats, dropoffs, kpis, loading, error };
};

export const useAttribution = (
  filters: ConversionFilters,
  model: AttributionModel = "last"
) => {
  const [data, setData] = useState<AttributionRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetchAttribution({ ...filters, model });
        setData(response.rows);
      } catch (err: any) {
        setError(err.message || "Error al cargar datos de atribución");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [filters, model]);
  
  return { data, loading, error };
};

export const useAgentsPerformance = (filters: ConversionFilters) => {
  const [agents, setAgents] = useState<AgentPerf[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetchAgentsPerformance(filters);
        setAgents(response.agents);
      } catch (err: any) {
        setError(err.message || "Error al cargar rendimiento de agentes");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [filters]);
  
  return { agents, loading, error };
};

export const usePortalsPerformance = (filters: ConversionFilters) => {
  const [portals, setPortals] = useState<PortalPerf[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetchPortalsPerformance(filters);
        setPortals(response.portals);
      } catch (err: any) {
        setError(err.message || "Error al cargar rendimiento de portales");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [filters]);
  
  return { portals, loading, error };
};

export const useCohorts = (filters: ConversionFilters) => {
  const [cohorts, setCohorts] = useState<CohortRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetchCohorts(filters);
        setCohorts(response.cohorts);
      } catch (err: any) {
        setError(err.message || "Error al cargar cohortes");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [filters]);
  
  return { cohorts, loading, error };
};

export const useExport = () => {
  const [exporting, setExporting] = useState(false);
  
  const exportData = useCallback(async (options: ExportOptions) => {
    setExporting(true);
    
    try {
      const response = await exportConversionData(options);
      
      if (response.success && response.url) {
        // Descargar archivo
        const link = document.createElement("a");
        link.href = response.url;
        link.download = options.filename || `conversion-data.${options.format.toLowerCase()}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      return response;
    } catch (err) {
      console.error("Error al exportar:", err);
      throw err;
    } finally {
      setExporting(false);
    }
  }, []);
  
  return { exportData, exporting };
};

export const useSavedViews = () => {
  const [views, setViews] = useState<{ name: string; filters: ConversionFilters }[]>(() => {
    const saved = localStorage.getItem("conversion_views");
    return saved ? JSON.parse(saved) : [];
  });
  
  const saveView = useCallback((name: string, filters: ConversionFilters) => {
    const newViews = [...views, { name, filters }];
    setViews(newViews);
    localStorage.setItem("conversion_views", JSON.stringify(newViews));
  }, [views]);
  
  const deleteView = useCallback((index: number) => {
    const newViews = views.filter((_, i) => i !== index);
    setViews(newViews);
    localStorage.setItem("conversion_views", JSON.stringify(newViews));
  }, [views]);
  
  return { views, saveView, deleteView };
};