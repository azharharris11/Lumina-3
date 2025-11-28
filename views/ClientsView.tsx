
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Client, Booking, ClientsViewProps } from '../types';
import { Search, Plus, X } from 'lucide-react';
import WhatsAppModal from '../components/WhatsAppModal';
import { STUDIO_CONFIG } from '../data';
import ClientListItem from '../components/clients/ClientListItem';
import ClientDetailPanel from '../components/clients/ClientDetailPanel';

const ClientsView: React.FC<ClientsViewProps> = ({ clients, bookings, onUpdateClient, onAddClient, onDeleteClient, onSelectBooking, config }) => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Client>>({});
  const [searchTerm, setSearchTerm] = useState('');
  
  const clientCategories = config.clientCategories || ['NEW', 'REGULAR', 'VIP', 'PROBLEMATIC'];

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newClient, setNewClient] = useState<Partial<Client>>({
      name: '', phone: '', email: '', category: clientCategories[0], notes: ''
  });
  
  const [selectedBookingForWA, setSelectedBookingForWA] = useState<Booking | null>(null);

  const getClientSpend = (clientId: string) => {
    return bookings
      .filter(b => b.clientId === clientId)
      .reduce((acc, curr) => acc + curr.price, 0);
  };

  const getClientBookings = (clientId: string) => {
    return bookings.filter(b => b.clientId === clientId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getCategoryColor = (cat: string) => {
    if (cat === 'PROBLEMATIC') return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    if (cat === 'VIP') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    if (cat === 'NEW') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    
    const colors = ['blue', 'purple', 'cyan', 'teal', 'indigo'];
    let hash = 0;
    for (let i = 0; i < cat.length; i++) {
        hash = cat.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorName = colors[Math.abs(hash) % colors.length];
    return `bg-${colorName}-500/10 text-${colorName}-400 border-${colorName}-500/20`;
  };

  const handleEdit = () => {
      setEditForm(selectedClient || {});
      setIsEditing(true);
  };

  const handleSave = () => {
      if (onUpdateClient && selectedClient && editForm) {
          onUpdateClient({ ...selectedClient, ...editForm } as Client);
          setSelectedClient({ ...selectedClient, ...editForm } as Client);
          setIsEditing(false);
      }
  };

  const handleAdd = () => {
      if (onAddClient && newClient.name) {
          onAddClient({
              id: `c-${Date.now()}`,
              name: newClient.name!,
              phone: newClient.phone || '',
              email: newClient.email || '',
              category: newClient.category || 'NEW',
              notes: newClient.notes || '',
              joinedDate: new Date().toISOString().split('T')[0],
              avatar: `https://ui-avatars.com/api/?name=${newClient.name}&background=random`
          });
          setIsAddModalOpen(false);
          setNewClient({ name: '', phone: '', email: '', notes: '', category: clientCategories[0] });
      }
  };

  const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      
      if (!selectedClient) return;

      if (!window.confirm(`Are you sure you want to permanently delete client '${selectedClient.name}'?`)) {
          return;
      }

      const validBookings = bookings || [];
      const associatedBookings = validBookings.filter(b => b && b.clientId === selectedClient.id);
      
      if (associatedBookings.length > 0) {
          alert(`Blocked: Client '${selectedClient.name}' has ${associatedBookings.length} recorded bookings.\n\nDeleting this client would corrupt your financial history. Please delete their bookings first.`);
          return;
      }

      if (onDeleteClient) {
          onDeleteClient(selectedClient.id);
          setSelectedClient(null);
      }
  };

  const handleOpenWA = () => {
      if (selectedClient) {
          const dummyBooking: any = {
              id: 'temp',
              clientName: selectedClient.name,
              clientPhone: selectedClient.phone,
              date: 'N/A',
              price: 0,
              paidAmount: 0,
              package: 'General Inquiry',
              studio: 'Lumina',
              timeStart: ''
          };
          setSelectedBookingForWA(dummyBooking);
      }
  }

  const filteredClients = clients.filter(c => 
      (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (c.phone || '').includes(searchTerm)
  );

  return (
    <div className="space-y-8 h-full flex flex-col relative">
      <div className={`flex-col md:flex-row justify-between items-end shrink-0 ${selectedClient ? 'hidden lg:flex' : 'flex'}`}>
        <div>
          <h1 className="text-4xl font-display font-bold text-white mb-2">Client Management</h1>
          <p className="text-lumina-muted">CRM Database with spending history and preference notes.</p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0 w-full md:w-auto">
            <div className="relative group flex-1 md:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-lumina-muted w-4 h-4 group-focus-within:text-lumina-accent transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search name, phone..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-lumina-surface border border-lumina-highlight rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-lumina-accent w-full md:w-64 transition-all"
                />
            </div>
            <button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-lumina-accent text-lumina-base px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-lumina-accent/90 transition-colors shadow-lg shadow-lumina-accent/10 shrink-0"
            >
                <Plus size={18} /> <span className="hidden sm:inline">Add Client</span>
            </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden relative">
        <div className={`flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2 ${selectedClient ? 'hidden lg:block' : 'block'}`}>
            {filteredClients.length === 0 && (
                <div className="text-center py-10 text-lumina-muted opacity-50">No clients found.</div>
            )}
            {filteredClients.map((client, i) => (
                <ClientListItem 
                    key={client.id}
                    client={client}
                    index={i}
                    isSelected={selectedClient?.id === client.id}
                    spend={getClientSpend(client.id)}
                    getCategoryColor={getCategoryColor}
                    onSelect={(c) => { setSelectedClient(c); setIsEditing(false); }}
                />
            ))}
        </div>

        <div className={`lg:w-[400px] bg-lumina-surface border border-lumina-highlight rounded-2xl overflow-hidden flex flex-col absolute inset-0 lg:static z-10 ${selectedClient ? 'flex' : 'hidden lg:flex'}`}>
            <ClientDetailPanel 
                client={selectedClient}
                isEditing={isEditing}
                editForm={editForm}
                categories={clientCategories}
                onClose={() => setSelectedClient(null)}
                onEdit={handleEdit}
                onSave={handleSave}
                onCancelEdit={() => setIsEditing(false)}
                onDelete={handleDelete}
                onEditFormChange={(field, value) => setEditForm(prev => ({ ...prev, [field]: value }))}
                onOpenWA={handleOpenWA}
                onSelectBooking={onSelectBooking}
                getClientSpend={getClientSpend}
                getClientBookings={getClientBookings}
            />
        </div>
      </div>

      <AnimatePresence>
          {isAddModalOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                  <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setIsAddModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                  <motion.div initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.95, opacity:0}} className="relative bg-lumina-surface border border-lumina-highlight w-full max-w-md rounded-2xl p-6 shadow-2xl">
                      <div className="flex justify-between items-center mb-6">
                          <h2 className="text-xl font-bold text-white">Add New Client</h2>
                          <button onClick={() => setIsAddModalOpen(false)}><X className="text-lumina-muted hover:text-white" /></button>
                      </div>
                      <div className="space-y-4">
                          <div>
                              <label className="block text-xs text-lumina-muted mb-1 uppercase font-bold">Client Name</label>
                              <input className="w-full bg-lumina-base border border-lumina-highlight rounded-lg p-2 text-white" value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} />
                          </div>
                          <div>
                              <label className="block text-xs text-lumina-muted mb-1 uppercase font-bold">Phone Number</label>
                              <input className="w-full bg-lumina-base border border-lumina-highlight rounded-lg p-2 text-white" value={newClient.phone} onChange={e => setNewClient({...newClient, phone: e.target.value})} />
                          </div>
                          <div>
                              <label className="block text-xs text-lumina-muted mb-1 uppercase font-bold">Email</label>
                              <input className="w-full bg-lumina-base border border-lumina-highlight rounded-lg p-2 text-white" value={newClient.email} onChange={e => setNewClient({...newClient, email: e.target.value})} />
                          </div>
                          <div>
                              <label className="block text-xs text-lumina-muted mb-1 uppercase font-bold">Category</label>
                              <select className="w-full bg-lumina-base border border-lumina-highlight rounded-lg p-2 text-white" value={newClient.category} onChange={e => setNewClient({...newClient, category: e.target.value})}>
                                  {clientCategories.map(cat => (
                                      <option key={cat} value={cat}>{cat}</option>
                                  ))}
                              </select>
                          </div>
                          <div>
                              <label className="block text-xs text-lumina-muted mb-1 uppercase font-bold">Initial Notes</label>
                              <textarea className="w-full bg-lumina-base border border-lumina-highlight rounded-lg p-2 text-white h-20" value={newClient.notes} onChange={e => setNewClient({...newClient, notes: e.target.value})} />
                          </div>
                          <button onClick={handleAdd} className="w-full py-3 bg-lumina-accent text-lumina-base font-bold rounded-xl mt-4 hover:bg-lumina-accent/90">Create Client Profile</button>
                      </div>
                  </motion.div>
              </div>
          )}
      </AnimatePresence>

      <WhatsAppModal 
         isOpen={!!selectedBookingForWA}
         onClose={() => setSelectedBookingForWA(null)}
         booking={selectedBookingForWA}
         config={STUDIO_CONFIG}
      />
    </div>
  );
};

export default ClientsView;
