
import React from 'react';
import { MessageCircle, RefreshCw, Circle } from 'lucide-react';
import { ActivityLog } from '../../types';

interface ProjectLogsProps {
  logs?: ActivityLog[];
}

const ProjectLogs: React.FC<ProjectLogsProps> = ({ logs = [] }) => {
  return (
    <div className="space-y-4">
        {logs.map((log) => (
            <div key={log.id} className="flex gap-3 p-3 border-b border-lumina-highlight/50 last:border-0">
                <div className="mt-1">
                    {log.action === 'COMMUNICATION' ? (
                        <MessageCircle size={14} className="text-emerald-400" />
                    ) : log.action === 'STATUS_CHANGE' ? (
                        <RefreshCw size={14} className="text-blue-400" />
                    ) : (
                        <Circle size={8} className="text-lumina-muted fill-lumina-muted" />
                    )}
                </div>
                <div>
                    <p className="text-xs text-white font-bold">{log.action.replace('_', ' ')}</p>
                    <p className="text-xs text-lumina-muted">{log.details}</p>
                    <p className="text-[10px] text-lumina-muted/50 mt-1">{new Date(log.timestamp).toLocaleString()} by {log.userName}</p>
                </div>
            </div>
        ))}
        {logs.length === 0 && <p className="text-center text-lumina-muted text-xs py-4">No activity recorded.</p>}
    </div>
  );
};

export default ProjectLogs;
