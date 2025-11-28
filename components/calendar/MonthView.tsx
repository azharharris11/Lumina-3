
import React from 'react';
import { Booking, StudioRoom } from '../../types';

interface MonthViewProps {
    currentDate: string;
    bookings: Booking[];
    rooms: StudioRoom[];
    onDateChange: (date: string) => void;
    setViewMode: (mode: 'DAY' | 'WEEK' | 'MONTH') => void;
    onDragStart: (e: React.DragEvent, id: string) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent, target: { date: string }) => void;
}

const MonthView: React.FC<MonthViewProps> = ({ currentDate, bookings, rooms, onDateChange, setViewMode, onDragStart, onDragOver, onDrop }) => {
    const getDaysInMonth = (dateStr: string) => {
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay(); 
        return { days, year, month, firstDay };
    };

    const { days, year, month, firstDay } = getDaysInMonth(currentDate);
    const blanks = Array.from({ length: firstDay }, (_, i) => i);
    const daySlots = Array.from({ length: days }, (_, i) => i + 1);

    return (
        <div className="flex-1 bg-lumina-surface border border-lumina-highlight rounded-2xl p-6 flex flex-col overflow-hidden min-w-[600px]">
            <div className="grid grid-cols-7 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="text-center text-xs font-bold text-lumina-muted uppercase">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 grid-rows-6 gap-2 flex-1">
                {blanks.map(b => <div key={`blank-${b}`} className="bg-transparent"></div>)}
                
                {daySlots.map(day => {
                    const d = new Date(year, month, day);
                    // Handle timezone offset to avoid date shifting
                    const offsetDate = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
                    const dayBookings = bookings.filter(b => b.date === offsetDate && b.status !== 'CANCELLED');
                    const isToday = offsetDate === new Date().toISOString().split('T')[0];

                    return (
                        <div 
                          key={day} 
                          onDragOver={onDragOver}
                          onDrop={(e) => onDrop(e, { date: offsetDate })}
                          onClick={() => { onDateChange(offsetDate); setViewMode('DAY'); }}
                          className={`bg-lumina-base border border-lumina-highlight rounded-lg p-2 flex flex-col transition-colors hover:border-lumina-accent/50 cursor-pointer relative overflow-hidden ${isToday ? 'ring-1 ring-lumina-accent' : ''}`}
                        >
                            <span className={`text-sm font-bold mb-1 ${isToday ? 'text-lumina-accent' : 'text-white'}`}>{day}</span>
                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                                {dayBookings.slice(0, 3).map(b => {
                                    const roomColor = rooms.find(r => r.name === b.studio)?.color || 'gray';
                                    return (
                                        <div 
                                          key={b.id} 
                                          draggable
                                          onDragStart={(e) => onDragStart(e, b.id)}
                                          className="flex items-center gap-1 cursor-grab active:cursor-grabbing"
                                        >
                                            <div className={`w-2 h-2 rounded-full bg-${roomColor}-500 shrink-0`}></div>
                                            <div className="text-[9px] truncate text-lumina-muted">{b.timeStart} {b.clientName}</div>
                                        </div>
                                    )
                                })}
                                {dayBookings.length > 3 && (
                                    <div className="text-[9px] text-center text-lumina-muted italic">+{dayBookings.length - 3} more</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MonthView;
