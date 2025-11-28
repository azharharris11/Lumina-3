
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Asset, User } from '../../types';
import { User as UserIcon, Calendar, FileText } from 'lucide-react';

const Motion = motion as any;

interface InventoryActionModalProps {
    asset: Asset | null;
    type: 'CHECK_OUT' | 'MAINTENANCE' | null;
    users: User[];
    onClose: () => void;
    onConfirm: (asset: Asset, form: { userId: string, returnDate: string, notes: string }) => void;
}

const InventoryActionModal: React.FC<InventoryActionModalProps> = ({ asset, type, users, onClose, onConfirm }) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const [form, setForm] = useState({ 
        userId: users[0]?.id || '', 
        returnDate: tomorrow.toISOString().split('T')[0], 
        notes: '' 
    });

    if (!asset || !type) return null;

    const handleSubmit = () => {
        onConfirm(asset, form);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <Motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-lumina-surface border border-lumina-highlight w-full max-w-md rounded-2xl p-6 shadow-2xl"
            >
                <h2 className="text-xl font-bold text-white mb-2">
                    {type === 'CHECK_OUT' ? 'Check Out Equipment' : 'Report Issue / Maintenance'}
                </h2>
                <p className="text-sm text-lumina-muted mb-6">Updating status for <span className="text-white font-bold">{asset.name}</span></p>

                <div className="space-y-4">
                    {type === 'CHECK_OUT' && (
                        <>
                        <div>
                            <label className="text-xs uppercase text-lumina-muted font-bold block mb-1"><UserIcon size={12} className="inline mr-1"/> Assign To</label>
                            <select className="w-full bg-lumina-base border border-lumina-highlight rounded-lg p-3 text-white focus:border-lumina-accent outline-none"
                                value={form.userId} onChange={e => setForm({...form, userId: e.target.value})}
                            >
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs uppercase text-lumina-muted font-bold block mb-1"><Calendar size={12} className="inline mr-1"/> Expected Return</label>
                            <input type="date" className="w-full bg-lumina-base border border-lumina-highlight rounded-lg p-3 text-white focus:border-lumina-accent outline-none"
                                value={form.returnDate} onChange={e => setForm({...form, returnDate: e.target.value})}
                            />
                        </div>
                        </>
                    )}

                    {type === 'MAINTENANCE' && (
                        <div>
                            <label className="text-xs uppercase text-lumina-muted font-bold block mb-1"><FileText size={12} className="inline mr-1"/> Issue Details</label>
                            <textarea className="w-full bg-lumina-base border border-lumina-highlight rounded-lg p-3 text-white focus:border-lumina-accent outline-none min-h-[100px]"
                                placeholder="Describe the damage or maintenance reason..."
                                value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 mt-6">
                        <button type="button" onClick={onClose} className="py-3 text-lumina-muted font-bold hover:text-white transition-colors">
                            Cancel
                        </button>
                        <button type="button" onClick={handleSubmit} className={`py-3 rounded-xl font-bold text-white transition-colors shadow-lg
                            ${type === 'CHECK_OUT' ? 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/20' : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'}`}>
                            Confirm Update
                        </button>
                    </div>
                </div>
            </Motion.div>
        </div>
    );
};

export default InventoryActionModal;
