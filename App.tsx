
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
import { User, Booking, Asset, Notification, Account, Transaction, Client, Package, StudioConfig, BookingTask, ActivityLog, PublicBookingSubmission, StudioRoom, ProjectStatus, OnboardingData, Role } from './types';
import { STUDIO_CONFIG, USERS, ACCOUNTS, PACKAGES, ASSETS, CLIENTS, BOOKINGS, TRANSACTIONS, NOTIFICATIONS } from './data';
import { auth, db, onAuthStateChanged, signOut } from './firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc, addDoc, deleteDoc, query, where, writeBatch, getDoc } from 'firebase/firestore';
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
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, calendar, production, etc.
  const [viewMode, setViewMode] = useState<'OS' | 'SITE' | 'LAUNCHER' | 'PUBLIC'>('LAUNCHER'); 
  
  // Data State
  const [config, setConfig] = useState<StudioConfig>(INITIAL_CONFIG);
  const [users, setUsers] = useState<User[]>([]); // Hydrated from Firestore or Fallback
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]); // To implement real logic
  const [metrics, setMetrics] = useState<any[]>([]);

  // UI State
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);
  const [isProjectDrawerOpen, setIsProjectDrawerOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [bookingPrefill, setBookingPrefill] = useState<{date: string, time: string, studio: string} | undefined>(undefined);
  
  // PERSISTENT GOOGLE TOKEN
  const [googleToken, setGoogleToken] = useState<string | null>(() => {
      return sessionStorage.getItem('lumina_g_token');
  });

  const handleSetGoogleToken = (token: string | null) => {
      setGoogleToken(token);
      if (token) {
          sessionStorage.setItem('lumina_g_token', token);
      } else {
          sessionStorage.removeItem('lumina_g_token');
      }
  };

  // Client Portal State
  const [portalBooking, setPortalBooking] = useState<Booking | null>(null);

  // --- RESPONSIVE HANDLER ---
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- THEME HANDLER ---
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
    }
  }, [isDarkMode]);

  // --- AUTH & DATA SYNC ---
  useEffect(() => {
    // Check for Public Client Portal URL
    const params = new URLSearchParams(window.location.search);
    const publicSiteId = params.get('site');
    const portalBookingId = params.get('booking');

    if (publicSiteId) {
        setViewMode('PUBLIC');
        setLoading(true);
        
        const fetchData = async () => {
            try {
                // Fetch Studio Config
                const configRef = doc(db, "studios", publicSiteId);
                const configSnap = await getDoc(configRef);
                if (configSnap.exists()) {
                    setConfig(configSnap.data() as StudioConfig);
                } else {
                    // Fallback or Error
                    console.error("Studio not found");
                }

                // Fetch Portal Booking if ID exists
                if (portalBookingId) {
                    const bookingRef = doc(db, "bookings", portalBookingId);
                    const bookingSnap = await getDoc(bookingRef);
                    if (bookingSnap.exists()) {
                        setPortalBooking(bookingSnap.data() as Booking);
                    }
                }

                setLoading(false);
            } catch (e) {
                console.error("Public Fetch Error:", e);
                setLoading(false);
            }
        };
        fetchData();
        return; // Exit normal auth flow
    }

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch extended user profile
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
            const userData = userDocSnap.data() as User;
            setCurrentUser({ ...userData, id: user.uid }); // Ensure ID matches Auth UID
            
            // Fix: Fallback to user.uid if role logic fails or for simple single-user setup
            const ownerId = userData.role === 'OWNER' ? user.uid : user.uid; 
            
            // Config Listener
            const configRef = doc(db, "studios", ownerId);
            onSnapshot(configRef, (doc) => {
                if (doc.exists()) setConfig(doc.data() as StudioConfig);
            }, (error) => console.warn("Config listener error:", error));

            // Data Listeners
            const qBookings = query(collection(db, "bookings"), where("ownerId", "==", ownerId));
            onSnapshot(qBookings, (snap) => setBookings(snap.docs.map(d => d.data() as Booking)), (error) => console.warn("Bookings listener error:", error));

            const qClients = query(collection(db, "clients"), where("ownerId", "==", ownerId));
            onSnapshot(qClients, (snap) => setClients(snap.docs.map(d => d.data() as Client)), (error) => console.warn("Clients listener error:", error));

            const qAssets = query(collection(db, "assets"), where("ownerId", "==", ownerId));
            onSnapshot(qAssets, (snap) => setAssets(snap.docs.map(d => d.data() as Asset)), (error) => console.warn("Assets listener error:", error));

            const qAccounts = query(collection(db, "accounts"), where("ownerId", "==", ownerId));
            onSnapshot(qAccounts, (snap) => {
                const accData = snap.docs.map(d => d.data() as Account);
                if (accData.length > 0) {
                    setAccounts(accData);
                }
            }, (error) => console.warn("Accounts listener error:", error));

            const qPackages = query(collection(db, "packages"), where("ownerId", "==", ownerId));
            onSnapshot(qPackages, (snap) => setPackages(snap.docs.map(d => d.data() as Package)), (error) => console.warn("Packages listener error:", error));

            const qTransactions = query(collection(db, "transactions"), where("ownerId", "==", ownerId));
            onSnapshot(qTransactions, (snap) => setTransactions(snap.docs.map(d => d.data() as Transaction)), (error) => console.warn("Transactions listener error:", error));
            
            const qUsers = query(collection(db, "users")); 
            onSnapshot(qUsers, (snap) => setUsers(snap.docs.map(d => ({...d.data(), id: d.id} as User))), (error) => console.warn("Users listener error:", error));

        } else {
            // Fallback if Firestore doc missing (should be handled in Register)
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

  // --- ACTIONS ---

  const handleLogin = (user: User) => {
      // handled by onAuthStateChanged
  };

  const handleLogout = async () => {
      await signOut(auth);
      sessionStorage.removeItem('lumina_g_token'); // Clear session
      setCurrentUser(null);
      setViewMode('LAUNCHER');
  };

  const handleCompleteOnboarding = async (data: OnboardingData) => {
      try {
          if (!currentUser) return;
          
          const ownerId = currentUser.id;
          const batch = writeBatch(db);

          // 1. Update User Profile
          const updatedUser = { 
              ...currentUser, 
              hasCompletedOnboarding: true, 
              studioFocus: data.focus, 
              studioName: data.studioName 
          };
          const userRef = doc(db, "users", ownerId);
          batch.update(userRef, { 
              hasCompletedOnboarding: true, 
              studioFocus: data.focus, 
              studioName: data.studioName 
          });

          // 2. Create Initial Account (Bank)
          const accId = `acc-${Date.now()}`;
          const newAccount: Account = {
              id: accId,
              name: data.bankDetails.name || 'Main Bank',
              type: 'BANK',
              balance: 0,
              accountNumber: data.bankDetails.number,
              ownerId
          };
          const accRef = doc(db, "accounts", accId);
          batch.set(accRef, newAccount);

          // 3. Create Initial Package
          const pkgId = `p-${Date.now()}`;
          const newPackage: Package = {
              id: pkgId,
              name: data.initialPackage.name,
              price: data.initialPackage.price,
              duration: data.initialPackage.duration,
              features: ['Includes studio rental', 'Basic editing', 'Digital delivery'],
              active: true,
              costBreakdown: [],
              turnaroundDays: 7,
              ownerId
          };
          const pkgRef = doc(db, "packages", pkgId);
          batch.set(pkgRef, newPackage);

          // 4. Create Studio Config with DYNAMIC DATA
          const roomObjects = data.rooms.map((roomName, index) => ({
              id: `r-${index + 1}`,
              name: roomName,
              type: 'INDOOR' as const, // Default, can be edited later
              color: index === 0 ? 'indigo' : index === 1 ? 'purple' : 'emerald'
          }));

          const newConfig: StudioConfig = { 
              ...INITIAL_CONFIG, 
              name: data.studioName, 
              address: data.address, 
              phone: data.phone,
              taxRate: data.taxRate,
              ownerId,
              bankName: data.bankDetails.name,
              bankAccount: data.bankDetails.number,
              bankHolder: data.bankDetails.holder,
              operatingHoursStart: data.operatingHours.start,
              operatingHoursEnd: data.operatingHours.end,
              rooms: roomObjects.length > 0 ? roomObjects : [{ id: 'r1', name: 'Main Studio', type: 'INDOOR', color: 'indigo' }]
          };
          const configRef = doc(db, "studios", ownerId);
          batch.set(configRef, newConfig);

          await batch.commit();

          // Update Local State immediately for smooth transition
          setCurrentUser(updatedUser);
          setConfig(newConfig);
          setAccounts([newAccount]);
          setPackages([newPackage]);

      } catch (e) {
          console.error("Onboarding Save Error:", e);
          alert("Failed to save onboarding data. Please try again.");
      }
  };

  const handleAddBooking = async (newBooking: Booking, paymentDetails?: { amount: number, accountId: string }) => {
      try {
          // Use auth.currentUser directly for robustness
          const authUser = auth.currentUser;
          if (!authUser) {
              alert("You must be logged in to add a booking.");
              return;
          }
          
          const ownerId = authUser.uid; // Reliable source of truth for rules
          
          const bookingWithAuth: Booking = { 
              ...newBooking,
              ownerId: ownerId,
              paidAmount: paymentDetails?.amount || 0, 
              photographerId: newBooking.photographerId || ownerId, // Fallback to owner if empty
          };
          
          // 1. Save Booking
          await setDoc(doc(db, "bookings", newBooking.id), bookingWithAuth);

          // 2. Handle Initial Payment (if any)
          if (paymentDetails && paymentDetails.amount > 0) {
              if (!paymentDetails.accountId) {
                  console.warn("Payment specified but no account ID provided. Skipping transaction record.");
                  return;
              }

              const transactionId = `t-${Date.now()}`;
              const newTransaction: Transaction = {
                  id: transactionId,
                  date: new Date().toISOString(),
                  description: `Deposit - ${newBooking.clientName}`,
                  amount: Number(paymentDetails.amount),
                  type: 'INCOME',
                  accountId: paymentDetails.accountId,
                  category: 'Sales / Booking',
                  status: 'COMPLETED',
                  bookingId: newBooking.id,
                  ownerId: ownerId
              };
              
              // Record Transaction
              await setDoc(doc(db, "transactions", transactionId), newTransaction);
              
              // Update Account Balance
              try {
                  const accountRef = doc(db, "accounts", paymentDetails.accountId);
                  const accSnap = await getDoc(accountRef);
                  if (accSnap.exists()) {
                      const currentBal = accSnap.data().balance || 0;
                      await updateDoc(accountRef, { balance: currentBal + paymentDetails.amount });
                  }
              } catch (accError) {
                  console.error("Failed to update account balance:", accError);
              }
          }
      } catch (e) {
          console.error("Add Booking Error:", e);
          alert(`Failed to save booking: ${e instanceof Error ? e.message : 'Unknown error'}. Check console for details.`);
      }
  };

  const handleAddClient = async (client: Client) => {
      try {
          const authUser = auth.currentUser;
          if (!authUser) return;
          await setDoc(doc(db, "clients", client.id), { ...client, ownerId: authUser.uid });
      } catch (e) { console.error(e); }
  };

  if (loading) return (
      <div className="min-h-screen bg-lumina-base flex items-center justify-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-lumina-accent border-t-transparent rounded-full"
          />
      </div>
  );

  // PUBLIC VIEW
  if (viewMode === 'PUBLIC') {
      return (
          <PublicSiteView 
              config={config} 
              packages={packages} 
              users={users} 
              bookings={bookings}
              portalBooking={portalBooking}
              isLoading={loading}
              error={null}
              onBooking={(data) => {
                  console.log("Public Booking:", data);
                  alert("Booking submitted! Check your email for confirmation.");
              }}
          />
      );
  }

  // AUTH FLOW
  if (!currentUser) {
      return (
          <AnimatePresence mode="wait">
              {viewMode === 'LAUNCHER' ? (
                  <LandingPageView 
                      key="landing"
                      onLogin={() => setViewMode('OS')}
                      onRegister={() => setViewMode('SITE')} 
                  />
              ) : viewMode === 'SITE' ? (
                  <RegisterView 
                      key="register"
                      onLoginLink={() => setViewMode('OS')}
                      onRegisterSuccess={(user) => {
                          setCurrentUser(user); 
                      }}
                      onHome={() => setViewMode('LAUNCHER')}
                  />
              ) : (
                  <LoginView 
                      key="login"
                      users={users} 
                      onLogin={handleLogin}
                      onRegisterLink={() => setViewMode('SITE')}
                      onHome={() => setViewMode('LAUNCHER')}
                  />
              )}
          </AnimatePresence>
      );
  }

  // ONBOARDING FLOW
  if (!currentUser.hasCompletedOnboarding) {
      return <OnboardingView user={currentUser} onComplete={handleCompleteOnboarding} />;
  }

  // APP LAUNCHER (If logged in but hasn't selected app mode)
  if (viewMode === 'LAUNCHER') {
      return (
          <AppLauncher 
              user={currentUser}
              onSelectApp={(app) => setViewMode(app)}
              onLogout={handleLogout}
          />
      );
  }

  // SITE BUILDER
  if (viewMode === 'SITE') {
      return (
          <SiteBuilderView 
              config={config} 
              packages={packages} 
              users={users} 
              bookings={bookings}
              onUpdateConfig={async (newConfig) => {
                  setConfig(newConfig);
                  if (currentUser.id) {
                      await setDoc(doc(db, "studios", currentUser.id), newConfig);
                  }
              }}
              onExit={() => setViewMode('LAUNCHER')}
          />
      );
  }

  // --- RENDER VIEW GUARD ---
  const renderView = () => {
      if (!VIEW_PERMISSIONS[currentView]?.includes(currentUser.role)) {
          return <AccessDenied />;
      }

      switch (currentView) {
          case 'dashboard': return <DashboardView user={currentUser} bookings={bookings} transactions={transactions} onSelectBooking={(id) => { setSelectedBookingId(id); setIsProjectDrawerOpen(true); }} selectedDate={new Date().toISOString().split('T')[0]} onNavigate={setCurrentView} config={config}/>;
          case 'calendar': return <CalendarView bookings={bookings} currentDate={new Date().toISOString().split('T')[0]} users={users} rooms={config.rooms} onDateChange={() => {}} onNewBooking={(prefill) => { setBookingPrefill(prefill); setIsNewBookingModalOpen(true); }} onSelectBooking={(id) => { setSelectedBookingId(id); setIsProjectDrawerOpen(true); }} onUpdateBooking={async (b) => { setBookings(prev => prev.map(x => x.id === b.id ? b : x)); await setDoc(doc(db, "bookings", b.id), b); }} googleToken={googleToken}/>;
          case 'production': return <ProductionView bookings={bookings} onSelectBooking={(id) => { setSelectedBookingId(id); setIsProjectDrawerOpen(true); }} currentUser={currentUser} onUpdateBooking={async (b) => { setBookings(prev => prev.map(x => x.id === b.id ? b : x)); await setDoc(doc(db, "bookings", b.id), b); }} config={config}/>;
          case 'inventory': return <InventoryView assets={assets} users={users} onAddAsset={async (a) => { await setDoc(doc(db, "assets", a.id), { ...a, ownerId: currentUser.id }); }} onUpdateAsset={async (a) => { await setDoc(doc(db, "assets", a.id), a); }} onDeleteAsset={async (id) => { await deleteDoc(doc(db, "assets", id)); }} config={config}/>;
          case 'clients': return <ClientsView clients={clients} bookings={bookings} onAddClient={handleAddClient} onUpdateClient={async (c) => { await setDoc(doc(db, "clients", c.id), c); }} onDeleteClient={async (id) => { await deleteDoc(doc(db, "clients", id)); }} onSelectBooking={(id) => { setSelectedBookingId(id); setIsProjectDrawerOpen(true); }} config={config}/>;
          case 'team': return <TeamView users={users} bookings={bookings} onAddUser={async (u) => { await setDoc(doc(db, "users", u.id), u); }} onUpdateUser={async (u) => { await setDoc(doc(db, "users", u.id), u); }} onDeleteUser={async (id) => { await deleteDoc(doc(db, "users", id)); }} onRecordExpense={(data) => { const tid = `t-${Date.now()}`; const txn = { id: tid, date: new Date().toISOString(), type: 'EXPENSE', status: 'COMPLETED', ownerId: currentUser.id, ...data }; setDoc(doc(db, "transactions", tid), txn); }}/>;
          case 'finance': return <FinanceView accounts={accounts} metrics={metrics} bookings={bookings} users={users} transactions={transactions} config={config} onTransfer={async (fromId, toId, amount) => { const batch = writeBatch(db); const fromAcc = accounts.find(a => a.id === fromId); const toAcc = accounts.find(a => a.id === toId); if (fromAcc && toAcc && fromAcc.balance >= amount) { batch.update(doc(db, "accounts", fromId), { balance: fromAcc.balance - amount }); batch.update(doc(db, "accounts", toId), { balance: toAcc.balance + amount }); const tid = `t-${Date.now()}`; batch.set(doc(db, "transactions", tid), { id: tid, date: new Date().toISOString(), description: `Transfer to ${toAcc.name}`, amount: amount, type: 'TRANSFER', accountId: fromId, category: 'Internal Transfer', status: 'COMPLETED', ownerId: currentUser.id }); await batch.commit(); } }} onRecordExpense={async (data) => { const batch = writeBatch(db); const acc = accounts.find(a => a.id === data.accountId); const tid = `t-${Date.now()}`; batch.set(doc(db, "transactions", tid), { id: tid, date: new Date().toISOString(), type: 'EXPENSE', status: 'COMPLETED', ownerId: currentUser.id, ...data }); if (acc) { batch.update(doc(db, "accounts", acc.id), { balance: acc.balance - data.amount }); } await batch.commit(); }} onSettleBooking={async (bookingId, amount, accountId) => { const batch = writeBatch(db); const booking = bookings.find(b => b.id === bookingId); const acc = accounts.find(a => a.id === accountId); if (booking && acc) { batch.update(doc(db, "bookings", bookingId), { paidAmount: booking.paidAmount + amount }); batch.update(doc(db, "accounts", accountId), { balance: acc.balance + amount }); const tid = `t-${Date.now()}`; batch.set(doc(db, "transactions", tid), { id: tid, date: new Date().toISOString(), description: amount > 0 ? `Payment - ${booking.clientName}` : `Refund - ${booking.clientName}`, amount: Math.abs(amount), type: amount > 0 ? 'INCOME' : 'EXPENSE', accountId: accountId, category: 'Sales / Booking', status: 'COMPLETED', bookingId: bookingId, ownerId: currentUser.id }); await batch.commit(); } }} onDeleteTransaction={async (id) => { await deleteDoc(doc(db, "transactions", id)); }} onAddAccount={async (acc) => { await setDoc(doc(db, "accounts", acc.id), { ...acc, ownerId: currentUser.id }); }} onUpdateAccount={async (acc) => { await setDoc(doc(db, "accounts", acc.id), acc); }}/>;
          case 'analytics': return <AnalyticsView bookings={bookings} packages={packages} transactions={transactions}/>;
          case 'settings': return <SettingsView packages={packages} config={config} bookings={bookings} assets={assets} currentUser={currentUser} googleToken={googleToken} setGoogleToken={handleSetGoogleToken} onAddPackage={async (pkg) => { await setDoc(doc(db, "packages", pkg.id), { ...pkg, ownerId: currentUser.id }); }} onUpdatePackage={async (pkg) => { await setDoc(doc(db, "packages", pkg.id), pkg); }} onDeletePackage={async (id) => { await deleteDoc(doc(db, "packages", id)); }} onUpdateConfig={async (newConfig) => { setConfig(newConfig); await setDoc(doc(db, "studios", currentUser.id), newConfig); }} onUpdateUserProfile={async (user) => { await setDoc(doc(db, "users", user.id), user); setCurrentUser(user); }} onDeleteAccount={async () => { if (window.confirm("CRITICAL: Are you sure? This will wipe all your data.")) { alert("Account deletion simulation."); } }}/>;
          default: return <AccessDenied />;
      }
  };

  // MAIN OS
  return (
    <div className="flex h-screen bg-lumina-base text-lumina-text font-sans overflow-hidden">
      {!isMobile && (
          <Sidebar 
            currentUser={currentUser} 
            onNavigate={setCurrentView} 
            currentView={currentView} 
            onLogout={handleLogout}
            onSwitchApp={() => setViewMode('LAUNCHER')}
            isDarkMode={isDarkMode}
            onToggleTheme={() => setIsDarkMode(!isDarkMode)}
            bookings={bookings}
          />
      )}
      
      <main className="flex-1 flex flex-col relative h-full overflow-hidden lg:pl-64 transition-all duration-300">
        {/* Mobile Header */}
        {isMobile && (
            <div className="h-16 border-b border-lumina-highlight flex items-center justify-between px-4 shrink-0">
                <span className="font-display font-bold text-lg text-white">LUMINA</span>
                <button onClick={() => setIsCommandPaletteOpen(true)} className="p-2 text-lumina-muted"><SearchIcon/></button>
            </div>
        )}

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-8 pb-24 lg:pb-8 scroll-smooth">
            <AnimatePresence mode="wait">
               {renderView()}
            </AnimatePresence>
        </div>

        {isMobile && <MobileNav currentUser={currentUser} onNavigate={setCurrentView} currentView={currentView} onLogout={handleLogout} bookings={bookings} />}
      </main>

      {/* Modals */}
      <NewBookingModal 
        isOpen={isNewBookingModalOpen} 
        onClose={() => setIsNewBookingModalOpen(false)}
        photographers={users.filter(u => u.role === 'PHOTOGRAPHER' || u.role === 'OWNER')}
        accounts={accounts}
        bookings={bookings}
        clients={clients}
        assets={assets}
        config={config}
        packages={packages}
        onAddBooking={handleAddBooking}
        onAddClient={handleAddClient}
        initialData={bookingPrefill}
      />

      <ProjectDrawer
        isOpen={isProjectDrawerOpen}
        onClose={() => setIsProjectDrawerOpen(false)}
        booking={bookings.find(b => b.id === selectedBookingId) || null}
        photographer={users.find(u => u.id === (bookings.find(b => b.id === selectedBookingId)?.photographerId))}
        onUpdateBooking={async (b) => {
            setBookings(prev => prev.map(x => x.id === b.id ? b : x));
            await setDoc(doc(db, "bookings", b.id), b);
        }}
        onDeleteBooking={async (id) => {
            await deleteDoc(doc(db, "bookings", id));
            setIsProjectDrawerOpen(false);
        }}
        config={config}
        packages={packages}
        currentUser={currentUser}
        assets={assets}
        googleToken={googleToken}
      />

      <CommandPalette 
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={setCurrentView}
        clients={clients}
        bookings={bookings}
        assets={assets}
        onSelectBooking={(id) => { setSelectedBookingId(id); setIsProjectDrawerOpen(true); }}
        currentUser={currentUser}
      />

      {/* Shortcut Listener */}
      <div className="hidden" onKeyDown={(e) => {
          if (e.metaKey && e.key === 'k') setIsCommandPaletteOpen(true);
      }} />
    </div>
  );
};

const SearchIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;

export default App;
