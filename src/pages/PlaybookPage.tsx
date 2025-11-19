import React, { useState, useRef, MouseEvent } from 'react';
import { BookCopy, PlusCircle, Trash2, Edit, Move, GitCompareArrows, Eraser } from 'lucide-react';
import { mockPlays, Play, PlayerMarker, PlayerPath } from './TeamData';

const FootballField: React.FC = () => (
    <svg viewBox="0 0 1200 533.33" className="w-full h-full">
        <rect width="1200" height="533.33" fill="#006A4E" />
        {/* Endzones */}
        <rect x="0" y="0" width="100" height="533.33" fill="#005C42" />
        <rect x="1100" y="0" width="100" height="533.33" fill="#005C42" />
        {/* Yard Lines */}
        {[...Array(21)].map((_, i) => {
            const x = 100 + i * 50;
            const isMajorLine = i % 2 === 0;
            return <line key={i} x1={x} y1="0" x2={x} y2="533.33" stroke="white" strokeWidth={isMajorLine ? 2 : 1} />;
        })}
        {/* Hash Marks */}
        {[...Array(100)].map((_, i) => {
            const x = 100 + i * 10;
            return (
                <g key={`hash-${i}`}>
                    <line x1={x} y1="188.33" x2={x} y2="198.33" stroke="white" strokeWidth="1" />
                    <line x1={x} y1="335" x2={x} y2="345" stroke="white" strokeWidth="1" />
                </g>
            );
        })}
        {/* Yard Numbers */}
        {[10, 20, 30, 40, 50, 40, 30, 20, 10].map((num, i) => {
            const x = 200 + i * 100;
            return (
                <g key={`num-${i}`}>
                    <text x={x} y="50" fill="white" fontSize="30" textAnchor="middle" fontWeight="bold">{num}</text>
                    <text x={x} y="493.33" fill="white" fontSize="30" textAnchor="middle" fontWeight="bold" transform={`rotate(180, ${x}, 493.33)`}>{num}</text>
                </g>
            );
        })}
    </svg>
);


const PlayDiagramEditor: React.FC<{
    play: Play;
    setPlay: React.Dispatch<React.SetStateAction<Play | null>>;
}> = ({ play, setPlay }) => {
    const [selectedTool, setSelectedTool] = useState<'move' | 'draw-path' | 'erase'>('move');
    const [activePath, setActivePath] = useState<PlayerPath | null>(null);
    const diagramRef = useRef<HTMLDivElement>(null);

    const getCoords = (e: MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>): { x: number; y: number } => {
        if (!diagramRef.current) return { x: 0, y: 0 };
        const rect = diagramRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const x = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
        const y = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100));
        return { x, y };
    };

    const handleInteractionStart = (e: MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, markerId: string) => {
        e.preventDefault();
        const startCoords = getCoords(e);
        
        const moveHandler = (moveEvent: globalThis.MouseEvent | globalThis.TouchEvent) => {
             const moveCoords = getCoords(moveEvent as any);
             if (selectedTool === 'move') {
                setPlay(p => p && ({ ...p, formationMarkers: p.formationMarkers.map(m => m.id === markerId ? { ...m, x: moveCoords.x, y: moveCoords.y } : m) }));
             } else if (selectedTool === 'draw-path') {
                setActivePath(path => path && ({ ...path, points: [...path.points, moveCoords] }));
             }
        };

        const endHandler = () => {
             if (selectedTool === 'draw-path') {
                setActivePath(currentPath => {
                    if (currentPath && currentPath.points.length > 1) {
                        setPlay(p => p && ({ ...p, paths: [...p.paths.filter(p => p.markerId !== markerId), currentPath] }));
                    }
                    return null;
                });
            }
            window.removeEventListener('mousemove', moveHandler as any);
            window.removeEventListener('mouseup', endHandler);
            window.removeEventListener('touchmove', moveHandler as any);
            window.removeEventListener('touchend', endHandler);
        };

        if (selectedTool === 'draw-path') {
             setActivePath({ markerId, points: [startCoords] });
        }

        window.addEventListener('mousemove', moveHandler as any);
        window.addEventListener('mouseup', endHandler);
        window.addEventListener('touchmove', moveHandler as any);
        window.addEventListener('touchend', endHandler);
    };
    
    const handleMarkerClick = (markerId: string) => {
        if (selectedTool === 'erase') {
            setPlay(p => p && ({
                ...p,
                formationMarkers: p.formationMarkers.filter(m => m.id !== markerId),
                paths: p.paths.filter(path => path.markerId !== markerId)
            }));
        }
    }
    
    const addMarker = (type: 'offense' | 'defense') => {
        const label = type === 'offense' ? 'O' : 'X';
        const newMarker: PlayerMarker = {
            id: `marker-${Date.now()}`,
            type,
            label,
            x: 50,
            y: type === 'offense' ? 70 : 30
        };
        setPlay(p => p && ({...p, formationMarkers: [...p.formationMarkers, newMarker]}));
    }

    const ToolButton = ({ icon: Icon, tool, label }: { icon: React.ElementType, tool: typeof selectedTool, label: string }) => (
        <button onClick={() => setSelectedTool(tool)} title={label} className={`p-2 rounded-lg transition ${selectedTool === tool ? 'bg-brand-primary text-white' : 'bg-slate-600 hover:bg-slate-500'}`}>
            <Icon size={20} />
        </button>
    );

    if (!play) return null;

    return (
        <div className="flex flex-col h-full">
             <div className="flex justify-center items-center gap-3 bg-slate-900/50 p-2 rounded-lg mb-4 flex-shrink-0 flex-wrap">
                <ToolButton icon={Move} tool="move" label="Move Player" />
                <ToolButton icon={GitCompareArrows} tool="draw-path" label="Draw Path" />
                <ToolButton icon={Eraser} tool="erase" label="Erase Player" />
                <div className="border-l border-slate-600 h-6 mx-2 hidden sm:block"></div>
                <button onClick={() => addMarker('offense')} className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm">Offense +</button>
                <button onClick={() => addMarker('defense')} className="p-2 rounded-lg bg-red-600 hover:bg-red-500 text-sm">Defense +</button>
            </div>
            <div ref={diagramRef} className="relative w-full flex-grow bg-slate-900 rounded-lg overflow-hidden select-none">
                <FootballField />
                <svg width="100%" height="100%" className="absolute top-0 left-0">
                    {play.paths.map(path => (
                        <polyline key={path.markerId} points={path.points.map(p => `${p.x}%,${p.y}%`).join(' ')} stroke="yellow" strokeWidth="2" fill="none" strokeDasharray="4 4" />
                    ))}
                    {activePath && (
                        <polyline points={activePath.points.map(p => `${p.x}%,${p.y}%`).join(' ')} stroke="yellow" strokeWidth="2.5" fill="none" />
                    )}
                </svg>
                {play.formationMarkers.map(marker => (
                    <div
                        key={marker.id}
                        onMouseDown={(e) => handleInteractionStart(e, marker.id)}
                        onTouchStart={(e) => handleInteractionStart(e, marker.id)}
                        onClick={() => handleMarkerClick(marker.id)}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${marker.type === 'offense' ? 'bg-blue-500 border-blue-300' : 'bg-red-600 border-red-300'} ${selectedTool === 'move' ? 'cursor-grab' : 'cursor-pointer'}`}
                        style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                    >
                        {marker.label}
                    </div>
                ))}
            </div>
        </div>
    );
};


const PlaybookPage: React.FC = () => {
    const [plays, setPlays] = useState<Play[]>(mockPlays);
    const [selectedPlay, setSelectedPlay] = useState<Play | null>(plays[0] || null);
    
    const createNewPlay = () => {
        const newPlay: Play = {
            id: Date.now(),
            name: 'New Play',
            type: 'Offense',
            subType: '',
            formation: 'Custom',
            description: '',
            formationMarkers: [],
            paths: []
        };
        setPlays(prev => [newPlay, ...prev]);
        setSelectedPlay(newPlay);
    };
    
    const updateSelectedPlay = (updatedPlay: Play | null) => {
        if (!updatedPlay) return;
        setSelectedPlay(updatedPlay);
        setPlays(plays.map(p => p.id === updatedPlay.id ? updatedPlay : p));
    }

    const deletePlay = (id: number) => {
        setPlays(plays.filter(p => p.id !== id));
        if(selectedPlay?.id === id) {
            setSelectedPlay(plays[0] || null);
        }
    }

    return (
        <div className="p-4 sm:p-6 md:p-8 h-full">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                <BookCopy /> Digital Playbook
            </h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100%-80px)]">
                {/* Left Panel: Play List */}
                <div className="lg:col-span-1 bg-slate-800 rounded-xl shadow-lg p-4 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-4 flex-shrink-0">
                        <h2 className="text-xl font-bold">My Plays ({plays.length})</h2>
                        <button onClick={createNewPlay} className="p-2 bg-brand-primary rounded-full hover:bg-brand-dark transition">
                            <PlusCircle size={20} />
                        </button>
                    </div>
                    <div className="space-y-2 overflow-y-auto flex-grow">
                        {plays.map(play => (
                            <div key={play.id} onClick={() => setSelectedPlay(play)} className={`p-3 rounded-lg cursor-pointer border-2 ${selectedPlay?.id === play.id ? 'bg-slate-700/80 border-brand-primary' : 'bg-slate-700/50 border-transparent hover:border-slate-600'}`}>
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold">{play.name}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${play.type === 'Offense' ? 'bg-blue-500/20 text-blue-300' : 'bg-red-500/20 text-red-300'}`}>{play.type}</span>
                                </div>
                                <p className="text-sm text-slate-400 mt-1 truncate">{play.formation} - {play.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel: Editor */}
                <div className="lg:col-span-2 bg-slate-800 rounded-xl shadow-lg p-4 flex flex-col h-full">
                     {selectedPlay ? (
                         <>
                            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                                <input 
                                    type="text" 
                                    value={selectedPlay.name}
                                    onChange={e => updateSelectedPlay({...selectedPlay, name: e.target.value})}
                                    className="text-xl font-bold bg-transparent focus:outline-none focus:bg-slate-700 rounded p-1"
                                />
                                <button onClick={() => deletePlay(selectedPlay.id)} className="p-2 text-slate-400 hover:text-red-500"><Trash2/></button>
                            </div>
                            <textarea
                                value={selectedPlay.description}
                                onChange={e => updateSelectedPlay({...selectedPlay, description: e.target.value})}
                                placeholder="Play description..."
                                rows={2}
                                className="w-full p-2 bg-slate-700 rounded-lg border border-slate-600 resize-none mb-4 flex-shrink-0"
                            />
                            <PlayDiagramEditor play={selectedPlay} setPlay={updateSelectedPlay} />
                         </>
                     ) : (
                         <div className="flex items-center justify-center h-full text-center text-slate-500">
                             Select a play or create a new one to begin.
                         </div>
                     )}
                </div>
            </div>
        </div>
    );
};

export default PlaybookPage;