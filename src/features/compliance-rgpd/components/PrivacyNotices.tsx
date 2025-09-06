import { useState } from "react";
import { usePrivacyNotices } from "../hooks";
import { formatDate } from "../utils";
import { privacyNoticeSchema } from "../schema";

export function PrivacyNotices() {
  const { notices, loading, error, createNotice, updateNotice, previewNotice } = usePrivacyNotices();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "website" as "website" | "form" | "contract" | "email",
    effectiveDate: "",
  });

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      type: "website",
      effectiveDate: "",
    });
    setEditingId(null);
  };

  const handleEdit = (notice: any) => {
    setFormData({
      title: notice.title,
      content: notice.content,
      type: notice.type,
      effectiveDate: notice.effectiveDate || "",
    });
    setEditingId(notice.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validated = privacyNoticeSchema.parse(formData);
      
      if (editingId) {
        await updateNotice(editingId, validated);
      } else {
        await createNotice(validated);
      }
      
      resetForm();
      setShowForm(false);
    } catch (err: any) {
      console.error("Error al guardar aviso:", err.issues || err);
    }
  };

  const handlePreview = async (id: string) => {
    try {
      const html = await previewNotice(id);
      setPreviewHtml(html);
    } catch (err) {
      console.error("Error al previsualizar:", err);
    }
  };

  const handlePublish = async (id: string) => {
    if (confirm("¿Está seguro de que desea publicar este aviso? Se marcará como versión oficial.")) {
      try {
        await updateNotice(id, { status: "published", publishedAt: new Date().toISOString() });
      } catch (err) {
        console.error("Error al publicar:", err);
      }
    }
  };

  const generateLink = (notice: any) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/privacy/${notice.id}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Avisos de Privacidad</h2>
          <p className="text-sm text-gray-600">
            Gestión de políticas de privacidad, cláusulas y avisos con versionado
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Nuevo Aviso
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingId ? "Editar" : "Nuevo"} Aviso de Privacidad
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Título <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Ej: Política de Privacidad Web"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tipo <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full border rounded-md px-3 py-2"
                    required
                  >
                    <option value="website">Sitio Web</option>
                    <option value="form">Formulario</option>
                    <option value="contract">Contrato</option>
                    <option value="email">Email</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Fecha de Vigencia</label>
                <input
                  type="date"
                  value={formData.effectiveDate}
                  onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Contenido <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 h-64"
                  placeholder="Contenido completo del aviso de privacidad..."
                  required
                />
                <p className="text-xs text-gray-600 mt-1">
                  Puede usar HTML básico para formato. Incluya todas las secciones requeridas por RGPD.
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  {editingId ? "Actualizar" : "Crear"} Aviso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {previewHtml && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Previsualización</h3>
              <button
                onClick={() => setPreviewHtml(null)}
                className="text-gray-600 hover:text-gray-800"
              >
                ✕
              </button>
            </div>
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="font-medium">Avisos de Privacidad</h3>
        </div>
        
        {loading ? (
          <div className="p-4 text-center">Cargando avisos...</div>
        ) : error ? (
          <div className="p-4 text-red-600">{error}</div>
        ) : notices.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No hay avisos de privacidad</div>
        ) : (
          <div className="divide-y">
            {notices.map((notice) => (
              <div key={notice.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{notice.title}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      notice.status === "published"
                        ? "bg-green-100 text-green-800"
                        : notice.status === "draft"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {notice.status === "published" ? "Publicado" : 
                       notice.status === "draft" ? "Borrador" : "Archivado"}
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {notice.type}
                    </span>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      v{notice.version}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatDate(notice.updatedAt)} por {notice.updatedBy}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-gray-500">Tipo:</span>
                    <div className="capitalize">{notice.type}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Estado:</span>
                    <div>{notice.status}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Publicado:</span>
                    <div>{notice.publishedAt ? formatDate(notice.publishedAt) : "-"}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Vigente desde:</span>
                    <div>{notice.effectiveDate ? formatDate(notice.effectiveDate) : "-"}</div>
                  </div>
                </div>

                <div className="mb-3">
                  <span className="text-gray-500 text-sm">Contenido:</span>
                  <p className="text-sm mt-1 line-clamp-2">
                    {notice.content.substring(0, 200)}...
                  </p>
                </div>

                {notice.status === "published" && (
                  <div className="mb-3 bg-green-50 p-2 rounded">
                    <span className="text-green-700 font-medium text-sm">Enlace público:</span>
                    <div className="text-green-600 text-sm font-mono break-all">
                      {generateLink(notice)}
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(notice)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handlePreview(notice.id)}
                    className="text-green-600 hover:text-green-800 text-sm font-medium"
                  >
                    Previsualizar
                  </button>
                  {notice.status === "draft" && (
                    <button
                      onClick={() => handlePublish(notice.id)}
                      className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                    >
                      Publicar
                    </button>
                  )}
                  <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                    Ver Diferencias
                  </button>
                  <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                    Copiar Enlace
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <h4 className="font-medium text-indigo-900 mb-2">Elementos Obligatorios RGPD</h4>
        <div className="grid grid-cols-2 gap-4 text-sm text-indigo-800">
          <ul className="space-y-1">
            <li>• Identidad y datos del responsable</li>
            <li>• Datos de contacto del DPO (si aplica)</li>
            <li>• Fines y base jurídica del tratamiento</li>
            <li>• Intereses legítimos (si aplica)</li>
            <li>• Categorías de datos personales</li>
            <li>• Destinatarios de los datos</li>
          </ul>
          <ul className="space-y-1">
            <li>• Transferencias internacionales</li>
            <li>• Plazos de conservación</li>
            <li>• Derechos del interesado</li>
            <li>• Derecho a retirar consentimiento</li>
            <li>• Derecho a reclamación ante AEPD</li>
            <li>• Fuente de datos (si no del interesado)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}