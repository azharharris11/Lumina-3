
import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Clock, ArrowRight, MessageCircle } from 'lucide-react';
import { Booking } from '../../types';

const Motion = motion as any;

interface ActionItem {
    id: string;
    title: string;
    subtitle: string;
    type: string;
    booking: Booking;
    onClick: () => void;
}

interface DashboardActionItemsProps {
    actionItems: ActionItem[];
    onOpenWhatsApp?: (booking: Booking) => void;
    itemVariants: any;
}

const DashboardActionItems: React.FC<DashboardActionItemsProps> = ({ actionItems, onOpenWhatsApp, itemVariants }) => {
    return (
        <div className="space-y-4">
           <h3 className="font-bold text-lumina-text px-2">Action Items</h3>
           {actionItems.map(item => (
               <Motion.div 
                 variants={itemVariants}
                 key={item.id}
                 className={`p-4 rounded-xl border transition-all shadow-sm flex flex-col gap-3
                    ${item.type === 'urgent' ? 'bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/20' : 'bg-lumina-surface border-lumina-highlight hover:border-lumina-accent/50'}
                 `}
               >
                  <div className="flex justify-between items-start cursor-pointer" onClick={item.onClick}>
                      <div className="flex items-center gap-3">
                          {item.type === 'urgent' ? <AlertCircle className="text-rose-500 w-5 h-5"/> : <Clock className="text-lumina-muted w-5 h-5"/>}
                          <div>
                              <h4 className={`font-bold text-sm ${item.type === 'urgent' ? 'text-rose-400' : 'text-lumina-text'}`}>{item.title}</h4>
                              <p className="text-xs text-lumina-muted">{item.subtitle}</p>
                          </div>
                      </div>
                      <div className="bg-lumina-base p-1.5 rounded text-lumina-muted">
                          <ArrowRight size={14} />
                      </div>
                  </div>
                  
                  {/* Smart Action Buttons */}
                  {item.title === 'Payment Outstanding' && onOpenWhatsApp && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); onOpenWhatsApp(item.booking); }}
                        className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors"
                      >
                          <MessageCircle size={14}/> Send Reminder (WA)
                      </button>
                  )}
               </Motion.div>
           ))}
           {actionItems.length === 0 && (
               <div className="p-8 text-center text-lumina-muted border border-dashed border-lumina-highlight rounded-xl">
                   <p className="text-sm">All caught up! No pending actions.</p>
               </div>
           )}
        </div>
    );
};

export default DashboardActionItems;
