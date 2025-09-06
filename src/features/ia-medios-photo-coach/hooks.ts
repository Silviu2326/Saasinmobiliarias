import { useState, useCallback } from 'react';
import type { 
  PhotoAnalysis, 
  BatchResult, 
  AnalyzePhotoRequest, 
  BatchAnalyzeRequest,
  BatchProgress 
} from './types';
import { photoCoachApi } from './apis';

interface UseAnalyzePhotoState {
  loading: boolean;
  error: string | null;
  data: PhotoAnalysis | null;
}

export function useAnalyzePhoto() {
  const [state, setState] = useState<UseAnalyzePhotoState>({
    loading: false,
    error: null,
    data: null
  });

  const analyze = useCallback(async (request: AnalyzePhotoRequest) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const analysis = await photoCoachApi.analyzePhoto(request);
      setState({
        loading: false,
        error: null,
        data: analysis
      });
      return analysis;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al analizar la foto';
      setState({
        loading: false,
        error: errorMessage,
        data: null
      });
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      data: null
    });
  }, []);

  return {
    ...state,
    analyze,
    reset
  };
}

interface UseBatchAnalyzeState {
  loading: boolean;
  error: string | null;
  progress: BatchProgress;
  completed: boolean;
}

export function useBatchAnalyze() {
  const [state, setState] = useState<UseBatchAnalyzeState>({
    loading: false,
    error: null,
    progress: { total: 0, completed: 0, results: [] },
    completed: false
  });

  const analyzeFiles = useCallback(async (
    request: BatchAnalyzeRequest,
    onProgress?: (progress: BatchProgress) => void
  ) => {
    setState({
      loading: true,
      error: null,
      progress: { 
        total: request.files.length, 
        completed: 0, 
        results: [] 
      },
      completed: false
    });

    try {
      const results: BatchResult[] = [];
      
      for (let i = 0; i < request.files.length; i++) {
        const file = request.files[i];
        
        // Update progress to show current file being processed
        const currentProgress = {
          total: request.files.length,
          completed: i,
          current: file.name,
          results: [...results]
        };
        
        setState(prev => ({ ...prev, progress: currentProgress }));
        onProgress?.(currentProgress);

        try {
          // Analyze single file
          const singleRequest: AnalyzePhotoRequest = {
            file,
            roomType: request.roomType,
            useGuidelines: request.useGuidelines
          };
          
          const analysis = await photoCoachApi.analyzePhoto(singleRequest);
          
          const result: BatchResult = {
            id: `batch-${Date.now()}-${i}`,
            filename: file.name,
            analysis,
            status: 'completed'
          };
          
          results.push(result);
          
        } catch (error) {
          const errorResult: BatchResult = {
            id: `batch-${Date.now()}-${i}`,
            filename: file.name,
            analysis: {} as PhotoAnalysis,
            status: 'error',
            error: error instanceof Error ? error.message : 'Error al procesar la imagen'
          };
          
          results.push(errorResult);
        }
      }

      // Final state update
      const finalProgress = {
        total: request.files.length,
        completed: request.files.length,
        results
      };

      setState({
        loading: false,
        error: null,
        progress: finalProgress,
        completed: true
      });

      onProgress?.(finalProgress);
      return results;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error en el análisis por lotes';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      progress: { total: 0, completed: 0, results: [] },
      completed: false
    });
  }, []);

  const addResult = useCallback((result: BatchResult) => {
    setState(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        results: [...prev.progress.results, result]
      }
    }));
  }, []);

  return {
    ...state,
    analyzeFiles,
    reset,
    addResult
  };
}

interface UseImagePreviewState {
  preview: string | null;
  loading: boolean;
  error: string | null;
}

export function useImagePreview() {
  const [state, setState] = useState<UseImagePreviewState>({
    preview: null,
    loading: false,
    error: null
  });

  const generatePreview = useCallback((file: File) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        setState({
          preview: e.target?.result as string,
          loading: false,
          error: null
        });
      };

      reader.onerror = () => {
        setState({
          preview: null,
          loading: false,
          error: 'Error al cargar la vista previa'
        });
      };

      reader.readAsDataURL(file);
    } catch (error) {
      setState({
        preview: null,
        loading: false,
        error: 'Error al procesar el archivo'
      });
    }
  }, []);

  const setPreviewUrl = useCallback((url: string) => {
    setState({
      preview: url,
      loading: false,
      error: null
    });
  }, []);

  const clearPreview = useCallback(() => {
    setState({
      preview: null,
      loading: false,
      error: null
    });
  }, []);

  return {
    ...state,
    generatePreview,
    setPreviewUrl,
    clearPreview
  };
}

export function usePhotoPresets() {
  const [state, setState] = useState<{
    loading: boolean;
    error: string | null;
    presets: any[];
  }>({
    loading: false,
    error: null,
    presets: []
  });

  const loadPresets = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const presets = await photoCoachApi.getPresets();
      setState({
        loading: false,
        error: null,
        presets
      });
      return presets;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar presets';
      setState({
        loading: false,
        error: errorMessage,
        presets: []
      });
      throw error;
    }
  }, []);

  return {
    ...state,
    loadPresets
  };
}