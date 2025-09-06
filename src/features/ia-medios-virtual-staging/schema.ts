import type { RoomType, Style, Resolution } from './types';

interface ValidationResult {
  success: boolean;
  errors: string[];
  data?: any;
}

const ROOM_TYPES: RoomType[] = ['salon', 'cocina', 'dormitorio', 'bano', 'terraza', 'otro'];
const STYLES: Style[] = ['nordic', 'minimal', 'industrial', 'mediterranean', 'classic'];
const RESOLUTIONS: Resolution[] = ['1k', '2k', '4k'];

function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

export interface CreateStageJobSchema {
  file?: File;
  url?: string;
  roomType: RoomType;
  style: Style;
  items: string[];
  resolution: Resolution;
}

export interface RoomTypeDetectionSchema {
  file?: File;
  url?: string;
}

export interface StagingQuerySchema {
  photoUrl?: string;
  roomType?: RoomType;
  style?: Style;
}

export function validateCreateStageJob(data: any): ValidationResult {
  const errors: string[] = [];

  // Check if file or url is provided
  if (!data.file && !data.url) {
    errors.push('Se requiere una imagen (archivo o URL)');
  }

  // Validate file if provided
  if (data.file && !(data.file instanceof File)) {
    errors.push('El archivo debe ser una instancia de File');
  }

  // Validate URL if provided
  if (data.url && (!data.url || typeof data.url !== 'string' || !isValidUrl(data.url))) {
    errors.push('La URL debe ser válida');
  }

  // Validate roomType
  if (!data.roomType || !ROOM_TYPES.includes(data.roomType)) {
    errors.push(`roomType debe ser uno de: ${ROOM_TYPES.join(', ')}`);
  }

  // Validate style
  if (!data.style || !STYLES.includes(data.style)) {
    errors.push(`style debe ser uno de: ${STYLES.join(', ')}`);
  }

  // Validate items
  if (!Array.isArray(data.items)) {
    errors.push('items debe ser un array');
  } else if (data.items.length > 12) {
    errors.push('Máximo 12 items permitidos');
  } else if (!data.items.every((item: any) => typeof item === 'string')) {
    errors.push('Todos los items deben ser strings');
  }

  // Validate resolution (with default)
  const resolution = data.resolution || '2k';
  if (!RESOLUTIONS.includes(resolution)) {
    errors.push(`resolution debe ser uno de: ${RESOLUTIONS.join(', ')}`);
  }

  const validatedData: CreateStageJobSchema = {
    ...(data.file && { file: data.file }),
    ...(data.url && { url: data.url }),
    roomType: data.roomType,
    style: data.style,
    items: data.items || [],
    resolution: resolution as Resolution
  };

  return {
    success: errors.length === 0,
    errors,
    data: errors.length === 0 ? validatedData : undefined
  };
}

export function validateRoomTypeDetection(data: any): ValidationResult {
  const errors: string[] = [];

  // Check if file or url is provided
  if (!data.file && !data.url) {
    errors.push('Se requiere una imagen para detectar el tipo de estancia');
  }

  // Validate file if provided
  if (data.file && !(data.file instanceof File)) {
    errors.push('El archivo debe ser una instancia de File');
  }

  // Validate URL if provided
  if (data.url && (!data.url || typeof data.url !== 'string' || !isValidUrl(data.url))) {
    errors.push('La URL debe ser válida');
  }

  const validatedData: RoomTypeDetectionSchema = {
    ...(data.file && { file: data.file }),
    ...(data.url && { url: data.url })
  };

  return {
    success: errors.length === 0,
    errors,
    data: errors.length === 0 ? validatedData : undefined
  };
}

export function validateStagingQuery(data: any): ValidationResult {
  const errors: string[] = [];

  // Validate photoUrl if provided
  if (data.photoUrl && (!data.photoUrl || typeof data.photoUrl !== 'string' || !isValidUrl(data.photoUrl))) {
    errors.push('photoUrl debe ser una URL válida');
  }

  // Validate roomType if provided
  if (data.roomType && !ROOM_TYPES.includes(data.roomType)) {
    errors.push(`roomType debe ser uno de: ${ROOM_TYPES.join(', ')}`);
  }

  // Validate style if provided
  if (data.style && !STYLES.includes(data.style)) {
    errors.push(`style debe ser uno de: ${STYLES.join(', ')}`);
  }

  const validatedData: StagingQuerySchema = {
    ...(data.photoUrl && { photoUrl: data.photoUrl }),
    ...(data.roomType && { roomType: data.roomType }),
    ...(data.style && { style: data.style })
  };

  return {
    success: errors.length === 0,
    errors,
    data: errors.length === 0 ? validatedData : undefined
  };
}

// Helper functions for validation
export function isValidRoomType(value: any): value is RoomType {
  return typeof value === 'string' && ROOM_TYPES.includes(value as RoomType);
}

export function isValidStyle(value: any): value is Style {
  return typeof value === 'string' && STYLES.includes(value as Style);
}

export function isValidResolution(value: any): value is Resolution {
  return typeof value === 'string' && RESOLUTIONS.includes(value as Resolution);
}

export { ROOM_TYPES, STYLES, RESOLUTIONS };