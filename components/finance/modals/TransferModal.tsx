
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightLeft } from 'lucide-react';
import { Account } from '../../../types';

const Motion = motion as any;

interface TransferModalProps {
    isOpen: boolean;
    accounts: Account[];
    onClose: () => void;
    onTransfer: (fromId: string, toId: string, amount: number) => void;
}

const TransferModal: React.FC<TransferModalProps> = ({ isOpen, accounts, onClose, onTransfer }) => {
    const [form, setForm] = useState({ 
        fromId: accounts[0]?.id || '', 
        toId: accounts[1]?.id || '', 
        amount: '' 
    });

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (form.amount && Number(form.amount) > 0) {
            onTransfer(form.fromId, form.toId, Number(form.amount));
            onClose();
            setForm(prev => ({ ...prev, amount: '' }));
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <Motion.div initial={{scale:0.95}} animate={{scale:1}} className="bg-lumina-surface border border-lumina-highlight w-full max-w-md rounded-2xl p-6 shadow-2xl">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><ArrowRightLeft className="text-lumina-accent"/> Transfer Funds</h2>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-lumina-muted uppercase font-bold block mb-1">From</label>
                            <select className="w-full bg-lumina-base border border-lumina-highlight rounded-lg p-2 text-white text-sm" value={form.fromId} onChange={e => setForm({...form, fromId: e.target.value})}>
                                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-lumina-muted uppercase font-bold block mb-1">To</label>
                            <select className="w-full bg-lumina-base border border-lumina-highlight rounded-lg p-2 text-white text-sm" value={form.toId} onChange={e => setForm({...form, toId: e.target.value})}>
                                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-lumina-muted uppercase font-bold block mb-1">Amount</label>
                        <input type="number" className="w-full bg-lumina-base border border-lumina-highlight rounded-lg p-3 text-white font-mono text-lg" placeholder="0" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button onClick={onClose} className="flex-1 py-3 text-lumina-muted font-bold">Cancel</button>
                        <button onClick={handleSubmit} className="flex-1 py-3 bg-lumina-accent text-lumina-base font-bold rounded-xl hover:bg-lumina-accent/90">Confirm Transfer</button>
                    </div>
                </div>
            </Motion.div>
        </div>
    );
};

export default TransferModal;
