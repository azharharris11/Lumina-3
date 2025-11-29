
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  StudioConfig, Booking, Asset, Client, Account, Package, Transaction, Notification, 
  OnboardingData, MonthlyMetric, BookingTask, ProjectStatus
} from '../types';
import { STUDIO_CONFIG } from '../data';
import { db } from '../firebase';
import { 
  collection, doc, onSnapshot, query, where, limit, 
  setDoc, updateDoc, writeBatch, getDoc, deleteDoc, runTransaction, getDocs 
} from 'firebase/firestore';
import { useAuth } from './AuthContext';

interface StudioContextType {
  config: StudioConfig;
  bookings: Booking[];
  assets: Asset[];
  clients: Client[];
  accounts: Account[];
  packages: Package[];
  transactions: Transaction[];
  notifications: Notification[];
  metrics: MonthlyMetric[];
  loadingData: boolean;
  users: any[]; 
  
  // Actions
  updateConfig: (newConfig: StudioConfig) => Promise<void>;
  addBooking: (booking: Booking, paymentDetails?: { amount: number, accountId: string }) => Promise<void>;
  updateBooking: (booking: Booking) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  addClient: (client: Client) => Promise<void>;
  updateClient: (client: Client) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addAsset: (asset: Asset) => Promise<void>;
  updateAsset: (asset: Asset) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
  addTransaction: (data: { description: string; amount: number; category: string; accountId: string; bookingId?: string, isRecurring?: boolean, receiptUrl?: string, submittedBy?: string, recipientId?: string }) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  settleBooking: (bookingId: string, amount: number, accountId: string) => Promise<void>;
  completeOnboarding: (data: OnboardingData) => Promise<void>;
  transferFunds: (fromId: string, toId: string, amount: number) => Promise<void>;
  
  // Automation
  triggerAutomation: (status: ProjectStatus, bookingId?: string) => Promise<void>;

  // Helpers
  addNotification: (notif: Partial<Notification>) => void;
  dismissNotification: (id: string) => void;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

export const StudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  
  const [config, setConfig] = useState<StudioConfig>(STUDIO_CONFIG);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [metrics, setMetrics] = useState<MonthlyMetric[]>([]);
  const [users, setUsers] = useState<any[]>([]); 
  const [loadingData, setLoadingData] = useState(true);

  // Notification Helper
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
    setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
    }, 5000);
  };

  const dismissNotification = (id: string) => {
      setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // --- DATA FETCHING ---
  useEffect(() => {
    if (!currentUser) {
        setLoadingData(false);
        return;
    }

    const ownerId = currentUser.role === 'OWNER' ? currentUser.id : currentUser.id; 
    
    // Config
    const configRef = doc(db, "studios", ownerId);
    const unsubConfig = onSnapshot(configRef, (doc) => { if (doc.exists()) setConfig(doc.data() as StudioConfig); });

    // Users
    const qUsers = query(collection(db, "users"));
    const unsubUsers = onSnapshot(qUsers, (snap) => setUsers(snap.docs.map(d => d.data())));

    // Date Range for Bookings
    const today = new Date();
    const startRange = new Date(); startRange.setMonth(today.getMonth() - 6);
    const endRange = new Date(); endRange.setMonth(today.getMonth() + 6);
    const startStr = startRange.toISOString().split('T')[0];
    const endStr = endRange.toISOString().split('T')[0];
    
    const qBookings = query(
        collection(db, "bookings"), 
        where("ownerId", "==", ownerId)
    );
    const unsubBookings = onSnapshot(qBookings, (snap) => {
        const allBookings = snap.docs.map(d => d.data() as Booking);
        setBookings(allBookings.filter(b => b.date >= startStr && b.date <= endStr));
    });

    // Other Collections
    const qClients = query(collection(db, "clients"), where("ownerId", "==", ownerId), limit(100));
    const unsubClients = onSnapshot(qClients, (snap) => setClients(snap.docs.map(d => d.data() as Client)));

    const qAssets = query(collection(db, "assets"), where("ownerId", "==", ownerId));
    const unsubAssets = onSnapshot(qAssets, (snap) => setAssets(snap.docs.map(d => d.data() as Asset)));

    const qAccounts = query(collection(db, "accounts"), where("ownerId", "==", ownerId));
    const unsubAccounts = onSnapshot(qAccounts, (snap) => {
        const accData = snap.docs.map(d => d.data() as Account);
        if (accData.length > 0) setAccounts(accData);
    });

    const qPackages = query(collection(db, "packages"), where("ownerId", "==", ownerId));
    const unsubPackages = onSnapshot(qPackages, (snap) => setPackages(snap.docs.map(d => d.data() as Package)));

    const qTransactions = query(collection(db, "transactions"), where("ownerId", "==", ownerId), limit(200));
    const unsubTransactions = onSnapshot(qTransactions, (snap) => setTransactions(snap.docs.map(d => d.data() as Transaction)));

    setLoadingData(false);

    return () => {
        unsubConfig();
        unsubBookings();
        unsubClients();
        unsubAssets();
        unsubAccounts();
        unsubPackages();
        unsubTransactions();
        unsubUsers();
    };
  }, [currentUser]);

  // --- ACTIONS ---

  const updateConfig = async (newConfig: StudioConfig) => {
      if(!currentUser) return;
      await setDoc(doc(db, "studios", currentUser.id), newConfig);
      setConfig(newConfig);
  };

  const checkConflictOnServer = async (newBooking: Booking) => {
      if (!currentUser) return false;
      const ownerId = currentUser.id;
      
      const q = query(
          collection(db, "bookings"),
          where("ownerId", "==", ownerId),
          where("date", "==", newBooking.date)
      );
      
      const snapshot = await getDocs(q);
      const dayBookings = snapshot.docs.map(d => d.data() as Booking);
      
      const bufferMins = config.bufferMinutes || 0;
      const [newStartH, newStartM] = newBooking.timeStart.split(':').map(Number);
      const newStartMins = newStartH * 60 + newStartM;
      const newEndMins = newStartMins + (newBooking.duration * 60) + bufferMins;

      const roomConflict = dayBookings.find(b => {
          if (b.status === 'CANCELLED' || b.studio !== newBooking.studio || b.id === newBooking.id) return false;
          
          const [bStartH, bStartM] = b.timeStart.split(':').map(Number);
          const bStartMins = bStartH * 60 + bStartM;
          const bEndMins = bStartMins + (b.duration * 60) + bufferMins;

          return (newStartMins < bEndMins) && (newEndMins > bStartMins);
      });

      if (roomConflict) throw new Error(`Conflict detected! Room occupied by ${roomConflict.clientName}.`);
  };

  const addBooking = async (newBooking: Booking, paymentDetails?: { amount: number, accountId: string }) => {
      if (!currentUser) return;
      const ownerId = currentUser.id;
      
      const selectedPackage = packages.find(p => p.name === newBooking.package);
      let autoTasks: BookingTask[] = [];
      
      if (selectedPackage && selectedPackage.defaultTasks) {
          autoTasks = selectedPackage.defaultTasks.map((title, idx) => ({
              id: `t-${Date.now()}-${idx}`,
              title: title,
              completed: false
          }));
      }

      const bookingWithAuth: Booking = { 
          ...newBooking, 
          ownerId: ownerId, 
          paidAmount: paymentDetails?.amount || 0, 
          photographerId: newBooking.photographerId || ownerId,
          tasks: autoTasks.length > 0 ? autoTasks : newBooking.tasks 
      };

      try {
          await checkConflictOnServer(bookingWithAuth);

          if (paymentDetails && paymentDetails.amount > 0) {
              await runTransaction(db, async (transaction) => {
                  const bookingRef = doc(db, "bookings", newBooking.id);
                  const accountRef = doc(db, "accounts", paymentDetails.accountId);
                  const transactionRef = doc(db, "transactions", `t-${Date.now()}`);

                  const accountDoc = await transaction.get(accountRef);
                  if (!accountDoc.exists()) throw "Account does not exist!";

                  const newBalance = (accountDoc.data().balance || 0) + paymentDetails.amount;

                  transaction.set(bookingRef, bookingWithAuth);

                  const newTransaction: Transaction = { 
                      id: transactionRef.id, 
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
                  transaction.set(transactionRef, newTransaction);
                  transaction.update(accountRef, { balance: newBalance });
              });
          } else {
              await setDoc(doc(db, "bookings", newBooking.id), bookingWithAuth);
          }
          addNotification({ type: 'SUCCESS', title: 'Booking Created', message: `${newBooking.clientName} scheduled.` });
      } catch (e: any) {
          console.error("Add Booking Failed:", e);
          throw e; 
      }
  };

  const updateBooking = async (b: Booking) => {
      const oldBooking = bookings.find(old => old.id === b.id);
      let bookingToSave = { ...b };

      if (oldBooking && oldBooking.status !== b.status) {
          // Find matching automation rule from Settings
          const automation = config.workflowAutomations?.find(a => a.triggerStatus === b.status);
          
          if (automation && automation.tasks && automation.tasks.length > 0) {
              const newTasks: BookingTask[] = automation.tasks.map((t, idx) => ({
                  id: `at-${Date.now()}-${idx}`,
                  title: t,
                  completed: false
              }));
              
              bookingToSave.tasks = [...(bookingToSave.tasks || []), ...newTasks];
              
              addNotification({ 
                  type: 'INFO', 
                  title: 'Workflow Automation', 
                  message: `Added ${newTasks.length} tasks for ${b.status} stage.` 
              });
          }
      }

      await setDoc(doc(db, "bookings", b.id), bookingToSave);
  };

  // --- MANUAL TRIGGER FOR TESTING AUTOMATIONS ---
  const triggerAutomation = async (status: ProjectStatus, bookingId?: string) => {
      const automation = config.workflowAutomations?.find(a => a.triggerStatus === status);
      
      if (!automation) {
          addNotification({ type: 'WARNING', title: 'No Automation Found', message: `No rules set for ${status}` });
          return;
      }

      if (bookingId) {
          // Apply to specific booking
          const booking = bookings.find(b => b.id === bookingId);
          if (booking) {
              const newTasks: BookingTask[] = automation.tasks.map((t, idx) => ({
                  id: `man-${Date.now()}-${idx}`,
                  title: t,
                  completed: false
              }));
              await updateBooking({ ...booking, tasks: [...(booking.tasks || []), ...newTasks] });
              addNotification({ type: 'SUCCESS', title: 'Automation Applied', message: `Applied ${automation.tasks.length} tasks to ${booking.clientName}` });
          }
      } else {
          // Just simulate the feedback for testing
          addNotification({ type: 'SUCCESS', title: 'Test Successful', message: `Found ${automation.tasks.length} tasks configured for ${status}` });
      }
  };

  const deleteBooking = async (id: string) => {
      try {
          const relatedTransactions = transactions.filter(t => t.bookingId === id);
          const batch = writeBatch(db);
          
          relatedTransactions.forEach(t => {
              batch.delete(doc(db, "transactions", t.id));
          });
          
          batch.delete(doc(db, "bookings", id));
          await batch.commit();
          
          addNotification({ type: 'SUCCESS', title: 'Deleted', message: 'Booking and related records removed.' });
      } catch (e) {
          console.error("Delete failed", e);
          addNotification({ type: 'ERROR', title: 'Error', message: 'Failed to delete booking.' });
      }
  };

  const addClient = async (client: Client) => {
      if(!currentUser) return;
      await setDoc(doc(db, "clients", client.id), { ...client, ownerId: currentUser.id });
  };

  const updateClient = async (client: Client) => {
      await setDoc(doc(db, "clients", client.id), client);
  };

  const deleteClient = async (id: string) => {
      await deleteDoc(doc(db, "clients", id));
  };

  const addAsset = async (asset: Asset) => {
      if(!currentUser) return;
      await setDoc(doc(db, "assets", asset.id), { ...asset, ownerId: currentUser.id });
  };

  const updateAsset = async (asset: Asset) => {
      await setDoc(doc(db, "assets", asset.id), asset);
  };

  const deleteAsset = async (id: string) => {
      const asset = assets.find(a => a.id === id);
      if (asset && asset.status === 'IN_USE') {
          throw new Error(`Cannot delete '${asset.name}'. It is currently marked as IN USE.`);
      }
      await deleteDoc(doc(db, "assets", id));
  };

  const addTransaction = async (data: { description: string; amount: number; category: string; accountId: string; bookingId?: string, isRecurring?: boolean, receiptUrl?: string, submittedBy?: string, recipientId?: string }) => {
      if(!currentUser) return;
      
      try {
          await runTransaction(db, async (transaction) => {
              const tid = `t-${Date.now()}`;
              const transactionRef = doc(db, "transactions", tid);
              const accountRef = doc(db, "accounts", data.accountId);
              
              const accountDoc = await transaction.get(accountRef);
              if (!accountDoc.exists()) throw "Account not found";

              const newTransaction: Transaction = { 
                  id: tid, 
                  date: new Date().toISOString(), 
                  description: data.description, 
                  amount: data.amount, 
                  type: 'EXPENSE', 
                  accountId: data.accountId, 
                  category: data.category, 
                  status: 'COMPLETED', 
                  bookingId: data.bookingId, 
                  ownerId: currentUser.id,
                  isRecurring: data.isRecurring,
                  receiptUrl: data.receiptUrl,
                  submittedBy: data.submittedBy,
                  recipientId: data.recipientId
              };

              transaction.set(transactionRef, newTransaction);
              transaction.update(accountRef, { balance: (accountDoc.data().balance || 0) - data.amount });
          });
          addNotification({ type: 'SUCCESS', title: 'Expense Recorded', message: `Rp ${data.amount.toLocaleString()} processed.` });
      } catch (e) {
          console.error("Expense Transaction Failed", e);
          addNotification({ type: 'ERROR', title: 'Error', message: 'Failed to record expense.' });
      }
  };

  const deleteTransaction = async (id: string) => {
      await deleteDoc(doc(db, "transactions", id));
  };

  const settleBooking = async (bookingId: string, amount: number, accountId: string) => {
      if (!currentUser) return;

      try {
          await runTransaction(db, async (transaction) => {
              const bookingRef = doc(db, "bookings", bookingId);
              const accountRef = doc(db, "accounts", accountId);
              const transactionRef = doc(db, "transactions", `t-${Date.now()}`);

              const bookingDoc = await transaction.get(bookingRef);
              const accountDoc = await transaction.get(accountRef);

              if (!bookingDoc.exists()) throw "Booking not found";
              if (!accountDoc.exists()) throw "Account not found";

              const bookingData = bookingDoc.data() as Booking;
              const accountData = accountDoc.data() as Account;

              transaction.update(bookingRef, { paidAmount: (bookingData.paidAmount || 0) + amount });
              transaction.update(accountRef, { balance: (accountData.balance || 0) + amount });

              const newTrans: Transaction = { 
                  id: transactionRef.id, 
                  date: new Date().toISOString(), 
                  description: amount > 0 ? `Payment - ${bookingData.clientName}` : `Refund - ${bookingData.clientName}`, 
                  amount: Math.abs(amount), 
                  type: amount > 0 ? 'INCOME' : 'EXPENSE', 
                  accountId: accountId, 
                  category: 'Sales / Booking', 
                  status: 'COMPLETED', 
                  bookingId: bookingId, 
                  ownerId: currentUser.id 
              };
              transaction.set(transactionRef, newTrans);
          });
          
          addNotification({ type: 'SUCCESS', title: 'Payment Recorded', message: `Rp ${amount.toLocaleString()} processed.` });
      } catch (e) {
          console.error("Settle Booking Transaction Failed:", e);
          addNotification({ type: 'ERROR', title: 'Transaction Failed', message: 'Could not process payment. Please try again.' });
      }
  };

  const transferFunds = async (fromId: string, toId: string, amount: number) => {
      if(!currentUser) return;
      try {
          await runTransaction(db, async (transaction) => {
              const fromRef = doc(db, "accounts", fromId);
              const toRef = doc(db, "accounts", toId);
              const transactionRef = doc(db, "transactions", `t-${Date.now()}`);

              const fromDoc = await transaction.get(fromRef);
              const toDoc = await transaction.get(toRef);

              if (!fromDoc.exists() || !toDoc.exists()) throw "One or both accounts not found";

              const fromData = fromDoc.data() as Account;
              const toData = toDoc.data() as Account;

              if (fromData.balance < amount) throw "Insufficient funds";

              transaction.update(fromRef, { balance: fromData.balance - amount });
              transaction.update(toRef, { balance: toData.balance + amount });

              const newTrans: Transaction = { 
                  id: transactionRef.id, 
                  date: new Date().toISOString(), 
                  description: `Transfer to ${toData.name}`, 
                  amount: amount, 
                  type: 'TRANSFER', 
                  accountId: fromId, 
                  category: 'Transfer', 
                  status: 'COMPLETED', 
                  ownerId: currentUser.id 
              };
              transaction.set(transactionRef, newTrans);
          });
          addNotification({ type: 'SUCCESS', title: 'Transfer Complete', message: 'Funds moved successfully.' });
      } catch (e: any) {
          addNotification({ type: 'ERROR', title: 'Transfer Failed', message: e.toString() });
      }
  };

  const completeOnboarding = async (data: OnboardingData) => {
      if (!currentUser) return;
      const ownerId = currentUser.id;
      const batch = writeBatch(db);

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
      const newConfig: StudioConfig = { ...STUDIO_CONFIG, name: data.studioName, address: data.address, phone: data.phone, taxRate: data.taxRate, ownerId, bankName: data.bankDetails.name, bankAccount: data.bankDetails.number, bankHolder: data.bankDetails.holder, operatingHoursStart: data.operatingHours.start, operatingHoursEnd: data.operatingHours.end, rooms: roomObjects.length > 0 ? roomObjects : [{ id: 'r1', name: 'Main Studio', type: 'INDOOR', color: 'indigo' }] };
      const configRef = doc(db, "studios", ownerId);
      batch.set(configRef, newConfig);

      await batch.commit();
      setConfig(newConfig);
  };

  return (
    <StudioContext.Provider value={{
        config, bookings, assets, clients, accounts, packages, transactions, notifications, metrics, loadingData, users,
        updateConfig, addBooking, updateBooking, deleteBooking,
        addClient, updateClient, deleteClient,
        addAsset, updateAsset, deleteAsset,
        addTransaction, deleteTransaction, settleBooking, transferFunds,
        completeOnboarding,
        triggerAutomation, 
        addNotification, dismissNotification
    }}>
      {children}
    </StudioContext.Provider>
  );
};

export const useStudio = () => {
  const context = useContext(StudioContext);
  if (context === undefined) {
    throw new Error('useStudio must be used within a StudioProvider');
  }
  return context;
};
