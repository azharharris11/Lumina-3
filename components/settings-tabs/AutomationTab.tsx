
import React, { useState } from 'react';
import { StudioConfig, WorkflowAutomation, ProjectStatus } from '../../types';
import { X, Trash2, Play } from 'lucide-react';
import { useStudio } from '../../contexts/StudioContext';

interface AutomationTabProps {
    config: StudioConfig;
    setConfig: (config: StudioConfig) => void;
    onUpdateConfig: (config: StudioConfig) => void;
}

const AutomationTab: React.FC<AutomationTabProps> = ({ config, setConfig, onUpdateConfig }) => {
    const { triggerAutomation } = useStudio();
    const [newAutomation, setNewAutomation] = useState<Partial<WorkflowAutomation>>({ triggerStatus: 'SHOOTING', tasks: [] });
    const [taskInput, setTaskInput] = useState('');

    const handleAddTaskToAutomation = () => { 
        if(taskInput.trim()) { 
            setNewAutomation(prev => ({ ...prev, tasks: [...(prev.tasks || []), taskInput.trim()] })); 
            setTaskInput(''); 
        } 
    };

    const handleAddAutomation = () => { 
        if(newAutomation.triggerStatus && newAutomation.tasks && newAutomation.tasks.length > 0) { 
            const automation: WorkflowAutomation = { id: `wf-${Date.now()}`, triggerStatus: newAutomation.triggerStatus, tasks: newAutomation.tasks }; 
            const updatedConfig = { ...config, workflowAutomations: [...(config.workflowAutomations || []), automation] }; 
            setConfig(updatedConfig); 
            onUpdateConfig(updatedConfig); // Immediate Save
            setNewAutomation({ triggerStatus: 'SHOOTING', tasks: [] }); 
        } 
    };

    const handleDeleteAutomation = (id: string) => { 
        const updatedConfig = { ...config, workflowAutomations: (config.workflowAutomations || []).filter(a => a.id !== id) }; 
        setConfig(updatedConfig); 
        onUpdateConfig(updatedConfig); 
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">Workflow Automation</h2>
            
            {/* Info Box */}
            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-200 text-sm">
                <p><strong>Note:</strong> These automations run instantly within the app. No CLI or backend setup required.</p>
            </div>

            <div className="bg-lumina-base border border-lumina-highlight rounded-xl p-6 mb-6">
                <h3 className="font-bold text-white mb-4">Create New Rule</h3>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-lumina-muted">When booking status becomes</span>
                        <select 
                            className="bg-lumina-surface border border-lumina-highlight text-white rounded-lg p-2 text-sm font-bold"
                            value={newAutomation.triggerStatus}
                            onChange={e => setNewAutomation({...newAutomation, triggerStatus: e.target.value as ProjectStatus})}
                        >
                            {['BOOKED', 'SHOOTING', 'CULLING', 'EDITING', 'REVIEW', 'COMPLETED'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-lumina-muted block mb-2">Add Tasks to Checklist:</label>
                        <div className="flex gap-2 mb-2">
                            <input 
                                placeholder="e.g. Send Gallery Link" 
                                value={taskInput} 
                                onChange={e => setTaskInput(e.target.value)} 
                                className="flex-1 bg-lumina-surface border border-lumina-highlight rounded-lg p-2 text-white text-sm"
                                onKeyDown={e => e.key === 'Enter' && handleAddTaskToAutomation()}
                            />
                            <button onClick={handleAddTaskToAutomation} className="bg-lumina-highlight px-3 rounded-lg text-white font-bold">+</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {newAutomation.tasks?.map((t, i) => (
                                <span key={i} className="bg-lumina-highlight px-2 py-1 rounded text-xs text-white flex items-center gap-2">
                                    {t} <button onClick={() => setNewAutomation(prev => ({...prev, tasks: prev.tasks?.filter((_, idx) => idx !== i)}))}><X size={12}/></button>
                                </span>
                            ))}
                        </div>
                    </div>
                    <button 
                        onClick={handleAddAutomation} 
                        disabled={!newAutomation.tasks || newAutomation.tasks.length === 0}
                        className="w-full py-3 bg-lumina-accent text-lumina-base font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Save Automation Rule
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                {config.workflowAutomations?.map((automation) => (
                    <div key={automation.id} className="bg-lumina-base border border-lumina-highlight rounded-xl p-4 flex justify-between items-center">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs text-lumina-muted uppercase font-bold">Trigger:</span>
                                <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-xs font-bold">{automation.triggerStatus}</span>
                            </div>
                            <p className="text-sm text-white">{automation.tasks.length} tasks will be added.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => triggerAutomation(automation.triggerStatus)}
                                className="text-xs font-bold bg-lumina-highlight hover:bg-white hover:text-black text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                                title="Simulate this rule"
                            >
                                <Play size={12} fill="currentColor"/> Test Run
                            </button>
                            <button onClick={() => handleDeleteAutomation(automation.id)} className="text-lumina-muted hover:text-rose-500 transition-colors p-2"><Trash2 size={18}/></button>
                        </div>
                    </div>
                ))}
                {(!config.workflowAutomations || config.workflowAutomations.length === 0) && (
                    <p className="text-center text-lumina-muted py-8">No active automations.</p>
                )}
            </div>
        </div>
    );
};

export default AutomationTab;
