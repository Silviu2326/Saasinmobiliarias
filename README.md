# 🏠 Real Estate Management Platform

Una plataforma completa de gestión inmobiliaria construida con React, TypeScript y Tailwind CSS que proporciona herramientas avanzadas para gestión de CRM, propiedades, valoración, marketing, compliance, finanzas, analíticas e integraciones.

## 📋 Tabla de Contenidos

- [🚀 Tecnologías](#-tecnologías)
- [✨ Características](#-características)  
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)
- [🎯 Módulos Principales](#-módulos-principales)
- [🔧 Instalación](#-instalación)
- [📖 Uso](#-uso)
- [🏗️ Arquitectura](#️-arquitectura)
- [🤝 Contribución](#-contribución)

## 🚀 Tecnologías

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM v7
- **State Management**: TanStack React Query
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Custom component library with shadcn/ui patterns
- **Icons**: Lucide React
- **Charts**: Recharts
- **Maps**: React Leaflet
- **Animations**: Framer Motion
- **Notifications**: Sonner

## ✨ Características

### 🏢 CRM Completo
- **Gestión de Leads**: Captura, seguimiento y conversión de leads
- **Clientes**: Base de datos completa con historial y matching de propiedades
- **Propietarios**: Gestión de propietarios con informes y cartera de inmuebles
- **Tareas**: Sistema de tareas con vista Kanban y estadísticas
- **Cartera**: Gestión completa de carteras de inmuebles

### 🏠 Gestión de Propiedades
- **Inmuebles**: CRUD completo con filtros avanzados
- **Mapa Interactivo**: Visualización geográfica con clusters
- **Gestión de Llaves**: Control de acceso y ubicación
- **Incidencias**: Seguimiento de problemas y mantenimiento
- **Proveedores**: Red de contactos profesionales

### 📅 Gestión de Visitas
- **Agenda de Visitas**: Programación y seguimiento
- **Calendario**: Vista temporal con eventos
- **Check-in Digital**: Sistema de check-in con historial
- **Planificador de Rutas**: Optimización de rutas de visitas (⭐ Destacado)

### 📊 Operaciones
- **Ofertas**: Gestión completa del proceso de ofertas
- **Reservas**: Control de reservas y documentación
- **Contratos**: Gestión contractual digitalizada
- **Due Dates**: Seguimiento de fechas críticas

### 💰 Valoración Inmobiliaria
- **AVM (Automated Valuation Model)**: Valoración automática con IA
- **Comparables**: Análisis de propiedades similares con:
  - Búsqueda avanzada con filtros geográficos y de características
  - Mapa interactivo con clusters y densidad
  - Sistema de scoring y normalización hedónica  
  - Import/Export en múltiples formatos (CSV, JSON, GeoJSON)
  - Sets guardados para reutilización
  - Trazabilidad completa de cambios
- **Pricing Dinámico**: Estrategias de precios automatizadas (⭐ Destacado)

### 📈 Marketing Digital
- **Gestión de Portales**: Sincronización con portales inmobiliarios
- **RPA**: Automatización de procesos de marketing
- **Landing Pages**: Creación y gestión de páginas de aterrizaje
- **Campañas**: Gestión integral de campañas de marketing
- **A/B Testing**: Optimización basada en pruebas
- **Pixel Tracking**: Seguimiento de conversiones
- **Chatbot**: Atención automatizada

### 🤖 IA & Medios
- **Photo Coach**: Optimización de fotografías con IA
- **Virtual Staging**: Decoración virtual de espacios

### 📊 Análisis de Demanda
- **Radar de Demanda**: Análisis de tendencias del mercado

### 🤝 Marketplace
- **Co-exclusivas**: Gestión de propiedades compartidas
- **Trazabilidad**: Seguimiento completo de operaciones
- **Reglas de Negocio**: Automatización de procesos

### ⚖️ Compliance
- **Asistente Legal**: Herramientas de apoyo jurídico
- **RGPD**: Gestión de protección de datos
- **KYC/AML**: Verificación de identidad
- **Auditoría**: Registros y trazabilidad

### 💼 Finanzas
- **Comisiones**: Cálculo y distribución automática
- **Liquidaciones**: Gestión de pagos
- **Facturas**: Facturación automatizada
- **Gastos**: Control de gastos operacionales
- **Forecast**: Previsiones financieras

### 📊 Analíticas
- **KPIs**: Métricas clave del negocio
- **Conversión**: Análisis de funnels de conversión
- **Cohortes**: Análisis de retención y comportamiento
- **Productividad**: Métricas de rendimiento del equipo

### 🔌 Integraciones
- **Portales Inmobiliarios**: Sincronización automática
- **Firma Digital**: Integración con plataformas de firma
- **Telefonía**: Integración con sistemas telefónicos
- **Contabilidad**: Conexión con ERPs contables
- **Pagos**: Gateways de pago integrados

### ⚙️ Administración
- **Usuarios**: Gestión de perfiles y permisos
- **Equipos**: Organización jerárquica
- **Multi-sede**: Gestión de múltiples oficinas
- **Plantillas**: Documentos personalizables
- **Configuración Web**: Personalización de la plataforma

### 📚 Centro de Ayuda
- **Guías**: Documentación interactiva
- **Changelog**: Historial de actualizaciones
- **Soporte**: Sistema de tickets

## 📁 Estructura del Proyecto

```
src/
├── components/           # Componentes reutilizables
│   ├── ui/              # Componentes base (buttons, inputs, etc.)
│   └── Layout/          # Componentes de layout
├── features/            # Módulos funcionales organizados por dominio
│   ├── crm-*/          # Módulos de CRM
│   ├── properties*/    # Gestión de propiedades
│   ├── visits*/        # Gestión de visitas
│   ├── operations-*/   # Operaciones comerciales
│   ├── valuation-*/    # Valoración inmobiliaria
│   ├── marketing/      # Marketing digital
│   ├── analytics-*/    # Analíticas
│   ├── finance-*/      # Finanzas
│   ├── compliance-*/   # Compliance
│   └── integrations-*/ # Integraciones
├── router/             # Configuración de rutas
├── pages/              # Páginas principales
├── lib/                # Utilidades y configuración
└── types/              # Definiciones de tipos TypeScript
```

### Estructura de Feature

Cada feature sigue una estructura consistente:

```
features/[feature-name]/
├── page.tsx            # Componente principal de la página
├── types.ts            # Definiciones de tipos
├── schema.ts           # Validaciones con Zod
├── apis.ts             # Llamadas a API
├── hooks.ts            # Hooks personalizados
├── utils.ts            # Funciones utilitarias
├── components/         # Componentes específicos del feature
│   ├── Component1.tsx
│   ├── Component2.tsx
│   └── index.ts        # Barrel exports
└── index.ts            # Export principal
```

## 🎯 Módulos Principales

### 📋 CRM
| Módulo | Descripción | Ruta |
|--------|-------------|------|
| **Leads** | Gestión de leads con filtros y seguimiento | `/crm/leads` |
| **Clientes** | Base de datos de clientes con matching | `/crm/clientes` |
| **Propietarios** | Gestión de propietarios e informes | `/crm/propietarios` |
| **Tareas** | Sistema de tareas con Kanban | `/crm/tareas` |
| **Cartera** | Gestión de carteras de inmuebles | `/crm/cartera` |

### 🏠 Propiedades
| Módulo | Descripción | Ruta |
|--------|-------------|------|
| **Inmuebles** | CRUD completo de propiedades | `/properties` |
| **Mapa** | Vista geográfica interactiva | `/properties/mapa` |
| **Llaves** | Control de acceso y ubicación | `/properties/llaves` |
| **Incidencias** | Gestión de problemas | `/properties/incidencias` |

### 📅 Visitas
| Módulo | Descripción | Ruta |
|--------|-------------|------|
| **Visitas** | Programación y seguimiento | `/visits` |
| **Calendario** | Vista temporal con eventos | `/visits/calendar` |
| **Check-in** | Sistema de registro digital | `/visits/checkin` |
| **Rutas** ⭐ | Optimización de rutas | `/visits/route-planner` |

### 💰 Valoración
| Módulo | Descripción | Ruta |
|--------|-------------|------|
| **AVM** | Valoración automática | `/valuation/avm` |
| **Comparables** | Análisis de comparables | `/valuation/comparables` |
| **Pricing** ⭐ | Estrategias dinámicas | `/valuation/pricing` |

### 📈 Analíticas
| Módulo | Descripción | Ruta |
|--------|-------------|------|
| **KPIs** | Métricas principales | `/analytics/kpis` |
| **Conversión** | Análisis de funnels | `/analytics/conversion` |
| **Cohortes** | Análisis de retención | `/analytics/cohortes` |
| **Productividad** | Métricas de equipo | `/analytics/productividad` |

## 🔧 Instalación

1. **Clona el repositorio**
```bash
git clone <repository-url>
cd project
```

2. **Instala las dependencias**
```bash
npm install
```

3. **Configura las variables de entorno**
```bash
cp .env.example .env.local
# Edita .env.local con tus configuraciones
```

4. **Inicia el servidor de desarrollo**
```bash
npm run dev
```

5. **Abre tu navegador**
```
http://localhost:5173
```

## 📖 Uso

### Desarrollo
```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run preview      # Vista previa del build
npm run lint         # Linting del código
```

### Estructura de Componentes

Los componentes siguen el patrón de **composición** y están organizados por dominio:

```tsx
// Ejemplo de uso típico
import { PropertiesPage } from '@/features/properties';
import { LeadsTable } from '@/features/crm-leads/components';
```

### Gestión de Estado

La aplicación utiliza **TanStack React Query** para el estado del servidor y **React hooks** para el estado local:

```tsx
// Ejemplo de hook personalizado
const { properties, isLoading } = useProperties(filters);
const { mutate: createProperty } = useCreateProperty();
```

## 🏗️ Arquitectura

### Principios de Diseño

1. **Modularidad**: Cada feature es independiente y reutilizable
2. **Tipado Fuerte**: TypeScript en toda la aplicación
3. **Validación**: Schemas con Zod para validación robusta
4. **Responsive**: Diseño adaptativo con Tailwind CSS
5. **Accesibilidad**: Componentes accesibles por defecto
6. **Performance**: Lazy loading y optimizaciones automáticas

### Patrones Utilizados

- **Feature-First**: Organización por dominio de negocio
- **Container/Component**: Separación de lógica y presentación
- **Custom Hooks**: Reutilización de lógica de estado
- **Compound Components**: Componentes flexibles y composables
- **Error Boundaries**: Manejo robusto de errores

### APIs y Datos

Todas las features incluyen:
- **Mock APIs**: Datos de demostración realistas
- **TypeScript Types**: Tipado completo de entidades
- **Validation Schemas**: Validación con Zod
- **Custom Hooks**: Abstracción de la lógica de datos
- **Error Handling**: Manejo consistente de errores

## 🤝 Contribución

### Estructura de Commits

```
feat(feature-name): descripción del cambio
fix(feature-name): corrección de bug
docs: actualización de documentación
style: cambios de formato/estilo
refactor(feature-name): refactorización de código
test(feature-name): adición de tests
```

### Desarrollo de Features

1. **Crear la estructura del feature**
```bash
mkdir -p src/features/new-feature/{components}
touch src/features/new-feature/{page,types,apis,hooks}.tsx
```

2. **Implementar siguiendo los patrones existentes**
3. **Agregar la ruta en el router**
4. **Actualizar la documentación**

### Estándares de Código

- **ESLint**: Configuración estricta
- **TypeScript**: Modo strict activado
- **Prettier**: Formateo automático
- **Naming**: camelCase para variables, PascalCase para componentes

---

## 📊 Métricas del Proyecto

- **🎯 Features**: 47 módulos funcionales
- **🔧 Componentes**: 200+ componentes reutilizables  
- **📝 TypeScript**: 100% tipado
- **🎨 UI**: Sistema de diseño consistente
- **📱 Responsive**: Totalmente adaptativo
- **♿ Accesible**: Estándares WCAG

---

**Desarrollado con ❤️ para el sector inmobiliario**