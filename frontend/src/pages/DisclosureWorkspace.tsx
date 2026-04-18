import React, { useState, useRef } from 'react';
import { MessageSquare, FileText, ShieldAlert, Database, Upload, Send, Radio, ChevronRight } from 'lucide-react';
import { Login } from '../components/Login';

const CATEGORIES = [
  { id: 'uap', label: 'UAP / NHI Encounters', icon: <Radio className="w-4 h-4" /> },
  { id: 'tech', label: 'Advanced Physics & Tech', icon: <Database className="w-4 h-4" /> },
  { id: 'whistleblowers', label: 'Whistleblower Testimonies', icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'documents', label: 'Declassified Documents', icon: <FileText className="w-4 h-4" /> },
  { id: 'disinfo', label: 'False Narratives & Disinfo', icon: <ShieldAlert className="w-4 h-4" /> },
];

const DisclosureWorkspace: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string}[]>([
    { role: 'ai', content: 'System initialized. Ready for file analysis and narrative dissemination. Select a category and upload documents or ask a question.' }
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!chatInput.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: chatInput }]);
    setChatInput('');
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', content: `Analyzing input against the "${CATEGORIES.find(c => c.id === activeCategory)?.label}" database. Cross-referencing known disclosure narratives and identifying patterns...` }]);
    }, 1000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMessages(prev => [...prev, { role: 'user', content: `[Uploaded File: ${file.name}]` }]);
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'ai', content: `File "${file.name}" received. Initiating deep analysis, extracting entities, and comparing against verified intelligence...` }]);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-zinc-800 bg-black/90 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold tracking-widest text-white">
            DISCLOSURE <span className="text-emerald-500 font-light">//</span> WORKSPACE
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Login />
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-zinc-800 bg-[#0a0a0a] flex flex-col shrink-0">
          <div className="p-4 border-b border-zinc-800/50">
            <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Intelligence Categories</h2>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${activeCategory === cat.id ? 'bg-emerald-900/20 text-emerald-400 border-r-2 border-emerald-500' : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200'}`}
              >
                {cat.icon}
                <span className="truncate">{cat.label}</span>
              </button>
            ))}
          </div>
          <div className="p-4 border-t border-zinc-800/50">
            <div className="bg-zinc-900/50 rounded p-3 text-xs text-zinc-500 font-mono">
              Database Sync: <span className="text-emerald-400">ONLINE</span>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 flex flex-col bg-[#050505] relative">
          {/* Active Category Header */}
          <div className="h-12 border-b border-zinc-800/50 flex items-center px-6 shrink-0 bg-black/40">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
               <Database className="w-4 h-4" />
               <ChevronRight className="w-4 h-4 text-zinc-600" />
               <span className="text-emerald-400 font-medium">
                 {CATEGORIES.find(c => c.id === activeCategory)?.label}
               </span>
            </div>
          </div>

          {/* Chat / Analysis Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-5 py-4 ${msg.role === 'user' ? 'bg-emerald-900/20 border border-emerald-500/30 text-emerald-100' : 'bg-zinc-900/50 border border-zinc-800 text-zinc-300'}`}>
                  <div className="text-[10px] uppercase tracking-widest opacity-50 mb-2 font-mono">
                    {msg.role === 'user' ? 'Analyst' : 'AI Auditor'}
                  </div>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-zinc-800 bg-[#0a0a0a]">
            <div className="flex items-center gap-4 bg-black border border-zinc-800 rounded-xl p-2 focus-within:border-emerald-500/50 transition-colors">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-zinc-500 hover:text-emerald-400 transition-colors bg-zinc-900/50 rounded-lg"
                title="Upload Document for Analysis"
              >
                <Upload className="w-5 h-5" />
              </button>
              <input 
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask a question or request analysis on this topic..."
                className="flex-1 bg-transparent border-none outline-none text-zinc-200 placeholder:text-zinc-600 text-sm px-2"
              />
              <button 
                onClick={handleSend}
                className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center justify-center"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DisclosureWorkspace;