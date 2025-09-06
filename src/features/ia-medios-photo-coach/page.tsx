import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PhotoCoachUploader from './components/PhotoCoachUploader';
import PhotoQualityMeter from './components/PhotoQualityMeter';
import PhotoIssuesList from './components/PhotoIssuesList';
import PhotoFixChecklist from './components/PhotoFixChecklist';
import ResultPreview from './components/ResultPreview';
import PhotoBatchTable from './components/PhotoBatchTable';
import type { RoomType, PhotoAnalysis, BatchResult } from './types';
import { useAnalyzePhoto, useBatchAnalyze, useImagePreview } from './hooks';

type ViewMode = 'single' | 'batch';

export default function PhotoCoachPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // URL parameters
  const roomTypeParam = searchParams.get('roomType') as RoomType | null;
  const sourceParam = searchParams.get('source');
  const modeParam = searchParams.get('mode') as ViewMode | null;
  
  // State
  const [mode, setMode] = useState<ViewMode>(modeParam || 'single');
  const [useGuidelines, setUseGuidelines] = useState(true);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

  // Hooks
  const singleAnalysis = useAnalyzePhoto();
  const batchAnalysis = useBatchAnalyze();
  const imagePreview = useImagePreview();

  // Initialize from URL params
  useEffect(() => {
    if (sourceParam === 'url') {
      // Could initialize with URL from params if provided
    }
  }, [sourceParam]);

  const handleSingleFileSelect = async (file: File, roomType?: RoomType) => {
    try {
      // Generate preview
      imagePreview.generatePreview(file);
      
      // Update URL params
      updateUrlParams({ roomType, mode: 'single' });
      
      // Analyze photo
      await singleAnalysis.analyze({
        file,
        roomType,
        useGuidelines
      });
    } catch (error) {
      console.error('Error analyzing photo:', error);
    }
  };

  const handleUrlSubmit = async (url: string, roomType?: RoomType) => {
    try {
      // Set preview URL
      imagePreview.setPreviewUrl(url);
      setCurrentImageUrl(url);
      
      // Update URL params
      updateUrlParams({ roomType, mode: 'single', source: 'url' });
      
      // Analyze photo
      await singleAnalysis.analyze({
        url,
        roomType,
        useGuidelines
      });
    } catch (error) {
      console.error('Error analyzing photo from URL:', error);
    }
  };

  const handleBatchSelect = async (files: File[], roomType?: RoomType) => {
    try {
      // Update URL params
      updateUrlParams({ roomType, mode: 'batch' });
      
      // Reset single analysis
      singleAnalysis.reset();
      imagePreview.clearPreview();
      
      // Start batch analysis
      await batchAnalysis.analyzeFiles({
        files,
        roomType,
        useGuidelines
      });
    } catch (error) {
      console.error('Error in batch analysis:', error);
    }
  };

  const handleModeChange = (newMode: ViewMode) => {
    setMode(newMode);
    updateUrlParams({ mode: newMode });
    
    // Reset state when changing modes
    if (newMode === 'single') {
      batchAnalysis.reset();
    } else {
      singleAnalysis.reset();
      imagePreview.clearPreview();
    }
  };

  const updateUrlParams = (params: { roomType?: RoomType; mode?: ViewMode; source?: string }) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (params.roomType) {
      newParams.set('roomType', params.roomType);
    } else if (params.roomType === undefined) {
      newParams.delete('roomType');
    }
    
    if (params.mode) {
      newParams.set('mode', params.mode);
    }
    
    if (params.source) {
      newParams.set('source', params.source);
    } else if (params.source === undefined) {
      newParams.delete('source');
    }
    
    setSearchParams(newParams);
  };

  const handleBatchResultClick = (result: BatchResult) => {
    if (result.status === 'completed') {
      // Switch to single mode and show this result
      setMode('single');
      singleAnalysis.reset();
      
      // Set the analysis data directly
      singleAnalysis.analyze({
        url: result.analysis.url,
        roomType: result.analysis.roomType,
        useGuidelines
      });
      
      imagePreview.setPreviewUrl(result.analysis.url);
      setCurrentImageUrl(result.analysis.url);
      
      updateUrlParams({ mode: 'single' });
    }
  };

  const currentAnalysis = singleAnalysis.data;
  const displayImageUrl = imagePreview.preview || currentImageUrl;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Photo Coach</h1>
          <p className="text-gray-600">
            Analiza y mejora la calidad de tus fotos inmobiliarias con IA
          </p>
        </div>
        
        {/* Mode Toggle */}
        <div className="flex rounded-lg border border-gray-300 overflow-hidden">
          <button
            onClick={() => handleModeChange('single')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              mode === 'single'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            📸 Análisis individual
          </button>
          <button
            onClick={() => handleModeChange('batch')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              mode === 'batch'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            📊 Análisis por lotes
          </button>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-blue-900">Configuración del análisis</h3>
            <p className="text-sm text-blue-700 mt-1">
              Ajusta cómo se evalúan las fotos según las mejores prácticas inmobiliarias
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="useGuidelines"
              checked={useGuidelines}
              onChange={(e) => setUseGuidelines(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="useGuidelines" className="text-sm font-medium text-blue-900">
              Aplicar guías profesionales
            </label>
          </div>
        </div>
      </div>

      {mode === 'single' ? (
        /* Single Photo Analysis Mode */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Upload and Analysis */}
          <div className="space-y-6">
            <PhotoCoachUploader
              mode="single"
              onFileSelect={handleSingleFileSelect}
              onUrlSubmit={handleUrlSubmit}
              disabled={singleAnalysis.loading}
            />

            {/* Quality Meter */}
            {currentAnalysis && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <PhotoQualityMeter 
                  score={currentAnalysis.score} 
                  size="lg" 
                  animated={true}
                />
              </div>
            )}

            {/* Issues List */}
            {currentAnalysis && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <PhotoIssuesList 
                  issues={currentAnalysis.issues}
                  showHints={true}
                />
              </div>
            )}
          </div>

          {/* Right Column - Preview and Checklist */}
          <div className="space-y-6">
            <ResultPreview
              analysis={currentAnalysis}
              imageUrl={displayImageUrl}
              loading={singleAnalysis.loading}
            />

            {/* Fix Checklist */}
            {currentAnalysis && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <PhotoFixChecklist
                  issues={currentAnalysis.issues}
                  roomType={currentAnalysis.roomType}
                  showGeneralTips={true}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Batch Analysis Mode */
        <div className="space-y-6">
          <PhotoCoachUploader
            mode="batch"
            onBatchSelect={handleBatchSelect}
            disabled={batchAnalysis.loading}
          />

          {/* Batch Progress */}
          {batchAnalysis.loading && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">Procesando lote...</h3>
                <span className="text-sm text-gray-600">
                  {batchAnalysis.progress.completed} / {batchAnalysis.progress.total}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${batchAnalysis.progress.total > 0 ? 
                      (batchAnalysis.progress.completed / batchAnalysis.progress.total) * 100 : 0}%` 
                  }}
                />
              </div>
              
              {batchAnalysis.progress.current && (
                <p className="text-sm text-gray-600">
                  Analizando: {batchAnalysis.progress.current}
                </p>
              )}
            </div>
          )}

          {/* Batch Results */}
          {batchAnalysis.progress.results.length > 0 && (
            <PhotoBatchTable
              results={batchAnalysis.progress.results}
              loading={batchAnalysis.loading}
              onResultClick={handleBatchResultClick}
            />
          )}
        </div>
      )}

      {/* Error Display */}
      {(singleAnalysis.error || batchAnalysis.error) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error de análisis</h3>
              <p className="text-sm text-red-700 mt-1">
                {singleAnalysis.error || batchAnalysis.error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-gray-500 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-1">Sobre Photo Coach</p>
            <ul className="space-y-1">
              <li>• Utiliza IA para analizar la calidad técnica y compositiva de fotos inmobiliarias</li>
              <li>• Detecta problemas de iluminación, encuadre, nitidez y orden</li>
              <li>• Proporciona consejos específicos según el tipo de habitación</li>
              <li>• Simula análisis en tiempo real para propósitos de demostración</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}