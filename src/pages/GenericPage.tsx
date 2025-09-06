import React from 'react';
import { Star, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface GenericPageProps {
  title: string;
  description?: string;
  starred?: boolean;
}

export const GenericPage: React.FC<GenericPageProps> = ({ 
  title, 
  description = "Esta página está en desarrollo. Próximamente tendrás acceso a todas las funcionalidades.",
  starred = false 
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            {starred && (
              <Star size={24} className="text-yellow-500 fill-current" />
            )}
          </div>
          <p className="text-gray-600 mt-1">{description}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Star size={32} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Página en Desarrollo</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            La funcionalidad de <strong>{title}</strong> está siendo desarrollada. 
            Pronto estará disponible con todas las características que necesitas.
          </p>
          <div className="text-sm text-gray-500">
            <p>Ruta actual: <code className="bg-gray-100 px-2 py-1 rounded">{location.pathname}</code></p>
          </div>
        </div>
      </div>

      {/* Feature Preview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Interfaz Intuitiva</h3>
          <p className="text-blue-700 text-sm">Diseño moderno y fácil de usar</p>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <h3 className="font-semibold text-green-900 mb-2">Automatización</h3>
          <p className="text-green-700 text-sm">Procesos automáticos que ahorran tiempo</p>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
          <h3 className="font-semibold text-purple-900 mb-2">Analytics Avanzados</h3>
          <p className="text-purple-700 text-sm">Métricas detalladas y reportes</p>
        </div>
      </div>
    </div>
  );
};