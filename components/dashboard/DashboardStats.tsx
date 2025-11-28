
import React from 'react';
import { Users, TrendingUp, ImageIcon, Clock } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string;
    icon: any;
    trend?: string;
    trendDown?: boolean;
    highlight?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, trendDown, highlight }) => (
  <div className={`p-4 lg:p-6 rounded-2xl border transition-all shadow-sm ${highlight ? 'bg-gradient-to-br from-lumina-highlight to-lumina-surface border-lumina-accent/50 shadow-lg shadow-lumina-accent/5' : 'bg-lumina-surface border-lumina-highlight'}`}>
    <div className="flex justify-between items-start mb-3 lg:mb-4">
      <div>
        <p className="text-[10px] lg:text-xs font-bold text-lumina-muted uppercase tracking-wider">{title}</p>
        <h3 className={`text-xl lg:text-2xl font-display font-bold mt-1 ${highlight ? 'text-lumina-accent' : 'text-lumina-text'}`}>{value}</h3>
      </div>
      <div className={`p-1.5 lg:p-2 rounded-lg ${highlight ? 'bg-lumina-accent/20 text-lumina-accent' : 'bg-lumina-base text-lumina-muted'}`}>
        <Icon size={18} />
      </div>
    </div>
    {trend && (
      <div className="flex items-center gap-2">
        <span className={`text-[10px] lg:text-xs font-bold px-1.5 py-0.5 rounded ${trendDown ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
          {trend}
        </span>
      </div>
    )}
  </div>
);

interface DashboardStatsProps {
    todayBookingsCount: number;
    revenueThisMonth: number;
    pendingEditsCount: number;
    utilizationRate: number;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ todayBookingsCount, revenueThisMonth, pendingEditsCount, utilizationRate }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            <StatCard 
            title="Sessions Today" 
            value={todayBookingsCount.toString()} 
            icon={Users} 
            trend={todayBookingsCount > 0 ? "+1" : "0"} 
            />
            <StatCard 
            title="Cash Collected" 
            value={`Rp ${(revenueThisMonth / 1000000).toFixed(1)}M`} 
            icon={TrendingUp} 
            trend="Realized" 
            highlight
            />
            <StatCard 
            title="In Production" 
            value={pendingEditsCount.toString()} 
            icon={ImageIcon} 
            trend={pendingEditsCount > 5 ? "Busy" : "Normal"} 
            trendDown={pendingEditsCount > 5}
            />
            <StatCard 
            title="Studio Util." 
            value={`${utilizationRate}%`} 
            icon={Clock} 
            trend="Capacity" 
            />
        </div>
    );
};

export default DashboardStats;
