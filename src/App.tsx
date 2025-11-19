
import React, { useState, useContext, createContext, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import PlayerDashboard from './pages/PlayerDashboard';
import PlayerProfilePage from './pages/PlayerProfilePage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import TeamRosterPage from './pages/TeamRosterPage';
import TeamIntelPage from './pages/TeamIntelPage';
import LandingPage from './pages/LandingPage';
import GameTimePage from './pages/GameTimePage';
import PracticePlannerPage from './pages/PracticePlannerPage';
import PlaybookPage from './pages/PlaybookPage';
import CoachLayout from './components/CoachLayout';
import { Settings, Bell, Volume2, X, Key } from 'lucide-react';

// --- Team Context ---
export interface TeamProfile {
    name: string;
    mascot: string;
    primaryColor: string;
    secondaryColor: string;
    offensiveScheme: string;
    defensiveScheme: string;
}

interface TeamContextType {
    teamProfile: TeamProfile;
    setTeamProfile: (profile: TeamProfile) => void;
}

const defaultTeamProfile: TeamProfile = {
    name: 'My Team',
    mascot: 'Eagles',
    primaryColor: '#64748B', // slate-500
    secondaryColor: '#3B82F6', // blue-500
    offensiveScheme: 'Spread',
    defensiveScheme: '4-3',
};


export const TeamContext = createContext<TeamContextType>({
    teamProfile: defaultTeamProfile,
    setTeamProfile: () => {},
});

export const TeamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [teamProfile, setTeamProfileState] = useState<TeamProfile>(() => {
        try {
            const storedProfile = localStorage.getItem('teamProfile');
            return storedProfile ? JSON.parse(storedProfile) : defaultTeamProfile;
        } catch (error) {
            console.error("Error parsing team profile from localStorage", error);
            return defaultTeamProfile;
        }
    });

    const setTeamProfile = (profile: TeamProfile) => {
        setTeamProfileState(profile);
        localStorage.setItem('teamProfile', JSON.stringify(profile));
    };
    
    return (
        <TeamContext.Provider value={{ teamProfile, setTeamProfile }}>
            {children}
        </TeamContext.Provider>
    );
};

// --- API Key Context ---
interface ApiKeyContextType {
    apiKey: string;
    setApiKey: (key: string) => void;
}

export const ApiKeyContext = createContext<ApiKeyContextType>({
    apiKey: '',
    setApiKey: () => {},
});

export const ApiKeyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // We default to empty string. We DO NOT load from process.env here to prevent leaks on GitHub Pages.
    // The user must enter it in the UI to enable "Live" mode.
    const [apiKey, setApiKeyState] = useState<string>(() => {
        return localStorage.getItem('gemini_api_key') || '';
    });

    const setApiKey = (key: string) => {
        setApiKeyState(key);
        localStorage.setItem('gemini_api_key', key);
    };

    return (
        <ApiKeyContext.Provider value={{ apiKey, setApiKey }}>
            {children}
        </ApiKeyContext.Provider>
    );
};


// --- Settings Context ---
interface SettingsState {
    soundsEnabled: boolean;
    notificationsEnabled: boolean;
}

interface SettingsContextType {
    settings: SettingsState;
    toggleSounds: () => void;
    toggleNotifications: () => void;
    isSettingsOpen: boolean;
    openSettings: () => void;
    closeSettings: () => void;
}

export const SettingsContext = createContext<SettingsContextType>({
    settings: { soundsEnabled: true, notificationsEnabled: true },
    toggleSounds: () => {},
    toggleNotifications: () => {},
    isSettingsOpen: false,
    openSettings: () => {},
    closeSettings: () => {},
});

const SettingsModal: React.FC = () => {
    const { settings, toggleSounds, toggleNotifications, closeSettings } = useContext(SettingsContext);
    const { apiKey, setApiKey } = useContext(ApiKeyContext);
    const [tempKey, setTempKey] = useState(apiKey);
    const [showKeyInput, setShowKeyInput] = useState(false);

    const handleSaveKey = () => {
        setApiKey(tempKey);
        setShowKeyInput(false);
    };

    const Toggle = ({ label, enabled, onToggle, icon: Icon }: { label: string, enabled: boolean, onToggle: () => void, icon: React.ElementType }) => (
        <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
            <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-slate-400" />
                <span className="font-medium text-white">{label}</span>
            </div>
            <button
                onClick={onToggle}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${enabled ? 'bg-brand-accent' : 'bg-slate-600'}`}
            >
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={closeSettings}>
            <div className="bg-slate-800 w-full max-w-sm rounded-xl shadow-2xl border border-slate-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2"><Settings /> App Settings</h2>
                    <button onClick={closeSettings} className="p-2 rounded-full hover:bg-slate-700"><X size={20} /></button>
                </div>
                <div className="p-6 space-y-4">
                    <Toggle label="Sound Effects" enabled={settings.soundsEnabled} onToggle={toggleSounds} icon={Volume2} />
                    <Toggle label="Notifications" enabled={settings.notificationsEnabled} onToggle={toggleNotifications} icon={Bell} />
                    
                    <div className="p-4 bg-slate-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                             <div className="flex items-center gap-3">
                                <Key className="w-5 h-5 text-slate-400" />
                                <span className="font-medium text-white">AI Integration</span>
                            </div>
                            <button onClick={() => setShowKeyInput(!showKeyInput)} className="text-xs text-brand-accent hover:underline">
                                {showKeyInput ? 'Hide' : 'Configure'}
                            </button>
                        </div>
                        <p className="text-xs text-slate-400 mb-2">
                            {apiKey ? '✅ Live API Key Active' : '⚠️ Demo Mode (Mock Data)'}
                        </p>
                        
                        {showKeyInput && (
                            <div className="mt-2 animate-[fadeIn_0.2s]">
                                <input 
                                    type="password" 
                                    value={tempKey}
                                    onChange={(e) => setTempKey(e.target.value)}
                                    placeholder="Paste Gemini API Key"
                                    className="w-full p-2 text-sm bg-slate-800 rounded border border-slate-600 mb-2"
                                />
                                <button onClick={handleSaveKey} className="w-full py-1 bg-green-600 hover:bg-green-700 rounded text-sm font-bold">
                                    Save Key
                                </button>
                                <p className="text-[10px] text-slate-500 mt-2">Key is stored locally in your browser. It is never sent to our servers.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<SettingsState>({ soundsEnabled: true, notificationsEnabled: true });
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const toggleSounds = () => setSettings(s => ({ ...s, soundsEnabled: !s.soundsEnabled }));
    const toggleNotifications = () => setSettings(s => ({ ...s, notificationsEnabled: !s.notificationsEnabled }));
    const openSettings = () => setIsSettingsOpen(true);
    const closeSettings = () => setIsSettingsOpen(false);
    
    const value = { settings, toggleSounds, toggleNotifications, isSettingsOpen, openSettings, closeSettings };

    return (
        <SettingsContext.Provider value={value}>
            {children}
            {isSettingsOpen && <SettingsModal />}
        </SettingsContext.Provider>
    );
};


const App: React.FC = () => {
  return (
    <ApiKeyProvider>
        <TeamProvider>
            <SettingsProvider>
                <HashRouter>
                    <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    
                    {/* Player Routes */}
                    <Route path="/player-dashboard" element={<PlayerDashboard />} />
                    <Route path="/player/:playerId" element={<PlayerProfilePage />} />

                    {/* Coach Routes with Layout */}
                    <Route element={<CoachLayout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/game-time" element={<GameTimePage />} />
                        <Route path="/practice" element={<PracticePlannerPage />} />
                        <Route path="/playbook" element={<PlaybookPage />} />
                        <Route path="/roster" element={<TeamRosterPage />} />
                        <Route path="/training" element={<TeamIntelPage />} />
                    </Route>
                    </Routes>
                </HashRouter>
            </SettingsProvider>
        </TeamProvider>
    </ApiKeyProvider>
  );
};

export default App;
