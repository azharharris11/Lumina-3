
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import DashboardView from './views/DashboardView';
import CalendarView from './views/CalendarView';
import ProductionView from './views/ProductionView';
import InventoryView from './views/InventoryView';
import ClientsView from './views/ClientsView';
import TeamView from './views/TeamView';
import FinanceView from './views/FinanceView';
import SettingsView from './views/SettingsView';
import LoginView from './views/LoginView';
import LandingPageView from './views/LandingPageView';
import RegisterView from './views/RegisterView';
import AnalyticsView from './views/AnalyticsView';
import SiteBuilderView from './views/SiteBuilderView';
import PublicSiteView from './views/PublicSiteView';
import OnboardingView from './views/OnboardingView';
import AppLauncher from './components/AppLauncher';
import NewBookingModal from './components/NewBookingModal';
import ProjectDrawer from './components/ProjectDrawer';
import CommandPalette from './components/CommandPalette';
import GlobalNotifications from './components/GlobalNotifications';
import { DashboardSkeleton } from './components/ui/Skeleton';
import { Booking, ActivityLog, Role, User } from './types';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { useStudio } from './contexts/StudioContext';
import { doc, getDoc, collection, query, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore'; 
import { db } from './firebase';

const VIEW_PERMISSIONS: Record<string, Role[]> = {
    'dashboard': ['OWNER', 'ADMIN', 'PHOTOGRAPHER', 'EDITOR', 'FINANCE'],
    'calendar': ['OWNER', 'ADMIN', 'PHOTOGRAPHER'],
    'production': ['OWNER', 'ADMIN', 'EDITOR', 'PHOTOGRAPHER'],
    'inventory': ['OWNER', 'ADMIN', 'PHOTOGRAPHER'],
    'clients': ['OWNER', 'ADMIN', 'FINANCE'],
    'team': ['OWNER', 'ADMIN', 'FINANCE'],
    'finance': ['OWNER', 'FINANCE'],
    'analytics': ['OWNER', 'ADMIN'],
    'settings': ['OWNER', 'ADMIN'],
};

const AccessDenied = () => (
    <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="p-4 bg-rose-500/10 rounded-full mb-4 border border-rose-500/20">
            <ShieldAlert size={48} className="text-rose-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-lumina-muted max-w-sm">You do not have permission to view this module. Please contact your studio administrator.</p>
    </div>
);

const App: React.FC = () => {
  const { currentUser, loading: authLoading, logout, setCurrentUser } = useAuth();
  const { 
      config, bookings, assets, clients, accounts, packages, transactions, notifications, metrics, loadingData,
      updateConfig, addBooking, updateBooking, deleteBooking,
      addClient, updateClient, deleteClient,
      addAsset, updateAsset, deleteAsset,
      addTransaction, deleteTransaction, settleBooking, transferFunds,
      completeOnboarding,
      addNotification, dismissNotification 
  } = useStudio();

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [viewMode, setViewMode] = useState<'OS' | 'SITE' | 'LAUNCHER' | 'PUBLIC'>('LAUNCHER'); 
  
  // UI State (Keep Local)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);
  const [isProjectDrawerOpen, setIsProjectDrawerOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [bookingPrefill, setBookingPrefill] = useState<{date: string, time: string, studio: string} | undefined>(undefined);
  
  const [googleToken, setGoogleToken] = useState<string | null>(() => sessionStorage.getItem('lumina_g_token'));
  
  // Public Site Logic
  const [portalBooking, setPortalBooking] = useState<Booking | null>(null);
  const [publicConfig, setPublicConfig] = useState<any>(null);
  const [isPublicLoading, setIsPublicLoading] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isDarkMode) document.body.classList.remove('light-mode');
    else document.body.classList.add('light-mode');
  }, [isDarkMode]);

  // Handle Public Site URL
  useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const publicSiteId = params.get('site');
      const portalBookingId = params.get('booking');

      if (publicSiteId) {
          setViewMode('PUBLIC');
          setIsPublicLoading(true);
          const fetchData = async () => {
              try {
                  const configRef = doc(db, "studios", publicSiteId);
                  const configSnap = await getDoc(configRef);
                  if (configSnap.exists()) setPublicConfig(configSnap.data());
                  if (portalBookingId) {
                      const bookingRef = doc(db, "bookings", portalBookingId);
                      const bookingSnap = await getDoc(bookingRef);
                      if (bookingSnap.exists()) setPortalBooking(bookingSnap.data() as Booking);
                  }
              } catch (e) {
                  console.error("Public Fetch Error:", e);
              } finally {
                  setIsPublicLoading(false);
              }
          };
          fetchData();
      }
  }, []);

  const handleSetGoogleToken = (token: string | null) => {
      setGoogleToken(token);
      if (token) sessionStorage.setItem('lumina_g_token', token);
      else sessionStorage.removeItem('lumina_g_token');
  };

  // --- RENDERING ---

  if (authLoading || (currentUser && loadingData)) return <DashboardSkeleton />;

  if (viewMode === 'PUBLIC') {
      // Public view uses its own local state or fetched public config, decoupled from main app context
      return <PublicSiteView config={publicConfig} packages={packages} users={[]} bookings={bookings} portalBooking={portalBooking} isLoading={isPublicLoading} error={null} onBooking={(data) => { console.log("Public Booking:", data); alert("Booking submitted!"); }} />;
  }

  if (!currentUser) {
      return (
          <AnimatePresence mode="wait">
              {viewMode === 'LAUNCHER' ? <LandingPageView key="landing" onLogin={() => setViewMode('OS')} onRegister={() => setViewMode('SITE')} /> 
              : viewMode === 'SITE' ? <RegisterView key="register" onLoginLink={() => setViewMode('OS')} onRegisterSuccess={(user) => setCurrentUser(user)} onHome={() => setViewMode('LAUNCHER')} /> 
              : <LoginView key="login" users={[]} onLogin={() => {}} onRegisterLink={() => setViewMode('SITE')} onHome={() => setViewMode('LAUNCHER')} />}
          </AnimatePresence>
      );
  }

  if (!currentUser.hasCompletedOnboarding) return <OnboardingView user={currentUser} onComplete={completeOnboarding} />;
  if (viewMode === 'LAUNCHER') return <AppLauncher user={currentUser} onSelectApp={(app) => setViewMode(app)} onLogout={logout} />;
  if (viewMode === 'SITE') return <SiteBuilderView config={config} packages={packages} users={[]} bookings={bookings} onUpdateConfig={updateConfig} onExit={() => setViewMode('LAUNCHER')} />;

  const renderView = () => {
      if (!VIEW_PERMISSIONS[currentView]?.includes(currentUser.role)) return <AccessDenied />;
      
      const usersList = [currentUser]; // Replace with real users fetch from context if implemented

      switch (currentView) {
          case 'dashboard': return <DashboardView user={currentUser} bookings={bookings} transactions={transactions} onSelectBooking={(id) => { setSelectedBookingId(id); setIsProjectDrawerOpen(true); }} selectedDate={new Date().toISOString().split('T')[0]} onNavigate={setCurrentView} config={config} />;
          case 'calendar': return <CalendarView bookings={bookings} currentDate={new Date().toISOString().split('T')[0]} users={usersList} rooms={config.rooms} onDateChange={() => {}} onNewBooking={(prefill) => { setBookingPrefill(prefill); setIsNewBookingModalOpen(true); }} onSelectBooking={(id) => { setSelectedBookingId(id); setIsProjectDrawerOpen(true); }} onUpdateBooking={updateBooking} googleToken={googleToken} />;
          case 'production': return <ProductionView bookings={bookings} onSelectBooking={(id) => { setSelectedBookingId(id); setIsProjectDrawerOpen(true); }} currentUser={currentUser} onUpdateBooking={updateBooking} config={config} />;
          case 'inventory': return <InventoryView assets={assets} users={usersList} onAddAsset={addAsset} onUpdateAsset={updateAsset} onDeleteAsset={deleteAsset} config={config} />;
          case 'clients': return <ClientsView clients={clients} bookings={bookings} onAddClient={addClient} onUpdateClient={updateClient} onDeleteClient={deleteClient} onSelectBooking={(id) => { setSelectedBookingId(id); setIsProjectDrawerOpen(true); }} config={config} />;
          case 'team': return <TeamView users={usersList} bookings={bookings} onAddUser={async (u) => { await setDoc(doc(db, "users", u.id), u); }} onUpdateUser={async (u) => { await setDoc(doc(db, "users", u.id), u); }} onDeleteUser={async (id) => { await deleteDoc(doc(db, "users", id)); }} onRecordExpense={addTransaction} />;
          case 'finance': return <FinanceView accounts={accounts} metrics={metrics} bookings={bookings} users={usersList} transactions={transactions} onTransfer={transferFunds} onRecordExpense={addTransaction} onSettleBooking={settleBooking} onDeleteTransaction={deleteTransaction} config={config} onAddAccount={async (a) => { await setDoc(doc(db, "accounts", a.id), a); }} onUpdateAccount={async (a) => { await setDoc(doc(db, "accounts", a.id), a); }} />;
          case 'analytics': return <AnalyticsView bookings={bookings} packages={packages} transactions={transactions} />;
          case 'settings': return <SettingsView packages={packages} config={config} onAddPackage={async (p) => { await setDoc(doc(db, "packages", p.id), { ...p, ownerId: currentUser.id }); }} onUpdatePackage={async (p) => { await setDoc(doc(db, "packages", p.id), p); }} onDeletePackage={async (id) => { await deleteDoc(doc(db, "packages", id)); }} onUpdateConfig={updateConfig} currentUser={currentUser} onUpdateUserProfile={async (u) => { await setDoc(doc(db, "users", u.id), u); setCurrentUser(u); }} onDeleteAccount={async () => { }} googleToken={googleToken} setGoogleToken={handleSetGoogleToken} assets={assets} />;
          default: return <DashboardView user={currentUser} bookings={bookings} transactions={transactions} onSelectBooking={(id) => { setSelectedBookingId(id); setIsProjectDrawerOpen(true); }} selectedDate={new Date().toISOString().split('T')[0]} onNavigate={setCurrentView} config={config} />;
      }
  };

  return (
    <div className="flex h-screen bg-lumina-base text-white font-sans overflow-hidden">
      <GlobalNotifications notifications={notifications} onDismiss={dismissNotification} />
      <Sidebar currentUser={currentUser} onNavigate={setCurrentView} currentView={currentView} onLogout={logout} onSwitchApp={() => setViewMode('LAUNCHER')} isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode(!isDarkMode)} bookings={bookings} />
      <main className="flex-1 flex flex-col h-screen relative overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 lg:p-8 pb-24 lg:pb-8 custom-scrollbar relative z-0" id="main-content">
              <AnimatePresence mode="wait">
                  <motion.div key={currentView} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="h-full">
                      {renderView()}
                  </motion.div>
              </AnimatePresence>
          </div>
          {isMobile && <MobileNav currentUser={currentUser} onNavigate={setCurrentView} currentView={currentView} onLogout={logout} bookings={bookings} />}
      </main>
      
      {/* Modals are now lighter as they consume props or context */}
      <AnimatePresence>{isNewBookingModalOpen && <NewBookingModal isOpen={isNewBookingModalOpen} onClose={() => { setIsNewBookingModalOpen(false); setBookingPrefill(undefined); }} photographers={[currentUser]} accounts={accounts} bookings={bookings} clients={clients} assets={assets} config={config} onAddBooking={addBooking} onAddClient={addClient} initialData={bookingPrefill} googleToken={googleToken} packages={packages} />}</AnimatePresence>
      
      <AnimatePresence>
          {isProjectDrawerOpen && selectedBookingId && (
              <ProjectDrawer 
                  isOpen={isProjectDrawerOpen} 
                  onClose={() => { setIsProjectDrawerOpen(false); setSelectedBookingId(null); }} 
                  booking={bookings.find(b => b.id === selectedBookingId) || null} 
                  photographer={currentUser} 
                  onUpdateBooking={updateBooking} 
                  onDeleteBooking={deleteBooking} 
                  bookings={bookings} 
                  config={config} 
                  packages={packages} 
                  currentUser={currentUser} 
                  assets={assets} 
                  users={[currentUser]} 
                  transactions={transactions} 
                  onAddTransaction={addTransaction} 
                  accounts={accounts} 
                  googleToken={googleToken} 
                  onLogActivity={(bid, action, details) => { 
                      const b = bookings.find(x => x.id === bid); 
                      if(b) { 
                          const newLog: ActivityLog = { id: `l-${Date.now()}`, timestamp: new Date().toISOString(), action, details, userId: currentUser.id, userName: currentUser.name }; 
                          updateBooking({ ...b, logs: [newLog, ...(b.logs || [])] }); 
                      } 
                  }} 
              />
          )}
      </AnimatePresence>
      
      <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} onNavigate={setCurrentView} clients={clients} bookings={bookings} assets={assets} onSelectBooking={(id) => { setSelectedBookingId(id); setIsProjectDrawerOpen(true); }} currentUser={currentUser} />
    </div>
  );
};

export default App;
