import type { IssueCode, IssueSeverity, BatchResult, RoomType } from './types';

export type QualityBand = 'pobre' | 'aceptable' | 'ideal';

export function scoreToBand(score: number): QualityBand {
  if (score >= 80) return 'ideal';
  if (score >= 60) return 'aceptable';
  return 'pobre';
}

export function getBandColor(band: QualityBand): string {
  switch (band) {
    case 'ideal': return 'text-green-700 bg-green-100 border-green-200';
    case 'aceptable': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
    case 'pobre': return 'text-red-700 bg-red-100 border-red-200';
    default: return 'text-gray-700 bg-gray-100 border-gray-200';
  }
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

export function getProgressColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
}

export function getIssueIcon(code: IssueCode): string {
  const icons: Record<IssueCode, string> = {
    lighting: '💡',
    tilt: '📐',
    crop: '🖼️',
    noise: '📶',
    clutter: '🧹',
    lowres: '🔍'
  };
  return icons[code] || '⚠️';
}

export function getIssueLabel(code: IssueCode): string {
  const labels: Record<IssueCode, string> = {
    lighting: 'Iluminación',
    tilt: 'Inclinación',
    crop: 'Encuadre',
    noise: 'Ruido',
    clutter: 'Desorden',
    lowres: 'Resolución'
  };
  return labels[code] || code;
}

export function getSeverityColor(severity: IssueSeverity): string {
  const colors: Record<IssueSeverity, string> = {
    high: 'text-red-700 bg-red-100 border-red-200',
    med: 'text-yellow-700 bg-yellow-100 border-yellow-200',
    low: 'text-gray-700 bg-gray-100 border-gray-200'
  };
  return colors[severity];
}

export function getSeverityLabel(severity: IssueSeverity): string {
  const labels: Record<IssueSeverity, string> = {
    high: 'Alto',
    med: 'Medio',
    low: 'Bajo'
  };
  return labels[severity];
}

export function getRoomTypeLabel(roomType: RoomType): string {
  const labels: Record<RoomType, string> = {
    salon: 'Salón',
    cocina: 'Cocina',
    dormitorio: 'Dormitorio',
    bano: 'Baño',
    terraza: 'Terraza',
    otro: 'Otro'
  };
  return labels[roomType];
}

export function getRoomTypeIcon(roomType: RoomType): string {
  const icons: Record<RoomType, string> = {
    salon: '🛋️',
    cocina: '🍳',
    dormitorio: '🛏️',
    bano: '🚿',
    terraza: '🌿',
    otro: '🏠'
  };
  return icons[roomType];
}

export function calculateBatchStats(results: BatchResult[]) {
  const completed = results.filter(r => r.status === 'completed');
  const failed = results.filter(r => r.status === 'error');
  
  if (completed.length === 0) {
    return {
      totalFiles: results.length,
      completed: 0,
      failed: failed.length,
      averageScore: 0,
      totalIssues: 0,
      qualityDistribution: { ideal: 0, aceptable: 0, pobre: 0 }
    };
  }

  const scores = completed.map(r => r.analysis.score);
  const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const totalIssues = completed.reduce((total, r) => total + r.analysis.issues.length, 0);

  const qualityDistribution = completed.reduce((acc, r) => {
    const band = scoreToBand(r.analysis.score);
    acc[band]++;
    return acc;
  }, { ideal: 0, aceptable: 0, pobre: 0 });

  return {
    totalFiles: results.length,
    completed: completed.length,
    failed: failed.length,
    averageScore: Math.round(averageScore),
    totalIssues,
    qualityDistribution
  };
}

export function exportBatchToCsv(results: BatchResult[]): string {
  const headers = [
    'Archivo',
    'Tipo de Habitación',
    'Puntuación',
    'Calidad',
    'Número de Issues',
    'Issues Detectados',
    'Estado',
    'Fecha de Análisis'
  ];

  const rows = results.map(result => {
    if (result.status === 'error') {
      return [
        result.filename,
        '-',
        '-',
        '-',
        '-',
        '-',
        'Error',
        '-'
      ];
    }

    const analysis = result.analysis;
    const issues = analysis.issues.map(i => getIssueLabel(i.code)).join('; ');
    
    return [
      result.filename,
      analysis.roomType ? getRoomTypeLabel(analysis.roomType) : '-',
      analysis.score.toString(),
      scoreToBand(analysis.score),
      analysis.issues.length.toString(),
      issues || 'Ninguno',
      'Completado',
      new Date(analysis.createdAt).toLocaleDateString()
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
}

export function downloadCsv(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function truncateFilename(filename: string, maxLength: number = 30): string {
  if (filename.length <= maxLength) return filename;
  
  const extension = filename.split('.').pop() || '';
  const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
  const truncatedName = nameWithoutExt.substring(0, maxLength - extension.length - 4);
  
  return `${truncatedName}...${extension}`;
}

export function getRecommendedActions(roomType?: RoomType): string[] {
  const commonActions = [
    'Enciende todas las luces disponibles',
    'Limpia y ordena el espacio',
    'Usa la cuadrícula del móvil para nivelar',
    'Toma múltiples fotos desde diferentes ángulos'
  ];

  const roomSpecificActions: Record<RoomType, string[]> = {
    salon: [
      'Abre cortinas y persianas completamente',
      'Esponja los cojines y endereza los muebles',
      'Retira objetos personales de las superficies'
    ],
    cocina: [
      'Despeja completamente la encimera',
      'Enciende las luces bajo los muebles',
      'Limpia todos los electrodomésticos'
    ],
    dormitorio: [
      'Haz la cama perfectamente',
      'Guarda la ropa y objetos personales',
      'Abre las ventanas para luz natural'
    ],
    bano: [
      'Limpia espejos y superficies brillantes',
      'Cuelga toallas de forma ordenada',
      'Retira productos de higiene personal'
    ],
    terraza: [
      'Barre y limpia el suelo',
      'Ordena muebles y plantas',
      'Aprovecha la luz natural del día'
    ],
    otro: [
      'Adapta la iluminación al uso del espacio',
      'Mantén líneas limpias y ordenadas'
    ]
  };

  return roomType 
    ? [...commonActions, ...roomSpecificActions[roomType]]
    : commonActions;
}