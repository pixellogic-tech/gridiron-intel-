
import React, { useState, useRef, useEffect, useCallback, useContext } from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, PlusCircle, X, Edit, Trash2, Video, UploadCloud, CheckCircle, Shield, Users, Play, Pause, Rewind, FastForward, Bookmark, Clapperboard, Film, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import { TeamIntel, mockTeamIntel } from './TeamData';
import { GoogleGenAI, Type } from '@google/genai';
import { TeamContext, ApiKeyContext } from '../App';

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


// Reusable modal for adding/editing team intel
const IntelEditModal: React.FC<{
    intel?: TeamIntel | null;
    onSave: (data: Omit<TeamIntel, 'id'>) => void;
    closeModal: () => void;
}> = ({ intel, onSave, closeModal }) => {
    const [formData, setFormData] = useState({
        teamName: intel?.teamName || '',
        philosophy: intel?.philosophy || '',
        offensiveTendencies: intel?.offensiveTendencies || '',
        defensiveTendencies: intel?.defensiveTendencies || '',
        keyPlayers: intel?.keyPlayers || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.teamName) {
            alert("Team Name is required.");
            return;
        }
        onSave(formData);
    };

    const inputClass = "w-full p-2 bg-slate-700 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-primary";
    const textareaClass = `${inputClass} resize-none`;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 w-full max-w-2xl rounded-xl shadow-2xl">
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        {intel ? <Edit /> : <PlusCircle />}
                        {intel ? 'Edit Team Intel' : 'Add New Team Intel'}
                    </h2>
                    <button onClick={closeModal} className="p-2 rounded-full hover:bg-slate-700"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Team Name</label>
                        <input type="text" name="teamName" value={formData.teamName} onChange={handleChange} required className={inputClass} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">General Philosophy</label>
                        <textarea name="philosophy" value={formData.philosophy} onChange={handleChange} rows={2} className={textareaClass} placeholder="e.g., Air Raid offense, aggressive 4-2-5 defense..." />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Offensive Tendencies</label>
                        <textarea name="offensiveTendencies" value={formData.offensiveTendencies} onChange={handleChange} rows={4} className={textareaClass} placeholder="List known plays, formations, player habits..." />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Defensive Tendencies</label>
                        <textarea name="defensiveTendencies" value={formData.defensiveTendencies} onChange={handleChange} rows={4} className={textareaClass} placeholder="List known schemes, blitz packages, weaknesses..." />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Key Players</label>
                        <textarea name="keyPlayers" value={formData.keyPlayers} onChange={handleChange} rows={3} className={textareaClass} placeholder="e.g., #10 WR - Go-to receiver. #55 DE - Elite pass rusher." />
                    </div>
                    <div className="pt-2">
                        <button type="submit" className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-lg font-bold">Save Intel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


interface OpponentAnalysis {
    philosophy: string;
    offensiveTendencies: string;
    defensiveTendencies: string;
    keyPlayers: string;
}

interface MyTeamAnalysis {
    strengths: string;
    weaknesses: string;
    opportunities: string;
}

interface DualAnalysisResult {
    opponentAnalysis: OpponentAnalysis;
    myTeamAnalysis: MyTeamAnalysis;
}

const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const date = new Date(0);
    date.setSeconds(seconds);
    return date.toISOString().substr(14, 5);
};

type FilmSource = {
    name: string;
    src: string;
    source: 'file' | 'url';
    file?: File;
};


// Enhanced Modal for AI Film Review
const AIReviewFilmModal: React.FC<{
    ai: GoogleGenAI | null;
    intel: TeamIntel;
    onUpdate: (updatedIntel: TeamIntel) => void;
    closeModal: () => void;
}> = ({ ai, intel, onUpdate, closeModal }) => {
    const [films, setFilms] = useState<FilmSource[]>([]);
    const [urlInput, setUrlInput] = useState('');
    const [selectedFilmIndex, setSelectedFilmIndex] = useState<number | null>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [bookmarks, setBookmarks] = useState<number[]>([]);
    const [progress, setProgress] = useState(0);

    const [frames, setFrames] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState('');
    const [aiResult, setAiResult] = useState<DualAnalysisResult | null>(null);
    const [error, setError] = useState('');
    const { teamProfile } = useContext(TeamContext);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            video.playbackRate = playbackRate;
        }
    }, [playbackRate]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newFilms = Array.from(files).map((file: File) => ({
                file,
                src: URL.createObjectURL(file as Blob),
                name: file.name,
                source: 'file' as 'file'
            }));
            setFilms(prev => [...prev, ...newFilms]);
            if (selectedFilmIndex === null && newFilms.length > 0) {
                setSelectedFilmIndex(films.length);
            }
        }
    };
    
    const handleAddUrl = () => {
        if (!urlInput.trim()) return;
        const url = urlInput.trim();
        let instructionalError = '';

        if (url.includes('hudl.com')) {
            instructionalError = "Hudl videos are private and cannot be analyzed directly. Please download the video from Hudl, then use the 'Add Film from Computer' button to upload the file.";
            setError(instructionalError);
            return;
        }
        if (url.includes('youtube.com') || url.includes('vimeo.com')) {
             instructionalError = "Analysis from streaming sites may fail due to security restrictions. For best results, download the video and upload it as a file.";
        }
        setError(instructionalError);

        const newFilm: FilmSource = {
            name: url.split('/').pop() || 'Untitled URL Film',
            src: url,
            source: 'url',
        };

        setFilms(prev => [...prev, newFilm]);
        setUrlInput('');
        if (selectedFilmIndex === null) {
            setSelectedFilmIndex(films.length);
        }
    };
    
    const handleSelectFilm = (index: number) => {
        setSelectedFilmIndex(index);
        setAiResult(null);
        setError('');
        setFrames([]);
        setBookmarks([]);
        setProgress(0);
        setIsPlaying(false);
    };

    const handleDeleteFilm = (index: number) => {
        setFilms(prev => prev.filter((_, i) => i !== index));
        if (selectedFilmIndex === index) {
            setSelectedFilmIndex(films.length > 1 ? 0 : null);
        } else if (selectedFilmIndex && selectedFilmIndex > index) {
            setSelectedFilmIndex(selectedFilmIndex - 1);
        }
    };
    
    const togglePlayPause = () => {
        if (videoRef.current) {
            videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause();
        }
    };

    const handleProgress = () => {
        if (videoRef.current && videoRef.current.duration) {
            const percentage = (videoRef.current.currentTime / videoRef.current.duration) * 100;
            setProgress(percentage);
        }
    };

    const scrub = (direction: 'forward' | 'backward') => {
        if (videoRef.current) {
            const frameTime = 1 / 30; // Assuming 30fps
            videoRef.current.currentTime += direction === 'forward' ? frameTime : -frameTime;
        }
    };
    
    const addBookmark = () => {
        if(videoRef.current) {
            const currentTime = videoRef.current.currentTime;
            if(!bookmarks.includes(currentTime)) {
                setBookmarks(prev => [...prev, currentTime].sort((a, b) => a - b));
            }
        }
    };

    const seekToBookmark = (time: number) => {
        if (videoRef.current) videoRef.current.currentTime = time;
    };


    const captureFrames = useCallback(async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || !video.duration || video.readyState < 2) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        setIsLoading(true);
        setFrames([]);
        setError('');

        const capturedFrames: string[] = [];
        const numFrames = 10;
        const duration = video.duration;
        const interval = duration / (numFrames + 1);

        try {
            for (let i = 0; i < numFrames; i++) {
                const time = interval * (i + 1);
                setLoadingStatus(`Capturing frame ${i + 1}/${numFrames}...`);
                video.currentTime = time;
                
                await new Promise(resolve => {
                    video.addEventListener('seeked', () => resolve(null), { once: true });
                });
                
                await new Promise(r => setTimeout(r, 100)); // Short delay for rendering
                
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                capturedFrames.push(canvas.toDataURL('image/jpeg', 0.8).split(',')[1]);
            }
            setFrames(capturedFrames);
            setLoadingStatus('Frames Captured. Ready to analyze.');
        } catch (e) {
            console.error("Frame capture failed:", e);
            setError("Could not analyze video from this URL due to security restrictions. Please download the video and upload it as a file.");
            setLoadingStatus('');
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    const handleAnalyze = async () => {
        if (frames.length === 0) return;
        
        if (!ai) {
            setError("Demo Mode: Video Analysis requires a live API Key. Please enter one in Settings.");
            return;
        }

        setIsLoading(true);
        setLoadingStatus('AI is analyzing the film...');
        setAiResult(null);
        setError('');

        try {
            const imageParts = frames.map(frame => ({
                inlineData: { mimeType: 'image/jpeg', data: frame }
            }));
            const prompt = `You are an elite football scout analyzing a game between "My Team" and the opponent "${intel.teamName}". 
            
            My Team's Profile:
            - Name: ${teamProfile.name} ${teamProfile.mascot}
            - Offensive Scheme: ${teamProfile.offensiveScheme}
            - Defensive Scheme: ${teamProfile.defensiveScheme}

            Here is the current scouting report I have for the opponent, "${intel.teamName}":
            - Philosophy: ${intel.philosophy}
            - Offensive Tendencies: ${intel.offensiveTendencies}
            - Defensive Tendencies: ${intel.defensiveTendencies}
            - Key Players: ${intel.keyPlayers}

            Now, based on the following new film frames, refine, expand, and correct the existing report. Provide a complete, updated, dual-sided scouting report with separate analyses for both teams.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: { parts: [{ text: prompt }, ...imageParts] },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                           opponentAnalysis: { 
                                type: Type.OBJECT,
                                description: "Updated analysis of the opponent based on the new film.",
                                properties: {
                                    philosophy: { type: Type.STRING, description: "The opponent's core offensive and defensive identity." },
                                    offensiveTendencies: { type: Type.STRING, description: "Specific observations on the opponent's offensive schemes." },
                                    defensiveTendencies: { type: Type.STRING, description: "Specific observations on the opponent's defensive schemes." },
                                    keyPlayers: { type: Type.STRING, description: "Notes on the opponent's standout athletes." }
                                }
                           },
                           myTeamAnalysis: {
                                type: Type.OBJECT,
                                description: "Constructive analysis of my team.",
                                properties: {
                                    strengths: { type: Type.STRING, description: "What my team did well in this film." },
                                    weaknesses: { type: Type.STRING, description: "Areas where my team struggled or showed vulnerabilities." },
                                    opportunities: { type: Type.STRING, description: "Actionable suggestions for my team to improve or exploit opponent weaknesses." }
                                }
                           }
                        },
                         required: ['opponentAnalysis', 'myTeamAnalysis']
                    }
                }
            });

            const parsedResult = JSON.parse(response.text);
            setAiResult(parsedResult);

        } catch (e: unknown) {
            setError(getApiErrorMessage(e));
        } finally {
            setIsLoading(false);
            setLoadingStatus('');
        }
    };

    const handleAccept = () => {
        if (!aiResult) return;
        const updatedIntel: TeamIntel = {
            ...intel,
            philosophy: aiResult.opponentAnalysis.philosophy,
            offensiveTendencies: aiResult.opponentAnalysis.offensiveTendencies,
            defensiveTendencies: aiResult.opponentAnalysis.defensiveTendencies,
            keyPlayers: aiResult.opponentAnalysis.keyPlayers,
        };
        onUpdate(updatedIntel);
        setAiResult(null); // Clear result after accepting
    };
    
    const selectedFilm = selectedFilmIndex !== null ? films[selectedFilmIndex] : null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 w-full max-w-7xl h-[95vh] rounded-xl shadow-2xl flex flex-col">
                <div className="p-4 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2"><Clapperboard /> AI Film Room: {intel.teamName}</h2>
                    <button onClick={closeModal} className="p-2 rounded-full hover:bg-slate-700"><X size={20} /></button>
                </div>
                <div className="p-6 flex-grow grid grid-cols-1 md:grid-cols-5 gap-6 overflow-hidden">
                    {/* Left Panel: Player & Management */}
                    <div className="md:col-span-3 flex flex-col gap-4 overflow-y-auto">
                        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700 space-y-3">
                            <div className="flex flex-col sm:flex-row items-center gap-2">
                                <input type="text" value={urlInput} onChange={e => setUrlInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddUrl()} placeholder="Paste video URL here..." className="w-full p-2 bg-slate-700 rounded-lg border border-slate-600" />
                                <button onClick={handleAddUrl} className="py-2 px-3 bg-slate-600 hover:bg-brand-primary rounded-lg font-semibold flex-shrink-0"><LinkIcon size={18} /></button>
                            </div>
                            <button onClick={() => fileInputRef.current?.click()} className="w-full text-center py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-semibold transition">
                                <UploadCloud size={16} className="inline mr-2" />
                                Add Film(s) from Computer
                            </button>
                            <input type="file" accept="video/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
                             <div className="flex gap-2 flex-wrap max-h-24 overflow-y-auto">
                                {films.map((film, index) => (
                                    <div key={index} className={`flex items-center gap-2 p-2 rounded-lg text-sm border-2 cursor-pointer ${selectedFilmIndex === index ? 'bg-brand-primary/20 border-brand-primary' : 'bg-slate-700 border-transparent hover:border-slate-500'}`}>
                                        <span onClick={() => handleSelectFilm(index)} className="truncate max-w-xs">{film.name}</span>
                                        <button onClick={() => handleDeleteFilm(index)} className="text-slate-400 hover:text-red-500"><X size={14} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex-grow bg-black rounded-lg flex items-center justify-center relative aspect-video">
                           {selectedFilm ? (
                                <video 
                                    ref={videoRef}
                                    key={selectedFilm.src} 
                                    src={selectedFilm.src}
                                    controls
                                    crossOrigin="anonymous" 
                                    onTimeUpdate={handleProgress} 
                                    onPlay={() => setIsPlaying(true)} 
                                    onPause={() => setIsPlaying(false)}
                                    onLoadedData={captureFrames}
                                    className="max-h-full max-w-full" 
                                />
                            ) : (
                                <div className="text-slate-500 text-center">
                                    <Film size={48} className="mx-auto mb-4"/>
                                    Select or upload a film to begin.
                                </div>
                            )}
                        </div>
                        {selectedFilm && (
                             <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700 space-y-3">
                                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
                                     <button onClick={addBookmark} className="p-2 hover:bg-slate-700 rounded-full flex items-center gap-1 text-sm"><Bookmark size={18}/> Mark</button>
                                     <div className="flex items-center gap-1">
                                         {[0.5, 1, 1.5, 2].map(rate => (
                                             <button key={rate} onClick={() => setPlaybackRate(rate)} className={`px-2 py-0.5 rounded text-xs ${playbackRate === rate ? 'bg-brand-accent' : 'bg-slate-600'}`}>{rate}x</button>
                                         ))}
                                     </div>
                                 </div>
                                 {bookmarks.length > 0 && (
                                     <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-700 max-h-20 overflow-y-auto">
                                         {bookmarks.map(time => (
                                             <button key={time} onClick={() => seekToBookmark(time)} className="text-xs bg-slate-600 hover:bg-brand-primary px-2 py-1 rounded">{formatTime(time)}</button>
                                         ))}
                                     </div>
                                 )}
                            </div>
                        )}
                    </div>

                     {/* Right Panel: AI Analysis */}
                    <div className="md:col-span-2 flex flex-col gap-4 overflow-y-auto">
                         <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                            <h3 className="font-semibold text-lg text-center sm:text-left">AI Generated Intel</h3>
                             <button onClick={handleAnalyze} disabled={frames.length === 0 || isLoading || !selectedFilm} className="py-2 px-4 bg-brand-primary hover:bg-brand-dark rounded-lg font-bold disabled:bg-slate-600 text-sm flex items-center gap-2 w-full sm:w-auto justify-center">
                                <BrainCircuit size={16}/> {isLoading ? loadingStatus : 'Analyze Film'}
                            </button>
                        </div>
                        <div className="flex-grow bg-slate-900/50 p-4 rounded-lg overflow-y-auto border border-slate-700 space-y-4">
                             {error && <div className="text-yellow-400 p-3 bg-yellow-500/10 rounded-lg text-sm flex items-start gap-2"><AlertTriangle size={20}/><div>{error}</div></div>}
                             {aiResult ? (
                                <>
                                    <div className="border border-red-500/30 bg-red-500/10 p-4 rounded-lg">
                                        <h4 className="text-lg font-bold text-red-400 mb-2 flex items-center gap-2"><Shield /> Opponent Analysis: {intel.teamName}</h4>
                                        <div><strong className="text-slate-200">Philosophy:</strong><p className="text-sm text-slate-300">{aiResult.opponentAnalysis.philosophy}</p></div>
                                        <div className="mt-2"><strong className="text-slate-200">Offensive Tendencies:</strong><p className="text-sm text-slate-300 whitespace-pre-wrap">{aiResult.opponentAnalysis.offensiveTendencies}</p></div>
                                        <div className="mt-2"><strong className="text-slate-200">Defensive Tendencies:</strong><p className="text-sm text-slate-300 whitespace-pre-wrap">{aiResult.opponentAnalysis.defensiveTendencies}</p></div>
                                        <div className="mt-2"><strong className="text-slate-200">Key Players:</strong><p className="text-sm text-slate-300 whitespace-pre-wrap">{aiResult.opponentAnalysis.keyPlayers}</p></div>
                                    </div>
                                    <div className="border border-blue-500/30 bg-blue-500/10 p-4 rounded-lg">
                                        <h4 className="text-lg font-bold text-blue-400 mb-2 flex items-center gap-2"><Users /> My Team Analysis: {teamProfile.name}</h4>
                                        <div><strong className="text-slate-200">Strengths:</strong><p className="text-sm text-slate-300 whitespace-pre-wrap">{aiResult.myTeamAnalysis.strengths}</p></div>
                                        <div className="mt-2"><strong className="text-slate-200">Weaknesses:</strong><p className="text-sm text-slate-300 whitespace-pre-wrap">{aiResult.myTeamAnalysis.weaknesses}</p></div>
                                        <div className="mt-2"><strong className="text-slate-200">Opportunities:</strong><p className="text-sm text-slate-300 whitespace-pre-wrap">{aiResult.myTeamAnalysis.opportunities}</p></div>
                                    </div>
                                </>
                            ) : !isLoading && <p className="text-slate-500 text-center p-8">Analysis results will appear here after you run the AI analysis on a selected film.</p>}
                            {isLoading && !aiResult && <div className="animate-pulse text-slate-400 p-8">{loadingStatus}</div>}
                        </div>
                         <button onClick={handleAccept} disabled={!aiResult || isLoading} className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold disabled:bg-slate-600 flex items-center justify-center gap-2">
                            <CheckCircle size={18}/> Accept & Update Intel
                        </button>
                    </div>
                </div>
                <canvas ref={canvasRef} className="hidden" />
            </div>
        </div>
    );
};


const TeamIntelPage: React.FC = () => {
    const [ai, setAi] = useState<GoogleGenAI | null>(null);
    const [teamIntelList, setTeamIntelList] = useState<TeamIntel[]>(mockTeamIntel);
    const [editingIntel, setEditingIntel] = useState<TeamIntel | null>(null);
    const [reviewingIntel, setReviewingIntel] = useState<TeamIntel | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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

    const handleSave = (data: Omit<TeamIntel, 'id'>) => {
        if (editingIntel) {
            // Update existing
            setTeamIntelList(prev => prev.map(item => item.id === editingIntel.id ? { ...item, ...data } : item));
        } else {
            // Add new
            const newIntel: TeamIntel = { id: Date.now(), ...data };
            setTeamIntelList(prev => [newIntel, ...prev]);
        }
        closeEditModal();
    };

    const handleAIUpdate = (updatedIntel: TeamIntel) => {
        const newList = teamIntelList.map(item => item.id === updatedIntel.id ? updatedIntel : item);
        setTeamIntelList(newList);
        // This is the key for progressive learning: update the object the modal is reviewing
        setReviewingIntel(updatedIntel);
    };

    const handleDelete = (id: number) => {
        if (window.confirm("Are you sure you want to delete this intel? This action cannot be undone.")) {
            setTeamIntelList(prev => prev.filter(item => item.id !== id));
        }
    };

    const openEditModal = (intel: TeamIntel | null = null) => {
        setEditingIntel(intel);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setEditingIntel(null);
        setIsEditModalOpen(false);
    };

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold flex items-center gap-3"><BrainCircuit /> AI Knowledge Base</h1>
                <button onClick={() => openEditModal()} className="bg-brand-primary hover:bg-brand-dark text-white font-bold py-2 px-4 rounded-lg transition flex items-center gap-2 w-full sm:w-auto justify-center">
                    <PlusCircle size={18} /> Add Team Intel
                </button>
            </div>
            <p className="text-slate-400 mb-6 max-w-3xl">
                This is where you train the AI. Add your scouting notes and knowledge about opponents here. When you analyze game film, the AI will use this information as its "ground truth" to provide more accurate, tailored analysis.
            </p>

            {/* Desktop Table */}
            <div className="hidden md:block bg-slate-800 rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-700">
                            <tr>
                                <th className="p-4">Team Name</th>
                                <th className="p-4">Philosophy</th>
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teamIntelList.map(intel => (
                                <tr key={intel.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                                    <td className="p-4 font-semibold">{intel.teamName}</td>
                                    <td className="p-4 text-slate-300 truncate max-w-md">{intel.philosophy}</td>
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center gap-2">
                                             <button onClick={() => setReviewingIntel(intel)} className="bg-blue-600/50 hover:bg-blue-600 text-sm px-3 py-1 rounded-md transition flex items-center gap-1">
                                                <Video size={14}/> AI Review
                                            </button>
                                            <button onClick={() => openEditModal(intel)} className="bg-slate-600 hover:bg-brand-primary text-sm px-3 py-1 rounded-md transition flex items-center gap-1">
                                                <Edit size={14}/> Edit
                                            </button>
                                            <button onClick={() => handleDelete(intel.id)} className="bg-red-600/50 hover:bg-red-600 text-sm px-3 py-1 rounded-md transition flex items-center gap-1">
                                                <Trash2 size={14}/> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Mobile Card List */}
            <div className="md:hidden space-y-4">
                {teamIntelList.map(intel => (
                     <div key={intel.id} className="bg-slate-800 rounded-xl shadow-lg p-4">
                        <h3 className="font-bold text-lg">{intel.teamName}</h3>
                        <p className="text-sm text-slate-400 mt-1 mb-3">{intel.philosophy}</p>
                        <div className="flex flex-col gap-2">
                             <button onClick={() => setReviewingIntel(intel)} className="bg-blue-600/50 hover:bg-blue-600 text-sm w-full py-2 rounded-md transition flex items-center gap-2 justify-center">
                                <Video size={14}/> AI Review Film
                            </button>
                             <div className="flex gap-2">
                                <button onClick={() => openEditModal(intel)} className="bg-slate-600 hover:bg-brand-primary text-sm w-full py-2 rounded-md transition flex items-center gap-2 justify-center">
                                    <Edit size={14}/> Edit
                                </button>
                                <button onClick={() => handleDelete(intel.id)} className="bg-red-600/50 hover:bg-red-600 text-sm w-full py-2 rounded-md transition flex items-center gap-2 justify-center">
                                    <Trash2 size={14}/> Delete
                                </button>
                            </div>
                        </div>
                     </div>
                ))}
            </div>


            {isEditModalOpen && <IntelEditModal intel={editingIntel} onSave={handleSave} closeModal={closeEditModal} />}
            {reviewingIntel && <AIReviewFilmModal ai={ai} intel={reviewingIntel} onUpdate={handleAIUpdate} closeModal={() => setReviewingIntel(null)} />}
        </div>
    );
};

export default TeamIntelPage;
