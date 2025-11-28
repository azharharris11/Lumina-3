
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Notification } from '../types';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface GlobalNotificationsProps {
    notifications: Notification[];
    onDismiss: (id: string) => void;
}

const GlobalNotifications: React.FC<GlobalNotificationsProps> = ({ notifications, onDismiss }) => {
    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-full max-w-sm pointer-events-none px-4 md:px-0">
            <AnimatePresence mode="popLayout">
                {notifications.map((notif) => (
                    <motion.div
                        key={notif.id}
                        layout
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className="pointer-events-auto bg-lumina-surface/95 backdrop-blur-md border border-lumina-highlight p-4 rounded-xl shadow-2xl flex gap-3 items-start relative overflow-hidden"
                    >
                        {/* Status Indicator Line */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                            notif.type === 'SUCCESS' ? 'bg-emerald-500' : 
                            notif.type === 'ERROR' ? 'bg-rose-500' : 
                            notif.type === 'WARNING' ? 'bg-amber-500' : 'bg-blue-500'
                        }`} />

                        <div className={`mt-0.5 shrink-0 ${
                            notif.type === 'SUCCESS' ? 'text-emerald-400' : 
                            notif.type === 'ERROR' ? 'text-rose-400' : 
                            notif.type === 'WARNING' ? 'text-amber-400' : 'text-blue-400'
                        }`}>
                            {notif.type === 'SUCCESS' && <CheckCircle2 size={18} />}
                            {notif.type === 'ERROR' && <AlertCircle size={18} />}
                            {notif.type === 'WARNING' && <AlertCircle size={18} />}
                            {notif.type === 'INFO' && <Info size={18} />}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm text-white leading-tight">{notif.title}</h4>
                            <p className="text-xs text-lumina-muted mt-1 leading-relaxed">{notif.message}</p>
                        </div>

                        <button 
                            onClick={() => onDismiss(notif.id)}
                            className="text-lumina-muted hover:text-white transition-colors shrink-0"
                        >
                            <X size={14} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default GlobalNotifications;
