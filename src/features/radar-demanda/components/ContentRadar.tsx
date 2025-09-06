import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Newspaper,
  ExternalLink,
  Calendar,
  Eye,
  Share2,
  MessageCircle,
  TrendingUp,
  Filter,
  RefreshCw,
  Bookmark,
  Tag,
  BarChart3
} from 'lucide-react';
import { ContentItem } from '../services/radarService';

interface ContentRadarProps {
  content: ContentItem[];
  loading?: boolean;
  onRefresh?: () => void;
}

export const ContentRadar: React.FC<ContentRadarProps> = ({
  content,
  loading = false,
  onRefresh
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'engagement' | 'recent' | 'views'>('engagement');
  const [showOnlyTrending, setShowOnlyTrending] = useState(false);

  const categories = ['all', ...new Set(content.map(item => item.category))];
  
  const getEngagementScore = (engagement: ContentItem['engagement']) => {
    return engagement.shares * 3 + engagement.comments * 2 + engagement.views * 0.001;
  };

  const isTrending = (item: ContentItem) => {
    const engagementScore = getEngagementScore(item.engagement);
    const isRecent = (Date.now() - new Date(item.publishedAt).getTime()) < (24 * 60 * 60 * 1000);
    return engagementScore > 100 && isRecent;
  };

  const sortedContent = [...content]
    .filter(item => selectedCategory === 'all' || item.category === selectedCategory)
    .filter(item => !showOnlyTrending || isTrending(item))
    .sort((a, b) => {
      switch (sortBy) {
        case 'engagement':
          return getEngagementScore(b.engagement) - getEngagementScore(a.engagement);
        case 'recent':
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        case 'views':
          return b.engagement.views - a.engagement.views;
        default:
          return 0;
      }
    });

  const getTimeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `hace ${days}d`;
    if (hours > 0) return `hace ${hours}h`;
    return 'ahora';
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Mercado': 'bg-blue-100 text-blue-700',
      'Inversión': 'bg-green-100 text-green-700',
      'Tendencias': 'bg-purple-100 text-purple-700',
      'Análisis': 'bg-orange-100 text-orange-700',
      'Noticias': 'bg-gray-100 text-gray-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const getTopPerformers = () => {
    return content
      .sort((a, b) => getEngagementScore(b.engagement) - getEngagementScore(a.engagement))
      .slice(0, 3);
  };

  const topPerformers = getTopPerformers();

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
            <span className="text-gray-600">Cargando contenido...</span>
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
            <div className="p-2 bg-orange-100 rounded-lg">
              <Newspaper className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Radar de Contenido</h3>
              <p className="text-sm text-gray-600">{content.length} artículos monitoreados</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Actualizar contenido"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Top Performers */}
        {topPerformers.length > 0 && (
          <div className="mb-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">Contenido Top</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {topPerformers.map((item, index) => (
                <div key={item.id} className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-bold text-orange-600">#{index + 1}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(item.category)}`}>
                      {item.category}
                    </span>
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                    {item.title}
                  </h4>
                  <div className="text-xs text-gray-600">
                    {getEngagementScore(item.engagement).toFixed(0)} pts engagement
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtros:</span>
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">Todas las categorías</option>
            {categories.filter(cat => cat !== 'all').map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'engagement' | 'recent' | 'views')}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="engagement">Por engagement</option>
            <option value="recent">Más recientes</option>
            <option value="views">Más vistos</option>
          </select>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showOnlyTrending}
              onChange={(e) => setShowOnlyTrending(e.target.checked)}
              className="rounded border-gray-300"
            />
            Solo trending
          </label>
        </div>
      </div>

      {/* Content List */}
      <div className="max-h-96 overflow-y-auto">
        {sortedContent.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Newspaper className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500 mb-2">No se encontró contenido</p>
            <p className="text-sm text-gray-400">Ajusta los filtros o verifica las fuentes</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sortedContent.map((item, index) => {
              const engagementScore = getEngagementScore(item.engagement);
              const isItemTrending = isTrending(item);
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex gap-4">
                    {/* Ranking */}
                    <div className="flex items-start">
                      <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-semibold text-gray-600">
                        #{index + 1}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(item.category)}`}>
                            {item.category}
                          </span>
                          
                          {isItemTrending && (
                            <span className="flex items-center gap-1 text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">
                              <TrendingUp className="w-3 h-3" />
                              Trending
                            </span>
                          )}

                          <span className="text-xs text-gray-500 font-medium">{item.source}</span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {getTimeAgo(item.publishedAt)}
                        </div>
                      </div>

                      {/* Title and Excerpt */}
                      <h4 className="font-medium text-gray-900 mb-2 line-clamp-2 leading-relaxed">
                        {item.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {item.excerpt}
                      </p>

                      {/* Tags */}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex items-center gap-1 mb-3">
                          <Tag className="w-3 h-3 text-gray-400" />
                          <div className="flex flex-wrap gap-1">
                            {item.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Metrics and Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>{item.engagement.views.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Share2 className="w-3 h-3" />
                            <span>{item.engagement.shares}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            <span>{item.engagement.comments}</span>
                          </div>
                          <div className="flex items-center gap-1 text-orange-600">
                            <BarChart3 className="w-3 h-3" />
                            <span>{engagementScore.toFixed(0)} pts</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            className="p-1 text-gray-400 hover:text-orange-500 transition-colors"
                            title="Guardar artículo"
                          >
                            <Bookmark className="w-4 h-4" />
                          </button>
                          
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs font-medium"
                          >
                            Leer
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
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
      {content.length > 0 && (
        <div className="border-t border-gray-200 p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-orange-600">
                {sortedContent.length}
              </div>
              <div className="text-xs text-gray-600">Artículos</div>
            </div>
            
            <div>
              <div className="text-lg font-bold text-red-600">
                {content.filter(item => isTrending(item)).length}
              </div>
              <div className="text-xs text-gray-600">Trending</div>
            </div>
            
            <div>
              <div className="text-lg font-bold text-blue-600">
                {content.reduce((sum, item) => sum + item.engagement.views, 0).toLocaleString()}
              </div>
              <div className="text-xs text-gray-600">Views Totales</div>
            </div>
            
            <div>
              <div className="text-lg font-bold text-green-600">
                {categories.length - 1}
              </div>
              <div className="text-xs text-gray-600">Categorías</div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};