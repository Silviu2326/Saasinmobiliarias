export type StageStyle = {
  id: 'nordic' | 'minimal' | 'industrial' | 'mediterranean' | 'classic';
  name: string;
  thumb: string;
  description?: string;
};

export type StageItem = {
  id: string;
  name: string;
  category: 'sofa' | 'mesa' | 'silla' | 'cama' | 'lampara' | 'decor';
  preview?: string;
  roomTypes?: RoomType[];
};

export type RoomType = 'salon' | 'cocina' | 'dormitorio' | 'bano' | 'terraza' | 'otro';

export type JobStatus = 'queued' | 'processing' | 'done' | 'failed';

export type Resolution = '1k' | '2k' | '4k';

export type StageJob = {
  id: string;
  inputUrl: string;
  roomType: RoomType;
  style: StageStyle['id'];
  items: StageItem['id'][];
  resolution: Resolution;
  status: JobStatus;
  resultUrl?: string;
  createdAt: string;
  cost?: number;
};

export type CreateStageJobRequest = {
  file?: File;
  url?: string;
  roomType: RoomType;
  style: StageStyle['id'];
  items: StageItem['id'][];
  resolution: Resolution;
};

export type StagingCredits = {
  current: number;
  total: number;
  costPerJob: Record<Resolution, number>;
};