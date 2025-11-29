
import React from 'react';
import { motion } from 'framer-motion';
import { User, Booking, Transaction } from '../../types';
import { Edit2, Trash2, Award, Mail, Phone, Calendar, TrendingUp, Coins, DollarSign } from 'lucide-react';

const Motion = motion as any;

interface TeamMemberCardProps {
    user: User;
    index: number;
    bookings: Booking[];
    transactions?: Transaction[];
    onEdit: (user: User) => void;
    onDelete: (user: User) => void;
    onViewSchedule: (user: User) => void;
    onManageAvailability: (user: User) => void;
    onPayout: (user: User, amount: number) => void;
    getRevenueGenerated: (user: User) => number;
    getEstimatedCommission: (user: User) => number;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ user, index, bookings, transactions = [], onEdit, onDelete, onViewSchedule, onManageAvailability, onPayout, getRevenueGenerated, getEstimatedCommission }) => {
    
    const getActiveJobs = (userId: string) => bookings.filter(b => (b.photographerId === userId || b.editorId === userId) && b.status !== 'COMPLETED').length;
    const getCompletedJobs = (userId: string) => bookings.filter(b => (b.photographerId === userId || b.editorId === userId) && b.status === 'COMPLETED').length;

    // Calculate Financials Ledger
    const totalCommissionEarned = getEstimatedCommission(user);
    
    const totalCommissionPaid = transactions
        .filter(t => t.type === 'EXPENSE' && t.recipientId === user.id)
        .reduce((sum, t) => sum + t.amount, 0);

    const outstandingBalance = Math.max(0, totalCommissionEarned - totalCommissionPaid);

    return (
        <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-lumina-surface border border-lumina-highlight rounded-2xl overflow-hidden group hover:border-lumina-accent/30 transition-all relative"
        >
            <div className="absolute top-4 right-4 z-10 flex gap-2">
                <button onClick={() => onEdit(user)} className="p-1.5 bg-lumina-base rounded text-lumina-muted hover:text-white border border-lumina-highlight hover:border-white">
                    <Edit2 size={14} />
                </button>
                {user.role !== 'OWNER' && (
                    <button onClick={() => onDelete(user)} className="p-1.5 bg-lumina-base rounded text-lumina-muted hover:text-rose-400 border border-lumina-highlight hover:border-rose-400">
                        <Trash2 size={14} />
                    </button>
                )}
            </div>

            {/* Header Card */}
            <div className="p-6 relative">
                <div className="mb-4">
                    <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase border tracking-wider
                        ${user.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        user.status === 'ON_LEAVE' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                        'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                        {(user.status || 'ACTIVE').replace('_', ' ')}
                    </span>
                </div>

                <div className="flex items-center gap-4 mb-4">
                    <img src={user.avatar} className="w-16 h-16 rounded-full border-2 border-lumina-highlight group-hover:border-lumina-accent transition-colors" alt={user.name} />
                    <div>
                        <h3 className="text-xl font-bold text-white">{user.name}</h3>
                        <p className="text-sm text-lumina-accent font-mono">{user.role}</p>
                    </div>
                </div>

                {user.specialization && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-lumina-base rounded-full border border-lumina-highlight mb-4">
                        <Award size={12} className="text-lumina-muted" />
                        <span className="text-xs text-white">{user.specialization}</span>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="bg-lumina-base/50 p-2 rounded-lg text-center border border-lumina-highlight/30">
                        <span className="block text-xl font-bold text-white">{getActiveJobs(user.id)}</span>
                        <span className="text-[10px] uppercase text-lumina-muted">Active Jobs</span>
                    </div>
                    <div className="bg-lumina-base/50 p-2 rounded-lg text-center border border-lumina-highlight/30">
                        <span className="block text-xl font-bold text-white">{getCompletedJobs(user.id)}</span>
                        <span className="text-[10px] uppercase text-lumina-muted">Completed</span>
                    </div>
                </div>
            </div>

            {/* Revenue/Commission Insight */}
            {user.role !== 'OWNER' && (
                <div className="px-6 py-3 bg-gradient-to-r from-lumina-highlight/20 to-transparent border-t border-lumina-highlight/50 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-lumina-muted">
                                <TrendingUp size={12} className="text-emerald-400" />
                                <span>Net Sales</span>
                            </div>
                            <span className="text-sm font-mono font-bold text-emerald-400">
                                Rp {getRevenueGenerated(user).toLocaleString('id-ID', { notation: "compact" })}
                            </span>
                        </div>
                        
                        <div className="border-t border-lumina-highlight/30 pt-2">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-lumina-muted flex items-center gap-1">
                                    <Coins size={12} /> Outstanding Commission
                                </span>
                                <span className={`text-sm font-mono font-bold ${outstandingBalance > 0 ? 'text-amber-400' : 'text-lumina-muted'}`}>
                                    Rp {outstandingBalance.toLocaleString('id-ID', { notation: "compact" })}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-lumina-muted/50 mb-2">
                                <span>Lifetime Earned: {totalCommissionEarned.toLocaleString('id-ID', {notation: "compact"})}</span>
                                <span>Paid: {totalCommissionPaid.toLocaleString('id-ID', {notation: "compact"})}</span>
                            </div>
                            
                            <button 
                                onClick={() => onPayout(user, outstandingBalance)}
                                disabled={outstandingBalance <= 0}
                                className={`w-full py-1.5 text-xs font-bold rounded flex items-center justify-center gap-2 transition-colors
                                    ${outstandingBalance > 0 
                                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
                                        : 'bg-lumina-base border border-lumina-highlight text-lumina-muted cursor-not-allowed opacity-50'}
                                `}
                            >
                                <DollarSign size={12}/> {outstandingBalance > 0 ? 'PAYOUT NOW' : 'SETTLED'}
                            </button>
                        </div>
                </div>
            )}

            {/* Info List */}
            <div className="px-6 py-4 bg-lumina-base/30 border-t border-lumina-highlight space-y-3">
                <div className="flex items-center gap-3 text-sm text-lumina-muted hover:text-white transition-colors">
                    <Mail size={14} />
                    <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-lumina-muted hover:text-white transition-colors">
                    <Phone size={14} />
                    <span>{user.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-lumina-muted">
                    <Calendar size={14} />
                    <span>Joined {new Date(user.joinedDate).toLocaleDateString()}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-lumina-base border-t border-lumina-highlight grid grid-cols-2 gap-3">
                <button 
                    onClick={() => onViewSchedule(user)}
                    className="py-2 text-xs font-bold text-lumina-muted border border-lumina-highlight rounded-lg hover:bg-lumina-highlight hover:text-white transition-colors"
                >
                    View Schedule
                </button>
                <button 
                    onClick={() => onManageAvailability(user)}
                    className="py-2 text-xs font-bold text-lumina-muted border border-lumina-highlight rounded-lg hover:bg-lumina-highlight hover:text-white transition-colors"
                >
                    Manage Availability
                </button>
            </div>
        </Motion.div>
    );
};

export default TeamMemberCard;
