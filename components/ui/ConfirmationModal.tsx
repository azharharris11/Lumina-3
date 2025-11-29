
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Check } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isDanger?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
    isOpen, title, message, confirmLabel = "Confirm", cancelLabel = "Cancel", isDanger = false, onConfirm, onCancel 
}) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onCancel} className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                    className="relative bg-lumina-surface border border-lumina-highlight w-full max-w-sm rounded-2xl p-6 shadow-2xl"
                    role="alertdialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                    aria-describedby="modal-desc"
                >
                    <div className="flex flex-col items-center text-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDanger ? 'bg-rose-500/10 text-rose-500' : 'bg-lumina-accent/10 text-lumina-accent'}`}>
                            {isDanger ? <AlertTriangle size={24} /> : <Check size={24} />}
                        </div>
                        <h3 id="modal-title" className="text-lg font-bold text-white mb-2">{title}</h3>
                        <p id="modal-desc" className="text-sm text-lumina-muted mb-6 leading-relaxed">
                            {message}
                        </p>
                        <div className="grid grid-cols-2 gap-3 w-full">
                            <button 
                                onClick={onCancel}
                                className="py-2.5 px-4 rounded-xl font-bold text-sm text-lumina-muted hover:text-white hover:bg-lumina-highlight transition-colors"
                            >
                                {cancelLabel}
                            </button>
                            <button 
                                onClick={onConfirm}
                                className={`py-2.5 px-4 rounded-xl font-bold text-sm text-white transition-colors shadow-lg ${isDanger ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' : 'bg-lumina-accent text-lumina-base hover:bg-lumina-accent/90 shadow-lumina-accent/20'}`}
                            >
                                {confirmLabel}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ConfirmationModal;
