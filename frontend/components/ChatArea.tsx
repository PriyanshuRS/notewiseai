import { Trash2, Trophy, Plus, Layers, Zap, ArrowRight } from 'lucide-react';
import { Dispatch, SetStateAction, RefObject } from 'react';

interface ChatAreaProps {
  activeChat: any;
  deleteChat: (id: string, e?: React.MouseEvent) => Promise<void>;
  setShowQuizModal: Dispatch<SetStateAction<boolean>>;
  setShowDocCenter: Dispatch<SetStateAction<boolean>>;
  uploadFile: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  isUploading: boolean;
  messages: any[];
  messagesEndRef: RefObject<HTMLDivElement>;
  isSummarizeMode: boolean;
  setIsSummarizeMode: Dispatch<SetStateAction<boolean>>;
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  sendMessage: () => Promise<void>;
}

export function ChatArea({
  activeChat, deleteChat, setShowQuizModal, setShowDocCenter,
  uploadFile, isUploading, messages, messagesEndRef,
  isSummarizeMode, setIsSummarizeMode, query, setQuery, sendMessage
}: ChatAreaProps) {
  return (
    <div className="flex flex-col h-full w-full max-w-[1000px] mx-auto bg-black relative">
      {/* Chat Header */}
      <div className="absolute top-0 inset-x-0 h-20 px-8 border-b border-white/[0.04] flex items-center justify-between bg-[#030305]/80 backdrop-blur-xl z-20">
        <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold tracking-tight text-white">{activeChat.title}</h2>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">Active</span>
            <button onClick={(e) => deleteChat(activeChat.id, e)} className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors ml-2" title="Delete Space">
              <Trash2 className="w-4 h-4" />
            </button>
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          <button onClick={() => setShowQuizModal(true)} className="hidden sm:flex items-center gap-2 text-xs font-bold bg-indigo-500 hover:bg-indigo-600 text-white px-3.5 py-1.5 rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all focus:outline-none">
            <Trophy className="w-4 h-4" /> Assessor
          </button>
          <button onClick={() => setShowDocCenter(true)} className="hidden sm:inline-block text-xs text-zinc-500 font-semibold bg-[#121214] hover:bg-[#1a1a1f] border border-white/[0.04] px-3 py-1.5 rounded-lg shadow-inner transition-colors focus:outline-none">
            {activeChat.documents?.length || 0} Docs loaded
          </button>
          <div className="relative group">
            <input type="file" onChange={uploadFile} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept=".pdf,.txt" />
            <button className="flex items-center gap-2 text-sm bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-1.5 rounded-md text-zinc-200 transition pointer-events-none group-hover:bg-white/10">
              {isUploading ? 'Integrating...' : <><Plus className="w-4 h-4" /> Add Doc</>}
            </button>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto pt-24 pb-32 px-6 md:px-10 space-y-8 scroll-smooth relative z-0">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
            <Layers className="w-12 h-12 mb-4 text-zinc-400" />
            <p className="text-lg text-white font-medium mb-2">Space is empty</p>
            <p className="text-sm text-zinc-400">Upload a pdf or txt and start asking questions.</p>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`flex max-w-[85%] ${m.sender === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}>
              <div className={`text-base leading-relaxed px-6 py-4 rounded-2xl ${m.sender === 'user'
                ? 'bg-[#1e1e1e] text-zinc-200 border border-white/5'
                : 'bg-transparent text-zinc-300'
                }`}>
                {m.content}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-6 shrink-0 bg-black">
        <div className={`relative flex items-center bg-[#111] border ${isSummarizeMode ? 'border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.15)]' : 'border-white/10'} rounded-xl shadow-lg transition-colors focus-within:border-white/20`}>
          <button 
            onClick={() => setIsSummarizeMode(!isSummarizeMode)}
            className={`absolute left-3 p-2 rounded-lg transition-all ${isSummarizeMode ? 'bg-indigo-500/20 text-indigo-400' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
            title="Toggle Summarize Mode"
          >
            <Zap className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => {
              if (e.key === 'Enter') {
                sendMessage();
              }
            }}
            placeholder={isSummarizeMode ? "Type a topic to generate a summary..." : "Message your models..."}
            className="w-full bg-transparent pl-14 pr-14 py-4 text-base text-zinc-200 placeholder-zinc-500 focus:outline-none"
          />
          <button onClick={sendMessage} className={`absolute right-3 p-2 transition rounded-lg ${isSummarizeMode ? 'bg-indigo-500 text-white hover:bg-indigo-600' : 'bg-white text-black hover:bg-zinc-200'}`}>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
