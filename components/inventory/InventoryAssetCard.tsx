
import React from 'react';
import { motion } from 'framer-motion';
import { Asset } from '../../types';
import { CheckCircle2, LogOut, Wrench, AlertTriangle, Box, MoreVertical, LogIn, Trash } from 'lucide-react';

const Motion = motion as any;

interface InventoryAssetCardProps {
    asset: Asset;
    index: number;
    assignedUserName?: string;
    activeMenuId: string | null;
    onToggleMenu: (id: string | null) => void;
    onAction: (asset: Asset, type: 'CHECK_OUT' | 'MAINTENANCE' | 'RETURN') => void;
    onDelete: (asset: Asset) => void;
}

const InventoryAssetCard: React.FC<InventoryAssetCardProps> = ({ asset, index, assignedUserName, activeMenuId, onToggleMenu, onAction, onDelete }) => {
    
    const getStatusColor = (status: Asset['status']) => {
        const s = status || 'AVAILABLE';
        switch (s) {
          case 'AVAILABLE': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
          case 'IN_USE': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
          case 'MAINTENANCE': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
          case 'BROKEN': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
          default: return 'text-gray-400';
        }
    };

    const getStatusIcon = (status: Asset['status']) => {
        const s = status || 'AVAILABLE';
        switch (s) {
          case 'AVAILABLE': return CheckCircle2;
          case 'IN_USE': return LogOut;
          case 'MAINTENANCE': return Wrench;
          case 'BROKEN': return AlertTriangle;
          default: return Box;
        }
    };

    const StatusIcon = getStatusIcon(asset.status);

    return (
        <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-lumina-surface border border-lumina-highlight rounded-2xl p-5 hover:border-lumina-accent/50 transition-all group relative flex flex-col"
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg border ${getStatusColor(asset.status)}`}>
                    <StatusIcon size={18} />
                </div>
                <div className="relative">
                    <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onToggleMenu(activeMenuId === asset.id ? null : asset.id); }}
                        className="p-1 text-lumina-muted hover:text-white rounded hover:bg-lumina-highlight"
                    >
                        <MoreVertical size={16} />
                    </button>
                    {activeMenuId === asset.id && (
                        <div 
                            className="absolute right-0 top-full mt-1 w-48 bg-lumina-surface border border-lumina-highlight rounded-lg shadow-2xl z-50 overflow-hidden flex flex-col"
                            onClick={(e) => e.stopPropagation()} 
                        >
                            {asset.status === 'AVAILABLE' && (
                                <button type="button" onClick={() => onAction(asset, 'CHECK_OUT')} className="px-3 py-2 text-left text-xs hover:bg-lumina-highlight text-blue-400 flex items-center gap-2 w-full">
                                    <LogOut size={12}/> Check Out
                                </button>
                            )}
                            {asset.status === 'IN_USE' && (
                                <button type="button" onClick={() => onAction(asset, 'RETURN')} className="px-3 py-2 text-left text-xs hover:bg-lumina-highlight text-emerald-400 flex items-center gap-2 w-full">
                                    <LogIn size={12}/> Return Item
                                </button>
                            )}
                            <button type="button" onClick={() => onAction(asset, 'MAINTENANCE')} className="px-3 py-2 text-left text-xs hover:bg-lumina-highlight text-amber-400 flex items-center gap-2 w-full">
                                <Wrench size={12}/> Report Issue
                            </button>
                            <div className="border-t border-lumina-highlight my-1"></div>
                            <button 
                                type="button" 
                                onClick={() => onDelete(asset)} 
                                className="px-3 py-2 text-left text-xs hover:bg-rose-900/30 text-rose-500 flex items-center gap-2 w-full"
                            >
                                <Trash size={12} className="pointer-events-none"/> Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1">
                <span className="text-[10px] font-mono font-bold tracking-widest text-lumina-muted uppercase bg-lumina-base px-2 py-1 rounded border border-lumina-highlight mb-2 inline-block">
                    {asset.category}
                </span>
                <h3 className="text-white font-bold text-lg mb-1 group-hover:text-lumina-accent transition-colors">{asset.name}</h3>
                <p className="text-xs text-lumina-muted font-mono">SN: {asset.serialNumber || 'N/A'}</p>
            </div>

            <div className="border-t border-lumina-highlight pt-3 mt-4 flex justify-between items-end">
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase text-lumina-muted tracking-wider mb-1">Status</span>
                    <span className={`text-xs font-bold ${asset.status === 'AVAILABLE' ? 'text-emerald-400' : asset.status === 'IN_USE' ? 'text-blue-400' : 'text-rose-400'}`}>
                        {(asset.status || 'AVAILABLE').replace('_', ' ')}
                    </span>
                </div>
                {assignedUserName ? (
                    <div className="text-right">
                        <span className="text-[10px] uppercase text-lumina-muted tracking-wider mb-1">Holder</span>
                        <div className="flex items-center justify-end gap-1">
                            <span className="text-xs font-bold text-white">{assignedUserName.split(' ')[0]}</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-lumina-accent animate-pulse"></div>
                        </div>
                    </div>
                ) : asset.status === 'MAINTENANCE' && asset.notes ? (
                        <div className="text-right max-w-[50%]">
                            <span className="text-[10px] uppercase text-lumina-muted tracking-wider mb-1">Note</span>
                            <p className="text-xs text-white truncate">{asset.notes}</p>
                        </div>
                ) : null}
            </div>
        </Motion.div>
    );
};

export default InventoryAssetCard;
