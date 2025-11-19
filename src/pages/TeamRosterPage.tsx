import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, ArrowLeft, UserPlus, Edit, X, Trash2, Plus, Camera } from 'lucide-react';
import { mockPlayers, Player } from './TeamData';

// Re-usable modal for adding a player
const AddPlayerModal: React.FC<{ 
    onAdd: (playerData: Omit<Player, 'id' | 'stats' | 'radarData' | 'mainMetricName' | 'avatar' | 'status' | 'coachsNotes'>) => void;
    closeModal: () => void 
}> = ({ onAdd, closeModal }) => {
    const [name, setName] = useState('');
    const [position, setPosition] = useState('');
    const [jerseyNumber, setJerseyNumber] = useState('');
    const [parentGuardianName, setParentGuardianName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [gpa, setGpa] = useState('');
    const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoUrl(reader.result as string);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && position) {
            onAdd({ 
                name, 
                position,
                jerseyNumber,
                parentGuardianName,
                phoneNumber,
                gpa: gpa ? parseFloat(gpa) : undefined,
                photoUrl,
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 w-full max-w-md rounded-xl shadow-2xl">
                 <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2"><UserPlus /> Add New Player</h2>
                    <button onClick={closeModal} className="p-2 rounded-full hover:bg-slate-700"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-slate-700 rounded-full flex-shrink-0 flex items-center justify-center relative">
                            {photoUrl ? <img src={photoUrl} alt="preview" className="w-full h-full object-cover rounded-full" /> : <Camera className="text-slate-500" />}
                             <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden"/>
                             <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/50 rounded-full opacity-0 hover:opacity-100 flex items-center justify-center transition"><Edit size={20}/></button>
                        </div>
                        <div className="w-full space-y-2">
                             <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Player Name" className="w-full p-2 bg-slate-700 rounded-lg border border-slate-600" />
                             <input type="text" value={position} onChange={e => setPosition(e.target.value)} required placeholder="Position" className="w-full p-2 bg-slate-700 rounded-lg border border-slate-600" />
                        </div>
                    </div>
                    <input type="text" value={jerseyNumber} onChange={e => setJerseyNumber(e.target.value)} placeholder="Jersey Number" className="w-full p-2 bg-slate-700 rounded-lg border border-slate-600" />
                    <input type="text" value={parentGuardianName} onChange={e => setParentGuardianName(e.target.value)} placeholder="Parent/Guardian Name" className="w-full p-2 bg-slate-700 rounded-lg border border-slate-600" />
                    <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="Phone Number" className="w-full p-2 bg-slate-700 rounded-lg border border-slate-600" />
                    <input type="number" step="0.1" value={gpa} onChange={e => setGpa(e.target.value)} placeholder="GPA" className="w-full p-2 bg-slate-700 rounded-lg border border-slate-600" />
                    <div className="pt-2">
                        <button type="submit" className="w-full bg-brand-primary hover:bg-brand-dark py-3 rounded-lg font-bold">Add Player</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Modal for editing a player
const EditPlayerModal: React.FC<{ player: Player; onSave: (updatedPlayer: Player) => void; closeModal: () => void }> = ({ player, onSave, closeModal }) => {
    const [formData, setFormData] = useState<Player>(player);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: name === 'gpa' ? parseFloat(value) : value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({...formData, photoUrl: reader.result as string});
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    const handleStatChange = (index: number, field: 'name' | 'value', value: string) => {
        const newStats = [...formData.stats];
        const oldStat = newStats[index];
        newStats[index] = { ...oldStat, [field]: value };
        setFormData({ ...formData, stats: newStats });
    };

    const addStat = () => {
        setFormData({
            ...formData,
            stats: [...formData.stats, { name: '', value: '' }]
        });
    };

    const removeStat = (index: number) => {
        const newStats = formData.stats.filter((_, i) => i !== index);
        setFormData({ ...formData, stats: newStats });
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 w-full max-w-lg rounded-xl shadow-2xl">
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2"><Edit /> Edit Player: {player.name}</h2>
                    <button onClick={closeModal} className="p-2 rounded-full hover:bg-slate-700"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-slate-700 rounded-full flex-shrink-0 flex items-center justify-center relative">
                            {formData.photoUrl ? <img src={formData.photoUrl} alt="player" className="w-full h-full object-cover rounded-full" /> : <Camera className="text-slate-500" />}
                             <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden"/>
                             <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/50 rounded-full opacity-0 hover:opacity-100 flex items-center justify-center transition"><Edit size={20}/></button>
                        </div>
                        <div className="w-full space-y-2">
                             <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Player Name" className="w-full p-2 bg-slate-700 rounded-lg border border-slate-600" />
                             <input type="text" name="position" value={formData.position} onChange={handleChange} required placeholder="Position" className="w-full p-2 bg-slate-700 rounded-lg border border-slate-600" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" name="jerseyNumber" value={formData.jerseyNumber || ''} onChange={handleChange} placeholder="Jersey #" className="w-full p-2 bg-slate-700 rounded-lg border border-slate-600" />
                        <input type="number" step="0.1" name="gpa" value={formData.gpa || ''} onChange={handleChange} placeholder="GPA" className="w-full p-2 bg-slate-700 rounded-lg border border-slate-600" />
                    </div>
                     <input type="text" name="parentGuardianName" value={formData.parentGuardianName || ''} onChange={handleChange} placeholder="Parent/Guardian Name" className="w-full p-2 bg-slate-700 rounded-lg border border-slate-600" />
                     <input type="tel" name="phoneNumber" value={formData.phoneNumber || ''} onChange={handleChange} placeholder="Phone Number" className="w-full p-2 bg-slate-700 rounded-lg border border-slate-600" />

                    <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 bg-slate-700 rounded-lg border border-slate-600">
                        <option value="Active">Active</option>
                        <option value="Injured">Injured</option>
                        <option value="Benched">Benched</option>
                    </select>
                    
                     <textarea 
                        name="coachsNotes" 
                        value={formData.coachsNotes || ''} 
                        onChange={handleChange} 
                        rows={3}
                        placeholder="Coach's Notes (AI Correction)..."
                        className="w-full p-2 bg-slate-700 rounded-lg border border-slate-600 resize-none" 
                    />

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Player Stats</label>
                        <div className="space-y-2">
                            {formData.stats.map((stat, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <input type="text" placeholder="Stat Name (e.g., Tackles)" value={stat.name} onChange={e => handleStatChange(index, 'name', e.target.value)} className="w-1/2 p-2 bg-slate-600 rounded-lg" />
                                    <input type="text" placeholder="Value" value={stat.value} onChange={e => handleStatChange(index, 'value', e.target.value)} className="w-1/2 p-2 bg-slate-600 rounded-lg" />
                                    <button type="button" onClick={() => removeStat(index)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={addStat} className="mt-2 text-sm text-brand-accent hover:underline flex items-center gap-1">
                            <Plus size={14} /> Add Stat
                        </button>
                    </div>

                    <div className="pt-2">
                        <button type="submit" className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-lg font-bold">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const TeamRosterPage: React.FC = () => {
    const [players, setPlayers] = useState<Player[]>(mockPlayers);
    const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    const handleAddPlayer = (newPlayerData: Omit<Player, 'id' | 'stats' | 'radarData' | 'mainMetricName' | 'avatar' | 'status' | 'coachsNotes'>) => {
        const newPlayer: Player = {
            id: Date.now(),
            name: newPlayerData.name,
            position: newPlayerData.position,
            avatar: newPlayerData.name.split(' ').map(n => n[0]).join(''),
            stats: [{ name: 'Tackles', value: 0 }, { name: 'Sacks', value: 0 }],
            radarData: [],
            mainMetricName: 'N/A',
            status: 'Active',
            coachsNotes: '',
            jerseyNumber: newPlayerData.jerseyNumber,
            parentGuardianName: newPlayerData.parentGuardianName,
            phoneNumber: newPlayerData.phoneNumber,
            gpa: newPlayerData.gpa,
            photoUrl: newPlayerData.photoUrl
        };
        setPlayers(prev => [newPlayer, ...prev]);
        setIsAddModalOpen(false);
    };

    const handleSavePlayer = (updatedPlayer: Player) => {
        setPlayers(players.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
        setEditingPlayer(null);
    };
    
    const getStatusColor = (status: Player['status']) => {
        switch(status) {
            case 'Active': return 'bg-green-500/20 text-green-400';
            case 'Injured': return 'bg-red-500/20 text-red-400';
            case 'Benched': return 'bg-yellow-500/20 text-yellow-400';
        }
    }

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold flex items-center gap-3"><Users /> Manage Roster</h1>
                <button onClick={() => setIsAddModalOpen(true)} className="bg-brand-primary hover:bg-brand-dark text-white font-bold py-2 px-4 rounded-lg transition flex items-center gap-2 w-full sm:w-auto justify-center">
                    <UserPlus size={18} /> Add Player
                </button>
            </div>

             <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden hidden md:block">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-700">
                            <tr>
                                <th className="p-4">Player</th>
                                <th className="p-4">Position</th>
                                <th className="p-4">Jersey #</th>
                                <th className="p-4">Key Metric</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {players.map(player => (
                                <tr key={player.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            {player.photoUrl ? (
                                                <img src={player.photoUrl} alt={player.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                                            ) : (
                                                <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center font-bold flex-shrink-0">{player.avatar}</div>
                                            )}
                                            <span className="font-semibold">{player.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-300">{player.position}</td>
                                    <td className="p-4 text-slate-300 font-mono text-center">{player.jerseyNumber || '-'}</td>
                                    <td className="p-4 text-slate-300">
                                        <div>
                                            <span className="font-bold text-brand-accent">{player.stats[0]?.value}</span>
                                            <span className="text-xs ml-2">{player.stats[0]?.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(player.status)}`}>
                                            {player.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button onClick={() => setEditingPlayer(player)} className="bg-slate-600 hover:bg-brand-primary text-sm px-3 py-1 rounded-md transition flex items-center gap-1 mx-auto">
                                            <Edit size={14}/> Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {players.map(player => (
                    <div key={player.id} className="bg-slate-800 rounded-xl shadow-lg p-4">
                        <div className="flex items-center gap-4">
                             {player.photoUrl ? (
                                <img src={player.photoUrl} alt={player.name} className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
                            ) : (
                                <div className="w-16 h-16 bg-brand-primary rounded-full flex items-center justify-center font-bold text-2xl flex-shrink-0">{player.avatar}</div>
                            )}
                            <div className="flex-grow">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg">{player.name}</h3>
                                        <p className="text-sm text-slate-400">{player.position} #{player.jerseyNumber || 'N/A'}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(player.status)}`}>
                                        {player.status}
                                    </span>
                                </div>
                                <div className="text-sm mt-2">
                                    <span className="font-bold text-brand-accent">{player.stats[0]?.value} </span>
                                    <span className="text-slate-400">{player.stats[0]?.name}</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setEditingPlayer(player)} className="mt-4 w-full bg-slate-600 hover:bg-brand-primary text-sm py-2 rounded-md transition flex items-center gap-2 justify-center">
                            <Edit size={14}/> Edit Player
                        </button>
                    </div>
                ))}
            </div>


            {isAddModalOpen && <AddPlayerModal onAdd={handleAddPlayer} closeModal={() => setIsAddModalOpen(false)} />}
            {editingPlayer && <EditPlayerModal player={editingPlayer} onSave={handleSavePlayer} closeModal={() => setEditingPlayer(null)} />}
        </div>
    );
};

export default TeamRosterPage;