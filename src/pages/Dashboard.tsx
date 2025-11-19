import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI } from '@google/genai';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Bot, Users, Settings, Edit2, Save, LayoutDashboard, Zap, Dumbbell, BookCopy, BrainCircuit, User, BarChart3, Clock, AlertTriangle } from 'lucide-react';
import { SettingsContext, TeamContext, TeamProfile } from '../App';
import { mockPlayers, Player, mockTeamIntel, TeamIntel } from './TeamData';

// MOCK DATA & TYPES
const performanceData = [
    { name: 'G1', offYards: 380, defStops: 8 },
    { name: 'G2', offYards: 420, defStops: 10 },
    { name: 'G3', offYards: 350, defStops: 7 },
    { name: 'G4', offYards: 480, defStops: 12 },
    { name: 'G5', offYards: 520, defStops: 14 },
    { name: 'G6', offYards: 450, defStops: 11 },
];


interface Task {
    id: number;
    text: string;
    completed: boolean;
}

// --- WIDGETS ---

const TeamProfileWidget: React.FC = () => {
    const { teamProfile, setTeamProfile } = useContext(TeamContext);
    const [editingProfile, setEditingProfile] = useState<TeamProfile>(teamProfile);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        setEditingProfile(teamProfile);
    }, [teamProfile]);

    const handleSave = () => {
        if(editingProfile.name.trim()) {
            setTeamProfile(editingProfile);
        }
        setIsEditing(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditingProfile({ ...editingProfile, [e.target.name]: e.target.value });
    };

    if (isEditing) {
        return (
             <div className="bg-slate-800 rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2"><Users /> Edit Team Profile</h2>
                    <button onClick={handleSave} className="flex items-center gap-1 text-sm text-green-400 hover:text-white bg-green-500/10 px-3 py-1 rounded-md">
                        <Save size={14} /> Save
                    </button>
                </div>
                <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div><label className="text-xs text-slate-400">Team Name</label><input type="text" name="name" value={editingProfile.name} onChange={handleChange} className="w-full p-2 bg-slate-700 rounded-lg" /></div>
                        <div><label className="text-xs text-slate-400">Mascot</label><input type="text" name="mascot" value={editingProfile.mascot} onChange={handleChange} className="w-full p-2 bg-slate-700 rounded-lg" /></div>
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div><label className="text-xs text-slate-400">Offensive Scheme</label><input type="text" name="offensiveScheme" value={editingProfile.offensiveScheme} onChange={handleChange} className="w-full p-2 bg-slate-700 rounded-lg" /></div>
                        <div><label className="text-xs text-slate-400">Defensive Scheme</label><input type="text" name="defensiveScheme" value={editingProfile.defensiveScheme} onChange={handleChange} className="w-full p-2 bg-slate-700 rounded-lg" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 items-center">
                         <div><label className="text-xs text-slate-400">Primary Color</label><input type="color" name="primaryColor" value={editingProfile.primaryColor} onChange={handleChange} className="w-full h-10 p-1 bg-slate-700 rounded-lg" /></div>
                         <div><label className="text-xs text-slate-400">Secondary Color</label><input type="color" name="secondaryColor" value={editingProfile.secondaryColor} onChange={handleChange} className="w-full h-10 p-1 bg-slate-700 rounded-lg" /></div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-slate-800 rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><Users /> My Team Profile</h2>
                <button onClick={() => setIsEditing(true)} className="flex items-center gap-1 text-sm text-slate-400 hover:text-white">
                    <Edit2 size={14} /> Edit
                </button>
            </div>
            <div className="mt-4 space-y-3">
                <div>
                    <p className="text-2xl font-bold" style={{ color: teamProfile.primaryColor }}>{teamProfile.name} <span style={{ color: teamProfile.secondaryColor }}>{teamProfile.mascot}</span></p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full border-2 border-slate-600" style={{backgroundColor: teamProfile.primaryColor}}></div>
                    <div className="w-6 h-6 rounded-full border-2 border-slate-600" style={{backgroundColor: teamProfile.secondaryColor}}></div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2 text-sm">
                    <div><span className="text-slate-400 block text-xs">Offensive Scheme</span><p className="font-semibold">{teamProfile.offensiveScheme}</p></div>
                    <div><span className="text-slate-400 block text-xs">Defensive Scheme</span><p className="font-semibold">{teamProfile.defensiveScheme}</p></div>
                </div>
            </div>
        </div>
    )
}

const UpcomingGameWidget: React.FC<{ teamIntel: TeamIntel | undefined }> = ({ teamIntel }) => {
    const navigate = useNavigate();
    if (!teamIntel) {
        return (
            <div className="bg-slate-800 rounded-xl shadow-lg p-6 text-center">
                <p className="text-slate-400">No upcoming opponent intel found.</p>
                <button onClick={() => navigate('/training')} className="mt-2 text-sm text-brand-accent hover:underline">Add Intel</button>
            </div>
        )
    }
    return (
        <div className="bg-slate-800 rounded-xl shadow-lg p-6">
            <p className="text-sm text-slate-400">Upcoming Game</p>
            <h2 className="text-2xl font-bold text-white mb-3">vs. {teamIntel.teamName}</h2>
            <div className="space-y-2">
                <p className="text-sm text-slate-300"><strong className="text-red-400">Offense:</strong> {teamIntel.offensiveTendencies.substring(0, 80)}...</p>
                <p className="text-sm text-slate-300"><strong className="text-blue-400">Defense:</strong> {teamIntel.defensiveTendencies.substring(0, 80)}...</p>
            </div>
            <button onClick={() => navigate('/game-time')} className="mt-4 w-full bg-brand-primary hover:bg-brand-dark font-bold py-2 rounded-lg transition">Go to Game Time Hub</button>
        </div>
    )
}

const StatLeadersWidget: React.FC<{ players: Player[] }> = ({ players }) => {
    const navigate = useNavigate();
    const qbLeader = players.find(p => p.position === 'QB');
    const wrLeader = players.find(p => p.position === 'WR');
    const defLeader = players.find(p => p.position === 'MLB');

    return (
        <div className="bg-slate-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Stat Leaders</h2>
            <div className="space-y-3">
                {qbLeader && <StatLeaderRow player={qbLeader} />}
                {wrLeader && <StatLeaderRow player={wrLeader} />}
                {defLeader && <StatLeaderRow player={defLeader} />}
            </div>
            <button onClick={() => navigate('/roster')} className="mt-4 w-full bg-slate-600 hover:bg-slate-500 font-bold py-2 rounded-lg transition">View Full Roster</button>
        </div>
    );
};

const StatLeaderRow: React.FC<{ player: Player }> = ({ player }) => (
    <div className="flex items-center justify-between bg-slate-700/50 p-2 rounded-md">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center font-bold text-sm">{player.avatar}</div>
            <div>
                <p className="font-semibold text-white text-sm">{player.name}</p>
                <p className="text-xs text-slate-400">{player.position}</p>
            </div>
        </div>
        <div className="text-right">
            <p className="font-bold text-brand-accent">{player.stats[0].value}</p>
            <p className="text-xs text-slate-400">{player.stats[0].name}</p>
        </div>
    </div>
);


const QuickActionsWidget: React.FC = () => {
    const navigate = useNavigate();
    const actions = [
        { name: 'Game Time Hub', icon: Zap, path: '/game-time', color: 'text-green-400' },
        { name: 'Practice Planner', icon: Dumbbell, path: '/practice', color: 'text-yellow-400' },
        { name: 'Playbook', icon: BookCopy, path: '/playbook', color: 'text-blue-400' },
        { name: 'AI Training', icon: BrainCircuit, path: '/training', color: 'text-purple-400' },
    ];

    return (
        <div className="bg-slate-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
                {actions.map(action => (
                    <button key={action.name} onClick={() => navigate(action.path)} className="bg-slate-700 hover:bg-slate-600 p-4 rounded-lg text-center transition">
                        <action.icon className={`w-8 h-8 mx-auto mb-2 ${action.color}`} />
                        <span className="font-semibold text-sm">{action.name}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}

// --- MAIN DASHBOARD COMPONENT ---

const Dashboard: React.FC = () => {
    const [players] = useState<Player[]>(mockPlayers);
    const [teamIntelList] = useState<TeamIntel[]>(mockTeamIntel);
    
    return (
        <div className="p-4 sm:p-6 md:p-8">
            <h1 className="text-3xl font-bold mb-8">Coach's Dashboard</h1>
            
            {/* Top Row Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <UpcomingGameWidget teamIntel={teamIntelList[0]} />
                <StatLeadersWidget players={players} />
                <QuickActionsWidget />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance Chart */}
                <div className="bg-slate-800 rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Team Performance Trends</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={performanceData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="name" tick={{ fill: '#94a3b8' }} fontSize={12} />
                                <YAxis yAxisId="left" tick={{ fill: '#94a3b8' }} fontSize={12} />
                                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8' }} fontSize={12} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="offYards" name="Off. Yards" stroke="#3b82f6" strokeWidth={2} />
                                <Line yAxisId="right" type="monotone" dataKey="defStops" name="Def. Stops" stroke="#84cc16" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Team Profile */}
                <TeamProfileWidget />
            </div>
        </div>
    );
};

export default Dashboard;