
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Repeat } from 'lucide-react';
import { Account } from '../../../types';

const Motion = motion as any;

interface ExpenseModalProps {
    isOpen: boolean;
    accounts: Account[];
    categories: string[];
    onClose: () => void;
    onRecordExpense: (data: any) => void;
}

const ExpenseModal: React.FC<ExpenseModalProps> = ({ isOpen, accounts, categories, onClose, onRecordExpense }) => {
    const [form, setForm] = useState({
        description: '',
        amount: '',
        category: categories[0] || 'Other',
        accountId: accounts[0]?.id || '',
        isRecurring: false,
        receiptUrl: ''
    });

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (form.amount && form.description) {
            onRecordExpense({
                description: form.description,
                amount: Number(form.amount),
                category: form.category,
                accountId: form.accountId,
                isRecurring: form.isRecurring,
                receiptUrl: form.receiptUrl
            });
            onClose();
            setForm({ description: '', amount: '', category: categories[0] || 'Other', accountId: accounts[0]?.id || '', isRecurring: false, receiptUrl: '' });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <Motion.div initial={{scale:0.95}} animate={{scale:1}} className="bg-lumina-surface border border-lumina-highlight w-full max-w-md rounded-2xl p-6 shadow-2xl">
                <h2 className="text-xl font-bold text-white mb-4">Record Expense</h2>
                <div className="space-y-4">
                    <input className="w-full bg-lumina-base border border-lumina-highlight rounded-lg p-3 text-white" placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" className="w-full bg-lumina-base border border-lumina-highlight rounded-lg p-3 text-white" placeholder="Amount" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
                        <select className="w-full bg-lumina-base border border-lumina-highlight rounded-lg p-3 text-white" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-lumina-base rounded-lg border border-lumina-highlight">
                        <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                            <input type="checkbox" checked={form.isRecurring} onChange={e => setForm({...form, isRecurring: e.target.checked})} className="rounded bg-lumina-surface border-lumina-highlight text-lumina-accent"/>
                            <span>Recurring Monthly</span>
                        </label>
                        <Repeat size={16} className="text-lumina-muted"/>
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button onClick={onClose} className="flex-1 py-3 text-lumina-muted font-bold">Cancel</button>
                        <button onClick={handleSubmit} className="flex-1 py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600">Save Expense</button>
                    </div>
                </div>
            </Motion.div>
        </div>
    );
};

export default ExpenseModal;
