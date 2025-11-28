
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Asset, AssetCategory, AssetStatus } from '../../types';
import { X } from 'lucide-react';

const Motion = motion as any;

interface InventoryAddModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (asset: Partial<Asset>) => void;
    categories: string[];
}

const InventoryAddModal: React.FC<InventoryAddModalProps> = ({ isOpen, onClose, onSave, categories }) => {
    const [newAsset, setNewAsset] = useState<Partial<Asset>>({
        status: 'AVAILABLE',
        category: categories[0] || 'CAMERA',
        serialNumber: '' 
    });

    if (!isOpen) return null;

    const handleSave = () => {
        if (newAsset.name) {
            onSave(newAsset);
            setNewAsset({ status: 'AVAILABLE', category: categories[0] || 'CAMERA', serialNumber: '', name: '' });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <Motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative bg-lumina-surface border border-lumina-highlight w-full max-w-md rounded-2xl p-6 shadow-2xl"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Add New Item</h2>
                    <button type="button" onClick={onClose}><X className="text-lumina-muted hover:text-white" /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs uppercase text-lumina-muted font-bold block mb-1">Asset Name</label>
                        <input className="w-full bg-lumina-base border border-lumina-highlight rounded-lg p-3 text-white focus:border-lumina-accent outline-none" 
                            value={newAsset.name || ''} onChange={e => setNewAsset({...newAsset, name: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <label className="text-xs uppercase text-lumina-muted font-bold block mb-1">Category</label>
                        <select className="w-full bg-lumina-base border border-lumina-highlight rounded-lg p-3 text-white focus:border-lumina-accent outline-none"
                            value={newAsset.category} onChange={e => setNewAsset({...newAsset, category: e.target.value as any})}
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        </div>
                        <div>
                        <label className="text-xs uppercase text-lumina-muted font-bold block mb-1">Status</label>
                        <select className="w-full bg-lumina-base border border-lumina-highlight rounded-lg p-3 text-white focus:border-lumina-accent outline-none"
                            value={newAsset.status} onChange={e => setNewAsset({...newAsset, status: e.target.value as any})}
                        >
                            <option value="AVAILABLE">Available</option>
                            <option value="MAINTENANCE">Maintenance</option>
                        </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs uppercase text-lumina-muted font-bold block mb-1">Serial Number</label>
                        <input className="w-full bg-lumina-base border border-lumina-highlight rounded-lg p-3 text-white focus:border-lumina-accent outline-none" 
                            value={newAsset.serialNumber || ''} onChange={e => setNewAsset({...newAsset, serialNumber: e.target.value})}
                        />
                    </div>
                    <button type="button" onClick={handleSave} className="w-full py-3 bg-lumina-accent text-lumina-base font-bold rounded-xl hover:bg-lumina-accent/90 transition-colors mt-4">
                        Add to Inventory
                    </button>
                </div>
            </Motion.div>
        </div>
    );
};

export default InventoryAddModal;
