import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  MessageSquare, 
  HelpCircle, 
  User, 
  GitBranch, 
  UserCheck,
  Save,
  Play,
  Trash2,
  Edit2,
  Copy,
  ArrowRight,
  Zap,
  Link,
  Settings
} from 'lucide-react';
import { FlowNode, FlowConnection, ChatbotFlow } from '../index';

interface ChatbotDesignerProps {
  flows: ChatbotFlow[];
  onUpdate: (flows: ChatbotFlow[]) => void;
}

export const ChatbotDesigner: React.FC<ChatbotDesignerProps> = ({ flows, onUpdate }) => {
  const [selectedFlow, setSelectedFlow] = useState<ChatbotFlow | null>(flows[0] || null);
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [showNodeEditor, setShowNodeEditor] = useState(false);
  const [newFlowName, setNewFlowName] = useState('');
  const [showNewFlowForm, setShowNewFlowForm] = useState(false);
  const [draggedNodeType, setDraggedNodeType] = useState<string | null>(null);

  const nodeTypes = [
    {
      type: 'message',
      label: 'Mensaje de Texto',
      icon: MessageSquare,
      color: 'bg-blue-500',
      description: 'Envía un mensaje al usuario'
    },
    {
      type: 'question',
      label: 'Pregunta con Opciones',
      icon: HelpCircle,
      color: 'bg-green-500',
      description: 'Pregunta con botones de respuesta'
    },
    {
      type: 'data_capture',
      label: 'Captura de Datos',
      icon: User,
      color: 'bg-purple-500',
      description: 'Solicita datos del usuario'
    },
    {
      type: 'condition',
      label: 'Condicional',
      icon: GitBranch,
      color: 'bg-orange-500',
      description: 'Ramifica según condiciones'
    },
    {
      type: 'human_handoff',
      label: 'Transferir a Humano',
      icon: UserCheck,
      color: 'bg-red-500',
      description: 'Deriva a un agente humano'
    }
  ];

  const createNewFlow = () => {
    if (newFlowName.trim()) {
      const newFlow: ChatbotFlow = {
        id: `flow_${Date.now()}`,
        name: newFlowName.trim(),
        nodes: [
          {
            id: 'start',
            type: 'message',
            position: { x: 300, y: 100 },
            data: {
              title: 'Mensaje de Inicio',
              content: '¡Hola! ¿En qué puedo ayudarte?'
            }
          }
        ],
        connections: []
      };
      
      onUpdate([...flows, newFlow]);
      setSelectedFlow(newFlow);
      setNewFlowName('');
      setShowNewFlowForm(false);
    }
  };

  const addNode = (type: string, position: { x: number; y: number }) => {
    if (!selectedFlow) return;
    
    const newNode: FlowNode = {
      id: `node_${Date.now()}`,
      type: type as FlowNode['type'],
      position,
      data: {
        title: `Nuevo ${nodeTypes.find(nt => nt.type === type)?.label}`,
        content: type === 'message' ? 'Escribe tu mensaje aquí...' : undefined,
        options: type === 'question' ? ['Opción 1', 'Opción 2'] : undefined,
        field: type === 'data_capture' ? 'name' : undefined
      }
    };

    const updatedFlow = {
      ...selectedFlow,
      nodes: [...selectedFlow.nodes, newNode]
    };

    const updatedFlows = flows.map(f => f.id === selectedFlow.id ? updatedFlow : f);
    onUpdate(updatedFlows);
    setSelectedFlow(updatedFlow);
  };

  const updateNode = (nodeId: string, updates: Partial<FlowNode['data']>) => {
    if (!selectedFlow) return;

    const updatedFlow = {
      ...selectedFlow,
      nodes: selectedFlow.nodes.map(node => 
        node.id === nodeId 
          ? { ...node, data: { ...node.data, ...updates } }
          : node
      )
    };

    const updatedFlows = flows.map(f => f.id === selectedFlow.id ? updatedFlow : f);
    onUpdate(updatedFlows);
    setSelectedFlow(updatedFlow);
  };

  const deleteNode = (nodeId: string) => {
    if (!selectedFlow) return;

    const updatedFlow = {
      ...selectedFlow,
      nodes: selectedFlow.nodes.filter(node => node.id !== nodeId),
      connections: selectedFlow.connections.filter(conn => 
        conn.source !== nodeId && conn.target !== nodeId
      )
    };

    const updatedFlows = flows.map(f => f.id === selectedFlow.id ? updatedFlow : f);
    onUpdate(updatedFlows);
    setSelectedFlow(updatedFlow);
  };

  const duplicateNode = (node: FlowNode) => {
    const duplicated: FlowNode = {
      ...node,
      id: `node_${Date.now()}`,
      position: { 
        x: node.position.x + 50, 
        y: node.position.y + 50 
      },
      data: {
        ...node.data,
        title: `${node.data.title} (Copia)`
      }
    };

    addNode(duplicated.type, duplicated.position);
  };

  const getNodeIcon = (type: string) => {
    const nodeType = nodeTypes.find(nt => nt.type === type);
    return nodeType?.icon || MessageSquare;
  };

  const getNodeColor = (type: string) => {
    const nodeType = nodeTypes.find(nt => nt.type === type);
    return nodeType?.color || 'bg-gray-500';
  };

  const renderNode = (node: FlowNode) => {
    const Icon = getNodeIcon(node.type);
    const colorClass = getNodeColor(node.type);

    return (
      <motion.div
        key={node.id}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`absolute cursor-pointer group ${
          selectedNode?.id === node.id ? 'z-10' : 'z-0'
        }`}
        style={{
          left: node.position.x,
          top: node.position.y
        }}
        onClick={() => {
          setSelectedNode(node);
          setShowNodeEditor(true);
        }}
      >
        <div className={`w-48 bg-white border-2 rounded-lg shadow-md hover:shadow-lg transition-all ${
          selectedNode?.id === node.id ? 'border-blue-500' : 'border-gray-200'
        }`}>
          {/* Node Header */}
          <div className={`${colorClass} text-white p-3 rounded-t-lg flex items-center space-x-2`}>
            <Icon className="h-4 w-4" />
            <span className="text-sm font-medium flex-1 truncate">{node.data.title}</span>
            <div className="opacity-0 group-hover:opacity-100 flex space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  duplicateNode(node);
                }}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
              >
                <Copy className="h-3 w-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNode(node.id);
                }}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Node Content */}
          <div className="p-3">
            {node.type === 'message' && (
              <p className="text-xs text-gray-600 line-clamp-2">
                {node.data.content || 'Sin contenido'}
              </p>
            )}
            
            {node.type === 'question' && (
              <div className="space-y-1">
                <p className="text-xs text-gray-600 line-clamp-1">
                  {node.data.content || 'Pregunta...'}
                </p>
                {node.data.options?.slice(0, 2).map((option, idx) => (
                  <div key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                    {option}
                  </div>
                ))}
                {(node.data.options?.length || 0) > 2 && (
                  <div className="text-xs text-gray-400">+{(node.data.options?.length || 0) - 2} más</div>
                )}
              </div>
            )}
            
            {node.type === 'data_capture' && (
              <div className="text-xs text-gray-600">
                Campo: <span className="font-medium capitalize">{node.data.field || 'name'}</span>
              </div>
            )}
            
            {node.type === 'condition' && (
              <div className="text-xs text-gray-600">
                Condición: <span className="font-medium">{node.data.condition || 'Sin definir'}</span>
              </div>
            )}
            
            {node.type === 'human_handoff' && (
              <div className="text-xs text-gray-600">
                Derivar a agente humano
              </div>
            )}
          </div>

          {/* Connection Points */}
          <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-sm"></div>
          </div>
          <div className="absolute -left-2 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 bg-gray-300 rounded-full border-2 border-white shadow-sm"></div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderNodeEditor = () => {
    if (!selectedNode || !showNodeEditor) return null;

    return (
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className="fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-xl z-50 overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Editar Nodo</h3>
            <button
              onClick={() => setShowNodeEditor(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título
              </label>
              <input
                type="text"
                value={selectedNode.data.title}
                onChange={(e) => updateNode(selectedNode.id, { title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Content (for message and question types) */}
            {(selectedNode.type === 'message' || selectedNode.type === 'question') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedNode.type === 'message' ? 'Mensaje' : 'Pregunta'}
                </label>
                <textarea
                  value={selectedNode.data.content || ''}
                  onChange={(e) => updateNode(selectedNode.id, { content: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            {/* Options (for question type) */}
            {selectedNode.type === 'question' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opciones de Respuesta
                </label>
                <div className="space-y-2">
                  {selectedNode.data.options?.map((option, index) => (
                    <div key={index} className="flex space-x-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...(selectedNode.data.options || [])];
                          newOptions[index] = e.target.value;
                          updateNode(selectedNode.id, { options: newOptions });
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        onClick={() => {
                          const newOptions = selectedNode.data.options?.filter((_, i) => i !== index);
                          updateNode(selectedNode.id, { options: newOptions });
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newOptions = [...(selectedNode.data.options || []), 'Nueva opción'];
                      updateNode(selectedNode.id, { options: newOptions });
                    }}
                    className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600"
                  >
                    <Plus className="h-4 w-4 mx-auto" />
                  </button>
                </div>
              </div>
            )}

            {/* Field (for data capture type) */}
            {selectedNode.type === 'data_capture' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campo a Capturar
                </label>
                <select
                  value={selectedNode.data.field || 'name'}
                  onChange={(e) => updateNode(selectedNode.id, { field: e.target.value as 'name' | 'email' | 'phone' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="name">Nombre</option>
                  <option value="email">Email</option>
                  <option value="phone">Teléfono</option>
                </select>
              </div>
            )}

            {/* Condition (for condition type) */}
            {selectedNode.type === 'condition' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condición
                </label>
                <input
                  type="text"
                  value={selectedNode.data.condition || ''}
                  onChange={(e) => updateNode(selectedNode.id, { condition: e.target.value })}
                  placeholder="ej: user_type == 'vip'"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            {/* Webhook (for data capture) */}
            {selectedNode.type === 'data_capture' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook URL (opcional)
                </label>
                <input
                  type="url"
                  value={selectedNode.data.webhook || ''}
                  onChange={(e) => updateNode(selectedNode.id, { webhook: e.target.value })}
                  placeholder="https://api.example.com/leads"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Flow Management */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Flujos de Conversación</h3>
            <button
              onClick={() => setShowNewFlowForm(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Flujo
            </button>
          </div>
        </div>
        <div className="p-6">
          {/* Flow Tabs */}
          <div className="flex space-x-2 mb-6">
            {flows.map((flow) => (
              <button
                key={flow.id}
                onClick={() => setSelectedFlow(flow)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedFlow?.id === flow.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {flow.name}
              </button>
            ))}
          </div>

          {/* New Flow Form */}
          <AnimatePresence>
            {showNewFlowForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-gray-50 rounded-lg border"
              >
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={newFlowName}
                    onChange={(e) => setNewFlowName(e.target.value)}
                    placeholder="Nombre del flujo"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && createNewFlow()}
                  />
                  <button
                    onClick={createNewFlow}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Crear
                  </button>
                  <button
                    onClick={() => {
                      setShowNewFlowForm(false);
                      setNewFlowName('');
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Flow Designer */}
      {selectedFlow && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Constructor Visual</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Diseña el flujo de conversación para: <strong>{selectedFlow.name}</strong>
                </p>
              </div>
              <div className="flex space-x-2">
                <button className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
                  <Play className="h-4 w-4 mr-2" />
                  Probar
                </button>
                <button className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex">
            {/* Node Palette */}
            <div className="w-64 border-r border-gray-200 bg-gray-50">
              <div className="p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Componentes</h4>
                <div className="space-y-2">
                  {nodeTypes.map((nodeType) => {
                    const Icon = nodeType.icon;
                    return (
                      <button
                        key={nodeType.type}
                        onClick={() => addNode(nodeType.type, { 
                          x: Math.random() * 300 + 100, 
                          y: Math.random() * 200 + 100 
                        })}
                        className="w-full p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all text-left group"
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${nodeType.color} text-white group-hover:scale-110 transition-transform`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{nodeType.label}</p>
                            <p className="text-xs text-gray-500 mt-1">{nodeType.description}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 relative bg-gray-50 h-96 overflow-auto">
              <div className="absolute inset-0">
                {/* Grid Background */}
                <div className="absolute inset-0 opacity-30">
                  <svg width="100%" height="100%">
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>

                {/* Nodes */}
                {selectedFlow.nodes.map(renderNode)}

                {/* Empty State */}
                {selectedFlow.nodes.length === 0 && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <GitBranch className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-2">Flujo vacío</p>
                      <p className="text-sm text-gray-400">Arrastra componentes desde la barra lateral</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Node Editor */}
      <AnimatePresence>
        {renderNodeEditor()}
      </AnimatePresence>
    </div>
  );
};