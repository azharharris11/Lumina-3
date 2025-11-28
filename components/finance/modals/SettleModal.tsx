
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { Account } from '../../../types';

const Motion = motion as any;

interface SettleModalProps {
    isOpen: boolean;
    bookingId: string | null;
    mode: 'PAYMENT' | 'REFUND';
    currentPaid: number;
    maxAmount: number;
    accounts: Account[];
    onClose: () => void;
    onConfirm: (amount: number, accountId: string) => void;
}

const SettleModal: React.FC<SettleModalProps> = ({ isOpen, bookingId, mode, currentPaid, maxAmount, accounts, onClose, onConfirm }) => {
    const [amount, setAmount] = useState(0);
    const [accountId, setAccountId] = useState('');

    useEffect(() => {
        if (isOpen) {
            setAmount(mode === 'PAYMENT' ? maxAmount : 0);
            setAccountId(accounts[0]?.id || '');
        }
    }, [isOpen, mode, maxAmount, accounts]);

    if (!isOpen || !bookingId) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <Motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-lumina-surface border border-lumina-highlight w-full max-w-md rounded-2xl p-6 shadow-2xl">
               <div className="flex justify-between items-center mb-4">
                   <h2 className={`text-2xl font-display font-bold ${mode === 'REFUND' ? 'text-rose-500' : 'text-emerald-400'}`}>
                       {mode === 'REFUND' ? 'Process Refund' : 'Receive Payment'}
                   </h2>
                   <button onClick={onClose}><RotateCcw size={18} className="text-lumina-muted"/></button>
               </div>
               <div className="space-y-4">
                    <div className="p-3 bg-lumina-base border border-lumina-highlight rounded-lg mb-4 flex justify-between items-center">
                         <span className="text-xs text-lumina-muted font-bold uppercase">Current Paid:</span>
                         <span className="font-mono font-bold text-white">Rp {currentPaid.toLocaleString('id-ID')}</span>
                    </div>
                    <div>
                        <label className="text-xs uppercase tracking-wider text-lumina-muted mb-1 block">Amount (Positive Value)</label>
                         <div className="relative">
                           <span className="absolute left-3 top-3 text-lumina-muted font-bold">Rp</span>
                           <input type="number" min="0" value={amount} onChange={e => setAmount(Number(e.target.value))} className={`w-full bg-lumina-base border rounded-lg p-3 pl-10 text-white font-mono focus:outline-none ${mode === 'REFUND' ? 'border-rose-500/50 focus:border-rose-500' : 'border-emerald-500/50 focus:border-emerald-500'}`} />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs uppercase tracking-wider text-lumina-muted mb-1 block">{mode === 'REFUND' ? 'Refund From Account' : 'Deposit To Account'}</label>
                        <select value={accountId} onChange={e => setAccountId(e.target.value)} className="w-full bg-lumina-base border border-lumina-highlight rounded-lg p-3 text-white focus:outline-none focus:border-lumina-accent">
                            {accounts.map(a => <option key={a.id} value={a.id}>{a.name} (Rp {a.balance.toLocaleString()})</option>)}
                        </select>
                    </div>
               </div>
               <div className="grid grid-cols-2 gap-3 mt-8">
                  <button onClick={onClose} className="py-3 text-lumina-muted font-bold hover:text-white transition-colors">CANCEL</button>
                  <button onClick={() => onConfirm(amount, accountId)} className={`py-3 text-white rounded-xl font-bold transition-colors shadow-lg ${mode === 'REFUND' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'}`}>CONFIRM</button>
               </div>
            </Motion.div>
        </div>
    );
};

export default SettleModal;
