import { MessageSquare, BookOpen, Trash2, User } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';

interface DashboardSidebarProps {
  chats: any[];
  activeChat: any;
  view: 'landing' | 'dashboard' | 'chat';
  username: string;
  createChat: () => Promise<void>;
  deleteChat: (id: string, e?: React.MouseEvent) => Promise<void>;
  handleLogout: () => void;
  setActiveChat: Dispatch<SetStateAction<any>>;
  setMessages: Dispatch<SetStateAction<any[]>>;
  setView: Dispatch<SetStateAction<'landing' | 'dashboard' | 'chat'>>;
}

export function DashboardSidebar({
  chats, activeChat, view, username,
  createChat, deleteChat, handleLogout,
  setActiveChat, setMessages, setView
}: DashboardSidebarProps) {
  return (
    <div className="w-[260px] border-r border-white/5 bg-[#0A0A0A] flex flex-col">
      <div className="p-4 border-b border-white/5">
        <button
          onClick={createChat}
          className="w-full bg-white text-black font-medium text-sm py-2 rounded-md hover:bg-zinc-200 transition flex items-center justify-center gap-2"
        >
          <MessageSquare className="w-4 h-4" /> New Session
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
        <div className="text-[11px] font-bold text-zinc-500 tracking-widest uppercase mb-4 ml-2">Active Spaces</div>
        {chats.map(c => (
          <div key={c.id} className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition font-medium flex items-center justify-between group ${view === 'chat' && activeChat?.id === c.id ? 'bg-white/[0.06] border border-white/[0.08] text-white shadow-[0_0_15px_rgba(255,255,255,0.02)]' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]'}`}>
            <button
              onClick={() => { setActiveChat(c); setMessages(c.messages || []); setView('chat'); }}
              className="flex items-center gap-3 flex-1 truncate text-left focus:outline-none"
            >
              <BookOpen className={`w-4 h-4 shrink-0 ${view === 'chat' && activeChat?.id === c.id ? 'text-indigo-400' : 'opacity-50'}`} />
              <span className="truncate">{c.title}</span>
            </button>
            <button onClick={(e) => deleteChat(c.id, e)} className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-all shrink-0 ml-2">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Nav Footer */}
      <div className="p-3 border-t border-white/5 mt-auto bg-[#0A0A0A]">
        <div onClick={handleLogout} className="w-full flex items-center justify-between px-2 py-2 hover:bg-rose-500/10 rounded-md cursor-pointer group transition">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 group-hover:border-rose-500/30">
              <User className="w-4 h-4 text-zinc-400 group-hover:text-rose-400" />
            </div>
            <span className="text-sm font-medium text-white tracking-tight group-hover:text-rose-400">{username || 'Priyanshu'}</span>
          </div>
          <div className="text-[10px] text-zinc-500 font-bold uppercase group-hover:text-rose-400">Logout</div>
        </div>
      </div>
    </div>
  );
}
