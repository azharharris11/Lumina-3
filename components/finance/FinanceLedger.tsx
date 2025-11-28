
import React from 'react';
import { motion } from 'framer-motion';
import { Paperclip, Trash2 } from 'lucide-react';
import { Transaction, Account } from '../../types';

const Motion = motion as any;

interface FinanceLedgerProps {
    transactions: Transaction[];
    accounts: Account[];
    onDeleteTransaction?: (id: string) => void;
}

const FinanceLedger: React.FC<FinanceLedgerProps> = ({ transactions, accounts, onDeleteTransaction }) => {
    return (
        <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-lumina-surface border border-lumina-highlight rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[800px]">
                    <thead className="bg-lumina-base text-lumina-muted uppercase text-xs font-bold">
                        <tr>
                            <th className="p-4">Date</th>
                            <th className="p-4">Description</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Account</th>
                            <th className="p-4 text-right">Amount</th>
                            <th className="p-4 text-center">Receipt</th>
                            <th className="p-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-lumina-highlight/50">
                        {transactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => (
                            <tr key={t.id} className="hover:bg-lumina-highlight/10 transition-colors group">
                                <td className="p-4 font-mono text-xs text-lumina-muted">{new Date(t.date).toLocaleDateString()}</td>
                                <td className="p-4 font-bold text-white">{t.description}</td>
                                <td className="p-4">
                                    <span className="px-2 py-1 rounded bg-lumina-highlight text-xs text-lumina-muted">{t.category}</span>
                                </td>
                                <td className="p-4 text-xs text-lumina-muted">
                                    {accounts.find(a => a.id === t.accountId)?.name}
                                </td>
                                <td className={`p-4 text-right font-mono font-bold ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {t.type === 'INCOME' ? '+' : '-'} Rp {t.amount.toLocaleString()}
                                </td>
                                <td className="p-4 text-center">
                                    {t.receiptUrl ? (
                                        <a href={t.receiptUrl} target="_blank" className="text-blue-400 hover:underline text-xs flex items-center justify-center gap-1">
                                            <Paperclip size={12}/> View
                                        </a>
                                    ) : <span className="text-lumina-muted/30">-</span>}
                                </td>
                                <td className="p-4 text-right">
                                    <button onClick={() => onDeleteTransaction && onDeleteTransaction(t.id)} className="text-lumina-muted hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 size={14}/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Motion.div>
    );
};

export default FinanceLedger;
