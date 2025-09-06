import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Move, 
  ChevronDown,
  Zap,
  AlertCircle
} from 'lucide-react';
import { 
  Condition, 
  LogicalOperator, 
  OperatorType, 
  TriggerType,
  Field,
  CAMPOS_POR_TRIGGER 
} from '../types/regla.types';
import { reglasService } from '../services/reglasService';

interface CondicionBuilderProps {
  trigger: TriggerType;
  condiciones: Condition[];
  onChange: (condiciones: Condition[]) => void;
  disabled?: boolean;
}

export const CondicionBuilder: React.FC<CondicionBuilderProps> = ({
  trigger,
  condiciones,
  onChange,
  disabled = false
}) => {
  const [expandedConditions, setExpandedConditions] = useState<Set<string>>(new Set());

  const availableFields = CAMPOS_POR_TRIGGER[trigger] || [];

  const getOperatorsForField = (fieldKey: string): { value: OperatorType; label: string }[] => {
    const field = availableFields.find(f => f.key === fieldKey);
    if (!field) return [];

    const operatorLabels: Record<OperatorType, string> = {
      equals: 'Es igual a',
      not_equals: 'No es igual a',
      greater_than: 'Es mayor que',
      less_than: 'Es menor que',
      greater_equal: 'Es mayor o igual que',
      less_equal: 'Es menor o igual que',
      contains: 'Contiene',
      not_contains: 'No contiene',
      starts_with: 'Empieza con',
      ends_with: 'Termina con',
      in_array: 'Está en',
      not_in_array: 'No está en',
      is_empty: 'Está vacío',
      is_not_empty: 'No está vacío'
    };

    const operators = reglasService.getOperatorsForField(field.type);
    return operators.map(op => ({
      value: op as OperatorType,
      label: operatorLabels[op as OperatorType]
    }));
  };

  const addCondicion = () => {
    const newCondicion: Condition = {
      id: Date.now().toString(),
      field: '',
      operator: 'equals',
      value: '',
      logicalOperator: condiciones.length > 0 ? 'AND' : undefined
    };

    onChange([...condiciones, newCondicion]);
    setExpandedConditions(prev => new Set([...prev, newCondicion.id]));
  };

  const updateCondicion = (id: string, updates: Partial<Condition>) => {
    onChange(
      condiciones.map(condicion =>
        condicion.id === id ? { ...condicion, ...updates } : condicion
      )
    );
  };

  const removeCondicion = (id: string) => {
    const updatedCondiciones = condiciones.filter(c => c.id !== id);
    
    // If we removed the first condition, remove logical operator from the new first one
    if (updatedCondiciones.length > 0 && condiciones[0]?.id === id) {
      updatedCondiciones[0] = { ...updatedCondiciones[0], logicalOperator: undefined };
    }
    
    onChange(updatedCondiciones);
    setExpandedConditions(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const duplicateCondicion = (condicion: Condition) => {
    const duplicated: Condition = {
      ...condicion,
      id: Date.now().toString(),
      logicalOperator: 'AND'
    };
    
    const condicionIndex = condiciones.findIndex(c => c.id === condicion.id);
    const newCondiciones = [
      ...condiciones.slice(0, condicionIndex + 1),
      duplicated,
      ...condiciones.slice(condicionIndex + 1)
    ];
    
    onChange(newCondiciones);
    setExpandedConditions(prev => new Set([...prev, duplicated.id]));
  };

  const toggleExpanded = (id: string) => {
    setExpandedConditions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const renderValueInput = (condicion: Condition) => {
    const field = availableFields.find(f => f.key === condicion.field);
    if (!field) return null;

    // Don't show value input for operators that don't need it
    if (['is_empty', 'is_not_empty'].includes(condicion.operator)) {
      return null;
    }

    switch (field.type) {
      case 'select':
        return (
          <select
            value={condicion.value}
            onChange={(e) => updateCondicion(condicion.id, { value: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={disabled}
          >
            <option value="">Seleccionar valor</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <select
            multiple
            value={Array.isArray(condicion.value) ? condicion.value : []}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions, option => option.value);
              updateCondicion(condicion.id, { value: values });
            }}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={disabled}
          >
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'number':
        return (
          <input
            type="number"
            value={condicion.value}
            onChange={(e) => updateCondicion(condicion.id, { value: e.target.value })}
            placeholder="Ingrese un número"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={disabled}
          />
        );

      case 'date':
        return (
          <input
            type="datetime-local"
            value={condicion.value}
            onChange={(e) => updateCondicion(condicion.id, { value: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={disabled}
          />
        );

      case 'boolean':
        return (
          <select
            value={condicion.value}
            onChange={(e) => updateCondicion(condicion.id, { value: e.target.value === 'true' })}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={disabled}
          >
            <option value="">Seleccionar</option>
            <option value="true">Verdadero</option>
            <option value="false">Falso</option>
          </select>
        );

      default:
        return (
          <input
            type="text"
            value={condicion.value}
            onChange={(e) => updateCondicion(condicion.id, { value: e.target.value })}
            placeholder="Ingrese el valor"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={disabled}
          />
        );
    }
  };

  const isCondicionComplete = (condicion: Condition): boolean => {
    if (!condicion.field || !condicion.operator) return false;
    if (['is_empty', 'is_not_empty'].includes(condicion.operator)) return true;
    return condicion.value !== '' && condicion.value != null;
  };

  const getCondicionSummary = (condicion: Condition): string => {
    const field = availableFields.find(f => f.key === condicion.field);
    const operators = getOperatorsForField(condicion.field);
    const operator = operators.find(op => op.value === condicion.operator);
    
    if (!field || !operator) return 'Condición incompleta';
    
    let valueSummary = '';
    if (!['is_empty', 'is_not_empty'].includes(condicion.operator)) {
      if (field.type === 'select' && field.options) {
        const option = field.options.find(opt => opt.value === condicion.value);
        valueSummary = option ? option.label : condicion.value;
      } else {
        valueSummary = condicion.value?.toString() || '';
      }
    }
    
    return `${field.label} ${operator.label.toLowerCase()}${valueSummary ? ` "${valueSummary}"` : ''}`;
  };

  if (availableFields.length === 0) {
    return (
      <div className="p-6 text-center border-2 border-dashed border-gray-300 rounded-lg">
        <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">
          No hay campos disponibles para el trigger seleccionado
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900">
          Condiciones {condiciones.length > 0 && `(${condiciones.length})`}
        </h4>
        <button
          type="button"
          onClick={addCondicion}
          disabled={disabled}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          Agregar Condición
        </button>
      </div>

      {condiciones.length === 0 ? (
        <div className="p-6 text-center border-2 border-dashed border-gray-300 rounded-lg">
          <Zap className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 mb-3">
            Agregue condiciones para definir cuándo se debe ejecutar esta regla
          </p>
          <button
            type="button"
            onClick={addCondicion}
            disabled={disabled}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Primera Condición
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {condiciones.map((condicion, index) => {
            const isExpanded = expandedConditions.has(condicion.id);
            const isComplete = isCondicionComplete(condicion);
            
            return (
              <div key={condicion.id} className="border border-gray-200 rounded-lg">
                {/* Logical Operator for non-first conditions */}
                {index > 0 && (
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Operador:</span>
                      <select
                        value={condicion.logicalOperator || 'AND'}
                        onChange={(e) => updateCondicion(condicion.id, { 
                          logicalOperator: e.target.value as LogicalOperator 
                        })}
                        className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        disabled={disabled}
                      >
                        <option value="AND">Y (AND)</option>
                        <option value="OR">O (OR)</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Condition Header */}
                <div 
                  className="px-4 py-3 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleExpanded(condicion.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-3 h-3 rounded-full ${isComplete ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <div className="flex-1">
                        {isComplete ? (
                          <p className="text-sm text-gray-900">{getCondicionSummary(condicion)}</p>
                        ) : (
                          <p className="text-sm text-gray-500">Condición incompleta</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateCondicion(condicion);
                        }}
                        disabled={disabled}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        title="Duplicar condición"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCondicion(condicion.id);
                        }}
                        disabled={disabled}
                        className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"
                        title="Eliminar condición"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      
                      <ChevronDown 
                        className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                      />
                    </div>
                  </div>
                </div>

                {/* Condition Details */}
                {isExpanded && (
                  <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                    <div className="space-y-3">
                      {/* Field Selection */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Campo
                        </label>
                        <select
                          value={condicion.field}
                          onChange={(e) => updateCondicion(condicion.id, { 
                            field: e.target.value,
                            operator: 'equals',
                            value: ''
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={disabled}
                        >
                          <option value="">Seleccionar campo</option>
                          {availableFields.map(field => (
                            <option key={field.key} value={field.key}>
                              {field.label} {field.description && `(${field.description})`}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Operator Selection */}
                      {condicion.field && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Operador
                          </label>
                          <select
                            value={condicion.operator}
                            onChange={(e) => updateCondicion(condicion.id, { 
                              operator: e.target.value as OperatorType,
                              value: ['is_empty', 'is_not_empty'].includes(e.target.value) ? null : condicion.value
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={disabled}
                          >
                            {getOperatorsForField(condicion.field).map(operator => (
                              <option key={operator.value} value={operator.value}>
                                {operator.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Value Input */}
                      {condicion.field && condicion.operator && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Valor
                          </label>
                          {renderValueInput(condicion)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {condiciones.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h5 className="text-sm font-medium text-blue-900 mb-2">Resumen de la Lógica</h5>
          <div className="text-sm text-blue-800">
            <strong>SI</strong>
            {condiciones.map((condicion, index) => (
              <span key={condicion.id}>
                {index > 0 && (
                  <span className="mx-2 font-medium">
                    {condicion.logicalOperator === 'OR' ? 'O' : 'Y'}
                  </span>
                )}
                <span className="italic">
                  ({isCondicionComplete(condicion) ? getCondicionSummary(condicion) : 'condición incompleta'})
                </span>
              </span>
            ))}
            <span className="ml-2"><strong>ENTONCES</strong> ejecutar las acciones definidas</span>
          </div>
        </div>
      )}
    </div>
  );
};