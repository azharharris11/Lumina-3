
import React, { useState } from 'react';
import { Booking, StudioConfig } from '../../types';
import { CheckCircle2, Download, MessageCircle, HardDrive, Lock } from 'lucide-react';
import InvoiceModal from '../InvoiceModal';

interface ClientPortalProps {
    booking: Booking;
    config: StudioConfig;
}

const ClientPortal: React.FC<ClientPortalProps> = ({ booking, config }) => {
    const [portalMode, setPortalMode] = useState<'LOGIN' | 'DASHBOARD'>('LOGIN');
    const [phoneInput, setPhoneInput] = useState('');
    const [loginError, setLoginError] = useState('');
    const [showInvoice, setShowInvoice] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple verification: Check last 4 digits of phone
        const clientPhone = booking.clientPhone.replace(/\D/g, '');
        const inputClean = phoneInput.replace(/\D/g, '');
        
        if (clientPhone.endsWith(inputClean) && inputClean.length >= 4) {
            setPortalMode('DASHBOARD');
        } else {
            setLoginError("Verification failed. Please enter the last 4 digits of your phone number.");
        }
    };

    if (portalMode === 'LOGIN') {
        return (
            <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-6 font-sans">
                <div className="w-full max-w-md bg-neutral-800 border border-neutral-700 rounded-2xl p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-white mb-2">{config.name}</h2>
                        <p className="text-neutral-400 text-sm">Client Portal Access</p>
                    </div>
                    <div className="bg-neutral-900 p-4 rounded-xl mb-6 border border-neutral-700 text-center">
                        <p className="text-xs text-neutral-500 uppercase font-bold tracking-widest mb-1">Project</p>
                        <p className="text-white font-bold text-lg">{booking.package}</p>
                        <p className="text-neutral-400 text-sm">{new Date(booking.date).toLocaleDateString()}</p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Verify Identity</label>
                            <input 
                                type="text" 
                                placeholder="Last 4 digits of your phone number"
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white text-center tracking-widest focus:border-white outline-none transition-colors"
                                maxLength={4}
                                value={phoneInput}
                                onChange={e => setPhoneInput(e.target.value)}
                            />
                        </div>
                        {loginError && <p className="text-rose-500 text-xs text-center">{loginError}</p>}
                        <button className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors">
                            Access Dashboard
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // PORTAL DASHBOARD
    const steps = ['BOOKED', 'SHOOTING', 'EDITING', 'REVIEW', 'COMPLETED'];
    const currentStepIndex = steps.indexOf(booking.status) !== -1 ? steps.indexOf(booking.status) : 0;
    const balance = (booking.price * (1 + config.taxRate/100)) - booking.paidAmount;
    const isPaid = balance <= 100;

    return (
        <div className="min-h-screen bg-neutral-950 text-white font-sans pb-20">
            <nav className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <span className="font-bold text-lg">{config.name}</span>
                    <div className="text-xs font-bold bg-neutral-800 px-3 py-1 rounded-full text-neutral-400">
                        Order #{booking.id.substring(booking.id.length-4).toUpperCase()}
                    </div>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-6 py-12 space-y-8">
                {/* Welcome */}
                <div>
                    <h1 className="text-3xl font-bold mb-2">Hello, {booking.clientName.split(' ')[0]}</h1>
                    <p className="text-neutral-400">Here is the latest status of your project.</p>
                </div>

                {/* Timeline */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8 overflow-x-auto">
                    <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-8">Project Timeline</h3>
                    <div className="flex items-center min-w-[600px]">
                        {steps.map((step, i) => (
                            <div key={step} className="flex-1 relative last:flex-none">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border-2 z-10 relative
                                        ${i <= currentStepIndex ? 'bg-white text-black border-white' : 'bg-neutral-800 text-neutral-500 border-neutral-700'}
                                    `}>
                                        {i < currentStepIndex ? <CheckCircle2 size={16}/> : i + 1}
                                    </div>
                                    <div className={`text-sm font-bold ${i <= currentStepIndex ? 'text-white' : 'text-neutral-600'}`}>{step}</div>
                                </div>
                                {i < steps.length - 1 && (
                                    <div className={`absolute top-5 left-10 right-[-20px] h-0.5 ${i < currentStepIndex ? 'bg-white' : 'bg-neutral-800'}`}></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Financials */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-6">Financial Overview</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-neutral-400">Total Amount</span>
                                    <span className="font-bold">Rp {(booking.price * (1 + config.taxRate/100)).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-neutral-400">Paid to Date</span>
                                    <span className="font-bold text-emerald-500">Rp {booking.paidAmount.toLocaleString()}</span>
                                </div>
                                <div className="pt-4 border-t border-neutral-800 flex justify-between items-center">
                                    <span className="font-bold">Balance Due</span>
                                    <span className={`text-xl font-mono font-bold ${isPaid ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        Rp {balance > 0 ? balance.toLocaleString() : '0'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-neutral-800">
                            <button 
                                onClick={() => setShowInvoice(true)}
                                className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                            >
                                <Download size={18} /> Download Invoice
                            </button>
                        </div>
                    </div>

                    {/* Deliverables */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
                        {!isPaid && (
                            <div className="absolute inset-0 bg-neutral-900/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-6">
                                <Lock size={32} className="text-neutral-500 mb-4"/>
                                <h3 className="font-bold text-white mb-1">Deliverables Locked</h3>
                                <p className="text-sm text-neutral-400">Please settle the remaining balance to access your files.</p>
                            </div>
                        )}
                        <div>
                            <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-6">Deliverables</h3>
                            <div className="aspect-video bg-neutral-800 rounded-xl flex items-center justify-center mb-4">
                                <HardDrive size={48} className="text-neutral-600"/>
                            </div>
                            <p className="text-sm text-neutral-400 mb-2">
                                Your photos are stored securely on our cloud server.
                            </p>
                        </div>
                        <div className="mt-4">
                            {booking.deliveryUrl ? (
                                <a 
                                    href={booking.deliveryUrl} 
                                    target="_blank"
                                    className="block w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors text-center"
                                >
                                    Access Gallery
                                </a>
                            ) : (
                                <button disabled className="w-full py-3 bg-neutral-800 text-neutral-500 font-bold rounded-lg cursor-not-allowed">
                                    Not Ready Yet
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Contact */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-white">Need Help?</h3>
                        <p className="text-sm text-neutral-400">Contact the studio directly.</p>
                    </div>
                    <a 
                        href={`https://wa.me/${config.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        className="bg-emerald-500 hover:bg-emerald-600 text-white p-3 rounded-full transition-colors"
                    >
                        <MessageCircle size={24} />
                    </a>
                </div>
            </main>

            <InvoiceModal 
                isOpen={showInvoice}
                onClose={() => setShowInvoice(false)}
                booking={booking}
                config={config}
            />
        </div>
    );
};

export default ClientPortal;
