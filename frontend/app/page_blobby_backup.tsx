'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, BrainCircuit, LineChart, FileText,
  Plus, Send, ArrowRight, Sparkles, LogIn, UserPlus, FileBox, LayoutDashboard, Brain, Activity, Clock
} from 'lucide-react';

const API = 'http://127.0.0.1:8000/api';

export default function NoteWiseApp() {
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');
  const [authModal, setAuthModal] = useState<'login' | 'register' | null>(null);
  
  // Auth State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [user, setUser] = useState<any>(null);

  // App State
  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auth Handlers
  const handleRegister = async () => {
    try {
      const res = await fetch(`${API}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      if (res.ok) {
        setAuthModal('login');
        setPassword('');
      } else alert('Registration failed.');
    } catch {}
  };

  const handleLogin = async () => {
    try {
      const res = await fetch(`${API}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.access);
        setAuthModal(null);
        setView('dashboard');
        fetchChats(data.access);
      } else alert('Login failed.');
    } catch {}
  };

  // Chat Handlers
  const fetchChats = async (t: string) => {
    const res = await fetch(`${API}/chats/`, { headers: { Authorization: `Bearer ${t}` } });
    const data = await res.json();
    if (Array.isArray(data)) {
        setChats(data);
        if(data.length > 0 && !activeChat) {
            setActiveChat(data[0]);
            setMessages(data[0].messages || []);
        }
    }
  };

  const createChat = async () => {
    const res = await fetch(`${API}/chats/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'New Study Session' })
    });
    if (res.ok) {
      const chat = await res.json();
      setActiveChat(chat);
      setMessages([]);
      fetchChats(token);
    }
  };

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile || !activeChat) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    const res = await fetch(`${API}/chats/${activeChat.id}/documents/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    
    setIsUploading(false);
    if (res.ok) fetchChats(token); // Refresh chat docs
  };

  const sendMessage = async () => {
    if (!query || !activeChat) return;
    const userMsgTemplate = { sender: 'user', content: query };
    setMessages(prev => [...prev, userMsgTemplate]);
    setQuery('');

    const res = await fetch(`${API}/chats/${activeChat.id}/messages/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: query })
    });
    if (res.ok) {
      const data = await res.json();
      setMessages(prev => [...prev.slice(0, -1), data.user_message, data.ai_message]);
    }
  };


  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('landing')}>
            <BrainCircuit className="w-6 h-6 text-indigo-400" />
            <span className="font-semibold tracking-tight text-zinc-100">NoteWiseAI</span>
          </div>

          <div className="flex items-center gap-4">
            {!token ? (
              <>
                <button 
                  onClick={() => setAuthModal('login')}
                  className="text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  Log in
                </button>
                <button 
                  onClick={() => setAuthModal('register')}
                  className="text-sm px-4 py-2 bg-white text-black font-medium rounded-lg hover:bg-zinc-200 transition-colors flex items-center gap-2"
                >
                  Get Started <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button 
                onClick={() => setView('dashboard')}
                className="text-sm flex items-center gap-2 text-zinc-300 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-lg border border-white/10"
              >
                <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      <AnimatePresence>
        {authModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setAuthModal(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0f0f11] border border-white/10 rounded-2xl p-8 w-full max-w-sm relative shadow-2xl shadow-indigo-500/10"
            >
              <h2 className="text-xl font-medium text-white mb-6">
                {authModal === 'login' ? 'Welcome back' : 'Create your account'}
              </h2>
              
              <div className="space-y-4">
                <input 
                  type="text" placeholder="Username" 
                  value={username} onChange={e => setUsername(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                />
                {authModal === 'register' && (
                  <input 
                    type="email" placeholder="Email" 
                    value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 transition-all"
                  />
                )}
                <input 
                  type="password" placeholder="Password" 
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 transition-all"
                />
                <button 
                  onClick={authModal === 'login' ? handleLogin : handleRegister}
                  className="w-full bg-white text-black font-medium rounded-lg px-4 py-3 text-sm hover:bg-zinc-200 transition-colors"
                >
                  {authModal === 'login' ? 'Sign in' : 'Sign up'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      {view === 'landing' ? (
        <main className="max-w-7xl mx-auto px-6 py-20">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-32">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium mb-8">
              <Sparkles className="w-3 h-3" /> NoteWiseAI 1.0 is Live
            </div>
            <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter text-white mb-6 leading-[1.1]">
              Learn faster.<br />
              <span className="text-zinc-500">Understand deeper.</span>
            </h1>
            <p className="text-lg text-zinc-400 mb-10 max-w-xl">
              Turn your textbooks and notes into an interactive intelligence layer. Discover weaknesses, generate targeted flashcards, and master your subjects.
            </p>
            <button 
              onClick={() => setAuthModal('register')}
              className="bg-white text-black px-8 py-4 rounded-xl font-medium flex items-center gap-2 hover:scale-105 transition-transform"
            >
              Start Learning Free <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Bento Grid Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
            {/* Feature 1 */}
            <div className="md:col-span-2 bg-gradient-to-br from-[#121214] to-[#0A0A0A] border border-white/10 rounded-3xl p-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <Brain className="w-8 h-8 text-indigo-400 mb-6" />
              <h3 className="text-2xl font-medium text-white mb-3">Contextual AI Tutor</h3>
              <p className="text-zinc-400 max-w-md">
                Chat directly with your uploaded notes. Our semantic RAG pipeline ensures answers are precise, sourced, and free of hallucination.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-[#121214] to-[#0A0A0A] border border-white/10 rounded-3xl p-8 relative overflow-hidden">
              <Activity className="w-8 h-8 text-emerald-400 mb-6" />
              <h3 className="text-2xl font-medium text-white mb-3">Weakness Detection</h3>
              <p className="text-zinc-400">
                Automated quiz generation dynamically identifies which topics you're failing at.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-[#121214] to-[#0A0A0A] border border-white/10 rounded-3xl p-8 relative overflow-hidden">
              <FileBox className="w-8 h-8 text-blue-400 mb-6" />
              <h3 className="text-2xl font-medium text-white mb-3">Document Hub</h3>
              <p className="text-zinc-400">
                Organize thousands of pages into siloed Chat spaces.
              </p>
            </div>
            {/* Feature 4 */}
            <div className="md:col-span-2 bg-gradient-to-br from-[#121214] to-[#0A0A0A] border border-white/10 rounded-3xl p-8 relative overflow-hidden">
               <Clock className="w-8 h-8 text-rose-400 mb-6" />
               <h3 className="text-2xl font-medium text-white mb-3">Smart Summarization</h3>
               <p className="text-zinc-400 max-w-md">
                 Upload a 500-page textbook and ask for a 2-page summary on a specific topic. Save hours of parsing through fluff.
               </p>
            </div>
          </div>
        </main>
      ) : (
        /* Student Dashboard & Study Interface */
        <div className="max-w-[1600px] mx-auto p-4 md:p-6 h-[calc(100vh-4rem)] flex gap-6">
          
          {/* Sidebar */}
          <div className="w-64 hidden lg:flex flex-col gap-4">
            <div className="bg-[#121214] border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-2">Navigation</h3>
              <button className="flex items-center gap-3 px-3 py-2 bg-white/5 text-white rounded-lg text-sm font-medium">
                <BookOpen className="w-4 h-4" /> Study Sessions
              </button>
              <button className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:bg-white/5 hover:text-white transition-colors rounded-lg text-sm font-medium">
                <LineChart className="w-4 h-4" /> Analytics & Weaknesses
              </button>
              <button className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:bg-white/5 hover:text-white transition-colors rounded-lg text-sm font-medium">
                <FileText className="w-4 h-4" /> Flashcards
              </button>
            </div>

            <div className="bg-[#121214] border border-white/5 rounded-2xl p-4 flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Chats</h3>
                <button onClick={createChat} className="text-zinc-400 hover:text-white"><Plus className="w-4 h-4" /></button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1 pr-2">
                {chats.map(c => (
                  <button 
                    key={c.id} 
                    onClick={() => { setActiveChat(c); setMessages(c.messages || []); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm truncate transition-colors ${activeChat?.id === c.id ? 'bg-indigo-500/10 text-indigo-300' : 'text-zinc-400 hover:bg-white/5'}`}
                  >
                    {c.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Area (AI Chat & Docs) */}
          <div className="flex-1 bg-[#121214] border border-white/5 rounded-2xl overflow-hidden flex flex-col relative">
            {activeChat ? (
              <>
                <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#121214]/80 backdrop-blur-md absolute top-0 w-full z-10">
                  <h2 className="font-medium text-zinc-100">{activeChat.title}</h2>
                  
                  {/* Upload Trigger */}
                  <div className="relative group">
                    <input 
                      type="file" 
                      onChange={uploadFile} 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      title="Upload PDF"
                      accept=".pdf,.txt"
                    />
                    <button className="flex items-center gap-2 text-sm bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg text-zinc-300 transition-colors">
                      {isUploading ? 'Processing...' : <><Plus className="w-4 h-4" /> Add Document</>}
                    </button>
                  </div>
                </div>

                {/* Messages Interface */}
                <div className="flex-1 overflow-y-auto p-6 pt-24 pb-32 space-y-6">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4">
                      <BrainCircuit className="w-12 h-12 opacity-20" />
                      <p>Upload a document and ask a question to begin.</p>
                      {activeChat.documents?.length > 0 && (
                        <div className="flex gap-2 text-xs">
                          Loaded Docs: {activeChat.documents.map((d:any) => <span key={d.id} className="bg-white/5 px-2 py-1 rounded">{d.filename}</span>)}
                        </div>
                      )}
                    </div>
                  ) : (
                    messages.map((m, i) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        key={i} 
                        className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${
                          m.sender === 'user' 
                            ? 'bg-zinc-800 text-zinc-100' 
                            : 'bg-transparent text-zinc-300 border border-white/10'
                        }`}>
                          {m.content}
                        </div>
                      </motion.div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-[#121214] via-[#121214] to-transparent">
                  <div className="max-w-3xl mx-auto relative flex items-center">
                    <input 
                      type="text" 
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendMessage()}
                      placeholder="Ask about your documents or type /summarize..."
                      className="w-full bg-[#1A1A1C] border border-white/10 rounded-xl pl-4 pr-12 py-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 shadow-lg shadow-black/50"
                    />
                    <button 
                      onClick={sendMessage}
                      className="absolute right-3 p-2 text-zinc-400 hover:text-white transition-colors hover:bg-white/5 rounded-lg"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-center mt-2 text-[10px] text-zinc-600">
                    AI can make mistakes. Consider verifying important information.
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-zinc-500">
                Create a chat to start studying.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}