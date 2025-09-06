import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { StagingUploader } from './components/StagingUploader';
import { RoomTypeDetector } from './components/RoomTypeDetector';
import { StagingStylesPicker } from './components/StagingStylesPicker';
import { StagingItemsPicker } from './components/StagingItemsPicker';
import { StagingJobsTable } from './components/StagingJobsTable';
import { StagingResultViewer } from './components/StagingResultViewer';
import { StagingCredits } from './components/StagingCredits';

import { useCreateStageJob, useJobPoll, useCreditsQuery } from './hooks';
import { estimateCost } from './utils';
import { validateCreateStageJob } from './schema';

import type { RoomType, StageStyle, Resolution, StageJob } from './types';

const STEPS = [
  { id: 'upload', title: 'Cargar imagen', description: 'Sube o proporciona URL de la imagen' },
  { id: 'room', title: 'Tipo de estancia', description: 'Selecciona el tipo de habitación' },
  { id: 'style', title: 'Estilo', description: 'Elige el estilo de decoración' },
  { id: 'items', title: 'Elementos', description: 'Selecciona muebles (opcional)' },
  { id: 'generate', title: 'Generar', description: 'Crear el virtual staging' },
];

export default function VirtualStagingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Estado del flujo
  const [currentStep, setCurrentStep] = useState<string>('upload');
  const [imageInput, setImageInput] = useState<File | string | null>(null);
  const [roomType, setRoomType] = useState<RoomType | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<StageStyle['id'] | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [resolution, setResolution] = useState<Resolution>('2k');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [viewingJob, setViewingJob] = useState<StageJob | null>(null);

  const createJob = useCreateStageJob();
  const { data: credits } = useCreditsQuery();
  const { data: pollingJob } = useJobPoll(currentJobId || '');

  // Inicializar desde query params
  useEffect(() => {
    const photoUrl = searchParams.get('photoUrl');
    const roomTypeParam = searchParams.get('roomType') as RoomType;
    const styleParam = searchParams.get('style') as StageStyle['id'];

    if (photoUrl) {
      setImageInput(photoUrl);
      setCurrentStep('room');
    }
    if (roomTypeParam) {
      setRoomType(roomTypeParam);
    }
    if (styleParam) {
      setSelectedStyle(styleParam);
    }
  }, [searchParams]);

  // Polling del job actual
  useEffect(() => {
    if (pollingJob) {
      if (pollingJob.status === 'done') {
        setIsGenerating(false);
        setCurrentJobId(null);
        toast.success('¡Virtual Staging completado!');
        setViewingJob(pollingJob);
      } else if (pollingJob.status === 'failed') {
        setIsGenerating(false);
        setCurrentJobId(null);
        toast.error('Error en el procesamiento');
      }
    }
  }, [pollingJob]);

  const handleNext = () => {
    const currentIndex = STEPS.findIndex(step => step.id === currentStep);
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1].id);
    }
  };

  const handleBack = () => {
    const currentIndex = STEPS.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1].id);
    }
  };

  const handleGenerate = async () => {
    if (!imageInput || !roomType || !selectedStyle) {
      toast.error('Completa todos los campos requeridos');
      return;
    }

    const estimatedCost = estimateCost(selectedStyle, resolution, selectedItems.length);
    if (credits && credits.current < estimatedCost) {
      toast.error('Créditos insuficientes');
      return;
    }

    try {
      const requestData = {
        ...(typeof imageInput === 'string' ? { url: imageInput } : { file: imageInput }),
        roomType,
        style: selectedStyle,
        items: selectedItems,
        resolution,
      };

      const validation = validateCreateStageJob(requestData);
      if (!validation.success) {
        toast.error(validation.errors.join(', '));
        return;
      }
      
      setIsGenerating(true);
      const result = await createJob.mutateAsync(validation.data);
      setCurrentJobId(result.jobId);
      toast.success('Trabajo iniciado. Procesando...');
      
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Error al crear el trabajo');
      setIsGenerating(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'upload':
        return !!imageInput;
      case 'room':
        return !!roomType;
      case 'style':
        return !!selectedStyle;
      case 'items':
        return true; // Los items son opcionales
      case 'generate':
        return !isGenerating;
      default:
        return false;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
          <Sparkles className="w-8 h-8 text-purple-600" />
          Virtual Staging con IA
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Transforma espacios vacíos en imágenes atractivas con muebles y decoración
          generados por inteligencia artificial.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-4">
            {STEPS.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = STEPS.findIndex(s => s.id === currentStep) > index;
              
              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                      ${isActive 
                        ? 'bg-blue-600 text-white' 
                        : isCompleted 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-200 text-gray-600'
                      }
                    `}>
                      {index + 1}
                    </div>
                    <div className="mt-2 text-center">
                      <div className={`text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-600'}`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-500 hidden sm:block max-w-24">
                        {step.description}
                      </div>
                    </div>
                  </div>
                  
                  {index < STEPS.length - 1 && (
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step Content */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            {currentStep === 'upload' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Cargar imagen</h2>
                <StagingUploader
                  onFileSelect={setImageInput}
                  onUrlSelect={setImageInput}
                  initialUrl={typeof imageInput === 'string' ? imageInput : undefined}
                  disabled={isGenerating}
                />
              </div>
            )}

            {currentStep === 'room' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Tipo de estancia</h2>
                <RoomTypeDetector
                  selectedRoomType={roomType}
                  onRoomTypeSelect={setRoomType}
                  imageInput={imageInput}
                  disabled={isGenerating}
                />
              </div>
            )}

            {currentStep === 'style' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Estilo de decoración</h2>
                <StagingStylesPicker
                  selectedStyle={selectedStyle}
                  onStyleSelect={setSelectedStyle}
                  disabled={isGenerating}
                />
              </div>
            )}

            {currentStep === 'items' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Muebles y decoración</h2>
                <StagingItemsPicker
                  roomType={roomType}
                  selectedItems={selectedItems}
                  onItemsChange={setSelectedItems}
                  disabled={isGenerating}
                />
              </div>
            )}

            {currentStep === 'generate' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Resumen y generación</h2>
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h3 className="font-medium">Configuración seleccionada</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Estancia:</span>
                      <div className="font-medium capitalize">{roomType}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Estilo:</span>
                      <div className="font-medium capitalize">{selectedStyle}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Resolución:</span>
                      <div className="font-medium">{resolution.toUpperCase()}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Elementos:</span>
                      <div className="font-medium">{selectedItems.length}</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <select
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value as Resolution)}
                    disabled={isGenerating}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="1k">1K (1024×768)</option>
                    <option value="2k">2K (2048×1536)</option>
                    <option value="4k">4K (4096×3072)</option>
                  </select>

                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !canProceed()}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Sparkles className={`w-5 h-5 ${isGenerating ? 'animate-pulse' : ''}`} />
                    {isGenerating ? 'Generando...' : 'Generar Virtual Staging'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 'upload' || isGenerating}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              Anterior
            </button>

            {currentStep !== 'generate' && (
              <button
                onClick={handleNext}
                disabled={!canProceed() || isGenerating}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Jobs Table */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Trabajos recientes</h2>
            <StagingJobsTable
              limit={5}
              onJobView={setViewingJob}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <StagingCredits
            selectedStyle={selectedStyle}
            selectedResolution={resolution}
            selectedItemsCount={selectedItems.length}
            showEstimate={currentStep === 'generate'}
          />
        </div>
      </div>

      {/* Result Viewer Modal */}
      {viewingJob && (
        <StagingResultViewer
          job={viewingJob}
          onClose={() => setViewingJob(null)}
        />
      )}
    </div>
  );
}