
import React from 'react';
import { motion } from 'framer-motion';
import { Booking } from '../../types';

const Motion = motion as any;

interface DashboardScheduleProps {
    bookings: Booking[];
    selectedDate: string;
    onSelectBooking: (id: string) => void;
    onNavigate: (view: string) => void;
    itemVariants: any;
}

const DashboardSchedule: React.FC<DashboardScheduleProps> = ({ bookings, selectedDate, onSelectBooking, onNavigate, itemVariants }) => {
    return (
        <Motion.div variants={itemVariants} className="lg:col-span-2 bg-lumina-surface border border-lumina-highlight rounded-2xl p-4 lg:p-6 relative overflow-hidden group shadow-sm">
          <div className="absolute top-0 right-0 w-32 h-32 bg-lumina-accent/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all duration-700 group-hover:bg-lumina-accent/10"></div>
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display font-bold text-lg lg:text-xl text-lumina-text">Schedule for {selectedDate}</h2>
            <button 
              onClick={() => onNavigate('calendar')}
              className="text-[10px] lg:text-xs font-mono text-lumina-accent border border-lumina-accent/30 px-3 py-1 rounded hover:bg-lumina-accent hover:text-lumina-base transition-colors"
            >
              VIEW CALENDAR
            </button>
          </div>

          <div className="space-y-3 lg:space-y-4">
            {bookings.length === 0 ? (
              <p className="text-lumina-muted py-8 text-center italic text-sm">No sessions scheduled for this date.</p>
            ) : (
              bookings.map((booking) => (
                <div key={booking.id} onClick={() => onSelectBooking(booking.id)} className="flex items-center p-3 lg:p-4 bg-lumina-base/50 rounded-xl border border-lumina-highlight/50 hover:border-lumina-accent/50 transition-colors cursor-pointer">
                  <div className="w-14 lg:w-16 flex flex-col items-center justify-center border-r border-lumina-highlight pr-3 lg:pr-4 mr-3 lg:mr-4">
                    <span className="font-display font-bold text-base lg:text-lg text-lumina-text">{booking.timeStart}</span>
                    <span className="text-[10px] lg:text-xs text-lumina-muted font-mono">{booking.duration}h</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lumina-text text-sm lg:text-base truncate">{booking.clientName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] lg:text-xs text-lumina-muted bg-lumina-highlight px-2 py-0.5 rounded truncate">{booking.package}</span>
                      <span className="text-[10px] lg:text-xs text-lumina-accent bg-lumina-accent/10 px-2 py-0.5 rounded border border-lumina-accent/20 truncate hidden sm:inline-block">{booking.studio}</span>
                    </div>
                  </div>
                  <div className={`px-2 lg:px-3 py-1 rounded text-[9px] lg:text-[10px] font-bold uppercase tracking-wider shrink-0 ${booking.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-lumina-highlight text-lumina-muted'}`}>
                    {booking.status}
                  </div>
                </div>
              ))
            )}
          </div>
        </Motion.div>
    );
};

export default DashboardSchedule;
