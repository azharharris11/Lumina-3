
import React from 'react';
import { SiteSection, SectionType } from '../../types';
import { Trash2, Video, MapPin, MousePointerClick } from 'lucide-react';

interface SiteSectionEditorProps {
    section: SiteSection;
    onUpdate: (id: string, content: any) => void;
    onDelete: (id: string) => void;
}

const SiteSectionEditor: React.FC<SiteSectionEditorProps> = ({ section, onUpdate, onDelete }) => {
    return (
        <div className="space-y-3 p-4 bg-lumina-base border border-lumina-highlight rounded-xl mt-4 animate-in slide-in-from-top-2 duration-200">
            <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold uppercase text-white bg-lumina-accent/20 text-lumina-accent px-2 py-0.5 rounded border border-lumina-accent/20">{section.type.replace('_', ' ')}</span>
                <button onClick={() => onDelete(section.id)} className="text-lumina-muted hover:text-rose-500 transition-colors"><Trash2 size={14}/></button>
            </div>
            
            {section.type !== 'GALLERY' && section.type !== 'PRICING' && section.type !== 'TESTIMONIALS' && section.type !== 'FAQ' && section.type !== 'MAP_LOCATION' && (
                <div>
                    <label className="text-[10px] text-lumina-muted uppercase block mb-1 font-bold">Headline</label>
                    <input 
                        value={section.content.headline || ''}
                        onChange={(e) => onUpdate(section.id, { headline: e.target.value })}
                        className="w-full bg-lumina-surface border border-lumina-highlight rounded-lg p-2 text-xs text-white focus:border-lumina-accent outline-none"
                    />
                </div>
            )}
            
            {(section.type === 'HERO' || section.type === 'TEXT_IMAGE' || section.type === 'CTA_BANNER') && (
                <div>
                    <label className="text-[10px] text-lumina-muted uppercase block mb-1 font-bold">Description</label>
                    <textarea 
                        value={section.content.description || ''}
                        onChange={(e) => onUpdate(section.id, { description: e.target.value })}
                        className="w-full bg-lumina-surface border border-lumina-highlight rounded-lg p-2 text-xs text-white focus:border-lumina-accent outline-none min-h-[80px]"
                    />
                </div>
            )}
            
            {(section.type === 'HERO' || section.type === 'TEXT_IMAGE') && (
                <div>
                    <label className="text-[10px] text-lumina-muted uppercase block mb-1 font-bold">Image URL</label>
                    <div className="flex gap-2">
                        <input 
                            value={section.content.image || ''}
                            onChange={(e) => onUpdate(section.id, { image: e.target.value })}
                            className="w-full bg-lumina-surface border border-lumina-highlight rounded-lg p-2 text-xs text-white focus:border-lumina-accent outline-none"
                        />
                        {section.content.image && <img src={section.content.image} className="w-8 h-8 rounded object-cover border border-lumina-highlight" />}
                    </div>
                </div>
            )}

            {section.type === 'HERO' && (
                <div>
                    <label className="text-[10px] text-lumina-muted uppercase block mb-1 font-bold flex items-center gap-1"><Video size={10}/> Video Background URL (Optional)</label>
                    <input 
                        placeholder="https://... (mp4/webm)"
                        value={section.content.videoUrl || ''}
                        onChange={(e) => onUpdate(section.id, { videoUrl: e.target.value })}
                        className="w-full bg-lumina-surface border border-lumina-highlight rounded-lg p-2 text-xs text-white focus:border-lumina-accent outline-none"
                    />
                </div>
            )}
            
            {section.type === 'TEXT_IMAGE' && (
                <div>
                    <label className="text-[10px] text-lumina-muted uppercase block mb-1 font-bold">Layout</label>
                    <div className="flex bg-lumina-surface rounded-lg p-1 border border-lumina-highlight">
                        {['LEFT', 'RIGHT', 'CENTER'].map((layout) => (
                            <button 
                                key={layout}
                                onClick={() => onUpdate(section.id, { layout })}
                                className={`flex-1 text-[10px] font-bold py-1.5 rounded ${section.content.layout === layout ? 'bg-lumina-highlight text-white' : 'text-lumina-muted'}`}
                            >
                                {layout}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            
            {section.type === 'FEATURES' && (
                <div>
                    <label className="text-[10px] text-lumina-muted uppercase block mb-1 font-bold">Features List</label>
                    {section.content.items?.map((item, idx) => (
                        <div key={idx} className="mb-2 pb-2 border-b border-lumina-highlight/50 last:border-0">
                            <input 
                                value={item.title} 
                                onChange={(e) => {
                                    const newItems = [...(section.content.items || [])];
                                    newItems[idx].title = e.target.value;
                                    onUpdate(section.id, { items: newItems });
                                }}
                                className="w-full bg-transparent border-none p-1 text-xs text-white font-bold placeholder-gray-600 focus:ring-0"
                                placeholder="Title"
                            />
                            <input 
                                value={item.text} 
                                onChange={(e) => {
                                    const newItems = [...(section.content.items || [])];
                                    newItems[idx].text = e.target.value;
                                    onUpdate(section.id, { items: newItems });
                                }}
                                className="w-full bg-transparent border-none p-1 text-xs text-lumina-muted placeholder-gray-700 focus:ring-0"
                                placeholder="Description"
                            />
                        </div>
                    ))}
                    <button 
                        onClick={() => onUpdate(section.id, { items: [...(section.content.items || []), { title: 'New Feature', text: 'Description here.' }] })}
                        className="w-full py-1.5 border border-dashed border-lumina-highlight rounded text-[10px] text-lumina-muted hover:text-white hover:border-lumina-accent"
                    >
                        + Add Feature
                    </button>
                </div>
            )}
            
            {section.type === 'CTA_BANNER' && (
                <div className="space-y-3">
                    <div>
                        <label className="text-[10px] text-lumina-muted uppercase block mb-1 font-bold">Button Text</label>
                        <input 
                            value={section.content.buttonText || ''}
                            onChange={(e) => onUpdate(section.id, { buttonText: e.target.value })}
                            className="w-full bg-lumina-surface border border-lumina-highlight rounded-lg p-2 text-xs text-white focus:border-lumina-accent outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-lumina-muted uppercase block mb-1 font-bold flex items-center gap-1"><MousePointerClick size={10}/> Action Type</label>
                        <select 
                            value={section.content.bookingMode || 'INSTANT'} 
                            onChange={(e) => onUpdate(section.id, { bookingMode: e.target.value })}
                            className="w-full bg-lumina-surface border border-lumina-highlight rounded-lg p-2 text-xs text-white focus:border-lumina-accent outline-none"
                        >
                            <option value="INSTANT">Scroll to Booking</option>
                            <option value="INQUIRY">Scroll to Inquiry Form</option>
                        </select>
                    </div>
                </div>
            )}

            {section.type === 'MAP_LOCATION' && (
                <div className="space-y-3">
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="text-[10px] text-lumina-muted uppercase block mb-1 font-bold">Latitude</label>
                            <input 
                                type="number" step="0.0001"
                                value={section.content.mapConfig?.lat || -6.200000}
                                onChange={(e) => onUpdate(section.id, { mapConfig: { ...section.content.mapConfig, lat: parseFloat(e.target.value) } })}
                                className="w-full bg-lumina-surface border border-lumina-highlight rounded-lg p-2 text-xs text-white"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-[10px] text-lumina-muted uppercase block mb-1 font-bold">Longitude</label>
                            <input 
                                type="number" step="0.0001"
                                value={section.content.mapConfig?.lng || 106.816666}
                                onChange={(e) => onUpdate(section.id, { mapConfig: { ...section.content.mapConfig, lng: parseFloat(e.target.value) } })}
                                className="w-full bg-lumina-surface border border-lumina-highlight rounded-lg p-2 text-xs text-white"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] text-lumina-muted uppercase block mb-1 font-bold">Label</label>
                        <input 
                            value={section.content.mapConfig?.label || 'Our Studio'}
                            onChange={(e) => onUpdate(section.id, { mapConfig: { ...section.content.mapConfig, label: e.target.value } })}
                            className="w-full bg-lumina-surface border border-lumina-highlight rounded-lg p-2 text-xs text-white"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default SiteSectionEditor;
