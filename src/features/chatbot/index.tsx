import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Settings, 
  Palette, 
  GitBranch, 
  BarChart3,
  Power,
  Eye,
  Copy,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ChatbotDesigner } from './components/ChatbotDesigner';
import { ChatbotAppearance } from './components/ChatbotAppearance';
import { ChatbotAnalytics } from './components/ChatbotAnalytics';
import { ChatbotConversations } from './components/ChatbotConversations';
import { useChatbot } from './hooks/useChatbot';

export interface ChatbotConfig {
  id: string;
  name: string;
  prompt: string;
  isActive: boolean;
  appearance: {
    primaryColor: string;
    botAvatar: string;
    companyLogo: string;
    welcomeMessage: string;
    position: 'bottom-right' | 'bottom-left';
    proactiveMessages: string[];
  };
  flows: ChatbotFlow[];
  analytics: {
    conversations: number;
    leads: number;
    commonQuestions: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface ChatbotFlow {
  id: string;
  name: string;
  nodes: FlowNode[];
  connections: FlowConnection[];
}

export interface FlowNode {
  id: string;
  type: 'message' | 'question' | 'data_capture' | 'condition' | 'human_handoff';
  position: { x: number; y: number };
  data: {
    title: string;
    content?: string;
    options?: string[];
    field?: 'name' | 'email' | 'phone';
    condition?: string;
    webhook?: string;
  };
}

export interface FlowConnection {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export default function ChatbotPage() {
  const [activeTab, setActiveTab] = useState<'config' | 'appearance' | 'flows' | 'analytics'>('config');
  const [showPreview, setShowPreview] = useState(false);
  const [showInstallScript, setShowInstallScript] = useState(false);
  const [scriptCopied, setScriptCopied] = useState(false);
  
  const {
    chatbot,
    loading,
    error,
    updateConfig,
    updateAppearance,
    updateFlows,
    toggleChatbot
  } = useChatbot();

  const handleCopyScript = () => {
    const script = `<!-- Chatbot Widget Script -->
<script>
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://api.yourcompany.com/chatbot/widget.js?id=${chatbot.id}'+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','${chatbot.id}');
</script>`;
    
    navigator.clipboard.writeText(script);
    setScriptCopied(true);
    setTimeout(() => setScriptCopied(false), 2000);
  };

  const renderConfigTab = () => (
    <div className="space-y-6">
      {/* General Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Configuración General</h3>
          <p className="text-sm text-gray-600 mt-1">Ajustes básicos del chatbot</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Chatbot
            </label>
            <input
              type="text"
              value={chatbot.name}
              onChange={(e) => updateConfig({ name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Mi Asistente Virtual"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prompt Inicial / Personalidad
            </label>
            <textarea
              value={chatbot.prompt}
              onChange={(e) => updateConfig({ prompt: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Eres un asistente amigable y experto en ventas de inmuebles. Ayuda a los usuarios con sus consultas sobre propiedades..."
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Estado del Chatbot</p>
              <p className="text-sm text-gray-600">
                {chatbot.isActive ? 'Activo en tu sitio web' : 'Desactivado'}
              </p>
            </div>
            <button
              onClick={toggleChatbot}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                chatbot.isActive ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  chatbot.isActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Installation Script */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Script de Instalación</h3>
          <p className="text-sm text-gray-600 mt-1">Copia este código en tu sitio web</p>
        </div>
        <div className="p-6">
          <div className="bg-gray-900 rounded-lg p-4 relative">
            <code className="text-green-400 text-sm block whitespace-pre-wrap">
{`<!-- Chatbot Widget Script -->
<script>
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://api.yourcompany.com/chatbot/widget.js?id=${chatbot.id}'+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','${chatbot.id}');
</script>`}
            </code>
            <button
              onClick={handleCopyScript}
              className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white transition-colors"
            >
              {scriptCopied ? (
                <CheckCircle2 className="h-4 w-4 text-green-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Pega este código antes del tag &lt;/body&gt; en todas las páginas donde quieras mostrar el chatbot.
          </p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar el chatbot</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Bot className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Chatbot IA</h1>
                <p className="text-xs text-gray-500">Asistente virtual inteligente</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${chatbot.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                <span className="text-sm text-gray-600">
                  {chatbot.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowPreview(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Eye className="h-4 w-4 mr-2" />
                Vista Previa
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'config', label: 'Configuración', icon: Settings },
              { id: 'appearance', label: 'Apariencia', icon: Palette },
              { id: 'flows', label: 'Flujos de Conversación', icon: GitBranch },
              { id: 'analytics', label: 'Analíticas', icon: BarChart3 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center px-1 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'config' && (
            <motion.div
              key="config"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderConfigTab()}
            </motion.div>
          )}
          
          {activeTab === 'appearance' && (
            <motion.div
              key="appearance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ChatbotAppearance 
                appearance={chatbot.appearance}
                onUpdate={updateAppearance}
              />
            </motion.div>
          )}

          {activeTab === 'flows' && (
            <motion.div
              key="flows"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ChatbotDesigner
                flows={chatbot.flows}
                onUpdate={updateFlows}
              />
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ChatbotAnalytics analytics={chatbot.analytics} />
              <div className="mt-8">
                <ChatbotConversations />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}