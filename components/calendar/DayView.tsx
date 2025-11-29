
import React from 'react';
import { Booking, StudioRoom, User } from '../../types';

interface DayViewProps {
    currentDate: string;
    bookings: Booking[];
    rooms: StudioRoom[];
    users: User[];
    onNewBooking: (data: { date: string, time: string, studio: string }) => void;
    onSelectBooking: (id: string) => void;
    onDragStart: (e: React.DragEvent, id: string) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent, target: { date: string, time: string, studio: string }) => void;
    draggedBookingId: string | null;
    currentTimeOffset: number | null;
    startHour: number;
    hourHeight: number;
}

const DayView: React.FC<DayViewProps> = ({ currentDate, bookings, rooms, users, onNewBooking, onSelectBooking, onDragStart, onDragOver, onDrop, draggedBookingId, currentTimeOffset, startHour, hourHeight }) => {
    // Generate hours dynamically based on startHour (e.g., if startHour is 7, show 7, 8, 9...)
    const hours = Array.from({ length: 14 }, (_, i) => i + startHour);
    const todaysBookings = bookings.filter(b => b.date === currentDate && b.status !== 'CANCELLED');

    const getPhotographerAvatar = (id: string) => {
        return users.find(u => u.id === id)?.avatar || `https://ui-avatars.com/api/?name=${id}`;
    };

    return (
      <div className="flex-1 bg-lumina-surface border border-lumina-highlight rounded-2xl overflow-hidden flex flex-col shadow-2xl overflow-x-auto">
          <div className="flex border-b border-lumina-highlight z-20 bg-lumina-surface relative shadow-sm min-w-[600px]">
          <div className="w-16 border-r border-lumina-highlight p-3 bg-lumina-base/50 sticky left-0 z-20"></div>
          {rooms.map(room => (
              <div key={room.id} className="flex-1 p-3 text-center border-r border-lumina-highlight last:border-r-0 bg-lumina-base/30 relative overflow-hidden group min-w-[150px]">
              <span className="font-display font-bold text-white text-sm relative z-10">{room.name}</span>
              <div className={`absolute top-0 right-0 w-6 h-6 opacity-10 rounded-bl-xl bg-${room.color}-500`}></div>
              </div>
          ))}
          </div>

          <div className="flex-1 overflow-y-auto relative custom-scrollbar bg-lumina-base/40 min-w-[600px]">
          {currentTimeOffset !== null && (
              <div 
                  className="absolute left-0 right-0 h-[2px] bg-red-500 z-30 pointer-events-none flex items-center"
                  style={{ top: `${currentTimeOffset}px` }} 
              >
                  <div className="w-16 bg-red-500 text-white text-[9px] font-bold px-1 py-0.5 text-right pr-2 sticky left-0">
                      NOW
                  </div>
                  <div className="w-2 h-2 rounded-full bg-red-500 -ml-1"></div>
              </div>
          )}

          <div className="absolute left-0 top-0 bottom-0 w-16 border-r border-lumina-highlight/30 bg-lumina-base/50 z-10 sticky">
              {hours.map(hour => (
                  <div key={hour} style={{ height: `${hourHeight}px` }} className="border-b border-lumina-highlight/30 flex items-start justify-center pt-2">
                  <span className="text-[10px] font-mono text-lumina-muted">{hour}:00</span>
                  </div>
              ))}
          </div>

          <div className="absolute inset-0 z-0 ml-16 flex">
              {rooms.map((room) => {
              const studioBookings = todaysBookings.filter(b => b.studio === room.name);
              
              return (
                  <div key={room.id} className="flex-1 relative border-r border-lumina-highlight/30 last:border-r-0 min-w-[150px]" style={{ height: `${hours.length * hourHeight}px` }}> 
                      {hours.map(hour => (
                          <div 
                              key={`slot-${room.id}-${hour}`}
                              onDragOver={onDragOver}
                              onDrop={(e) => onDrop(e, { date: currentDate, time: `${hour}:00`, studio: room.name })}
                              onClick={() => onNewBooking({ date: currentDate, time: `${hour}:00`, studio: room.name })}
                              style={{ height: `${hourHeight}px` }}
                              className="border-b border-lumina-highlight/20 hover:bg-white/5 transition-colors cursor-pointer group"
                          >
                              <div className="hidden group-hover:flex h-full items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <span className="text-[10px] font-bold text-lumina-muted border border-lumina-muted/50 px-2 py-0.5 rounded bg-lumina-base">
                                      +
                                  </span>
                              </div>
                          </div>
                      ))}

                      {studioBookings.map(booking => {
                      if (!booking.timeStart) return null;
                      const bookStartHour = parseInt(booking.timeStart.split(':')[0]);
                      const bookStartMinute = parseInt(booking.timeStart.split(':')[1]);
                      
                      // Calculate offset relative to startHour
                      const topOffset = (bookStartHour - startHour) * hourHeight + (bookStartMinute/60) * hourHeight; 
                      const height = booking.duration * hourHeight;
                      const isSmall = height < 40; 
                      
                      return (
                          <button 
                          key={booking.id}
                          draggable
                          onDragStart={(e) => onDragStart(e, booking.id)}
                          onClick={(e) => { e.stopPropagation(); onSelectBooking(booking.id); }}
                          style={{ top: `${topOffset}px`, height: `${Math.max(height - 2, 24)}px` }} 
                          className={`absolute inset-x-1 rounded border-l-4 shadow-lg cursor-grab active:cursor-grabbing transition-transform hover:scale-[1.01] z-20 overflow-hidden group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white
                              ${isSmall ? 'p-1 flex items-center justify-between' : 'p-2'}
                              ${booking.status === 'SHOOTING' ? 'bg-indigo-900/40 border-indigo-400' : 'bg-lumina-highlight border-lumina-accent'}
                              ${draggedBookingId === booking.id ? 'opacity-50' : 'opacity-100'}`}
                          >
                          <div className={`flex justify-between items-start ${isSmall ? 'w-full' : ''}`}>
                              <div className={`font-bold text-white truncate ${isSmall ? 'text-[10px] flex-1' : 'text-xs max-w-[70%]'}`}>{booking.clientName}</div>
                              <span className={`text-[9px] bg-black/30 px-1 py-0.5 rounded text-white font-mono ${isSmall ? 'ml-1' : ''}`}>
                                  {booking.timeStart}
                              </span>
                          </div>
                          
                          {!isSmall && (
                              <>
                                  <p className="text-[10px] text-lumina-muted mt-0.5 truncate">{booking.package}</p>
                                  <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between">
                                      <div className="flex items-center">
                                          <div className={`w-1.5 h-1.5 rounded-full mr-1 ${booking.status === 'SHOOTING' ? 'bg-indigo-400 animate-pulse' : 'bg-lumina-accent'}`}></div>
                                          <span className="text-[9px] uppercase tracking-wider text-lumina-muted">{booking.status}</span>
                                      </div>
                                      <img 
                                          src={getPhotographerAvatar(booking.photographerId)} 
                                          alt="Photographer" 
                                          className="w-4 h-4 rounded-full border border-lumina-surface opacity-70 group-hover:opacity-100" 
                                      />
                                  </div>
                              </>
                          )}
                          </button>
                      )
                      })}
                  </div>
              )
              })}
          </div>
          </div>
      </div>
    );
};

export default DayView;
