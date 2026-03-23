'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BrainCircuit, LayoutDashboard, Plus, Send, FileText, MessageSquare, BookOpen, Layers,
  ArrowRight, Search, Activity, Zap, Shield, File, ChevronUp, ChevronDown, User, Sparkles, X, Trash2, Trophy
} from 'lucide-react';

const API = 'http://127.0.0.1:8000/api';

export default function App() {
  const [view, setView] = useState<'landing' | 'dashboard' | 'chat'>('landing');
  const [authModal, setAuthModal] = useState<'login' | 'register' | null>(null);

  // Auth State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');

  // App State
  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showDocCenter, setShowDocCenter] = useState(false);
  const [isSummarizeMode, setIsSummarizeMode] = useState(false);
  
  // Quiz State
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizTopic, setQuizTopic] = useState('');
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizData, setQuizData] = useState<any>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<any>(null);

  // Flashcard State
  const [showFlashcardModal, setShowFlashcardModal] = useState(false);
  const [flashcardTopic, setFlashcardTopic] = useState('');
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [dueFlashcards, setDueFlashcards] = useState<any[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [collapsedTopics, setCollapsedTopics] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => scrollToBottom(), [messages]);

  // Session Persistance
  useEffect(() => {
    const savedToken = localStorage.getItem('nw_token');
    const savedUser = localStorage.getItem('nw_user');
    if (savedToken) {
      setToken(savedToken);
      if (savedUser) setUsername(savedUser);
      setView('dashboard');
      fetchChats(savedToken);
    }
  }, []);

  // Auth Handlers
  const handleAuth = async (isLogin: boolean) => {
    const endpoint = isLogin ? '/auth/login/' : '/auth/register/';
    const body = isLogin ? { username, password } : { username, email, password };
    try {
      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        if (isLogin) {
          const data = await res.json();
          setToken(data.access);
          localStorage.setItem('nw_token', data.access);
          localStorage.setItem('nw_user', username);
          setAuthModal(null);
          setView('dashboard');
          fetchChats(data.access);
        } else {
          alert('Registered successfully! Please login.');
          setAuthModal('login');
        }
      } else {
        alert(isLogin ? 'Login failed.' : 'Registration failed.');
      }
    } catch { }
  };

  const handleLogout = () => {
    localStorage.removeItem('nw_token');
    localStorage.removeItem('nw_user');
    setToken('');
    setView('landing');
    setChats([]);
    setActiveChat(null);
  };

  const fetchChats = async (t: string) => {
    const res = await fetch(`${API}/chats/`, { headers: { Authorization: `Bearer ${t}` } });
    const data = await res.json();
    if (Array.isArray(data)) setChats(data);
  };

  const createChat = async () => {
    const res = await fetch(`${API}/chats/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'New Study Session' })
    });
    if (res.ok) {
      fetchChats(token);
    }
  };

  const deleteChat = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm('Are you sure you want to delete this space and all its configured documents permanently?')) return;
    try {
      const res = await fetch(`${API}/chats/${id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        if (activeChat?.id === id) {
          setActiveChat(null);
          setView('dashboard');
        }
        fetchChats(token);
      }
    } catch {}
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
    if (res.ok) {
      const newDoc = await res.json();
      setActiveChat((prev: any) => ({
        ...prev,
        documents: [...(prev.documents || []), newDoc]
      }));
    }
    setIsUploading(false);
    fetchChats(token);
  };

  const deleteDocument = async (docId: string) => {
    if (!activeChat) return;
    if (!confirm('Are you sure you want to delete this document? All associated vectors and summaries will be wiped.')) return;
    try {
      const res = await fetch(`${API}/chats/${activeChat.id}/documents/${docId}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setActiveChat((prev: any) => ({
          ...prev,
          documents: prev.documents.filter((d: any) => d.id !== docId)
        }));
        fetchChats(token);
      }
    } catch { }
  };

  const sendMessage = async () => {
    if (!query || !activeChat) return;
    const userMsgTemplate = { sender: 'user', content: query };
    setMessages(prev => [...prev, userMsgTemplate]);
    const currentQuery = query;
    setQuery('');

    if (isSummarizeMode) {
      const res = await fetch(`${API}/chats/${activeChat.id}/summarize/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: currentQuery })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { sender: 'ai', content: `**Summary of ${currentQuery}**:\n${data.summary}` }]);
      }
    } else {
      const res = await fetch(`${API}/chats/${activeChat.id}/messages/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: currentQuery })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev.slice(0, -1), data.user_message, data.ai_message]);
      }
    }
  };

  // Quiz Handlers
  const generateQuiz = async () => {
    if (!quizTopic || !activeChat) return;
    setIsGeneratingQuiz(true);
    setQuizData(null);
    setQuizResult(null);
    setQuizAnswers({});

    try {
      const res = await fetch(`${API}/quizzes/generate/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: activeChat.id, topic: quizTopic })
      });
      if (res.ok) {
        const data = await res.json();
        setQuizData(data);
      } else {
        alert('Failed to generate quiz. Insufficient document context.');
      }
    } catch { }
    setIsGeneratingQuiz(false);
  };

  const submitQuiz = async () => {
    if (!quizData) return;
    try {
      const res = await fetch(`${API}/quizzes/${quizData.id}/submit/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: quizAnswers })
      });
      if (res.ok) {
        const data = await res.json();
        setQuizResult(data);
      }
    } catch { }
  };

  // Flashcard Handlers
  const fetchDueFlashcards = async () => {
    try {
      const res = await fetch(`${API}/study/flashcards/`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        setDueFlashcards(await res.json());
      }
    } catch {}
  };

  useEffect(() => {
    if (token && view === 'chat') {
      fetchDueFlashcards();
    }
  }, [token, view]);

  const generateFlashcards = async () => {
    if (!flashcardTopic || !activeChat) return;
    setIsGeneratingFlashcards(true);
    try {
      const res = await fetch(`${API}/study/flashcards/generate/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: activeChat.id, topic: flashcardTopic })
      });
      if (res.ok) {
        setFlashcardTopic('');
        setCurrentCardIndex(0);
        setIsFlipped(false);
        fetchDueFlashcards();
      } else {
        alert('Failed to generate flashcards. Make sure the topic is detailed in the documents.');
      }
    } catch {}
    setIsGeneratingFlashcards(false);
  };

  const reviewFlashcard = async (difficulty: 'easy' | 'medium' | 'hard') => {
    const card = dueFlashcards[currentCardIndex];
    if (!card) return;
    try {
      await fetch(`${API}/study/flashcards/${card.id}/review/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty })
      });
      setIsFlipped(false);
      setCurrentCardIndex(prev => prev + 1);
    } catch {}
  };

  const openFlashcardModal = () => {
    setShowFlashcardModal(true);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    fetchDueFlashcards();
  };

  return (
    <div className="min-h-screen bg-black text-[#f4f4f5] font-sans selection:bg-white/20 overflow-x-hidden">

      {/* Navbar Minimal */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => token ? setView('dashboard') : setView('landing')}>
            <BrainCircuit className="w-5 h-5 text-white" />
            <span className="text-sm font-semibold tracking-tight text-white">NoteWise</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-[#a1a1aa]">
              <span className="hover:text-white cursor-pointer transition">Features</span>
              <span className="hover:text-white cursor-pointer transition">Method</span>
              <span className="hover:text-white cursor-pointer transition">Customers</span>
              <span className="hover:text-white cursor-pointer transition">Changelog</span>
              <span className="hover:text-white cursor-pointer transition">Pricing</span>
            </div>
            <div className="flex items-center gap-4">
              {!token ? (
                <>
                  <button onClick={() => setAuthModal('login')} className="text-sm font-medium text-[#a1a1aa] hover:text-white transition">Log in</button>
                  <button onClick={() => setAuthModal('register')} className="text-sm font-medium px-4 py-1.5 bg-white text-black rounded-full hover:bg-zinc-200 transition">Sign up</button>
                </>
              ) : (
                <button onClick={() => setView('dashboard')} className="text-sm font-medium px-4 py-1.5 bg-white text-black rounded-full hover:bg-zinc-200 transition">Dashboard</button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Auth Modal Minimal */}
      <AnimatePresence>
        {authModal && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setAuthModal(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 10 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#111] border border-white/10 rounded-2xl p-8 w-full max-w-sm shadow-2xl"
            >
              <h2 className="text-xl font-medium text-white mb-6 text-center tracking-tight">{authModal === 'login' ? 'Log in to NoteWise' : 'Create NoteWise account'}</h2>
              <div className="space-y-4">
                <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition" />
                {authModal === 'register' && (
                  <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition" />
                )}
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition" />
                <button onClick={() => handleAuth(authModal === 'login')} className="w-full bg-white text-black font-medium rounded-lg py-3 hover:bg-zinc-200 transition">
                  {authModal === 'login' ? 'Continue' : 'Sign up'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Document Center Modal */}
      <AnimatePresence>
        {showDocCenter && activeChat && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setShowDocCenter(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 10 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#09090b] border border-white/[0.08] rounded-3xl p-8 w-full max-w-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white tracking-tight">Document Center</h2>
                <button onClick={() => setShowDocCenter(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-zinc-400 mb-6 font-medium">Manage documents explicitly added to this space.</p>

              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {activeChat.documents && activeChat.documents.length > 0 ? (
                  activeChat.documents.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 rounded-xl bg-[#121214] border border-white/[0.04]">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                          <FileText className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-zinc-200">{doc.filename}</div>
                          <div className="text-xs text-zinc-500 font-medium mt-0.5">{doc.pages} pages • {doc.chunks} vectors extracted</div>
                        </div>
                      </div>
                      <button onClick={() => deleteDocument(doc.id)} className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 opacity-80 border border-dashed border-white/[0.05] rounded-2xl bg-[#030305]/50">
                    <p className="text-zinc-500 font-medium">No documents uploaded to this space yet.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quiz Modal */}
      <AnimatePresence>
        {showQuizModal && activeChat && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setShowQuizModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 10 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#09090b] border border-white/[0.08] rounded-3xl p-8 w-full max-w-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between mb-6 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                    <Trophy className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-tight">{quizData ? quizData.title : 'AI Assessor'}</h2>
                </div>
                <button onClick={() => setShowQuizModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 pb-4">
                {!quizData && !isGeneratingQuiz && (
                  <div className="space-y-4 pt-4">
                    <p className="text-sm text-zinc-400 font-medium">What topic would you like to be tested on? (Based on loaded documents)</p>
                    <input
                      type="text"
                      className="w-full bg-[#121214] border border-white/10 rounded-xl px-4 py-3 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:shadow-[0_0_15px_rgba(99,102,241,0.1)] transition-all"
                      placeholder="e.g. Quantum Entanglement..."
                      value={quizTopic}
                      onChange={e => setQuizTopic(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && generateQuiz()}
                    />
                    <button onClick={generateQuiz} className="w-full bg-white text-black py-3 rounded-xl font-bold hover:bg-zinc-200 transition-colors mt-2 text-sm shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                      Generate Quiz
                    </button>
                  </div>
                )}

                {isGeneratingQuiz && (
                  <div className="flex flex-col items-center justify-center py-16 space-y-6">
                    <div className="w-12 h-12 rounded-full border-t-2 border-indigo-500 animate-spin"></div>
                    <p className="text-zinc-400 font-medium animate-pulse text-sm">Synthesizing context and drafting questions...</p>
                  </div>
                )}

                {quizData && !quizResult && (
                  <div className="space-y-8">
                    {quizData.questions.map((q: any, i: number) => (
                      <div key={q.id} className="space-y-4">
                        <h3 className="text-sm shadow-inner font-semibold text-zinc-200 bg-[#121214] border border-white/[0.04] p-4 rounded-xl leading-relaxed">
                          <span className="text-indigo-400 mr-2">{i + 1}.</span> {q.question_text}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {q.options && q.options.length > 0 ? q.options.map((opt: string, optIdx: number) => (
                            <button
                              key={optIdx}
                              onClick={() => setQuizAnswers({ ...quizAnswers, [q.id]: opt })}
                              className={`text-left p-4 rounded-xl border text-sm font-medium transition-all ${quizAnswers[q.id] === opt ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.15)]' : 'bg-[#09090b] border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200'}`}
                            >
                              <span className="opacity-50 mr-2">{String.fromCharCode(65 + optIdx)}.</span> {opt}
                            </button>
                          )) : (
                            <p className="text-rose-400 text-xs col-span-2">Warning: AI failed to generate structured options.</p>
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="pt-4 border-t border-white/10">
                      <button onClick={submitQuiz} className="w-full bg-indigo-500 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-600 transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                        Submit & Evaluate
                      </button>
                    </div>
                  </div>
                )}

                {quizResult && (
                  <div className="py-8 flex flex-col items-center text-center space-y-6">
                    <div className="relative w-32 h-32 flex items-center justify-center rounded-full bg-[#121214] border-4 border-[#121214] shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle cx="64" cy="64" r="60" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                        <motion.circle cx="64" cy="64" r="60" fill="transparent" stroke={quizResult.score > 70 ? "#10b981" : quizResult.score > 40 ? "#f59e0b" : "#f43f5e"} strokeWidth="8" strokeDasharray={377} initial={{ strokeDashoffset: 377 }} animate={{ strokeDashoffset: 377 - (377 * quizResult.score) / 100 }} transition={{ duration: 1, delay: 0.2, ease: "easeOut" }} className="drop-shadow-[0_0_8px_currentColor]" />
                      </svg>
                      <div className="text-4xl font-black text-white">{quizResult.score}<span className="text-xl text-zinc-500">%</span></div>
                    </div>
                    <div>
                       <h3 className="text-2xl font-bold tracking-tight text-white mb-2">
                         {quizResult.score > 80 ? 'Exceptional Work!' : quizResult.score > 50 ? 'Good Effort!' : 'Needs Review.'}
                       </h3>
                       <p className="text-zinc-400 font-medium">You got {quizResult.correct_count} out of {quizResult.total} questions right.</p>
                    </div>
                    <div className="pt-8 flex gap-4 w-full">
                      <button onClick={() => setShowQuizModal(false)} className="flex-1 bg-[#121214] hover:bg-[#1a1a1f] border border-white/10 text-white font-semibold py-3 rounded-xl transition-all">Close</button>
                      <button onClick={() => {setQuizData(null); setQuizResult(null); setQuizTopic('');}} className="flex-1 bg-white text-black font-bold py-3 rounded-xl hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">Try Another Topic</button>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>



      {view === 'landing' ? (
        <div className="pt-32 pb-20 relative">

          {/* Abstract Symmetrical-Asymmetrical Tech Grid */}
          <div className="absolute top-0 inset-x-0 h-[100vh] pointer-events-none z-0 overflow-hidden"
            style={{ maskImage: 'linear-gradient(to bottom, black 20%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 20%, transparent 100%)' }}>
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <g stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none">
                {/* Diagonal Network */}
                <line x1="15%" y1="-10%" x2="45%" y2="110%" />
                <line x1="85%" y1="-10%" x2="55%" y2="110%" />
                <line x1="-10%" y1="20%" x2="110%" y2="60%" />
                <line x1="-10%" y1="70%" x2="110%" y2="30%" />
                <line x1="-10%" y1="90%" x2="110%" y2="90%" strokeDasharray="4 4" />

                {/* Structural Orbits */}
                <ellipse cx="50%" cy="30%" rx="800" ry="300" strokeWidth="0.5" className="opacity-50" />
                <ellipse cx="50%" cy="30%" rx="600" ry="200" strokeWidth="0.5" strokeDasharray="10 10" className="opacity-30" />

                {/* Asymmetrical Intersecting Curves */}
                <path d="M-200,800 C400,200 800,800 1920,0" strokeWidth="0.5" className="opacity-40" />
                <path d="M-200,100 C600,600 1200,100 1920,800" strokeWidth="0.5" />

                {/* Node Intersections */}
                <circle cx="35%" cy="35%" r="2" fill="white" className="opacity-50" />
                <circle cx="65%" cy="35%" r="2" fill="white" className="opacity-50" />
                <circle cx="50%" cy="40%" r="3" fill="none" stroke="white" className="opacity-50" />
              </g>
            </svg>
          </div>

          {/* Hero Section */}
          <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 max-w-[1000px] mx-auto mb-32">
            <h1 className="text-5xl md:text-7xl lg:text-[80px] font-medium tracking-tighter text-white mb-8 leading-[1]">
              The intelligence system for learners and thinkers.
            </h1>
            <p className="text-xl md:text-2xl text-[#a1a1aa] mb-10 max-w-3xl tracking-tight leading-snug">
              NoteWise is a purpose-built workspace for your documents. Chat with textbooks, uncover weaknesses, and map your knowledge automatically.
            </p>
            <div className="flex items-center gap-6">
              <button onClick={() => setAuthModal('register')} className="bg-white text-black px-6 py-3 rounded-full text-base font-medium hover:scale-105 transition flex items-center gap-2">
                Get started <ArrowRight className="w-4 h-4" />
              </button>
              <button className="text-[#a1a1aa] px-6 py-3 rounded-full border border-white/10 text-base font-medium hover:text-white hover:bg-white/5 transition">
                Introducing AI Quizzes
              </button>
            </div>
          </section>

          {/* Hero App Mockup */}
          <div className="max-w-[1200px] mx-auto px-6 mb-32 relative">
            {/* Solid Accent Glow */}
            <div className="absolute inset-0 top-1/2 bg-rose-500/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="relative w-full aspect-video bg-[#0A0A0A] border border-white/[0.08] rounded-xl overflow-hidden shadow-[0_0_60px_rgba(225,29,72,0.05)] flex flex-col">
              {/* Mockup Header */}
              <div className="h-12 border-b border-white/[0.08] flex items-center px-4 gap-4 bg-[#111]">
                <div className="flex gap-1.5 pl-2">
                  <div className="w-3 h-3 rounded-full bg-zinc-700" />
                  <div className="w-3 h-3 rounded-full bg-zinc-700" />
                  <div className="w-3 h-3 rounded-full bg-zinc-700" />
                </div>
                <div className="flex-1 max-w-md mx-auto bg-black border border-white/10 rounded flex items-center px-3 py-1.5 text-xs text-zinc-500 gap-2">
                  <Search className="w-3 h-3" /> search your notes...
                </div>
              </div>
              {/* Mockup Body with Abstract Node Network Instead of Image */}
              <div className="flex-1 flex bg-[#0e0e11] relative overflow-hidden">
                {/* Abstract Mockup Background lines */}
                <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  <g stroke="white" strokeWidth="0.5">
                    <line x1="30%" y1="-10%" x2="30%" y2="110%" className="opacity-30 stroke-dasharray-[4_4]" />
                    <line x1="70%" y1="-10%" x2="70%" y2="110%" className="opacity-30 stroke-dasharray-[4_4]" />
                    <line x1="-10%" y1="50%" x2="110%" y2="50%" className="opacity-30 stroke-dasharray-[4_4]" />
                  </g>
                </svg>
                {/* Sidebar */}
                <div className="hidden md:flex flex-col w-[240px] border-r border-white/5 bg-[#0A0A0A] shrink-0">
                  <div className="p-4 border-b border-white/5">
                    <div className="w-full bg-white text-black font-medium text-xs md:text-sm py-2 rounded-md flex items-center justify-center gap-2">
                      <MessageSquare className="w-3 h-3 md:w-4 md:h-4" /> New Session
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-1">
                    <div className="text-[10px] md:text-[11px] font-semibold text-zinc-500 tracking-wider uppercase mb-3 ml-2 mt-2">Active Spaces</div>
                    <div className="w-full text-left px-3 py-2 rounded text-xs md:text-sm bg-[#1A1A1A] text-white">Physics 101</div>
                    <div className="w-full text-left px-3 py-2 rounded text-xs md:text-sm text-zinc-400">Macroeconomics</div>
                    <div className="w-full text-left px-3 py-2 rounded text-xs md:text-sm text-zinc-400">Computer Science</div>
                  </div>
                  {/* Account Footer Mockup */}
                  <div className="p-3 border-t border-white/5 mt-auto">
                    <div className="w-full flex items-center justify-between px-2 py-2 hover:bg-white/5 rounded-md cursor-pointer transition">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                          <User className="w-3 h-3 text-zinc-400" />
                        </div>
                        <span className="text-xs md:text-sm font-medium text-white tracking-tight">Priyanshu</span>
                      </div>
                      <ChevronUp className="w-3 h-3 text-zinc-500" />
                    </div>
                  </div>
                </div>
                {/* Main Content */}
                <div className="flex-1 flex flex-col bg-black relative">
                  {/* Chat Header */}
                  <div className="h-14 md:h-16 px-4 md:px-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-black/80 backdrop-blur z-10">
                    <h2 className="text-sm md:text-lg font-medium tracking-tight text-white">Physics 101</h2>
                    <div className="hidden sm:flex items-center gap-4">
                      <span className="text-[10px] md:text-xs text-zinc-500 font-medium">3 Docs explicitly loaded</span>
                      <div className="flex items-center gap-2 text-xs md:text-sm bg-white/5 border border-white/10 px-3 py-1.5 rounded-md text-zinc-200">
                        <Plus className="w-3 h-3 md:w-4 md:h-4" /> Add Doc
                      </div>
                    </div>
                  </div>
                  {/* Chat Messages */}
                  <div className="flex-1 p-4 md:p-8 flex flex-col justify-end space-y-4 md:space-y-6">
                    <div className="flex max-w-[85%] ml-auto justify-end">
                      <div className="text-xs md:text-sm leading-relaxed px-4 py-3 md:px-5 md:py-4 rounded-2xl bg-[#1e1e1e] text-zinc-200 border border-white/5 shadow-sm">
                        Can you explain quantum entanglement based on chapter 4?
                      </div>
                    </div>
                    <div className="flex max-w-[85%] mr-auto justify-start">
                      <div className="text-xs md:text-sm leading-relaxed px-4 py-3 md:px-5 md:py-4 rounded-2xl bg-transparent text-zinc-300">
                        Absolutely. According to chapter 4, quantum entanglement is a phenomenon where particles become interacting in ways such that the quantum state of each particle cannot be described independently of the state of the others, even when the particles are separated by a large distance... <span className="text-rose-400 hover:underline cursor-pointer">[Sourced from physics_chapter4.pdf]</span>
                      </div>
                    </div>
                  </div>
                  {/* Input Bar */}
                  <div className="p-4 md:p-6 shrink-0 bg-black">
                    <div className="relative flex items-center bg-[#111] border border-white/10 rounded-xl shadow-lg">
                      <div className="w-full bg-transparent pl-4 pr-12 py-3 md:py-4 text-xs md:text-sm text-zinc-500">
                        Message your models or type /summarize...
                      </div>
                      <div className="absolute right-2 md:right-3 p-1.5 md:p-2 bg-white text-black rounded-lg">
                        <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Wireframe Cards */}
          <section className="px-6 py-20 max-w-[1200px] mx-auto border-t border-white/[0.08]">
            <div className="mb-16 max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-medium tracking-tight mb-6 text-white leading-tight">A new approach to study tools.</h2>
              <p className="text-[#a1a1aa] text-lg md:text-xl leading-relaxed">Purpose-built for modern students with UI, AI, and connected workflows that make mastering subjects effortless and fast.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group border border-white/5 bg-[#0e0e11] p-8 rounded-xl relative flex flex-col items-start transition-colors duration-300 hover:border-emerald-500/30 hover:bg-emerald-500/[0.02]">
                <div className="bg-[#18181b] w-12 h-12 rounded-lg flex items-center justify-center mb-6 border border-white/10 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/30 transition-all duration-300">
                  <Shield className="w-6 h-6 text-zinc-300 group-hover:text-emerald-400 transition-colors duration-300" strokeWidth={1.5} />
                </div>
                <h3 className="font-medium text-lg text-white mb-2 tracking-tight">Contextual AI</h3>
                <p className="text-[#a1a1aa] text-sm leading-relaxed relative z-10">Answers pulled directly from your notes. Strict RAG pipelines mean zero external hallucinations.</p>
              </div>
              <div className="group border border-white/5 bg-[#0e0e11] p-8 rounded-xl relative flex flex-col items-start transition-colors duration-300 hover:border-rose-500/30 hover:bg-rose-500/[0.02]">
                <div className="bg-[#18181b] w-12 h-12 rounded-lg flex items-center justify-center mb-6 border border-white/10 group-hover:bg-rose-500/20 group-hover:border-rose-500/30 transition-all duration-300">
                  <Activity className="w-6 h-6 text-zinc-300 group-hover:text-rose-400 transition-colors duration-300" strokeWidth={1.5} />
                </div>
                <h3 className="font-medium text-lg text-white mb-2 tracking-tight">Weakness Maps</h3>
                <p className="text-[#a1a1aa] text-sm leading-relaxed relative z-10">The system automatically generates quizzes and isolates the exact paragraphs you are failing to understand.</p>
              </div>
              <div className="group border border-white/5 bg-[#0e0e11] p-8 rounded-xl relative flex flex-col items-start transition-colors duration-300 hover:border-amber-500/30 hover:bg-amber-500/[0.02]">
                <div className="bg-[#18181b] w-12 h-12 rounded-lg flex items-center justify-center mb-6 border border-white/10 group-hover:bg-amber-500/20 group-hover:border-amber-500/30 transition-all duration-300">
                  <Zap className="w-6 h-6 text-zinc-300 group-hover:text-amber-400 transition-colors duration-300" strokeWidth={1.5} />
                </div>
                <h3 className="font-medium text-lg text-white mb-2 tracking-tight">Instant Summaries</h3>
                <p className="text-[#a1a1aa] text-sm leading-relaxed relative z-10">Condense a 500-page textbook into a 3-page localized summary for rapid exam prep.</p>
              </div>
            </div>
          </section>

          {/* Grand Alternating Feature 1 */}
          <section className="px-6 py-24 max-w-[1200px] mx-auto flex flex-col md:flex-row gap-16 items-center border-t border-white/[0.08]">
            <div className="flex-1 relative z-10">
              <h2 className="text-3xl md:text-5xl font-medium tracking-tight mb-6 text-white leading-tight">Chat with your curriculum.</h2>
              <p className="text-lg text-[#a1a1aa] tracking-tight leading-relaxed">
                Turn static PDFs into interactive tutors. Ask questions and get instant, cited answers directly from your study material. Organized into secure, siloed Chat spaces.
              </p>
            </div>
            <div className="flex-[1.2] w-full min-h-[400px] bg-[#0A0A0A] border border-white/[0.08] rounded-2xl relative shadow-2xl p-6 flex flex-col justify-end">
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent rounded-2xl pointer-events-none" />
              <div className="space-y-4 relative z-10 w-full">
                <div className="w-3/4 bg-[#111] p-3 rounded text-xs ml-auto border border-white/10">Summarize the third chapter on photosynthesis.</div>
                <div className="w-full bg-transparent p-3 rounded text-xs border border-white/5 text-zinc-400">Photosynthesis involves two primary stages: the light-dependent reactions and the Calvin cycle. The chapter emphasizes that...</div>
              </div>
            </div>
          </section>

          {/* Grand Alternating Feature 2 */}
          <section className="px-6 py-24 max-w-[1200px] mx-auto flex flex-col md:flex-row-reverse gap-16 items-center border-t border-white/[0.08]">
            <div className="flex-1 relative z-10">
              <h2 className="text-3xl md:text-5xl font-medium tracking-tight mb-6 text-white leading-tight">Identify your knowledge gaps.</h2>
              <p className="text-lg text-[#a1a1aa] tracking-tight leading-relaxed">
                Stop guessing what you don't know. NoteWise generates targeted assessments and provides statistical breakdowns of your weakest topics so you can review efficiently.
              </p>
            </div>
            <div className="flex-[1.2] w-full min-h-[400px] bg-[#0A0A0A] border border-white/[0.08] rounded-2xl relative shadow-2xl p-8 flex flex-col text-center justify-center items-center overflow-hidden">
              <div className="flex items-end gap-4 h-32 mb-6 relative z-10">
                <div className="w-8 bg-zinc-800 border border-zinc-700 rounded-t h-[40%]" />
                <div className="w-8 bg-zinc-800 border border-zinc-700 rounded-t h-[80%]" />
                <div className="w-8 bg-zinc-800 border border-zinc-700 rounded-t h-[30%]" />
                <div className="w-8 bg-rose-600 border border-rose-500 shadow-[0_4px_30px_rgba(225,29,72,0.4)] rounded-t h-[100%]" />
              </div>
              <div className="text-sm font-medium text-white relative z-10">Quiz Analytics</div>
              <div className="text-xs text-rose-500 font-medium relative z-10">You are weakest in: Cellular Respiration</div>
            </div>
          </section>

        </div>
      ) : (
        /* Real Dashboard UI with Grander Scaling */
        <div className="pt-14 h-screen flex bg-black">

          {/* Dashboard Sidebar */}
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

          {/* Main Dashboard Area and Right Sidebar Wrapper */}
          <div className="flex-1 flex overflow-hidden">
            
            {/* Main Content Area */}
            <div className="flex-1 bg-black flex flex-col relative overflow-hidden">
            {view === 'dashboard' ? (
              <div className="flex-1 overflow-y-auto p-12 max-w-[1200px] w-full mx-auto">
                <h2 className="text-3xl font-medium tracking-tight text-white mb-2">Student Overview</h2>
                <p className="text-[#a1a1aa] mb-12 text-lg">Manage your learning data and analytics.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  <div className="bg-[#0A0A0A] border border-white/5 rounded-xl p-8">
                    <p className="text-zinc-500 text-sm mb-2 font-medium">Study Sessions</p>
                    <p className="text-4xl font-semibold tracking-tight">{chats.length}</p>
                  </div>
                  <div className="bg-[#0A0A0A] border border-white/5 rounded-xl p-8">
                    <p className="text-zinc-500 text-sm mb-2 font-medium">Uploaded Documents</p>
                    <p className="text-4xl font-semibold tracking-tight">{chats.reduce((acc, c) => acc + (c.documents?.length || 0), 0)}</p>
                  </div>
                  <div className="bg-[#0A0A0A] border border-white/5 rounded-xl p-8">
                    <p className="text-zinc-500 text-sm mb-2 font-medium">Average Quiz Score</p>
                    <p className="text-4xl font-semibold tracking-tight">-- %</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#0A0A0A] border border-white/5 rounded-xl p-8 h-[300px]">
                    <h3 className="text-lg font-medium tracking-tight mb-4">Top Weaknesses</h3>
                    <div className="text-zinc-500 text-sm">No quizzes completed yet to measure weaknesses.</div>
                  </div>
                  <div className="bg-[#0A0A0A] border border-white/5 rounded-xl p-8 h-[300px]">
                    <h3 className="text-lg font-medium tracking-tight mb-4">Recent Activity</h3>
                    <div className="text-zinc-500 text-sm">System initialized.</div>
                  </div>
                </div>
              </div>
            ) : activeChat ? (
              /* High-Fidelity Chat View */
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
                      value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()}
                      placeholder={isSummarizeMode ? "Type a topic to generate a summary..." : "Message your models..."}
                      className="w-full bg-transparent pl-14 pr-14 py-4 text-base text-zinc-200 placeholder-zinc-500 focus:outline-none"
                    />
                    <button onClick={sendMessage} className={`absolute right-3 p-2 transition rounded-lg ${isSummarizeMode ? 'bg-indigo-500 text-white hover:bg-indigo-600' : 'bg-white text-black hover:bg-zinc-200'}`}>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
            </div>

            {/* Right Sidebar: Flashcards */}
            {view === 'chat' && activeChat && (
              <div className="hidden lg:flex flex-col w-[320px] bg-[#0A0A0A] border-l border-white/5 overflow-hidden">
                <div className="p-5 border-b border-white/5 shrink-0">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                      <Layers className="w-4 h-4 text-orange-400" />
                    </div>
                    <h2 className="text-base font-bold text-white tracking-tight">Flashcards</h2>
                  </div>
                  
                  {/* Create New Cards */}
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      className="w-full bg-[#121214] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-orange-500/50 transition-all"
                      placeholder="Topic to generate..."
                      value={flashcardTopic}
                      onChange={e => setFlashcardTopic(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && generateFlashcards()}
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
            )}
            
          </div>
        </div>
      )}
    </div>
  );
}