import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  Share2,
  Eye,
  HandshakeIcon,
  MapPin,
  Bed,
  Bath,
  Square,
  Car,
  ArrowUp,
  Trees,
  Home,
  Building,
  Store,
  Briefcase,
  Mountain,
  Tag,
  Phone,
  Mail,
  ExternalLink,
  Star,
  Clock
} from 'lucide-react';
import { CoExclusiva } from '../index';

interface CoExclusivaCardProps {
  propiedad: CoExclusiva;
  viewMode: 'grid' | 'list';
  onClick: (propiedad: CoExclusiva) => void;
  onToggleFavorite: (id: string) => void;
}

export const CoExclusivaCard: React.FC<CoExclusivaCardProps> = ({
  propiedad,
  viewMode,
  onClick,
  onToggleFavorite
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'piso':
        return <Home className="h-4 w-4" />;
      case 'chalet':
        return <Building className="h-4 w-4" />;
      case 'local':
        return <Store className="h-4 w-4" />;
      case 'oficina':
        return <Briefcase className="h-4 w-4" />;
      case 'terreno':
        return <Mountain className="h-4 w-4" />;
      case 'garaje':
        return <Car className="h-4 w-4" />;
      default:
        return <Home className="h-4 w-4" />;
    }
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      piso: 'Piso',
      chalet: 'Chalet',
      local: 'Local',
      oficina: 'Oficina',
      terreno: 'Terreno',
      garaje: 'Garaje'
    };
    return labels[tipo] || tipo;
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'disponible':
        return 'bg-green-100 text-green-800';
      case 'reservada':
        return 'bg-yellow-100 text-yellow-800';
      case 'vendida':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: propiedad.titulo,
          text: `${propiedad.titulo} - ${formatPrice(propiedad.precio)}`,
          url: window.location.href
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // TODO: Show toast notification
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(propiedad.id);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleShare();
  };

  const handleCardClick = () => {
    onClick(propiedad);
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        whileHover={{ scale: 1.01, y: -2 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300"
        onClick={handleCardClick}
      >
        <div className="flex">
          {/* Image */}
          <div className="relative w-64 h-48 flex-shrink-0">
            {!imageLoaded && (
              <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
                <Home className="h-8 w-8 text-gray-400" />
              </div>
            )}
            <img
              src={propiedad.imagenes[0]}
              alt={propiedad.titulo}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
            />
            
            {/* Status Badge */}
            <div className="absolute top-3 left-3">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(propiedad.estado)}`}>
                {propiedad.estado}
              </span>
            </div>

            {/* Featured Badge */}
            {propiedad.destacada && (
              <div className="absolute top-3 right-3">
                <div className="bg-yellow-400 text-yellow-900 p-1.5 rounded-full">
                  <Star className="h-3 w-3" />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="absolute bottom-3 right-3 flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleFavoriteClick}
                className={`p-2 rounded-full transition-colors ${
                  propiedad.favorita
                    ? 'bg-red-500 text-white'
                    : 'bg-white/90 text-gray-600 hover:text-red-500'
                }`}
              >
                <Heart className={`h-4 w-4 ${propiedad.favorita ? 'fill-current' : ''}`} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleShareClick}
                className="p-2 bg-white/90 text-gray-600 hover:text-blue-600 rounded-full transition-colors"
              >
                <Share2 className="h-4 w-4" />
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <div className="p-1 bg-blue-100 rounded">
                    {getTipoIcon(propiedad.tipo)}
                  </div>
                  <span className="text-sm text-gray-600">{getTipoLabel(propiedad.tipo)}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                  {propiedad.titulo}
                </h3>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">
                  {formatPrice(propiedad.precio)}
                </p>
                <p className="text-sm text-gray-500">
                  {propiedad.colaboracion.porcentajeHonorarios}% colaboración
                </p>
              </div>
            </div>

            <div className="flex items-center text-gray-600 mb-3">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm">{propiedad.ubicacion.direccion}, {propiedad.ubicacion.ciudad}</span>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
              {propiedad.caracteristicas.habitaciones > 0 && (
                <div className="flex items-center">
                  <Bed className="h-4 w-4 mr-1" />
                  <span>{propiedad.caracteristicas.habitaciones}</span>
                </div>
              )}
              {propiedad.caracteristicas.banos > 0 && (
                <div className="flex items-center">
                  <Bath className="h-4 w-4 mr-1" />
                  <span>{propiedad.caracteristicas.banos}</span>
                </div>
              )}
              <div className="flex items-center">
                <Square className="h-4 w-4 mr-1" />
                <span>{propiedad.caracteristicas.superficie} m²</span>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {propiedad.descripcion}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <Building className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{propiedad.propietario.inmobiliaria}</p>
                  <p className="text-xs text-gray-500">hace {formatDate(propiedad.fechaCreacion)}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="flex items-center px-3 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                  <Eye className="h-4 w-4 mr-1" />
                  Ver detalles
                </button>
                <button className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <HandshakeIcon className="h-4 w-4 mr-1" />
                  Colaborar
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
      onClick={handleCardClick}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        {!imageLoaded && (
          <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
            <Home className="h-8 w-8 text-gray-400" />
          </div>
        )}
        <img
          src={propiedad.imagenes[0]}
          alt={propiedad.titulo}
          className={`w-full h-full object-cover transition-all duration-300 hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(propiedad.estado)}`}>
            {propiedad.estado}
          </span>
        </div>

        {/* Featured Badge */}
        {propiedad.destacada && (
          <div className="absolute top-3 right-3">
            <div className="bg-yellow-400 text-yellow-900 p-1.5 rounded-full">
              <Star className="h-3 w-3" />
            </div>
          </div>
        )}

        {/* Price */}
        <div className="absolute bottom-3 left-3">
          <div className="bg-black/70 text-white px-3 py-1 rounded-full">
            <span className="text-lg font-bold">{formatPrice(propiedad.precio)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="absolute bottom-3 right-3 flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleFavoriteClick}
            className={`p-2 rounded-full transition-colors ${
              propiedad.favorita
                ? 'bg-red-500 text-white'
                : 'bg-white/90 text-gray-600 hover:text-red-500'
            }`}
          >
            <Heart className={`h-4 w-4 ${propiedad.favorita ? 'fill-current' : ''}`} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleShareClick}
            className="p-2 bg-white/90 text-gray-600 hover:text-blue-600 rounded-full transition-colors"
          >
            <Share2 className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-2">
          <div className="p-1 bg-blue-100 rounded">
            {getTipoIcon(propiedad.tipo)}
          </div>
          <span className="text-sm text-gray-600">{getTipoLabel(propiedad.tipo)}</span>
          <span className="text-sm text-blue-600 font-medium">
            {propiedad.colaboracion.porcentajeHonorarios}% colaboración
          </span>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
          {propiedad.titulo}
        </h3>

        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="text-sm line-clamp-1">{propiedad.ubicacion.direccion}, {propiedad.ubicacion.ciudad}</span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <div className="flex items-center space-x-3">
            {propiedad.caracteristicas.habitaciones > 0 && (
              <div className="flex items-center">
                <Bed className="h-4 w-4 mr-1" />
                <span>{propiedad.caracteristicas.habitaciones}</span>
              </div>
            )}
            {propiedad.caracteristicas.banos > 0 && (
              <div className="flex items-center">
                <Bath className="h-4 w-4 mr-1" />
                <span>{propiedad.caracteristicas.banos}</span>
              </div>
            )}
            <div className="flex items-center">
              <Square className="h-4 w-4 mr-1" />
              <span>{propiedad.caracteristicas.superficie} m²</span>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-1 mb-3">
          {propiedad.caracteristicas.garaje && (
            <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
              <Car className="h-3 w-3 mr-1" />
              Garaje
            </span>
          )}
          {propiedad.caracteristicas.ascensor && (
            <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
              <ArrowUp className="h-3 w-3 mr-1" />
              Ascensor
            </span>
          )}
          {propiedad.caracteristicas.terraza && (
            <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
              <Trees className="h-3 w-3 mr-1" />
              Terraza
            </span>
          )}
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {propiedad.descripcion}
        </p>

        {/* Agency Info */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
              <Building className="h-3 w-3 text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{propiedad.propietario.inmobiliaria}</p>
              <p className="text-xs text-gray-500 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {formatDate(propiedad.fechaCreacion)}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 mt-4">
          <button className="flex-1 flex items-center justify-center px-3 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
            <Eye className="h-4 w-4 mr-1" />
            Ver detalles
          </button>
          <button className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <HandshakeIcon className="h-4 w-4 mr-1" />
            Colaborar
          </button>
        </div>
      </div>
    </motion.div>
  );
};