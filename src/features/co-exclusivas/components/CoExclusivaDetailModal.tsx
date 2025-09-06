import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Heart,
  Share2,
  HandshakeIcon,
  MapPin,
  Bed,
  Bath,
  Square,
  Car,
  Elevator,
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
  Clock,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Info,
  User,
  Calendar,
  DollarSign,
  Percent,
  FileText,
  Users,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { CoExclusiva } from '../index';

interface CoExclusivaDetailModalProps {
  propiedad: CoExclusiva;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
}

export const CoExclusivaDetailModal: React.FC<CoExclusivaDetailModalProps> = ({
  propiedad,
  onClose,
  onToggleFavorite
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullImage, setShowFullImage] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'collaboration' | 'location'>('details');

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'piso':
        return <Home className="h-5 w-5" />;
      case 'chalet':
        return <Building className="h-5 w-5" />;
      case 'local':
        return <Store className="h-5 w-5" />;
      case 'oficina':
        return <Briefcase className="h-5 w-5" />;
      case 'terreno':
        return <Mountain className="h-5 w-5" />;
      case 'garaje':
        return <Car className="h-5 w-5" />;
      default:
        return <Home className="h-5 w-5" />;
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
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === propiedad.imagenes.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? propiedad.imagenes.length - 1 : prev - 1
    );
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
      navigator.clipboard.writeText(window.location.href);
      // TODO: Show toast notification
    }
  };

  const handleCollaboration = () => {
    setShowContactForm(true);
  };

  const ContactForm = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Solicitar Colaboración</h3>
          <button
            onClick={() => setShowContactForm(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre completo
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tu nombre"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="tu@email.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+34 600 000 000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agencia
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre de tu agencia"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mensaje (opcional)
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Cuéntanos sobre tu interés en esta colaboración..."
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowContactForm(false)}
              className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Enviar Solicitud
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                {getTipoIcon(propiedad.tipo)}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {propiedad.titulo}
                </h2>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(propiedad.estado)}`}>
                    {propiedad.estado}
                  </span>
                  <span className="text-sm text-gray-600">{getTipoLabel(propiedad.tipo)}</span>
                  {propiedad.destacada && (
                    <div className="bg-yellow-100 text-yellow-800 p-1 rounded">
                      <Star className="h-3 w-3" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onToggleFavorite(propiedad.id)}
                className={`p-2 rounded-lg transition-colors ${
                  propiedad.favorita
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gray-100 text-gray-600 hover:text-red-600'
                }`}
              >
                <Heart className={`h-5 w-5 ${propiedad.favorita ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-2 bg-gray-100 text-gray-600 hover:text-blue-600 rounded-lg transition-colors"
              >
                <Share2 className="h-5 w-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 bg-gray-100 text-gray-600 hover:text-gray-800 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row max-h-[calc(90vh-80px)]">
            {/* Image Gallery */}
            <div className="lg:w-1/2 relative">
              <div className="relative h-64 lg:h-full">
                <img
                  src={propiedad.imagenes[currentImageIndex]}
                  alt={`${propiedad.titulo} - Imagen ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Image Navigation */}
                {propiedad.imagenes.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {propiedad.imagenes.length}
                </div>

                {/* Fullscreen Button */}
                <button
                  onClick={() => setShowFullImage(true)}
                  className="absolute bottom-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              </div>

              {/* Thumbnail Navigation */}
              {propiedad.imagenes.length > 1 && (
                <div className="flex space-x-2 p-4 overflow-x-auto">
                  {propiedad.imagenes.map((imagen, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                        index === currentImageIndex ? 'border-blue-500' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={imagen}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="lg:w-1/2 overflow-y-auto">
              <div className="p-6">
                {/* Price and Basic Info */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-3xl font-bold text-blue-600 mb-2">
                      {formatPrice(propiedad.precio)}
                    </p>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{propiedad.ubicacion.direccion}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {propiedad.ubicacion.ciudad}, {propiedad.ubicacion.codigoPostal}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {propiedad.colaboracion.porcentajeHonorarios}% comisión
                    </div>
                  </div>
                </div>

                {/* Quick Features */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {propiedad.caracteristicas.habitaciones > 0 && (
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Bed className="h-5 w-5 text-gray-600" />
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {propiedad.caracteristicas.habitaciones}
                      </p>
                      <p className="text-sm text-gray-600">Habitaciones</p>
                    </div>
                  )}
                  {propiedad.caracteristicas.banos > 0 && (
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Bath className="h-5 w-5 text-gray-600" />
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {propiedad.caracteristicas.banos}
                      </p>
                      <p className="text-sm text-gray-600">Baños</p>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Square className="h-5 w-5 text-gray-600" />
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {propiedad.caracteristicas.superficie}
                    </p>
                    <p className="text-sm text-gray-600">m²</p>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-4">
                  <nav className="flex space-x-8">
                    {[
                      { id: 'details', label: 'Detalles', icon: Info },
                      { id: 'collaboration', label: 'Colaboración', icon: HandshakeIcon },
                      { id: 'location', label: 'Ubicación', icon: MapPin }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as typeof activeTab)}
                        className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab.id
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <tab.icon className="h-4 w-4 mr-2" />
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="mb-6">
                  {activeTab === 'details' && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h3>
                        <p className="text-gray-600 leading-relaxed">{propiedad.descripcion}</p>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Características</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {propiedad.caracteristicas.terraza && (
                            <div className="flex items-center">
                              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                              <span className="text-sm text-gray-700">Terraza</span>
                            </div>
                          )}
                          {propiedad.caracteristicas.jardin && (
                            <div className="flex items-center">
                              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                              <span className="text-sm text-gray-700">Jardín</span>
                            </div>
                          )}
                          {propiedad.caracteristicas.garaje && (
                            <div className="flex items-center">
                              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                              <span className="text-sm text-gray-700">Garaje</span>
                            </div>
                          )}
                          {propiedad.caracteristicas.ascensor && (
                            <div className="flex items-center">
                              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                              <span className="text-sm text-gray-700">Ascensor</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Información de publicación</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>Publicado el {formatDate(propiedad.fechaPublicacion)}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>Última actualización: {formatDate(propiedad.fechaModificacion)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'collaboration' && (
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <HandshakeIcon className="h-6 w-6 text-blue-600 mr-3 mt-1" />
                          <div>
                            <h3 className="text-lg font-semibold text-blue-900 mb-2">
                              Detalles de la Colaboración
                            </h3>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-blue-800">Porcentaje de honorarios:</span>
                                <span className="font-semibold text-blue-900">
                                  {propiedad.colaboracion.porcentajeHonorarios}%
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-blue-800">Tipo de colaboración:</span>
                                <span className="font-semibold text-blue-900 capitalize">
                                  {propiedad.colaboracion.tipoColaboracion}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Condiciones</h3>
                        <p className="text-gray-600">{propiedad.colaboracion.condiciones}</p>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-green-900 mb-2">¿Cómo funciona?</h3>
                        <ul className="space-y-2 text-sm text-green-800">
                          <li className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                            Solicita la colaboración usando el botón de abajo
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                            La agencia revisará tu solicitud y te contactará
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                            Acordaréis los términos específicos de colaboración
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                            Compartid los honorarios según lo acordado
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeTab === 'location' && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Dirección</h3>
                        <div className="space-y-2">
                          <p className="text-gray-600">{propiedad.ubicacion.direccion}</p>
                          <p className="text-gray-600">
                            {propiedad.ubicacion.ciudad}, {propiedad.ubicacion.codigoPostal}
                          </p>
                        </div>
                      </div>

                      {/* Map Placeholder */}
                      <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <MapPin className="h-8 w-8 mx-auto mb-2" />
                          <p>Mapa interactivo</p>
                          <p className="text-sm">Lat: {propiedad.ubicacion.coordenadas.lat}</p>
                          <p className="text-sm">Lng: {propiedad.ubicacion.coordenadas.lng}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Agency Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Agencia</h3>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      <Building className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{propiedad.propietario.inmobiliaria}</h4>
                      <p className="text-gray-600 mb-2">{propiedad.propietario.nombre}</p>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-2" />
                          <span>{propiedad.propietario.telefono}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2" />
                          <span>{propiedad.propietario.email}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCollaboration}
                    className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <HandshakeIcon className="h-5 w-5 mr-2" />
                    Solicitar Colaboración
                  </motion.button>
                  <button className="px-6 py-3 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
                    <Phone className="h-5 w-5" />
                  </button>
                  <button className="px-6 py-3 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
                    <Mail className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Contact Form Modal */}
      <AnimatePresence>
        {showContactForm && <ContactForm />}
      </AnimatePresence>

      {/* Full Image Modal */}
      <AnimatePresence>
        {showFullImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[70] flex items-center justify-center"
            onClick={() => setShowFullImage(false)}
          >
            <button
              onClick={() => setShowFullImage(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-[71]"
            >
              <X className="h-8 w-8" />
            </button>
            <img
              src={propiedad.imagenes[currentImageIndex]}
              alt={propiedad.titulo}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            {propiedad.imagenes.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};