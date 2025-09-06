import { useState, useEffect, useCallback } from 'react';
import { pixelService, Pixel, PixelEvent, CreatePixelRequest, UpdatePixelRequest } from '../services/pixelService';

interface UsePixelReturn {
  pixels: Pixel[];
  selectedPixel: Pixel | null;
  events: PixelEvent[];
  isLoading: boolean;
  isTestingConnection: boolean;
  error: string | null;
  connectionTestResult: { isConnected: boolean; message: string } | null;
  
  // Actions
  loadPixels: () => Promise<void>;
  selectPixel: (pixel: Pixel | null) => void;
  createPixel: (data: CreatePixelRequest) => Promise<Pixel>;
  updatePixel: (id: string, data: UpdatePixelRequest) => Promise<Pixel>;
  deletePixel: (id: string) => Promise<void>;
  loadEvents: (pixelId: string) => Promise<void>;
  testConnection: (pixelId: string) => Promise<void>;
  clearError: () => void;
}

export const usePixel = (): UsePixelReturn => {
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [selectedPixel, setSelectedPixel] = useState<Pixel | null>(null);
  const [events, setEvents] = useState<PixelEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionTestResult, setConnectionTestResult] = useState<{ isConnected: boolean; message: string } | null>(null);

  const loadPixels = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await pixelService.getPixels();
      setPixels(data);
    } catch (err) {
      setError('Error al cargar los píxeles');
      console.error('Error loading pixels:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectPixel = useCallback((pixel: Pixel | null) => {
    setSelectedPixel(pixel);
    setEvents([]);
    setConnectionTestResult(null);
    
    if (pixel) {
      loadEvents(pixel.id);
    }
  }, []);

  const createPixel = useCallback(async (data: CreatePixelRequest): Promise<Pixel> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newPixel = await pixelService.createPixel(data);
      setPixels(prev => [...prev, newPixel]);
      return newPixel;
    } catch (err) {
      setError('Error al crear el píxel');
      console.error('Error creating pixel:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePixel = useCallback(async (id: string, data: UpdatePixelRequest): Promise<Pixel> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedPixel = await pixelService.updatePixel(id, data);
      setPixels(prev => prev.map(pixel => 
        pixel.id === id ? updatedPixel : pixel
      ));
      
      if (selectedPixel?.id === id) {
        setSelectedPixel(updatedPixel);
      }
      
      return updatedPixel;
    } catch (err) {
      setError('Error al actualizar el píxel');
      console.error('Error updating pixel:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [selectedPixel]);

  const deletePixel = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await pixelService.deletePixel(id);
      setPixels(prev => prev.filter(pixel => pixel.id !== id));
      
      if (selectedPixel?.id === id) {
        setSelectedPixel(null);
        setEvents([]);
      }
    } catch (err) {
      setError('Error al eliminar el píxel');
      console.error('Error deleting pixel:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [selectedPixel]);

  const loadEvents = useCallback(async (pixelId: string): Promise<void> => {
    try {
      const data = await pixelService.getPixelEvents(pixelId);
      setEvents(data);
    } catch (err) {
      setError('Error al cargar los eventos');
      console.error('Error loading events:', err);
    }
  }, []);

  const testConnection = useCallback(async (pixelId: string): Promise<void> => {
    setIsTestingConnection(true);
    setConnectionTestResult(null);
    setError(null);
    
    try {
      const result = await pixelService.testPixelConnection(pixelId);
      setConnectionTestResult(result);
    } catch (err) {
      setError('Error al probar la conexión del píxel');
      console.error('Error testing pixel connection:', err);
    } finally {
      setIsTestingConnection(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-refresh events every 30 seconds for selected pixel
  useEffect(() => {
    if (!selectedPixel) return;

    const interval = setInterval(() => {
      loadEvents(selectedPixel.id);
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedPixel, loadEvents]);

  // Load pixels on mount
  useEffect(() => {
    loadPixels();
  }, [loadPixels]);

  return {
    pixels,
    selectedPixel,
    events,
    isLoading,
    isTestingConnection,
    error,
    connectionTestResult,
    loadPixels,
    selectPixel,
    createPixel,
    updatePixel,
    deletePixel,
    loadEvents,
    testConnection,
    clearError
  };
};