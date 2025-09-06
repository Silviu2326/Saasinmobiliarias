import type { DrilldownItem } from "../types";
import { formatMonth } from "../utils";

interface DrilldownDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: DrilldownItem[];
  loading: boolean;
  error: string | null;
  title?: string;
}

const DrilldownDrawer = ({ 
  isOpen, 
  onClose, 
  data, 
  loading, 
  error, 
  title = "Detalle de Registros" 
}: DrilldownDrawerProps) => {
  if (!isOpen) return null;

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "LEAD": return "bg-gray-100 text-gray-800";
      case "VISITA": return "bg-blue-100 text-blue-800";
      case "OFERTA": return "bg-yellow-100 text-yellow-800";
      case "RESERVA": return "bg-orange-100 text-orange-800";
      case "CONTRATO": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatPrice = (price: number | undefined) => {
    if (!price) return "-";
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleOpenLead = (id: string) => {
    console.log(`Opening lead ${id} in leads module`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />
        
        <section className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
          <div className="relative w-screen max-w-2xl">
            <div className="h-full flex flex-col bg-white shadow-xl overflow-y-scroll">
              <div className="flex-1">
                <div className="px-4 py-6 bg-gray-50 sm:px-6">
                  <div className="flex items-start justify-between space-x-3">
                    <div className="space-y-1">
                      <h2 className="text-lg font-medium text-gray-900">
                        {title}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {data.length} registros encontrados
                      </p>
                    </div>
                    <div className="h-7 flex items-center">
                      <button
                        type="button"
                        className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={onClose}
                      >
                        <span className="sr-only">Cerrar panel</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="px-4 pt-5 pb-5 sm:px-0 sm:pt-0">
                  {loading ? (
                    <div className="px-6 py-12">
                      <div className="animate-pulse space-y-4">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="border border-gray-200 rounded p-4">
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                            <div className="h-3 bg-gray-100 rounded w-3/4 mb-1"></div>
                            <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : error ? (
                    <div className="px-6 py-12 text-center">
                      <div className="text-red-500 mb-2">⚠️</div>
                      <p className="text-red-600">{error}</p>
                    </div>
                  ) : data.length === 0 ? (
                    <div className="px-6 py-12 text-center text-gray-500">
                      No hay registros que mostrar
                    </div>
                  ) : (
                    <div className="space-y-4 px-6">
                      {data.map((item) => (
                        <div 
                          key={item.id}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="text-sm font-medium text-gray-900">
                                  {item.name || `Lead ${item.id.slice(-4)}`}
                                </h4>
                                {item.currentStage && (
                                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStageColor(item.currentStage)}`}>
                                    {item.currentStage}
                                  </span>
                                )}
                              </div>
                              
                              <div className="text-sm text-gray-600 space-y-1">
                                {item.email && (
                                  <div>📧 {item.email}</div>
                                )}
                                {item.phone && (
                                  <div>📞 {item.phone}</div>
                                )}
                                {item.channel && (
                                  <div className="flex items-center space-x-2">
                                    <span>Canal:</span>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
                                      {item.channel}
                                    </span>
                                    {item.portal && (
                                      <span className="text-xs text-gray-500">
                                        • {item.portal}
                                      </span>
                                    )}
                                  </div>
                                )}
                                {item.agent && (
                                  <div>👤 Agente: {item.agent}</div>
                                )}
                                {item.propertyRef && (
                                  <div>🏠 Ref: {item.propertyRef}</div>
                                )}
                                {item.price && (
                                  <div>💰 {formatPrice(item.price)}</div>
                                )}
                                {item.zone && (
                                  <div>📍 {item.zone} {item.typology && `• ${item.typology}`}</div>
                                )}
                              </div>

                              {item.stageDates && Object.keys(item.stageDates).length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                  <div className="text-xs text-gray-500 mb-2">Cronología:</div>
                                  <div className="space-y-1">
                                    {Object.entries(item.stageDates).map(([stage, date]) => (
                                      <div key={stage} className="flex justify-between text-xs">
                                        <span className="text-gray-600">{stage}:</span>
                                        <span className="text-gray-900">{date}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="ml-4 flex flex-col space-y-2">
                              <button
                                onClick={() => handleOpenLead(item.id)}
                                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                Ver Lead
                              </button>
                              {item.propertyRef && (
                                <button
                                  onClick={() => console.log(`Opening property ${item.propertyRef}`)}
                                  className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                                >
                                  Ver Propiedad
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-shrink-0 px-4 py-4 flex justify-end border-t border-gray-200 bg-gray-50">
                <button
                  type="button"
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={onClose}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DrilldownDrawer;