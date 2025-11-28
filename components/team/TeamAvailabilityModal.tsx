
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User } from '../../types';
import { X, Trash2 } from 'lucide-react';

const Motion = motion as any;

interface TeamAvailabilityModalProps {
    isOpen: boolean;
    user: User | null;
    onClose: () => void;
    onUpdateUser: (user: User) => void;
}

const TeamAvailabilityModal: React.FC<TeamAvailabilityModalProps> = ({ isOpen, user, onClose, onUpdateUser }) => {
    const [blockDate, setBlockDate] = useState('');

    if (!isOpen || !user) return null;

    const handleBlockDate = () => {
        if (blockDate && onUpdateUser) {
            const currentDates = user.unavailableDates || [];
            if (!currentDates.includes(blockDate)) {
                const updatedUser = {
                    ...user,
                    unavailableDates: [...currentDates, blockDate].sort()
                };
                onUpdateUser(updatedUser);
                setBlockDate('');
            }
        }
    };

    const handleUnblockDate = (dateToRemove: string) => {
        if (onUpdateUser) {
            const updatedUser = {
                ...user,
                unavailableDates: (user.unavailableDates || []).filter(d => d !== dateToRemove)
            };
            onUpdateUser(updatedUser);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <Motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <Motion.div 
                initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.95, opacity:0}}
                className="relative bg-lumina-surface border border-lumina-highlight w-full max-w-md rounded-2xl p-6 shadow-2xl"
            >
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-white">Availability Manager</h2>
                        <p className="text-sm text-lumina-muted">Manage off-days for {user.name.split(' ')[0]}</p>
                    </div>
                    <button onClick={onClose}><X className="text-lumina-muted hover:text-white"/></button>
                </div>

                <div className="space-y-4">
                        <div className="p-4 bg-lumina-base border border-lumina-highlight rounded-xl flex items-center gap-3">
                            <input 
                                type="date" 
                                className="bg-lumina-surface border border-lumina-highlight text-white p-2 rounded-lg text-sm flex-1 outline-none focus:border-lumina-accent"
                                value={blockDate}
                                onChange={e => setBlockDate(e.target.value)}
                            />
                            <button 
                                onClick={handleBlockDate}
                                disabled={!blockDate}
                                className="px-4 py-2 bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500 hover:text-white rounded-lg font-bold text-sm transition-colors disabled:opacity-50"
                            >
                                Block Date
                            </button>
                        </div>

                        <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-2">
                            <h4 className="text-xs font-bold text-lumina-muted uppercase">Blocked Dates (Off-Days)</h4>
                            {(user.unavailableDates || []).length === 0 && (
                                <p className="text-sm text-lumina-muted italic">No dates blocked.</p>
                            )}
                            {(user.unavailableDates || []).map(date => (
                                <div key={date} className="flex justify-between items-center p-3 bg-lumina-base border border-lumina-highlight rounded-lg">
                                    <span className="text-sm text-white font-mono">{new Date(date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                    <button onClick={() => handleUnblockDate(date)} className="text-lumina-muted hover:text-white">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                </div>
            </Motion.div>
        </div>
    );
};

export default TeamAvailabilityModal;
