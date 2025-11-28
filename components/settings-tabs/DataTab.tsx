
import React from 'react';
import { Download } from 'lucide-react';

interface DataTabProps {
    onExportData: () => void;
}

const DataTab: React.FC<DataTabProps> = ({ onExportData }) => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">Data Management</h2>
            <div className="p-6 bg-lumina-base border border-lumina-highlight rounded-xl flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-white">Export Data</h3>
                    <p className="text-sm text-lumina-muted">Download a JSON backup of your studio configuration and packages.</p>
                </div>
                <button onClick={onExportData} className="flex items-center gap-2 px-4 py-2 bg-lumina-highlight hover:bg-white hover:text-black text-white rounded-lg font-bold transition-colors">
                    <Download size={18} /> Export JSON
                </button>
            </div>
        </div>
    );
};

export default DataTab;
