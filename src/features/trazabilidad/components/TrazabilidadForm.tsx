import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Save,
  Package,
  Building,
  Calendar,
  FileText,
  Upload,
  Plus,
  Minus,
  Info,
  Thermometer,
  Droplets,
  AlertCircle
} from 'lucide-react';
import { Producto } from '../index';

interface TrazabilidadFormProps {
  producto: Producto | null;
  onSave: (data: Partial<Producto>) => void;
  onCancel: () => void;
  isModal?: boolean;
}

export const TrazabilidadForm: React.FC<TrazabilidadFormProps> = ({
  producto,
  onSave,
  onCancel,
  isModal = false
}) => {
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    categoria: '',
    lote: '',
    cantidadInicial: 0,
    cantidadActual: 0,
    unidadMedida: 'unidades',
    proveedor: {
      nombre: '',
      origen: '',
      contacto: ''
    },
    fechas: {
      fabricacion: '',
      caducidad: '',
      registro: new Date().toISOString().split('T')[0]
    },
    ubicacionActual: '',
    certificaciones: [] as string[],
    documentos: [] as Array<{
      nombre: string;
      tipo: string;
      url: string;
      fechaSubida: string;
    }>,
    temperatura: {
      actual: 20,
      minima: -5,
      maxima: 25
    },
    descripcion: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newCertificacion, setNewCertificacion] = useState('');
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (producto) {
      setFormData({
        codigo: producto.codigo,
        nombre: producto.nombre,
        categoria: producto.categoria,
        lote: producto.lote,
        cantidadInicial: producto.cantidadInicial,
        cantidadActual: producto.cantidadActual,
        unidadMedida: producto.unidadMedida,
        proveedor: producto.proveedor,
        fechas: {
          fabricacion: producto.fechas.fabricacion.split('T')[0],
          caducidad: producto.fechas.caducidad.split('T')[0],
          registro: producto.fechas.registro.split('T')[0]
        },
        ubicacionActual: producto.ubicacionActual,
        certificaciones: producto.certificaciones,
        documentos: producto.documentos,
        temperatura: producto.temperatura || {
          actual: 20,
          minima: -5,
          maxima: 25
        },
        descripcion: ''
      });
    }
  }, [producto]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev] as any,
        [field]: value
      }
    }));
  };

  const handleAddCertificacion = () => {
    if (newCertificacion.trim() && !formData.certificaciones.includes(newCertificacion.trim())) {
      setFormData(prev => ({
        ...prev,
        certificaciones: [...prev.certificaciones, newCertificacion.trim()]
      }));
      setNewCertificacion('');
    }
  };

  const handleRemoveCertificacion = (certificacion: string) => {
    setFormData(prev => ({
      ...prev,
      certificaciones: prev.certificaciones.filter(c => c !== certificacion)
    }));
  };

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      Array.from(files).forEach(file => {
        const newDoc = {
          nombre: file.name,
          tipo: file.type,
          url: URL.createObjectURL(file),
          fechaSubida: new Date().toISOString()
        };
        setFormData(prev => ({
          ...prev,
          documentos: [...prev.documentos, newDoc]
        }));
      });
    }
  };

  const handleRemoveDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documentos: prev.documentos.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.codigo.trim()) {
      newErrors.codigo = 'El código del producto es requerido';
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del producto es requerido';
    }

    if (!formData.categoria.trim()) {
      newErrors.categoria = 'La categoría es requerida';
    }

    if (!formData.proveedor.nombre.trim()) {
      newErrors.proveedorNombre = 'El nombre del proveedor es requerido';
    }

    if (!formData.fechas.fabricacion) {
      newErrors.fechaFabricacion = 'La fecha de fabricación es requerida';
    }

    if (!formData.fechas.caducidad) {
      newErrors.fechaCaducidad = 'La fecha de caducidad es requerida';
    }

    if (formData.fechas.fabricacion && formData.fechas.caducidad) {
      if (new Date(formData.fechas.fabricacion) >= new Date(formData.fechas.caducidad)) {
        newErrors.fechaCaducidad = 'La fecha de caducidad debe ser posterior a la de fabricación';
      }
    }

    if (formData.cantidadInicial <= 0) {
      newErrors.cantidadInicial = 'La cantidad inicial debe ser mayor a 0';
    }

    if (formData.cantidadActual < 0) {
      newErrors.cantidadActual = 'La cantidad actual no puede ser negativa';
    }

    if (formData.cantidadActual > formData.cantidadInicial) {
      newErrors.cantidadActual = 'La cantidad actual no puede ser mayor a la inicial';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const productData: Partial<Producto> = {
      codigo: formData.codigo,
      nombre: formData.nombre,
      categoria: formData.categoria,
      lote: formData.lote,
      cantidadInicial: formData.cantidadInicial,
      cantidadActual: formData.cantidadActual,
      unidadMedida: formData.unidadMedida,
      proveedor: formData.proveedor,
      fechas: {
        fabricacion: new Date(formData.fechas.fabricacion).toISOString(),
        caducidad: new Date(formData.fechas.caducidad).toISOString(),
        registro: new Date(formData.fechas.registro).toISOString()
      },
      ubicacionActual: formData.ubicacionActual,
      certificaciones: formData.certificaciones,
      documentos: formData.documentos,
      temperatura: formData.temperatura,
      estado: producto ? producto.estado : 'almacenado'
    };

    onSave(productData);
  };

  const categorias = [
    'Alimentos',
    'Medicamentos',
    'Cosméticos',
    'Químicos',
    'Textiles',
    'Electrónicos',
    'Automóviles',
    'Otros'
  ];

  const unidadesMedida = [
    'unidades',
    'kilogramos',
    'gramos',
    'litros',
    'mililitros',
    'metros',
    'centímetros',
    'cajas',
    'pallets'
  ];

  const certificacionesComunes = [
    'ISO 9001',
    'ISO 22000',
    'HACCP',
    'BRC',
    'FDA',
    'CE',
    'Halal',
    'Kosher',
    'Orgánico',
    'Fair Trade'
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  return (
    <div className={`${isModal ? 'p-6' : 'bg-white rounded-lg shadow-sm border border-gray-200 p-6'}`}>
      {isModal && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {producto ? 'Editar Producto' : 'Registrar Nuevo Producto'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Información Básica */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Información Básica del Producto
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código de Producto *
              </label>
              <input
                type="text"
                value={formData.codigo}
                onChange={(e) => handleInputChange('codigo', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.codigo ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: PRD-001-2024"
              />
              {errors.codigo && (
                <p className="mt-1 text-sm text-red-600">{errors.codigo}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lote
              </label>
              <input
                type="text"
                value={formData.lote}
                onChange={(e) => handleInputChange('lote', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: LOT-240115"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Producto *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.nombre ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: Yogur Natural Ecológico"
              />
              {errors.nombre && (
                <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría *
              </label>
              <select
                value={formData.categoria}
                onChange={(e) => handleInputChange('categoria', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.categoria ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Seleccionar categoría</option>
                {categorias.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.categoria && (
                <p className="mt-1 text-sm text-red-600">{errors.categoria}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación Actual
              </label>
              <input
                type="text"
                value={formData.ubicacionActual}
                onChange={(e) => handleInputChange('ubicacionActual', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Almacén Central - Estante A3"
              />
            </div>
          </div>
        </div>

        {/* Cantidad */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cantidad</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad Inicial *
              </label>
              <input
                type="number"
                value={formData.cantidadInicial}
                onChange={(e) => handleInputChange('cantidadInicial', parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.cantidadInicial ? 'border-red-500' : 'border-gray-300'
                }`}
                min="1"
              />
              {errors.cantidadInicial && (
                <p className="mt-1 text-sm text-red-600">{errors.cantidadInicial}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad Actual *
              </label>
              <input
                type="number"
                value={formData.cantidadActual}
                onChange={(e) => handleInputChange('cantidadActual', parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.cantidadActual ? 'border-red-500' : 'border-gray-300'
                }`}
                min="0"
              />
              {errors.cantidadActual && (
                <p className="mt-1 text-sm text-red-600">{errors.cantidadActual}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unidad de Medida
              </label>
              <select
                value={formData.unidadMedida}
                onChange={(e) => handleInputChange('unidadMedida', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {unidadesMedida.map((unidad) => (
                  <option key={unidad} value={unidad}>{unidad}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Información del Proveedor */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Building className="h-5 w-5 mr-2" />
            Información del Proveedor
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Proveedor *
              </label>
              <input
                type="text"
                value={formData.proveedor.nombre}
                onChange={(e) => handleNestedChange('proveedor', 'nombre', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.proveedorNombre ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: Lácteos del Valle S.L."
              />
              {errors.proveedorNombre && (
                <p className="mt-1 text-sm text-red-600">{errors.proveedorNombre}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Origen
              </label>
              <input
                type="text"
                value={formData.proveedor.origen}
                onChange={(e) => handleNestedChange('proveedor', 'origen', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Asturias, España"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contacto
              </label>
              <input
                type="text"
                value={formData.proveedor.contacto}
                onChange={(e) => handleNestedChange('proveedor', 'contacto', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: contacto@lacteosdelvalle.com o +34 985 123 456"
              />
            </div>
          </div>
        </div>

        {/* Fechas */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Fechas Importantes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Fabricación *
              </label>
              <input
                type="date"
                value={formData.fechas.fabricacion}
                onChange={(e) => handleNestedChange('fechas', 'fabricacion', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.fechaFabricacion ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.fechaFabricacion && (
                <p className="mt-1 text-sm text-red-600">{errors.fechaFabricacion}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Caducidad *
              </label>
              <input
                type="date"
                value={formData.fechas.caducidad}
                onChange={(e) => handleNestedChange('fechas', 'caducidad', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.fechaCaducidad ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.fechaCaducidad && (
                <p className="mt-1 text-sm text-red-600">{errors.fechaCaducidad}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Registro
              </label>
              <input
                type="date"
                value={formData.fechas.registro}
                onChange={(e) => handleNestedChange('fechas', 'registro', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Condiciones de Almacenamiento */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Thermometer className="h-5 w-5 mr-2" />
            Condiciones de Almacenamiento
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temperatura Actual (°C)
              </label>
              <input
                type="number"
                value={formData.temperatura.actual}
                onChange={(e) => handleNestedChange('temperatura', 'actual', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temperatura Mínima (°C)
              </label>
              <input
                type="number"
                value={formData.temperatura.minima}
                onChange={(e) => handleNestedChange('temperatura', 'minima', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temperatura Máxima (°C)
              </label>
              <input
                type="number"
                value={formData.temperatura.maxima}
                onChange={(e) => handleNestedChange('temperatura', 'maxima', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.1"
              />
            </div>
          </div>
        </div>

        {/* Certificaciones */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Certificaciones
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newCertificacion}
                onChange={(e) => setNewCertificacion(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Agregar certificación personalizada"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCertificacion())}
              />
              <button
                type="button"
                onClick={handleAddCertificacion}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {certificacionesComunes.map((cert) => (
                <button
                  key={cert}
                  type="button"
                  onClick={() => {
                    if (!formData.certificaciones.includes(cert)) {
                      setFormData(prev => ({
                        ...prev,
                        certificaciones: [...prev.certificaciones, cert]
                      }));
                    }
                  }}
                  className={`px-3 py-1 text-xs rounded-full border ${
                    formData.certificaciones.includes(cert)
                      ? 'bg-blue-100 text-blue-700 border-blue-300'
                      : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {cert}
                </button>
              ))}
            </div>

            {formData.certificaciones.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Certificaciones seleccionadas:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.certificaciones.map((cert) => (
                    <motion.div
                      key={cert}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="inline-flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      {cert}
                      <button
                        type="button"
                        onClick={() => handleRemoveCertificacion(cert)}
                        className="ml-2 text-green-500 hover:text-green-700"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Documentos */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Documentos Asociados
          </h3>
          
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              Arrastra archivos aquí o <label className="text-blue-600 cursor-pointer hover:text-blue-700">
                selecciona archivos
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </label>
            </p>
            <p className="text-xs text-gray-500">PDF, DOC, DOCX, JPG, PNG hasta 10MB</p>
          </div>

          {formData.documentos.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-gray-700">Documentos subidos:</p>
              {formData.documentos.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-700">{doc.nombre}</span>
                    <span className="text-xs text-gray-500 ml-2">({doc.tipo})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveDocument(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {producto ? 'Actualizar' : 'Registrar'} Producto
          </motion.button>
        </div>
      </form>

      {/* Info Panel */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800 font-medium">Consejos para el registro:</p>
            <ul className="text-xs text-blue-700 mt-1 space-y-1">
              <li>• Utiliza códigos únicos y descriptivos para cada producto</li>
              <li>• Asegúrate de incluir todas las certificaciones relevantes</li>
              <li>• Mantén actualizada la ubicación del producto en todo momento</li>
              <li>• Sube documentos de calidad legibles (certificados, análisis, etc.)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};