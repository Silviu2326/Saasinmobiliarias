import React, { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  SubjectSummaryCard,
  PricingWizard,
  StrategyPanel,
  RecommendationsPanel,
  ElasticityEstimator,
  DomVsPriceChart,
  OfferSimulator,
  WaterfallNetProceeds,
  PriceBandsHistogram,
  CompetitorWatch,
  ChannelPriceMapping,
  ScenarioManager,
  PriceChangePlanner,
  AlertsAndConstraints,
  AuditTrailDrawer,
  ExportBar
} from './components';
import {
  usePricing,
  useElasticity,
  useDomCurve,
  useOfferSimulator,
  useNetWaterfall,
  useCompetitors,
  useBands,
  useChannels,
  useScenarios,
  usePricePlan,
  useAudit,
  useAlerts,
  useExports
} from './hooks';
import type { Goal, Constraints, ExportOptions } from './types';

const PricingPage: React.FC = () => {
  const { propertyId = '1' } = useParams();
  const [currentPrice, setCurrentPrice] = useState(300000);
  const [showAuditTrail, setShowAuditTrail] = useState(false);

  // Hooks
  const { subject, recommendations, refreshFromAvm, getSuggestions, loading: subjectLoading } = usePricing(propertyId);
  const { analysis: elasticity } = useElasticity(subject);
  const { curve: domCurve } = useDomCurve(subject);
  const { simulation, simulate } = useOfferSimulator();
  const { waterfall } = useNetWaterfall(currentPrice);
  const { competitors, watchCompetitor } = useCompetitors({
    lat: subject?.coordinates?.[0],
    lng: subject?.coordinates?.[1],
    radius: 1000,
    type: subject?.propertyType,
    sqm: subject?.area
  });
  const { bands } = useBands({
    lat: subject?.coordinates?.[0] || 0,
    lng: subject?.coordinates?.[1] || 0,
    type: subject?.propertyType || ''
  });
  const { channels, preview, apply } = useChannels();
  const { scenarios, activeScenario, setActiveScenario, createScenario } = useScenarios();
  const { plan, createPlan } = usePricePlan(propertyId);
  const { events: auditEvents, logEvent } = useAudit(propertyId);
  const { alerts, addAlert, dismissAlert } = useAlerts();
  const { exportData } = useExports();

  // Handlers
  const handleWizardComplete = useCallback(async (data: {
    goal: Goal;
    constraints: Constraints;
    proposal: { anchorPrice: number; listPrice: number; minAcceptable: number };
  }) => {
    try {
      // Create new scenario from wizard data
      const scenario = await createScenario({
        name: `Escenario ${data.goal}`,
        type: 'PERSONALIZADO',
        goal: data.goal,
        constraints: data.constraints,
        listPrice: data.proposal.listPrice,
        anchorPrice: data.proposal.anchorPrice,
        minAcceptable: data.proposal.minAcceptable,
        expectedOutcome: {
          domP50: 45,
          closeProb60d: 0.65,
          netOwner: data.proposal.listPrice * 0.9,
          totalRevenue: data.proposal.listPrice
        },
        createdBy: 'user'
      });

      if (scenario) {
        setActiveScenario(scenario);
        setCurrentPrice(scenario.listPrice);
        
        // Log the action
        logEvent({
          user: 'user',
          action: 'Wizard completed',
          category: 'SCENARIO',
          payload: data
        });
      }
    } catch (error) {
      console.error('Error completing wizard:', error);
    }
  }, [createScenario, setActiveScenario, logEvent]);

  const handleApplyRecommendation = useCallback((rec: any) => {
    setCurrentPrice(rec.listPrice);
    addAlert({
      type: 'SUCCESS',
      category: 'MARKET',
      title: 'Recomendación aplicada',
      message: `Precio actualizado a ${rec.listPrice.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}`,
      dismissible: true
    });
  }, [addAlert]);

  const handleExport = useCallback(async (options: ExportOptions) => {
    const data = {
      subject,
      recommendations,
      scenarios,
      competitors,
      audit: auditEvents
    };
    
    await exportData(options, data);
  }, [subject, recommendations, scenarios, competitors, auditEvents, exportData]);

  const handleApplyToChannels = useCallback(async () => {
    if (channels.length > 0) {
      const channelIds = channels.filter(c => c.active).map(c => c.channel);
      const success = await apply(currentPrice, channelIds);
      
      if (success) {
        addAlert({
          type: 'SUCCESS',
          category: 'TECHNICAL',
          title: 'Precio aplicado',
          message: 'El precio se ha aplicado correctamente a todos los canales activos',
          dismissible: true
        });
        
        logEvent({
          user: 'user',
          action: 'Applied to channels',
          category: 'CHANNEL',
          payload: { price: currentPrice, channels: channelIds }
        });
      }
    }
  }, [channels, apply, currentPrice, addAlert, logEvent]);

  const handleSaveScenario = useCallback(async () => {
    if (activeScenario) {
      const updated = await createScenario({
        ...activeScenario,
        name: `${activeScenario.name} (copia)`,
        listPrice: currentPrice,
        lastModified: new Date().toISOString()
      });
      
      if (updated) {
        addAlert({
          type: 'SUCCESS',
          category: 'MARKET',
          title: 'Escenario guardado',
          message: 'El escenario actual se ha guardado correctamente',
          dismissible: true
        });
      }
    }
  }, [activeScenario, createScenario, currentPrice, addAlert]);

  if (subjectLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos de pricing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Bar */}
      <ExportBar
        onExport={handleExport}
        onApplyToChannels={handleApplyToChannels}
        onSaveScenario={handleSaveScenario}
      />

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="px-6 py-4 space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-center justify-between p-4 rounded-lg ${
                alert.type === 'SUCCESS' ? 'bg-green-50 border border-green-200' :
                alert.type === 'WARNING' ? 'bg-yellow-50 border border-yellow-200' :
                alert.type === 'ERROR' ? 'bg-red-50 border border-red-200' :
                'bg-blue-50 border border-blue-200'
              }`}
            >
              <div>
                <h4 className={`font-medium ${
                  alert.type === 'SUCCESS' ? 'text-green-800' :
                  alert.type === 'WARNING' ? 'text-yellow-800' :
                  alert.type === 'ERROR' ? 'text-red-800' :
                  'text-blue-800'
                }`}>
                  {alert.title}
                </h4>
                <p className={`text-sm ${
                  alert.type === 'SUCCESS' ? 'text-green-700' :
                  alert.type === 'WARNING' ? 'text-yellow-700' :
                  alert.type === 'ERROR' ? 'text-red-700' :
                  'text-blue-700'
                }`}>
                  {alert.message}
                </p>
              </div>
              {alert.dismissible && (
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <SubjectSummaryCard
              subject={subject}
              onRefresh={refreshFromAvm}
            />

            <PricingWizard
              onComplete={handleWizardComplete}
              recommendations={recommendations}
            />

            <StrategyPanel
              currentPrice={currentPrice}
              onPriceChange={setCurrentPrice}
              scenario={activeScenario}
            />

            <PriceChangePlanner
              plan={plan}
              onCreatePlan={createPlan}
              currentPrice={currentPrice}
            />

            <ChannelPriceMapping
              channels={channels}
              currentPrice={currentPrice}
              onPreview={preview}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <RecommendationsPanel
              recommendations={recommendations}
              onApply={handleApplyRecommendation}
              onCompare={(ids) => console.log('Compare scenarios:', ids)}
            />

            <ElasticityEstimator
              analysis={elasticity}
              currentPrice={currentPrice}
            />

            <DomVsPriceChart
              curve={domCurve}
              currentPrice={currentPrice}
              targetDom={45}
            />

            <OfferSimulator
              simulation={simulation}
              onSimulate={simulate}
              currentPrice={currentPrice}
            />

            <WaterfallNetProceeds
              waterfall={waterfall}
              price={currentPrice}
            />

            <PriceBandsHistogram
              bands={bands}
              subject={subject}
              currentPrice={currentPrice}
            />

            <CompetitorWatch
              competitors={competitors}
              onWatch={watchCompetitor}
              subjectPrice={currentPrice}
              subjectArea={subject?.area || 100}
            />

            <AlertsAndConstraints
              alerts={alerts}
              constraints={activeScenario?.constraints}
              price={currentPrice}
              onDismissAlert={dismissAlert}
            />
          </div>
        </div>
      </div>

      {/* Scenario Manager */}
      <div className="fixed bottom-6 right-6">
        <ScenarioManager
          scenarios={scenarios}
          activeScenario={activeScenario}
          onScenarioChange={setActiveScenario}
          onCreateScenario={createScenario}
        />
      </div>

      {/* Audit Trail Drawer */}
      <AuditTrailDrawer
        open={showAuditTrail}
        onClose={() => setShowAuditTrail(false)}
        events={auditEvents}
      />

      {/* Floating Audit Button */}
      <button
        onClick={() => setShowAuditTrail(true)}
        className="fixed bottom-6 left-6 p-3 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-900 transition-colors"
        title="Ver trazabilidad"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

export default PricingPage;