import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CheckinVisit, CheckinRecord, CheckinFormData } from './types';
import { getTodayVisits, checkin, checkout, getCheckinHistory } from './apis';
import { getVisitStatus, groupVisitsByStatus } from './utils';
import CheckinToolbar from './components/CheckinToolbar';
import CheckinList from './components/CheckinList';
import CheckinDialog from './components/CheckinDialog';
import CheckinHistoryDrawer from './components/CheckinHistoryDrawer';

export default function CheckinPage() {
  const [visits, setVisits] = useState<CheckinVisit[]>([]);
  const [history, setHistory] = useState<CheckinRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [showMapMode, setShowMapMode] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  // Dialog states
  const [checkinDialog, setCheckinDialog] = useState<{
    isOpen: boolean;
    visit: CheckinVisit | null;
    type: 'in' | 'out';
  }>({
    isOpen: false,
    visit: null,
    type: 'in'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load today's visits
  const loadTodayVisits = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getTodayVisits();
      setVisits(data);
    } catch (error) {
      console.error('Error loading today visits:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load checkin history
  const loadHistory = useCallback(async () => {
    setIsHistoryLoading(true);
    try {
      // Use current user ID - in a real app this would come from auth
      const data = await getCheckinHistory('current-user', 15);
      setHistory(data);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsHistoryLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadTodayVisits();
  }, [loadTodayVisits]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      loadTodayVisits();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loadTodayVisits]);

  // Calculate stats - using useMemo for performance
  const todayStats = useMemo(() => {
    const grouped = groupVisitsByStatus(visits);
    return {
      total: visits.length,
      pending: grouped.notStarted.length,
      inProgress: grouped.checkedIn.length,
      completed: grouped.completed.length
    };
  }, [visits]);

  // Handle checkin
  const handleCheckin = (visit: CheckinVisit) => {
    setCheckinDialog({
      isOpen: true,
      visit,
      type: 'in'
    });
  };

  // Handle checkout
  const handleCheckout = (visit: CheckinVisit) => {
    setCheckinDialog({
      isOpen: true,
      visit,
      type: 'out'
    });
  };

  // Handle view details
  const handleViewDetails = (visit: CheckinVisit) => {
    // In a real app, this might navigate to a detailed visit view
    alert(`Detalles de visita ${visit.id}: ${visit.propertyTitle}`);
  };

  // Handle dialog submit
  const handleDialogSubmit = async (data: CheckinFormData) => {
    if (!checkinDialog.visit) return;

    setIsSubmitting(true);
    try {
      let result;
      if (data.type === 'in') {
        result = await checkin(data);
      } else {
        result = await checkout(data);
      }

      // Update visit in state
      setVisits(prevVisits =>
        prevVisits.map(visit => {
          if (visit.id === data.visitId) {
            if (data.type === 'in') {
              return { ...visit, checkinRecord: result };
            } else {
              return { ...visit, checkoutRecord: result };
            }
          }
          return visit;
        })
      );

      // Close dialog
      setCheckinDialog({ isOpen: false, visit: null, type: 'in' });

      // Show success message
      const action = data.type === 'in' ? 'Check-in' : 'Check-out';
      alert(`${action} realizado exitosamente`);
      
    } catch (error) {
      console.error('Error submitting checkin/checkout:', error);
      alert('Error al procesar la acción. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle dialog close
  const handleDialogClose = () => {
    if (!isSubmitting) {
      setCheckinDialog({ isOpen: false, visit: null, type: 'in' });
    }
  };

  // Handle show history
  const handleShowHistory = () => {
    if (!showHistory) {
      loadHistory();
    }
    setShowHistory(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toolbar */}
      <CheckinToolbar
        onRefresh={loadTodayVisits}
        showMapMode={showMapMode}
        onToggleMapMode={() => setShowMapMode(!showMapMode)}
        isLoading={isLoading}
        todayStats={todayStats}
      />

      {/* Main Content */}
      <div className="flex flex-1">
        <CheckinList
          visits={visits}
          onCheckin={handleCheckin}
          onCheckout={handleCheckout}
          onViewDetails={handleViewDetails}
          isLoading={isLoading}
          showMapMode={showMapMode}
        />
      </div>

      {/* Floating Action Button - History */}
      <button
        onClick={handleShowHistory}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
        title="Ver historial"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {/* Dialogs */}
      <CheckinDialog
        visit={checkinDialog.visit}
        isOpen={checkinDialog.isOpen}
        type={checkinDialog.type}
        onClose={handleDialogClose}
        onSubmit={handleDialogSubmit}
        isLoading={isSubmitting}
      />

      <CheckinHistoryDrawer
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        history={history}
        isLoading={isHistoryLoading}
      />
    </div>
  );
}