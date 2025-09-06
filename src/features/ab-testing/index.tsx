import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  BarChart3, 
  Clock, 
  CheckCircle, 
  FileText,
  TrendingUp,
  Users,
  Target
} from 'lucide-react';
import { ABTestForm } from './components/ABTestForm';
import { ABTestList } from './components/ABTestList';
import { ABTestResultados } from './components/ABTestResultados';
import { useABTests } from './hooks/useABTests';
import { ABTest } from './services/abTestingService';

type View = 'dashboard' | 'form' | 'results';

export default function ABTestingPage() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [editingTest, setEditingTest] = useState<ABTest | undefined>();
  const [viewingTest, setViewingTest] = useState<ABTest | undefined>();

  const {
    tests,
    loading,
    error,
    createTest,
    updateTest,
    deleteTest,
    startTest,
    pauseTest,
    completeTest
  } = useABTests();

  const handleCreateNew = () => {
    setEditingTest(undefined);
    setCurrentView('form');
  };

  const handleEdit = (test: ABTest) => {
    setEditingTest(test);
    setCurrentView('form');
  };

  const handleViewResults = (test: ABTest) => {
    setViewingTest(test);
    setCurrentView('results');
  };

  const handleFormSubmit = async (data: Omit<ABTest, 'id' | 'createdAt'>) => {
    if (editingTest) {
      await updateTest(editingTest.id, data);
    } else {
      await createTest(data);
    }
    setCurrentView('dashboard');
    setEditingTest(undefined);
  };

  const handleFormCancel = () => {
    setCurrentView('dashboard');
    setEditingTest(undefined);
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setViewingTest(undefined);
  };

  const getDashboardStats = () => {
    const activeTests = tests.filter(t => t.status === 'active').length;
    const completedTests = tests.filter(t => t.status === 'completed').length;
    const draftTests = tests.filter(t => t.status === 'draft').length;
    const totalParticipants = tests.reduce((sum, test) => 
      sum + test.variants.reduce((varSum, variant) => varSum + variant.metrics.impressions, 0), 0
    );

    return {
      activeTests,
      completedTests,
      draftTests,
      totalParticipants
    };
  };

  const stats = getDashboardStats();

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          <div className="mt-4 text-gray-600">Cargando tests A/B...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">⚠️ Error al cargar los tests</div>
          <div className="text-gray-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <AnimatePresence mode="wait">
        {currentView === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">A/B Testing</h1>
                <p className="text-gray-600">
                  Optimiza tus campañas con tests controlados y decisiones basadas en datos
                </p>
              </div>
              
              <button
                onClick={handleCreateNew}
                className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                Nuevo Test A/B
              </button>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Tests Activos</div>
                    <div className="text-3xl font-bold text-gray-900">{stats.activeTests}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Ejecutándose actualmente
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Finalizados</div>
                    <div className="text-3xl font-bold text-gray-900">{stats.completedTests}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Con resultados disponibles
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <FileText className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">En Borrador</div>
                    <div className="text-3xl font-bold text-gray-900">{stats.draftTests}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Pendientes de iniciar
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Participantes</div>
                    <div className="text-3xl font-bold text-gray-900">
                      {stats.totalParticipants.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Total de impresiones
                </div>
              </motion.div>
            </div>

            {/* Quick Insights */}
            {stats.completedTests > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-100"
              >
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Insights Recientes</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {tests
                    .filter(t => t.status === 'completed' && t.winner)
                    .slice(0, 3)
                    .map(test => {
                      const winnerVariant = test.variants.find(v => v.id === test.winner);
                      const loserVariant = test.variants.find(v => v.id !== test.winner);
                      
                      if (!winnerVariant || !loserVariant) return null;
                      
                      const improvement = loserVariant.metrics.conversionRate > 0 
                        ? ((winnerVariant.metrics.conversionRate - loserVariant.metrics.conversionRate) / 
                           loserVariant.metrics.conversionRate) * 100 
                        : 0;

                      return (
                        <div key={test.id} className="bg-white p-4 rounded-lg shadow-sm">
                          <h4 className="font-medium text-gray-900 mb-2 truncate">{test.name}</h4>
                          <div className="text-2xl font-bold text-green-600 mb-1">
                            +{improvement.toFixed(1)}%
                          </div>
                          <div className="text-sm text-gray-600">
                            {winnerVariant.name} ganó
                          </div>
                        </div>
                      );
                    })
                    .filter(Boolean)}
                </div>
              </motion.div>
            )}

            {/* Tests List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Todos los Tests</h2>
              </div>
              
              <div className="p-6">
                <ABTestList
                  tests={tests}
                  onEdit={handleEdit}
                  onDelete={deleteTest}
                  onStart={startTest}
                  onPause={pauseTest}
                  onComplete={completeTest}
                  onViewResults={handleViewResults}
                />
              </div>
            </div>
          </motion.div>
        )}

        {currentView === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <ABTestForm
                test={editingTest}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
              />
            </div>
          </motion.div>
        )}

        {currentView === 'results' && viewingTest && (
          <motion.div
            key="results"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <ABTestResultados
              test={viewingTest}
              onBack={handleBackToDashboard}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}