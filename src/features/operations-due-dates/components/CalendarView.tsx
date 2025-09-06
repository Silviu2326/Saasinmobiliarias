import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { DueDateItem } from '../types';
import { getMonthCalendar, isToday, isSameMonth, formatDateTime, getDueTypeColor } from '../utils';
import SLAIndicator from './SLAIndicator';

type CalendarMode = 'month' | 'week' | 'day';

interface CalendarViewProps {
  items: DueDateItem[];
  onItemClick: (item: DueDateItem) => void;
  onDateClick: (date: Date) => void;
  onCreateNew?: (date?: Date) => void;
  className?: string;
}

interface DayEventsProps {
  date: Date;
  events: DueDateItem[];
  onItemClick: (item: DueDateItem) => void;
  onDateClick: (date: Date) => void;
}

function DayEvents({ date, events, onItemClick, onDateClick }: DayEventsProps) {
  const sortedEvents = events.sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div 
      className="min-h-[100px] p-1 border border-gray-200 hover:bg-gray-50 cursor-pointer"
      onClick={() => onDateClick(date)}
    >
      <div className="flex items-center justify-between mb-1">
        <span 
          className={`text-sm font-medium ${
            isToday(date) ? 'text-blue-600 bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center' :
            isSameMonth(date, new Date()) ? 'text-gray-900' : 'text-gray-400'
          }`}
        >
          {date.getDate()}
        </span>
        {sortedEvents.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {sortedEvents.length}
          </Badge>
        )}
      </div>
      
      <div className="space-y-1">
        {sortedEvents.slice(0, 3).map(event => (
          <div
            key={event.id}
            className="text-xs p-1 rounded cursor-pointer hover:opacity-80"
            style={{ 
              backgroundColor: `${getDueTypeColor(event.type)}20`,
              borderLeft: `3px solid ${getDueTypeColor(event.type)}`
            }}
            onClick={(e) => {
              e.stopPropagation();
              onItemClick(event);
            }}
          >
            <div className="font-medium truncate">
              {event.title}
            </div>
            <div className="text-gray-600 truncate">
              {formatDateTime(event.date, true)}
            </div>
          </div>
        ))}
        
        {sortedEvents.length > 3 && (
          <div className="text-xs text-gray-500 text-center">
            +{sortedEvents.length - 3} más
          </div>
        )}
      </div>
    </div>
  );
}

export default function CalendarView({ 
  items, 
  onItemClick, 
  onDateClick, 
  onCreateNew,
  className 
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mode, setMode] = useState<CalendarMode>('month');
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const calendar = useMemo(() => {
    return getMonthCalendar(year, month);
  }, [year, month]);
  
  // Group events by date
  const eventsByDate = useMemo(() => {
    const groups: Record<string, DueDateItem[]> = {};
    
    items.forEach(item => {
      const date = new Date(item.date);
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(item);
    });
    
    return groups;
  }, [items]);
  
  const getEventsForDate = (date: Date): DueDateItem[] => {
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return eventsByDate[dateKey] || [];
  };
  
  const goToPrevious = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  const goToNext = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle className="text-lg">
              {monthNames[month]} {year}
            </CardTitle>
            
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={goToPrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Hoy
              </Button>
              <Button variant="outline" size="sm" onClick={goToNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 mr-4">
              <Button
                variant={mode === 'month' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setMode('month')}
              >
                Mes
              </Button>
              <Button
                variant={mode === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setMode('week')}
                disabled
              >
                Semana
              </Button>
              <Button
                variant={mode === 'day' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setMode('day')}
                disabled
              >
                Día
              </Button>
            </div>
            
            {onCreateNew && (
              <Button onClick={() => onCreateNew()}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {mode === 'month' && (
          <div className="space-y-2">
            {/* Week day headers */}
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar grid */}
            <div className="space-y-1">
              {calendar.map((week, weekIndex) => (
                <div key={weekIndex} className="grid grid-cols-7 gap-1">
                  {week.map((date, dayIndex) => (
                    <DayEvents
                      key={`${weekIndex}-${dayIndex}`}
                      date={date}
                      events={getEventsForDate(date)}
                      onItemClick={onItemClick}
                      onDateClick={onDateClick}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {mode === 'week' && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📅</div>
            <p>Vista semanal próximamente</p>
          </div>
        )}
        
        {mode === 'day' && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📅</div>
            <p>Vista diaria próximamente</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}