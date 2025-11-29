
import React from 'react';
import { motion } from 'framer-motion';
import { Booking, User } from '../../types';
import { Clock, AlertCircle } from 'lucide-react';

const Motion = motion as any;

interface ProductionKanbanCardProps {
    booking: Booking;
    currentUser?: User;
    onSelect: (id: string) => void;
    onDragStart: (e: React.DragEvent, id: string) => void;
}

const ProductionKanbanCard: React.FC<ProductionKanbanCardProps> = ({ booking, currentUser, onSelect, onDragStart }) => {
    
    const getDeadlineColor = (date: string) => {
        const today = new Date();
        const deadline = new Date(date);
        const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return 'text-rose-500 bg-rose-500/10';
        if (diffDays <= 2) return 'text-amber-500 bg-amber-500/10';
        return 'text-emerald-500 bg-emerald-500/10';
    };

    return (
        <Motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full"
        >
            <button
                type="button"
                draggable
                onDragStart={(e: any) => onDragStart(e, booking.id)}
                onClick={() => onSelect(booking.id)}
                className="w-full text-left bg-lumina-base border border-lumina-highlight p-3 rounded-xl shadow-sm hover:border-lumina-accent/50 cursor-grab active:cursor-grabbing group relative overflow-hidden transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lumina-accent"
            >
                {/* Card Content */}
                <div className="flex justify-between items-start mb-1.5">
                    <span className="text-[9px] font-bold text-lumina-muted uppercase tracking-wider truncate max-w-[100px]">{booking.package}</span>
                    {booking.photographerId === currentUser?.id && (
                        <div className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-[8px] font-bold">YOU</div>
                    )}
                </div>
                
                <h4 className="font-bold text-white text-sm mb-1 truncate">{booking.clientName}</h4>
                
                <div className="flex items-center gap-2 text-[10px] text-lumina-muted mb-2">
                    <Clock size={10} />
                    <span>{new Date(booking.date).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-lumina-highlight/50">
                    <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${getDeadlineColor(booking.date)}`}>
                        <AlertCircle size={10} /> Due Soon
                    </div>
                    <div className="w-5 h-5 rounded-full bg-lumina-surface border border-lumina-highlight flex items-center justify-center text-[9px] text-white font-bold">
                        {booking.clientName.charAt(0)}
                    </div>
                </div>
            </button>
        </Motion.div>
    );
};

export default ProductionKanbanCard;
