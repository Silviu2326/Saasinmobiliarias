export interface KPICategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface KPIMetric {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  formula: string;
  unit: string;
  target?: number;
  currentValue: number;
  previousValue: number;
  changePercentage: number;
  trend: 'up' | 'down' | 'stable';
  status: 'excellent' | 'good' | 'warning' | 'critical';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

export interface KPIDashboard {
  id: string;
  name: string;
  description?: string;
  categoryIds: string[];
  layout: KPILayout[];
  isDefault: boolean;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface KPILayout {
  id: string;
  metricId: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  displayType: 'card' | 'chart' | 'gauge' | 'table';
  chartType?: 'line' | 'bar' | 'pie' | 'doughnut' | 'area';
  refreshInterval?: number; // in seconds
}

export interface KPITimeSeries {
  metricId: string;
  dataPoints: KPIDataPoint[];
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  startDate: string;
  endDate: string;
}

export interface KPIDataPoint {
  timestamp: string;
  value: number;
  target?: number;
  metadata?: Record<string, any>;
}

export interface KPIGoal {
  id: string;
  metricId: string;
  name: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  startDate: string;
  endDate: string;
  progress: number; // 0-100
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KPIAnalysis {
  metricId: string;
  period: string;
  insights: KPIInsight[];
  recommendations: KPIRecommendation[];
  riskFactors: KPIRiskFactor[];
  createdAt: string;
}

export interface KPIInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'correlation' | 'forecast';
  title: string;
  description: string;
  confidence: number; // 0-100
  impact: 'low' | 'medium' | 'high';
  data: Record<string, any>;
}

export interface KPIRecommendation {
  id: string;
  title: string;
  description: string;
  action: string;
  expectedImpact: number;
  effort: 'low' | 'medium' | 'high';
  priority: 'low' | 'medium' | 'high' | 'critical';
  deadline?: string;
}

export interface KPIRiskFactor {
  id: string;
  name: string;
  description: string;
  probability: number; // 0-100
  impact: 'low' | 'medium' | 'high' | 'critical';
  mitigation: string;
  status: 'active' | 'mitigated' | 'monitoring';
}

export interface KPIBenchmark {
  id: string;
  metricId: string;
  industry: string;
  companySize: string;
  region: string;
  benchmarkValue: number;
  percentile: number; // 0-100
  dataSource: string;
  lastUpdated: string;
}

export interface KPIFilter {
  categoryIds?: string[];
  timeRange?: {
    start: string;
    end: string;
  };
  frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  status?: 'excellent' | 'good' | 'warning' | 'critical';
  trend?: 'up' | 'down' | 'stable';
  search?: string;
}

export interface KPIDashboardConfig {
  theme: 'light' | 'dark' | 'auto';
  refreshInterval: number; // in seconds
  showTargets: boolean;
  showTrends: boolean;
  showBenchmarks: boolean;
  chartAnimations: boolean;
  exportFormats: ('pdf' | 'png' | 'csv' | 'excel')[];
}

export interface KPINotification {
  id: string;
  metricId: string;
  type: 'threshold' | 'trend' | 'anomaly' | 'goal';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  isRead: boolean;
  createdAt: string;
  expiresAt?: string;
}

export interface KPISummary {
  totalMetrics: number;
  excellentCount: number;
  goodCount: number;
  warningCount: number;
  criticalCount: number;
  overallHealth: number; // 0-100
  trendingUp: number;
  trendingDown: number;
  stable: number;
  lastUpdated: string;
}

export interface KPITimeRange {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCustom: boolean;
  isDefault: boolean;
}

export interface KPIMetricFormData {
  categoryId: string;
  name: string;
  description?: string;
  formula: string;
  unit: string;
  target?: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

export interface KPIGoalFormData {
  metricId: string;
  name: string;
  description?: string;
  targetValue: number;
  startDate: string;
  endDate: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
}

export interface KPIDashboardFormData {
  name: string;
  description?: string;
  categoryIds: string[];
  isPublic: boolean;
}


