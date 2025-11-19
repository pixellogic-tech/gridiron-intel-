
import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { GoogleGenAI } from '@google/genai';
import { ArrowLeft, BrainCircuit, BarChart3, Star, Edit } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Tooltip, Legend, Radar } from 'recharts';
import { mockPlayers, Player } from './TeamData';
import { TeamContext, ApiKeyContext } from '../App';

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

const PlayerProfilePage: React.FC = () => {
    const { playerId } = useParams<{ playerId: string }>();
    const [ai, setAi] = useState<GoogleGenAI | null>(null);
    const [player, setPlayer] = useState<Player | null>(null);
    const [scoutingReport, setScoutingReport] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [strengthsInput, setStrengthsInput] = useState('');
    const [weaknessesInput, setWeaknessesInput] = useState('');
    const { teamProfile } = useContext(TeamContext);
    const { apiKey } = useContext(ApiKeyContext);

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

    useEffect(() => {
        const selectedPlayer = mockPlayers.find(p => p.id === parseInt(playerId || ''));
        setPlayer(selectedPlayer || null);
    }, [playerId]);

    const generateReport = async () => {
        if (!player) return;

        setIsLoading(true);
        setScoutingReport('');

        // --- DEMO MODE LOGIC ---
        if (!ai) {
            // Simulate network delay for realism
            setTimeout(() => {
                setScoutingReport(`### **Strengths**
- **Elite Pocket Presence:** ${player.name} demonstrates calmness under pressure, sliding effectively to extend plays.
- **High Completion Percentage:** At ${player.stats[0].value}, he is extremely efficient and makes safe, smart throws.
- **Leadership:** As noted, he commands the huddle well.

### **Areas for Improvement**
- **Deep Ball Accuracy:** Needs more consistency on throws over 30 yards.
- **Progression Speed:** Occasionally locks onto the primary receiver too long.

### **Scheme Fit**
Perfect fit for the ${teamProfile.offensiveScheme}. His quick decision-making aligns with our tempo-based passing attack.

### **Player Comparison**
Reminiscent of a young **Drew Brees** due to his accuracy and pocket manipulation.

### **Overall Summary**
${player.name} is a Division 1 prospect. With refined deep ball mechanics, he will be unstoppable.

*(Note: This is a DEMO response. Add your API Key in Settings for live AI analysis.)*`);
                setIsLoading(false);
            }, 2000);
            return;
        }
        // -----------------------

        const statsString = player.stats.map(s => `${s.name}: ${s.value}`).join(', ');
        const radarString = player.radarData.map(d => `${d.subject}: ${d.value} (vs League Avg: ${d.avg})`).join('; ');
        
        let coachNotesPrompt = '';
        if (strengthsInput.trim()) {
            coachNotesPrompt += `\n\n**Coach's Notes on Strengths (Emphasize these):**\n- ${strengthsInput.trim().replace(/\n/g, '\n- ')}`;
        }
        if (weaknessesInput.trim()) {
            coachNotesPrompt += `\n\n**Coach's Notes on Weaknesses (Incorporate these):**\n- ${weaknessesInput.trim().replace(/\n/g, '\n- ')}`;
        }

        const prompt = `You are an elite NFL scout. Analyze the performance of high school football player ${player.name}, a ${player.position}.
        
        **Team System Context:**
        - Our Team: ${teamProfile.name} ${teamProfile.mascot}
        - Our Offensive Scheme: ${teamProfile.offensiveScheme}
        - Our Defensive Scheme: ${teamProfile.defensiveScheme}
        
        **Player Data:**
        - Key Stats: ${statsString}.
        - Performance Radar Insights: ${radarString}.${coachNotesPrompt}
        
        Based on all this data, including the specific coach's notes and our team's schemes, provide a detailed, professional scouting report. Ensure your analysis reflects and integrates the points provided by the coach. Structure your response with the following sections using markdown headings:
        
        ### **Strengths**
        (List 3-4 key strengths with brief explanations, referencing specific stats, radar values, and coach's notes where applicable)
        
        ### **Areas for Improvement**
        (List 2-3 specific, actionable areas for improvement, referencing specific stats, radar values, and coach's notes where applicable)
        
        ### **Scheme Fit**
        (Specifically analyze how this player fits into our ${teamProfile.offensiveScheme} offense and ${teamProfile.defensiveScheme} defense. Is he a natural fit? What adjustments would be needed?)

        ### **Player Comparison**
        (Provide a realistic comparison to a current or former college/pro player whose style matches the data and coach's observations)

        ### **Overall Summary**
        (A concluding paragraph on their potential and what they need to do to reach the next level, summarizing all available information.)`;


        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
            });
            setScoutingReport(response.text);
        } catch (error: unknown) {
            setScoutingReport(getApiErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    };

    if (!player) {
        return (
            <div className="bg-slate-900 text-white min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Player Not Found</h2>
                    <Link to="/dashboard" className="text-brand-accent hover:underline">Return to Dashboard</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-900 text-white min-h-screen">
            <nav className="bg-slate-800 border-b-4 border-brand-primary shadow-lg">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/roster" className="flex items-center gap-2 text-slate-300 hover:text-white transition">
                            <ArrowLeft size={20} />
                            <span className="hidden sm:inline">Back to Team Roster</span>
                        </Link>
                        <div className="text-lg sm:text-2xl font-bold text-white">🏈 Player Profile</div>
                    </div>
                </div>
            </nav>
            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Player Info & Stats */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-slate-800 rounded-xl p-6 text-center shadow-lg">
                            {player.photoUrl ? (
                                <img src={player.photoUrl} alt={player.name} className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-slate-700" />
                            ) : (
                                <div className="w-24 h-24 bg-brand-primary rounded-full flex items-center justify-center font-bold text-4xl mx-auto mb-4 border-4 border-slate-700">{player.avatar}</div>
                            )}
                            <h1 className="text-3xl font-bold">{player.name}</h1>
                            <p className="text-lg text-brand-accent font-semibold">{player.position}</p>
                        </div>
                        <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><BarChart3 /> Key Season Stats</h2>
                            <div className="space-y-3">
                                {player.stats.map(stat => (
                                    <div key={stat.name} className="flex justify-between items-baseline bg-slate-700 p-3 rounded-lg">
                                        <span className="text-slate-400">{stat.name}</span>
                                        <div className="flex items-baseline gap-2">
                                            <span className="font-bold text-lg">{stat.value}</span>
                                            {stat.trend && <span className="text-xs text-green-400">{stat.trend}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                         {player.coachsNotes && (
                            <div className="bg-slate-800 rounded-xl p-6 shadow-lg border-l-4 border-yellow-500">
                                <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-yellow-400"><Edit /> Coach's Notes</h2>
                                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{player.coachsNotes}</p>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Radar Chart & AI Report */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Star /> Performance Radar vs. League Average</h2>
                            <div className="h-96">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={player.radarData}>
                                        <PolarGrid gridType="circle" stroke="#475569" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#cbd5e1', fontSize: 14 }} />
                                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                                        <Legend />
                                        <Radar name="League Average" dataKey="avg" stroke="#8884d8" fill="#8884d8" fillOpacity={0.4} />
                                        <Radar name={player.name} dataKey="value" stroke="var(--color-brand-accent)" fill="var(--color-brand-accent)" fillOpacity={0.6} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><BrainCircuit /> AI Scouting Report</h2>
                            {scoutingReport ? (
                                <div className="bg-slate-900/50 p-4 rounded-lg">
                                    <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed">{scoutingReport}</pre>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-slate-400 mb-4 text-center">Generate an in-depth analysis of this player's strengths and weaknesses using AI. Optionally, add specific points for the AI to focus on.</p>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-left">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-400 mb-1">Strengths to Emphasize (Optional)</label>
                                            <textarea
                                                value={strengthsInput}
                                                onChange={(e) => setStrengthsInput(e.target.value)}
                                                rows={3}
                                                placeholder="e.g., Excellent pocket presence, quick release under pressure."
                                                className="w-full p-2 bg-slate-700 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-400 mb-1">Weaknesses to Consider (Optional)</label>
                                            <textarea
                                                value={weaknessesInput}
                                                onChange={(e) => setWeaknessesInput(e.target.value)}
                                                rows={3}
                                                placeholder="e.g., Tends to lock onto primary receiver, struggles with deep ball accuracy."
                                                className="w-full p-2 bg-slate-700 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="text-center">
                                        <button onClick={generateReport} disabled={isLoading} className="bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 px-6 rounded-lg transition disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto">
                                            {isLoading ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                                                    Generating Report...
                                                </>
                                            ) : "Generate AI Report"}
                                        </button>
                                        {!ai && <p className="text-xs text-brand-accent mt-2">Running in Demo Mode (No API Key detected)</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PlayerProfilePage;
