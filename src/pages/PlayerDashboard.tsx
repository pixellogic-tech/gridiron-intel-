
import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Video, ClipboardList, BrainCircuit, X, Bot, Send, Shield, ListChecks, Target, Plus, Trash2, Settings } from 'lucide-react';
import { GoogleGenAI, Chat } from '@google/genai';
import { mockPlayers, Play, Player } from './TeamData';
import { SettingsContext, ApiKeyContext } from '../App';
import { playSound } from '../utils/audio';


// This would likely be its own component in a larger app
const PlayDiagram: React.FC<{ play: Play }> = ({ play }) => (
    <div className="relative w-full aspect-[5/3] bg-green-800 bg-opacity-50 border-2 border-slate-600 rounded-md overflow-hidden select-none">
        <svg width="100%" height="100%" className="absolute top-0 left-0">
            {play.paths.map(path => {
                const pointsString = path.points.map(p => `${p.x}%,${p.y}%`).join(' ');
                return <polyline key={path.markerId} points={pointsString} stroke="yellow" strokeWidth="2" fill="none" strokeDasharray="4 4" />;
            })}
        </svg>

        {play.formationMarkers.map(marker => (
            <div
                key={marker.id}
                className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${marker.type === 'offense' ? 'bg-blue-500 border-blue-300' : 'bg-red-600 border-red-300'}`}
                style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
            >
                {marker.label}
            </div>
        ))}
    </div>
);


// --- MOCK DATA & TYPES ---
const scoutingReport = {
  opponentName: 'Northwood Panthers',
  opponentTendencies: {
    offensive: [
      "Favors 'Spread' offense, utilizing RPOs on 70% of 1st downs.",
      "QB #7 is mobile to his right but stares down his primary target.",
      "Limited route tree, heavily reliant on 'Slant' and 'Go' routes."
    ],
    defensive: [
      "Primarily a 'Cover 3' zone defense, vulnerable to underneath passes.",
      "Susceptible to screen passes, especially to the wide side of the field.",
      "DE #92 has a slow get-off but a powerful bull rush."
    ]
  },
  positionalBriefings: {
    'QB': "They play soft corners in Cover 3. Look for the check-down to the RB early and often. Their DE #92 is slow off the snap; use a quick pass set. On 3rd down, watch for the safety blitz from the short side of the field. Your primary read on 'Flood' concept will be the flat route.",
    'MLB': "Your key read is their Center. If he pulls, expect an outside run. They love the RB screen, so be disciplined in your pass rush. You are the QB spy on passing downs; do not let him break the pocket.",
    'WR': "Expect off-coverage. Your comeback routes will be open all day. Be prepared for physical press coverage in the red zone. On 'Go' routes, use a double move to beat their predictable corners."
  }
};


const mockPlays: Play[] = [
    {
        id: 1, name: 'Flood Concept', type: 'Offense', subType: 'Pass', formation: 'Spread',
        description: 'Floods one side with 3 routes at different depths to stress zone coverage.',
        formationMarkers: [
            { id: 'qb1', type: 'offense', label: 'QB', x: 50, y: 85 },
            { id: 'wr1', type: 'offense', label: 'WR', x: 15, y: 60 },
            { id: 'te1', type: 'offense', label: 'TE', x: 40, y: 62 },
            { id: 'wr2', type: 'offense', label: 'WR', x: 85, y: 60 },
        ],
        paths: [
            { markerId: 'wr1', points: [{x: 15, y: 60}, {x: 15, y: 40}, {x: 35, y: 20}] },
            { markerId: 'te1', points: [{x: 40, y: 62}, {x: 40, y: 50}, {x: 25, y: 50}] },
            { markerId: 'wr2', points: [{x: 85, y: 60}, {x: 70, y: 60}] },
        ]
    },
    {
        id: 2, name: 'HB Dive', type: 'Offense', subType: 'Run', formation: 'I-Form',
        description: 'A direct handoff to the halfback running through an interior gap.',
        formationMarkers: [
            { id: 'qb2', type: 'offense', label: 'QB', x: 50, y: 85 },
            { id: 'rb2', type: 'offense', label: 'RB', x: 50, y: 90 },
        ],
        paths: [
            { markerId: 'rb2', points: [{x: 50, y: 90}, {x: 50, y: 65}] }
        ]
    },
    {
        id: 3, name: 'Cover 3 Buzz', type: 'Defense', subType: 'Zone', formation: '4-3',
        description: 'Zone defense with 3 deep defenders and a safety rotating down to cover short passes.',
        formationMarkers: [
            { id: 's1', type: 'defense', label: 'S', x: 50, y: 20 },
            { id: 's2', type: 'defense', label: 'S', x: 25, y: 35 },
            { id: 'cb1', type: 'defense', label: 'CB', x: 10, y: 30 },
            { id: 'cb2', type: 'defense', label: 'CB', x: 90, y: 30 },
        ],
        paths: [
            { markerId: 's2', points: [{x: 25, y: 35}, {x: 30, y: 50}] }
        ]
    }
];

interface Goal {
    id: number;
    description: string;
    target: number;
    current: number;
}

// --- HELPER FUNCTIONS ---
const getApiErrorMessage = (error: unknown): string => {
    console.error("API Error:", error);
    let message: string;

    if (error instanceof Error) {
        message = error.message;
    } else if (error && typeof error === 'object' && 'message' in error) {
        message = String((error as { message: unknown }).message);
    } else if (typeof error === 'string') {
        message = error;
    } else {
        return "An unknown error occurred. Please check the console for details.";
    }

    if (message.includes('429') || message.includes('RESOURCE_EXHAUSTED')) {
        return "You've exceeded your request limit. Please wait a moment before trying again. For more info, check your Google AI Studio plan and billing details.";
    }
    if (message.includes('400') || message.includes('INVALID_ARGUMENT')) {
        return "There was an issue with the request. Please check your input and try again. The API returned: " + message;
    }
    
    return message;
};


// --- COMPONENTS ---

interface StatCardProps {
    icon: React.ElementType;
    title: string;
    value: string;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, color }) => (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <div className="flex items-start gap-4">
            <div className={`p-2 bg-slate-700 rounded-lg`}>
                <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <div>
                <p className="text-sm text-slate-400">{title}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
            </div>
        </div>
    </div>
);

const GamePlanSection: React.FC<{ report: typeof scoutingReport; playerPosition: string; }> = ({ report, playerPosition }) => (
    <div className="bg-slate-800 rounded-xl p-4 md:p-6">
        <h2 className="text-2xl font-bold mb-4">Game Plan vs. {report.opponentName}</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2"><Shield /> Opponent Intel</h3>
                <div className="space-y-4">
                    <div>
                        <h4 className="font-bold text-green-400 mb-2">Offensive Tendencies</h4>
                        <ul className="list-disc list-inside space-y-1 text-slate-300">
                            {report.opponentTendencies.offensive.map((t, i) => <li key={i}>{t}</li>)}
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-bold text-red-400 mb-2">Defensive Tendencies</h4>
                        <ul className="list-disc list-inside space-y-1 text-slate-300">
                           {report.opponentTendencies.defensive.map((t, i) => <li key={i}>{t}</li>)}
                        </ul>
                    </div>
                </div>
            </div>
            <div className="bg-slate-900/50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2"><ListChecks /> My Positional Briefing</h3>
                <p className="text-slate-200 leading-relaxed">
                    {report.positionalBriefings[playerPosition as keyof typeof report.positionalBriefings] || "No specific briefing for your position."}
                </p>
            </div>
        </div>
    </div>
);

const AIPlayAnalyst: React.FC<{
    ai: GoogleGenAI | null;
    plays: Play[];
    playerPosition: string;
}> = ({ ai, plays, playerPosition }) => {
    const [selectedPlayId, setSelectedPlayId] = useState<string>('');
    const [analysis, setAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { settings } = useContext(SettingsContext);

    useEffect(() => {
        if (!selectedPlayId) {
            setAnalysis('');
            return;
        }

        const getAnalysis = async () => {
            const play = plays.find(p => p.id.toString() === selectedPlayId);
            if (!play) return;

            setIsLoading(true);
            setAnalysis('');

            // --- DEMO MODE ---
            if (!ai) {
                setTimeout(() => {
                    setAnalysis(`**Key Objective:** Execute the ${play.name} to exploit the zone defense.
**Your Role:** As a ${playerPosition}, you need to find the soft spot in the coverage.
**Reads:** Watch the outside linebacker. If he blitzes, the hot route is yours.
**Coaching Point:** Don't drift on your route. Stay crisp.`);
                    setIsLoading(false);
                }, 1500);
                return;
            }
            // -----------------

            const prompt = `You are an expert football coach. Analyze the following play called '${play.name}' for a ${playerPosition}. Here is the description: '${play.description}'. Explain the player's primary responsibilities, key reads against common defenses, and common mistakes to avoid. Structure your response with clear headings for: 1. Key Objective, 2. My Responsibilities, 3. Reads & Progressions, 4. Coaching Points. Keep it concise and actionable for a high school player.`;

            try {
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-pro',
                    contents: prompt,
                });
                setAnalysis(response.text);
                if (settings.soundsEnabled) playSound('success');
            } catch (err: unknown) {
                setAnalysis(getApiErrorMessage(err));
                if (settings.soundsEnabled) playSound('error');
            } finally {
                setIsLoading(false);
            }
        };

        getAnalysis();
    }, [selectedPlayId, ai, plays, playerPosition, settings.soundsEnabled]);

    const selectedPlay = plays.find(p => p.id.toString() === selectedPlayId);

    return (
        <div className="bg-slate-800 rounded-xl p-4 md:p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <BrainCircuit /> AI Play Analyst
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left side: Selector and description */}
                <div className="space-y-4">
                    <select
                        value={selectedPlayId}
                        onChange={(e) => setSelectedPlayId(e.target.value)}
                        className="w-full bg-slate-700 p-3 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    >
                        <option value="">-- Select a Play to Analyze --</option>
                        {plays.map(play => (
                            <option key={play.id} value={play.id}>
                                {play.name} ({play.type})
                            </option>
                        ))}
                    </select>

                    {selectedPlay && (
                         <div className="p-2 bg-slate-900/50 rounded-lg">
                           <PlayDiagram play={selectedPlay} />
                        </div>
                    )}
                </div>

                {/* Right side: Analysis */}
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700 min-h-[300px] overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-pulse text-slate-400">Analyzing your role...</div>
                        </div>
                    ) : analysis ? (
                        <p className="whitespace-pre-wrap">{analysis}</p>
                    ) : !ai ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
                             <p className="text-slate-500">Select a play to view a <strong>Demo Analysis</strong>.</p>
                             <p className="text-xs text-brand-accent">To enable Live AI, enter an API Key in Settings.</p>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-center">
                            <p className="text-slate-500">Select a play to see your AI-powered breakdown.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


const PlaybookSection: React.FC<{ playerPosition: string }> = ({ playerPosition }) => {
    // A real app would filter plays based on position, but for mock data we might not have all positions listed.
    // We'll show all offensive plays for QBs and all plays for other positions for demo purposes.
    const relevantPlays = playerPosition === 'QB' 
        ? mockPlays.filter(p => p.type === 'Offense')
        : mockPlays;
    
    return (
         <div className="bg-slate-800 rounded-xl p-4 md:p-6">
            <h2 className="text-xl font-bold mb-4">My Playbook</h2>
            <p className="text-sm text-slate-400 mb-4">Reference your assigned plays. Use the AI Play Analyst tool above for a detailed breakdown of your role.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relevantPlays.map(play => {
                    return (
                        <div key={play.id} className="bg-slate-700 rounded-lg p-4 flex flex-col">
                            <h3 className="font-bold text-lg mb-2">{play.name}</h3>
                            <div className="mb-3">
                                <PlayDiagram play={play} />
                            </div>
                            <p className="text-sm text-slate-300 flex-grow mb-4">{play.description}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const PerformanceGoals: React.FC = () => {
    const [goals, setGoals] = useState<Goal[]>([
        { id: 1, description: 'Passing Touchdowns', target: 25, current: 18 },
        { id: 2, description: 'Completion Percentage', target: 75, current: 72 },
        { id: 3, description: 'Game-Winning Drives', target: 3, current: 1 },
    ]);
    const [newGoal, setNewGoal] = useState({ description: '', target: '' });
    const [showForm, setShowForm] = useState(false);
    const { settings } = useContext(SettingsContext);

    const handleAddGoal = (e: React.FormEvent) => {
        e.preventDefault();
        if (newGoal.description && newGoal.target) {
            setGoals([...goals, {
                id: Date.now(),
                description: newGoal.description,
                target: parseInt(newGoal.target),
                current: 0
            }]);
            setNewGoal({ description: '', target: '' });
            setShowForm(false);
            if (settings.soundsEnabled) playSound('success');
        }
    };

    const updateGoalProgress = (id: number, change: number) => {
        setGoals(goals.map(goal => 
            goal.id === id ? { ...goal, current: Math.max(0, goal.current + change) } : goal
        ));
        if (settings.soundsEnabled) playSound('click');
    };

    const deleteGoal = (id: number) => {
        setGoals(goals.filter(goal => goal.id !== id));
        if (settings.soundsEnabled) playSound('error');
    };

    return (
        <div className="bg-slate-800 rounded-xl p-4 md:p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2"><Target /> My Performance Goals</h2>
                <button onClick={() => setShowForm(!showForm)} className="bg-brand-primary p-2 rounded-full hover:bg-brand-dark transition">
                    <Plus size={20} />
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleAddGoal} className="bg-slate-700/50 p-4 rounded-lg mb-4 space-y-3">
                    <input 
                        type="text" 
                        value={newGoal.description} 
                        onChange={e => setNewGoal(p => ({...p, description: e.target.value}))}
                        placeholder="Goal (e.g., Rushing Yards)"
                        className="w-full p-2 bg-slate-600 rounded"
                    />
                    <input 
                        type="number" 
                        value={newGoal.target}
                        onChange={e => setNewGoal(p => ({...p, target: e.target.value}))}
                        placeholder="Target Value"
                        className="w-full p-2 bg-slate-600 rounded"
                    />
                    <button type="submit" className="w-full py-2 bg-green-600 hover:bg-green-700 rounded font-semibold">Add Goal</button>
                </form>
            )}

            <div className="space-y-4">
                {goals.map(goal => {
                    const progress = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
                    return (
                        <div key={goal.id} className="bg-slate-700 p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold">{goal.description}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-brand-accent">{goal.current} / {goal.target}</span>
                                    <button onClick={() => deleteGoal(goal.id)} className="text-slate-500 hover:text-red-500"><Trash2 size={16} /></button>
                                </div>
                            </div>
                            <div className="w-full bg-slate-600 rounded-full h-2.5">
                                <div className="bg-brand-primary h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                            </div>
                             <div className="flex justify-end gap-2 mt-2">
                                <button onClick={() => updateGoalProgress(goal.id, -1)} className="text-xs bg-slate-600 px-2 py-0.5 rounded">-</button>
                                <button onClick={() => updateGoalProgress(goal.id, 1)} className="text-xs bg-slate-600 px-2 py-0.5 rounded">+</button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


interface Message {
    sender: 'user' | 'bot';
    text: string;
}

const AICoachChatModal: React.FC<{ 
    ai: GoogleGenAI | null; 
    closeModal: () => void; 
    playerName: string; 
    playerPosition: string; 
    playerStats: string; 
    opponentIntel: string;
}> = ({ ai, closeModal, playerName, playerPosition, playerStats, opponentIntel }) => {
    const CHAT_HISTORY_KEY = `gridironIntelPlayerChatHistory_${playerName.replace(/\s/g, '_')}`;
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [chat, setChat] = useState<Chat | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Load history from localStorage on component mount
        try {
            const storedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
            if (storedHistory) {
                setMessages(JSON.parse(storedHistory));
            } else {
                setMessages([{ sender: 'bot', text: `Hey ${playerName}, it's Coach Grid. I'm here to help you get better. What's on your mind?` }]);
            }
        } catch (error) {
            console.error("Failed to load chat history:", error);
            setMessages([{ sender: 'bot', text: `Hey ${playerName}, it's Coach Grid.` }]);
        }
    }, [playerName, CHAT_HISTORY_KEY]);

    useEffect(() => {
        // Save history to localStorage whenever it changes, but not just the initial welcome message.
        if (messages.length > 1) {
            localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
        }
    }, [messages, CHAT_HISTORY_KEY]);

    useEffect(() => {
        if (ai && !chat) {
            const historyForAI = messages
                .map(msg => ({
                    role: msg.sender === 'user' ? 'user' : 'model' as 'user' | 'model',
                    parts: [{ text: msg.text }],
                }));
            
            const genaiHistory = messages.length > 1 ? historyForAI : [];

            const newChat = ai.chats.create({ 
                model: 'gemini-2.5-flash',
                history: genaiHistory,
                config: {
                    systemInstruction: `You are an expert AI Football Coach named Grid. You are speaking directly to ${playerName}, the team's ${playerPosition}.
                    Here is their current performance data: ${playerStats}.
                    Here is the intel on the upcoming opponent: ${opponentIntel}.
                    Use ALL this data to provide personalized, encouraging, and insightful advice. Help them understand plays, analyze their performance, and prepare for opponents. Refer to their specific stats AND the opponent's tendencies when relevant to make your advice more impactful. Keep your tone supportive and professional.`
                }
            });
            setChat(newChat);
        }
    }, [ai, chat, playerName, playerPosition, playerStats, opponentIntel, messages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        if (!ai || !chat) {
             setTimeout(() => {
                const botMessage: Message = { sender: 'bot', text: "DEMO RESPONSE: That's a great question! Focus on your footwork this week. (Add API Key in Settings for full AI Coach)" };
                setMessages(prev => [...prev, botMessage]);
                setIsLoading(false);
            }, 1000);
            return;
        }

        try {
            const response = await chat.sendMessage({ message: input });
            const botMessage: Message = { sender: 'bot', text: response.text };
            setMessages(prev => [...prev, botMessage]);
        } catch (error: unknown) {
            const errorMessage: Message = { sender: 'bot', text: getApiErrorMessage(error) };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 w-full max-w-lg max-h-[90vh] sm:max-h-[700px] rounded-xl shadow-2xl flex flex-col">
                <div className="p-4 bg-slate-700 flex justify-between items-center flex-shrink-0">
                    <h3 className="text-lg font-bold">AI Coach</h3>
                    <button onClick={closeModal} className="p-1 rounded-full hover:bg-slate-600"><X size={18} /></button>
                </div>
                <div className="flex-grow p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-xl ${msg.sender === 'user' ? 'bg-brand-accent text-white' : 'bg-slate-700'}`}>{msg.text}</div>
                        </div>
                    ))}
                    {isLoading && <div className="flex justify-start"><div className="bg-slate-700 p-3 rounded-xl animate-pulse">...</div></div>}
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t border-slate-700 bg-slate-800 flex-shrink-0">
                    <div className="flex items-center gap-2 p-2 bg-slate-700 rounded-lg">
                        <input 
                            type="text" 
                            value={input} 
                            onChange={e => setInput(e.target.value)} 
                            onKeyDown={e => e.key === 'Enter' && handleSend()} 
                            placeholder="Ask your AI coach..." 
                            className="w-full bg-transparent focus:outline-none text-white"
                        />
                        <button onClick={handleSend} disabled={isLoading || !input.trim()} className="bg-brand-primary p-2 rounded-lg hover:bg-brand-dark disabled:bg-slate-500 disabled:cursor-not-allowed text-white">
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LastGameAnalysisWidget: React.FC<{ 
    ai: GoogleGenAI | null; 
    player: Player;
}> = ({ ai, player }) => {
    const [analysis, setAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const { settings } = useContext(SettingsContext);

    useEffect(() => {
        if (!ai) {
            // Simulate analysis for Demo
            setTimeout(() => {
                setAnalysis(`Hey ${player.name}, solid effort last week. Your check-downs were on point. Next game, try to step up into the pocket more aggressively. (DEMO)`);
                setIsLoading(false);
            }, 1000);
            return;
        }

        const generateAnalysis = async () => {
            setIsLoading(true);
            
            // For demo purposes, we'll imagine there's a last game film.
            // In a real app, this data would be fetched or passed in.
            const lastGameFilm = {
                title: "vs. Central High (Week 6)",
                summary: "Our offensive line's pass protection against their 3-man rush was a liability. The 'HB Screen' play was highly effective, averaging 9.5 yards. We must adjust our protection schemes immediately."
            };

            let prompt = '';
            if (lastGameFilm) {
                prompt = `You are an encouraging AI football coach. Analyze ${player.name}'s performance in the last game ('${lastGameFilm.title}') based on this team summary: '${lastGameFilm.summary}'. Provide a concise (2-3 sentences), encouraging summary of their performance as a ${player.position}. Highlight one thing they likely did well given the team's performance, and one specific, actionable area for improvement for the next game. Address the player directly (e.g., "Hey ${player.name}, ...").`;
            } else { // Fallback case
                prompt = `You are an encouraging AI football coach. Provide general performance tips for a ${player.position}. Give one offensive-minded tip and one defensive-minded tip that a player in this position should focus on during this week's practice. Keep it concise (2-3 sentences) and motivational. Address the player directly (e.g., "Hey ${player.name}, ...").`;
            }

            try {
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt
                });
                setAnalysis(response.text);
                if (settings.soundsEnabled) playSound('notification');
            } catch (err: unknown) {
                setAnalysis(getApiErrorMessage(err));
            } finally {
                setIsLoading(false);
            }
        };

        generateAnalysis();
    }, [ai, player.name, player.position, settings.soundsEnabled]);

    return (
        <div className="bg-slate-800 rounded-xl p-4 md:p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><BrainCircuit /> Last Game Analysis</h2>
            <div className="bg-slate-900/50 p-4 rounded-lg min-h-[100px]">
                {isLoading ? (
                    <div className="animate-pulse space-y-2">
                        <div className="h-4 bg-slate-700 rounded w-5/6"></div>
                        <div className="h-4 bg-slate-700 rounded w-full"></div>
                        <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                    </div>
                ) : (
                    <p className="text-slate-300 leading-relaxed">{analysis}</p>
                )}
            </div>
        </div>
    );
};

const OpponentIntelWidget: React.FC<{ report: typeof scoutingReport }> = ({ report }) => (
    <div className="bg-slate-800 rounded-xl p-4 md:p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Shield /> Opponent Intel</h2>
        <div className="space-y-4">
            <div>
                <h3 className="font-bold text-green-400 mb-2">Offensive Tendencies</h3>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-sm">
                    {report.opponentTendencies.offensive.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
            </div>
            <div>
                <h3 className="font-bold text-red-400 mb-2">Defensive Tendencies</h3>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-sm">
                    {report.opponentTendencies.defensive.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
            </div>
        </div>
    </div>
);


const PlayerDashboard: React.FC = () => {
    const [ai, setAi] = useState<GoogleGenAI | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const { openSettings } = useContext(SettingsContext);
    const { apiKey } = useContext(ApiKeyContext);
    // Mock player data - assuming this player is logged in.
    const player = mockPlayers.find(p => p.name === 'J. Williams'); 

    useEffect(() => {
        try {
            if (apiKey) {
                const genAI = new GoogleGenAI({ apiKey: apiKey });
                setAi(genAI);
            } else {
                setAi(null);
            }
        } catch (error) {
            console.error("Error initializing GoogleGenAI:", error);
        }
    }, [apiKey]);

    if (!player) {
        return <div className="bg-slate-900 text-white min-h-screen flex items-center justify-center">Loading Player Data...</div>
    }

    const playerStatsString = `Key Stats: ${player.stats.map(s => `${s.name}: ${s.value}`).join(', ')}. Radar Data: ${player.radarData.map(d => `${d.subject}: ${d.value} (vs Avg: ${d.avg})`).join(', ')}.`;
    const opponentIntelString = `Upcoming opponent: ${scoutingReport.opponentName}. Offensive Tendencies: ${scoutingReport.opponentTendencies.offensive.join(' ')}. Defensive Tendencies: ${scoutingReport.opponentTendencies.defensive.join(' ')}.`;

    return (
        <div className="bg-slate-900 text-white min-h-screen">
            <nav className="bg-slate-800 border-b-4 border-brand-primary shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <div className="text-xl sm:text-2xl font-bold text-white">🏈 GRIDIRON INTEL</div>
                            <div className="text-slate-400 hidden sm:block">|</div>
                            <div className="text-slate-300 hidden sm:block">Player Portal</div>
                        </div>
                         <div className="flex items-center gap-2 sm:gap-4">
                            <div className="text-right">
                                <p className="font-semibold">{player.name}</p>
                                <p className="text-xs text-slate-400">{player.position}</p>
                            </div>
                            {player.photoUrl ? (
                                <img src={player.photoUrl} alt={player.name} className="w-10 h-10 rounded-full object-cover" />
                             ) : (
                                <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center font-bold">{player.avatar}</div>
                             )}
                            <button onClick={openSettings} className="text-slate-300 hover:text-white p-2 rounded-full transition"><Settings size={20} /></button>
                        </div>
                    </div>
                </div>
            </nav>
            <main className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Welcome, {player.name}!</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard icon={BarChart} title="Completion %" value="72%" color="text-green-400" />
                    <StatCard icon={Video} title="Film to Review" value="3" color="text-brand-accent" />
                    <StatCard icon={ClipboardList} title="New Assignments" value="1" color="text-yellow-400" />
                </div>

                <div className="space-y-8">
                    <GamePlanSection report={scoutingReport} playerPosition={player.position} />
                    
                    <LastGameAnalysisWidget ai={ai} player={player} />

                    <AIPlayAnalyst 
                        ai={ai}
                        plays={mockPlays}
                        playerPosition={player.position}
                    />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <PerformanceGoals />
                        <OpponentIntelWidget report={scoutingReport} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-slate-800 rounded-xl p-4 md:p-6">
                            <h2 className="text-xl font-bold mb-4">My Assignments</h2>
                            <div className="space-y-3">
                               <div className="bg-slate-700 p-4 rounded-lg">
                                    <h3 className="font-semibold">Review Week 6 Film</h3>
                                    <p className="text-sm text-slate-400">Due: Tuesday</p>
                               </div>
                                <div className="bg-slate-700 p-4 rounded-lg">
                                    <h3 className="font-semibold">Study Red Zone Plays</h3>
                                    <p className="text-sm text-slate-400">Due: Wednesday</p>
                               </div>
                            </div>
                        </div>
                         <div className="bg-slate-800 rounded-xl p-4 md:p-6">
                             <h2 className="text-xl font-bold mb-4">Team Focus Points</h2>
                            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-300">
                                <li>Focus on screen pass execution and timing.</li>
                                <li>Drill open-field tackling to limit big plays.</li>
                                <li>Practice defensive containment for mobile QBs.</li>
                            </ul>
                        </div>
                    </div>

                    <PlaybookSection playerPosition={player.position} />
                </div>
                
                <div className="text-center mt-12">
                    <Link to="/login" className="text-slate-400 hover:text-brand-accent transition">
                        Log Out
                    </Link>
                </div>
                
                {!isChatOpen && (
                     <button onClick={() => setIsChatOpen(true)} className="fixed bottom-8 right-8 bg-brand-accent text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-transform hover:scale-110 z-30">
                        <Bot size={28} />
                    </button>
                )}

                {isChatOpen && (
                    <AICoachChatModal 
                        ai={ai}
                        closeModal={() => setIsChatOpen(false)}
                        playerName={player.name}
                        playerPosition={player.position}
                        playerStats={playerStatsString}
                        opponentIntel={opponentIntelString}
                    />
                )}
            </main>
        </div>
    );
};

export default PlayerDashboard;
