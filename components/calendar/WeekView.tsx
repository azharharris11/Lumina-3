
import React from 'react';
import { Booking, StudioRoom } from '../../types';

interface WeekViewProps {
    currentDate: string;
    bookings: Booking[];
    rooms: StudioRoom[];
    onSelectBooking: (id: string) => void;
    onDragStart: (e: React.DragEvent, id: string) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent, target: { date: string, time: string }) => void;
    draggedBookingId: string | null;
}

const WeekView: React.FC<WeekViewProps> = ({ currentDate, bookings, rooms, onSelectBooking, onDragStart, onDragOver, onDrop, draggedBookingId }) => {
    const getStartOfWeek = (dateStr: string) => {
        const date = new Date(dateStr);
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); 
        return new Date(date.setDate(diff));
    };

    const start = getStartOfWeek(currentDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        return d.toISOString().split('T')[0];
    });
    const hours = Array.from({ length: 11 }, (_, i) => i + 9); 

    return (
        <div className="flex-1 bg-lumina-surface border border-lumina-highlight rounded-2xl overflow-hidden flex flex-col shadow-2xl overflow-x-auto">
            <div className="flex border-b border-lumina-highlight bg-lumina-base/50 min-w-[800px]">
                <div className="w-16 border-r border-lumina-highlight p-2 sticky left-0 bg-lumina-base/50 z-20"></div>
                {weekDays.map(dateStr => {
                    const date = new Date(dateStr);
                    const isToday = dateStr === new Date().toISOString().split('T')[0];
                    return (
                        <div key={dateStr} className="flex-1 p-3 text-center border-r border-lumina-highlight last:border-r-0 min-w-[100px]">
                            <span className="block text-xs text-lumina-muted uppercase font-bold">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                            <span className={`block text-lg font-bold ${isToday ? 'text-lumina-accent' : 'text-white'}`}>{date.getDate()}</span>
                        </div>
                    )
                })}
            </div>

            <div className="flex-1 overflow-y-auto relative custom-scrollbar bg-lumina-base/40 min-w-[800px]">
                <div className="absolute left-0 top-0 bottom-0 w-16 border-r border-lumina-highlight/30 bg-lumina-base/50 z-10 sticky left-0">
                    {hours.map(hour => (
                        <div key={hour} className="h-32 border-b border-lumina-highlight/30 flex items-start justify-center pt-2">
                            <span className="text-xs font-mono text-lumina-muted">{hour}:00</span>
                        </div>
                    ))}
                </div>

                <div className="absolute inset-0 z-0 ml-16 flex">
                    {weekDays.map(dayStr => {
                        const dayBookings = bookings.filter(b => b.date === dayStr && b.status !== 'CANCELLED');
                        return (
                            <div key={dayStr} className="flex-1 relative border-r border-lumina-highlight/30 last:border-r-0 h-[1408px] min-w-[100px]">
                                {hours.map(hour => (
                                    <div 
                                      key={hour} 
                                      onDragOver={onDragOver}
                                      onDrop={(e) => onDrop(e, { date: dayStr, time: `${hour}:00` })}
                                      className="h-32 border-b border-lumina-highlight/20"
                                    ></div>
                                ))}
                                {dayBookings.map(b => {
                                    if (!b.timeStart) return null;
                                    const [h, m] = b.timeStart.split(':').map(Number);
                                    const top = (h - 9) * 128 + (m / 60) * 128;
                                    const height = b.duration * 128;
                                    const roomColor = rooms.find(r => r.name === b.studio)?.color || 'gray';
                                    
                                    return (
                                        <div 
                                            key={b.id}
                                            draggable
                                            onDragStart={(e) => onDragStart(e, b.id)}
                                            onClick={(e) => { e.stopPropagation(); onSelectBooking(b.id); }}
                                            style={{ top: `${top}px`, height: `${Math.max(height - 4, 24)}px` }}
                                            className={`absolute inset-x-1 rounded border-l-4 p-1.5 z-10 cursor-grab active:cursor-grabbing hover:scale-105 transition-transform overflow-hidden border-${roomColor}-500 bg-${roomColor}-500/20 hover:bg-${roomColor}-500/30 ${draggedBookingId === b.id ? 'opacity-50' : 'opacity-100'}`}
                                        >
                                            <div className="font-bold text-white text-xs truncate">{b.clientName}</div>
                                            <div className="text-[9px] text-lumina-muted truncate">{b.timeStart} - {b.package}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default WeekView;
