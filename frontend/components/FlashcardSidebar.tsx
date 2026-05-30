import { Layers, Sparkles, ChevronDown, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dispatch, SetStateAction } from 'react';

interface FlashcardSidebarProps {
  flashcardTopic: string;
  setFlashcardTopic: Dispatch<SetStateAction<string>>;
  generateFlashcards: () => Promise<void>;
  isGeneratingFlashcards: boolean;
  dueFlashcards: any[];
  collapsedTopics: Record<string, boolean>;
  setCollapsedTopics: Dispatch<SetStateAction<Record<string, boolean>>>;
  openFlashcardModal: () => void;
}

export function FlashcardSidebar({
  flashcardTopic, setFlashcardTopic, generateFlashcards, isGeneratingFlashcards,
  dueFlashcards, collapsedTopics, setCollapsedTopics, openFlashcardModal
}: FlashcardSidebarProps) {
  return (
    <div className="hidden lg:flex flex-col w-[320px] bg-[#0A0A0A] border-l border-white/5 overflow-hidden">
      <div className="p-5 border-b border-white/5 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
              <Layers className="w-4 h-4 text-orange-400" />
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">Flashcards</h2>
          </div>
          {dueFlashcards.length > 0 && (
            <button onClick={openFlashcardModal} className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-sm flex items-center gap-2" title="Review Cards">
              <Play className="w-3.5 h-3.5" fill="currentColor" />
            </button>
          )}
        </div>
        
        {/* Create New Cards */}
        <div className="flex flex-col gap-2">
          <input
            type="text"
            className="w-full bg-[#121214] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-orange-500/50 transition-all"
            placeholder="Topic to generate..."
            value={flashcardTopic}
            onChange={e => setFlashcardTopic(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                generateFlashcards();
              }
            }}
          />
          <button 
            onClick={generateFlashcards} 
            disabled={isGeneratingFlashcards}
            className="w-full bg-white text-black py-2 rounded-lg text-xs font-bold hover:bg-zinc-200 transition-colors shadow-sm disabled:opacity-50"
          >
            {isGeneratingFlashcards ? 'Synthesizing...' : 'Generate AI Cards'}
          </button>
        </div>
      </div>

      {/* Notes Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {dueFlashcards.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
            <Sparkles className="w-8 h-8 opacity-50 text-zinc-500 mb-3" />
            <h3 className="text-sm font-bold text-white tracking-tight">No notes yet.</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-[200px]">Generate some important points to pin here.</p>
          </div>
        ) : (
          Object.entries(
            dueFlashcards.reduce((acc: any, note: any) => {
              const t = note.topic_tag || 'General';
              if (!acc[t]) acc[t] = [];
              acc[t].push(note);
              return acc;
            }, {})
          ).map(([topic, notes]: [string, any], groupIdx: number) => {
            const isCollapsed = collapsedTopics[topic] || false;
            return (
            <div key={groupIdx} className="mb-6 last:mb-0">
              <div 
                className="flex items-center justify-between mb-3 px-2 cursor-pointer hover:bg-white/5 py-1.5 -mx-2 rounded transition-colors group"
                onClick={() => setCollapsedTopics(prev => ({...prev, [topic]: !isCollapsed}))}
              >
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest group-hover:text-zinc-300 transition-colors">{topic}</h3>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${isCollapsed ? '-rotate-90' : ''}`} />
              </div>
              
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3 overflow-hidden"
                  >
                    {notes.map((note: any, idx: number) => (
                      <div key={idx} className="bg-[#121214] border border-white/10 rounded-xl p-4 shadow-sm hover:border-orange-500/30 transition-colors">
                        <h4 className="text-sm font-bold text-zinc-200 mb-2 leading-snug">{note.front_text}</h4>
                        <p className="text-xs text-zinc-400 leading-relaxed">{note.back_text}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )})
        )}
      </div>
    </div>
  );
}
