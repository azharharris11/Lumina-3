
import React, { useState, useRef } from 'react';
import { FileSignature, CheckCircle2, Eraser, Loader2 } from 'lucide-react';
import { Booking, ActivityLog } from '../../types';
import { uploadFile, dataURLtoBlob } from '../../utils/storageUtils';

interface ProjectContractProps {
  booking: Booking;
  onUpdateBooking: (booking: Booking) => void;
  createLocalLog: (action: string, details?: string) => ActivityLog;
}

const ProjectContract: React.FC<ProjectContractProps> = ({ booking, onUpdateBooking, createLocalLog }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const startDrawing = (e: React.MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.beginPath();
      ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      setIsSigning(true);
  };

  const draw = (e: React.MouseEvent) => {
      if (!isSigning) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      ctx.stroke();
  };

  const stopDrawing = () => { setIsSigning(false); };

  const clearSignature = () => {
      const canvas = canvasRef.current;
      if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
  };

  const saveContract = async () => {
      const canvas = canvasRef.current;
      if (canvas && booking) {
          setIsSaving(true);
          try {
              // Convert Canvas to Blob
              const dataUrl = canvas.toDataURL('image/png');
              const blob = dataURLtoBlob(dataUrl);
              const file = new File([blob], `signature_${booking.id}.png`, { type: 'image/png' });

              // Upload to Firebase Storage
              const downloadURL = await uploadFile(file, `contracts/${booking.id}`);

              onUpdateBooking({
                  ...booking,
                  contractStatus: 'SIGNED',
                  contractSignedDate: new Date().toISOString(),
                  contractSignature: downloadURL, // Save URL, not base64
                  logs: [createLocalLog('CONTRACT_SIGNED', 'Digital signature uploaded'), ...(booking.logs || [])]
              });
              alert("Contract Signed Successfully!");
          } catch (error) {
              console.error(error);
              alert("Failed to save signature. Please try again.");
          } finally {
              setIsSaving(false);
          }
      }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><FileSignature size={20} className="text-lumina-accent"/> Digital Contract</h3>
        
        {booking.contractStatus === 'SIGNED' ? (
            <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 size={40} className="text-emerald-500"/>
                </div>
                <p className="text-emerald-400 font-bold text-lg">Contract Signed</p>
                <p className="text-lumina-muted text-sm">Date: {new Date(booking.contractSignedDate || '').toLocaleString()}</p>
                {booking.contractSignature && (
                    <div className="bg-white p-4 rounded-lg mt-4">
                        <img src={booking.contractSignature} alt="Signature" className="h-20 mx-auto"/>
                    </div>
                )}
            </div>
        ) : (
            <div className="w-full max-w-md space-y-4">
                <p className="text-center text-lumina-muted text-sm mb-2">Sign below to acknowledge terms.</p>
                <div className="bg-white rounded-xl overflow-hidden border-2 border-lumina-highlight">
                    <canvas 
                        ref={canvasRef}
                        width={400}
                        height={200}
                        className="cursor-crosshair w-full touch-none"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                    />
                </div>
                <div className="flex justify-between">
                    <button onClick={clearSignature} disabled={isSaving} className="flex items-center gap-2 text-lumina-muted hover:text-white text-sm disabled:opacity-50"><Eraser size={14}/> Clear</button>
                    <button onClick={saveContract} disabled={isSaving} className="bg-lumina-accent text-lumina-base px-6 py-2 rounded-lg font-bold hover:bg-lumina-accent/90 disabled:opacity-50 flex items-center gap-2">
                        {isSaving && <Loader2 size={14} className="animate-spin"/>}
                        {isSaving ? 'Signing...' : 'Accept & Sign'}
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};

export default ProjectContract;
