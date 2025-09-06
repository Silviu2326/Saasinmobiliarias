import type { RoomType } from './types';

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
export const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB in bytes

export const ROOM_TYPES: RoomType[] = ['salon', 'cocina', 'dormitorio', 'bano', 'terraza', 'otro'];

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateImageFile(file: File): ValidationResult {
  const errors: string[] = [];

  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    errors.push(`Formato no permitido. Tipos permitidos: ${ALLOWED_EXTENSIONS.join(', ')}`);
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
    errors.push(`Archivo muy grande. Tamaño máximo: ${maxSizeMB}MB`);
  }

  // Check if file is empty
  if (file.size === 0) {
    errors.push('El archivo está vacío');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateImageUrl(url: string): ValidationResult {
  const errors: string[] = [];

  if (!url || url.trim() === '') {
    errors.push('URL es requerida');
    return { valid: false, errors };
  }

  try {
    const urlObj = new URL(url);
    
    // Check if it's HTTP/HTTPS
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      errors.push('La URL debe usar protocolo HTTP o HTTPS');
    }

    // Check if URL ends with image extension
    const pathname = urlObj.pathname.toLowerCase();
    const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => 
      pathname.endsWith(`.${ext}`)
    );

    if (!hasValidExtension) {
      errors.push(`La URL debe terminar con una extensión de imagen válida: ${ALLOWED_EXTENSIONS.join(', ')}`);
    }

  } catch (error) {
    errors.push('URL no válida');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateRoomType(roomType?: string): ValidationResult {
  const errors: string[] = [];

  if (roomType && !ROOM_TYPES.includes(roomType as RoomType)) {
    errors.push(`Tipo de habitación no válido. Tipos permitidos: ${ROOM_TYPES.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateBatchFiles(files: File[]): ValidationResult {
  const errors: string[] = [];

  if (files.length === 0) {
    errors.push('Debe seleccionar al menos un archivo');
    return { valid: false, errors };
  }

  if (files.length > 20) {
    errors.push('Máximo 20 archivos por lote');
  }

  // Validate each file
  files.forEach((file, index) => {
    const fileValidation = validateImageFile(file);
    if (!fileValidation.valid) {
      errors.push(`Archivo ${index + 1} (${file.name}): ${fileValidation.errors.join(', ')}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function isValidImageType(type: string): boolean {
  return ALLOWED_IMAGE_TYPES.includes(type);
}

export function isValidFileSize(size: number): boolean {
  return size <= MAX_FILE_SIZE && size > 0;
}