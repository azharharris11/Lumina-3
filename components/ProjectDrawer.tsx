
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Booking, ProjectStatus, User, StudioConfig, Package, ActivityLog, Asset, Transaction, Account } from '../types';
import { X, FileSignature, Upload, Trash2, MessageCircle, ListChecks, History, MapPin, HardDrive, LayoutDashboard, Eye, Copy, Calendar, Tag, ArrowLeft } from 'lucide-react';

import ProjectOverview from './project-drawer-tabs/ProjectOverview';
import ProjectTasks from './project-drawer-tabs/ProjectTasks';
import ProjectContract from './project-drawer-tabs/ProjectContract';
import ProjectFiles from './project-drawer-tabs/ProjectFiles';
import ProjectProofing from './project-drawer-tabs/ProjectProofing';
import ProjectLogs from './project-drawer-tabs/ProjectLogs';
import ProjectDrivePicker from './project-drawer-tabs/ProjectDrivePicker';

interface ProjectDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  photographer: User | undefined;
  onUpdateBooking: (booking: Booking) => void;
  onDeleteBooking?: (id: string) => void;
  bookings?: Booking[]; 
  config?: StudioConfig; 
  packages?: Package[]; 
  currentUser?: User;
  assets?: Asset[];
  users?: User[];
  transactions?: Transaction[];
  onAddTransaction?: (data: { description: string; amount: number; category: string; accountId: string; bookingId?: string }) => void;
  accounts?: Account[];
  googleToken?: string | null;
  onLogActivity?: (bookingId: string, action: string, details: string) => void;
}

type Tab = 'OVERVIEW' | 'TASKS' | 'MOODBOARD' | 'TIMELINE' | 'LOGS' | 'PROFITABILITY' | 'PROOFING' | 'CONTRACT';

const Motion = motion as any;

const ProjectDrawer: React.FC<ProjectDrawerProps> = ({ isOpen, onClose, booking, photographer, onUpdateBooking, onDeleteBooking, bookings = [], config, packages = [], currentUser, assets = [], users = [], transactions = [], onAddTransaction, accounts = [], googleToken, onLogActivity }) => {
  const [activeTab, setActiveTab] = useState<Tab>('OVERVIEW');
  const [showDrivePicker, setShowDrivePicker] = useState(false);

  useEffect(() => {
    if (booking) {
      setActiveTab('OVERVIEW');
      setShowDrivePicker(false);
    }
  }, [booking, isOpen]);

  const createLocalLog = (action: string, details?: string): ActivityLog => ({ id: `log-${Date.now()}`, timestamp: new Date().toISOString(), action, details, userId: currentUser?.id || 'sys', userName: currentUser?.name || 'System' });
  const handleStatusChange = (status: ProjectStatus) => { if(booking) onUpdateBooking({ ...booking, status, logs: [createLocalLog('STATUS_CHANGE', `Status to ${status}`), ...(booking.logs||[])] }); };
  const handleDelete = () => { if (booking && onDeleteBooking && window.confirm('Archive project?')) { onDeleteBooking(booking.id); onClose(); } };
  
  const handleSelectFolder = (folderId: string, folderName: string) => { 
      if (booking) { 
          const folderLink = `https://drive.google.com/drive/u/0/folders/${folderId}`; 
          onUpdateBooking({ ...booking, deliveryUrl: folderLink, logs: [createLocalLog('DRIVE_LINK', `Linked Drive folder: ${folderName}`), ...(booking.logs || [])] }); 
          setShowDrivePicker(false); 
      } 
  };
  
  const handleQuickWhatsApp = () => { const url = `https://wa.me/${booking?.clientPhone.replace(/\D/g, '')}`; window.open(url, '_blank'); };
  const handleCopyPortalLink = () => { const link = `${window.location.origin}/?site=${config?.ownerId || ''}&booking=${booking?.id}`; navigator.clipboard.writeText(link); alert("Link Copied!"); };

  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 lg:p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <Motion.div 
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        className="bg-lumina-surface border-l border-r border-lumina-highlight w-full lg:max-w-6xl h-full lg:h-[90vh] lg:rounded-2xl shadow-2xl relative overflow-hidden flex flex-col"
      >
        {/* HEADER */}
        <div className="p-4 lg:p-6 border-b border-lumina-highlight bg-lumina-base flex justify-between items-center shrink-0">
            <div className="flex items-center gap-4">
                <button onClick={onClose} className="lg:hidden p-2 -ml-2 text-lumina-muted"><ArrowLeft size={20} /></button>
                <div>
                    <div className="flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-3">
                        <h2 className="text-xl lg:text-2xl font-display font-bold text-white truncate max-w-[200px] lg:max-w-none">{booking.clientName}</h2>
                        <span className={`w-fit px-2 lg:px-3 py-0.5 lg:py-1 rounded-full text-[10px] lg:text-xs font-bold border uppercase tracking-wider
                            ${booking.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-lumina-highlight text-lumina-muted border-lumina-highlight'}
                        `}>
                            {booking.status}
                        </span>
                    </div>
                    <div className="hidden lg:flex items-center gap-4 text-sm text-lumina-muted mt-1">
                        <span className="flex items-center gap-1"><Tag size={12}/> {booking.package}</span>
                        <span className="flex items-center gap-1"><MapPin size={12}/> {booking.studio}</span>
                        <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(booking.date).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2 lg:gap-3">
                <select 
                    className="bg-lumina-surface border border-lumina-highlight text-white text-xs rounded-lg p-2 font-bold uppercase tracking-wide focus:border-lumina-accent outline-none max-w-[100px] lg:max-w-none"
                    value={booking.status}
                    onChange={(e) => handleStatusChange(e.target.value as ProjectStatus)}
                >
                    {['INQUIRY', 'BOOKED', 'SHOOTING', 'CULLING', 'EDITING', 'REVIEW', 'COMPLETED', 'CANCELLED'].map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
                <button onClick={handleDelete} className="hidden lg:block p-2 hover:bg-rose-500/20 text-lumina-muted hover:text-rose-500 rounded-lg transition-colors">
                    <Trash2 size={18} />
                </button>
                <button onClick={onClose} className="hidden lg:block p-2 hover:bg-lumina-highlight text-lumina-muted hover:text-white rounded-lg transition-colors">
                    <X size={24} />
                </button>
            </div>
        </div>

        {/* TABS */}
        <div className="bg-lumina-surface border-b border-lumina-highlight px-4 lg:px-6 py-2 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
            {[
                { id: 'OVERVIEW', icon: LayoutDashboard, label: 'Overview' },
                { id: 'TASKS', icon: ListChecks, label: 'Tasks' },
                { id: 'TIMELINE', icon: HardDrive, label: 'Files' },
                { id: 'PROOFING', icon: Eye, label: 'Proofing' },
                { id: 'CONTRACT', icon: FileSignature, label: 'Contract' },
                { id: 'LOGS', icon: History, label: 'Logs' },
            ].map((tab) => (
                <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as Tab)}
                    className={`px-3 lg:px-4 py-2 rounded-full text-[10px] lg:text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap
                        ${activeTab === tab.id ? 'bg-lumina-accent text-lumina-base shadow-lg shadow-lumina-accent/20' : 'text-lumina-muted hover:text-white hover:bg-lumina-highlight'}
                    `}
                >
                    <tab.icon size={14} /> {tab.label}
                </button>
            ))}
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-lumina-base/50 p-4 lg:p-6 pb-24">
            
            {activeTab === 'OVERVIEW' && (
                <ProjectOverview 
                    booking={booking} 
                    photographer={photographer} 
                    onUpdateBooking={onUpdateBooking} 
                    createLocalLog={createLocalLog}
                />
            )}

            {activeTab === 'TASKS' && (
                <ProjectTasks booking={booking} onUpdateBooking={onUpdateBooking} />
            )}

            {activeTab === 'CONTRACT' && (
                <ProjectContract booking={booking} onUpdateBooking={onUpdateBooking} createLocalLog={createLocalLog} />
            )}

            {activeTab === 'TIMELINE' && (
                <ProjectFiles 
                    booking={booking} 
                    currentUser={currentUser} 
                    onUpdateBooking={onUpdateBooking} 
                    createLocalLog={createLocalLog}
                    onOpenDrivePicker={() => setShowDrivePicker(true)}
                />
            )}

            {activeTab === 'PROOFING' && (
                <ProjectProofing 
                    booking={booking} 
                    googleToken={googleToken} 
                    onNavigateToFiles={() => setActiveTab('TIMELINE')} 
                />
            )}

            {activeTab === 'LOGS' && (
                <ProjectLogs logs={booking.logs} />
            )}

            {/* DRIVE PICKER MODAL (Nested) */}
            <AnimatePresence>
                {showDrivePicker && (
                    <ProjectDrivePicker 
                        isOpen={showDrivePicker} 
                        onClose={() => setShowDrivePicker(false)} 
                        googleToken={googleToken}
                        onSelectFolder={handleSelectFolder}
                    />
                )}
            </AnimatePresence>

        </div>

        {/* STICKY QUICK ACTIONS FOOTER */}
        <div className="border-t border-lumina-highlight bg-lumina-base p-3 lg:p-4 flex justify-between items-center shrink-0 pb-safe-area-bottom lg:pb-4">
            <div className="hidden lg:block text-[10px] text-lumina-muted uppercase tracking-wider">Quick Actions</div>
            <div className="flex gap-2 w-full lg:w-auto">
                <button onClick={() => setActiveTab('TIMELINE')} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-3 lg:py-2 bg-lumina-surface border border-lumina-highlight rounded-xl hover:bg-lumina-highlight text-white text-xs font-bold transition-colors">
                    <Upload size={14}/> Upload
                </button>
                <button onClick={handleQuickWhatsApp} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-3 lg:py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl hover:bg-emerald-500 hover:text-white text-emerald-400 text-xs font-bold transition-colors">
                    <MessageCircle size={14}/> WhatsApp
                </button>
                <button onClick={handleCopyPortalLink} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-3 lg:py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl hover:bg-blue-500 hover:text-white text-blue-400 text-xs font-bold transition-colors">
                    <Copy size={14}/> Link
                </button>
            </div>
        </div>
      </Motion.div>
    </div>
  );
};

export default ProjectDrawer;
