import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CalendarVisit, CalendarState, CalendarFilters } from './types';
import { generateMockCalendarVisits } from './apis';
import { 
  getWeekDays, 
  getWeekStart, 
  getNextWeek, 
  getPrevWeek, 
  getNextDay, 
  getPrevDay,
  getCurrentWeekStart, 
  getCurrentDay,
  formatDate,
  queryStringToState,
  stateToQueryString,
  simulateVisitDrag
} from './utils';

import CalendarToolbar from './components/CalendarToolbar';
import CalendarGrid from './components/CalendarGrid';

export default function VisitsCalendarPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [visits, setVisits] = useState<CalendarVisit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Parse state from URL - memoized to prevent unnecessary re-renders
  const state: CalendarState = useMemo(() => ({
    ...queryStringToState(searchParams.toString()),
    weekStart: searchParams.get('weekStart') || getCurrentWeekStart(),
    day: searchParams.get('day') || getCurrentDay()
  }), [searchParams]);

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const updateState = useCallback((newState: Partial<CalendarState>) => {
    const updatedState = { ...state, ...newState };
    const queryString = stateToQueryString(updatedState);
    setSearchParams(queryString ? `?${queryString}` : '');
  }, [state, setSearchParams]);

  // Get date range for API call
  const getDateRange = useCallback(() => {
    if (state.view === 'week') {
      const weekStart = state.weekStart || getCurrentWeekStart();
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return {
        from: weekStart,
        to: weekEnd.toISOString().split('T')[0]
      };
    } else {
      const day = state.day || getCurrentDay();
      return {
        from: day,
        to: day
      };
    }
  }, [state.view, state.weekStart, state.day]);

  // Load visits
  const loadVisits = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const dateRange = getDateRange();
      
      // In development, use mock data
      const result = generateMockCalendarVisits(30, dateRange);
      setVisits(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los datos');
      setVisits([]);
    } finally {
      setIsLoading(false);
    }
  }, [getDateRange]);

  // Debounced version of loadVisits to prevent excessive calls
  const debouncedLoadVisits = useMemo(() => {
    const debounce = (func: () => void, delay: number) => {
      let timeoutId: NodeJS.Timeout;
      return () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(func, delay);
      };
    };
    return debounce(loadVisits, 300);
  }, [loadVisits]);

  // Load visits when state changes
  useEffect(() => {
    debouncedLoadVisits();
  }, [debouncedLoadVisits]);

  // Get days to display - memoized for performance
  const getDays = useMemo(() => () => {
    if (state.view === 'week') {
      const weekStart = state.weekStart || getCurrentWeekStart();
      return getWeekDays(weekStart);
    } else {
      const day = state.day || getCurrentDay();
      const date = new Date(day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      return [{
        date: day,
        dayName: date.toLocaleDateString('es-ES', { weekday: 'long' }),
        dayNumber: date.getDate(),
        isToday: date.getTime() === today.getTime(),
        isPast: date < today,
        visits: []
      }];
    }
  }, [state.view, state.weekStart, state.day]);

  // Get current date label - memoized for performance
  const getCurrentDateLabel = useMemo(() => () => {
    if (state.view === 'week') {
      const weekStart = new Date(state.weekStart || getCurrentWeekStart());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const startMonth = weekStart.toLocaleDateString('es-ES', { month: 'long' });
      const endMonth = weekEnd.toLocaleDateString('es-ES', { month: 'long' });
      const year = weekStart.getFullYear();
      
      if (startMonth === endMonth) {
        return `${startMonth} ${year}`;
      } else {
        return `${startMonth} - ${endMonth} ${year}`;
      }
    } else {
      return formatDate(state.day || getCurrentDay());
    }
  }, [state.view, state.weekStart, state.day]);

  // Handle navigation
  const handleNavigate = (direction: 'prev' | 'next' | 'today') => {
    if (direction === 'today') {
      if (state.view === 'week') {
        updateState({ weekStart: getCurrentWeekStart() });
      } else {
        updateState({ day: getCurrentDay() });
      }
      return;
    }

    if (state.view === 'week') {
      const currentWeekStart = state.weekStart || getCurrentWeekStart();
      const newWeekStart = direction === 'next' 
        ? getNextWeek(currentWeekStart)
        : getPrevWeek(currentWeekStart);
      updateState({ weekStart: newWeekStart });
    } else {
      const currentDay = state.day || getCurrentDay();
      const newDay = direction === 'next' 
        ? getNextDay(currentDay)
        : getPrevDay(currentDay);
      updateState({ day: newDay });
    }
  };

  // Handle view change
  const handleViewChange = (view: 'week' | 'day') => {
    updateState({ view });
  };

  // Handle agent change
  const handleAgenteChange = (agente: string) => {
    updateState({ agente: agente || undefined });
  };

  // Handle visit click
  const handleVisitClick = (visit: CalendarVisit) => {
    showNotification('info', `Viendo detalles de visita con ${visit.clienteNombre}`);
  };

  // Handle slot click
  const handleSlotClick = (date: string, timeSlot: string) => {
    showNotification('info', `Creando visita para ${date} a las ${timeSlot}`);
  };

  // Handle visit drag
  const handleVisitDrag = async (visitId: string, newDate: string, newTimeSlot: string) => {
    try {
      setIsLoading(true);
      await simulateVisitDrag(visitId, newDate, newTimeSlot);
      showNotification('success', 'Visita reprogramada correctamente');
      await loadVisits(); // Reload to show updated position
    } catch (error) {
      showNotification('error', `Error al reprogramar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle view in list
  const handleViewInList = () => {
    const dateRange = getDateRange();
    const params = new URLSearchParams();
    params.append('from', dateRange.from);
    params.append('to', dateRange.to);
    if (state.agente) {
      params.append('agente', state.agente);
    }
    
    navigate(`/visits?${params.toString()}`);
  };

  if (error && visits.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar el calendario</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadVisits}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const days = getDays();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Calendario de Visitas</h1>
              <p className="text-gray-600">
                Gestiona y programa las visitas desde el calendario
                {visits.length > 0 && (
                  <span className="ml-2 text-sm">
                    ({visits.length} visita{visits.length !== 1 ? 's' : ''})
                  </span>
                )}
              </p>
            </div>
            
            {/* Quick actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleViewInList}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Ver en lista
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-md shadow-lg ${
          notification.type === 'success' ? 'bg-green-500 text-white' :
          notification.type === 'error' ? 'bg-red-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          <div className="flex items-center">
            <span className="mr-2">
              {notification.type === 'success' && '✓'}
              {notification.type === 'error' && '✕'}
              {notification.type === 'info' && 'ℹ'}
            </span>
            {notification.message}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <CalendarToolbar
        state={state}
        onViewChange={handleViewChange}
        onNavigate={handleNavigate}
        onAgenteChange={handleAgenteChange}
        currentDateLabel={getCurrentDateLabel()}
      />

      {/* Calendar Grid */}
      <div className="flex-1 flex flex-col">
        <CalendarGrid
          days={days}
          visits={visits}
          view={state.view}
          onVisitClick={handleVisitClick}
          onSlotClick={handleSlotClick}
          onVisitDrag={handleVisitDrag}
          agenteId={state.agente}
        />
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">Cargando...</span>
          </div>
        </div>
      )}
    </div>
  );
}