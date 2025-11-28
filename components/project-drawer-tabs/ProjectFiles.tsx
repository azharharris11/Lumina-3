
import React, { useRef, useState, useMemo } from 'react';
import { HardDrive, Plus, Upload, Loader2, Lock, MessageCircle } from 'lucide-react';
import { Booking, User, ActivityLog } from '../../types';

interface ProjectFilesProps {
  booking: Booking;
  currentUser?: User;
  onUpdateBooking: (booking: Booking) => void;
  createLocalLog: (action: string, details?: string) => ActivityLog;
  onOpenDrivePicker: () => void;
}

const ProjectFiles: React.FC<ProjectFilesProps> = ({ booking, currentUser, onUpdateBooking, createLocalLog, onOpenDrivePicker }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPaymentSettled = useMemo(() => {
      if (!booking) return false;
      const tax = booking.taxSnapshot || 0;
      let subtotal = booking.price;
      if (booking.items && booking.items.length > 0) {
          subtotal = booking.items.reduce((acc, item) => acc + item.total, 0);
      }
      let discountVal = 0;
      if (booking.discount) {
          discountVal = booking.discount.type === 'PERCENT' ? subtotal * (booking.discount.value/100) : booking.discount.value;
      }
      const total = (subtotal - discountVal) * (1 + tax/100);
      return booking.paidAmount >= (total - 100);
  }, [booking]);

  const handleUploadClick = () => { 
      if (!booking?.deliveryUrl) { 
          alert("Please link a Google Drive folder first."); 
          return; 
      } 
      fileInputRef.current?.click(); 
  };

  const handleUploadToDrive = async (e: React.ChangeEvent<HTMLInputElement>) => {
      // Placeholder for actual upload logic
      setIsUploading(true);
      setTimeout(() => {
          setIsUploading(false);
          alert("File upload simulation complete. In a real app, this streams to the linked Drive folder.");
      }, 2000);
  };

  const handleQuickWhatsApp = () => { 
      const url = `https://wa.me/${booking?.clientPhone.replace(/\D/g, '')}`; 
      window.open(url, '_blank'); 
  };

  return (
    <div className="space-y-6">
        <div className="bg-lumina-surface border border-lumina-highlight rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2"><HardDrive size={18} className="text-lumina-accent"/> Project Files</h3>
            
            {/* Drive Link Section */}
            <div className="p-4 bg-lumina-base border border-lumina-highlight rounded-xl flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="font-bold text-white text-sm">Google Drive Folder</p>
                        {booking.deliveryUrl ? (
                            <a href={booking.deliveryUrl} target="_blank" className="text-xs text-blue-400 hover:underline truncate block max-w-[200px]">{booking.deliveryUrl}</a>
                        ) : (
                            <p className="text-xs text-lumina-muted">Not connected yet.</p>
                        )}
                    </div>
                </div>
                <div className="flex gap-2 w-full lg:w-auto">
                    {booking.deliveryUrl ? (
                        <a href={booking.deliveryUrl} target="_blank" className="flex-1 text-center px-4 py-2 bg-lumina-surface border border-lumina-highlight hover:bg-lumina-highlight text-white text-xs font-bold rounded-lg transition-colors">
                            Open Folder
                        </a>
                    ) : (
                        <button 
                            onClick={onOpenDrivePicker}
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus size={14}/> Create / Link Folder
                        </button>
                    )}
                </div>
            </div>

            {/* Delivery Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                    onClick={handleUploadClick}
                    className="p-4 border border-dashed border-lumina-highlight rounded-xl flex flex-col items-center justify-center text-center hover:border-lumina-accent/50 transition-colors bg-lumina-base/30 h-32 cursor-pointer group relative"
                >
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleUploadToDrive} 
                    />
                    {isUploading ? (
                        <Loader2 className="animate-spin text-lumina-accent mb-2" />
                    ) : (
                        <Upload className="text-lumina-muted group-hover:text-white mb-2 transition-colors" />
                    )}
                    <p className="text-sm font-bold text-white">{isUploading ? 'Uploading to Drive...' : 'Upload Deliverables'}</p>
                    <p className="text-xs text-lumina-muted">{isUploading ? 'Please wait' : 'Click to upload to linked Drive folder'}</p>
                </div>
                
                <div className="p-4 bg-lumina-base border border-lumina-highlight rounded-xl relative overflow-hidden">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-white text-sm">Client Access</h4>
                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${isPaymentSettled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                            {isPaymentSettled ? 'Unlocked' : 'Locked'}
                        </div>
                    </div>
                    <p className="text-xs text-lumina-muted mb-4">
                        {isPaymentSettled 
                            ? "Payment complete. You can send the download link to the client." 
                            : "Outstanding balance detected. Download access is restricted until settled."}
                    </p>
                    <button 
                        disabled={!isPaymentSettled && currentUser?.role !== 'OWNER'}
                        onClick={handleQuickWhatsApp}
                        className="w-full py-2 bg-lumina-surface border border-lumina-highlight hover:bg-lumina-highlight text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {!isPaymentSettled && <Lock size={12}/>} Send Delivery Link
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ProjectFiles;
