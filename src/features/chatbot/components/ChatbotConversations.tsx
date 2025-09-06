import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  Star,
  Clock,
  Eye,
  Download,
  MoreHorizontal,
  Bot,
  ChevronDown,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface Conversation {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userPhone?: string;
  startTime: string;
  endTime?: string;
  status: 'active' | 'completed' | 'transferred';
  messages: Message[];
  rating?: number;
  leadCaptured: boolean;
  source: string;
}

interface Message {
  id: string;
  sender: 'bot' | 'user';
  content: string;
  timestamp: string;
  type: 'text' | 'option' | 'form';
  metadata?: any;
}

export const ChatbotConversations: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'transferred'>('all');
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [expandedConversations, setExpandedConversations] = useState<Set<string>>(new Set());

  // Mock conversations data
  const conversations: Conversation[] = [
    {
      id: '1',
      userId: 'user_123',
      userName: 'Ana García',
      userEmail: 'ana@email.com',
      userPhone: '+34 666 123 456',
      startTime: '2024-01-08T10:30:00',
      endTime: '2024-01-08T10:45:00',
      status: 'completed',
      leadCaptured: true,
      source: 'Página principal',
      rating: 5,
      messages: [
        { id: 'm1', sender: 'bot', content: '¡Hola! ¿En qué puedo ayudarte?', timestamp: '2024-01-08T10:30:00', type: 'text' },
        { id: 'm2', sender: 'user', content: 'Busco un piso de 2 habitaciones', timestamp: '2024-01-08T10:30:30', type: 'text' },
        { id: 'm3', sender: 'bot', content: 'Perfecto. ¿En qué zona te interesa?', timestamp: '2024-01-08T10:30:45', type: 'text' },
        { id: 'm4', sender: 'user', content: 'Madrid centro', timestamp: '2024-01-08T10:31:00', type: 'text' },
        { id: 'm5', sender: 'bot', content: 'Genial. Para enviarte las mejores opciones, ¿podrías darme tu email?', timestamp: '2024-01-08T10:31:15', type: 'text' },
        { id: 'm6', sender: 'user', content: 'ana@email.com', timestamp: '2024-01-08T10:31:30', type: 'text' },
      ]
    },
    {
      id: '2',
      userId: 'user_456',
      userName: 'Carlos López',
      userEmail: 'carlos@email.com',
      startTime: '2024-01-08T14:15:00',
      status: 'active',
      leadCaptured: false,
      source: 'Listado de propiedades',
      messages: [
        { id: 'm7', sender: 'bot', content: '¡Hola! ¿En qué puedo ayudarte?', timestamp: '2024-01-08T14:15:00', type: 'text' },
        { id: 'm8', sender: 'user', content: '¿Cuánto cuesta este piso?', timestamp: '2024-01-08T14:15:30', type: 'text' },
        { id: 'm9', sender: 'bot', content: 'El precio de esta propiedad es de 350.000€. ¿Te interesa conocer más detalles?', timestamp: '2024-01-08T14:15:45', type: 'text' },
      ]
    },
    {
      id: '3',
      userId: 'user_789',
      userName: 'María Rodríguez',
      startTime: '2024-01-07T16:20:00',
      endTime: '2024-01-07T16:35:00',
      status: 'transferred',
      leadCaptured: true,
      source: 'Google Ads',
      messages: [
        { id: 'm10', sender: 'bot', content: '¡Hola! ¿En qué puedo ayudarte?', timestamp: '2024-01-07T16:20:00', type: 'text' },
        { id: 'm11', sender: 'user', content: 'Tengo una consulta muy específica', timestamp: '2024-01-07T16:20:30', type: 'text' },
        { id: 'm12', sender: 'bot', content: 'Te voy a conectar con uno de nuestros especialistas', timestamp: '2024-01-07T16:20:45', type: 'text' },
      ]
    }
  ];

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.userEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || conv.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const convDate = new Date(conv.startTime);
      const now = new Date();
      switch (dateFilter) {
        case 'today':
          matchesDate = convDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = convDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = convDate >= monthAgo;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const toggleConversationExpanded = (conversationId: string) => {
    const newExpanded = new Set(expandedConversations);
    if (newExpanded.has(conversationId)) {
      newExpanded.delete(conversationId);
    } else {
      newExpanded.add(conversationId);
    }
    setExpandedConversations(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'transferred':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activa';
      case 'completed':
        return 'Completada';
      case 'transferred':
        return 'Transferida';
      default:
        return 'Desconocido';
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDuration = (start: string, end?: string) => {
    if (!end) return 'En curso';
    const startTime = new Date(start);
    const endTime = new Date(end);
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
    return `${duration} min`;
  };

  const renderConversationMessages = (conversation: Conversation) => (
    <div className="space-y-3 p-4 bg-gray-50 rounded-lg max-h-96 overflow-y-auto">
      {conversation.messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div className={`flex items-start space-x-2 max-w-xs ${
            message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              message.sender === 'user' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-300 text-gray-600'
            }`}>
              {message.sender === 'user' ? (
                <User className="h-4 w-4" />
              ) : (
                <Bot className="h-4 w-4" />
              )}
            </div>
            <div className={`px-3 py-2 rounded-lg ${
              message.sender === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-900 border border-gray-200'
            }`}>
              <p className="text-sm">{message.content}</p>
              <p className="text-xs opacity-75 mt-1">
                {new Date(message.timestamp).toLocaleTimeString('es-ES', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Historial de Conversaciones</h3>
            <p className="text-sm text-gray-600 mt-1">
              Revisión y auditoría de interacciones
            </p>
          </div>
          <button className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activas</option>
            <option value="completed">Completadas</option>
            <option value="transferred">Transferidas</option>
          </select>
          
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todas las fechas</option>
            <option value="today">Hoy</option>
            <option value="week">Última semana</option>
            <option value="month">Último mes</option>
          </select>
        </div>
      </div>

      {/* Conversations List */}
      <div className="divide-y divide-gray-200">
        {filteredConversations.length > 0 ? (
          filteredConversations.map((conversation) => (
            <motion.div
              key={conversation.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-3">
                    <button
                      onClick={() => toggleConversationExpanded(conversation.id)}
                      className="flex items-center space-x-2 text-left"
                    >
                      {expandedConversations.has(conversation.id) ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {conversation.userName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                    </button>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h4 className="font-semibold text-gray-900">{conversation.userName}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(conversation.status)}`}>
                          {getStatusLabel(conversation.status)}
                        </span>
                        {conversation.leadCaptured && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Lead
                          </span>
                        )}
                        {conversation.rating && (
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-600">{conversation.rating}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        {conversation.userEmail && (
                          <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3" />
                            <span>{conversation.userEmail}</span>
                          </div>
                        )}
                        {conversation.userPhone && (
                          <div className="flex items-center space-x-1">
                            <Phone className="h-3 w-3" />
                            <span>{conversation.userPhone}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(conversation.startTime)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>{conversation.messages.length} mensajes</span>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-xs text-gray-500">
                        Fuente: {conversation.source} • 
                        Duración: {getDuration(conversation.startTime, conversation.endTime)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedConversation(conversation)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Expanded Messages */}
              <AnimatePresence>
                {expandedConversations.has(conversation.id) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4"
                  >
                    {renderConversationMessages(conversation)}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        ) : (
          <div className="p-12 text-center text-gray-500">
            <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No se encontraron conversaciones</p>
            <p className="text-sm">
              {searchTerm || statusFilter !== 'all' || dateFilter !== 'all' 
                ? 'Prueba ajustando los filtros de búsqueda'
                : 'Las conversaciones aparecerán aquí cuando los usuarios interactúen con el chatbot'
              }
            </p>
          </div>
        )}
      </div>

      {/* Conversation Detail Modal */}
      <AnimatePresence>
        {selectedConversation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Conversación con {selectedConversation.userName}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatTime(selectedConversation.startTime)}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-96">
                {renderConversationMessages(selectedConversation)}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};