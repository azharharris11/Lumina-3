
import React from 'react';
import { StudioConfig } from '../../types';
import { Save, CheckCircle2, Bell, MessageSquare } from 'lucide-react';

interface TemplatesTabProps {
    config: StudioConfig;
    setConfig: (config: StudioConfig) => void;
    onSave: () => void;
}

const TemplatesTab: React.FC<TemplatesTabProps> = ({ config, setConfig, onSave }) => {
    const handleTemplateChange = (key: 'booking' | 'reminder' | 'thanks', value: string) => {
        setConfig({
            ...config,
            templates: { ...config.templates, [key]: value }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">WhatsApp Templates</h2>
                    <p className="text-sm text-lumina-muted">Customize the automated messages sent to clients.</p>
                </div>
                <button onClick={onSave} className="bg-lumina-accent text-lumina-base px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                    <Save size={18} /> Save Templates
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div className="bg-lumina-base border border-lumina-highlight rounded-xl p-4">
                    <h3 className="text-white font-bold mb-2 flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-400"/> Booking Confirmation</h3>
                    <p className="text-xs text-lumina-muted mb-2">Sent when a booking is created.</p>
                    <textarea 
                        className="w-full bg-lumina-surface border border-lumina-highlight rounded-lg p-3 text-white text-sm font-mono h-32 focus:border-lumina-accent outline-none"
                        value={config.templates.booking}
                        onChange={e => handleTemplateChange('booking', e.target.value)}
                    />
                </div>

                <div className="bg-lumina-base border border-lumina-highlight rounded-xl p-4">
                    <h3 className="text-white font-bold mb-2 flex items-center gap-2"><Bell size={16} className="text-amber-400"/> Payment Reminder</h3>
                    <p className="text-xs text-lumina-muted mb-2">Sent to remind clients of outstanding balance.</p>
                    <textarea 
                        className="w-full bg-lumina-surface border border-lumina-highlight rounded-lg p-3 text-white text-sm font-mono h-32 focus:border-lumina-accent outline-none"
                        value={config.templates.reminder}
                        onChange={e => handleTemplateChange('reminder', e.target.value)}
                    />
                </div>

                <div className="bg-lumina-base border border-lumina-highlight rounded-xl p-4">
                    <h3 className="text-white font-bold mb-2 flex items-center gap-2"><MessageSquare size={16} className="text-blue-400"/> Thank You Note</h3>
                    <p className="text-xs text-lumina-muted mb-2">Sent after session completion.</p>
                    <textarea 
                        className="w-full bg-lumina-surface border border-lumina-highlight rounded-lg p-3 text-white text-sm font-mono h-32 focus:border-lumina-accent outline-none"
                        value={config.templates.thanks}
                        onChange={e => handleTemplateChange('thanks', e.target.value)}
                    />
                </div>
            </div>

            <div className="p-4 bg-lumina-highlight/10 border border-lumina-highlight rounded-xl">
                <h4 className="text-xs font-bold text-lumina-muted uppercase mb-2">Available Variables</h4>
                <div className="flex flex-wrap gap-2 text-xs text-white font-mono">
                    <span className="bg-lumina-base px-2 py-1 rounded border border-lumina-highlight">{`{clientName}`}</span>
                    <span className="bg-lumina-base px-2 py-1 rounded border border-lumina-highlight">{`{package}`}</span>
                    <span className="bg-lumina-base px-2 py-1 rounded border border-lumina-highlight">{`{date}`}</span>
                    <span className="bg-lumina-base px-2 py-1 rounded border border-lumina-highlight">{`{time}`}</span>
                    <span className="bg-lumina-base px-2 py-1 rounded border border-lumina-highlight">{`{studio}`}</span>
                    <span className="bg-lumina-base px-2 py-1 rounded border border-lumina-highlight">{`{balance}`}</span>
                    <span className="bg-lumina-base px-2 py-1 rounded border border-lumina-highlight">{`{bankName}`}</span>
                    <span className="bg-lumina-base px-2 py-1 rounded border border-lumina-highlight">{`{bankAccount}`}</span>
                </div>
            </div>
        </div>
    );
};

export default TemplatesTab;
