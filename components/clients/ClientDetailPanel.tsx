
import React from 'react';
import { motion } from 'framer-motion';
import { Client, Booking } from '../../types';
import { Phone, Mail, MessageSquare, ShieldAlert, History, Edit2, Save, X, Trash2, ArrowLeft, Star } from 'lucide-react';

const Motion = motion as any;

interface ClientDetailPanelProps {
    client: Client | null;
    isEditing: boolean;
    editForm: Partial<Client>;
    categories: string[];
    onClose: () => void;
    onEdit: () => void;
    onSave: () => void;
    onCancelEdit: () => void;
    onDelete: (e: React.MouseEvent) => void;
    onEditFormChange: (field: keyof Client, value: any) => void;
    onOpenWA: () => void;
    onSelectBooking: (id: string) => void;
    getClientSpend: (id: string) => number;
    getClientBookings: (id: string) => Booking[];
}

const ClientDetailPanel: React.FC<ClientDetailPanelProps> = ({ 
    client, isEditing, editForm, categories, onClose, onEdit, onSave, onCancelEdit, onDelete, onEditFormChange, onOpenWA, onSelectBooking, getClientSpend, getClientBookings 
}) => {
    if (!client) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-lumina-muted opacity-50 p-8 text-center">
                <Star size={48} className="mb-4 stroke-1" />
                <p>Select a client to view details, history, and internal notes.</p>
            </div>
        );
    }

    return (
        <Motion.div 
            key={client.id}
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="flex flex-col h-full"
        >
            {/* Mobile Back Button */}
            <div className="lg:hidden p-4 border-b border-lumina-highlight bg-lumina-base flex items-center gap-2">
                <button onClick={onClose} className="p-2 hover:bg-lumina-highlight rounded-lg text-white">
                    <ArrowLeft size={20} />
                </button>
                <span className="font-bold text-white">Client Details</span>
            </div>

            {/* Header Profile */}
            <div className="p-6 border-b border-lumina-highlight bg-lumina-base/50 text-center relative shrink-0">
                {isEditing && (
                        <div className="absolute top-4 right-4 flex gap-2">
                            <button onClick={onCancelEdit} className="p-2 bg-lumina-highlight rounded text-white"><X size={16}/></button>
                            <button onClick={onSave} className="p-2 bg-lumina-accent text-lumina-base rounded font-bold"><Save size={16}/></button>
                        </div>
                )}
                {!isEditing && (
                    <div className="absolute top-4 right-4 flex gap-2">
                        <button 
                            type="button" 
                            onClick={onDelete} 
                            className="p-2 bg-rose-500/10 border border-rose-500/30 rounded hover:bg-rose-500 hover:text-white text-rose-500 transition-colors z-20 cursor-pointer" 
                            title="Delete Client"
                        >
                            <Trash2 size={16} className="pointer-events-none" />
                        </button>
                        <button onClick={onEdit} className="p-2 text-lumina-muted hover:text-white transition-colors">
                            <Edit2 size={16} />
                        </button>
                    </div>
                )}
                
                <img src={client.avatar} className="w-24 h-24 rounded-full border-4 border-lumina-surface mx-auto mb-3 shadow-xl" />
                
                {isEditing ? (
                    <input 
                        className="bg-lumina-highlight text-white text-center font-display font-bold text-xl rounded p-1 w-full mb-1"
                        value={editForm.name}
                        onChange={e => onEditFormChange('name', e.target.value)}
                    />
                ) : (
                    <h2 className="text-2xl font-display font-bold text-white">{client.name}</h2>
                )}

                <div className="flex justify-center gap-3 mt-3">
                        <a href={`tel:${client.phone}`} className="p-2 bg-lumina-highlight rounded-full hover:bg-lumina-accent hover:text-lumina-base transition-colors text-lumina-muted">
                            <Phone size={18} />
                        </a>
                        <a href={`mailto:${client.email}`} className="p-2 bg-lumina-highlight rounded-full hover:bg-lumina-accent hover:text-lumina-base transition-colors text-lumina-muted">
                            <Mail size={18} />
                        </a>
                        <button onClick={onOpenWA} className="p-2 bg-lumina-highlight rounded-full hover:bg-lumina-accent hover:text-lumina-base transition-colors text-lumina-muted">
                            <MessageSquare size={18} />
                        </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-lumina-base border border-lumina-highlight text-center">
                        <span className="text-xs text-lumina-muted uppercase">Total Spend</span>
                        <p className="text-lg font-bold text-emerald-400 font-mono">Rp {getClientSpend(client.id).toLocaleString('id-ID', {notation: "compact"})}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-lumina-base border border-lumina-highlight text-center">
                        <span className="text-xs text-lumina-muted uppercase">Bookings</span>
                        <p className="text-lg font-bold text-white">{getClientBookings(client.id).length}x</p>
                    </div>
                </div>

                {/* Editable Fields */}
                {isEditing ? (
                    <div className="space-y-4 p-4 bg-lumina-highlight/10 rounded-xl border border-lumina-highlight">
                        <div>
                            <label className="text-xs text-lumina-muted uppercase">Phone</label>
                            <input className="w-full bg-lumina-base border border-lumina-highlight rounded p-2 text-white text-sm mt-1" value={editForm.phone} onChange={e => onEditFormChange('phone', e.target.value)} />
                        </div>
                        <div>
                            <label className="text-xs text-lumina-muted uppercase">Email</label>
                            <input className="w-full bg-lumina-base border border-lumina-highlight rounded p-2 text-white text-sm mt-1" value={editForm.email} onChange={e => onEditFormChange('email', e.target.value)} />
                        </div>
                        <div>
                            <label className="text-xs text-lumina-muted uppercase">Category</label>
                            <select className="w-full bg-lumina-base border border-lumina-highlight rounded p-2 text-white text-sm mt-1" value={editForm.category} onChange={e => onEditFormChange('category', e.target.value)}>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                ) : null}

                {/* Internal Notes */}
                <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl">
                    <h4 className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center">
                        <ShieldAlert size={12} className="mr-2" /> Studio Notes
                    </h4>
                    {isEditing ? (
                        <textarea 
                            className="w-full bg-lumina-base border border-amber-500/30 rounded p-2 text-white text-sm min-h-[100px]"
                            value={editForm.notes}
                            onChange={e => onEditFormChange('notes', e.target.value)}
                        />
                    ) : (
                        <p className="text-sm text-lumina-muted italic">"{client.notes || 'No notes available.'}"</p>
                    )}
                </div>

                {/* Booking History */}
                <div>
                    <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-3 flex items-center">
                        <History size={14} className="mr-2" /> History
                    </h4>
                    <div className="space-y-3">
                        {getClientBookings(client.id).map(booking => (
                            <div 
                                key={booking.id} 
                                onClick={() => onSelectBooking(booking.id)}
                                className="p-3 rounded-lg border border-lumina-highlight bg-lumina-base/30 hover:border-lumina-accent/50 transition-colors cursor-pointer"
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs text-lumina-accent font-mono">{booking.date}</span>
                                    <span className="text-[10px] bg-lumina-highlight px-1.5 py-0.5 rounded text-lumina-muted">{booking.status}</span>
                                </div>
                                <p className="text-sm font-bold text-white">{booking.package}</p>
                                <p className="text-xs text-lumina-muted mt-0.5">at {booking.studio}</p>
                            </div>
                        ))}
                        {getClientBookings(client.id).length === 0 && (
                            <p className="text-xs text-lumina-muted text-center py-4">No booking history.</p>
                        )}
                    </div>
                </div>
            </div>
        </Motion.div>
    );
};

export default ClientDetailPanel;
