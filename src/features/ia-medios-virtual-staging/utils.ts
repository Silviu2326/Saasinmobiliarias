import type { Resolution, RoomType, StageStyle } from './types';

export const estimateCost = (
  style: StageStyle['id'], 
  resolution: Resolution, 
  itemsCount: number
): number => {
  const baseCosts = { '1k': 5, '2k': 10, '4k': 20 };
  const styleCosts = {
    'nordic': 0,
    'minimal': 0,
    'industrial': 2,
    'mediterranean': 1,
    'classic': 3
  };
  
  const baseCost = baseCosts[resolution];
  const styleCost = styleCosts[style];
  const itemsCost = Math.floor(itemsCount / 3);
  
  return baseCost + styleCost + itemsCost;
};

export const generateOutputFilename = (
  roomType: RoomType, 
  style: StageStyle['id'], 
  timestamp?: number
): string => {
  const ts = timestamp || Date.now();
  return `staging_${roomType}_${style}_${ts}.jpg`;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Formato no válido. Usa JPG, PNG o WebP.' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'Archivo muy grande. Máximo 10MB.' };
  }
  
  return { valid: true };
};

export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Error al cargar la imagen'));
    };
    
    img.src = url;
  });
};

export const resolutionToPixels = (resolution: Resolution): { width: number; height: number } => {
  switch (resolution) {
    case '1k':
      return { width: 1024, height: 768 };
    case '2k':
      return { width: 2048, height: 1536 };
    case '4k':
      return { width: 4096, height: 3072 };
    default:
      return { width: 2048, height: 1536 };
  }
};

export const getRoomTypeLabel = (roomType: RoomType): string => {
  const labels = {
    'salon': 'Salón',
    'cocina': 'Cocina',
    'dormitorio': 'Dormitorio',
    'bano': 'Baño',
    'terraza': 'Terraza',
    'otro': 'Otro'
  };
  
  return labels[roomType];
};

export const getStatusLabel = (status: string): string => {
  const labels = {
    'queued': 'En cola',
    'processing': 'Procesando',
    'done': 'Completado',
    'failed': 'Fallido'
  };
  
  return labels[status as keyof typeof labels] || status;
};

export const getStatusColor = (status: string): string => {
  const colors = {
    'queued': 'text-yellow-600',
    'processing': 'text-blue-600',
    'done': 'text-green-600',
    'failed': 'text-red-600'
  };
  
  return colors[status as keyof typeof colors] || 'text-gray-600';
};

export const downloadImage = async (url: string, filename: string): Promise<void> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('Error downloading image:', error);
    throw new Error('Error al descargar la imagen');
  }
};

export const compressImage = (
  file: File, 
  maxWidth: number = 1920, 
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        } else {
          resolve(file);
        }
      }, file.type, quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};