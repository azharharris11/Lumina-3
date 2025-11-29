
import React, { useState, useEffect } from 'react';
import { Eye, RefreshCcw, HardDrive, Loader2, ImageIcon, ExternalLink, AlertTriangle } from 'lucide-react';
import { Booking } from '../../types';

interface DriveFile {
    id: string;
    name: string;
    thumbnailLink: string;
    webViewLink: string;
    mimeType: string;
}

interface ProjectProofingProps {
  booking: Booking;
  googleToken?: string | null;
  onNavigateToFiles: () => void;
}

const ProjectProofing: React.FC<ProjectProofingProps> = ({ booking, googleToken, onNavigateToFiles }) => {
  const [proofingFiles, setProofingFiles] = useState<DriveFile[]>([]);
  const [isLoadingProofing, setIsLoadingProofing] = useState(false);
  const [authError, setAuthError] = useState(false);

  const fetchProofingFiles = async () => {
      if (!googleToken || !booking?.deliveryUrl) return;
      const match = booking.deliveryUrl.match(/\/folders\/([a-zA-Z0-9-_]+)/);
      const folderId = match ? match[1] : null;
      if (!folderId) return;
      
      setIsLoadingProofing(true);
      setAuthError(false);
      try {
          const query = `'${folderId}' in parents and mimeType contains 'image/' and trashed=false`;
          const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,thumbnailLink,webViewLink,mimeType)&orderBy=createdTime desc`;
          const res = await fetch(url, { headers: { 'Authorization': `Bearer ${googleToken}` } });
          
          if (res.status === 401) {
              setAuthError(true);
              return;
          }

          if (res.ok) { const data = await res.json(); setProofingFiles(data.files || []); }
      } catch (e) { console.error(e); } finally { setIsLoadingProofing(false); }
  };

  useEffect(() => {
      fetchProofingFiles();
  }, [googleToken, booking?.deliveryUrl]);

  return (
    <div className="bg-lumina-surface border border-lumina-highlight rounded-2xl p-6 min-h-[400px]">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h3 className="font-bold text-white flex items-center gap-2"><Eye size={18} className="text-lumina-accent"/> Proofing</h3>
                <p className="text-xs text-lumina-muted mt-1">
                    {proofingFiles.length > 0 ? `${proofingFiles.length} images linked.` : 'No images found.'}
                </p>
            </div>
            <button onClick={fetchProofingFiles} className="p-2 bg-lumina-highlight hover:bg-white hover:text-black rounded-lg transition-colors" title="Refresh">
                <RefreshCcw size={16} className={isLoadingProofing ? 'animate-spin' : ''} />
            </button>
        </div>
        
        {authError ? (
            <div className="p-10 text-center border border-dashed border-rose-500/50 rounded-xl bg-rose-500/10">
                <AlertTriangle size={32} className="text-rose-500 mx-auto mb-4"/>
                <p className="text-sm text-white font-bold mb-2">Google Session Expired</p>
                <p className="text-xs text-rose-300 mb-4">Access token is no longer valid. Please refresh your connection.</p>
                <p className="text-[10px] text-lumina-muted">Go to Settings > Profile & Account to reconnect.</p>
            </div>
        ) : !booking?.deliveryUrl ? (
            <div className="p-10 text-center border border-dashed border-lumina-highlight rounded-xl bg-lumina-base/20">
                <HardDrive size={32} className="text-lumina-muted mx-auto mb-4"/>
                <p className="text-sm text-white font-bold mb-2">No Drive Folder Linked</p>
                <p className="text-xs text-lumina-muted mb-4">Connect a Google Drive folder in the 'Files' tab to start proofing.</p>
                <button onClick={onNavigateToFiles} className="text-xs text-lumina-accent hover:underline">Go to Files</button>
            </div>
        ) : isLoadingProofing ? (
            <div className="flex justify-center items-center h-40">
                <Loader2 className="w-8 h-8 text-lumina-accent animate-spin"/>
            </div>
        ) : proofingFiles.length === 0 ? (
            <div className="p-10 text-center border border-dashed border-lumina-highlight rounded-xl bg-lumina-base/20">
                <p className="text-sm text-lumina-muted">Folder is empty.</p>
                <p className="text-xs text-lumina-muted/50 mt-2">Upload images to the linked folder to see them here.</p>
            </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {proofingFiles.map((file) => (
                    <div key={file.id} className="aspect-square bg-lumina-base border border-lumina-highlight rounded-lg overflow-hidden relative group hover:border-lumina-accent transition-colors cursor-pointer">
                        {file.thumbnailLink ? (
                            <img src={file.thumbnailLink.replace('=s220', '=s400')} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-lumina-muted"><ImageIcon size={24}/></div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <a href={file.webViewLink} target="_blank" className="p-2 bg-white text-black rounded-full hover:scale-110 transition-transform" title="View in Drive">
                                <ExternalLink size={14}/>
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};

export default ProjectProofing;
