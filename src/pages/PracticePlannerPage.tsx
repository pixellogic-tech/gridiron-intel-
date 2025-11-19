
import React, { useState, useEffect, useContext, useRef } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Dumbbell, BrainCircuit, Wand2, Save, Share2, Printer, Clipboard, Play, Pause, RotateCcw, AlertTriangle, X } from 'lucide-react';
import { TeamContext, ApiKeyContext } from '../App';
import { mockTeamIntel, TeamIntel, mockDrills, Drill } from './TeamData';
import { playSound } from '../utils/audio';

// --- INTERFACES ---
interface ScheduleItem {
    time: string;
    duration: number; // in minutes
    activity: string;
    coachingPoints: string;
}

interface DayPlan {
    day: string;
    theme: string;
    schedule: ScheduleItem[];
}

interface PracticePlan {
    id: number;
    title: string;
    days: DayPlan[];
}

// --- HELPER FUNCTIONS ---
const getApiErrorMessage = (error: unknown): string => {
    console.error("API Error:", error);
    let message = "An unknown error occurred.";
    if (error instanceof Error) message = error.message;
    if (message.includes('429')) return "Rate limit exceeded. Please wait and try again.";
    return message;
};

// --- CHILD COMPONENTS ---

const DrillTimer: React.FC<{ durationInMinutes: number }> = ({ durationInMinutes }) => {
    const [timeLeft, setTimeLeft] = useState(durationInMinutes * 60);
    const [isActive, setIsActive] = useState(false);
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        setTimeLeft(durationInMinutes * 60);
        setIsActive(false); // Reset timer when duration changes
        if (intervalRef.current) clearInterval(intervalRef.current);
    }, [durationInMinutes]);

    useEffect(() => {
        if (isActive) {
            intervalRef.current = window.setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(intervalRef.current!);
                        setIsActive(false);
                        playSound('notification');
                        return durationInMinutes * 60;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        return () => {
            if(intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isActive, durationInMinutes]);

    const toggleTimer = () => setIsActive(!isActive);
    const resetTimer = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsActive(false);
        setTimeLeft(durationInMinutes * 60);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    return (
        <div className="flex items-center gap-2 text-sm">
            <span className="font-mono bg-slate-600 px-2 py-1 rounded w-20 text-center">{formatTime(timeLeft)}</span>
            <button onClick={toggleTimer} className="p-2 bg-slate-600 hover:bg-brand-primary rounded-full transition">{isActive ? <Pause size={14}/> : <Play size={14}/>}</button>
            <button onClick={resetTimer} className="p-2 bg-slate-600 hover:bg-slate-500 rounded-full transition"><RotateCcw size={14}/></button>
        </div>
    );
};


const ShareModal: React.FC<{ plan: PracticePlan; closeModal: () => void }> = ({ plan, closeModal }) => {
    const handlePrint = () => {
        window.print();
    };

    const handleCopy = () => {
        let text = `${plan.title}\n\n`;
        plan.days.forEach(day => {
            text += `--- ${day.day.toUpperCase()}: ${day.theme} ---\n`;
            day.schedule.forEach(item => {
                text += `${item.time} (${item.duration} min) - ${item.activity}\n`;
                text += `  -> ${item.coachingPoints}\n\n`;
            });
        });
        navigator.clipboard.writeText(text);
        alert("Practice plan copied to clipboard!");
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
             <div id="share-modal-content" className="bg-slate-800 w-full max-w-md rounded-xl shadow-2xl p-6">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Share Practice Plan</h2>
                     <button onClick={closeModal} className="p-2 rounded-full hover:bg-slate-700"><X size={20} /></button>
                 </div>
                <div className="space-y-4">
                    <button onClick={handlePrint} className="w-full flex items-center justify-center gap-3 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition">
                        <Printer size={20} /> Print / Save as PDF
                    </button>
                    <button onClick={handleCopy} className="w-full flex items-center justify-center gap-3 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition">
                        <Clipboard size={20} /> Copy as Text
                    </button>
                </div>
            </div>
        </div>
    );
};


const DrillLibrary: React.FC<{ drills: Drill[], setDrills: React.Dispatch<React.SetStateAction<Drill[]>> }> = ({ drills, setDrills }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<'Offense' | 'Defense' | 'Special Teams'>('Offense');
    const [description, setDescription] = useState('');

    const handleAddDrill = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !description) return;
        const newDrill: Drill = { id: Date.now(), name, type, description };
        setDrills(prev => [newDrill, ...prev]);
        setName('');
        setDescription('');
    };

    return (
        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <h3 className="font-bold mb-3">Drill Library</h3>
            <div className="max-h-48 overflow-y-auto space-y-2 mb-3 pr-2">
                {drills.map(drill => (
                    <div key={drill.id} className="bg-slate-700 p-2 rounded text-sm">
                        <p className="font-semibold">{drill.name} <span className="text-xs text-slate-400">({drill.type})</span></p>
                    </div>
                ))}
            </div>
            <form onSubmit={handleAddDrill} className="space-y-2">
                 <input value={name} onChange={e => setName(e.target.value)} placeholder="New Drill Name" className="w-full text-sm p-1.5 bg-slate-600 rounded" />
                 <select value={type} onChange={e => setType(e.target.value as any)} className="w-full text-sm p-1.5 bg-slate-600 rounded">
                     <option>Offense</option>
                     <option>Defense</option>
                     <option>Special Teams</option>
                 </select>
                 <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description..." rows={2} className="w-full text-sm p-1.5 bg-slate-600 rounded resize-none" />
                 <button type="submit" className="w-full text-sm py-1.5 bg-brand-primary/50 hover:bg-brand-primary rounded font-semibold">Add Drill</button>
            </form>
        </div>
    );
};


// --- MAIN COMPONENT ---

const PracticePlannerPage: React.FC = () => {
    const [ai, setAi] = useState<GoogleGenAI | null>(null);
    const { teamProfile } = useContext(TeamContext);
    const { apiKey } = useContext(ApiKeyContext);
    const [opponent, setOpponent] = useState<TeamIntel | null>(mockTeamIntel[0]);
    const [focus, setFocus] = useState('Red Zone Efficiency');
    const [weaknesses, setWeaknesses] = useState('Pass protection on 3rd down, open-field tackling.');
    const [practicePlan, setPracticePlan] = useState<PracticePlan | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [drills, setDrills] = useState<Drill[]>(mockDrills);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

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


    const handlePlanChange = (dayIndex: number, scheduleIndex: number, field: keyof ScheduleItem, value: string | number) => {
        if (!practicePlan) return;
        
        const newPlan = { ...practicePlan };
        const newDays = JSON.parse(JSON.stringify(newPlan.days)); // Deep copy to avoid mutation issues
        newDays[dayIndex].schedule[scheduleIndex][field] = value;
        newPlan.days = newDays;
        setPracticePlan(newPlan);
    };
    
    const handleDayFieldChange = (dayIndex: number, field: keyof DayPlan, value: string) => {
        if (!practicePlan) return;
        const newPlan = { ...practicePlan };
        const newDays = JSON.parse(JSON.stringify(newPlan.days));
        newDays[dayIndex][field] = value;
        newPlan.days = newDays;
        setPracticePlan(newPlan);
    }

    const generatePlan = async () => {
        if (!opponent) return;
        setIsLoading(true);
        setPracticePlan(null);
        setError('');

        // --- DEMO MODE LOGIC ---
        if (!ai) {
            setTimeout(() => {
                setPracticePlan({
                    id: Date.now(),
                    title: `AI Plan vs ${opponent.teamName} (DEMO)`,
                    days: [
                        {
                            day: "Tuesday",
                            theme: "Install & Early Downs",
                            schedule: [
                                { time: "15:30", duration: 10, activity: "Dynamic Warmup", coachingPoints: "High energy, focus on hamstring flexibility." },
                                { time: "15:40", duration: 15, activity: "Pat & Go (Offense)", coachingPoints: "QBs focus on quick release, WRs on crisp breaks." },
                                { time: "15:55", duration: 20, activity: "Route Tree Mastery", coachingPoints: "Exploit their soft zone coverage. Snap routes off at 10 yards." },
                                { time: "16:15", duration: 20, activity: "Inside Run Period", coachingPoints: "O-Line must win the gap. RBs read the A-gap conflict." }
                            ]
                        },
                         {
                            day: "Wednesday",
                            theme: "Situational & 3rd Down",
                            schedule: [
                                { time: "15:30", duration: 10, activity: "Team Stretch", coachingPoints: "Mental focus check." },
                                { time: "15:40", duration: 20, activity: "Trench Warfare", coachingPoints: "Pass protection is priority #1. Hands inside." },
                                { time: "16:00", duration: 25, activity: "7-on-7 (3rd & Long)", coachingPoints: "Defense: No deep balls. Keep everything in front." },
                                { time: "16:25", duration: 15, activity: "Special Teams (Punt)", coachingPoints: "Stay in lanes. No blocks in the back." }
                            ]
                        }
                    ]
                });
                setIsLoading(false);
            }, 2000);
            return;
        }
        // -----------------------

        const drillNames = drills.map(d => `'${d.name}' (${d.type})`).join(', ');
        const practicePlanSchema = {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                days: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            day: { type: Type.STRING },
                            theme: { type: Type.STRING },
                            schedule: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        time: { type: Type.STRING },
                                        duration: { type: Type.NUMBER, description: "Duration in minutes" },
                                        activity: { type: Type.STRING },
                                        coachingPoints: { type: Type.STRING }
                                    },
                                    required: ['time', 'duration', 'activity', 'coachingPoints']
                                }
                            }
                        },
                        required: ['day', 'theme', 'schedule']
                    }
                }
            },
            required: ['title', 'days']
        };

        const prompt = `You are an expert football coach creating a 3-day practice plan for the "${teamProfile.name}" who run a ${teamProfile.offensiveScheme} offense and a ${teamProfile.defensiveScheme} defense.

        **This Week's Opponent:** ${opponent.teamName}
        - Opponent's Intel: ${opponent.philosophy}. ${opponent.offensiveTendencies}. ${opponent.defensiveTendencies}.

        **Our Team's Focus:**
        - Primary Focus Area: ${focus || 'Overall Preparation'}
        - Our Weaknesses to Improve: ${weaknesses || 'General fundamentals'}

        **Available Drills in our library:** ${drillNames}. You MUST prioritize suggesting drills from this list. You can also suggest other standard football drills if they are a better fit.

        Generate a detailed 3-day practice plan (e.g., Tuesday, Wednesday, Thursday). Return a JSON object matching the provided schema. For each schedule item, the 'activity' should name a specific drill and the 'coachingPoints' should be concise and actionable, directly addressing our weaknesses or how to exploit the opponent.`;

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
                 config: {
                    responseMimeType: "application/json",
                    responseSchema: practicePlanSchema,
                }
            });
            const parsedPlan = JSON.parse(response.text);
            setPracticePlan({ id: Date.now(), ...parsedPlan });
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    const savePlan = () => {
        if (!practicePlan) return;
        localStorage.setItem(`practicePlan_${practicePlan.id}`, JSON.stringify(practicePlan));
        alert(`Plan "${practicePlan.title}" saved!`);
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 h-full flex flex-col">
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #printable-plan, #printable-plan * { visibility: visible; }
                    #printable-plan { position: absolute; left: 0; top: 0; width: 100%; padding: 1rem; }
                    .no-print, nav, aside, footer { display: none !important; }
                    .printable-input { border: none !important; background-color: transparent !important; color: black !important; -webkit-print-color-adjust: exact; }
                    body { background-color: white !important; }
                    #printable-plan { color: black !important; }
                    h1, h2, h3, h4, p, span, div, input, textarea { color: black !important; }
                    .bg-slate-800, .bg-slate-900\\/50 { background-color: white !important; border: 1px solid #ccc !important; }
                    .border-slate-700 { border-color: #ccc !important; }
                    .text-brand-accent { color: #3b82f6 !important; }
                }
            `}</style>
            <div className="flex-shrink-0">
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3"><Dumbbell /> Practice Planner</h1>
                <p className="text-slate-400 mb-8">Generate a custom, AI-powered practice plan for the week.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-grow overflow-hidden">
                {/* Left Panel: Inputs */}
                <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto">
                    <div className="bg-slate-800 rounded-xl shadow-lg p-6 space-y-4">
                         <h2 className="text-xl font-bold">Weekly Preparation</h2>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Opponent</label>
                            <select value={opponent?.id || ''} onChange={(e) => setOpponent(mockTeamIntel.find(t => t.id === Number(e.target.value)) || null)} className="w-full p-2 bg-slate-700 rounded-lg border border-slate-600">
                                {mockTeamIntel.map(t => <option key={t.id} value={t.id}>{t.teamName}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Primary Focus</label>
                            <input type="text" value={focus} onChange={e => setFocus(e.target.value)} placeholder="e.g., Red Zone Offense" className="w-full p-2 bg-slate-700 rounded-lg border border-slate-600" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Our Weaknesses to Address</label>
                            <textarea value={weaknesses} onChange={e => setWeaknesses(e.target.value)} rows={3} placeholder="e.g., Pass protection, open-field tackling" className="w-full p-2 bg-slate-700 rounded-lg border border-slate-600 resize-none" />
                        </div>
                         <button onClick={generatePlan} disabled={isLoading || !opponent} className="w-full mt-2 bg-brand-primary hover:bg-brand-dark font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition disabled:bg-slate-600">
                            <Wand2 size={18} /> {isLoading ? "Generating Plan..." : "Generate AI Practice Plan"}
                        </button>
                        {!ai && <p className="text-xs text-center text-brand-accent">Running in Demo Mode (No API Key)</p>}
                    </div>
                    <DrillLibrary drills={drills} setDrills={setDrills} />
                </div>

                {/* Right Panel: Output */}
                <div id="printable-plan" className="lg:col-span-2 bg-slate-800 rounded-xl shadow-lg p-6 overflow-y-auto">
                    <div className="flex justify-between items-center mb-4 no-print">
                         <h2 className="text-xl font-bold flex items-center gap-2"><BrainCircuit /> Generated Plan</h2>
                         {practicePlan && (
                             <div className="flex items-center gap-2">
                                 <button onClick={savePlan} title="Save Plan" className="p-2 bg-slate-700 hover:bg-brand-primary rounded-lg transition"><Save size={18}/></button>
                                 <button onClick={() => setIsShareModalOpen(true)} title="Share Plan" className="p-2 bg-slate-700 hover:bg-brand-primary rounded-lg transition"><Share2 size={18}/></button>
                             </div>
                         )}
                    </div>
                    {error && <div className="bg-red-500/20 text-red-300 text-sm p-3 rounded-lg flex items-start gap-2"><AlertTriangle size={20}/><div>{error}</div></div>}
                    {isLoading && <div className="text-slate-400 animate-pulse p-4">The AI is scripting your practices...</div>}
                    {practicePlan ? (
                        <div className="space-y-6">
                            <input value={practicePlan.title} onChange={e => setPracticePlan({...practicePlan, title: e.target.value})} className="text-2xl font-bold bg-transparent w-full focus:outline-none focus:bg-slate-700 rounded p-1 printable-input"/>
                            {practicePlan.days.map((day, dayIndex) => (
                                <div key={dayIndex}>
                                    <div className="flex border-b border-slate-700 pb-2 mb-3">
                                        <h3 className="text-lg font-bold">{day.day} - </h3>
                                        <input value={day.theme} onChange={e => handleDayFieldChange(dayIndex, 'theme', e.target.value)} className="text-lg font-bold bg-transparent focus:outline-none focus:bg-slate-700 rounded p-1 w-full sm:w-3/4 printable-input"/>
                                    </div>
                                    <div className="space-y-4">
                                        {day.schedule.map((item, itemIndex) => (
                                            <div key={itemIndex} className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                                                <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <input value={item.time} onChange={e => handlePlanChange(dayIndex, itemIndex, 'time', e.target.value)} className="font-semibold bg-transparent w-28 focus:outline-none focus:bg-slate-700 rounded p-0.5 printable-input" />
                                                            (<input type="number" value={item.duration} onChange={e => handlePlanChange(dayIndex, itemIndex, 'duration', Number(e.target.value))} className="text-slate-400 bg-transparent w-12 focus:outline-none focus:bg-slate-700 rounded p-0.5 printable-input"/> min)
                                                        </div>
                                                        <input value={item.activity} onChange={e => handlePlanChange(dayIndex, itemIndex, 'activity', e.target.value)} className="font-bold text-brand-accent text-lg bg-transparent w-full focus:outline-none focus:bg-slate-700 rounded p-0.5 mt-1 printable-input" />
                                                    </div>
                                                    <div className="no-print flex-shrink-0"><DrillTimer durationInMinutes={item.duration} /></div>
                                                </div>
                                                 <textarea value={item.coachingPoints} onChange={e => handlePlanChange(dayIndex, itemIndex, 'coachingPoints', e.target.value)} className="text-sm text-slate-300 mt-2 bg-transparent w-full focus:outline-none focus:bg-slate-700 rounded p-1 resize-none printable-input" rows={2}/>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                       !isLoading && !error && <p className="text-slate-500 text-center mt-8 p-4">Your generated practice plan will appear here. Configure the settings on the left and click "Generate".</p>
                    )}
                </div>
            </div>
             {isShareModalOpen && practicePlan && <ShareModal plan={practicePlan} closeModal={() => setIsShareModalOpen(false)} />}
        </div>
    );
};

export default PracticePlannerPage;
