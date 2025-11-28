
import React, { useState } from 'react';
import { Clock, User as UserIcon, Tag, MapPin, Calendar } from 'lucide-react';
import { Booking, User, ActivityLog } from '../../types';

interface ProjectOverviewProps {
  booking: Booking;
  photographer?: User;
  onUpdateBooking: (booking: Booking) => void;
  createLocalLog: (action: string, details?: string) => ActivityLog;
}

const ProjectOverview: React.FC<ProjectOverviewProps> = ({ booking, photographer, onUpdateBooking, createLocalLog }) => {
  const [isLogisticsEditing, setIsLogisticsEditing] = useState(false);
  const [logisticsForm, setLogisticsForm] = useState({
      date: booking.date,
      timeStart: booking.timeStart,
      duration: booking.duration,
      studio: booking.studio,
      photographerId: booking.photographerId
  });

  const handleSaveLogistics = () => {
      onUpdateBooking({ 
          ...booking, 
          ...logisticsForm, 
          logs: [createLocalLog('RESCHEDULE', `Changed to ${logisticsForm.date}`), ...(booking.logs||[])] 
      });
      setIsLogisticsEditing(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Logistics Card */}
        <div className="bg-lumina-surface border border-lumina-highlight rounded-2xl p-6 lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-white flex items-center gap-2"><Clock size={18} className="text-lumina-accent"/> Session Logistics</h3>
                {!isLogisticsEditing ? (
                    <button onClick={() => setIsLogisticsEditing(true)} className="text-xs font-bold text-lumina-accent hover:underline">Edit Details</button>
                ) : (
                    <div className="flex gap-2">
                        <button onClick={() => setIsLogisticsEditing(false)} className="text-xs font-bold text-lumina-muted">Cancel</button>
                        <button onClick={handleSaveLogistics} className="text-xs font-bold text-emerald-400">Save</button>
                    </div>
                )}
            </div>

            {isLogisticsEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-lumina-muted block mb-1">Date</label>
                        <input type="date" className="w-full bg-lumina-base border border-lumina-highlight rounded p-2 text-white" value={logisticsForm.date} onChange={e => setLogisticsForm({...logisticsForm, date: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs text-lumina-muted block mb-1">Time</label>
                        <input type="time" className="w-full bg-lumina-base border border-lumina-highlight rounded p-2 text-white" value={logisticsForm.timeStart} onChange={e => setLogisticsForm({...logisticsForm, timeStart: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs text-lumina-muted block mb-1">Duration (h)</label>
                        <input type="number" className="w-full bg-lumina-base border border-lumina-highlight rounded p-2 text-white" value={logisticsForm.duration} onChange={e => setLogisticsForm({...logisticsForm, duration: Number(e.target.value)})} />
                    </div>
                    <div>
                        <label className="text-xs text-lumina-muted block mb-1">Studio</label>
                        <input className="w-full bg-lumina-base border border-lumina-highlight rounded p-2 text-white" value={logisticsForm.studio} onChange={e => setLogisticsForm({...logisticsForm, studio: e.target.value})} />
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="p-3 bg-lumina-base rounded-xl border border-lumina-highlight">
                        <p className="text-xs text-lumina-muted mb-1">Date</p>
                        <p className="font-bold text-white">{new Date(booking.date).toLocaleDateString()}</p>
                    </div>
                    <div className="p-3 bg-lumina-base rounded-xl border border-lumina-highlight">
                        <p className="text-xs text-lumina-muted mb-1">Time</p>
                        <p className="font-bold text-white">{booking.timeStart} ({booking.duration}h)</p>
                    </div>
                    <div className="p-3 bg-lumina-base rounded-xl border border-lumina-highlight">
                        <p className="text-xs text-lumina-muted mb-1">Studio</p>
                        <p className="font-bold text-white">{booking.studio}</p>
                    </div>
                    <div className="p-3 bg-lumina-base rounded-xl border border-lumina-highlight">
                        <p className="text-xs text-lumina-muted mb-1">Photographer</p>
                        <div className="flex items-center gap-2">
                            <img src={photographer?.avatar} className="w-5 h-5 rounded-full" />
                            <p className="font-bold text-white truncate">{photographer?.name || 'Unassigned'}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Team Card */}
        <div className="bg-lumina-surface border border-lumina-highlight rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2"><UserIcon size={18} className="text-blue-400"/> Team</h3>
            <div className="space-y-3">
                {photographer && (
                    <div className="flex items-center justify-between p-2 bg-lumina-base rounded-lg border border-lumina-highlight">
                        <div className="flex items-center gap-3">
                            <img src={photographer.avatar} className="w-8 h-8 rounded-full" />
                            <div>
                                <p className="text-sm font-bold text-white">{photographer.name}</p>
                                <p className="text-[10px] text-lumina-muted">Lead Photographer</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default ProjectOverview;
