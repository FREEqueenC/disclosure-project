import React, { useState } from 'react';
import { X, LayoutGrid, Search } from 'lucide-react';
import geniusesData from '../data/72_geniuses.json';
import CymaticSigil from './CymaticSigil';

export interface Genius {
    id: number;
    name: string;
    hebrew: string;
    attribute?: string;
}

interface ShemhamforashRegistryProps {
    isOpen: boolean;
    onClose: () => void;
}

const ShemhamforashRegistry: React.FC<ShemhamforashRegistryProps> = ({ isOpen, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');

    if (!isOpen) return null;

    const filteredGeniuses = geniusesData.filter(g => 
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        g.hebrew.includes(searchQuery)
    ) as Genius[];

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, genius: Genius) => {
        // We set the drag data so the drop zone in AethericHub can pick it up
        e.dataTransfer.setData('application/json', JSON.stringify(genius));
        e.dataTransfer.effectAllowed = 'copy';
    };

    return (
        <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-black/95 border-l border-zinc-800 backdrop-blur-2xl z-[70] flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.8)] transition-transform duration-300">
            {/* Header */}
            <header className="p-6 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-900/40">
                <div className="flex items-center gap-3">
                    <LayoutGrid className="w-5 h-5 text-purple-400" />
                    <div>
                        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-200">Shemhamforash Registry</h2>
                        <div className="text-[9px] font-mono text-zinc-500 uppercase">72 Harmonic Modes Available</div>
                    </div>
                </div>
                <button 
                    onClick={onClose}
                    className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white"
                >
                    <X className="w-4 h-4" />
                </button>
            </header>

            {/* Search */}
            <div className="p-4 border-b border-zinc-800/50 bg-black/50">
                <div className="relative">
                    <Search className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input 
                        type="text" 
                        placeholder="SEARCH CIPHER OR RESONANCE..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-sm py-2 pl-8 pr-4 text-[10px] font-mono text-zinc-300 placeholder-zinc-700 outline-none focus:border-purple-500/50 transition-colors uppercase"
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-grow overflow-y-auto custom-scrollbar p-4 space-y-3">
                <div className="text-[8px] font-mono text-emerald-500/60 uppercase tracking-widest text-center mb-4 pb-2 border-b border-emerald-900/30">
                    // DRAG A SIGIL ONTO THE AETHERIC HUB TO INITIATE 3D MANIFESTATION //
                </div>

                {filteredGeniuses.map((genius) => (
                    <div 
                        key={genius.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, genius)}
                        className="bg-zinc-900/30 border border-zinc-800 p-3 flex items-center gap-4 hover:border-purple-500/50 hover:bg-purple-900/10 transition-all cursor-grab active:cursor-grabbing group rounded-md"
                        title={`Drag ${genius.name} to the Hub`}
                    >
                        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-black rounded-full border border-zinc-800 group-hover:border-purple-500/30">
                            {/* Render a tiny 2D representation */}
                            <CymaticSigil name={genius.name} hebrew={genius.hebrew} size={40} color="rgba(168, 85, 247, 0.4)" />
                        </div>
                        <div className="flex-grow flex flex-col justify-center">
                            <div className="flex justify-between items-baseline">
                                <span className="text-xs font-bold text-zinc-200 group-hover:text-purple-300 transition-colors uppercase tracking-widest">{genius.name}</span>
                                <span className="text-[10px] text-zinc-600 font-sans">{genius.hebrew}</span>
                            </div>
                            <div className="text-[8px] font-mono text-zinc-500 mt-1 uppercase">
                                ID_{genius.id.toString().padStart(2, '0')} 
                                {genius.attribute && <span className="text-emerald-500/70 ml-2">// {genius.attribute.split('(')[0].trim()}</span>}
                            </div>
                        </div>
                    </div>
                ))}

                {filteredGeniuses.length === 0 && (
                    <div className="text-center text-[10px] font-mono text-zinc-600 p-8 uppercase">
                        No resonances found matching cipher.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShemhamforashRegistry;
