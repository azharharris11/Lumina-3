
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Asset, AssetCategory, AssetStatus, InventoryViewProps, AssetLog } from '../types';
import { Search, Plus } from 'lucide-react';
import InventoryAssetCard from '../components/inventory/InventoryAssetCard';
import InventoryActionModal from '../components/inventory/InventoryActionModal';
import InventoryAddModal from '../components/inventory/InventoryAddModal';

const InventoryView: React.FC<InventoryViewProps> = ({ assets, users, onAddAsset, onUpdateAsset, onDeleteAsset, config }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [actionAsset, setActionAsset] = useState<Asset | null>(null);
  const [actionType, setActionType] = useState<'CHECK_OUT' | 'MAINTENANCE' | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const configCategories = config.assetCategories || ['CAMERA', 'LENS', 'LIGHTING', 'PROP', 'BACKGROUND'];

  const categories = [
      { id: 'ALL', label: 'All Items' },
      ...configCategories.map(c => ({ id: c, label: c }))
  ];

  const handleAddAsset = (newAsset: Partial<Asset>) => {
      if (onAddAsset && newAsset.name) {
          onAddAsset({
              id: `a-${Date.now()}`,
              name: newAsset.name!,
              category: newAsset.category as AssetCategory,
              status: (newAsset.status || 'AVAILABLE') as AssetStatus,
              serialNumber: newAsset.serialNumber || '',
              logs: [{
                  id: `l-${Date.now()}`,
                  date: new Date().toISOString(),
                  action: 'CREATED',
                  notes: 'Asset registered in system'
              }]
          });
          setIsAddModalOpen(false);
      }
  };

  const handleActionClick = (asset: Asset, type: 'CHECK_OUT' | 'MAINTENANCE' | 'RETURN') => {
      setActiveMenu(null);
      if (type === 'RETURN') {
           if (onUpdateAsset) {
               const log: AssetLog = {
                   id: `l-${Date.now()}`,
                   date: new Date().toISOString(),
                   action: 'RETURN',
                   notes: `Returned from ${users.find(u => u.id === asset.assignedToUserId)?.name || 'User'}`
               };
               onUpdateAsset({
                   ...asset,
                   status: 'AVAILABLE',
                   assignedToUserId: undefined,
                   returnDate: undefined,
                   notes: undefined,
                   logs: [log, ...(asset.logs || [])]
               });
           }
      } else {
          setActionAsset(asset);
          setActionType(type);
      }
  };

  const handleActionConfirm = (asset: Asset, form: { userId: string, returnDate: string, notes: string }) => {
      if (onUpdateAsset) {
          let updatedAsset = { ...asset };
          let log: AssetLog = {
              id: `l-${Date.now()}`,
              date: new Date().toISOString(),
              action: actionType || 'MAINTENANCE',
              notes: form.notes
          };
          
          if (actionType === 'CHECK_OUT') {
              updatedAsset.status = 'IN_USE';
              updatedAsset.assignedToUserId = form.userId;
              updatedAsset.returnDate = form.returnDate;
              log.action = 'CHECK_OUT';
              log.userId = form.userId;
              log.notes = `Checked out until ${form.returnDate}`;
          } else if (actionType === 'MAINTENANCE') {
              updatedAsset.status = 'MAINTENANCE'; 
              updatedAsset.notes = form.notes;
              log.action = 'MAINTENANCE';
              log.notes = form.notes;
          }

          updatedAsset.logs = [log, ...(updatedAsset.logs || [])];

          onUpdateAsset(updatedAsset);
          setActionAsset(null);
          setActionType(null);
      }
  };

  const handleDelete = async (asset: Asset) => {
      setActiveMenu(null);
      
      if (!window.confirm(`Permanently delete '${asset.name}'?`)) return;

      try {
          if (onDeleteAsset) {
              await onDeleteAsset(asset.id);
          }
      } catch (error: any) {
          alert(`Failed to delete asset: ${error.message}`);
      }
  };

  const filteredAssets = assets.filter(a => {
      const matchesCategory = activeCategory === 'ALL' || a.category === activeCategory;
      const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || (a.serialNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 h-full flex flex-col" onClick={() => setActiveMenu(null)}>
      <div className="flex flex-col md:flex-row justify-between items-end shrink-0">
        <div>
          <h1 className="text-4xl font-display font-bold text-white mb-2">Inventory Management</h1>
          <p className="text-lumina-muted">Track equipment location, status, and maintenance schedules.</p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-lumina-muted w-4 h-4 group-focus-within:text-lumina-accent transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search serial or name..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="bg-lumina-surface border border-lumina-highlight rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-lumina-accent w-64 transition-all"
                />
            </div>
            <button 
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="bg-lumina-accent text-lumina-base px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-lumina-accent/90 transition-colors shadow-lg shadow-lumina-accent/10"
            >
                <Plus size={18} /> Add Item
            </button>
        </div>
      </div>

      <div className="flex border-b border-lumina-highlight shrink-0 overflow-x-auto">
          {categories.map(cat => (
              <button
                 key={cat.id}
                 type="button"
                 onClick={() => setActiveCategory(cat.id)}
                 className={`px-6 py-3 font-bold text-sm transition-colors relative whitespace-nowrap ${activeCategory === cat.id ? 'text-white' : 'text-lumina-muted hover:text-white'}`}
              >
                  {cat.label}
                  {activeCategory === cat.id && <motion.div layoutId="invTab" className="absolute bottom-0 left-0 w-full h-0.5 bg-lumina-accent" />}
              </button>
          ))}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
            {filteredAssets.map((asset, index) => (
                <InventoryAssetCard
                    key={asset.id}
                    asset={asset}
                    index={index}
                    assignedUserName={users.find(u => u.id === asset.assignedToUserId)?.name}
                    activeMenuId={activeMenu}
                    onToggleMenu={setActiveMenu}
                    onAction={handleActionClick}
                    onDelete={handleDelete}
                />
            ))}
        </div>
      </div>

      <AnimatePresence>
          <InventoryAddModal 
              isOpen={isAddModalOpen} 
              onClose={() => setIsAddModalOpen(false)} 
              onSave={handleAddAsset} 
              categories={configCategories} 
          />
      </AnimatePresence>

      <AnimatePresence>
          <InventoryActionModal 
              asset={actionAsset} 
              type={actionType} 
              users={users} 
              onClose={() => { setActionAsset(null); setActionType(null); }} 
              onConfirm={handleActionConfirm} 
          />
      </AnimatePresence>
    </div>
  );
};

export default InventoryView;
