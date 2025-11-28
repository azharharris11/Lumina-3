
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Account } from '../../../types';

const Motion = motion as any;

interface AccountModalProps {
    isOpen: boolean;
    initialData: Account | null;
    onClose: () => void;
    onSave: (data: Partial<Account>) => void;
}

const AccountModal: React.FC<AccountModalProps> = ({ isOpen, initialData, onClose, onSave }) => {
    const [form, setForm] = useState<Partial<Account>>({ name: '', type: 'BANK', balance: 0, accountNumber: '' });

    useEffect(() => {
        if (isOpen) {
            setForm(initialData ? { ...initialData } : { name: '', type: 'BANK', balance: 0, accountNumber: '' });
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <Motion.div initial={{scale:0.95}} animate={{scale:1}} className="bg-lumina-surface border border-lumina-highlight w-full max-w-md rounded-2xl p-6 shadow-2xl">
                <h2 className="text-xl font-bold text-white mb-4">{initialData ? 'Edit Account' : 'Add Account'}</h2>
                <div className="space-y-4">
                    <input className="w-full bg-lumina-base border border-lumina-highlight rounded-lg p-3 text-white" placeholder="Account Name (e.g. BCA Main)" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                    <input className="w-full bg-lumina-base border border-lumina-highlight rounded-lg p-3 text-white" placeholder="Account Number / Info" value={form.accountNumber} onChange={e => setForm({...form, accountNumber: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                        <select className="w-full bg-lumina-base border border-lumina-highlight rounded-lg p-3 text-white" value={form.type} onChange={e => setForm({...form, type: e.target.value as any})}>
                            <option value="BANK">Bank Account</option>
                            <option value="CASH">Cash / Petty</option>
                        </select>
                        <input type="number" className="w-full bg-lumina-base border border-lumina-highlight rounded-lg p-3 text-white" placeholder="Initial Balance" value={form.balance} onChange={e => setForm({...form, balance: Number(e.target.value)})} />
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button onClick={onClose} className="flex-1 py-3 text-lumina-muted font-bold">Cancel</button>
                        <button onClick={() => onSave(form)} className="flex-1 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600">Save Account</button>
                    </div>
                </div>
            </Motion.div>
        </div>
    );
};

export default AccountModal;
