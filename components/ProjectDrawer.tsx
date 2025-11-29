
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Booking, ProjectStatus, ActivityLog } from '../types';
import { X, FileSignature, Upload, Trash2, MessageCircle, ListChecks, History, Eye, Copy, MapPin, Tag, Calendar, ArrowLeft, AlertCircle } from 'lucide-react';
import { useStudio } from '../contexts/StudioContext';
import { useAuth } from '../contexts/AuthContext';

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
  onUpdateBooking: (booking: Booking) => void;
  onDeleteBooking?: (id: string) => void;
  googleToken?: string | null;
}

type Tab = 'OVERVIEW' | 'TASKS' | 'TIMELINE' | 'LOGS' | 'PROOFING' | 'CONTRACT';

const Motion = motion as any;

const ProjectDrawer: React.FC<ProjectDrawerProps> = ({ isOpen, onClose, booking, onUpdateBooking, onDeleteBooking, googleToken }) => {
  // Context Usage to replace Prop Drilling
  const { config, users, accounts, addTransaction } = useStudio();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>('OVERVIEW');
  const [showDrivePicker, setShowDrivePicker] = useState(false);
  const [showRefundPrompt, setShowRefundPrompt] = useState(false);

  // Derived State
  const photographer = users.find(u => u.id === booking?.photographerId);

  useEffect(() => {
    if (booking) {
      setActiveTab('OVERVIEW');
      setShowDrivePicker(false);
      setShowRefundPrompt(false);
    }
  }, [booking?.id, isOpen]);

  const createLocalLog = (action: string, details?: string): ActivityLog => ({ 
      id: `log-${Date.now()}`, 
      timestamp: new Date().toISOString(), 
      action, 
      details, 
      userId: currentUser?.id || 'sys', 
      userName: currentUser?.name || 'System' 
  });
  
  const handleStatusChange = (status: ProjectStatus) => { 
      if (!booking) return;

      if (status === 'CANCELLED' && booking.paidAmount > 0) {
          setShowRefundPrompt(true);
      } else if (status === 'CANCELLED') {
          alert("Booking cancelled. Reminder: Check if any equipment was already prepared/checked out.");
      }

      onUpdateBooking({ 
          ...booking, 
          status, 
          logs: [createLocalLog('STATUS_CHANGE', `Status to ${status}`), ...(booking.logs||[])] 
      }); 
  };

  const handleProcessRefund = (shouldRefund: boolean) => {
      setShowRefundPrompt(false);
      if (!booking || !addTransaction || !accounts || accounts.length === 0) return;

      if (shouldRefund) {
          // REAL-TIME BALANCE CHECK
          const sourceAccount = accounts[0]; // Defaulting to first, ideal UX would ask user to select account
          if (sourceAccount.balance < booking.paidAmount) {
              alert(`FAILED: Insufficient funds in ${sourceAccount.name} to process refund of Rp ${booking.paidAmount.toLocaleString()}.`);
              return;
          }

          const refundAmount = booking.paidAmount;
          addTransaction({
              description: `Refund - Cancellation - ${booking.clientName}`,
              amount: refundAmount,
              category: 'Refunds',
              accountId: sourceAccount.id, 
              bookingId: booking.id
          });
          
          onUpdateBooking({ ...booking, paidAmount: 0, logs: [createLocalLog('FINANCE', `Processed refund of ${refundAmount}`), ...(booking.logs||[])] });
          alert("Refund recorded in Finance & Balance updated.");
      } else {
          onUpdateBooking({ ...booking, logs: [createLocalLog('FINANCE', 'Deposit forfeited upon cancellation'), ...(booking.logs||[])] });
      }
  };

  const handleDelete = () => { if (booking && onDeleteBooking && window.confirm('Archive project? This will also remove associated financial records.')) { onDeleteBooking(booking.id); onClose(); } };
  
  const handleSelectFolder = (folderId: string, folderName: string) => { 
      if (booking) { 
          const folderLink = `https://drive.google.com/drive/u/0/folders/${folderId}`; 
          onUpdateBooking({ ...booking, deliveryUrl: folderLink, logs: [createLocalLog('DRIVE_LINK', `Linked Drive folder: ${folderName}`), ...(booking.logs || [])] }); 
          setShowDrivePicker(false); 
      } 
  };
  
  const handleQuickWhatsApp = () => { 
      if(!booking) return;
      const url = `https://wa.me/${booking.clientPhone.replace(/\D/g, '')}`; 
      window.open(url, '_blank'); 
  };
  
  const handleCopyPortalLink = () => { 
      if(!booking || !config.ownerId) return;
      const link = `${window.location.origin}/?site=${config.ownerId}&booking=${booking.id}`; 
      navigator.clipboard.writeText(link); 
      alert("Link Copied!"); 
  };

  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 lg:p-4">
      <div className="absolute inset-0 bg-black/90" onClick={onClose}></div>
      
      <Motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 250 }}
        className="bg-lumina-base w-full lg:max-w-6xl h-full lg:h-[95vh] lg:rounded-2xl shadow-2xl relative overflow-hidden flex flex-col border border-lumina-highlight lg:border-white/10"
        role="dialog"
        aria-modal="true"
      >
        {/* HEADER */}
        <div className="p-4 lg:p-6 border-b border-lumina-highlight bg-lumina-surface flex justify-between items-center shrink-0 z-20">
            <div className="flex items-center gap-4 min-w-0">
                <button onClick={onClose} className="lg:hidden p-2 -ml-2 text-white bg-lumina-highlight rounded-lg"><ArrowLeft size={20} /></button>
                <div className="min-w-0">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-3">
                        <h2 className="text-xl lg:text-2xl font-display font-bold text-white truncate">{booking.clientName}</h2>
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
            <div className="flex items-center gap-2 lg:gap-3 shrink-0">
                <select 
                    className="bg-lumina-base border border-lumina-highlight text-white text-xs rounded-lg p-2 font-bold uppercase tracking-wide focus:border-lumina-accent outline-none max-w-[100px] lg:max-w-none"
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

        {/* REFUND PROMPT OVERLAY */}
        <AnimatePresence>
            {showRefundPrompt && (
                <div className="absolute top-0 left-0 w-full z-50 p-4 bg-rose-500/90 text-white flex justify-between items-center backdrop-blur-sm shadow-xl">
                    <div className="flex items-center gap-3">
                        <AlertCircle size={24} />
                        <div>
                            <p className="font-bold text-sm">Cancellation with Payment Detected</p>
                            <p className="text-xs opacity-90">Client has paid Rp {booking.paidAmount.toLocaleString()}. Issue refund?</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => handleProcessRefund(false)} className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-xs font-bold">No Refund</button>
                        <button onClick={() => handleProcessRefund(true)} className="px-3 py-1 bg-white text-rose-600 rounded text-xs font-bold hover:bg-gray-100">Process Refund</button>
                    </div>
                </div>
            )}
        </AnimatePresence>

        {/* TABS */}
        <div className="bg-lumina-surface border-b border-lumina-highlight px-4 lg:px-6 py-3 flex gap-3 overflow-x-auto no-scrollbar shrink-0">
            {[
                { id: 'OVERVIEW', icon: ListChecks, label: 'Overview' },
                { id: 'TASKS', icon: ListChecks, label: 'Tasks' },
                { id: 'TIMELINE', icon: Upload, label: 'Files' },
                { id: 'PROOFING', icon: Eye, label: 'Proofing' },
                { id: 'CONTRACT', icon: FileSignature, label: 'Contract' },
                { id: 'LOGS', icon: History, label: 'Logs' },
            ].map((tab) => (
                <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as Tab)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap
                        ${activeTab === tab.id ? 'bg-lumina-accent text-lumina-base shadow-sm' : 'bg-lumina-base border border-lumina-highlight text-lumina-muted hover:text-white'}
                    `}
                >
                    <tab.icon size={14} /> {tab.label}
                </button>
            ))}
        </div>

        {/* CONTENT - With proper overflow handling to prevent double scrollbars */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-lumina-base p-4 lg:p-6 pb-24">
            
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
                    currentUser={currentUser || undefined} 
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

            {/* DRIVE PICKER MODAL */}
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

        {/* STICKY FOOTER */}
        <div className="border-t border-lumina-highlight bg-lumina-surface p-3 lg:p-4 flex justify-between items-center shrink-0 pb-safe-area-bottom lg:pb-4 z-20 absolute bottom-0 w-full">
            <div className="hidden lg:block text-[10px] text-lumina-muted uppercase tracking-wider font-bold">Quick Actions</div>
            <div className="flex gap-3 w-full lg:w-auto">
                <button onClick={() => setActiveTab('TIMELINE')} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-3 lg:py-2 bg-lumina-base border border-lumina-highlight rounded-xl hover:bg-lumina-highlight text-white text-xs font-bold transition-colors">
                    <Upload size={16}/> Upload
                </button>
                <button onClick={handleQuickWhatsApp} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-3 lg:py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors">
                    <MessageCircle size={16}/> WhatsApp
                </button>
                <button onClick={handleCopyPortalLink} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-3 lg:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors">
                    <Copy size={16}/> Link
                </button>
            </div>
        </div>
      </Motion.div>
    </div>
  );
};

export default ProjectDrawer;
