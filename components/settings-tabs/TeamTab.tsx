
import React, { useState, useEffect } from 'react';
import { User } from '../../types';

interface TeamTabProps {
    currentUser: User | null;
    onUpdateProfile: (user: User) => void;
    googleToken: string | null;
    onConnectGoogle: () => void;
    onDeleteAccount: () => void;
}

const TeamTab: React.FC<TeamTabProps> = ({ currentUser, onUpdateProfile, googleToken, onConnectGoogle, onDeleteAccount }) => {
    const [profileForm, setProfileForm] = useState<Partial<User>>({ name: '', phone: '', avatar: '', specialization: '' });

    useEffect(() => {
        if (currentUser) {
            setProfileForm({ id: currentUser.id, name: currentUser.name, phone: currentUser.phone, avatar: currentUser.avatar, specialization: currentUser.specialization || '' });
        }
    }, [currentUser]);

    const handleSaveProfile = () => {
        if (currentUser && profileForm.name) {
            onUpdateProfile({ ...currentUser, ...profileForm } as User);
            alert("Profile updated successfully!");
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white mb-4">My Profile</h2>
                <div className="bg-lumina-base border border-lumina-highlight rounded-xl p-6">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <img src={profileForm.avatar || `https://ui-avatars.com/api/?name=${profileForm.name}`} className="w-20 h-20 rounded-full border-2 border-lumina-highlight" />
                        <div className="flex-1 w-full space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="text-xs font-bold text-lumina-muted block mb-1">Display Name</label><input value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full bg-lumina-surface border border-lumina-highlight rounded-lg p-2 text-white"/></div>
                                <div><label className="text-xs font-bold text-lumina-muted block mb-1">Phone</label><input value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} className="w-full bg-lumina-surface border border-lumina-highlight rounded-lg p-2 text-white"/></div>
                            </div>
                            <button onClick={handleSaveProfile} className="bg-lumina-highlight text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-lumina-accent hover:text-lumina-base transition-colors">Update Profile</button>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-white mb-4">Integrations</h2>
                <div className="space-y-3">
                    <div className="bg-lumina-base border border-lumina-highlight rounded-xl p-6 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center"><img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" className="w-8 h-8"/></div>
                            <div>
                                <h3 className="font-bold text-white">Google Calendar & Drive</h3>
                                <p className="text-xs text-lumina-muted">{googleToken ? 'Connected' : 'Not connected'}</p>
                            </div>
                        </div>
                        <button onClick={onConnectGoogle} className={`px-4 py-2 rounded-lg font-bold text-sm ${googleToken ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50' : 'bg-blue-600 text-white'}`}>
                            {googleToken ? 'Disconnect' : 'Connect'}
                        </button>
                    </div>
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-rose-500 mb-4">Danger Zone</h2>
                <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-6 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-white">Delete Account</h3>
                        <p className="text-xs text-lumina-muted">Permanently delete your studio and all data.</p>
                    </div>
                    <button onClick={onDeleteAccount} className="px-4 py-2 bg-rose-500 text-white rounded-lg font-bold text-sm hover:bg-rose-600">Delete Account</button>
                </div>
            </div>
        </div>
    );
};

export default TeamTab;
