
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Transaction } from '../../types';

const Motion = motion as any;

interface FinanceAnalysisProps {
    transactions: Transaction[];
}

const FinanceAnalysis: React.FC<FinanceAnalysisProps> = ({ transactions }) => {
    const expenseBreakdown = useMemo(() => {
        const breakdown = new Map<string, number>();
        transactions.filter(t => t.type === 'EXPENSE').forEach(t => {
              const cat = t.category || 'Other';
              breakdown.set(cat, (breakdown.get(cat) || 0) + t.amount);
        });
        const colors = ['#f43f5e', '#f59e0b', '#3b82f6', '#a855f7', '#10b981', '#6366f1'];
        return Array.from(breakdown.entries()).map(([name, value], index) => ({
            name, value, color: colors[index % colors.length]
        }));
    }, [transactions]);

    return (
        <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
             <div className="bg-lumina-surface border border-lumina-highlight rounded-2xl p-6 flex justify-center min-h-[400px]">
                {expenseBreakdown.length > 0 ? (
                    <div className="w-full max-w-md h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={expenseBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                                    {expenseBreakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1c1917', borderRadius: '8px', border: '1px solid #333', color: '#fff' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="grid grid-cols-2 gap-2 mt-4">
                            {expenseBreakdown.map((entry, index) => (
                                <div key={index} className="flex items-center gap-2 text-xs">
                                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: entry.color}}></div>
                                    <span className="text-lumina-muted truncate">{entry.name}</span>
                                    <span className="text-white font-mono ml-auto">{(entry.value / 1000).toFixed(0)}k</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center text-lumina-muted">No expense data to analyze.</div>
                )}
             </div>
         </Motion.div>
    );
};

export default FinanceAnalysis;
