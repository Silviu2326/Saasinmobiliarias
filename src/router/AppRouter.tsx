import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from '../components/Layout/Layout';
import { HomePage } from '../pages/HomePage';
import { DashboardPage } from '../pages/DashboardPage';
import { GenericPage } from '../pages/GenericPage';
import LeadsPage from '../features/crm-leads/page';
import ClientesPage from '../features/crm-clientes/page';
import PropietariosPage from '../features/crm-propietarios/page';
import TareasPage from '../features/crm-tareas/page';
import CarteraPage from '../features/crm-cartera/page';
import PropertiesPage from '../features/properties/page';
import PropertiesMapPage from '../features/properties-map/page';
import PropertiesKeysPage from '../features/properties-keys/page';
import PropertiesIncidentsPage from '../features/properties-incidents/page';
import SuppliersPage from '../features/suppliers/page';
import VisitsPage from '../features/visits/page';
import VisitsCalendarPage from '../features/visits-calendar/page';
import VisitsCheckinPage from '../features/visits-checkin/page';
import VisitsRoutePlannerPage from '../features/visits-route-planner/page';
import OffersPage from '../features/operations-offers/page';
import ReservasPage from '../features/operations-reservas/index';
import { ContractsPage } from '../features/operations-contratos';
import VirtualStagingPage from '../features/ia-medios-virtual-staging';
import { PhotoCoachPage } from '../features/ia-medios-photo-coach';
import Portales from '../pages/marketing/portales';
import Landings from '../pages/marketing/landings';
import RPAAutomation from '../pages/marketing/rpa';
import CampanasPage from '../features/campanas';
import ABTestingPage from '../features/ab-testing';
import PixelPage from '../features/pixel';
import ChatbotPage from '../features/chatbot';
import RadarDemandaPage from '../features/radar-demanda';
import CoExclusivasPage from '../features/co-exclusivas';
import TrazabilidadPage from '../features/trazabilidad';
import ReglasPage from '../features/reglas';
import AsistenteLegalPage from '../features/compliance-asistente-legal/page';
import { RgpdPage } from '../features/compliance-rgpd/page';
import AuditoriaPage from '../features/compliance-auditoria/page';
import ComisionesPage from '../features/finance-comisiones/page';
import LiquidacionesPage from '../features/finance-liquidaciones/page';
import FacturasPage from '../features/finance-facturas/page';
import GastosPage from '../features/finance-gastos/page';
import ForecastsPage from '../features/finance-forecast/page';
import KPIsPage from '../features/analytics-kpis/page';
import { ConversionPage } from '../features/analytics-conversion/page';
import CohortesPage from '../features/analytics-cohortes/page';
import ProductividadPage from '../features/analytics-productividad/page';
import FirmaDigitalIntegrationsPage from '../features/integrations-firma-digital/page';
import TelefoniaIntegrationsPage from '../features/integrations-telefonia/page';
import PortalesIntegrationsPage from '../features/integrations-portales/page';
import ContabilidadIntegrationsPage from '../features/integrations-contabilidad/page';
import PagosIntegrationsPage from '../features/integrations-pagos/page';
import AvmPage from '../features/valuation-avm/page';
import ComparablesPage from '../features/valuation-comparables/page';
import PricingPage from '../features/valuation-pricing/page';
import KycPage from '../features/compliance-kyc/page';
import DueDatesPage from '../features/operations-due-dates/page';

export const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          
          {/* CRM Routes */}
          <Route path="crm/leads" element={<LeadsPage />} />
          <Route path="crm/clientes" element={<ClientesPage />} />
          <Route path="crm/propietarios" element={<PropietariosPage />} />
          <Route path="crm/tareas" element={<TareasPage />} />
          <Route path="crm/cartera" element={<CarteraPage />} />

          {/* Properties Routes */}
          <Route path="properties" element={<PropertiesPage />} />
          <Route path="properties/inmuebles" element={<PropertiesPage />} />
          <Route path="properties/mapa" element={<PropertiesMapPage />} />
          <Route path="properties/llaves" element={<PropertiesKeysPage />} />
          <Route path="properties/incidencias" element={<PropertiesIncidentsPage />} />
          <Route path="properties/proveedores" element={<SuppliersPage />} />
          <Route path="properties/visitas" element={<VisitsPage />} />
          <Route path="properties/calendario" element={<VisitsCalendarPage />} />
          <Route path="properties/checkin" element={<VisitsCheckinPage />} />
          <Route path="properties/route-planner" element={<VisitsRoutePlannerPage />} />

          {/* Suppliers Route */}
          <Route path="suppliers" element={<SuppliersPage />} />

          {/* Visits Routes */}
          <Route path="visits" element={<VisitsPage />} />
          <Route path="visits/calendar" element={<VisitsCalendarPage />} />
          <Route path="visits/checkin" element={<VisitsCheckinPage />} />
          <Route path="visits/route-planner" element={<VisitsRoutePlannerPage />} />

          {/* Operations Routes */}
          <Route path="operations/ofertas" element={<OffersPage />} />
          <Route path="operations/reservas" element={<ReservasPage />} />
          <Route path="operations/contratos" element={<ContractsPage />} />
          <Route path="operations/due-dates" element={<DueDatesPage />} />

          {/* Valuation Routes */}
          <Route path="valuation/avm" element={<AvmPage />} />
          <Route path="valuation/comparables" element={<ComparablesPage />} />
          <Route path="valuation/pricing" element={<PricingPage />} />

          {/* Marketing Routes */}
          <Route path="marketing/portales" element={<Portales />} />
          <Route path="marketing/rpa" element={<RPAAutomation />} />
          <Route path="marketing/landings" element={<Landings />} />
          <Route path="marketing/campanas" element={<CampanasPage />} />
          <Route path="marketing/ab-testing" element={<ABTestingPage />} />
          <Route path="marketing/pixel" element={<PixelPage />} />
          <Route path="marketing/chatbot" element={<ChatbotPage />} />

          {/* AI & Media Routes */}
          <Route path="ai-media/photo-coach" element={<PhotoCoachPage />} />
          <Route path="ai-media/virtual-staging" element={<VirtualStagingPage />} />
          <Route path="ia-medios/photo-coach" element={<PhotoCoachPage />} />
          <Route path="ia-medios/virtual-staging" element={<VirtualStagingPage />} />

          {/* Demand Routes */}
          <Route path="demand/radar" element={<RadarDemandaPage />} />

          {/* Marketplace Routes */}
          <Route path="marketplace/co-exclusivas" element={<CoExclusivasPage />} />
          <Route path="marketplace/trazabilidad" element={<TrazabilidadPage />} />
          <Route path="marketplace/reglas" element={<ReglasPage />} />

          {/* Compliance Routes */}
          <Route path="compliance/asistente-legal" element={<AsistenteLegalPage />} />
          <Route path="compliance/rgpd" element={<RgpdPage />} />
          <Route path="compliance/kyc" element={<KycPage />} />
          <Route path="compliance/auditoria" element={<AuditoriaPage />} />

          {/* Finance Routes */}
          <Route path="finance/comisiones" element={<ComisionesPage />} />
                      <Route path="finance/liquidaciones" element={<LiquidacionesPage />} />
            <Route path="finance/facturas" element={<FacturasPage />} />
            <Route path="finance/gastos" element={<GastosPage />} />
            <Route path="finance/forecast" element={<ForecastsPage />} />

          {/* Analytics Routes */}
          <Route path="analytics/kpis" element={<KPIsPage />} />
          <Route path="analytics/conversion" element={<ConversionPage />} />
          <Route path="analytics/cohortes" element={<CohortesPage />} />
          <Route path="analytics/productividad" element={<ProductividadPage />} />

          {/* Integrations Routes */}
          <Route path="integrations/portales" element={<PortalesIntegrationsPage />} />
          <Route path="integrations/firma-digital" element={<FirmaDigitalIntegrationsPage />} />
          <Route path="integrations/telefonia" element={<TelefoniaIntegrationsPage />} />
          <Route path="integrations/contabilidad" element={<ContabilidadIntegrationsPage />} />
          <Route path="integrations/pagos" element={<PagosIntegrationsPage />} />

          {/* System Routes */}
          <Route path="system/usuarios" element={<GenericPage title="Usuarios" />} />
          <Route path="system/equipos" element={<GenericPage title="Equipos & Permisos" />} />
          <Route path="system/multi-sede" element={<GenericPage title="Multi-sede" />} />
          <Route path="system/plantillas" element={<GenericPage title="Plantillas" />} />
          <Route path="system/web-settings" element={<GenericPage title="Web Settings" />} />

          {/* Help Routes */}
          <Route path="help/guias" element={<GenericPage title="Guías" />} />
          <Route path="help/changelog" element={<GenericPage title="Changelog" />} />
          <Route path="help/soporte" element={<GenericPage title="Soporte" />} />
        </Route>
      </Routes>
    </Router>
  );
};