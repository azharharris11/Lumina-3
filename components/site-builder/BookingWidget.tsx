
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, SiteTheme, PublicBookingSubmission, SitePixels, Booking } from '../../types';
import { Check, ChevronRight, Calendar, Clock, User, ArrowLeft, CheckCircle2, Loader2, Activity, AlertCircle, Mail, MessageSquare } from 'lucide-react';

const Motion = motion as any;

interface BookingWidgetProps {
    packages: Package[];
    theme: SiteTheme;
    onSubmit?: (data: PublicBookingSubmission) => void;
    pixels?: SitePixels;
    bookings?: Booking[]; 
    mode?: 'INSTANT' | 'INQUIRY'; // NEW PROP
}

type Step = 'PACKAGE' | 'DATE' | 'DETAILS' | 'CONFIRM';

const BookingWidget: React.FC<BookingWidgetProps> = ({ packages, theme, onSubmit, pixels, bookings = [], mode = 'INSTANT' }) => {
    const [step, setStep] = useState<Step>('PACKAGE');
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [clientInfo, setClientInfo] = useState({ name: '', email: '', phone: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [pixelToast, setPixelToast] = useState<string | null>(null);

    const firePixel = (event: string, details: string) => {
        const w = window as any;
        let fired = false;
        if (pixels?.facebookPixelId && w.fbq) { w.fbq('track', event, { content_name: details }); fired = true; }
        if (pixels?.tiktokPixelId && w.ttq) { w.ttq.track(event, { content_name: details }); fired = true; }
        if (pixels?.googleTagId && w.gtag) { w.gtag('event', event, { event_label: details }); fired = true; }
        if (fired) { setPixelToast(`${event} fired`); setTimeout(() => setPixelToast(null), 3000); }
    };

    const handleSelectPackage = (pkg: Package) => {
        setSelectedPackage(pkg);
        firePixel('ViewContent', `Package: ${pkg.name}`);
        if (mode === 'INQUIRY') {
            setStep('DETAILS'); // Skip date for inquiry
        } else {
            setStep('DATE');
        }
    };

    const availableTimeSlots = useMemo(() => {
        const slots = ['09:00', '11:00', '13:00', '15:00', '17:00'];
        if (!selectedDate || !selectedPackage) return slots.map(t => ({ time: t, available: true }));
        return slots.map(time => {
            const [startH, startM] = time.split(':').map(Number);
            const proposedStart = startH * 60 + startM;
            const proposedEnd = proposedStart + (selectedPackage.duration * 60);
            const hasConflict = bookings.some(b => {
                if (b.date !== selectedDate || b.status === 'CANCELLED') return false;
                if (!b.timeStart) return false;
                const [bStartH, bStartM] = b.timeStart.split(':').map(Number);
                const bStart = bStartH * 60 + bStartM;
                const bEnd = bStart + (b.duration * 60);
                return (proposedStart < bEnd) && (proposedEnd > bStart);
            });
            return { time, available: !hasConflict };
        });
    }, [selectedDate, selectedPackage, bookings]);

    // --- THEME ADAPTER (Truncated for brevity, assuming existing classes logic) ---
    const getThemeClasses = () => {
        // Reuse existing logic, adding a default
        switch(theme) {
            case 'RETRO': return { container: 'bg-[#c0c0c0] border-2 border-white border-r-black border-b-black p-4 text-black font-mono', button: 'bg-[#c0c0c0] border-2 border-white border-r-black border-b-black px-4 py-2 font-bold hover:bg-blue-100', input: 'bg-white border-2 border-gray-600 border-r-white border-b-white p-2 shadow-inner', card: 'bg-white border-2 border-gray-600 p-3 hover:bg-blue-100 cursor-pointer', accent: 'bg-blue-800 text-white' };
            case 'VOGUE': return { container: 'bg-white border-[4px] border-[#ff3333] p-6 text-black font-sans', button: 'bg-black text-white border-2 border-black hover:bg-[#ffff00] hover:text-black font-black uppercase px-6 py-3', input: 'bg-[#f0f0f0] border-2 border-black p-3 font-bold focus:bg-[#ffff00] outline-none', card: 'border-4 border-black p-4 hover:bg-[#ffff00] cursor-pointer transition-all', accent: 'text-[#ff3333]' };
            case 'CINEMA': return { container: 'bg-[#050505] border border-white/10 p-6 text-white font-sans rounded-xl backdrop-blur-md', button: 'bg-white text-black rounded px-6 py-2 font-bold hover:bg-blue-500 hover:text-white', input: 'bg-white/10 border border-white/20 rounded p-3 text-white focus:border-blue-500 outline-none', card: 'bg-white/5 border border-white/10 p-4 rounded hover:border-blue-500 cursor-pointer', accent: 'text-blue-500' };
            case 'NOIR': return { container: 'bg-black border border-white/20 p-6 text-white font-sans', button: 'bg-white text-black px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-300', input: 'bg-black border-b border-white/50 p-3 text-white focus:border-white outline-none', card: 'border border-white/20 p-4 hover:bg-white hover:text-black cursor-pointer transition-colors', accent: 'text-white' };
            default: return { container: 'bg-white/80 backdrop-blur-lg border border-gray-200 p-6 text-gray-800 font-sans rounded-2xl shadow-xl', button: 'bg-black text-white rounded-lg px-6 py-3 font-medium hover:opacity-80', input: 'bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-black/5 focus:border-black outline-none', card: 'bg-white border border-gray-100 p-4 rounded-xl hover:shadow-md cursor-pointer', accent: 'text-black' };
        }
    };
    const s = getThemeClasses();

    const handleNext = async () => {
        if (step === 'PACKAGE' && selectedPackage) {
            handleSelectPackage(selectedPackage); // Logic inside handles step skipping
        } else if (step === 'DATE' && selectedDate && selectedTime) {
            firePixel('AddToCart', `Date: ${selectedDate}`);
            setStep('DETAILS');
        } else if (step === 'DETAILS' && clientInfo.name) {
            firePixel('InitiateCheckout', `Client: ${clientInfo.name}`);
            setStep('CONFIRM');
        } else if (step === 'CONFIRM') {
            if (onSubmit && selectedPackage) {
                setIsSubmitting(true);
                const type = mode === 'INQUIRY' ? 'Lead' : 'Purchase';
                firePixel(type, `Pkg: ${selectedPackage.name}`);
                try {
                    await (onSubmit as any)({
                        clientName: clientInfo.name,
                        clientEmail: clientInfo.email,
                        clientPhone: clientInfo.phone,
                        date: mode === 'INQUIRY' ? new Date().toISOString().split('T')[0] : selectedDate,
                        time: mode === 'INQUIRY' ? '00:00' : selectedTime,
                        packageId: selectedPackage.id,
                        type: mode === 'INQUIRY' ? 'INQUIRY' : 'BOOKING'
                    });
                    setStep('PACKAGE'); setSelectedPackage(null); setClientInfo({ name: '', email: '', phone: '', message: '' }); setSelectedDate(''); setSelectedTime('');
                } catch (error) { alert("Failed to submit."); } finally { setIsSubmitting(false); }
            }
        }
    };

    return (
        <div className={`w-full max-w-md mx-auto my-12 ${s.container} relative`}>
            {/* Steps & Toasts omitted for brevity, reusing structure */}
            <div className="flex gap-2 mb-6">
                {['PACKAGE', mode === 'INQUIRY' ? 'DETAILS' : 'DATE', mode === 'INQUIRY' ? 'CONFIRM' : 'DETAILS', mode === 'INQUIRY' ? '' : 'CONFIRM'].filter(Boolean).map((sName, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full ${['PACKAGE', 'DATE', 'DETAILS', 'CONFIRM'].indexOf(step) >= i ? 'bg-current opacity-100' : 'bg-current opacity-20'}`}></div>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {step === 'PACKAGE' && (
                    <Motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <h3 className={`text-xl font-bold mb-4 ${s.accent}`}>{mode === 'INQUIRY' ? 'What are you interested in?' : 'Select a Package'}</h3>
                        <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                            {packages.filter(p => p.active).map(pkg => (
                                <div key={pkg.id} onClick={() => handleSelectPackage(pkg)} className={`${s.card} ${selectedPackage?.id === pkg.id ? 'ring-2 ring-current opacity-100' : 'opacity-80'}`}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold">{pkg.name}</span>
                                        {mode !== 'INQUIRY' && <span className="text-sm opacity-70">Rp {(pkg.price/1000).toFixed(0)}k</span>}
                                    </div>
                                    <p className="text-xs opacity-60">{pkg.duration} Hours • {pkg.features[0]}</p>
                                </div>
                            ))}
                        </div>
                    </Motion.div>
                )}

                {step === 'DATE' && mode === 'INSTANT' && (
                    <Motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <h3 className={`text-xl font-bold mb-4 ${s.accent}`}>Choose Date</h3>
                        <div className="space-y-4">
                            <input type="date" className={`w-full ${s.input}`} value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
                            {selectedDate && <div className="grid grid-cols-3 gap-2">{availableTimeSlots.map(slot => (
                                <button key={slot.time} onClick={() => slot.available && setSelectedTime(slot.time)} disabled={!slot.available} className={`py-2 text-sm border rounded ${selectedTime === slot.time ? 'bg-current text-white md:text-black md:invert' : slot.available ? 'opacity-50 hover:opacity-100' : 'opacity-30 cursor-not-allowed bg-black/5'}`}>{slot.time}</button>
                            ))}</div>}
                        </div>
                    </Motion.div>
                )}

                {step === 'DETAILS' && (
                    <Motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <h3 className={`text-xl font-bold mb-4 ${s.accent}`}>Your Details</h3>
                        <div className="space-y-3">
                            <input placeholder="Full Name" className={`w-full ${s.input}`} value={clientInfo.name} onChange={e => setClientInfo({...clientInfo, name: e.target.value})} />
                            <input placeholder="Phone / WhatsApp" className={`w-full ${s.input}`} value={clientInfo.phone} onChange={e => setClientInfo({...clientInfo, phone: e.target.value})} />
                            <input placeholder="Email" className={`w-full ${s.input}`} value={clientInfo.email} onChange={e => setClientInfo({...clientInfo, email: e.target.value})} />
                            {mode === 'INQUIRY' && <textarea placeholder="Message / Specific requests..." className={`w-full ${s.input} min-h-[80px]`} value={clientInfo.message} onChange={e => setClientInfo({...clientInfo, message: e.target.value})} />}
                        </div>
                    </Motion.div>
                )}

                {step === 'CONFIRM' && (
                    <Motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <h3 className={`text-xl font-bold mb-4 ${s.accent}`}>{mode === 'INQUIRY' ? 'Send Inquiry' : 'Confirm Booking'}</h3>
                        <div className={`${s.card} mb-6 cursor-default`}>
                            <div className="space-y-2 text-sm opacity-80">
                                <div className="font-bold text-lg">{selectedPackage?.name}</div>
                                {mode === 'INSTANT' && <div>{selectedDate} at {selectedTime}</div>}
                                <div>{clientInfo.name}</div>
                                <div>{clientInfo.phone}</div>
                            </div>
                        </div>
                    </Motion.div>
                )}
            </AnimatePresence>

            <div className="flex justify-between mt-6 pt-4 border-t border-current/10">
                {step !== 'PACKAGE' && <button onClick={() => setStep(step === 'CONFIRM' ? 'DETAILS' : step === 'DETAILS' && mode === 'INQUIRY' ? 'PACKAGE' : step === 'DETAILS' ? 'DATE' : 'PACKAGE')} className="flex items-center gap-1 text-sm font-bold opacity-60 hover:opacity-100"><ArrowLeft size={16}/> Back</button>}
                <button onClick={handleNext} disabled={isSubmitting} className={`${s.button} flex items-center gap-2 ml-auto`}>
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : step === 'CONFIRM' ? (mode === 'INQUIRY' ? 'Send Request' : 'Book Now') : 'Next'}
                </button>
            </div>
        </div>
    );
};

export default BookingWidget;
