
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { History, Edit2, Plus } from 'lucide-react';
import { Account, Transaction } from '../../types';

const Motion = motion as any;

interface FinanceOverviewProps {
    accounts: Account[];
    transactions: Transaction[];
    onEditAccount: (acc: Account) => void;
    onAddAccount: () => void;
}

const FinanceOverview: React.FC<FinanceOverviewProps> = ({ accounts, transactions, onEditAccount, onAddAccount }) => {
    
    const cashFlowData = useMemo(() => {
        const dataMap = new Map<string, { date: string, income: number, expense: number }>();
        transactions.forEach(t => {
            const dateKey = new Date(t.date).toLocaleDateString('en-CA'); 
            const entry = dataMap.get(dateKey) || { date: dateKey, income: 0, expense: 0 };
            if (t.type === 'INCOME') entry.income += t.amount;
            if (t.type === 'EXPENSE') entry.expense += t.amount;
            dataMap.set(dateKey, entry);
        });
        const result = Array.from(dataMap.values()).sort((a, b) => a.date.localeCompare(b.date));
        return result.slice(-14);
    }, [transactions]);

    return (
        <Motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {accounts.map((acc) => (
                <Motion.div 
                    key={acc.id}
                    whileHover={{ y: -2 }}
                    className="p-5 rounded-2xl border bg-lumina-surface border-lumina-highlight relative overflow-hidden group transition-all"
                >
                    <div className="flex justify-between items-center mb-4">
                        <span className={`text-[10px] font-bold tracking-wider px-2 py-1 rounded border uppercase 
                            ${acc.type === 'CASH' ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' : 'text-blue-400 border-blue-500/30 bg-blue-500/10'}`}>
                            {(acc.type || 'BANK').replace('_', ' ')}
                        </span>
                        <div className="flex gap-2">
                            <button onClick={() => onEditAccount(acc)} className="p-1 hover:bg-lumina-highlight rounded text-lumina-muted hover:text-white transition-colors" title="Edit Account">
                                <Edit2 size={14} />
                            </button>
                        </div>
                    </div>
                    <h3 className="text-lumina-muted text-sm">{acc.name}</h3>
                    <p className="text-2xl font-display font-bold text-white mt-1">
                        Rp {acc.balance.toLocaleString('id-ID')}
                    </p>
                    <p className="text-xs text-lumina-muted mt-1 font-mono">{acc.accountNumber}</p>
                </Motion.div>
                ))}
                
                <button
                    onClick={onAddAccount}
                    className="p-5 rounded-2xl border border-dashed border-lumina-highlight hover:border-lumina-accent hover:bg-lumina-highlight/10 flex flex-col items-center justify-center transition-all group min-h-[160px]"
                >
                    <div className="w-12 h-12 rounded-full bg-lumina-highlight/50 flex items-center justify-center mb-3 group-hover:bg-lumina-accent group-hover:text-lumina-base transition-colors">
                        <Plus size={24} className="text-lumina-muted group-hover:text-lumina-base" />
                    </div>
                    <span className="text-sm font-bold text-lumina-muted group-hover:text-white">Add New Account</span>
                </button>
            </div>

            <div className="bg-lumina-surface border border-lumina-highlight rounded-2xl p-4 lg:p-6">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><History size={18} className="text-lumina-accent"/> Cash Flow (14 Days)</h3>
                <div className="h-48 lg:h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={cashFlowData}>
                            <defs>
                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis dataKey="date" stroke="#666" fontSize={12} tickFormatter={(str) => new Date(str).getDate().toString()} />
                            <YAxis stroke="#666" fontSize={12} tickFormatter={(val) => `${val/1000000}m`} />
                            <Tooltip contentStyle={{ backgroundColor: '#1c1917', border: '1px solid #333', color: '#fff' }} />
                            <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
                            <Area type="monotone" dataKey="expense" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExpense)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </Motion.div>
    );
};

export default FinanceOverview;
