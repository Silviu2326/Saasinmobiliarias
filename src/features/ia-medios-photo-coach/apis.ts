import type { 
  PhotoAnalysis, 
  BatchResult, 
  PhotoPreset, 
  AnalyzePhotoRequest, 
  BatchAnalyzeRequest,
  PhotoIssue,
  IssueCode,
  RoomType
} from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

// Mock presets data
const mockPresets: PhotoPreset[] = [
  {
    id: 'salon-preset',
    name: 'Salón/Living',
    roomType: 'salon',
    rules: [
      { code: 'lighting', weight: 0.3, threshold: 0.7 },
      { code: 'crop', weight: 0.25, threshold: 0.8 },
      { code: 'clutter', weight: 0.2, threshold: 0.6 },
      { code: 'tilt', weight: 0.15, threshold: 0.9 },
      { code: 'noise', weight: 0.1, threshold: 0.8 }
    ],
    checklist: [
      { item: 'Encender todas las luces', priority: 'high', tip: 'Iluminación natural + artificial para mejores resultados' },
      { item: 'Ordenar y limpiar el espacio', priority: 'high', tip: 'Remover objetos personales y desorden visible' },
      { item: 'Enderezar cuadros y muebles', priority: 'medium', tip: 'Líneas verticales y horizontales perfectamente alineadas' },
      { item: 'Abrir cortinas/persianas', priority: 'medium', tip: 'Maximizar la entrada de luz natural' },
      { item: 'Limpiar superficies reflectantes', priority: 'low', tip: 'Espejos, televisores, mesas de cristal sin marcas' }
    ]
  },
  {
    id: 'cocina-preset',
    name: 'Cocina',
    roomType: 'cocina',
    rules: [
      { code: 'lighting', weight: 0.35, threshold: 0.75 },
      { code: 'clutter', weight: 0.3, threshold: 0.8 },
      { code: 'crop', weight: 0.2, threshold: 0.7 },
      { code: 'tilt', weight: 0.1, threshold: 0.9 },
      { code: 'noise', weight: 0.05, threshold: 0.8 }
    ],
    checklist: [
      { item: 'Limpiar todas las superficies', priority: 'high', tip: 'Encimera, electrodomésticos y fregadero impecables' },
      { item: 'Guardar todos los utensilios', priority: 'high', tip: 'Encimera completamente despejada' },
      { item: 'Encender luces bajo muebles', priority: 'medium', tip: 'Iluminar la zona de trabajo' },
      { item: 'Cerrar todos los armarios', priority: 'medium', tip: 'Líneas limpias y ordenadas' },
      { item: 'Colocar elementos decorativos mínimos', priority: 'low', tip: 'Máximo 2-3 elementos (frutas, plantas)' }
    ]
  }
];

// Simulate photo analysis with random issues
function generateMockAnalysis(url: string, roomType?: RoomType, useGuidelines = false): PhotoAnalysis {
  const possibleIssues: Array<{code: IssueCode, messages: string[], hints: string[]}> = [
    {
      code: 'lighting',
      messages: [
        'Iluminación insuficiente',
        'Sombras muy marcadas',
        'Contraluz excesivo',
        'Luz artificial demasiado amarilla'
      ],
      hints: [
        'Enciende todas las luces disponibles',
        'Usa luz natural siempre que sea posible',
        'Evita tomar fotos contra ventanas',
        'Considera usar un reflector casero'
      ]
    },
    {
      code: 'tilt',
      messages: [
        'Horizontales no están niveladas',
        'Verticales inclinadas',
        'Perspectiva torcida'
      ],
      hints: [
        'Usa la cuadrícula del móvil como guía',
        'Alinea con marcos de puertas/ventanas',
        'Mantén el teléfono completamente vertical'
      ]
    },
    {
      code: 'crop',
      messages: [
        'Encuadre muy cerrado',
        'Elementos importantes cortados',
        'Composición desequilibrada'
      ],
      hints: [
        'Incluye todo el mobiliario importante',
        'Deja espacio alrededor de los elementos',
        'Usa la regla de los tercios'
      ]
    },
    {
      code: 'noise',
      messages: [
        'Imagen con ruido/grano',
        'Calidad de imagen baja',
        'Foto desenfocada'
      ],
      hints: [
        'Limpia la lente del teléfono',
        'Mantén el pulso firme',
        'Usa temporizador para evitar vibración'
      ]
    },
    {
      code: 'clutter',
      messages: [
        'Demasiados objetos personales',
        'Espacio desorganizado',
        'Elementos distractores visibles'
      ],
      hints: [
        'Retira objetos personales',
        'Ordena y limpia antes de fotografiar',
        'Esconde cables y elementos técnicos'
      ]
    },
    {
      code: 'lowres',
      messages: [
        'Resolución insuficiente',
        'Imagen pixelada',
        'Calidad web no apta para impresión'
      ],
      hints: [
        'Usa la máxima calidad de tu cámara',
        'Evita zoom digital',
        'Configura el teléfono en modo profesional'
      ]
    }
  ];

  // Randomly generate 0-4 issues
  const numIssues = Math.floor(Math.random() * 5);
  const selectedIssues = possibleIssues
    .sort(() => Math.random() - 0.5)
    .slice(0, numIssues);

  const issues: PhotoIssue[] = selectedIssues.map(issue => ({
    code: issue.code,
    severity: ['low', 'med', 'high'][Math.floor(Math.random() * 3)] as any,
    message: issue.messages[Math.floor(Math.random() * issue.messages.length)],
    hints: issue.hints.slice(0, Math.floor(Math.random() * 3) + 1)
  }));

  // Calculate score based on issues and guidelines
  let baseScore = 85 - (issues.length * 15);
  
  if (useGuidelines && roomType) {
    const preset = mockPresets.find(p => p.roomType === roomType);
    if (preset) {
      // Apply penalties for guideline violations
      issues.forEach(issue => {
        const rule = preset.rules.find(r => r.code === issue.code);
        if (rule) {
          baseScore -= rule.weight * 20;
        }
      });
    }
  }

  const score = Math.max(0, Math.min(100, Math.round(baseScore + (Math.random() * 10 - 5))));

  const suggestions = [
    'Mejora la iluminación natural abriendo cortinas',
    'Usa un trípode o superficie estable para evitar movimiento',
    'Limpia y ordena el espacio antes de fotografiar',
    'Toma múltiples fotos desde diferentes ángulos',
    'Considera la hora del día para mejor luz natural'
  ].slice(0, Math.floor(Math.random() * 3) + 2);

  return {
    id: `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    url,
    roomType,
    score,
    issues,
    suggestions,
    createdAt: new Date().toISOString()
  };
}

export const photoCoachApi = {
  async analyzePhoto(request: AnalyzePhotoRequest): Promise<PhotoAnalysis> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));

    let imageUrl: string;

    if (request.file) {
      // In a real app, this would upload the file and return a URL
      imageUrl = URL.createObjectURL(request.file);
    } else if (request.url) {
      imageUrl = request.url;
    } else {
      throw new Error('Either file or URL must be provided');
    }

    return generateMockAnalysis(imageUrl, request.roomType, request.useGuidelines);
  },

  async batchAnalyze(request: BatchAnalyzeRequest): Promise<BatchResult[]> {
    const results: BatchResult[] = [];

    for (let i = 0; i < request.files.length; i++) {
      const file = request.files[i];
      
      // Simulate progressive analysis
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));

      try {
        const imageUrl = URL.createObjectURL(file);
        const analysis = generateMockAnalysis(imageUrl, request.roomType, request.useGuidelines);
        
        results.push({
          id: `batch-${Date.now()}-${i}`,
          filename: file.name,
          analysis,
          status: 'completed'
        });
      } catch (error) {
        results.push({
          id: `batch-${Date.now()}-${i}`,
          filename: file.name,
          analysis: {} as PhotoAnalysis,
          status: 'error',
          error: 'Error al procesar la imagen'
        });
      }
    }

    return results;
  },

  async getPresets(): Promise<PhotoPreset[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockPresets;
  },

  async getAnalysis(id: string): Promise<PhotoAnalysis> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Return a mock analysis - in real app this would fetch from backend
    return {
      id,
      url: 'https://example.com/photo.jpg',
      roomType: 'salon',
      score: Math.floor(Math.random() * 100),
      issues: [],
      suggestions: ['Mejora la iluminación', 'Ordena el espacio'],
      createdAt: new Date().toISOString()
    };
  },

  // Helper method to validate image URL by attempting to load it
  async validateImageUrl(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
      
      // Timeout after 10 seconds
      setTimeout(() => resolve(false), 10000);
    });
  }
};