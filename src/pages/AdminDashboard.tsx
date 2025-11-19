import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, UserPlus, LogOut, X, RefreshCw, Eye, EyeOff, FileText, Server, GitBranch, Mail, CheckCircle, Edit, Trash2, Upload, Image as ImageIcon, Terminal, LogIn, AlertTriangle } from 'lucide-react';

// --- INTERFACES ---
interface Coach {
    id: number;
    name: string;
    email: string;
    team: string;
    status: 'Active' | 'Deactivated';
    teamLogo?: string; // Base64 encoded image
}

interface AuditLogEntry {
    id: number;
    timestamp: string;
    admin: string;
    action: string;
}

interface ConfirmationState {
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText: string;
    icon: React.ElementType;
    iconColor: string;
}


// --- MOCK DATA & CONSTANTS ---
const mockCoaches: Coach[] = [
    { id: 1, name: 'John Harbaugh', email: 'j.harbaugh@ravens.com', team: 'Baltimore Ravens High', status: 'Active' },
    { id: 2, name: 'Andy Reid', email: 'a.reid@chiefs.com', team: 'Kansas City Chiefs Prep', status: 'Active' },
    { id: 3, name: 'Sean McVay', email: 's.mcvay@rams.com', team: 'Los Angeles Rams Academy', status: 'Deactivated' },
];

const mockLogs: AuditLogEntry[] = [
    { id: 1, timestamp: '2024-07-28 10:05:12', admin: 'Trent Hill', action: 'Logged in to admin portal.' },
    { id: 2, timestamp: '2024-07-28 10:06:45', admin: 'Trent Hill', action: 'Deactivated coach account for S. McVay.' },
    { id: 3, timestamp: '2024-07-27 15:30:00', admin: 'System', action: 'Server health check passed.' },
];


const EMAIL_TEMPLATE_CONTENT = `
**Subject: Gaining a Competitive Edge for [School Mascot/Team Name]**

---

Dear Coach [Coach's Last Name],

In the constant pursuit of a championship, we know the biggest coaching challenge is often time—endless hours spent breaking down film, scouting opponents, and creating winning game plans.

What if you could automate the most time-consuming parts of your preparation, giving your staff more time to focus on coaching and player development?

That's why we built **Gridiron Intel by PixelLogics**, an all-in-one AI-powered football intelligence platform designed to give programs like yours a decisive edge. We’re helping teams save over 10+ hours a week while getting deeper, more actionable insights than ever before.

With Gridiron Intel, your program can:

*   **Automate Film Breakdown:** Our AI instantly analyzes your game film, tagging formations, plays, and player performance in minutes, not hours.
*   **Generate Instant Scouting Reports:** Uncover opponent tendencies with unparalleled accuracy.
*   **Get AI-Powered Play Predictions:** Leverage our live play predictor for high-percentage play calls.
*   **Accelerate Player Development:** Provide every player with their own portal, featuring personalized goals and AI-powered analysis.

We would like to offer you a complimentary, **on-site demonstration** for you and your coaching staff.

When would be a good time in the coming weeks for us to visit your campus?

Best regards,

Trent Hill
Founder
**PixelLogics | Gridiron Intel**
(870) 555-1234
`;

// --- MODAL COMPONENTS ---

const EditCoachModal: React.FC<{ coach: Coach; onSave: (coach: Coach) => void; closeModal: () => void }> = ({ coach, onSave, closeModal }) => {
    const [formData, setFormData] = useState<Coach>(coach);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, teamLogo: reader.result as string });
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 w-full max-w-lg rounded-xl shadow-2xl">
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2"><Edit /> Edit Coach: {coach.name}</h2>
                    <button onClick={closeModal} className="p-2 rounded-full hover:bg-slate-700"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                     <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-2 bg-slate-700 rounded-lg border border-slate-600" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full p-2 bg-slate-700 rounded-lg border border-slate-600" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Team Name</label>
                        <input type="text" name="team" value={formData.team} onChange={handleChange} required className="w-full p-2 bg-slate-700 rounded-lg border border-slate-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Team Logo</label>
                        <div className="mt-1 flex items-center gap-4 bg-slate-700/50 p-3 rounded-lg">
                             <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                                {formData.teamLogo ? 
                                    <img src={formData.teamLogo} alt="logo preview" className="w-full h-full object-contain rounded-full" /> : 
                                    <ImageIcon className="text-slate-500" />
                                }
                            </div>
                            <div className="space-y-2">
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm bg-slate-600 hover:bg-brand-primary px-3 py-1.5 rounded-md transition flex items-center gap-2">
                                    <Upload size={16}/> Upload Logo
                                </button>
                                {formData.teamLogo && (
                                    <button type="button" onClick={() => setFormData({...formData, teamLogo: undefined})} className="text-sm bg-slate-600 hover:bg-red-500 px-3 py-1.5 rounded-md transition flex items-center gap-2">
                                        <Trash2 size={16}/> Remove
                                    </button>
                                )}
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/svg+xml" />
                        </div>
                    </div>
                    <div className="pt-2">
                        <button type="submit" className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-lg font-bold">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const AddCoachModal: React.FC<{ onAdd: (coach: Omit<Coach, 'id' | 'status'> & { password?: string }) => void; closeModal: () => void }> = ({ onAdd, closeModal }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [team, setTeam] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (name && email && team && password) {
            onAdd({ name, email, team, password });
            setIsSubmitted(true);
        }
    };
    
    if (isSubmitted) {
        return (
             <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                <div className="bg-slate-800 w-full max-w-md rounded-xl shadow-2xl p-8 text-center">
                    <UserPlus className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Account Created!</h2>
                    <p className="text-slate-400 mb-6">An email invitation has been sent to {email} to set up their account.</p>
                    <button onClick={closeModal} className="w-full bg-brand-primary hover:bg-brand-dark py-3 rounded-lg font-bold">Done</button>
                </div>
             </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 w-full max-w-md rounded-xl shadow-2xl">
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2"><UserPlus /> Add New Coach</h2>
                    <button onClick={closeModal} className="p-2 rounded-full hover:bg-slate-700"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                    {error && <p className="text-red-400 text-center bg-red-500/10 p-2 rounded-lg text-sm">{error}</p>}
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full p-2 bg-slate-700 rounded-lg border border-slate-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-2 bg-slate-700 rounded-lg border border-slate-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Team Name</label>
                        <input type="text" value={team} onChange={e => setTeam(e.target.value)} required className="w-full p-2 bg-slate-700 rounded-lg border border-slate-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Set Initial Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-2 bg-slate-700 rounded-lg border border-slate-600" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Confirm Password</label>
                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full p-2 bg-slate-700 rounded-lg border border-slate-600" />
                    </div>
                    <div className="pt-2">
                        <button type="submit" className="w-full bg-brand-primary hover:bg-brand-dark py-3 rounded-lg font-bold">Create Coach Account</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const EmailCampaignModal: React.FC<{ onSend: (count: number) => void; closeModal: () => void; }> = ({ onSend, closeModal }) => {
    const [emails, setEmails] = useState('');
    const [emailBody, setEmailBody] = useState(EMAIL_TEMPLATE_CONTENT);
    const [showPreview, setShowPreview] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const emailCount = emails.split('\n').filter(line => line.trim() !== '').length;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (emailCount > 0) {
            // In a real app, this would trigger an email service.
            console.log(`Sending campaign to ${emailCount} emails.`);
            setIsSubmitted(true);
            onSend(emailCount);
        }
    };

    if (isSubmitted) {
        return (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                <div className="bg-slate-800 w-full max-w-md rounded-xl shadow-2xl p-8 text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Campaign Sent!</h2>
                    <p className="text-slate-400 mb-6">The email campaign has been successfully queued for {emailCount} recipients.</p>
                    <button onClick={closeModal} className="w-full bg-brand-primary hover:bg-brand-dark py-3 rounded-lg font-bold">Done</button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col">
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2"><Mail /> Email Campaign Tool</h2>
                    <button onClick={closeModal} className="p-2 rounded-full hover:bg-slate-700"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 flex-grow grid md:grid-cols-2 gap-6 overflow-hidden">
                    {/* Left: Form */}
                    <div className="flex flex-col gap-4 overflow-y-auto">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Recipient Emails</label>
                            <textarea
                                value={emails}
                                onChange={e => setEmails(e.target.value)}
                                rows={6}
                                placeholder="Paste coach emails, one per line..."
                                className="w-full p-2 bg-slate-700 rounded-lg border border-slate-600 resize-none"
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Email Body (Markdown supported)</label>
                            <textarea
                                value={emailBody}
                                onChange={e => setEmailBody(e.target.value)}
                                rows={10}
                                className="w-full p-2 bg-slate-700 rounded-lg border border-slate-600 resize-none"
                            />
                        </div>
                    </div>
                    {/* Right: Preview & Send */}
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                             <h3 className="text-lg font-semibold">Preview</h3>
                             <button type="button" onClick={() => setShowPreview(!showPreview)} className="flex items-center gap-1 text-sm text-slate-400 hover:text-white">
                                {showPreview ? <EyeOff size={16} /> : <Eye size={16} />} {showPreview ? 'Hide Preview' : 'Show Preview'}
                             </button>
                        </div>
                        <div className={`flex-grow bg-slate-900/50 p-4 rounded-lg overflow-y-auto border border-slate-700 ${!showPreview ? 'flex items-center justify-center' : ''}`}>
                             {showPreview ? (
                                <pre className="whitespace-pre-wrap font-sans text-sm">{emailBody}</pre>
                             ) : (
                                 <p className="text-slate-500">Click 'Show Preview' to see rendered email.</p>
                             )}
                        </div>
                         <div className="mt-auto">
                            <p className="text-center text-sm text-slate-400 mb-2">{emailCount} recipients</p>
                            <button
                                type="submit"
                                disabled={emailCount === 0}
                                className="w-full bg-brand-primary hover:bg-brand-dark py-3 rounded-lg font-bold disabled:bg-slate-600"
                            >
                                Send Campaign to {emailCount} Coaches
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ConfirmationModal: React.FC<{
    state: ConfirmationState;
    onClose: () => void;
}> = ({ state, onClose }) => {
    const { title, message, onConfirm, confirmText, icon: Icon, iconColor } = state;
    return (
         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 p-6 rounded-lg shadow-xl border border-slate-700 max-w-sm text-center">
                <Icon className={`w-12 h-12 ${iconColor} mx-auto mb-4`} />
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-slate-400 mb-6">{message}</p>
                <div className="flex justify-center gap-4">
                    <button onClick={onClose} className="px-6 py-2 bg-slate-600 hover:bg-slate-500 rounded-md font-semibold transition">Cancel</button>
                    <button onClick={onConfirm} className={`px-6 py-2 ${confirmText === 'Proceed' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'} rounded-md font-semibold transition`}>{confirmText}</button>
                </div>
            </div>
        </div>
    );
};


// Main Dashboard Component
const AdminDashboard: React.FC = () => {
    const [coaches, setCoaches] = useState<Coach[]>(mockCoaches);
    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(mockLogs);
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [editingCoach, setEditingCoach] = useState<Coach | null>(null);
    const [confirmation, setConfirmation] = useState<ConfirmationState | null>(null);
    const navigate = useNavigate();

    const addLog = (action: string) => {
        const newLog: AuditLogEntry = {
            id: Date.now(),
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            admin: 'Trent Hill', // Assuming logged in admin
            action,
        };
        setAuditLogs(prev => [newLog, ...prev]);
    };

    const handleAddCoach = (coachData: Omit<Coach, 'id' | 'status' | 'teamLogo'>) => {
        const newCoach: Coach = {
            id: Date.now(),
            name: coachData.name,
            email: coachData.email,
            team: coachData.team,
            status: 'Active',
        };
        setCoaches(prev => [newCoach, ...prev]);
        addLog(`Created new coach account for ${coachData.name}.`);
        setActiveModal(null);
    };
    
    const handleEditCoach = (coachToEdit: Coach) => {
        setEditingCoach(coachToEdit);
        setActiveModal('editCoach');
    };
    
    const handleSaveCoach = (updatedCoach: Coach) => {
        setCoaches(coaches.map(c => c.id === updatedCoach.id ? updatedCoach : c));
        addLog(`Updated details for coach ${updatedCoach.name}.`);
        setEditingCoach(null);
        setActiveModal(null);
    };

    const handleToggleStatus = (coachId: number) => {
        setCoaches(coaches.map(coach => {
            if (coach.id === coachId) {
                const newStatus = coach.status === 'Active' ? 'Deactivated' : 'Active';
                addLog(`${newStatus === 'Active' ? 'Re-activated' : 'Deactivated'} coach account for ${coach.name}.`);
                return { ...coach, status: newStatus };
            }
            return coach;
        }));
    };
    
    const handleSendCampaign = (count: number) => {
        addLog(`Sent email campaign to ${count} recipients.`);
        setActiveModal(null);
    };

    const handleRemoteAccess = (coach: Coach) => {
        setConfirmation({
            title: "Confirm Remote Access",
            message: `Are you sure you want to access the dashboard as ${coach.name}? This action will be logged.`,
            onConfirm: () => {
                addLog(`Initiated remote access for coach ${coach.name}.`);
                // In a real app, you'd set a token/state here to impersonate the user.
                // For this demo, we'll just navigate to the dashboard.
                navigate('/dashboard');
                setConfirmation(null);
            },
            confirmText: "Proceed",
            icon: LogIn,
            iconColor: "text-blue-400"
        });
    };

    const handlePushUpdate = () => {
         setConfirmation({
            title: "Confirm App Update",
            message: "This will push the latest version (v1.2.2) to all active schools. Are you sure you want to proceed?",
            onConfirm: () => {
                addLog("Pushed app update v1.2.2 to all clients.");
                // Simulate success
                setConfirmation(null);
                 alert("Update has been successfully pushed!");
            },
            confirmText: "Push Update",
            icon: Upload,
            iconColor: "text-purple-400"
        });
    };
    
    const AdminStatCard = ({ icon: Icon, title, value, color }: { icon: React.ElementType, title: string, value: string | number, color: string }) => (
        <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 p-4 rounded-xl border border-slate-700 flex items-start gap-4">
            <div className={`p-2 bg-slate-700 rounded-lg`}>
                 <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <div>
                 <p className="text-sm text-slate-400">{title}</p>
                 <p className="text-3xl font-bold text-white">{value}</p>
            </div>
        </div>
    );
    
    const SystemManagementWidget = () => (
        <div className="bg-slate-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Terminal /> System Management</h2>
            <div className="space-y-3">
                <div className="flex justify-between items-center bg-slate-700 p-3 rounded-lg">
                    <span className="font-semibold">App Version</span>
                    <span className="text-brand-accent font-mono">v1.2.1</span>
                </div>
                <div className="flex justify-between items-center bg-slate-700 p-3 rounded-lg">
                    <span className="font-semibold">Server Health</span>
                    <span className="text-green-400 font-bold flex items-center gap-1"><CheckCircle size={16} /> Healthy</span>
                </div>
                <button 
                    onClick={handlePushUpdate} 
                    className="w-full mt-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-3 rounded-lg transition flex items-center justify-center gap-2 text-sm"
                >
                    <Upload size={16} /> Push Live Updates
                </button>
            </div>
        </div>
    );

    const renderModal = () => {
        switch (activeModal) {
            case 'addCoach':
                return <AddCoachModal onAdd={handleAddCoach} closeModal={() => setActiveModal(null)} />;
            case 'emailCampaign':
                return <EmailCampaignModal onSend={handleSendCampaign} closeModal={() => setActiveModal(null)} />;
            case 'editCoach':
                if (editingCoach) {
                    return <EditCoachModal coach={editingCoach} onSave={handleSaveCoach} closeModal={() => { setEditingCoach(null); setActiveModal(null); }} />;
                }
                return null;
            default:
                return null;
        }
    };

    return (
        <div className="bg-slate-900 text-white min-h-screen">
            <nav className="bg-slate-800 border-b-4 border-red-600 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                             <Shield className="text-red-500"/>
                             <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                        </div>
                        <button onClick={() => navigate('/admin/login')} className="flex items-center gap-2 text-slate-400 hover:text-white">
                            <LogOut size={18} />
                            Log Out
                        </button>
                    </div>
                </div>
            </nav>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <AdminStatCard icon={Users} title="Active Coaches" value={coaches.filter(c => c.status === 'Active').length} color="text-green-400" />
                    <AdminStatCard icon={Server} title="Server Status" value="Online" color="text-blue-400" />
                    <AdminStatCard icon={GitBranch} title="App Version" value="v1.2.1" color="text-purple-400" />
                    <AdminStatCard icon={Mail} title="Campaigns Sent" value="3" color="text-yellow-400" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Coach Management */}
                    <div className="lg:col-span-2 bg-slate-800 rounded-xl shadow-lg p-6">
                         <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                            <h2 className="text-2xl font-bold">Coach Management</h2>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button onClick={() => setActiveModal('emailCampaign')} className="w-1/2 sm:w-auto bg-yellow-600/50 hover:bg-yellow-600 text-white font-bold py-2 px-3 rounded-lg transition flex items-center justify-center gap-2 text-sm">
                                    <Mail size={16}/> <span className="hidden sm:inline">Campaign</span>
                                </button>
                                <button onClick={() => setActiveModal('addCoach')} className="w-1/2 sm:w-auto bg-brand-primary hover:bg-brand-dark text-white font-bold py-2 px-3 rounded-lg transition flex items-center justify-center gap-2 text-sm">
                                    <UserPlus size={16} /> Add Coach
                                </button>
                            </div>
                        </div>
                        {/* Desktop Table */}
                        <div className="overflow-x-auto hidden md:block">
                            <table className="w-full text-left">
                                <thead className="text-xs text-slate-400 uppercase bg-slate-700/50">
                                    <tr>
                                        <th className="p-3">Name</th>
                                        <th className="p-3">Team</th>
                                        <th className="p-3 text-center">Logo</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {coaches.map(coach => (
                                        <tr key={coach.id} className="border-b border-slate-700">
                                            <td className="p-3 font-medium">{coach.name}</td>
                                            <td className="p-3 text-slate-300">{coach.team}</td>
                                            <td className="p-3">
                                                <div className="w-10 h-10 bg-slate-700 rounded-full mx-auto flex items-center justify-center">
                                                    {coach.teamLogo ? 
                                                        <img src={coach.teamLogo} alt={`${coach.team} logo`} className="w-full h-full object-contain rounded-full" /> : 
                                                        <ImageIcon className="w-5 h-5 text-slate-500" />
                                                    }
                                                </div>
                                            </td>
                                            <td className="p-3"><span className={`px-2 py-0.5 text-xs rounded-full ${coach.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{coach.status}</span></td>
                                            <td className="p-3 text-center">
                                                <div className="flex justify-center items-center gap-4">
                                                    <button onClick={() => handleRemoteAccess(coach)} title="Remote Access" className="text-slate-400 hover:text-blue-400 transition"><LogIn size={18} /></button>
                                                    <button onClick={() => handleEditCoach(coach)} title="Edit Coach" className="text-slate-400 hover:text-yellow-400 transition"><Edit size={18} /></button>
                                                    <button onClick={() => handleToggleStatus(coach.id)} title={coach.status === 'Active' ? 'Deactivate' : 'Activate'} className={`transition ${coach.status === 'Active' ? 'text-slate-400 hover:text-red-400' : 'text-slate-400 hover:text-green-400'}`}>
                                                        {coach.status === 'Active' ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                 </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Mobile Cards */}
                        <div className="md:hidden space-y-4">
                            {coaches.map(coach => (
                                <div key={coach.id} className="bg-slate-700/50 p-4 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                                                {coach.teamLogo ? <img src={coach.teamLogo} alt="logo" className="w-full h-full object-contain rounded-full" /> : <ImageIcon className="text-slate-500" />}
                                            </div>
                                            <div>
                                                <h3 className="font-bold">{coach.name}</h3>
                                                <p className="text-sm text-slate-400">{coach.team}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-0.5 text-xs rounded-full ${coach.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{coach.status}</span>
                                    </div>
                                    <div className="flex justify-end gap-4 mt-4 pt-3 border-t border-slate-600">
                                        <button onClick={() => handleRemoteAccess(coach)} title="Remote Access" className="text-slate-400 hover:text-blue-400 transition"><LogIn size={20} /></button>
                                        <button onClick={() => handleEditCoach(coach)} title="Edit Coach" className="text-slate-400 hover:text-yellow-400 transition"><Edit size={20} /></button>
                                        <button onClick={() => handleToggleStatus(coach.id)} title={coach.status === 'Active' ? 'Deactivate' : 'Activate'} className={`transition ${coach.status === 'Active' ? 'text-slate-400 hover:text-red-400' : 'text-slate-400 hover:text-green-400'}`}>
                                            {coach.status === 'Active' ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Side Panel */}
                    <div className="space-y-8">
                        <SystemManagementWidget />
                        <div className="bg-slate-800 rounded-xl shadow-lg p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold">Audit Log</h2>
                                <button onClick={() => addLog('Manually refreshed logs.')} className="text-slate-400 hover:text-white"><RefreshCw size={18} /></button>
                            </div>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {auditLogs.map(log => (
                                    <div key={log.id} className="text-sm">
                                        <p className="text-slate-300"><span className="font-semibold text-brand-accent">{log.admin}</span>: {log.action}</p>
                                        <p className="text-xs text-slate-500">{log.timestamp}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            {renderModal()}
            {confirmation && <ConfirmationModal state={confirmation} onClose={() => setConfirmation(null)} />}
        </div>
    );
};

export default AdminDashboard;