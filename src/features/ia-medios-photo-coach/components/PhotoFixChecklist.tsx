import React, { useState } from 'react';
import type { PhotoIssue, FixAction, RoomType } from '../types';
import { getIssueIcon, getIssueLabel, getRecommendedActions } from '../utils';

interface PhotoFixChecklistProps {
  issues: PhotoIssue[];
  roomType?: RoomType;
  onActionComplete?: (action: FixAction) => void;
  showGeneralTips?: boolean;
}

export default function PhotoFixChecklist({
  issues,
  roomType,
  onActionComplete,
  showGeneralTips = true
}: PhotoFixChecklistProps) {
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState<Record<string, string>>({});

  // Generate fix actions from issues
  const fixActions: FixAction[] = issues.flatMap((issue, issueIndex) =>
    issue.hints.map((hint, hintIndex) => ({
      id: `${issue.code}-${issueIndex}-${hintIndex}`,
      issueCode: issue.code,
      action: hint,
      completed: false
    }))
  );

  const handleToggleComplete = (actionId: string) => {
    const newCompleted = new Set(completedActions);
    if (newCompleted.has(actionId)) {
      newCompleted.delete(actionId);
    } else {
      newCompleted.add(actionId);
    }
    setCompletedActions(newCompleted);

    const action = fixActions.find(a => a.id === actionId);
    if (action) {
      const completedAction: FixAction = {
        ...action,
        completed: !completedActions.has(actionId),
        note: notes[actionId]
      };
      onActionComplete?.(completedAction);
    }
  };

  const handleNoteChange = (actionId: string, note: string) => {
    setNotes(prev => ({
      ...prev,
      [actionId]: note
    }));
  };

  const completedCount = completedActions.size;
  const totalActions = fixActions.length;
  const generalTips = getRecommendedActions(roomType);

  const groupedActions = fixActions.reduce((acc, action) => {
    if (!acc[action.issueCode]) {
      acc[action.issueCode] = [];
    }
    acc[action.issueCode].push(action);
    return acc;
  }, {} as Record<string, FixAction[]>);

  if (fixActions.length === 0 && !showGeneralTips) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="text-4xl mb-2">🎉</div>
        <h3 className="text-lg font-medium text-green-800 mb-1">
          ¡Foto perfecta!
        </h3>
        <p className="text-green-700">
          No hay acciones correctivas necesarias.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      {fixActions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-blue-900">
              Lista de correcciones
            </h3>
            <div className="text-sm font-medium text-blue-700">
              {completedCount} / {totalActions} completadas
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${totalActions > 0 ? (completedCount / totalActions) * 100 : 0}%` }}
            />
          </div>
          
          {completedCount === totalActions && totalActions > 0 && (
            <div className="mt-3 text-sm text-blue-700 font-medium flex items-center">
              <span className="mr-2">✅</span>
              ¡Todas las correcciones completadas! Vuelve a tomar la foto.
            </div>
          )}
        </div>
      )}

      {/* Issue-based Actions */}
      {Object.entries(groupedActions).map(([issueCode, actions]) => (
        <div key={issueCode} className="space-y-3">
          <div className="flex items-center space-x-2">
            <span className="text-xl">{getIssueIcon(issueCode as any)}</span>
            <h4 className="font-medium text-gray-900">{getIssueLabel(issueCode as any)}</h4>
          </div>
          
          <div className="space-y-2 ml-7">
            {actions.map((action) => {
              const isCompleted = completedActions.has(action.id);
              
              return (
                <div
                  key={action.id}
                  className={`border rounded-lg p-3 transition-all duration-200 ${
                    isCompleted 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <button
                      onClick={() => handleToggleComplete(action.id)}
                      className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        isCompleted
                          ? 'bg-green-600 border-green-600 text-white'
                          : 'border-gray-300 hover:border-green-500'
                      }`}
                    >
                      {isCompleted && (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                    
                    <div className="flex-1">
                      <p className={`text-sm ${isCompleted ? 'text-green-800 line-through' : 'text-gray-700'}`}>
                        {action.action}
                      </p>
                      
                      {/* Notes input */}
                      <div className="mt-2">
                        <input
                          type="text"
                          placeholder="Agregar nota (opcional)..."
                          value={notes[action.id] || ''}
                          onChange={(e) => handleNoteChange(action.id, e.target.value)}
                          className="w-full text-xs px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* General Tips */}
      {showGeneralTips && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <span className="mr-2">💡</span>
            Consejos generales
            {roomType && <span className="ml-2 text-sm text-gray-500">({getRecommendedActions(roomType).length - 4} específicos para {roomType})</span>}
          </h4>
          
          <div className="grid gap-2">
            {generalTips.map((tip, index) => (
              <div key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                <span className="text-gray-400 mt-1">•</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Acciones rápidas</h4>
        <div className="space-y-2">
          <button
            onClick={() => {
              // Simulate creating a task
              alert('Funcionalidad simulada: Crear tarea "Repetir fotos con mejoras"');
            }}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            📝 Crear tarea para repetir fotos
          </button>
          
          <button
            onClick={() => {
              // Simulate opening Virtual Staging
              const params = new URLSearchParams();
              if (roomType) params.set('roomType', roomType);
              const url = `/ia-medios/virtual-staging?${params.toString()}`;
              window.open(url, '_blank');
            }}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          >
            🎨 Abrir Virtual Staging
          </button>
        </div>
      </div>

      {/* Progress Summary */}
      {fixActions.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          {completedCount === 0 && (
            <p>👆 Marca las acciones conforme las completes</p>
          )}
          {completedCount > 0 && completedCount < totalActions && (
            <p>🔄 Progreso: {Math.round((completedCount / totalActions) * 100)}% completado</p>
          )}
          {completedCount === totalActions && totalActions > 0 && (
            <p>🎯 ¡Listo! Ahora toma una nueva foto para ver las mejoras</p>
          )}
        </div>
      )}
    </div>
  );
}