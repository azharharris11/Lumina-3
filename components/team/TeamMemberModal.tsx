
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Role } from '../../types';
import { X } from 'lucide-react';

const Motion = motion as any;

interface TeamMemberModalProps {
    isOpen: boolean;
    isEdit: boolean;
    initialData?: Partial<User>;
    onClose: () => void;
    onSave: (data: Partial<User>) => void;
}

const TeamMemberModal: React.FC<TeamMemberModalProps> = ({ isOpen, isEdit, initialData, onClose, onSave }) => {
    const [userForm, setUserForm] = useState<Partial<User>>({
        name: '', email: '', phone: '', role: 'PHOTOGRAPHER', status: 'ACTIVE', specialization: ''
    });

    useEffect(() => {
        if (isOpen) {
            setUserForm(initialData || { name: '', email: '', phone: '', role: 'PHOTOGRAPHER', status: 'ACTIVE', specialization: '' });
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(userForm);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <Motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <Motion.div 
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-lumina-surface border border-lumina-highlight w-full max-w-md rounded-2xl p-6 shadow-2xl"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">{isEdit ? 'Edit Staff Profile' : 'Add New Staff'}</h2>
                    <button onClick={onClose}><X className="text-lumina-muted hover:text-white" /></button>
                </div>
                
                <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                    <div>
                        <label className="block text-xs text-lumina-muted mb-1 font-bold">Full Name</label>
                        <input type="text" className="w-full bg-lumina-base border border-lumina-highlight rounded-lg p-2 text-white"
                            value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-lumina-muted mb-1 font-bold">Role</label>
                            <select className="w-full bg-lumina-base border border-lumina-highlight rounded-lg p-2 text-white"
                                value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value as Role})}
                            >
                                <option value="PHOTOGRAPHER">Photographer</option>
                                <option value="EDITOR">Editor</option>
                                <option value="ADMIN">Admin</option>
                                <option value="FINANCE">Finance</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-lumina-muted mb-1 font-bold">Status</label>
                            <select className="w-full bg-lumina-base border border-lumina-highlight rounded-lg p-2 text-white"
                                value={userForm.status} onChange={e => setUserForm({...userForm, status: e.target.value as any})}
                            >
                                <option value="ACTIVE">Active</option>
                                <option value="ON_LEAVE">On Leave</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-lumina-muted mb-1 font-bold">Specialization</label>
                        <input type="text" className="w-full bg-lumina-base border border-lumina-highlight rounded-lg p-2 text-white"
                            placeholder="e.g. Wedding" value={userForm.specialization} onChange={e => setUserForm({...userForm, specialization: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-lumina-muted mb-1 font-bold">Email</label>
                        <input type="email" className="w-full bg-lumina-base border border-lumina-highlight rounded-lg p-2 text-white"
                            value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})}
                        />
                    </div>
                        <div>
                        <label className="block text-xs text-lumina-muted mb-1 font-bold">Phone</label>
                        <input type="text" className="w-full bg-lumina-base border border-lumina-highlight rounded-lg p-2 text-white"
                            value={userForm.phone} onChange={e => setUserForm({...userForm, phone: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-lumina-muted mb-1 font-bold">Commission Rate (%)</label>
                        <input type="number" className="w-full bg-lumina-base border border-lumina-highlight rounded-lg p-2 text-white"
                            value={userForm.commissionRate} onChange={e => setUserForm({...userForm, commissionRate: Number(e.target.value)})}
                        />
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-lumina-muted font-bold">Cancel</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-lumina-accent text-lumina-base font-bold rounded-lg">{isEdit ? 'Save Changes' : 'Add Member'}</button>
                </div>
            </Motion.div>
        </div>
    );
};

export default TeamMemberModal;
