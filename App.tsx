
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
import { User, Booking, Asset, Notification, Account, Transaction, Client, Package, StudioConfig, BookingTask, ActivityLog, PublicBookingSubmission, StudioRoom, ProjectStatus, OnboardingData, Role } from './types';
import { STUDIO_CONFIG, USERS, ACCOUNTS, PACKAGES, ASSETS, CLIENTS, BOOKINGS, TRANSACTIONS, NOTIFICATIONS } from './data';
import { auth, db, onAuthStateChanged, signOut } from './firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc, addDoc, deleteDoc, query, where, writeBatch, getDoc, orderBy, limit } from 'firebase/firestore';
import { ShieldAlert } from 'lucide-react';

const INITIAL_CONFIG = STUDIO_CONFIG;

// STRICT RBAC VIEW MAP
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
  // --- STATE MANAGEMENT ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [viewMode, setViewMode] = useState<'OS' | 'SITE' | 'LAUNCHER' | 'PUBLIC'>('LAUNCHER'); 
  
  // Data State
  const [config, setConfig] = useState<StudioConfig>(INITIAL_CONFIG);
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);

  // UI State
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);
  const [isProjectDrawerOpen, setIsProjectDrawerOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [bookingPrefill, setBookingPrefill] = useState<{date: string, time: string, studio: string} | undefined>(undefined);
  
  const [googleToken, setGoogleToken] = useState<string | null>(() => {
      return sessionStorage.getItem('lumina_g_token');
  });

  const handleSetGoogleToken = (token: string | null) => {
      setGoogleToken(token);
      if (token) sessionStorage.setItem('lumina_g_token', token);
      else sessionStorage.removeItem('lumina_g_token');
  };

  const [portalBooking, setPortalBooking] = useState<Booking | null>(null);

  // --- NOTIFICATION HANDLER ---
  const addNotification = (notif: Partial<Notification>) => {
      const newNotif: Notification = {
          id: `n-${Date.now()}`,
          title: notif.title || 'Notification',
          message: notif.message || '',
          time: new Date().toISOString(),
          read: false,
          type: notif.type || 'INFO'
      };
      setNotifications(prev => [newNotif, ...prev]);
      
      // Auto Dismiss
      setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
      }, 5000);
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isDarkMode) document.body.classList.remove('light-mode');
    else document.body.classList.add('light-mode');
  }, [isDarkMode]);

  // --- AUTH & DATA SYNC ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const publicSiteId = params.get('site');
    const portalBookingId = params.get('booking');

    if (publicSiteId) {
        setViewMode('PUBLIC');
        setLoading(true);
        const fetchData = async () => {
            try {
                const configRef = doc(db, "studios", publicSiteId);
                const configSnap = await getDoc(configRef);
                if (configSnap.exists()) setConfig(configSnap.data() as StudioConfig);
                if (portalBookingId) {
                    const bookingRef = doc(db, "bookings", portalBookingId);
                    const bookingSnap = await getDoc(bookingRef);
                    if (bookingSnap.exists()) setPortalBooking(bookingSnap.data() as Booking);
                }
                setLoading(false);
            } catch (e) {
                console.error("Public Fetch Error:", e);
                setLoading(false);
            }
        };
        fetchData();
        return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
            const userData = userDocSnap.data() as User;
            setCurrentUser({ ...userData, id: user.uid });
            const ownerId = userData.role === 'OWNER' ? user.uid : user.uid; 
            
            // Expanded Date Range: -6 Months to +6 Months for better UX
            const today = new Date();
            const startRange = new Date();
            startRange.setMonth(today.getMonth() - 6);
            const endRange = new Date();
            endRange.setMonth(today.getMonth() + 6);
            
            const startIso = startRange.toISOString().split('T')[0];
            const endIso = endRange.toISOString().split('T')[0];

            const configRef = doc(db, "studios", ownerId);
            onSnapshot(configRef, (doc) => { if (doc.exists()) setConfig(doc.data() as StudioConfig); });

            const qBookings = query(
                collection(db, "bookings"), 
                where("ownerId", "==", ownerId),
                where("date", ">=", startIso),
                where("date", "<=", endIso)
            );
            
            // NOTIFICATION LOGIC: Listen for changes
            onSnapshot(qBookings, (snap) => {
                snap.docChanges().forEach((change) => {
                    if (change.type === "added" && !loading && snap.size > 0) { 
                        // Only notify if added AFTER initial load (heuristic)
                        // In a real app, check timestamps. Here we assume rapid updates = real-time.
                        const b = change.doc.data() as Booking;
                        if (b.status === 'BOOKED') addNotification({ type: 'SUCCESS', title: 'New Booking', message: `${b.clientName} booked ${b.package}` });
                    }
                });
                setBookings(snap.docs.map(d => d.data() as Booking));
            });

            const qClients = query(collection(db, "clients"), where("ownerId", "==", ownerId), limit(100));
            onSnapshot(qClients, (snap) => setClients(snap.docs.map(d => d.data() as Client)));

            const qAssets = query(collection(db, "assets"), where("ownerId", "==", ownerId));
            onSnapshot(qAssets, (snap) => setAssets(snap.docs.map(d => d.data() as Asset)));

            const qAccounts = query(collection(db, "accounts"), where("ownerId", "==", ownerId));
            onSnapshot(qAccounts, (snap) => {
                const accData = snap.docs.map(d => d.data() as Account);
                if (accData.length > 0) setAccounts(accData);
            });

            const qPackages = query(collection(db, "packages"), where("ownerId", "==", ownerId));
            onSnapshot(qPackages, (snap) => setPackages(snap.docs.map(d => d.data() as Package)));

            const qTransactions = query(
                collection(db, "transactions"), 
                where("ownerId", "==", ownerId),
                where("date", ">=", startRange.toISOString()),
                limit(500)
            );
            onSnapshot(qTransactions, (snap) => {
                snap.docChanges().forEach((change) => {
                    if (change.type === "added" && !loading && snap.size > 0) {
                        const t = change.doc.data() as Transaction;
                        if(t.type === 'INCOME') addNotification({ type: 'SUCCESS', title: 'Payment Received', message: `+ Rp ${t.amount.toLocaleString()}` });
                    }
                });
                setTransactions(snap.docs.map(d => d.data() as Transaction));
            });
            
            const qUsers = query(collection(db, "users")); 
            onSnapshot(qUsers, (snap) => setUsers(snap.docs.map(d => ({...d.data(), id: d.id} as User))));

        } else {
             setCurrentUser({
                id: user.uid,
                name: user.displayName || 'User',
                email: user.email || '',
                role: 'OWNER',
                avatar: user.photoURL || '',
                phone: '',
                status: 'ACTIVE',
                joinedDate: new Date().toISOString(),
                hasCompletedOnboarding: false
            });
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  const handleLogin = (user: User) => {};

  const handleLogout = async () => {
      await signOut(auth);
      sessionStorage.removeItem('lumina_g_token');
      setCurrentUser(null);
      setViewMode('LAUNCHER');
  };

  const handleCompleteOnboarding = async (data: OnboardingData) => {
      try {
          if (!currentUser) return;
          const ownerId = currentUser.id;
          const batch = writeBatch(db);

          const updatedUser = { ...currentUser, hasCompletedOnboarding: true, studioFocus: data.focus, studioName: data.studioName };
          const userRef = doc(db, "users", ownerId);
          batch.update(userRef, { hasCompletedOnboarding: true, studioFocus: data.focus, studioName: data.studioName });

          const accId = `acc-${Date.now()}`;
          const newAccount: Account = { id: accId, name: data.bankDetails.name || 'Main Bank', type: 'BANK', balance: 0, accountNumber: data.bankDetails.number, ownerId };
          const accRef = doc(db, "accounts", accId);
          batch.set(accRef, newAccount);

          const pkgId = `p-${Date.now()}`;
          const newPackage: Package = { id: pkgId, name: data.initialPackage.name, price: data.initialPackage.price, duration: data.initialPackage.duration, features: ['Includes studio rental', 'Basic editing', 'Digital delivery'], active: true, costBreakdown: [], turnaroundDays: 7, ownerId };
          const pkgRef = doc(db, "packages", pkgId);
          batch.set(pkgRef, newPackage);

          const roomObjects = data.rooms.map((roomName, index) => ({ id: `r-${index + 1}`, name: roomName, type: 'INDOOR' as const, color: index === 0 ? 'indigo' : index === 1 ? 'purple' : 'emerald' }));
          const newConfig: StudioConfig = { ...INITIAL_CONFIG, name: data.studioName, address: data.address, phone: data.phone, taxRate: data.taxRate, ownerId, bankName: data.bankDetails.name, bankAccount: data.bankDetails.number, bankHolder: data.bankDetails.holder, operatingHoursStart: data.operatingHours.start, operatingHoursEnd: data.operatingHours.end, rooms: roomObjects.length > 0 ? roomObjects : [{ id: 'r1', name: 'Main Studio', type: 'INDOOR', color: 'indigo' }] };
          const configRef = doc(db, "studios", ownerId);
          batch.set(configRef, newConfig);

          await batch.commit();
          setCurrentUser(updatedUser);
          setConfig(newConfig);
          setAccounts([newAccount]);
          setPackages([newPackage]);
      } catch (e) { console.error("Onboarding Save Error:", e); alert("Failed to save onboarding data."); }
  };

  const handleAddBooking = async (newBooking: Booking, paymentDetails?: { amount: number, accountId: string }) => {
      try {
          const authUser = auth.currentUser;
          if (!authUser) return;
          const ownerId = authUser.uid;
          const bookingWithAuth: Booking = { ...newBooking, ownerId: ownerId, paidAmount: paymentDetails?.amount || 0, photographerId: newBooking.photographerId || ownerId };
          await setDoc(doc(db, "bookings", newBooking.id), bookingWithAuth);

          if (paymentDetails && paymentDetails.amount > 0) {
              const transactionId = `t-${Date.now()}`;
              const newTransaction: Transaction = { id: transactionId, date: new Date().toISOString(), description: `Deposit - ${newBooking.clientName}`, amount: Number(paymentDetails.amount), type: 'INCOME', accountId: paymentDetails.accountId, category: 'Sales / Booking', status: 'COMPLETED', bookingId: newBooking.id, ownerId: ownerId };
              await setDoc(doc(db, "transactions", transactionId), newTransaction);
              const accountRef = doc(db, "accounts", paymentDetails.accountId);
              const accSnap = await getDoc(accountRef);
              if (accSnap.exists()) await updateDoc(accountRef, { balance: (accSnap.data().balance || 0) + paymentDetails.amount });
          }
      } catch (e) { console.error("Add Booking Error:", e); }
  };

  const handleAddClient = async (client: Client) => {
      try { const authUser = auth.currentUser; if (!authUser) return; await setDoc(doc(db, "clients", client.id), { ...client, ownerId: authUser.uid }); } catch (e) { console.error(e); }
  };

  const handleAddTransaction = async (data: { description: string; amount: number; category: string; accountId: string; bookingId?: string }) => {
      try {
          const authUser = auth.currentUser; if (!authUser) return;
          const tid = `t-${Date.now()}`;
          const newTransaction: Transaction = { id: tid, date: new Date().toISOString(), description: data.description, amount: data.amount, type: 'EXPENSE', accountId: data.accountId, category: data.category, status: 'COMPLETED', bookingId: data.bookingId, ownerId: authUser.uid };
          await setDoc(doc(db, "transactions", tid), newTransaction);
          const accRef = doc(db, "accounts", data.accountId);
          const accSnap = await getDoc(accRef);
          if (accSnap.exists()) await updateDoc(accRef, { balance: (accSnap.data().balance || 0) - data.amount });
      } catch(e) { console.error(e); }
  };

  if (loading) return (
      <div className="min-h-screen bg-lumina-base flex items-center justify-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-8 h-8 border-2 border-lumina-accent border-t-transparent rounded-full" />
      </div>
  );

  if (viewMode === 'PUBLIC') {
      return <PublicSiteView config={config} packages={packages} users={users} bookings={bookings} portalBooking={portalBooking} isLoading={loading} error={null} onBooking={(data) => { console.log("Public Booking:", data); alert("Booking submitted!"); }} />;
  }

  if (!currentUser) {
      return (
          <AnimatePresence mode="wait">
              {viewMode === 'LAUNCHER' ? <LandingPageView key="landing" onLogin={() => setViewMode('OS')} onRegister={() => setViewMode('SITE')} /> 
              : viewMode === 'SITE' ? <RegisterView key="register" onLoginLink={() => setViewMode('OS')} onRegisterSuccess={(user) => setCurrentUser(user)} onHome={() => setViewMode('LAUNCHER')} /> 
              : <LoginView key="login" users={users} onLogin={handleLogin} onRegisterLink={() => setViewMode('SITE')} onHome={() => setViewMode('LAUNCHER')} />}
          </AnimatePresence>
      );
  }

  if (!currentUser.hasCompletedOnboarding) return <OnboardingView user={currentUser} onComplete={handleCompleteOnboarding} />;
  if (viewMode === 'LAUNCHER') return <AppLauncher user={currentUser} onSelectApp={(app) => setViewMode(app)} onLogout={handleLogout} />;
  if (viewMode === 'SITE') return <SiteBuilderView config={config} packages={packages} users={users} bookings={bookings} onUpdateConfig={async (newConfig) => { setConfig(newConfig); if (currentUser.id) await setDoc(doc(db, "studios", currentUser.id), newConfig); }} onExit={() => setViewMode('LAUNCHER')} />;

  const renderView = () => {
      if (!VIEW_PERMISSIONS[currentView]?.includes(currentUser.role)) return <AccessDenied />;
      switch (currentView) {
          case 'dashboard': return <DashboardView user={currentUser} bookings={bookings} transactions={transactions} onSelectBooking={(id) => { setSelectedBookingId(id); setIsProjectDrawerOpen(true); }} selectedDate={new Date().toISOString().split('T')[0]} onNavigate={setCurrentView} config={config} />;
          case 'calendar': return <CalendarView bookings={bookings} currentDate={new Date().toISOString().split('T')[0]} users={users} rooms={config.rooms} onDateChange={() => {}} onNewBooking={(prefill) => { setBookingPrefill(prefill); setIsNewBookingModalOpen(true); }} onSelectBooking={(id) => { setSelectedBookingId(id); setIsProjectDrawerOpen(true); }} onUpdateBooking={async (b) => { setBookings(prev => prev.map(x => x.id === b.id ? b : x)); await setDoc(doc(db, "bookings", b.id), b); }} googleToken={googleToken} />;
          case 'production': return <ProductionView bookings={bookings} onSelectBooking={(id) => { setSelectedBookingId(id); setIsProjectDrawerOpen(true); }} currentUser={currentUser} onUpdateBooking={async (b) => { setBookings(prev => prev.map(x => x.id === b.id ? b : x)); await setDoc(doc(db, "bookings", b.id), b); }} config={config} />;
          case 'inventory': return <InventoryView assets={assets} users={users} onAddAsset={async (a) => { await setDoc(doc(db, "assets", a.id), { ...a, ownerId: currentUser.id }); }} onUpdateAsset={async (a) => { await setDoc(doc(db, "assets", a.id), a); }} onDeleteAsset={async (id) => { await deleteDoc(doc(db, "assets", id)); }} config={config} />;
          case 'clients': return <ClientsView clients={clients} bookings={bookings} onAddClient={handleAddClient} onUpdateClient={async (c) => { await setDoc(doc(db, "clients", c.id), c); }} onDeleteClient={async (id) => { await deleteDoc(doc(db, "clients", id)); }} onSelectBooking={(id) => { setSelectedBookingId(id); setIsProjectDrawerOpen(true); }} config={config} />;
          case 'team': return <TeamView users={users} bookings={bookings} onAddUser={async (u) => { await setDoc(doc(db, "users", u.id), u); }} onUpdateUser={async (u) => { await setDoc(doc(db, "users", u.id), u); }} onDeleteUser={async (id) => { await deleteDoc(doc(db, "users", id)); }} onRecordExpense={handleAddTransaction} />;
          case 'finance': return <FinanceView accounts={accounts} metrics={metrics} bookings={bookings} users={users} transactions={transactions} onTransfer={async (fromId, toId, amount) => { const batch = writeBatch(db); const fromRef = doc(db, "accounts", fromId); const fromAcc = accounts.find(a => a.id === fromId); if (fromAcc) batch.update(fromRef, { balance: fromAcc.balance - amount }); const toRef = doc(db, "accounts", toId); const toAcc = accounts.find(a => a.id === toId); if (toAcc) batch.update(toRef, { balance: toAcc.balance + amount }); const tid = `t-${Date.now()}`; const transaction: Transaction = { id: tid, date: new Date().toISOString(), description: `Transfer to ${toAcc?.name}`, amount: amount, type: 'TRANSFER', accountId: fromId, category: 'Transfer', status: 'COMPLETED', ownerId: currentUser?.id }; const tRef = doc(db, "transactions", tid); batch.set(tRef, transaction); await batch.commit(); }} onRecordExpense={handleAddTransaction} onSettleBooking={async (bookingId, amount, accountId) => { if (!currentUser) return; const booking = bookings.find(b => b.id === bookingId); if (!booking) return; const batch = writeBatch(db); const bRef = doc(db, "bookings", bookingId); batch.update(bRef, { paidAmount: (booking.paidAmount || 0) + amount }); const accRef = doc(db, "accounts", accountId); const account = accounts.find(a => a.id === accountId); if (account) batch.update(accRef, { balance: account.balance + amount }); const tid = `t-${Date.now()}`; const transaction: Transaction = { id: tid, date: new Date().toISOString(), description: amount > 0 ? `Payment - ${booking.clientName}` : `Refund - ${booking.clientName}`, amount: Math.abs(amount), type: amount > 0 ? 'INCOME' : 'EXPENSE', accountId: accountId, category: 'Sales / Booking', status: 'COMPLETED', bookingId: bookingId, ownerId: currentUser.id }; const tRef = doc(db, "transactions", tid); batch.set(tRef, transaction); await batch.commit(); }} onDeleteTransaction={async (id) => { await deleteDoc(doc(db, "transactions", id)); }} config={config} onAddAccount={async (a) => { await setDoc(doc(db, "accounts", a.id), a); }} onUpdateAccount={async (a) => { await setDoc(doc(db, "accounts", a.id), a); }} />;
          case 'analytics': return <AnalyticsView bookings={bookings} packages={packages} transactions={transactions} />;
          case 'settings': return <SettingsView packages={packages} config={config} onAddPackage={async (p) => { await setDoc(doc(db, "packages", p.id), { ...p, ownerId: currentUser.id }); }} onUpdatePackage={async (p) => { await setDoc(doc(db, "packages", p.id), p); }} onDeletePackage={async (id) => { await deleteDoc(doc(db, "packages", id)); }} onUpdateConfig={async (c) => { await setDoc(doc(db, "studios", currentUser.id), c); setConfig(c); }} currentUser={currentUser} onUpdateUserProfile={async (u) => { await setDoc(doc(db, "users", u.id), u); setCurrentUser(u); }} onDeleteAccount={async () => { }} googleToken={googleToken} setGoogleToken={handleSetGoogleToken} assets={assets} />;
          default: return <DashboardView user={currentUser} bookings={bookings} transactions={transactions} onSelectBooking={(id) => { setSelectedBookingId(id); setIsProjectDrawerOpen(true); }} selectedDate={new Date().toISOString().split('T')[0]} onNavigate={setCurrentView} config={config} />;
      }
  };

  return (
    <div className="flex h-screen bg-lumina-base text-white font-sans overflow-hidden">
      <GlobalNotifications notifications={notifications} onDismiss={(id) => setNotifications(prev => prev.filter(n => n.id !== id))} />
      <Sidebar currentUser={currentUser} onNavigate={setCurrentView} currentView={currentView} onLogout={handleLogout} onSwitchApp={() => setViewMode('LAUNCHER')} isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode(!isDarkMode)} bookings={bookings} />
      <main className="flex-1 flex flex-col h-screen relative overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 lg:p-8 pb-24 lg:pb-8 custom-scrollbar relative z-0" id="main-content">
              <AnimatePresence mode="wait">
                  <motion.div key={currentView} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="h-full">
                      {renderView()}
                  </motion.div>
              </AnimatePresence>
          </div>
          {isMobile && <MobileNav currentUser={currentUser} onNavigate={setCurrentView} currentView={currentView} onLogout={handleLogout} bookings={bookings} />}
      </main>
      <AnimatePresence>{isNewBookingModalOpen && <NewBookingModal isOpen={isNewBookingModalOpen} onClose={() => { setIsNewBookingModalOpen(false); setBookingPrefill(undefined); }} photographers={users.filter(u => u.role === 'PHOTOGRAPHER' || u.role === 'OWNER')} accounts={accounts} bookings={bookings} clients={clients} assets={assets} config={config} onAddBooking={handleAddBooking} onAddClient={handleAddClient} initialData={bookingPrefill} googleToken={googleToken} packages={packages} />}</AnimatePresence>
      <AnimatePresence>{isProjectDrawerOpen && selectedBookingId && <ProjectDrawer isOpen={isProjectDrawerOpen} onClose={() => { setIsProjectDrawerOpen(false); setSelectedBookingId(null); }} booking={bookings.find(b => b.id === selectedBookingId) || null} photographer={users.find(u => u.id === (bookings.find(b => b.id === selectedBookingId)?.photographerId))} onUpdateBooking={async (b) => { await setDoc(doc(db, "bookings", b.id), b); }} onDeleteBooking={async (id) => { await deleteDoc(doc(db, "bookings", id)); }} bookings={bookings} config={config} packages={packages} currentUser={currentUser} assets={assets} users={users} transactions={transactions} onAddTransaction={handleAddTransaction} accounts={accounts} googleToken={googleToken} onLogActivity={(bid, action, details) => { const b = bookings.find(x => x.id === bid); if(b) { const newLog: ActivityLog = { id: `l-${Date.now()}`, timestamp: new Date().toISOString(), action, details, userId: currentUser.id, userName: currentUser.name }; const logs = [newLog, ...(b.logs || [])]; setDoc(doc(db, "bookings", bid), { ...b, logs }); } }} />}</AnimatePresence>
      <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} onNavigate={setCurrentView} clients={clients} bookings={bookings} assets={assets} onSelectBooking={(id) => { setSelectedBookingId(id); setIsProjectDrawerOpen(true); }} currentUser={currentUser} />
    </div>
  );
};

export default App;
