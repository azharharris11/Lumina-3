
import React, { useState, useEffect } from 'react';
import { SettingsViewProps, StudioConfig, Booking, User, Asset } from '../types';
import { Sliders, Tag, MessageSquare, User as UserIcon, Zap, HardDrive } from 'lucide-react';

import GeneralTab from '../components/settings-tabs/GeneralTab';
import PackagesTab from '../components/settings-tabs/PackagesTab';
import TemplatesTab from '../components/settings-tabs/TemplatesTab';
import TeamTab from '../components/settings-tabs/TeamTab';
import AutomationTab from '../components/settings-tabs/AutomationTab';
import DataTab from '../components/settings-tabs/DataTab';

interface ExtendedSettingsViewProps extends SettingsViewProps {
    bookings?: Booking[];
    googleToken?: string | null;
    setGoogleToken?: (token: string | null) => void;
    assets?: Asset[];
}

declare var google: any;

const SettingsView: React.FC<ExtendedSettingsViewProps> = ({ packages, config, onAddPackage, onUpdatePackage, onDeletePackage, onUpdateConfig, bookings = [], currentUser, onUpdateUserProfile, onDeleteAccount, googleToken, setGoogleToken, assets = [] }) => {
  const [activeTab, setActiveTab] = useState('GENERAL');
  const [localConfig, setLocalConfig] = useState<StudioConfig>(config);

  useEffect(() => { setLocalConfig(config); }, [config]);

  const loadGoogleScript = () => { 
      return new Promise((resolve, reject) => { 
          if (typeof google !== 'undefined' && google.accounts) { 
              resolve(true); 
              return; 
          } 
          const script = document.createElement('script'); 
          script.src = 'https://accounts.google.com/gsi/client'; 
          script.async = true; 
          script.defer = true; 
          script.onload = () => resolve(true); 
          script.onerror = () => reject(new Error("Failed to load Google Identity Services"));
          document.body.appendChild(script); 
      }); 
  };
  
  const handleConnectGoogle = async () => { 
      if (googleToken) { 
          if (window.confirm("Disconnect Google Account?")) { 
              if(setGoogleToken) setGoogleToken(null); 
          } 
          return; 
      } 
      
      try {
          await loadGoogleScript();
          
          if (typeof google === 'undefined' || !google.accounts) {
              throw new Error("Google Identity Services not initialized. Please refresh and try again.");
          }

          const CLIENT_ID = '276331844787-lolqnoah70th2mm7jt2ftim37sjilu00.apps.googleusercontent.com'; 
          const client = google.accounts.oauth2.initTokenClient({ 
              client_id: CLIENT_ID, 
              scope: 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/drive', 
              callback: (tokenResponse: any) => { 
                  if (tokenResponse && tokenResponse.access_token) { 
                      if(setGoogleToken) setGoogleToken(tokenResponse.access_token); 
                      alert("Successfully connected! Session is active."); 
                  } 
              }, 
          }); 
          client.requestAccessToken(); 
      } catch (e: any) {
          console.error("Google Connect Error:", e);
          alert(`Connection failed: ${e.message}`);
      }
  };

  const handleSaveConfig = () => { if (onUpdateConfig) { onUpdateConfig(localConfig); } };

  const handleExportData = () => { 
      try { 
          const seen = new WeakSet();
          const replacer = (key: string, value: any) => {
              if (typeof value === 'object' && value !== null) {
                  if (seen.has(value)) {
                      return;
                  }
                  seen.add(value);
              }
              if (key === 'firestore' || key === '_key' || key === 'app' || key === 'delegate' || key.startsWith('_')) {
                  return undefined;
              }
              return value;
          };
          const dataToExport = { config: localConfig, packages: packages, timestamp: new Date().toISOString() }; 
          const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToExport, replacer)); 
          const downloadAnchorNode = document.createElement('a'); 
          downloadAnchorNode.setAttribute("href", dataStr); 
          downloadAnchorNode.setAttribute("download", "lumina_backup.json"); 
          document.body.appendChild(downloadAnchorNode); 
          downloadAnchorNode.click(); 
          downloadAnchorNode.remove(); 
      } catch (e) { 
          console.error("Export Failed:", e); 
          alert("Failed to export data. See console."); 
      } 
  };

  const menuItems = [
    { id: 'GENERAL', label: 'General', icon: Sliders },
    { id: 'PACKAGES', label: 'Packages', icon: Tag },
    { id: 'TEMPLATES', label: 'Templates', icon: MessageSquare },
    { id: 'TEAM', label: 'Profile & Account', icon: UserIcon },
    { id: 'AUTOMATION', label: 'Workflow', icon: Zap },
    { id: 'DATA', label: 'Data', icon: HardDrive },
  ];

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6 pb-20 lg:pb-0">
      {/* Sidebar */}
      <div className="w-full lg:w-64 bg-lumina-surface border border-lumina-highlight rounded-2xl p-4 flex flex-row lg:flex-col gap-2 shrink-0 overflow-x-auto no-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold whitespace-nowrap ${activeTab === item.id ? 'bg-lumina-accent text-lumina-base shadow-lg shadow-lumina-accent/20' : 'text-lumina-muted hover:text-white hover:bg-lumina-highlight'}`}
          >
            <item.icon size={18} /> {item.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-lumina-surface border border-lumina-highlight rounded-2xl p-6 lg:p-8 relative overflow-y-auto custom-scrollbar">
        
        {activeTab === 'GENERAL' && (
            <GeneralTab 
                config={localConfig} 
                setConfig={setLocalConfig} 
                onSave={handleSaveConfig} 
                onUpdateConfig={onUpdateConfig}
            />
        )}

        {activeTab === 'PACKAGES' && (
            <PackagesTab 
                packages={packages} 
                onAddPackage={onAddPackage} 
                onUpdatePackage={onUpdatePackage} 
                assets={assets} 
            />
        )}

        {activeTab === 'TEMPLATES' && (
            <TemplatesTab 
                config={localConfig} 
                setConfig={setLocalConfig} 
                onSave={handleSaveConfig} 
            />
        )}

        {activeTab === 'TEAM' && (
            <TeamTab 
                currentUser={currentUser || null} 
                onUpdateProfile={onUpdateUserProfile || (() => {})} 
                googleToken={googleToken || null} 
                onConnectGoogle={handleConnectGoogle} 
                onDeleteAccount={onDeleteAccount || (() => {})} 
            />
        )}

        {activeTab === 'AUTOMATION' && (
            <AutomationTab 
                config={localConfig} 
                setConfig={setLocalConfig} 
                onUpdateConfig={onUpdateConfig} 
            />
        )}

        {activeTab === 'DATA' && (
            <DataTab onExportData={handleExportData} />
        )}

      </div>
    </div>
  );
};

export default SettingsView;
