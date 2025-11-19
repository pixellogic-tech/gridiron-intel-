
import React, { useState, useEffect, useContext, useRef } from 'react';
import { GoogleGenAI, Type, Chat } from '@google/genai';
import { Zap, Bot, Send, X, Lightbulb } from 'lucide-react';
import { SettingsContext, TeamContext, ApiKeyContext } from '../App';
import { playSound } from '../utils/audio';
import { TeamIntel, mockTeamIntel } from './TeamData';

const getApiErrorMessage = (error: unknown): string => {
    console.error("API Error:", error);
    let message = "An unknown error occurred.";
    if (error instanceof Error) message = error.message;
    if (message.includes('429')) return "Rate limit exceeded. Please wait and try again.";
    return message;
};

const LivePlayPredictor: React.FC<{ ai: GoogleGenAI | null }> = ({ ai }) => {
    const [down, setDown] = useState(1);
    const [distance, setDistance] = useState(10);
    const [fieldPosition, setFieldPosition] = useState(25);
    const [prediction, setPrediction] = useState<{ playType: string; confidence: number; analysis: string; } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { settings } = useContext(SettingsContext);

    const handleGetPrediction = async () => {
        setIsLoading(true);
        setPrediction(null);
        setError('');

        // --- DEMO MODE ---
        if (!ai) {
            setTimeout(() => {
                const isPass = Math.random() > 0.4; // 60% chance pass in demo
                setPrediction({
                    playType: isPass ? 'Pass' : 'Run',
                    confidence: 85,
                    analysis: "DEMO: Based on down and distance, opponent tendencies suggest a standard play. Add API Key in Settings for real analysis."
                });
                if (settings.soundsEnabled) playSound('success');
                setIsLoading(false);
            }, 1500);
            return;
        }
        // -----------------

        const prompt = `You are an expert football play-caller AI. Given the following game situation, predict the opponent's most likely play call. Game State: Down: ${down}, Distance: ${distance} yards, Field Position: Own ${fieldPosition} yard line. Return a JSON object: { "playType": "Run" or "Pass", "confidence": number (0-100), "analysis": "Your brief reasoning." }.`;
        
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            playType: { type: Type.STRING },
                            confidence: { type: Type.NUMBER },
                            analysis: { type: Type.STRING },
                        },
                        required: ['playType', 'confidence', 'analysis']
                    }
                }
            });
            const parsedPrediction = JSON.parse(response.text);
            setPrediction(parsedPrediction);
            if (settings.soundsEnabled) playSound('success');
        } catch (err: unknown) {
            setError(getApiErrorMessage(err));
            if (settings.soundsEnabled) playSound('error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-800 rounded-xl shadow-lg p-6 space-y-4">
            <h2 className="text-xl font-bold text-white border-b border-slate-700 pb-3 mb-3 flex items-center gap-2"><Zap /> Live Play Predictor</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                <div>
                    <label className="text-xs text-slate-400">Down</label>
                    <select value={down} onChange={(e) => setDown(Number(e.target.value))} className="w-full bg-slate-700 p-2 rounded-lg text-center font-bold">
                        {[1, 2, 3, 4].map(d => <option key={d}>{d}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-xs text-slate-400">Distance</label>
                    <input type="number" value={distance} onChange={(e) => setDistance(Number(e.target.value))} className="w-full bg-slate-700 p-2 rounded-lg text-center font-bold" />
                </div>
                <div>
                     <label className="text-xs text-slate-400">Yard Line (Own)</label>
                    <input type="number" value={fieldPosition} onChange={(e) => setFieldPosition(Number(e.target.value))} className="w-full bg-slate-700 p-2 text-center font-bold" />
                </div>
            </div>

            <button onClick={handleGetPrediction} disabled={isLoading} className="w-full bg-brand-primary hover:bg-brand-dark font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition disabled:bg-slate-600">
                {isLoading ? "Analyzing..." : "Get AI Prediction"}
            </button>
            
            {!ai && <p className="text-xs text-center text-brand-accent">Running in Demo Mode (No API Key)</p>}
            {error && <div className="bg-red-500/20 text-red-300 text-sm p-3 rounded-lg">{error}</div>}

            {prediction && (
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-lg">Predicted Play: <span className={prediction.playType === 'Pass' ? 'text-blue-400' : 'text-green-400'}>{prediction.playType}</span></h3>
                        <div className="text-right">
                            <p className="font-bold text-2xl text-brand-accent">{prediction.confidence}%</p>
                            <p className="text-xs text-slate-400 -mt-1">Confidence</p>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm text-slate-300 flex items-center gap-1"><Lightbulb size={14}/> Analysis:</h4>
                        <p className="text-sm text-slate-400 mt-1">{prediction.analysis}</p>
                    </div>
                </div>
            )}
        </div>
    );
};


interface ChatMessage {
    sender: 'user' | 'bot';
    text: string;
}

const SituationalPlayCaller: React.FC<{ ai: GoogleGenAI | null, intel: TeamIntel }> = ({ ai, intel }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [chat, setChat] = useState<Chat | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { teamProfile } = useContext(TeamContext);

    useEffect(() => {
        if (!ai) {
             setMessages([{ sender: 'bot', text: `AI Play-Caller is in Demo Mode. Enter your API key in settings to enable live conversation.` }]);
            return;
        }

        const systemInstruction = `You are "Grid," an expert AI Football play-caller. You are advising the coach of the "${teamProfile.name} ${teamProfile.mascot}", who run a ${teamProfile.offensiveScheme} offense and a ${teamProfile.defensiveScheme} defense. The opponent is the ${intel.teamName}. Key intel: OFFENSE - ${intel.offensiveTendencies}. DEFENSE - ${intel.defensiveTendencies}. The coach will provide game situations. Your job is to suggest specific plays from our scheme that will be effective against this opponent's known tendencies. Be concise and direct.`;
        
        const newChat = ai.chats.create({ 
            model: 'gemini-2.5-pro',
            config: { systemInstruction }
        });
        setChat(newChat);
        setMessages([{ sender: 'bot', text: `Ready for the next play, Coach. What's the situation?` }]);
    }, [ai, intel, teamProfile]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        
        const userMessage: ChatMessage = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        if (!ai || !chat) {
            setTimeout(() => {
                setMessages(prev => [...prev, { sender: 'bot', text: "DEMO RESPONSE: I would recommend a Quick Slant to the X receiver. They are playing soft coverage." }]);
                setIsLoading(false);
            }, 1000);
            return;
        }

        try {
            const response = await chat.sendMessage({ message: input });
            const botMessage: ChatMessage = { sender: 'bot', text: response.text };
            setMessages(prev => [...prev, botMessage]);
        } catch (error: unknown) {
            const errorMessage: ChatMessage = { sender: 'bot', text: getApiErrorMessage(error) };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-800 rounded-xl shadow-lg flex flex-col h-full">
            <h2 className="text-xl font-bold text-white p-4 border-b border-slate-700 flex items-center gap-2 flex-shrink-0"><Bot/> Situational Play-Caller</h2>
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
                <div className="flex items-center gap-2 p-1 bg-slate-700 rounded-lg">
                    <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="e.g., 3rd and 8 on their 40..." className="w-full bg-transparent focus:outline-none text-white px-2" />
                    <button onClick={handleSend} disabled={isLoading || !input.trim()} className="bg-brand-primary p-2 rounded-lg hover:bg-brand-dark disabled:bg-slate-500 text-white"><Send size={20} /></button>
                </div>
            </div>
        </div>
    );
};

const QuickIntelWidget: React.FC<{ intel: TeamIntel }> = ({ intel }) => (
    <div className="bg-slate-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Quick Intel: {intel.teamName}</h2>
        <div className="space-y-4">
            <div>
                <h3 className="font-semibold text-red-400">Offensive Keys</h3>
                <p className="text-sm text-slate-300 mt-1">{intel.offensiveTendencies}</p>
            </div>
            <div>
                <h3 className="font-semibold text-blue-400">Defensive Keys</h3>
                <p className="text-sm text-slate-300 mt-1">{intel.defensiveTendencies}</p>
            </div>
             <div>
                <h3 className="font-semibold text-yellow-400">Key Players</h3>
                <p className="text-sm text-slate-300 mt-1 whitespace-pre-wrap">{intel.keyPlayers}</p>
            </div>
        </div>
    </div>
);


const GameTimePage: React.FC = () => {
    const [ai, setAi] = useState<GoogleGenAI | null>(null);
    const [opponentIntel] = useState<TeamIntel>(mockTeamIntel[0]); // Mock: Assume first team is opponent
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

    return (
        <div className="p-4 sm:p-6 md:p-8 h-full flex flex-col">
            <h1 className="text-3xl font-bold mb-8 flex-shrink-0">Game Time Hub</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-grow overflow-hidden h-full">
                <div className="lg:col-span-2 flex flex-col gap-8 overflow-y-auto">
                    <LivePlayPredictor ai={ai} />
                    <div className="flex-grow min-h-[400px]">
                        {opponentIntel && <SituationalPlayCaller ai={ai} intel={opponentIntel} />}
                    </div>
                </div>
                <div className="lg:col-span-1 overflow-y-auto h-full">
                    {opponentIntel && <QuickIntelWidget intel={opponentIntel} />}
                </div>
            </div>
        </div>
    );
};

export default GameTimePage;
