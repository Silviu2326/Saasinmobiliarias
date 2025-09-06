import { useState } from "react";
import { useCookies } from "../hooks";
import { getCookieCategoryName, generateCookieBanner } from "../utils";
import { cookieItemSchema } from "../schema";

export function CookieManager() {
  const { categories, cookies, loading, error, createCategory, createCookie } = useCookies();
  const [showCookieForm, setShowCookieForm] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    provider: "",
    purpose: "",
    duration: "",
    category: "necessary" as "necessary" | "analytics" | "marketing" | "other",
    description: "",
    domain: "",
    httpOnly: false,
    secure: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validated = cookieItemSchema.parse(formData);
      await createCookie(validated);
      setFormData({
        name: "",
        provider: "",
        purpose: "",
        duration: "",
        category: "necessary",
        description: "",
        domain: "",
        httpOnly: false,
        secure: true,
      });
      setShowCookieForm(false);
    } catch (err: any) {
      console.error("Error al crear cookie:", err.issues || err);
    }
  };

  const handleGenerateBanner = () => {
    const bannerCode = generateCookieBanner();
    setShowBanner(true);
  };

  const cookiesByCategory = cookies.reduce((acc, cookie) => {
    if (!acc[cookie.category]) {
      acc[cookie.category] = [];
    }
    acc[cookie.category].push(cookie);
    return acc;
  }, {} as Record<string, typeof cookies>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Gestor de Cookies</h2>
          <p className="text-sm text-gray-600">
            Gestión de categorías, cookies y generación de banners de consentimiento
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleGenerateBanner}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Generar Banner
          </button>
          <button
            onClick={() => setShowCookieForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Nueva Cookie
          </button>
        </div>
      </div>

      {showCookieForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Nueva Cookie</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="_ga, session_id"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Proveedor <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="Google Analytics, Propio"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Finalidad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="Análisis de tráfico, Autenticación"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Duración <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="2 años, Sesión, 30 días"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full border rounded-md px-3 py-2"
                  required
                >
                  <option value="necessary">Necesarias</option>
                  <option value="analytics">Analíticas</option>
                  <option value="marketing">Marketing</option>
                  <option value="other">Otras</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Dominio</label>
                <input
                  type="text"
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder=".ejemplo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 h-20"
                  placeholder="Descripción detallada del propósito de la cookie..."
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.httpOnly}
                    onChange={(e) => setFormData({ ...formData, httpOnly: e.target.checked })}
                  />
                  <span className="text-sm">Solo HTTP (no accesible via JavaScript)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.secure}
                    onChange={(e) => setFormData({ ...formData, secure: e.target.checked })}
                  />
                  <span className="text-sm">Secure (solo HTTPS)</span>
                </label>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCookieForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Crear Cookie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Código del Banner</h3>
              <button
                onClick={() => setShowBanner(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Copie este código HTML y pégalo antes del cierre de la etiqueta &lt;/body&gt; en su sitio web:
              </p>
              <div className="bg-gray-900 text-green-400 p-4 rounded-md overflow-x-auto">
                <pre className="text-xs whitespace-pre-wrap">
                  {generateCookieBanner()}
                </pre>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generateCookieBanner());
                  alert("Código copiado al portapapeles");
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Copiar Código
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="font-medium">Cookies por Categoría</h3>
        </div>
        
        {loading ? (
          <div className="p-4 text-center">Cargando cookies...</div>
        ) : error ? (
          <div className="p-4 text-red-600">{error}</div>
        ) : cookies.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No hay cookies registradas</div>
        ) : (
          <div className="divide-y">
            {Object.entries(cookiesByCategory).map(([category, categoryCookies]) => (
              <div key={category} className="p-4">
                <h4 className="font-medium mb-3 flex items-center">
                  {getCookieCategoryName(category)}
                  <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {categoryCookies.length}
                  </span>
                  {category === "necessary" && (
                    <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                      Obligatorias
                    </span>
                  )}
                </h4>
                <div className="space-y-3">
                  {categoryCookies.map((cookie) => (
                    <div key={cookie.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium font-mono text-sm">{cookie.name}</span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {cookie.provider}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {cookie.duration}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-2">
                        <div>
                          <span className="text-gray-500">Finalidad:</span>
                          <div>{cookie.purpose}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Dominio:</span>
                          <div>{cookie.domain || "-"}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Propiedades:</span>
                          <div className="flex space-x-1">
                            {cookie.httpOnly && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-1 py-0.5 rounded">
                                HttpOnly
                              </span>
                            )}
                            {cookie.secure && (
                              <span className="text-xs bg-green-100 text-green-600 px-1 py-0.5 rounded">
                                Secure
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {cookie.description && (
                        <div>
                          <span className="text-gray-500 text-sm">Descripción:</span>
                          <p className="text-sm mt-1">{cookie.description}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-4">
          <h4 className="font-medium mb-3">Configuración del Banner</h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Banner habilitado:</span>
              <span className="text-green-600 font-medium">Sí</span>
            </div>
            <div className="flex justify-between">
              <span>Modo estricto:</span>
              <span className="text-green-600 font-medium">Activado</span>
            </div>
            <div className="flex justify-between">
              <span>Cookies necesarias:</span>
              <span className="text-blue-600 font-medium">{cookiesByCategory.necessary?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Cookies opcionales:</span>
              <span className="text-yellow-600 font-medium">
                {Object.entries(cookiesByCategory)
                  .filter(([key]) => key !== "necessary")
                  .reduce((acc, [, cookies]) => acc + cookies.length, 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="font-medium text-orange-900 mb-2">Cumplimiento Legal</h4>
          <ul className="text-sm text-orange-800 space-y-1">
            <li>✓ Categorización clara de cookies</li>
            <li>✓ Información sobre finalidad y duración</li>
            <li>✓ Consentimiento granular por categoría</li>
            <li>✓ Posibilidad de retirar consentimiento</li>
            <li>✓ Cookies necesarias identificadas</li>
            <li>✓ Banner cumple con RGPD y LSSI-CE</li>
          </ul>
        </div>
      </div>
    </div>
  );
}