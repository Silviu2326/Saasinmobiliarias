import type { StageStyle, StageItem, StageJob, RoomType, CreateStageJobRequest, StagingCredits } from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

const mockStyles: StageStyle[] = [
  {
    id: 'nordic',
    name: 'Nórdico',
    thumb: '/images/styles/nordic.jpg',
    description: 'Estilo minimalista con colores claros y maderas naturales'
  },
  {
    id: 'minimal',
    name: 'Minimalista',
    thumb: '/images/styles/minimal.jpg',
    description: 'Espacios despejados con líneas limpias y funcionales'
  },
  {
    id: 'industrial',
    name: 'Industrial',
    thumb: '/images/styles/industrial.jpg',
    description: 'Materiales en bruto como metal, ladrillo y hormigón'
  },
  {
    id: 'mediterranean',
    name: 'Mediterráneo',
    thumb: '/images/styles/mediterranean.jpg',
    description: 'Colores cálidos inspirados en el mar Mediterráneo'
  },
  {
    id: 'classic',
    name: 'Clásico',
    thumb: '/images/styles/classic.jpg',
    description: 'Elegancia atemporal con muebles tradicionales'
  }
];

const mockItems: Record<RoomType, StageItem[]> = {
  salon: [
    { id: 'sofa-3p', name: 'Sofá 3 plazas', category: 'sofa', preview: '/images/items/sofa-3p.jpg' },
    { id: 'mesa-centro', name: 'Mesa de centro', category: 'mesa', preview: '/images/items/mesa-centro.jpg' },
    { id: 'sillon', name: 'Sillón individual', category: 'silla', preview: '/images/items/sillon.jpg' },
    { id: 'lampara-pie', name: 'Lámpara de pie', category: 'lampara', preview: '/images/items/lampara-pie.jpg' },
    { id: 'cuadros', name: 'Cuadros decorativos', category: 'decor', preview: '/images/items/cuadros.jpg' },
    { id: 'alfombra', name: 'Alfombra', category: 'decor', preview: '/images/items/alfombra.jpg' }
  ],
  cocina: [
    { id: 'mesa-comedor', name: 'Mesa de comedor', category: 'mesa', preview: '/images/items/mesa-comedor.jpg' },
    { id: 'sillas-comedor', name: 'Sillas de comedor', category: 'silla', preview: '/images/items/sillas-comedor.jpg' },
    { id: 'lampara-techo', name: 'Lámpara de techo', category: 'lampara', preview: '/images/items/lampara-techo.jpg' },
    { id: 'plantas', name: 'Plantas decorativas', category: 'decor', preview: '/images/items/plantas.jpg' }
  ],
  dormitorio: [
    { id: 'cama-matrimonio', name: 'Cama de matrimonio', category: 'cama', preview: '/images/items/cama-matrimonio.jpg' },
    { id: 'mesitas-noche', name: 'Mesitas de noche', category: 'mesa', preview: '/images/items/mesitas-noche.jpg' },
    { id: 'armario', name: 'Armario', category: 'decor', preview: '/images/items/armario.jpg' },
    { id: 'lampara-mesita', name: 'Lámparas de mesita', category: 'lampara', preview: '/images/items/lampara-mesita.jpg' }
  ],
  bano: [
    { id: 'espejo', name: 'Espejo', category: 'decor', preview: '/images/items/espejo.jpg' },
    { id: 'toallero', name: 'Toallero', category: 'decor', preview: '/images/items/toallero.jpg' },
    { id: 'plantas-bano', name: 'Plantas de baño', category: 'decor', preview: '/images/items/plantas-bano.jpg' }
  ],
  terraza: [
    { id: 'mesa-exterior', name: 'Mesa de exterior', category: 'mesa', preview: '/images/items/mesa-exterior.jpg' },
    { id: 'sillas-exterior', name: 'Sillas de exterior', category: 'silla', preview: '/images/items/sillas-exterior.jpg' },
    { id: 'plantas-exterior', name: 'Plantas de exterior', category: 'decor', preview: '/images/items/plantas-exterior.jpg' },
    { id: 'sombrilla', name: 'Sombrilla', category: 'decor', preview: '/images/items/sombrilla.jpg' }
  ],
  otro: [
    { id: 'mesa-generica', name: 'Mesa', category: 'mesa', preview: '/images/items/mesa-generica.jpg' },
    { id: 'silla-generica', name: 'Silla', category: 'silla', preview: '/images/items/silla-generica.jpg' },
    { id: 'lampara-generica', name: 'Lámpara', category: 'lampara', preview: '/images/items/lampara-generica.jpg' },
    { id: 'decor-generico', name: 'Decoración', category: 'decor', preview: '/images/items/decor-generico.jpg' }
  ]
};

const mockJobs: StageJob[] = [];

export const virtualStagingApi = {
  async getStyles(): Promise<StageStyle[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockStyles;
  },

  async getItems(roomType: RoomType): Promise<StageItem[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockItems[roomType] || [];
  },

  async createStageJob(data: CreateStageJobRequest): Promise<{ jobId: string }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const inputUrl = data.file ? URL.createObjectURL(data.file) : data.url!;
    
    const job: StageJob = {
      id: jobId,
      inputUrl,
      roomType: data.roomType,
      style: data.style,
      items: data.items,
      resolution: data.resolution,
      status: 'queued',
      createdAt: new Date().toISOString(),
      cost: this.calculateCost(data.resolution, data.items.length)
    };

    mockJobs.push(job);

    setTimeout(() => {
      const jobIndex = mockJobs.findIndex(j => j.id === jobId);
      if (jobIndex !== -1) {
        mockJobs[jobIndex].status = 'processing';
      }
    }, 1000);

    setTimeout(() => {
      const jobIndex = mockJobs.findIndex(j => j.id === jobId);
      if (jobIndex !== -1) {
        mockJobs[jobIndex].status = 'done';
        mockJobs[jobIndex].resultUrl = `/images/results/staging_${data.roomType}_${data.style}_${Date.now()}.jpg`;
      }
    }, 5000);

    return { jobId };
  },

  async getJobs(status?: string): Promise<StageJob[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    if (status) {
      return mockJobs.filter(job => job.status === status);
    }
    return [...mockJobs].reverse();
  },

  async getJob(id: string): Promise<StageJob | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockJobs.find(job => job.id === id) || null;
  },

  async cancelJob(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const jobIndex = mockJobs.findIndex(job => job.id === id);
    if (jobIndex !== -1 && mockJobs[jobIndex].status !== 'done') {
      mockJobs[jobIndex].status = 'failed';
    }
  },

  async getCredits(): Promise<StagingCredits> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      current: 150,
      total: 200,
      costPerJob: {
        '1k': 5,
        '2k': 10,
        '4k': 20
      }
    };
  },

  calculateCost(resolution: string, itemsCount: number): number {
    const baseCosts = { '1k': 5, '2k': 10, '4k': 20 };
    const baseCost = baseCosts[resolution as keyof typeof baseCosts] || 10;
    return baseCost + Math.floor(itemsCount / 3);
  },

  async detectRoomType(file: File | string): Promise<{ roomType: RoomType; confidence: number }> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const roomTypes: RoomType[] = ['salon', 'cocina', 'dormitorio', 'bano', 'terraza'];
    const randomRoomType = roomTypes[Math.floor(Math.random() * roomTypes.length)];
    return {
      roomType: randomRoomType,
      confidence: 0.75 + Math.random() * 0.2
    };
  }
};