
import React, { useRef, useState, useMemo } from 'react';
import { HardDrive, Plus, Upload, Loader2, Lock, MessageCircle, File, Trash2, Download, ExternalLink } from 'lucide-react';
import { Booking, User, ActivityLog, BookingFile } from '../../types';
import { uploadFile } from '../../utils/storageUtils';

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
      fileInputRef.current?.click(); 
  };

  const handleUploadToStorage = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setIsUploading(true);
          try {
              const file = e.target.files[0];
              // Upload to Firebase Storage: projects/{bookingId}/{filename}
              const url = await uploadFile(file, `projects/${booking.id}`, file.name);
              
              const newFile: BookingFile = {
                  id: `f-${Date.now()}`,
                  name: file.name,
                  url: url,
                  type: 'DELIVERABLE',
                  uploadedAt: new Date().toISOString()
              };

              const updatedFiles = [...(booking.files || []), newFile];
              
              onUpdateBooking({ 
                  ...booking, 
                  files: updatedFiles,
                  logs: [createLocalLog('UPLOAD', `Uploaded file: ${file.name}`), ...(booking.logs || [])]
              });

          } catch (error) {
              console.error("Upload failed", error);
              alert("Upload failed. Please try again.");
          } finally {
              setIsUploading(false);
              // Reset input
              if (fileInputRef.current) fileInputRef.current.value = '';
          }
      }
  };

  const handleDeleteFile = (fileId: string) => {
      if(window.confirm("Delete this file?")) {
          const updatedFiles = (booking.files || []).filter(f => f.id !== fileId);
          onUpdateBooking({
              ...booking,
              files: updatedFiles
          });
      }
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

            {/* Uploaded Files List */}
            <div className="mb-6 space-y-2">
                <h4 className="text-xs font-bold text-lumina-muted uppercase mb-2">Uploaded Deliverables</h4>
                {(!booking.files || booking.files.length === 0) && (
                    <p className="text-sm text-lumina-muted/50 italic">No files uploaded directly.</p>
                )}
                {booking.files?.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-lumina-base/50 border border-lumina-highlight rounded-lg group">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-2 bg-lumina-surface rounded text-lumina-accent">
                                <File size={16} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-white truncate">{file.name}</p>
                                <p className="text-[10px] text-lumina-muted">{new Date(file.uploadedAt).toLocaleDateString()} • Direct Upload</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <a href={file.url} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-lumina-highlight rounded text-lumina-muted hover:text-white transition-colors" title="Download">
                                <Download size={14} />
                            </a>
                            <button onClick={() => handleDeleteFile(file.id)} className="p-2 hover:bg-rose-500/20 rounded text-lumina-muted hover:text-rose-500 transition-colors" title="Delete">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Delivery Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                    onClick={handleUploadClick}
                    className={`p-4 border border-dashed border-lumina-highlight rounded-xl flex flex-col items-center justify-center text-center transition-colors bg-lumina-base/30 h-32 cursor-pointer group relative ${isUploading ? 'opacity-50 pointer-events-none' : 'hover:border-lumina-accent/50'}`}
                >
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleUploadToStorage} 
                    />
                    {isUploading ? (
                        <Loader2 className="animate-spin text-lumina-accent mb-2" />
                    ) : (
                        <Upload className="text-lumina-muted group-hover:text-white mb-2 transition-colors" />
                    )}
                    <p className="text-sm font-bold text-white">{isUploading ? 'Uploading...' : 'Upload File'}</p>
                    <p className="text-xs text-lumina-muted">{isUploading ? 'Please wait' : 'Click to upload to project storage'}</p>
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
                            ? "Payment complete. You can share the portal or files." 
                            : "Outstanding balance detected. Download access restricted."}
                    </p>
                    <button 
                        disabled={!isPaymentSettled && currentUser?.role !== 'OWNER'}
                        onClick={handleQuickWhatsApp}
                        className="w-full py-2 bg-lumina-surface border border-lumina-highlight hover:bg-lumina-highlight text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {!isPaymentSettled && <Lock size={12}/>} Notify Client
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ProjectFiles;
