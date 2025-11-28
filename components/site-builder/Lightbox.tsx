
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Motion = motion as any;

interface LightboxProps {
    isOpen: boolean;
    imageSrc: string | null;
    onClose: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ isOpen, imageSrc, onClose }) => {
    if (!isOpen || !imageSrc) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md" onClick={onClose}>
                <button 
                    onClick={onClose} 
                    className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-50"
                >
                    <X size={32} />
                </button>
                <Motion.img 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    src={imageSrc} 
                    className="max-h-[90vh] max-w-[90vw] object-contain shadow-2xl rounded-sm"
                    onClick={(e: React.MouseEvent) => e.stopPropagation()} // Prevent closing when clicking image
                />
            </div>
        </AnimatePresence>
    );
};

export default Lightbox;
