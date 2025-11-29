
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Repeat, Upload, Check, Loader2, Image as ImageIcon } from 'lucide-react';
import { Account } from '../../../types';
import { uploadFile } from '../../../utils/storageUtils';

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
    const [isUploading, setIsUploading] = useState(false);

    if (!isOpen) return null;

    const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIsUploading(true);
            try {
                const file = e.target.files[0];
                const url = await uploadFile(file, 'receipts');
                setForm(prev => ({ ...prev, receiptUrl: url }));
            } catch (error) {
                alert("Failed to upload receipt.");
            } finally {
                setIsUploading(false);
            }
        }
    };

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
                    
                    <div className="flex items-center gap-3">
                        <div className="flex-1 relative">
                            <input type="file" id="receipt-upload" className="hidden" accept="image/*,application/pdf" onChange={handleReceiptUpload} disabled={isUploading} />
                            <label 
                                htmlFor="receipt-upload" 
                                className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed cursor-pointer transition-colors ${form.receiptUrl ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' : 'border-lumina-highlight bg-lumina-base hover:bg-lumina-highlight text-lumina-muted'}`}
                            >
                                {isUploading ? <Loader2 size={16} className="animate-spin"/> : form.receiptUrl ? <Check size={16}/> : <Upload size={16}/>}
                                <span className="text-xs font-bold">{form.receiptUrl ? 'Receipt Attached' : 'Upload Receipt'}</span>
                            </label>
                        </div>
                        {form.receiptUrl && (
                            <a href={form.receiptUrl} target="_blank" className="p-3 bg-lumina-base border border-lumina-highlight rounded-lg text-lumina-muted hover:text-white" title="View Receipt">
                                <ImageIcon size={16} />
                            </a>
                        )}
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
                        <button onClick={handleSubmit} disabled={isUploading} className="flex-1 py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 disabled:opacity-50">
                            Save Expense
                        </button>
                    </div>
                </div>
            </Motion.div>
        </div>
    );
};

export default ExpenseModal;
