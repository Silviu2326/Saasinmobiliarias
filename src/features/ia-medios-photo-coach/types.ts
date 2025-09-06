export type IssueCode = 'lighting' | 'tilt' | 'crop' | 'noise' | 'clutter' | 'lowres';

export type IssueSeverity = 'low' | 'med' | 'high';

export type RoomType = 'salon' | 'cocina' | 'dormitorio' | 'bano' | 'terraza' | 'otro';

export interface PhotoIssue {
  code: IssueCode;
  severity: IssueSeverity;
  message: string;
  hints: string[];
}

export interface PhotoAnalysis {
  id: string;
  url: string;
  roomType?: RoomType;
  score: number;
  issues: PhotoIssue[];
  suggestions: string[];
  createdAt: string;
}

export interface BatchResult {
  id: string;
  filename: string;
  analysis: PhotoAnalysis;
  status?: 'pending' | 'analyzing' | 'completed' | 'error';
  error?: string;
}

export interface AnalyzePhotoRequest {
  file?: File;
  url?: string;
  roomType?: RoomType;
  useGuidelines?: boolean;
}

export interface BatchAnalyzeRequest {
  files: File[];
  roomType?: RoomType;
  useGuidelines?: boolean;
}

export interface PhotoPreset {
  id: string;
  name: string;
  roomType: RoomType;
  rules: {
    code: IssueCode;
    weight: number;
    threshold: number;
  }[];
  checklist: {
    item: string;
    priority: 'high' | 'medium' | 'low';
    tip: string;
  }[];
}

export interface AnalysisFilters {
  roomType?: RoomType | 'all';
  minScore?: number;
  maxScore?: number;
  hasIssues?: boolean;
  sortBy?: 'score' | 'createdAt' | 'filename';
  sortOrder?: 'asc' | 'desc';
}

export interface BatchProgress {
  total: number;
  completed: number;
  current?: string;
  results: BatchResult[];
}

export interface FixAction {
  id: string;
  issueCode: IssueCode;
  action: string;
  completed: boolean;
  note?: string;
}