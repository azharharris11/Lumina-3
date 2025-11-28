import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, OnboardingData } from '../types';
import { Aperture, ArrowRight, Camera, Briefcase, Building, Zap, Check, Loader2, User as UserIcon, Clock, DollarSign, Tag, ArrowLeft, MapPin, Phone, Plus, Trash2, Percent } from 'lucide-react';

const Motion = motion as any;

interface OnboardingViewProps {
  user: User;
  onComplete: (data: OnboardingData) => void;
}

const OnboardingView: React.FC<OnboardingViewProps> = ({ user, onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  
  // Form State
  const [studioName, setStudioName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  
  const [focus, setFocus] = useState('');
  
  const [opHours, setOpHours] = useState({ start: '09:00', end: '18:00' });
  const [rooms, setRooms] = useState<string[]>(['Main Studio']);
  const [newRoom, setNewRoom] = useState('');

  const [bank, setBank] = useState({ name: '', number: '', holder: '' });
  const [taxRate, setTaxRate] = useState<number>(0);
  
  const [pkg, setPkg] = useState({ name: 'Standard Session', price: 1000000, duration: 2 });

  // Loading State
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing Core System...');

  useEffect(() => {
      if(step === 1) setStudioName(user.name ? `${user.name.split(' ')[0]}'s Studio` : 'My Studio');
  }, []);

  // Auto-fill Package based on Focus
  useEffect(() => {
      if (focus === 'WEDDING') setPkg({ name: 'Wedding Day', price: 5000000, duration: 8 });
      if (focus === 'PORTRAIT') setPkg({ name: 'Family Portrait', price: 1500000, duration: 1 });
      if (focus === 'COMMERCIAL') setPkg({ name: 'Product Shoot', price: 3000000, duration: 4 });
      if (focus === 'RENTAL') setPkg({ name: 'Studio Rental (Hourly)', price: 300000, duration: 1 });
  }, [focus]);

  useEffect(() => {
      if (step === 6) {
          const texts = [
              "Configuring Financial Ledger...",
              "Setting up Production Pipeline...",
              "Calibrating Color Profiles...",
              "Syncing Calendar Engine...",
              "Finalizing Workspace..."
          ];
          
          let i = 0;
          const interval = setInterval(() => {
              setLoadingProgress(prev => {
                  if (prev >= 100) {
                      clearInterval(interval);
                      setTimeout(() => {
                          onComplete({
                              studioName,
                              address,
                              phone,
                              focus,
                              operatingHours: opHours,
                              rooms,
                              bankDetails: bank,
                              taxRate,
                              initialPackage: pkg
                          });
                      }, 500);
                      return 100;
                  }
                  return prev + (Math.random() * 10);
              });
              
              if (Math.random() > 0.8) {
                  i = (i + 1) % texts.length;
                  setLoadingText(texts[i]);
              }
          }, 300);
          
          return () => clearInterval(interval);
      }
  }, [step]);

  const addRoom = () => {
      if(newRoom.trim()) {
          setRooms([...rooms, newRoom.trim()]);
          setNewRoom('');
      }
  };

  const removeRoom = (index: number) => {
      setRooms(rooms.filter((_, i) => i !== index));
  };

  const focusOptions = [
      { id: 'WEDDING', label: 'Wedding & Events', icon: Camera, desc: 'High volume, fast turnaround' },
      { id: 'COMMERCIAL', label: 'Commercial / Ads', icon: Briefcase, desc: 'B2B, invoicing focused' },
      { id: 'PORTRAIT', label: 'Portrait & Family', icon: UserIcon, desc: 'Studio sessions, recurring clients' },
      { id: 'RENTAL', label: 'Studio Rental', icon: Building, desc: 'Booking slots, asset tracking' }
  ];

  return (
    <div className="min-h-screen bg-lumina-base flex items-center justify-center relative overflow-hidden p-6">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
         <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2071&auto=format&fit=crop')] bg-cover bg-center opacity-5 mix-blend-overlay"></div>
         <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-lumina-accent/10 rounded-full blur-[120px] animate-pulse"></div>
      </div>

      <Motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl relative z-10"
      >
        <div className="mb-8 text-center">
            <Motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center justify-center p-3 bg-lumina-surface border border-lumina-highlight rounded-2xl mb-6 shadow-2xl"
            >
                <Aperture className="w-8 h-8 text-lumina-accent animate-spin-slow" />
            </Motion.div>
            
            {step < 6 && (
                <Motion.h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-2">
                    Welcome to Lumina
                </Motion.h1>
            )}
        </div>

        <div className="bg-lumina-surface/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl min-h-[500px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
                
                {/* STEP 1: STUDIO IDENTITY */}
                {step === 1 && (
                    <Motion.div 
                        key="step1"
                        initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
                        className="space-y-6"
                    >
                        <div className="text-center mb-8">
                            <h2 className="text-xl font-bold text-white">Let's set up your brand</h2>
                            <p className="text-lumina-muted text-sm">These details will appear on your invoices.</p>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-lumina-muted uppercase mb-1 block">Studio Name</label>
                                <input 
                                    autoFocus
                                    type="text" 
                                    value={studioName}
                                    onChange={(e) => setStudioName(e.target.value)}
                                    className="w-full bg-lumina-base border border-lumina-highlight rounded-xl p-3 text-white focus:border-lumina-accent outline-none"
                                    placeholder="Enter Studio Name"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-lumina-muted uppercase mb-1 block">Address</label>
                                <div className="relative">
                                    <MapPin size={16} className="absolute left-3 top-3 text-lumina-muted"/>
                                    <input 
                                        type="text" 
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="w-full bg-lumina-base border border-lumina-highlight rounded-xl p-3 pl-10 text-white focus:border-lumina-accent outline-none text-sm"
                                        placeholder="Full Business Address"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-lumina-muted uppercase mb-1 block">Business Phone</label>
                                <div className="relative">
                                    <Phone size={16} className="absolute left-3 top-3 text-lumina-muted"/>
                                    <input 
                                        type="text" 
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full bg-lumina-base border border-lumina-highlight rounded-xl p-3 pl-10 text-white focus:border-lumina-accent outline-none text-sm"
                                        placeholder="+62..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center mt-8">
                            <button 
                                onClick={() => { if(studioName) setStep(2); }}
                                disabled={!studioName}
                                className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-lumina-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next Step <ArrowRight size={18} />
                            </button>
                        </div>
                    </Motion.div>
                )}

                {/* STEP 2: FOCUS */}
                {step === 2 && (
                    <Motion.div 
                        key="step2"
                        initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
                        className="space-y-6"
                    >
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold text-white">What is your primary focus?</h2>
                            <p className="text-lumina-muted text-sm">We'll optimize your defaults based on this.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {focusOptions.map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => setFocus(opt.id)}
                                    className={`p-4 rounded-xl border text-left transition-all group
                                        ${focus === opt.id 
                                            ? 'bg-lumina-accent text-black border-lumina-accent' 
                                            : 'bg-lumina-base border-lumina-highlight text-lumina-muted hover:border-white hover:text-white'}
                                    `}
                                >
                                    <opt.icon size={24} className={`mb-3 ${focus === opt.id ? 'text-black' : 'text-lumina-accent'}`} />
                                    <h3 className="font-bold text-sm uppercase tracking-wider mb-1">{opt.label}</h3>
                                    <p className={`text-xs ${focus === opt.id ? 'text-black/70' : 'text-lumina-muted group-hover:text-gray-400'}`}>
                                        {opt.desc}
                                    </p>
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-center mt-8 gap-4">
                            <button onClick={() => setStep(1)} className="text-lumina-muted hover:text-white text-sm font-bold flex items-center gap-2"><ArrowLeft size={16}/> Back</button>
                            <button 
                                onClick={() => setStep(3)}
                                disabled={!focus}
                                className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-lumina-accent transition-colors disabled:opacity-50"
                            >
                                Next Step <ArrowRight size={18} />
                            </button>
                        </div>
                    </Motion.div>
                )}

                {/* STEP 3: OPERATIONS */}
                {step === 3 && (
                    <Motion.div 
                        key="step3"
                        initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
                        className="space-y-6"
                    >
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold text-white">Operations</h2>
                            <p className="text-lumina-muted text-sm">Define your working hours and spaces.</p>
                        </div>

                        <div className="space-y-6">
                            <div className="p-4 bg-lumina-base border border-lumina-highlight rounded-xl">
                                <h3 className="text-white font-bold flex items-center gap-2 mb-4 text-sm uppercase tracking-wider"><Clock size={16} className="text-lumina-accent"/> Operating Hours</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-lumina-muted block mb-1">Open</label>
                                        <input type="time" value={opHours.start} onChange={e => setOpHours({...opHours, start: e.target.value})} className="w-full bg-lumina-surface border border-lumina-highlight rounded p-2 text-white text-sm" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-lumina-muted block mb-1">Close</label>
                                        <input type="time" value={opHours.end} onChange={e => setOpHours({...opHours, end: e.target.value})} className="w-full bg-lumina-surface border border-lumina-highlight rounded p-2 text-white text-sm" />
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-lumina-base border border-lumina-highlight rounded-xl">
                                <h3 className="text-white font-bold flex items-center gap-2 mb-4 text-sm uppercase tracking-wider"><Building size={16} className="text-blue-400"/> Studio Rooms</h3>
                                <div className="space-y-2 mb-3">
                                    {rooms.map((room, i) => (
                                        <div key={i} className="flex justify-between items-center bg-lumina-surface p-2 rounded border border-lumina-highlight">
                                            <span className="text-sm text-white">{room}</span>
                                            <button onClick={() => removeRoom(i)} className="text-lumina-muted hover:text-rose-500"><Trash2 size={14}/></button>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input 
                                        placeholder="Add Room (e.g. Outdoor)" 
                                        value={newRoom} 
                                        onChange={e => setNewRoom(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && addRoom()}
                                        className="flex-1 bg-lumina-surface border border-lumina-highlight rounded p-2 text-white text-sm focus:border-blue-400 outline-none"
                                    />
                                    <button onClick={addRoom} className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"><Plus size={16}/></button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center mt-8 gap-4">
                            <button onClick={() => setStep(2)} className="text-lumina-muted hover:text-white text-sm font-bold flex items-center gap-2"><ArrowLeft size={16}/> Back</button>
                            <button 
                                onClick={() => setStep(4)}
                                disabled={rooms.length === 0}
                                className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-lumina-accent transition-colors disabled:opacity-50"
                            >
                                Next Step <ArrowRight size={18} />
                            </button>
                        </div>
                    </Motion.div>
                )}

                {/* STEP 4: FINANCE */}
                {step === 4 && (
                    <Motion.div 
                        key="step4"
                        initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
                        className="space-y-6"
                    >
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold text-white">Finance</h2>
                            <p className="text-lumina-muted text-sm">Where should clients send payments?</p>
                        </div>

                        <div className="space-y-6">
                            <div className="p-4 bg-lumina-base border border-lumina-highlight rounded-xl">
                                <h3 className="text-white font-bold flex items-center gap-2 mb-4 text-sm uppercase tracking-wider"><DollarSign size={16} className="text-emerald-400"/> Bank Details</h3>
                                <div className="space-y-3">
                                    <input placeholder="Bank Name (e.g. BCA)" value={bank.name} onChange={e => setBank({...bank, name: e.target.value})} className="w-full bg-lumina-surface border border-lumina-highlight rounded p-2 text-white text-sm" />
                                    <input placeholder="Account Number" value={bank.number} onChange={e => setBank({...bank, number: e.target.value})} className="w-full bg-lumina-surface border border-lumina-highlight rounded p-2 text-white text-sm" />
                                    <input placeholder="Account Holder (Your Name)" value={bank.holder} onChange={e => setBank({...bank, holder: e.target.value})} className="w-full bg-lumina-surface border border-lumina-highlight rounded p-2 text-white text-sm" />
                                </div>
                            </div>

                            <div className="p-4 bg-lumina-base border border-lumina-highlight rounded-xl">
                                <h3 className="text-white font-bold flex items-center gap-2 mb-4 text-sm uppercase tracking-wider"><Percent size={16} className="text-amber-400"/> Tax Settings</h3>
                                <div>
                                    <label className="text-xs text-lumina-muted block mb-1">Tax Rate (%)</label>
                                    <input 
                                        type="number" 
                                        value={taxRate} 
                                        onChange={e => setTaxRate(Number(e.target.value))} 
                                        className="w-full bg-lumina-surface border border-lumina-highlight rounded p-2 text-white text-sm"
                                        placeholder="0"
                                    />
                                    <p className="text-[10px] text-lumina-muted mt-1">Leave 0 if not applicable.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center mt-8 gap-4">
                            <button onClick={() => setStep(3)} className="text-lumina-muted hover:text-white text-sm font-bold flex items-center gap-2"><ArrowLeft size={16}/> Back</button>
                            <button 
                                onClick={() => setStep(5)}
                                disabled={!bank.name || !bank.number}
                                className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-lumina-accent transition-colors disabled:opacity-50"
                            >
                                Next Step <ArrowRight size={18} />
                            </button>
                        </div>
                    </Motion.div>
                )}

                {/* STEP 5: FIRST PACKAGE */}
                {step === 5 && (
                    <Motion.div 
                        key="step5"
                        initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
                        className="space-y-6"
                    >
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold text-white">Create your first package</h2>
                            <p className="text-lumina-muted text-sm">You can add more later.</p>
                        </div>

                        <div className="bg-lumina-base border border-lumina-highlight rounded-2xl p-6 max-w-md mx-auto">
                            <div className="flex items-center gap-2 mb-6">
                                <Tag size={18} className="text-lumina-accent" />
                                <span className="font-bold text-white uppercase tracking-wider text-sm">Primary Service</span>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-lumina-muted uppercase font-bold block mb-1">Package Name</label>
                                    <input type="text" value={pkg.name} onChange={e => setPkg({...pkg, name: e.target.value})} className="w-full bg-lumina-surface border border-lumina-highlight rounded-lg p-3 text-white focus:border-lumina-accent outline-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-lumina-muted uppercase font-bold block mb-1">Price (IDR)</label>
                                        <input type="number" value={pkg.price} onChange={e => setPkg({...pkg, price: Number(e.target.value)})} className="w-full bg-lumina-surface border border-lumina-highlight rounded-lg p-3 text-white focus:border-lumina-accent outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-lumina-muted uppercase font-bold block mb-1">Duration (Hours)</label>
                                        <input type="number" value={pkg.duration} onChange={e => setPkg({...pkg, duration: Number(e.target.value)})} className="w-full bg-lumina-surface border border-lumina-highlight rounded-lg p-3 text-white focus:border-lumina-accent outline-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center mt-8 gap-4">
                            <button onClick={() => setStep(4)} className="text-lumina-muted hover:text-white text-sm font-bold flex items-center gap-2"><ArrowLeft size={16}/> Back</button>
                            <button 
                                onClick={() => setStep(6)}
                                className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-lumina-accent transition-colors"
                            >
                                Finish Setup <Zap size={18} fill="black" />
                            </button>
                        </div>
                    </Motion.div>
                )}

                {/* STEP 6: LOADER */}
                {step === 6 && (
                    <Motion.div 
                        key="step6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center space-y-8"
                    >
                        <div className="relative w-24 h-24 mx-auto">
                            <svg className="w-full h-full" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="#333" strokeWidth="8" />
                                <Motion.circle 
                                    cx="50" cy="50" r="45" fill="none" stroke="#bef264" strokeWidth="8" strokeLinecap="round"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: loadingProgress / 100 }}
                                    transform="rotate(-90 50 50)"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-white">
                                {Math.round(loadingProgress)}%
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">Setting up {studioName}</h2>
                            <p className="text-lumina-accent font-mono text-sm animate-pulse">{loadingText}</p>
                        </div>
                    </Motion.div>
                )}

            </AnimatePresence>
        </div>
      </Motion.div>
    </div>
  );
};

export default OnboardingView;