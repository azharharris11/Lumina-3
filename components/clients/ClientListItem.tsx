
import React from 'react';
import { motion } from 'framer-motion';
import { Client } from '../../types';
import { Phone } from 'lucide-react';

const Motion = motion as any;

interface ClientListItemProps {
    client: Client;
    index: number;
    isSelected: boolean;
    spend: number;
    getCategoryColor: (cat: string) => string;
    onSelect: (client: Client) => void;
}

const ClientListItem: React.FC<ClientListItemProps> = ({ client, index, isSelected, spend, getCategoryColor, onSelect }) => {
    return (
        <Motion.button
            type="button"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelect(client)}
            className={`w-full text-left p-4 rounded-xl border cursor-pointer transition-all group relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-lumina-accent
                ${isSelected 
                    ? 'bg-lumina-highlight border-lumina-accent' 
                    : 'bg-lumina-surface border-lumina-highlight hover:border-lumina-muted'}
                hover:bg-lumina-highlight/50`}
        >
            <div className="flex items-center gap-4">
                <img src={client.avatar} alt={client.name} className="w-12 h-12 rounded-full border border-lumina-highlight" />
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <h3 className={`font-bold text-lg truncate ${isSelected ? 'text-white' : 'text-lumina-muted group-hover:text-white'}`}>
                            {client.name}
                        </h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${getCategoryColor(client.category)}`}>
                            {client.category}
                        </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-lumina-muted">
                        <span className="flex items-center gap-1 truncate"><Phone size={10} /> {client.phone}</span>
                        <span className="flex items-center gap-1 font-mono text-lumina-accent">Rp {spend.toLocaleString('id-ID', { notation: "compact" })}</span>
                    </div>
                </div>
            </div>
        </Motion.button>
    );
};

export default ClientListItem;
