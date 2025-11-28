
import React, { useState } from 'react';
import { Package, Asset, PackageCostItem } from '../../types';
import { Plus, Edit2, Archive, RefreshCcw, X } from 'lucide-react';

interface PackagesTabProps {
    packages: Package[];
    onAddPackage: (pkg: Package) => void;
    onUpdatePackage: (pkg: Package) => void;
    onDeletePackage?: (id: string) => void;
    assets: Asset[];
}

const PackagesTab: React.FC<PackagesTabProps> = ({ packages, onAddPackage, onUpdatePackage, assets }) => {
    const [showAddPackage, setShowAddPackage] = useState(false);
    const [isEditingPackage, setIsEditingPackage] = useState(false);
    const [newPackage, setNewPackage] = useState<Partial<Package>>({ name: '', price: 0, duration: 1, features: [], active: true, costBreakdown: [], turnaroundDays: 7, defaultTasks: [], defaultAssetIds: [] });
    const [featureInput, setFeatureInput] = useState('');
    const [packageTaskInput, setPackageTaskInput] = useState('');
    const [newCostItem, setNewCostItem] = useState<Partial<PackageCostItem>>({ description: '', amount: 0, category: 'OTHER' });

    const handleSavePackage = () => {
        const pkgData = { 
            name: newPackage.name, 
            price: Number(newPackage.price), 
            duration: Number(newPackage.duration), 
            features: newPackage.features || [], 
            active: true, 
            costBreakdown: newPackage.costBreakdown || [], 
            turnaroundDays: Number(newPackage.turnaroundDays) || 7, 
            defaultTasks: newPackage.defaultTasks || [], 
            defaultAssetIds: newPackage.defaultAssetIds || [] 
        };
        
        if (isEditingPackage && newPackage.id) {
            onUpdatePackage({ ...pkgData, id: newPackage.id } as Package);
        } else if (newPackage.name) {
            onAddPackage({ ...pkgData, id: `p-${Date.now()}` } as Package);
        }
        
        setShowAddPackage(false);
        setIsEditingPackage(false);
        setNewPackage({ name: '', price: 0, duration: 1, features: [], active: true, costBreakdown: [], turnaroundDays: 7, defaultTasks: [], defaultAssetIds: [] });
        setFeatureInput('');
        setPackageTaskInput('');
    };

    const handleEditPackage = (pkg: Package) => {
        setNewPackage({ 
            ...pkg, 
            turnaroundDays: pkg.turnaroundDays || 7, 
            defaultTasks: pkg.defaultTasks || [], 
            defaultAssetIds: pkg.defaultAssetIds || [], 
            costBreakdown: pkg.costBreakdown || [] 
        });
        setIsEditingPackage(true);
        setShowAddPackage(true);
    };

    const togglePackage = (pkg: Package) => { onUpdatePackage({ ...pkg, active: !pkg.active }); };
    const handleArchivePackage = (pkg: Package) => { if (window.confirm(`Archive package '${pkg.name}'?`)) onUpdatePackage({ ...pkg, active: false, archived: true }); };

    // ... Helper functions for array manipulation within newPackage ...
    const addFeature = () => { if (featureInput.trim()) { setNewPackage(prev => ({ ...prev, features: [...(prev.features || []), featureInput.trim()] })); setFeatureInput(''); } };
    const removeFeature = (idx: number) => { setNewPackage(prev => ({ ...prev, features: (prev.features || []).filter((_, i) => i !== idx) })); };
    
    const addPackageTask = () => { if (packageTaskInput.trim()) { setNewPackage(prev => ({ ...prev, defaultTasks: [...(prev.defaultTasks || []), packageTaskInput.trim()] })); setPackageTaskInput(''); } };
    const removePackageTask = (idx: number) => { setNewPackage(prev => ({ ...prev, defaultTasks: (prev.defaultTasks || []).filter((_, i) => i !== idx) })); };

    const togglePackageAsset = (assetId: string) => {
        const current = newPackage.defaultAssetIds || [];
        if (current.includes(assetId)) {
            setNewPackage(prev => ({ ...prev, defaultAssetIds: current.filter(id => id !== assetId) }));
        } else {
            setNewPackage(prev => ({ ...prev, defaultAssetIds: [...current, assetId] }));
        }
    };

    const addCostItem = () => {
        if (newCostItem.description && newCostItem.amount) {
            const item: PackageCostItem = {
                id: `cost-${Date.now()}`,
                description: newCostItem.description,
                amount: Number(newCostItem.amount),
                category: newCostItem.category as any || 'OTHER'
            };
            setNewPackage(prev => ({ ...prev, costBreakdown: [...(prev.costBreakdown || []), item] }));
            setNewCostItem({ description: '', amount: 0, category: 'OTHER' });
        }
    };
    const removeCostItem = (id: string) => { setNewPackage(prev => ({ ...prev, costBreakdown: (prev.costBreakdown || []).filter(c => c.id !== id) })); };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Packages</h2>
                <button onClick={() => { setShowAddPackage(true); setIsEditingPackage(false); setNewPackage({ name: '', price: 0, duration: 1, features: [], active: true, costBreakdown: [], turnaroundDays: 7, defaultTasks: [], defaultAssetIds: [] }); }} className="bg-lumina-accent text-lumina-base px-4 py-2 rounded-lg font-bold flex items-center gap-2"><Plus size={18}/> New Package</button>
            </div>
            
            {showAddPackage && (
                <div className="bg-lumina-base border border-lumina-highlight rounded-xl p-6 space-y-4 mb-6 animate-in slide-in-from-top-4">
                    <h3 className="font-bold text-white">{isEditingPackage ? 'Edit Package' : 'Create Package'}</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <input placeholder="Package Name" value={newPackage.name} onChange={e => setNewPackage({...newPackage, name: e.target.value})} className="w-full bg-lumina-surface border border-lumina-highlight rounded-lg p-3 text-white"/>
                        <input type="number" placeholder="Price" value={newPackage.price} onChange={e => setNewPackage({...newPackage, price: Number(e.target.value)})} className="w-full bg-lumina-surface border border-lumina-highlight rounded-lg p-3 text-white"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" placeholder="Duration (hours)" value={newPackage.duration} onChange={e => setNewPackage({...newPackage, duration: Number(e.target.value)})} className="w-full bg-lumina-surface border border-lumina-highlight rounded-lg p-3 text-white"/>
                        <input type="number" placeholder="Turnaround (days)" value={newPackage.turnaroundDays} onChange={e => setNewPackage({...newPackage, turnaroundDays: Number(e.target.value)})} className="w-full bg-lumina-surface border border-lumina-highlight rounded-lg p-3 text-white"/>
                    </div>

                    {/* Features */}
                    <div className="border-t border-lumina-highlight/50 pt-4">
                        <label className="block text-xs text-lumina-muted font-bold mb-2">Features</label>
                        <div className="flex gap-2 mb-2">
                            <input placeholder="Add feature..." value={featureInput} onChange={e => setFeatureInput(e.target.value)} className="flex-1 bg-lumina-surface border border-lumina-highlight rounded-lg p-2 text-white text-sm" onKeyDown={e => e.key === 'Enter' && addFeature()}/>
                            <button onClick={addFeature} className="bg-lumina-highlight px-3 rounded-lg text-white font-bold text-sm">+</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {newPackage.features?.map((f, i) => (
                                <span key={i} className="bg-lumina-highlight px-2 py-1 rounded text-xs text-white flex items-center gap-2">{f} <X size={10} className="cursor-pointer" onClick={() => removeFeature(i)}/></span>
                            ))}
                        </div>
                    </div>
                    
                    {/* Task Automation */}
                    <div className="border-t border-lumina-highlight/50 pt-4">
                        <label className="block text-xs text-lumina-muted font-bold mb-2">Automated Tasks</label>
                        <div className="flex gap-2 mb-2">
                            <input placeholder="Add default task (e.g. Edit Photos)" value={packageTaskInput} onChange={e => setPackageTaskInput(e.target.value)} className="flex-1 bg-lumina-surface border border-lumina-highlight rounded-lg p-2 text-white text-sm" onKeyDown={e => e.key === 'Enter' && addPackageTask()}/>
                            <button onClick={addPackageTask} className="bg-lumina-highlight px-3 rounded-lg text-white font-bold text-sm">+</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {newPackage.defaultTasks?.map((t, i) => (
                                <span key={i} className="bg-lumina-surface px-2 py-1 rounded text-xs text-white border border-lumina-highlight flex items-center gap-1">{t} <X size={10} className="cursor-pointer" onClick={() => removePackageTask(i)}/></span>
                            ))}
                        </div>
                    </div>

                    {/* COGS Breakdown */}
                    <div className="border-t border-lumina-highlight/50 pt-4">
                        <label className="block text-xs text-lumina-muted font-bold mb-2">Cost Breakdown (COGS)</label>
                        <div className="flex gap-2 mb-2">
                            <input placeholder="Item (e.g. Prints)" value={newCostItem.description} onChange={e => setNewCostItem({...newCostItem, description: e.target.value})} className="flex-[2] bg-lumina-surface border border-lumina-highlight rounded-lg p-2 text-white text-sm"/>
                            <input type="number" placeholder="Cost" value={newCostItem.amount || ''} onChange={e => setNewCostItem({...newCostItem, amount: Number(e.target.value)})} className="flex-1 bg-lumina-surface border border-lumina-highlight rounded-lg p-2 text-white text-sm"/>
                            <select value={newCostItem.category} onChange={e => setNewCostItem({...newCostItem, category: e.target.value as any})} className="flex-1 bg-lumina-surface border border-lumina-highlight rounded-lg p-2 text-white text-sm">
                                <option value="LABOR">Labor</option>
                                <option value="MATERIAL">Material</option>
                                <option value="OTHER">Other</option>
                            </select>
                            <button onClick={addCostItem} className="bg-lumina-highlight px-3 rounded-lg text-white font-bold text-sm">+</button>
                        </div>
                        <div className="space-y-1 mb-2">
                            {newPackage.costBreakdown?.map((cost, i) => (
                                <div key={i} className="flex justify-between items-center bg-lumina-surface px-3 py-1.5 rounded border border-lumina-highlight text-xs">
                                    <span className="text-white">{cost.description} <span className="text-lumina-muted">({cost.category})</span></span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-rose-400 font-mono">Rp {cost.amount.toLocaleString()}</span>
                                        <button onClick={() => removeCostItem(cost.id)}><X size={10} className="text-lumina-muted hover:text-white"/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="text-right text-xs text-lumina-muted">
                            Total COGS: <span className="text-rose-400 font-bold">Rp {(newPackage.costBreakdown || []).reduce((acc, c) => acc + c.amount, 0).toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Asset Bundling */}
                    <div className="border-t border-lumina-highlight/50 pt-4">
                        <label className="block text-xs text-lumina-muted font-bold mb-2">Included Assets (Auto-Select)</label>
                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar bg-lumina-surface p-2 rounded-lg border border-lumina-highlight">
                            {assets.map((asset) => (
                                <button 
                                    key={asset.id}
                                    onClick={() => togglePackageAsset(asset.id)}
                                    className={`px-2 py-1 text-xs border rounded transition-colors ${newPackage.defaultAssetIds?.includes(asset.id) ? 'bg-lumina-accent text-lumina-base border-lumina-accent font-bold' : 'text-lumina-muted border-lumina-highlight hover:border-white'}`}
                                >
                                    {asset.name}
                                </button>
                            ))}
                            {assets.length === 0 && <p className="text-xs text-lumina-muted italic">No assets available in inventory.</p>}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <button onClick={() => setShowAddPackage(false)} className="px-4 py-2 text-lumina-muted font-bold">Cancel</button>
                        <button onClick={handleSavePackage} className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold">Save Package</button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {packages.filter(p => !p.archived).map(pkg => (
                    <div key={pkg.id} className={`p-4 rounded-xl border ${pkg.active ? 'bg-lumina-base border-lumina-highlight' : 'bg-lumina-base/50 border-lumina-highlight/50 opacity-60'} relative group`}>
                        <div className="absolute top-4 right-4 flex gap-2">
                            <button onClick={() => togglePackage(pkg)} className="p-1.5 bg-lumina-surface rounded text-lumina-muted hover:text-white"><RefreshCcw size={14}/></button>
                            <button onClick={() => handleEditPackage(pkg)} className="p-1.5 bg-lumina-surface rounded text-lumina-muted hover:text-white"><Edit2 size={14}/></button>
                            <button onClick={() => handleArchivePackage(pkg)} className="p-1.5 bg-lumina-surface rounded text-lumina-muted hover:text-rose-500"><Archive size={14}/></button>
                        </div>
                        <h3 className="font-bold text-white text-lg">{pkg.name}</h3>
                        <p className="text-lumina-accent font-mono font-bold">Rp {pkg.price.toLocaleString()}</p>
                        <p className="text-xs text-lumina-muted mt-2">{pkg.duration} Hours • {pkg.turnaroundDays} Days Turnaround</p>
                        <div className="flex flex-wrap gap-1 mt-3">
                            {pkg.features.slice(0, 3).map((f, i) => <span key={i} className="text-[10px] bg-lumina-surface px-2 py-0.5 rounded text-lumina-muted border border-lumina-highlight">{f}</span>)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PackagesTab;
