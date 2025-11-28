
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Account, Booking, Client, StudioConfig, Asset, Package } from '../types';
import { PACKAGES } from '../data';
import { X, Search, ChevronRight, ChevronLeft, Calendar, Clock, User as UserIcon, CheckCircle2, AlertCircle, Plus, DollarSign, Briefcase, MapPin, Loader2 } from 'lucide-react';

const Motion = motion as any;

interface NewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  photographers: User[];
  accounts: Account[];
  bookings?: Booking[]; 
  clients?: Client[]; 
  assets?: Asset[]; 
  config: StudioConfig; 
  onAddBooking?: (booking: Booking, paymentDetails?: { amount: number, accountId: string }) => void;
  onAddClient?: (client: Client) => void; 
  initialData?: { date: string, time: string, studio: string };
  googleToken?: string | null;
  packages?: Package[];
}

const NewBookingModal: React.FC<NewBookingModalProps> = ({ isOpen, onClose, photographers, accounts, bookings = [], clients = [], config, onAddBooking, onAddClient, initialData, packages = [] }) => {
  const [step, setStep] = useState(1);
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [bookingForm, setBookingForm] = useState<{
      date: string;
      timeStart: string;
      duration: number;
      studio: string;
      packageId: string;
      photographerId: string;
      price: number;
      notes: string;
  }>({
      date: new Date().toISOString().split('T')[0],
      timeStart: '10:00',
      duration: 2,
      studio: config.rooms[0]?.name || 'Main Studio',
      packageId: '',
      photographerId: photographers[0]?.id || '',
      price: 0,
      notes: ''
  });

  const [newClientForm, setNewClientForm] = useState({ name: '', phone: '', email: '', category: 'NEW' });
  const [paymentForm, setPaymentForm] = useState({ amount: 0, accountId: '' });

  // Initialize Account
  useEffect(() => {
      if (accounts.length > 0 && !paymentForm.accountId) {
          setPaymentForm(prev => ({ ...prev, accountId: accounts[0].id }));
      }
  }, [accounts]);

  // Handle Initial Data
  useEffect(() => {
    if (isOpen) {
        if (initialData) {
            setBookingForm(prev => ({
                ...prev,
                date: initialData.date,
                timeStart: initialData.time,
                studio: initialData.studio
            }));
        }
        setStep(1); // Always start at client selection
        setIsSubmitting(false);
    }
  }, [isOpen, initialData]);

  const filteredClients = clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()) || c.phone.includes(clientSearch));
  const availablePackages = config.site?.showPricing ? (packages.length > 0 ? packages : PACKAGES) : (packages.length > 0 ? packages : PACKAGES);

  const handleCreateClient = () => {
      if (onAddClient && newClientForm.name) {
          const newClient: Client = {
              id: `c-${Date.now()}`,
              name: newClientForm.name,
              phone: newClientForm.phone,
              email: newClientForm.email,
              category: newClientForm.category,
              notes: '',
              joinedDate: new Date().toISOString(),
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
      if (step === 2) return !!bookingForm.packageId && !!bookingForm.date && !!bookingForm.timeStart;
      return true;
  };

  const handleSubmit = async () => {
      if (onAddBooking && selectedClient) {
          if (paymentForm.amount > 0 && !paymentForm.accountId) {
              alert("Please select a valid account for deposit.");
              return;
          }

          setIsSubmitting(true);

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
              paidAmount: 0, // Transaction logic handles balance update
              status: 'BOOKED',
              photographerId: bookingForm.photographerId,
              studio: bookingForm.studio,
              contractStatus: 'PENDING',
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
              notes: bookingForm.notes
          };

          try {
              await onAddBooking(newBooking, paymentForm.amount > 0 ? paymentForm : undefined);
              onClose();
          } catch (e) {
              console.error("Submission failed inside modal:", e);
              // App.tsx handles the alert, we just stop loading
          } finally {
              setIsSubmitting(false);
          }
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-0">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={isSubmitting ? undefined : onClose}></div>
      
      <Motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative bg-lumina-surface border border-lumina-highlight w-full max-w-4xl h-[90vh] lg:h-[800px] rounded-2xl shadow-2xl flex overflow-hidden"
      >
        {/* Sidebar Stepper (Desktop) */}
        <div className="hidden lg:flex w-64 bg-lumina-base border-r border-lumina-highlight flex-col p-6 justify-between">
            <div>
                <h2 className="text-xl font-display font-bold text-white mb-8">New Session</h2>
                <div className="space-y-6 relative">
                    {/* Connection Line */}
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
            
            {/* Context Info */}
            <div className="bg-lumina-surface/50 p-4 rounded-xl border border-lumina-highlight">
                <p className="text-xs text-lumina-muted uppercase mb-2 font-bold">Summary</p>
                <div className="space-y-2 text-sm text-white">
                    <div className="flex items-center gap-2">
                        <UserIcon size={14} className="text-lumina-accent"/>
                        <span className="truncate">{selectedClient?.name || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-lumina-accent"/>
                        <span>{new Date(bookingForm.date).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <DollarSign size={14} className="text-lumina-accent"/>
                        <span>{bookingForm.price > 0 ? `Rp ${(bookingForm.price/1000).toFixed(0)}k` : '-'}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-lumina-surface">
            {/* Header Mobile */}
            <div className="lg:hidden p-4 border-b border-lumina-highlight flex justify-between items-center bg-lumina-base">
                <span className="font-bold text-white">Step {step} of 3</span>
                <button onClick={onClose}><X className="text-lumina-muted" /></button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8">
                <AnimatePresence mode="wait">
                    
                    {/* STEP 1: CLIENT SELECTION */}
                    {step === 1 && (
                        <Motion.div key="step1" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
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
                                        <button 
                                            onClick={() => setIsCreatingClient(true)}
                                            className="p-4 border border-dashed border-lumina-highlight rounded-xl text-lumina-muted hover:text-white hover:border-lumina-accent hover:bg-lumina-accent/5 transition-all flex flex-col items-center justify-center gap-2 h-[100px]"
                                        >
                                            <Plus size={24} />
                                            <span className="font-bold text-sm">Create New Client</span>
                                        </button>
                                        
                                        {filteredClients.map(client => (
                                            <div 
                                                key={client.id} 
                                                onClick={() => setSelectedClient(client)}
                                                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-4 h-[100px]
                                                    ${selectedClient?.id === client.id 
                                                        ? 'bg-lumina-accent/10 border-lumina-accent shadow-lg shadow-lumina-accent/10' 
                                                        : 'bg-lumina-base border-lumina-highlight hover:border-lumina-muted'}`}
                                            >
                                                <img src={client.avatar} className="w-12 h-12 rounded-full border border-lumina-highlight" />
                                                <div className="text-left overflow-hidden">
                                                    <p className={`font-bold text-sm truncate ${selectedClient?.id === client.id ? 'text-white' : 'text-lumina-text'}`}>{client.name}</p>
                                                    <p className="text-xs text-lumina-muted truncate">{client.phone}</p>
                                                    <span className="text-[10px] bg-lumina-surface px-1.5 py-0.5 rounded border border-lumina-highlight mt-1 inline-block">{client.category}</span>
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
                                        <div>
                                            <label className="text-xs font-bold text-lumina-muted mb-1 block">Full Name</label>
                                            <input className="w-full bg-lumina-surface border border-lumina-highlight rounded-lg p-3 text-white focus:border-lumina-accent outline-none" value={newClientForm.name} onChange={e => setNewClientForm({...newClientForm, name: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-lumina-muted mb-1 block">Phone</label>
                                            <input className="w-full bg-lumina-surface border border-lumina-highlight rounded-lg p-3 text-white focus:border-lumina-accent outline-none" value={newClientForm.phone} onChange={e => setNewClientForm({...newClientForm, phone: e.target.value})} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-lumina-muted mb-1 block">Email</label>
                                        <input className="w-full bg-lumina-surface border border-lumina-highlight rounded-lg p-3 text-white focus:border-lumina-accent outline-none" value={newClientForm.email} onChange={e => setNewClientForm({...newClientForm, email: e.target.value})} />
                                    </div>
                                    <button onClick={handleCreateClient} className="w-full py-3 bg-lumina-accent text-lumina-base font-bold rounded-xl hover:bg-lumina-accent/90 transition-colors">Save Client</button>
                                </div>
                            )}
                        </Motion.div>
                    )}

                    {/* STEP 2: SESSION DETAILS */}
                    {step === 2 && (
                        <Motion.div key="step2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                            <h2 className="text-2xl font-bold text-white">Session Details</h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-lumina-muted uppercase mb-3 block">Select Package</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {availablePackages.filter(p => p.active).map(pkg => (
                                            <div 
                                                key={pkg.id}
                                                onClick={() => handleSelectPackage(pkg.id)}
                                                className={`p-4 rounded-xl border cursor-pointer transition-all relative overflow-hidden group
                                                    ${bookingForm.packageId === pkg.id ? 'bg-lumina-highlight border-lumina-accent' : 'bg-lumina-base border-lumina-highlight hover:border-lumina-muted'}`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-bold text-white text-sm">{pkg.name}</h4>
                                                    {bookingForm.packageId === pkg.id && <CheckCircle2 size={16} className="text-lumina-accent"/>}
                                                </div>
                                                <p className="text-xs text-lumina-muted mb-3 line-clamp-2">{pkg.features.join(', ')}</p>
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
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-2.5 text-lumina-muted w-4 h-4"/>
                                                    <input type="date" className="w-full bg-lumina-base border border-lumina-highlight rounded-lg pl-10 p-2 text-white text-sm focus:border-lumina-accent outline-none" value={bookingForm.date} onChange={e => setBookingForm({...bookingForm, date: e.target.value})} />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs text-lumina-muted block mb-1">Start Time</label>
                                                <div className="relative">
                                                    <Clock className="absolute left-3 top-2.5 text-lumina-muted w-4 h-4"/>
                                                    <input type="time" className="w-full bg-lumina-base border border-lumina-highlight rounded-lg pl-10 p-2 text-white text-sm focus:border-lumina-accent outline-none" value={bookingForm.timeStart} onChange={e => setBookingForm({...bookingForm, timeStart: e.target.value})} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs text-lumina-muted block mb-1">Duration (h)</label>
                                                <input type="number" className="w-full bg-lumina-base border border-lumina-highlight rounded-lg p-2 text-white text-sm focus:border-lumina-accent outline-none" value={bookingForm.duration} onChange={e => setBookingForm({...bookingForm, duration: Number(e.target.value)})} />
                                            </div>
                                            <div>
                                                <label className="text-xs text-lumina-muted block mb-1">Room</label>
                                                <select className="w-full bg-lumina-base border border-lumina-highlight rounded-lg p-2 text-white text-sm focus:border-lumina-accent outline-none" value={bookingForm.studio} onChange={e => setBookingForm({...bookingForm, studio: e.target.value})}>
                                                    {config.rooms.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-white border-b border-lumina-highlight pb-2">Assignments</h3>
                                        <div>
                                            <label className="text-xs text-lumina-muted block mb-1">Lead Photographer</label>
                                            <select className="w-full bg-lumina-base border border-lumina-highlight rounded-lg p-2 text-white text-sm focus:border-lumina-accent outline-none" value={bookingForm.photographerId} onChange={e => setBookingForm({...bookingForm, photographerId: e.target.value})}>
                                                {photographers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-lumina-muted block mb-1">Internal Notes</label>
                                            <textarea 
                                                className="w-full bg-lumina-base border border-lumina-highlight rounded-lg p-2 text-white text-sm h-20 resize-none focus:border-lumina-accent outline-none"
                                                placeholder="Special requests, lighting setup..."
                                                value={bookingForm.notes}
                                                onChange={e => setBookingForm({...bookingForm, notes: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Motion.div>
                    )}

                    {/* STEP 3: PAYMENT & CONFIRM */}
                    {step === 3 && (
                        <Motion.div key="step3" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                            <h2 className="text-2xl font-bold text-white">Payment & Confirmation</h2>
                            
                            <div className="bg-white text-black rounded-xl overflow-hidden shadow-2xl max-w-md mx-auto relative">
                                <div className="h-2 bg-lumina-accent w-full"></div>
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="font-bold text-xl uppercase tracking-tight">Invoice Preview</h3>
                                            <p className="text-xs text-gray-500 font-mono">{config.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500">Date</p>
                                            <p className="font-bold text-sm">{bookingForm.date}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 border-b border-gray-200 pb-4 mb-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium text-gray-600">Service</span>
                                            <span className="font-bold">{availablePackages.find(p => p.id === bookingForm.packageId)?.name}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium text-gray-600">Session Price</span>
                                            <span className="font-mono">Rp {bookingForm.price.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium text-gray-600">Tax ({config.taxRate}%)</span>
                                            <span className="font-mono text-gray-500">Rp {(bookingForm.price * (config.taxRate/100)).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center mb-6">
                                        <span className="font-black text-lg uppercase">Total Due</span>
                                        <span className="font-black text-2xl font-mono tracking-tight">Rp {calculateTotal().toLocaleString()}</span>
                                    </div>

                                    {/* Deposit Input */}
                                    <div className="bg-gray-100 p-4 rounded-lg space-y-3">
                                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                                            <DollarSign size={14}/> Initial Deposit (Optional)
                                        </label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">Rp</span>
                                                <input 
                                                    type="number"
                                                    className="w-full pl-8 pr-3 py-2 rounded border border-gray-300 text-sm font-bold focus:outline-none focus:border-black"
                                                    value={paymentForm.amount}
                                                    onChange={e => setPaymentForm({...paymentForm, amount: Number(e.target.value)})}
                                                />
                                            </div>
                                            <button onClick={() => setPaymentForm(p => ({...p, amount: calculateTotal() * 0.5}))} className="px-3 py-1 bg-white border border-gray-300 rounded text-xs font-bold hover:bg-gray-200">50%</button>
                                            <button onClick={() => setPaymentForm(p => ({...p, amount: calculateTotal()}))} className="px-3 py-1 bg-white border border-gray-300 rounded text-xs font-bold hover:bg-gray-200">Full</button>
                                        </div>
                                        
                                        {paymentForm.amount > 0 && (
                                            <div className="animate-in slide-in-from-top-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Deposit Account</label>
                                                <select 
                                                    className="w-full p-2 rounded border border-gray-300 text-sm bg-white focus:outline-none focus:border-black"
                                                    value={paymentForm.accountId}
                                                    onChange={e => setPaymentForm({...paymentForm, accountId: e.target.value})}
                                                >
                                                    <option value="" disabled>Select Bank Account</option>
                                                    {accounts.map(acc => (
                                                        <option key={acc.id} value={acc.id}>{acc.name} ({acc.type})</option>
                                                    ))}
                                                </select>
                                                {paymentForm.amount > 0 && !paymentForm.accountId && (
                                                    <p className="text-[10px] text-rose-500 mt-1 flex items-center gap-1"><AlertCircle size={10}/> Account required</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Motion.div>
                    )}

                </AnimatePresence>
            </div>

            {/* Footer Navigation */}
            <div className="p-4 lg:p-6 border-t border-lumina-highlight bg-lumina-base flex justify-between items-center shrink-0">
                {step > 1 ? (
                    <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 text-lumina-muted hover:text-white font-bold transition-colors">
                        <ChevronLeft size={20} /> Back
                    </button>
                ) : (
                    <div></div>
                )}

                <button 
                    onClick={step === 3 ? handleSubmit : () => setStep(step + 1)}
                    disabled={!isStepValid() || isSubmitting}
                    className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg
                        ${isStepValid() && !isSubmitting
                            ? (step === 3 ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-lumina-accent hover:bg-lumina-accent/90 text-lumina-base') 
                            : 'bg-lumina-highlight text-lumina-muted cursor-not-allowed opacity-50'}`}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 size={20} className="animate-spin" /> Saving...
                        </>
                    ) : (
                        <>
                            {step === 3 ? 'Confirm Booking' : 'Next Step'} 
                            {step !== 3 && <ChevronRight size={20} />}
                        </>
                    )}
                </button>
            </div>
        </div>
      </Motion.div>
    </div>
  );
};

export default NewBookingModal;
