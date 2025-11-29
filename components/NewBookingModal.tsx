
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Account, Booking, Client, StudioConfig, Asset, Package } from '../types';
import { PACKAGES } from '../data';
import { X, Search, ChevronRight, ChevronLeft, Calendar, Clock, User as UserIcon, CheckCircle2, AlertCircle, Plus, DollarSign, Briefcase, Loader2, Save, Camera } from 'lucide-react';
import CustomSelect from './ui/CustomSelect';

interface NewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  photographers: User[];
  accounts: Account[];
  bookings?: Booking[]; 
  clients?: Client[]; 
  assets?: Asset[]; 
  config: StudioConfig; 
  onAddBooking?: (booking: Booking, paymentDetails?: { amount: number, accountId: string }) => Promise<void>;
  onAddClient?: (client: Client) => void; 
  initialData?: { date: string, time: string, studio: string };
  googleToken?: string | null;
  packages?: Package[];
}

const NewBookingModal: React.FC<NewBookingModalProps> = ({ isOpen, onClose, photographers, accounts, bookings = [], clients = [], config, onAddBooking, onAddClient, initialData, packages = [], googleToken, assets = [] }) => {
  const [step, setStep] = useState(1);
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const DRAFT_KEY = 'lumina_booking_draft';

  // TIMEZONE FIX: Get Local Date correctly
  const getLocalDateString = () => {
      const now = new Date();
      const offset = now.getTimezoneOffset() * 60000;
      return new Date(now.getTime() - offset).toISOString().split('T')[0];
  };

  const [bookingForm, setBookingForm] = useState<{
      date: string;
      timeStart: string;
      duration: number;
      studio: string;
      packageId: string;
      photographerId: string;
      price: number;
      notes: string;
      syncGoogle: boolean;
  }>({
      date: getLocalDateString(),
      timeStart: '10:00',
      duration: 2,
      studio: config.rooms[0]?.name || 'Main Studio',
      packageId: '',
      photographerId: photographers[0]?.id || '',
      price: 0,
      notes: '',
      syncGoogle: !!googleToken
  });

  const [newClientForm, setNewClientForm] = useState({ name: '', phone: '', email: '', category: 'NEW' });
  const [paymentForm, setPaymentForm] = useState({ amount: 0, accountId: '' });

  useEffect(() => {
    if (isOpen) {
        const savedDraft = localStorage.getItem(DRAFT_KEY);
        if (savedDraft && !initialData) {
            try {
                const parsed = JSON.parse(savedDraft);
                setBookingForm(prev => ({...prev, ...parsed.form, syncGoogle: !!googleToken}));
                if (parsed.client) setSelectedClient(parsed.client);
                setStep(parsed.step || 1);
            } catch (e) { console.error("Draft parse error", e); }
        }

        if (initialData) {
            setBookingForm(prev => ({
                ...prev,
                date: initialData.date,
                timeStart: initialData.time,
                studio: initialData.studio
            }));
            setStep(1); 
        }
        
        setIsSubmitting(false);
        setSubmitError(null);
    }
  }, [isOpen, initialData, googleToken]);

  useEffect(() => {
      if (isOpen) {
          const draftData = {
              form: bookingForm,
              client: selectedClient,
              step: step
          };
          localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
      }
  }, [bookingForm, selectedClient, step, isOpen]);

  useEffect(() => {
      if (accounts.length > 0 && !paymentForm.accountId) {
          setPaymentForm(prev => ({ ...prev, accountId: accounts[0].id }));
      }
  }, [accounts]);

  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()) || c.phone.includes(clientSearch));
  const availablePackages = config.site?.showPricing ? (packages.length > 0 ? packages : PACKAGES) : (packages.length > 0 ? packages : PACKAGES);

  // --- ROBUST CONFLICT DETECTION (Client Side Preview) ---
  const conflictError = useMemo(() => {
      if (!bookingForm.date || !bookingForm.timeStart || !bookingForm.studio || !bookingForm.packageId) return null;

      const bufferMins = config.bufferMinutes || 0;
      const [newStartH, newStartM] = bookingForm.timeStart.split(':').map(Number);
      
      // Calculate Proposed Time Range (Minutes from midnight)
      const newStartMins = newStartH * 60 + newStartM;
      // End time includes duration AND buffer to ensure cleaning/prep time
      const newEndMins = newStartMins + (bookingForm.duration * 60) + bufferMins; 

      // 1. CHECK ROOM CONFLICTS
      const roomConflict = bookings.find(b => {
          if (b.status === 'CANCELLED' || b.date !== bookingForm.date || b.studio !== bookingForm.studio) return false;

          const [bStartH, bStartM] = b.timeStart.split(':').map(Number);
          const bStartMins = bStartH * 60 + bStartM;
          // Existing booking also claims its buffer time
          const bEndMins = bStartMins + (b.duration * 60) + bufferMins;

          // Overlap logic: (StartA < EndB) and (EndA > StartB)
          return (newStartMins < bEndMins) && (newEndMins > bStartMins);
      });

      if (roomConflict) {
          return `Room occupied by ${roomConflict.clientName} until ${formatMinsToTime(
              parseTime(roomConflict.timeStart) + (roomConflict.duration * 60) + bufferMins
          )} (incl. ${bufferMins}m buffer)`;
      }

      // 2. CHECK ASSET CONFLICTS (Equipment Double Booking)
      const selectedPkg = availablePackages.find(p => p.id === bookingForm.packageId);
      const requiredAssetIds = selectedPkg?.defaultAssetIds || [];

      if (requiredAssetIds.length > 0) {
          // Find other bookings happening at the same time (ANY room)
          const concurrentBookings = bookings.filter(b => {
              if (b.status === 'CANCELLED' || b.date !== bookingForm.date) return false;
              const [bStartH, bStartM] = b.timeStart.split(':').map(Number);
              const bStartMins = bStartH * 60 + bStartM;
              const bEndMins = bStartMins + (b.duration * 60) + bufferMins;
              return (newStartMins < bEndMins) && (newEndMins > bStartMins);
          });

          for (const booking of concurrentBookings) {
              const bPkg = packages.find(p => p.name === booking.package);
              
              if (bPkg && bPkg.defaultAssetIds) {
                  const conflictAssets = requiredAssetIds.filter(id => bPkg.defaultAssetIds?.includes(id));
                  
                  if (conflictAssets.length > 0) {
                      const assetNames = assets
                          .filter(a => conflictAssets.includes(a.id))
                          .map(a => a.name)
                          .join(', ');
                      return `Equipment Conflict: ${assetNames} is being used in ${booking.studio}`;
                  }
              }
          }
      }

      return null;
  }, [bookingForm, bookings, config.bufferMinutes, availablePackages, packages, assets]);

  // Helpers for time calc display
  function parseTime(t: string) {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
  }
  function formatMinsToTime(totalMins: number) {
      const h = Math.floor(totalMins / 60) % 24;
      const m = totalMins % 60;
      return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`;
  }


  const handleCreateClient = () => {
      if (onAddClient && newClientForm.name) {
          const newClient: Client = {
              id: `c-${Date.now()}`,
              name: newClientForm.name,
              phone: newClientForm.phone,
              email: newClientForm.email,
              category: newClientForm.category,
              notes: '',
              joinedDate: getLocalDateString(), // Timezone fix
              avatar: `https://ui-avatars.com/api/?name=${newClientForm.name}&background=random`
          };
          onAddClient(newClient);
          setSelectedClient(newClient);
          setIsCreatingClient(false);
          setClientSearch('');
      }
  };

  const handleSelectPackage = (pkgId: string) => {
      const realPkg = availablePackages.find(p => p.id === pkgId);
      if (realPkg) {
          setBookingForm(prev => ({
              ...prev,
              packageId: pkgId,
              price: realPkg.price,
              duration: realPkg.duration
          }));
      }
  };

  const calculateTotal = () => {
      const tax = config.taxRate || 0;
      return bookingForm.price * (1 + tax/100);
  };

  const isStepValid = () => {
      if (step === 1) return !!selectedClient;
      if (step === 2) return !!bookingForm.packageId && !!bookingForm.date && !!bookingForm.timeStart && !conflictError;
      return true;
  };

  const handleSubmit = async () => {
      if (onAddBooking && selectedClient && !conflictError) {
          if (paymentForm.amount > 0 && !paymentForm.accountId) {
              alert("Please select a valid account for deposit.");
              return;
          }

          setIsSubmitting(true);
          setSubmitError(null);

          const selectedPkg = availablePackages.find(p => p.id === bookingForm.packageId) || { name: 'Custom', features: [] };
          
          const newBooking: Booking = {
              id: `b-${Date.now()}`,
              clientName: selectedClient.name,
              clientPhone: selectedClient.phone,
              clientId: selectedClient.id,
              date: bookingForm.date,
              timeStart: bookingForm.timeStart,
              duration: bookingForm.duration,
              package: selectedPkg.name,
              price: bookingForm.price,
              paidAmount: 0,
              status: 'BOOKED',
              photographerId: bookingForm.photographerId,
              studio: bookingForm.studio,
              contractStatus: 'PENDING',
              contractSignedDate: '',
              contractSignature: '',
              items: [
                  { 
                      id: `i-${Date.now()}`, 
                      description: selectedPkg.name, 
                      quantity: 1, 
                      unitPrice: bookingForm.price, 
                      total: bookingForm.price 
                  }
              ],
              taxSnapshot: config.taxRate,
              notes: bookingForm.notes,
              logs: []
          };

          try {
              // This is now an async operation that checks for conflicts on server
              await onAddBooking(newBooking, paymentForm.amount > 0 ? paymentForm : undefined);
              localStorage.removeItem(DRAFT_KEY);
              onClose();
          } catch (e: any) {
              console.error("Submission failed:", e);
              setSubmitError(e.message || "Failed to create booking. Please try again.");
          } finally {
              setIsSubmitting(false);
          }
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-0">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={isSubmitting ? undefined : onClose}></div>
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative bg-lumina-surface border border-lumina-highlight w-full max-w-4xl h-[90vh] lg:h-[800px] rounded-2xl shadow-2xl flex overflow-hidden"
      >
        {/* Sidebar Stepper (Desktop) */}
        <div className="hidden lg:flex w-64 bg-lumina-base border-r border-lumina-highlight flex-col p-6 justify-between">
            <div>
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-display font-bold text-white">New Session</h2>
                    {localStorage.getItem(DRAFT_KEY) && <span className="text-[10px] text-emerald-400 flex items-center gap-1"><Save size={10}/> Saved</span>}
                </div>
                
                <div className="space-y-6 relative">
                    <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-lumina-highlight -z-10"></div>
                    {[
                        { id: 1, label: 'Client', icon: UserIcon },
                        { id: 2, label: 'Details', icon: Briefcase },
                        { id: 3, label: 'Payment', icon: DollarSign }
                    ].map((s) => (
                        <div key={s.id} className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all z-10
                                ${step >= s.id ? 'bg-lumina-accent text-lumina-base' : 'bg-lumina-surface border border-lumina-highlight text-lumina-muted'}`}>
                                {step > s.id ? <CheckCircle2 size={14}/> : s.id}
                            </div>
                            <span className={`text-sm font-bold ${step === s.id ? 'text-white' : 'text-lumina-muted'}`}>{s.label}</span>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="bg-lumina-surface/50 p-4 rounded-xl border border-lumina-highlight">
                <p className="text-xs text-lumina-muted uppercase mb-2 font-bold">Summary</p>
                <div className="space-y-2 text-sm text-white">
                    <div className="flex items-center gap-2 truncate">
                        <UserIcon size={14} className="text-lumina-accent shrink-0"/>
                        <span className="truncate">{selectedClient?.name || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-lumina-accent shrink-0"/>
                        <span>{new Date(bookingForm.date).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <DollarSign size={14} className="text-lumina-accent shrink-0"/>
                        <span>{bookingForm.price > 0 ? `Rp ${(bookingForm.price/1000).toFixed(0)}k` : '-'}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-lumina-surface">
            <div className="lg:hidden p-4 border-b border-lumina-highlight bg-lumina-base flex justify-between items-center">
                <span className="font-bold text-white">Step {step} of 3</span>
                <button onClick={onClose}><X className="text-lumina-muted" /></button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8">
                {submitError && (
                    <div className="mb-4 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 text-rose-400">
                        <AlertCircle size={20} />
                        <span className="text-sm font-bold">{submitError}</span>
                    </div>
                )}

                <AnimatePresence mode="wait">
                    
                    {/* STEP 1: CLIENT */}
                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                            <h2 className="text-2xl font-bold text-white">Select Client</h2>
                            {!isCreatingClient ? (
                                <>
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-lumina-muted w-5 h-5" />
                                        <input 
                                            autoFocus
                                            className="w-full bg-lumina-base border border-lumina-highlight rounded-xl pl-12 pr-4 py-4 text-white focus:border-lumina-accent outline-none transition-all shadow-inner"
                                            placeholder="Search existing clients..."
                                            value={clientSearch}
                                            onChange={e => setClientSearch(e.target.value)}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                                        <button onClick={() => setIsCreatingClient(true)} className="p-4 border border-dashed border-lumina-highlight rounded-xl text-lumina-muted hover:text-white hover:border-lumina-accent hover:bg-lumina-accent/5 transition-all flex flex-col items-center justify-center gap-2 h-[100px]">
                                            <Plus size={24} /> <span className="font-bold text-sm">Create New Client</span>
                                        </button>
                                        {filteredClients.map(client => (
                                            <div key={client.id} onClick={() => setSelectedClient(client)} className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-4 h-[100px] ${selectedClient?.id === client.id ? 'bg-lumina-accent/10 border-lumina-accent shadow-lg shadow-lumina-accent/10' : 'bg-lumina-base border-lumina-highlight hover:border-lumina-muted'}`}>
                                                <img src={client.avatar} className="w-12 h-12 rounded-full border border-lumina-highlight" />
                                                <div className="text-left overflow-hidden">
                                                    <p className={`font-bold text-sm truncate ${selectedClient?.id === client.id ? 'text-white' : 'text-lumina-text'}`}>{client.name}</p>
                                                    <p className="text-xs text-lumina-muted truncate">{client.phone}</p>
                                                </div>
                                                {selectedClient?.id === client.id && <CheckCircle2 className="ml-auto text-lumina-accent" size={20} />}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="bg-lumina-base border border-lumina-highlight rounded-xl p-6 space-y-4 animate-in slide-in-from-right">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-bold text-white">New Client Profile</h3>
                                        <button onClick={() => setIsCreatingClient(false)} className="text-xs text-lumina-muted hover:text-white hover:underline">Cancel</button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="text-xs font-bold text-lumina-muted mb-1 block">Full Name</label><input className="w-full bg-lumina-surface border border-lumina-highlight rounded-lg p-3 text-white focus:border-lumina-accent outline-none" value={newClientForm.name} onChange={e => setNewClientForm({...newClientForm, name: e.target.value})} /></div>
                                        <div><label className="text-xs font-bold text-lumina-muted mb-1 block">Phone</label><input className="w-full bg-lumina-surface border border-lumina-highlight rounded-lg p-3 text-white focus:border-lumina-accent outline-none" value={newClientForm.phone} onChange={e => setNewClientForm({...newClientForm, phone: e.target.value})} /></div>
                                    </div>
                                    <div><label className="text-xs font-bold text-lumina-muted mb-1 block">Email</label><input className="w-full bg-lumina-surface border border-lumina-highlight rounded-lg p-3 text-white focus:border-lumina-accent outline-none" value={newClientForm.email} onChange={e => setNewClientForm({...newClientForm, email: e.target.value})} /></div>
                                    <button onClick={handleCreateClient} className="w-full py-3 bg-lumina-accent text-lumina-base font-bold rounded-xl hover:bg-lumina-accent/90 transition-colors">Save Client</button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* STEP 2: SESSION */}
                    {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                            <h2 className="text-2xl font-bold text-white">Session Details</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-lumina-muted uppercase mb-3 block">Select Package</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {availablePackages.filter(p => p.active).map(pkg => (
                                            <div key={pkg.id} onClick={() => handleSelectPackage(pkg.id)} className={`p-4 rounded-xl border cursor-pointer transition-all relative overflow-hidden group ${bookingForm.packageId === pkg.id ? 'bg-lumina-highlight border-lumina-accent' : 'bg-lumina-base border-lumina-highlight hover:border-lumina-muted'}`}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-bold text-white text-sm">{pkg.name}</h4>
                                                    {bookingForm.packageId === pkg.id && <CheckCircle2 size={16} className="text-lumina-accent"/>}
                                                </div>
                                                <p className="text-xs text-lumina-muted mb-3 line-clamp-2">{pkg.features.slice(0, 2).join(', ')}</p>
                                                {/* Show Asset Requirement Indicator */}
                                                {pkg.defaultAssetIds && pkg.defaultAssetIds.length > 0 && (
                                                    <div className="text-[10px] text-lumina-muted flex items-center gap-1 mb-2">
                                                        <Camera size={10} /> Requires Equipment
                                                    </div>
                                                )}
                                                <div className="flex justify-between items-end border-t border-white/5 pt-3">
                                                    <span className="text-[10px] font-bold bg-lumina-surface px-2 py-1 rounded text-white">{pkg.duration} Hours</span>
                                                    <span className="text-sm font-mono text-lumina-accent font-bold">Rp {(pkg.price/1000).toFixed(0)}k</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-white border-b border-lumina-highlight pb-2">Logistics</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs text-lumina-muted block mb-1">Date</label>
                                                <div className="relative"><Calendar className="absolute left-3 top-2.5 text-lumina-muted w-4 h-4"/><input type="date" className="w-full bg-lumina-base border border-lumina-highlight rounded-lg pl-10 p-2 text-white text-sm focus:border-lumina-accent outline-none" value={bookingForm.date} onChange={e => setBookingForm({...bookingForm, date: e.target.value})} /></div>
                                            </div>
                                            <div>
                                                <label className="text-xs text-lumina-muted block mb-1">Start Time</label>
                                                <div className="relative"><Clock className="absolute left-3 top-2.5 text-lumina-muted w-4 h-4"/><input type="time" className="w-full bg-lumina-base border border-lumina-highlight rounded-lg pl-10 p-2 text-white text-sm focus:border-lumina-accent outline-none" value={bookingForm.timeStart} onChange={e => setBookingForm({...bookingForm, timeStart: e.target.value})} /></div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs text-lumina-muted block mb-1">Duration (h)</label>
                                                <input type="number" className="w-full bg-lumina-base border border-lumina-highlight rounded-lg p-2 text-white text-sm focus:border-lumina-accent outline-none" value={bookingForm.duration} onChange={e => setBookingForm({...bookingForm, duration: Number(e.target.value)})} />
                                            </div>
                                            <div>
                                                <label className="text-xs text-lumina-muted block mb-1">Room</label>
                                                <CustomSelect 
                                                    value={bookingForm.studio} 
                                                    onChange={val => setBookingForm({...bookingForm, studio: val})}
                                                    options={config.rooms.map(r => ({ value: r.name, label: r.name }))}
                                                />
                                            </div>
                                        </div>
                                        
                                        {/* CONFLICT ERROR DISPLAY */}
                                        {conflictError && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: -10 }} 
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-start gap-2"
                                            >
                                                <AlertCircle className="text-rose-500 w-4 h-4 mt-0.5 shrink-0" />
                                                <span className="text-xs text-rose-400 font-bold">{conflictError}</span>
                                            </motion.div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-white border-b border-lumina-highlight pb-2">Assignments</h3>
                                        <div>
                                            <label className="text-xs text-lumina-muted block mb-1">Lead Photographer</label>
                                            <CustomSelect 
                                                value={bookingForm.photographerId}
                                                onChange={val => setBookingForm({...bookingForm, photographerId: val})}
                                                options={photographers.map(p => ({ value: p.id, label: p.name }))}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-lumina-muted block mb-1">Internal Notes</label>
                                            <textarea className="w-full bg-lumina-base border border-lumina-highlight rounded-lg p-2 text-white text-sm h-20 resize-none focus:border-lumina-accent outline-none" placeholder="Special requests..." value={bookingForm.notes} onChange={e => setBookingForm({...bookingForm, notes: e.target.value})} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: PAYMENT */}
                    {step === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                            <h2 className="text-2xl font-bold text-white">Payment & Confirmation</h2>
                            <div className="bg-white text-black rounded-xl overflow-hidden shadow-2xl max-w-md mx-auto relative">
                                <div className="h-2 bg-lumina-accent w-full"></div>
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-6"><span className="font-black text-lg uppercase">Total Due</span><span className="font-black text-2xl font-mono tracking-tight">Rp {calculateTotal().toLocaleString()}</span></div>
                                    <div className="bg-gray-100 p-4 rounded-lg space-y-3">
                                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2"><DollarSign size={14}/> Initial Deposit</label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">Rp</span>
                                                <input type="number" className="w-full pl-8 pr-3 py-2 rounded border border-gray-300 text-sm font-bold focus:outline-none focus:border-black" value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: Number(e.target.value)})} />
                                            </div>
                                            <button onClick={() => setPaymentForm(p => ({...p, amount: calculateTotal() * 0.5}))} className="px-3 py-1 bg-white border border-gray-300 rounded text-xs font-bold hover:bg-gray-200">50%</button>
                                        </div>
                                        {paymentForm.amount > 0 && (
                                            <div className="animate-in slide-in-from-top-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Deposit Account</label>
                                                <select className="w-full p-2 rounded border border-gray-300 text-sm bg-white focus:outline-none focus:border-black" value={paymentForm.accountId} onChange={e => setPaymentForm({...paymentForm, accountId: e.target.value})}>
                                                    <option value="" disabled>Select Account</option>
                                                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-4 flex items-center gap-2"><input type="checkbox" id="googleSync" checked={bookingForm.syncGoogle} disabled={!googleToken} onChange={(e) => setBookingForm({...bookingForm, syncGoogle: e.target.checked})} className="rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"/><label htmlFor="googleSync" className={`text-xs font-bold uppercase ${googleToken ? 'text-gray-600' : 'text-gray-400'}`}>Sync to Google Calendar {googleToken ? '' : '(Not Connected)'}</label></div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="p-4 lg:p-6 border-t border-lumina-highlight bg-lumina-base flex justify-between items-center shrink-0">
                {step > 1 ? <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 text-lumina-muted hover:text-white font-bold transition-colors"><ChevronLeft size={20} /> Back</button> : <div></div>}
                <button onClick={step === 3 ? handleSubmit : () => setStep(step + 1)} disabled={!isStepValid() || isSubmitting} className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg ${isStepValid() && !isSubmitting ? (step === 3 ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-lumina-accent hover:bg-lumina-accent/90 text-lumina-base') : 'bg-lumina-highlight text-lumina-muted cursor-not-allowed opacity-50'}`}>
                    {isSubmitting ? <><Loader2 size={20} className="animate-spin" /> Saving...</> : <>{step === 3 ? 'Confirm Booking' : 'Next Step'} {step !== 3 && <ChevronRight size={20} />}</>}
                </button>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NewBookingModal;
