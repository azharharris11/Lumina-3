
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SiteBuilderViewProps, SitePage, SiteSection, SectionType, SiteTheme, SiteConfig } from '../types';
import { Globe, Smartphone, Monitor, PanelLeftOpen, Undo2, Redo2 } from 'lucide-react';
import SitePreviewFrame from '../components/site-builder/SitePreviewFrame';
import SiteBuilderSidebar from '../components/site-builder/SiteBuilderSidebar';

// Themes
import NoirTheme from '../components/site-builder/themes/NoirTheme';
import EtherealTheme from '../components/site-builder/themes/EtherealTheme';
import VogueTheme from '../components/site-builder/themes/VogueTheme';
import MinimalTheme from '../components/site-builder/themes/MinimalTheme';
import CinemaTheme from '../components/site-builder/themes/CinemaTheme';
import RetroTheme from '../components/site-builder/themes/RetroTheme';
import AtelierTheme from '../components/site-builder/themes/AtelierTheme';
import HorizonTheme from '../components/site-builder/themes/HorizonTheme';
import BoldTheme from '../components/site-builder/themes/BoldTheme';
import ImpactTheme from '../components/site-builder/themes/ImpactTheme';
import CleanSlateTheme from '../components/site-builder/themes/CleanSlateTheme';
import AuthorityTheme from '../components/site-builder/themes/AuthorityTheme';

interface ExtendedSiteBuilderViewProps extends SiteBuilderViewProps {
    onExit?: () => void;
}

const THEMES: {id: SiteTheme, label: string, color: string, textColor: string}[] = [
    { id: 'NOIR', label: 'Noir', color: '#000000', textColor: '#ffffff' },
    { id: 'ETHEREAL', label: 'Ethereal', color: '#fcfaf7', textColor: '#4a4a4a' },
    { id: 'VOGUE', label: 'Vogue', color: '#ff3333', textColor: '#000000' },
    { id: 'MINIMAL', label: 'Minimal', color: '#ffffff', textColor: '#000000' },
    { id: 'CINEMA', label: 'Cinema', color: '#1a1a1a', textColor: '#ffffff' },
    { id: 'RETRO', label: 'Retro', color: '#008080', textColor: '#ffffff' },
    { id: 'ATELIER', label: 'Atelier', color: '#f5f0eb', textColor: '#2c2c2c' },
    { id: 'HORIZON', label: 'Horizon', color: '#0f172a', textColor: '#ffffff' },
    { id: 'BOLD', label: 'Bold', color: '#bef264', textColor: '#000000' },
    { id: 'IMPACT', label: 'Impact', color: '#ffff00', textColor: '#000000' },
    { id: 'CLEANSLATE', label: 'Clean Slate', color: '#f8fafc', textColor: '#334155' },
    { id: 'AUTHORITY', label: 'Authority', color: '#1a1a1a', textColor: '#d97706' },
];

const SiteBuilderView: React.FC<ExtendedSiteBuilderViewProps> = ({ config, packages, users, bookings, onUpdateConfig, onExit, onPublicBooking }) => {
  // HISTORY STATE FOR UNDO/REDO
  const [history, setHistory] = useState<SiteConfig[]>([config.site]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const localSite = history[historyIndex];

  const [previewMode, setPreviewMode] = useState<'DESKTOP' | 'MOBILE'>('DESKTOP');
  const [activeTab, setActiveTab] = useState<'CONTENT' | 'SECTIONS' | 'GALLERY' | 'MARKETING' | 'PAGES'>('CONTENT');
  const [activePageId, setActivePageId] = useState<string>('HOME');
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [newPageName, setNewPageName] = useState('');
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Check if current state differs from saved config
  const hasChanges = useMemo(() => {
      return JSON.stringify(localSite) !== JSON.stringify(config.site);
  }, [localSite, config.site]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // --- HISTORY MANAGEMENT ---
  const updateSiteState = useCallback((newState: SiteConfig) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newState);
      // Limit history stack size if needed (e.g. 50)
      if (newHistory.length > 50) newHistory.shift();
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const handleUndo = useCallback(() => {
      if (canUndo) setHistoryIndex(prev => prev - 1);
  }, [canUndo]);

  const handleRedo = useCallback(() => {
      if (canRedo) setHistoryIndex(prev => prev + 1);
  }, [canRedo]);

  // Keyboard Shortcuts for Undo/Redo (Cmd+Z, Cmd+Shift+Z)
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
              e.preventDefault();
              if (e.shiftKey) handleRedo();
              else handleUndo();
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // DATA LOSS PROTECTION (Window Unload)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (hasChanges) {
            e.preventDefault();
            e.returnValue = ''; // Chrome requires returnValue to be set
        }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges]);

  const publicUrl = `${window.location.origin}?site=${config.ownerId || 'me'}`;

  const activePageData = useMemo(() => {
      if (activePageId === 'HOME') return localSite;
      return localSite.pages?.find(p => p.id === activePageId) || localSite;
  }, [activePageId, localSite]);

  const handleContentChange = (key: string, value: any) => {
      if (activePageId === 'HOME') {
          updateSiteState({ ...localSite, [key]: value });
      } else {
          updateSiteState({
              ...localSite,
              pages: localSite.pages?.map(p => p.id === activePageId ? { ...p, [key]: value } : p) || []
          });
      }
  };

  const getActiveSections = () => {
      if (activePageId === 'HOME') return []; 
      return (activePageData as SitePage).sections || [];
  };

  const updateSections = (newSections: SiteSection[]) => {
      handleContentChange('sections', newSections);
  };

  const handleAddSection = (type: SectionType) => {
      const newSection: SiteSection = {
          id: `sec-${Date.now()}`,
          type,
          content: {
              headline: type === 'MAP_LOCATION' ? 'Visit Us' : 'New Section',
              description: 'Add your content here.',
              image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80',
              // New Section Defaults
              bookingMode: type === 'CTA_BANNER' ? 'INSTANT' : undefined,
              mapConfig: type === 'MAP_LOCATION' ? { lat: -6.2, lng: 106.8, zoom: 15, label: 'Studio Location' } : undefined
          }
      };
      updateSections([...getActiveSections(), newSection]);
      setSelectedSectionId(newSection.id);
  };

  const handleUpdateSection = (id: string, content: any) => {
      const sections = getActiveSections().map(s => s.id === id ? { ...s, content: { ...s.content, ...content } } : s);
      updateSections(sections);
  };

  const handleDeleteSection = (id: string) => {
      if(window.confirm('Delete this section?')) {
          updateSections(getActiveSections().filter(s => s.id !== id));
          if (selectedSectionId === id) setSelectedSectionId(null);
      }
  };

  const handleReorderSections = (newOrder: SiteSection[]) => {
      updateSections(newOrder);
  };

  const handleGlobalChange = (key: string, value: any) => {
      updateSiteState({ ...localSite, [key]: value });
  };

  const handleAddPage = () => {
      if (newPageName.trim()) {
          const slug = newPageName.toLowerCase().replace(/\s+/g, '-');
          const newPage: SitePage = {
              id: `p-${Date.now()}`,
              title: newPageName,
              slug: slug,
              headline: newPageName,
              description: 'Add your page description here.',
              heroImage: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80',
              showPortfolio: true,
              showPricing: false,
              showBookingWidget: true,
              gallery: [],
              sections: [] 
          };
          updateSiteState({ ...localSite, pages: [...(localSite.pages || []), newPage] });
          setNewPageName('');
      }
  };

  const handleDeletePage = (id: string) => {
      if (window.confirm('Are you sure? This page will be deleted.')) {
          updateSiteState({ ...localSite, pages: localSite.pages?.filter(p => p.id !== id) || [] });
          if (activePageId === id) setActivePageId('HOME');
      }
  };

  const handleSave = () => {
      onUpdateConfig({ ...config, site: localSite });
      // Reset history reference implicitly by parent update, 
      // but here we keep the stack so user can undo post-save if needed
  };

  const renderTheme = () => {
      const commonProps = { 
          site: localSite, 
          activePage: activePageData, 
          packages, 
          users, 
          bookings, 
          config, 
          onBooking: onPublicBooking,
          onNavigate: (pageId: string) => {
              setActivePageId(pageId);
          }
      };

      switch(localSite.theme) {
          case 'ETHEREAL': return <EtherealTheme {...commonProps} />;
          case 'VOGUE': return <VogueTheme {...commonProps} />;
          case 'MINIMAL': return <MinimalTheme {...commonProps} />;
          case 'CINEMA': return <CinemaTheme {...commonProps} />;
          case 'RETRO': return <RetroTheme {...commonProps} />;
          case 'ATELIER': return <AtelierTheme {...commonProps} />;
          case 'HORIZON': return <HorizonTheme {...commonProps} />;
          case 'BOLD': return <BoldTheme {...commonProps} />;
          case 'IMPACT': return <ImpactTheme {...commonProps} />;
          case 'CLEANSLATE': return <CleanSlateTheme {...commonProps} />;
          case 'AUTHORITY': return <AuthorityTheme {...commonProps} />;
          default: return <NoirTheme {...commonProps} />;
      }
  };

  return (
    <div className="h-screen w-full flex flex-col md:flex-row bg-lumina-base overflow-hidden relative">
      
      {/* Floating Sidebar Toggle (Desktop) */}
      <AnimatePresence>
        {!isSidebarOpen && !isMobile && (
            <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onClick={() => setIsSidebarOpen(true)}
                className="absolute top-4 left-4 z-50 p-3 bg-lumina-surface border border-lumina-highlight rounded-xl text-white shadow-2xl hover:bg-lumina-highlight transition-colors hidden md:flex"
            >
                <PanelLeftOpen size={20} />
            </motion.button>
        )}
      </AnimatePresence>

      <SiteBuilderSidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          isMobile={isMobile}
          localSite={localSite}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activePageId={activePageId}
          setActivePageId={setActivePageId}
          activePageData={activePageData}
          hasChanges={hasChanges}
          themes={THEMES}
          onExit={onExit || (() => {})}
          onSave={handleSave}
          handleGlobalChange={handleGlobalChange}
          handleContentChange={handleContentChange}
          handleAddSection={handleAddSection}
          handleUpdateSection={handleUpdateSection}
          handleDeleteSection={handleDeleteSection}
          handleMoveSection={() => {}} // Deprecated in favor of drag/drop reorder
          handleReorderSections={handleReorderSections}
          getActiveSections={getActiveSections}
          selectedSectionId={selectedSectionId}
          setSelectedSectionId={setSelectedSectionId}
          handleAddPage={handleAddPage}
          handleDeletePage={handleDeletePage}
          newPageName={newPageName}
          setNewPageName={setNewPageName}
          newGalleryUrl={newGalleryUrl}
          setNewGalleryUrl={setNewGalleryUrl}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={handleUndo}
          onRedo={handleRedo}
      />

      {/* --- PREVIEW AREA --- */}
      <div className="flex-1 flex flex-col h-[60vh] md:h-full bg-[#111] relative order-1 md:order-2">
          <div className="h-14 border-b border-lumina-highlight flex justify-center items-center gap-4 bg-lumina-base z-10 shrink-0">
              {/* Undo/Redo Controls */}
              <div className="flex items-center gap-2 mr-4 border-r border-lumina-highlight pr-4">
                  <button onClick={handleUndo} disabled={!canUndo} className="p-2 text-lumina-muted hover:text-white disabled:opacity-30 disabled:hover:text-lumina-muted" title="Undo (Cmd+Z)">
                      <Undo2 size={18} />
                  </button>
                  <button onClick={handleRedo} disabled={!canRedo} className="p-2 text-lumina-muted hover:text-white disabled:opacity-30 disabled:hover:text-lumina-muted" title="Redo (Cmd+Shift+Z)">
                      <Redo2 size={18} />
                  </button>
              </div>

              <button onClick={() => setPreviewMode('DESKTOP')} className={`p-2 rounded-lg transition-colors ${previewMode === 'DESKTOP' ? 'text-white bg-lumina-highlight' : 'text-lumina-muted hover:text-white'}`}><Monitor size={18} /></button>
              <button onClick={() => setPreviewMode('MOBILE')} className={`p-2 rounded-lg transition-colors ${previewMode === 'MOBILE' ? 'text-white bg-lumina-highlight' : 'text-lumina-muted hover:text-white'}`}><Smartphone size={18} /></button>
              <div className="w-px h-6 bg-lumina-highlight mx-2"></div>
              <a href={publicUrl} target="_blank" className="flex items-center gap-2 text-xs font-bold text-lumina-accent hover:underline bg-lumina-accent/10 px-3 py-1 rounded-full border border-lumina-accent/20"><Globe size={12} /> Live</a>
          </div>

          <div className="flex-1 overflow-hidden flex items-center justify-center bg-neutral-900 p-4 md:p-8 relative">
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
              <motion.div layout className={`bg-white shadow-2xl overflow-hidden transition-all duration-500 ease-in-out relative ${previewMode === 'MOBILE' ? 'w-[375px] h-[812px] rounded-[3rem] border-[8px] border-gray-900 ring-4 ring-gray-800' : 'w-full h-full rounded-lg border border-lumina-highlight'}`}>
                  {previewMode === 'MOBILE' && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl z-50"></div>}
                  
                  {/* USING IFRAME COMPONENT FOR ISOLATION */}
                  <SitePreviewFrame className="w-full h-full">
                      {renderTheme()}
                  </SitePreviewFrame>
              </motion.div>
          </div>
      </div>
    </div>
  );
};

export default SiteBuilderView;
