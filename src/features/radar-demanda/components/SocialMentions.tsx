import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AtSign,
  Heart,
  MessageCircle,
  Share2,
  ExternalLink,
  RefreshCw,
  Filter,
  TrendingUp,
  AlertCircle,
  Calendar,
  User
} from 'lucide-react';
import { SocialMention } from '../services/radarService';

interface SocialMentionsProps {
  mentions: SocialMention[];
  loading?: boolean;
  onRefresh?: () => void;
}

export const SocialMentions: React.FC<SocialMentionsProps> = ({
  mentions,
  loading = false,
  onRefresh
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedSentiment, setSelectedSentiment] = useState<string>('all');
  const [showOnlyHighEngagement, setShowOnlyHighEngagement] = useState(false);

  const platforms = [
    { id: 'all', name: 'Todas las plataformas', icon: AtSign },
    { id: 'twitter', name: 'Twitter/X', icon: AtSign },
    { id: 'reddit', name: 'Reddit', icon: MessageCircle },
    { id: 'linkedin', name: 'LinkedIn', icon: User },
    { id: 'instagram', name: 'Instagram', icon: Heart }
  ];

  const sentiments = [
    { id: 'all', name: 'Todos', color: 'gray' },
    { id: 'positive', name: 'Positivo', color: 'green' },
    { id: 'neutral', name: 'Neutro', color: 'yellow' },
    { id: 'negative', name: 'Negativo', color: 'red' }
  ];

  const getPlatformIcon = (platform: SocialMention['platform']) => {
    switch (platform) {
      case 'twitter': return AtSign;
      case 'reddit': return MessageCircle;
      case 'linkedin': return User;
      case 'instagram': return Heart;
      default: return AtSign;
    }
  };

  const getPlatformColor = (platform: SocialMention['platform']) => {
    switch (platform) {
      case 'twitter': return 'text-blue-500 bg-blue-50';
      case 'reddit': return 'text-orange-500 bg-orange-50';
      case 'linkedin': return 'text-blue-700 bg-blue-50';
      case 'instagram': return 'text-pink-500 bg-pink-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const getSentimentColor = (sentiment: SocialMention['sentiment']) => {
    switch (sentiment) {
      case 'positive': return 'text-green-700 bg-green-100';
      case 'negative': return 'text-red-700 bg-red-100';
      case 'neutral': return 'text-yellow-700 bg-yellow-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getSentimentIcon = (sentiment: SocialMention['sentiment']) => {
    switch (sentiment) {
      case 'positive': return '😊';
      case 'negative': return '😞';
      case 'neutral': return '😐';
      default: return '🤔';
    }
  };

  const getEngagementScore = (engagement: SocialMention['engagement']) => {
    return engagement.likes + engagement.shares + engagement.comments;
  };

  const filteredMentions = mentions
    .filter(mention => selectedPlatform === 'all' || mention.platform === selectedPlatform)
    .filter(mention => selectedSentiment === 'all' || mention.sentiment === selectedSentiment)
    .filter(mention => !showOnlyHighEngagement || getEngagementScore(mention.engagement) > 50)
    .sort((a, b) => {
      const scoreA = getEngagementScore(a.engagement);
      const scoreB = getEngagementScore(b.engagement);
      return scoreB - scoreA;
    });

  const getSentimentStats = () => {
    const total = mentions.length;
    if (total === 0) return { positive: 0, negative: 0, neutral: 0 };
    
    const positive = mentions.filter(m => m.sentiment === 'positive').length;
    const negative = mentions.filter(m => m.sentiment === 'negative').length;
    const neutral = mentions.filter(m => m.sentiment === 'neutral').length;
    
    return {
      positive: Math.round((positive / total) * 100),
      negative: Math.round((negative / total) * 100),
      neutral: Math.round((neutral / total) * 100)
    };
  };

  const sentimentStats = getSentimentStats();

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
            <span className="text-gray-600">Cargando menciones sociales...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 shadow-sm"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <AtSign className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Escucha Social</h3>
              <p className="text-sm text-gray-600">{mentions.length} menciones encontradas</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Actualizar menciones"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Sentiment Overview */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{sentimentStats.positive}%</div>
            <div className="text-sm text-green-700">Positivo</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{sentimentStats.neutral}%</div>
            <div className="text-sm text-yellow-700">Neutro</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{sentimentStats.negative}%</div>
            <div className="text-sm text-red-700">Negativo</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtros:</span>
          </div>

          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            {platforms.map(platform => (
              <option key={platform.id} value={platform.id}>
                {platform.name}
              </option>
            ))}
          </select>

          <select
            value={selectedSentiment}
            onChange={(e) => setSelectedSentiment(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            {sentiments.map(sentiment => (
              <option key={sentiment.id} value={sentiment.id}>
                {sentiment.name}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showOnlyHighEngagement}
              onChange={(e) => setShowOnlyHighEngagement(e.target.checked)}
              className="rounded border-gray-300"
            />
            Alto engagement
          </label>
        </div>
      </div>

      {/* Mentions List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredMentions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AtSign className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500 mb-2">No se encontraron menciones</p>
            <p className="text-sm text-gray-400">Ajusta los filtros o verifica la configuración</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredMentions.map((mention, index) => {
              const PlatformIcon = getPlatformIcon(mention.platform);
              const engagementScore = getEngagementScore(mention.engagement);
              
              return (
                <motion.div
                  key={mention.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex gap-3">
                    {/* Platform Icon */}
                    <div className={`p-2 rounded-lg ${getPlatformColor(mention.platform)}`}>
                      <PlatformIcon className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 text-sm">@{mention.author}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getSentimentColor(mention.sentiment)}`}>
                            {getSentimentIcon(mention.sentiment)} {mention.sentiment}
                          </span>
                          
                          {engagementScore > 100 && (
                            <span className="flex items-center gap-1 text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                              <TrendingUp className="w-3 h-3" />
                              Viral
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {new Date(mention.createdAt).toLocaleDateString('es-ES', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>

                      {/* Content */}
                      <p className="text-gray-700 text-sm mb-3 line-clamp-2">{mention.content}</p>

                      {/* Engagement Stats */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            <span>{mention.engagement.likes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Share2 className="w-3 h-3" />
                            <span>{mention.engagement.shares}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            <span>{mention.engagement.comments}</span>
                          </div>
                          <div className="text-gray-400">
                            • Score: {engagementScore}
                          </div>
                        </div>

                        <a
                          href={mention.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs"
                        >
                          Ver original
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {mentions.length > 0 && (
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>Mostrando {filteredMentions.length} de {mentions.length}</span>
              
              {mentions.filter(m => getEngagementScore(m.engagement) > 100).length > 0 && (
                <div className="flex items-center gap-1 text-orange-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>{mentions.filter(m => getEngagementScore(m.engagement) > 100).length} con alto engagement</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span>Actualizado hace</span>
              <span className="font-medium">
                {new Date().toLocaleTimeString('es-ES', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};