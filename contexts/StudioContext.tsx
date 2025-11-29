
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  StudioConfig, Booking, Asset, Client, Account, Package, Transaction, Notification, 
  OnboardingData, MonthlyMetric
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

    const ownerId = currentUser.role === 'OWNER' ? currentUser.id : currentUser.id; // Simplified logic
    
    // Config
    const configRef = doc(db, "studios", ownerId);
    const unsubConfig = onSnapshot(configRef, (doc) => { if (doc.exists()) setConfig(doc.data() as StudioConfig); });

    // Date Range for Bookings
    const today = new Date();
    const startRange = new Date(); startRange.setMonth(today.getMonth() - 6);
    const endRange = new Date(); endRange.setMonth(today.getMonth() + 6);
    
    const qBookings = query(
        collection(db, "bookings"), 
        where("ownerId", "==", ownerId),
        where("date", ">=", startRange.toISOString().split('T')[0]),
        where("date", "<=", endRange.toISOString().split('T')[0])
    );
    const unsubBookings = onSnapshot(qBookings, (snap) => {
        setBookings(snap.docs.map(d => d.data() as Booking));
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
    };
  }, [currentUser]);

  // --- ACTIONS ---

  const updateConfig = async (newConfig: StudioConfig) => {
      if(!currentUser) return;
      await setDoc(doc(db, "studios", currentUser.id), newConfig);
      setConfig(newConfig);
  };

  // --- HELPER: SERVER SIDE CONFLICT CHECK ---
  const checkConflictOnServer = async (newBooking: Booking) => {
      if (!currentUser) return false;
      const ownerId = currentUser.id;
      
      // 1. Fetch latest bookings for this specific date
      const q = query(
          collection(db, "bookings"),
          where("ownerId", "==", ownerId),
          where("date", "==", newBooking.date)
      );
      
      const snapshot = await getDocs(q);
      const dayBookings = snapshot.docs.map(d => d.data() as Booking);
      
      // 2. Perform Conflict Logic (Same as frontend, but on fresh data)
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

  // ATOMIC ADD BOOKING WITH PRE-FLIGHT CHECK
  const addBooking = async (newBooking: Booking, paymentDetails?: { amount: number, accountId: string }) => {
      if (!currentUser) return;
      const ownerId = currentUser.id;
      
      const bookingWithAuth: Booking = { 
          ...newBooking, 
          ownerId: ownerId, 
          paidAmount: paymentDetails?.amount || 0, 
          photographerId: newBooking.photographerId || ownerId 
      };

      try {
          // STEP 1: Pre-flight Race Condition Check
          await checkConflictOnServer(bookingWithAuth);

          // STEP 2: Transactional Write
          if (paymentDetails && paymentDetails.amount > 0) {
              await runTransaction(db, async (transaction) => {
                  const bookingRef = doc(db, "bookings", newBooking.id);
                  const accountRef = doc(db, "accounts", paymentDetails.accountId);
                  const transactionRef = doc(db, "transactions", `t-${Date.now()}`);

                  const accountDoc = await transaction.get(accountRef);
                  if (!accountDoc.exists()) throw "Account does not exist!";

                  const newBalance = (accountDoc.data().balance || 0) + paymentDetails.amount;

                  // 1. Create Booking
                  transaction.set(bookingRef, bookingWithAuth);

                  // 2. Create Transaction Record
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

                  // 3. Update Account Balance
                  transaction.update(accountRef, { balance: newBalance });
              });
          } else {
              // No payment, simple write
              await setDoc(doc(db, "bookings", newBooking.id), bookingWithAuth);
          }
          addNotification({ type: 'SUCCESS', title: 'Booking Created', message: `${newBooking.clientName} scheduled.` });
      } catch (e: any) {
          console.error("Add Booking Failed:", e);
          // Re-throw to let UI handle the error message
          throw e; 
      }
  };

  const updateBooking = async (b: Booking) => {
      await setDoc(doc(db, "bookings", b.id), b);
  };

  const deleteBooking = async (id: string) => {
      await deleteDoc(doc(db, "bookings", id));
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

  // ATOMIC SETTLE BOOKING
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

              // 1. Update Booking Paid Amount
              transaction.update(bookingRef, { paidAmount: (bookingData.paidAmount || 0) + amount });

              // 2. Update Account Balance
              transaction.update(accountRef, { balance: (accountData.balance || 0) + amount });

              // 3. Create Transaction Record
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
        config, bookings, assets, clients, accounts, packages, transactions, notifications, metrics, loadingData,
        updateConfig, addBooking, updateBooking, deleteBooking,
        addClient, updateClient, deleteClient,
        addAsset, updateAsset, deleteAsset,
        addTransaction, deleteTransaction, settleBooking, transferFunds,
        completeOnboarding,
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
