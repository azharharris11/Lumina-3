
import React, { useEffect, useState } from 'react';
import { Booking, CalendarViewProps } from '../types';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, List, Grid } from 'lucide-react';
import { useStudio } from '../contexts/StudioContext';

import MonthView from '../components/calendar/MonthView';
import WeekView from '../components/calendar/WeekView';
import DayView from '../components/calendar/DayView';

type ViewMode = 'DAY' | 'WEEK' | 'MONTH';

const CalendarView: React.FC<CalendarViewProps> = ({ bookings, currentDate, users, rooms, onDateChange, onNewBooking, onSelectBooking, onUpdateBooking, googleToken }) => {
  const { config } = useStudio();
  const [viewMode, setViewMode] = useState<ViewMode>('DAY');
  const [currentTimeOffset, setCurrentTimeOffset] = useState<number | null>(null);
  const [draggedBookingId, setDraggedBookingId] = useState<string | null>(null);

  // Dynamic Start Hour from Config (e.g. "09:00" -> 9)
  const startHour = parseInt(config.operatingHoursStart?.split(':')[0] || "9");
  const endHour = parseInt(config.operatingHoursEnd?.split(':')[0] || "21");
  const hourHeight = 80; // Standardized height

  // --- TIME LOGIC ---
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      if (today === currentDate) {
         const currentHour = now.getHours();
         const currentMinutes = now.getMinutes();
         
         if (currentHour >= startHour && currentHour < endHour) {
            const offset = (currentHour - startHour) * hourHeight + (currentMinutes / 60) * hourHeight;
            setCurrentTimeOffset(offset);
         } else {
             setCurrentTimeOffset(null);
         }
      } else {
          setCurrentTimeOffset(null);
      }
    };

    updateTime();
    const interval = window.setInterval(updateTime, 60000); 
    return () => window.clearInterval(interval);
  }, [currentDate, startHour, endHour]);

  // --- DRAG & DROP HANDLERS ---
  const handleDragStart = (e: React.DragEvent, bookingId: string) => {
      setDraggedBookingId(bookingId);
      e.dataTransfer.setData('bookingId', bookingId);
      e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, target: { date: string, time?: string, studio?: string }) => {
      e.preventDefault();
      const bookingId = e.dataTransfer.getData('bookingId');
      const booking = bookings.find(b => b.id === bookingId);
      
      if (booking && onUpdateBooking) {
          const updates: Partial<Booking> = {};
          if (target.date) updates.date = target.date;
          if (target.time) updates.timeStart = target.time;
          if (target.studio) updates.studio = target.studio;
          
          onUpdateBooking({ ...booking, ...updates });
      }
      setDraggedBookingId(null);
  };

  // --- NAVIGATION HANDLERS ---
  const handlePrev = () => {
      const date = new Date(currentDate);
      if (viewMode === 'MONTH') {
          date.setMonth(date.getMonth() - 1);
      } else if (viewMode === 'WEEK') {
          date.setDate(date.getDate() - 7);
      } else {
          date.setDate(date.getDate() - 1);
      }
      onDateChange(date.toISOString().split('T')[0]);
  };

  const handleNext = () => {
      const date = new Date(currentDate);
      if (viewMode === 'MONTH') {
          date.setMonth(date.getMonth() + 1);
      } else if (viewMode === 'WEEK') {
          date.setDate(date.getDate() + 7);
      } else {
          date.setDate(date.getDate() + 1);
      }
      onDateChange(date.toISOString().split('T')[0]);
  };

  const getStartOfWeek = (dateStr: string) => {
      const date = new Date(dateStr);
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1); 
      return new Date(date.setDate(diff));
  };

  return (
    <div className="h-full flex flex-col">
      {/* Responsive Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-1 md:mb-2">Studio Schedule</h1>
          <p className="text-lumina-muted">
              {viewMode === 'MONTH' && new Date(currentDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              {viewMode === 'WEEK' && `Week of ${new Date(getStartOfWeek(currentDate)).toLocaleDateString()}`}
              {viewMode === 'DAY' && new Date(currentDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
          <div className="bg-lumina-surface border border-lumina-highlight rounded-lg p-1 flex shrink-0">
              <button onClick={() => setViewMode('DAY')} className={`p-2 rounded ${viewMode === 'DAY' ? 'bg-lumina-highlight text-white' : 'text-lumina-muted hover:text-white'}`} title="Day View">
                  <List size={18} />
              </button>
              <button onClick={() => setViewMode('WEEK')} className={`p-2 rounded ${viewMode === 'WEEK' ? 'bg-lumina-highlight text-white' : 'text-lumina-muted hover:text-white'}`} title="Week View">
                  <CalendarIcon size={18} />
              </button>
              <button onClick={() => setViewMode('MONTH')} className={`p-2 rounded ${viewMode === 'MONTH' ? 'bg-lumina-highlight text-white' : 'text-lumina-muted hover:text-white'}`} title="Month View">
                  <Grid size={18} />
              </button>
          </div>

          <div className="flex items-center bg-lumina-surface rounded-lg p-1 border border-lumina-highlight shrink-0 ml-auto xl:ml-0">
            <button onClick={handlePrev} className="p-2 hover:text-white text-lumina-muted hover:bg-lumina-highlight rounded-md transition-colors"><ChevronLeft size={20} /></button>
            <button 
                onClick={() => onDateChange(new Date().toISOString().split('T')[0])}
                className="px-2 md:px-4 font-mono font-bold text-white min-w-[60px] md:min-w-[80px] text-center text-xs md:text-sm hover:text-lumina-accent"
            >
                Today
            </button>
            <button onClick={handleNext} className="p-2 hover:text-white text-lumina-muted hover:bg-lumina-highlight rounded-md transition-colors"><ChevronRight size={20} /></button>
          </div>
          <button 
            onClick={() => onNewBooking({ date: currentDate, time: '10:00', studio: rooms[0]?.name })}
            className="bg-lumina-accent text-lumina-base px-3 md:px-4 py-2 rounded-lg font-bold flex items-center hover:bg-lumina-accent/90 ml-auto xl:ml-0"
          >
              <Plus size={18} className="mr-2" />
              <span className="hidden md:inline">NEW BOOKING</span>
              <span className="md:hidden">NEW</span>
          </button>
        </div>
      </div>

      {viewMode === 'DAY' && (
          <DayView 
              currentDate={currentDate}
              bookings={bookings}
              rooms={rooms}
              users={users}
              onNewBooking={onNewBooking}
              onSelectBooking={onSelectBooking}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              draggedBookingId={draggedBookingId}
              currentTimeOffset={currentTimeOffset}
              startHour={startHour}
              hourHeight={hourHeight}
          />
      )}
      {viewMode === 'WEEK' && (
          <WeekView 
              currentDate={currentDate}
              bookings={bookings}
              rooms={rooms}
              onSelectBooking={onSelectBooking}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              draggedBookingId={draggedBookingId}
          />
      )}
      {viewMode === 'MONTH' && (
          <MonthView 
              currentDate={currentDate}
              bookings={bookings}
              rooms={rooms}
              onDateChange={onDateChange}
              setViewMode={setViewMode}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
          />
      )}
    </div>
  );
};

export default CalendarView;
