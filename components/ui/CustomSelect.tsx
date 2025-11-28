
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
    value: string;
    label: string;
    subLabel?: string;
}

interface CustomSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    placeholder?: string;
    icon?: React.ReactNode;
    className?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ value, onChange, options, placeholder = "Select...", icon, className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(o => o.value === value);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between bg-lumina-base border rounded-xl px-3 py-3 text-sm transition-all
                    ${isOpen ? 'border-lumina-accent ring-1 ring-lumina-accent/50' : 'border-lumina-highlight hover:border-lumina-muted'}
                    ${!selectedOption ? 'text-lumina-muted' : 'text-white'}
                `}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    {icon && <span className="text-lumina-muted shrink-0">{icon}</span>}
                    <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
                </div>
                <ChevronDown size={16} className={`text-lumina-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.98 }}
                        transition={{ duration: 0.1 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-lumina-surface border border-lumina-highlight rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto custom-scrollbar"
                    >
                        <div className="p-1 space-y-0.5">
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors text-left
                                        ${value === option.value ? 'bg-lumina-highlight text-white' : 'text-lumina-muted hover:bg-lumina-base hover:text-white'}
                                    `}
                                >
                                    <div>
                                        <div className="font-medium">{option.label}</div>
                                        {option.subLabel && <div className="text-[10px] opacity-70">{option.subLabel}</div>}
                                    </div>
                                    {value === option.value && <Check size={14} className="text-lumina-accent" />}
                                </button>
                            ))}
                            {options.length === 0 && (
                                <div className="p-3 text-center text-xs text-lumina-muted">No options available</div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomSelect;
