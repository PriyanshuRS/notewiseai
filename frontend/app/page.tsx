'use client';

import { useState, useEffect, useRef } from 'react';
import { Navbar } from '../components/Navbar';
import { LandingPage } from '../components/LandingPage';
import { DashboardSidebar } from '../components/DashboardSidebar';
import { ChatArea } from '../components/ChatArea';
import { FlashcardSidebar } from '../components/FlashcardSidebar';
import { AuthModal } from '../components/modals/AuthModal';
import { DocumentCenterModal } from '../components/modals/DocumentCenterModal';
import { QuizModal } from '../components/modals/QuizModal';
import { FlashcardReviewModal } from '../components/modals/FlashcardReviewModal';
import { SettingsModal } from '../components/modals/SettingsModal';

const API = 'http://127.0.0.1:8000/api';

export default function App() {
  const [view, setView] = useState<'landing' | 'dashboard' | 'chat'>('landing');
  const [authModal, setAuthModal] = useState<'login' | 'register' | null>(null);

  const [provider, setProvider] = useState<'ollama' | 'openai'>('ollama');
  const [openaiKey, setOpenaiKey] = useState('');
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');

  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showDocCenter, setShowDocCenter] = useState(false);
  const [isSummarizeMode, setIsSummarizeMode] = useState(false);
  
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizTopic, setQuizTopic] = useState('');
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizData, setQuizData] = useState<any>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<any>(null);

  const [showFlashcardModal, setShowFlashcardModal] = useState(false);
  const [flashcardTopic, setFlashcardTopic] = useState('');
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [dueFlashcards, setDueFlashcards] = useState<any[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [collapsedTopics, setCollapsedTopics] = useState<Record<string, boolean>>({});
  const [analytics, setAnalytics] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => scrollToBottom(), [messages]);

  useEffect(() => {
    const savedToken = localStorage.getItem('nw_token');
    const savedUser = localStorage.getItem('nw_user');
    const savedProvider = localStorage.getItem('nw_provider') as 'ollama' | 'openai';
    const savedKey = localStorage.getItem('nw_openai_key');
    if (savedProvider) setProvider(savedProvider);
    if (savedKey) setOpenaiKey(savedKey);

    if (savedToken) {
      setToken(savedToken);
      if (savedUser) setUsername(savedUser);
      setView('dashboard');
      fetchChats(savedToken);
      fetchAnalytics(savedToken);
    }
  }, []);

  useEffect(() => {
    if (provider) localStorage.setItem('nw_provider', provider);
  }, [provider]);

  useEffect(() => {
    localStorage.setItem('nw_openai_key', openaiKey);
  }, [openaiKey]);

  useEffect(() => {
    if (!token) return;
    const hasProcessing = chats.some(c => c.documents?.some((d: any) => d.status === 'processing'));
    let interval: NodeJS.Timeout;
    if (hasProcessing) {
      interval = setInterval(() => {
        fetchChats(token);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [chats, token]);

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
          fetchAnalytics(data.access);
        } else {
          alert('Registered successfully! Please login.');
          setAuthModal('login');
        }
      } else {
        alert(isLogin ? 'Login failed.' : 'Registration failed.');
      }
    } catch (error) {
      console.error('Auth error:', error);
      alert('Network error during authentication.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('nw_token');
    localStorage.removeItem('nw_user');
    setToken('');
    setView('landing');
    setChats([]);
    setActiveChat(null);
  };

  const fetchAnalytics = async (t: string) => {
    try {
      const res = await fetch(`${API}/auth/analytics/`, { headers: { Authorization: `Bearer ${t}` } });
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const handleGoToDashboard = () => {
    setActiveChat(null);
    setView('dashboard');
    if (token) {
      fetchAnalytics(token);
    }
  };

  const fetchChats = async (t: string) => {
    try {
      const res = await fetch(`${API}/chats/`, { headers: { Authorization: `Bearer ${t}` } });
      const data = await res.json();
      if (Array.isArray(data)) {
        setChats(data);
        setActiveChat((prev: any) => {
          if (!prev) return null;
          const updatedChat = data.find((c: any) => c.id === prev.id);
          return updatedChat || prev;
        });
      }
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    }
  };

  const createChat = async () => {
    try {
      const res = await fetch(`${API}/chats/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Study Session' })
      });
      if (res.ok) {
        fetchChats(token);
      }
    } catch (error) {
      console.error('Failed to create chat:', error);
      alert('Network error creating chat.');
    }
  };

  const deleteChat = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this space and all its configured documents permanently?')) return;
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
    } catch (error) {
      console.error('Failed to delete chat:', error);
      alert('Network error deleting chat.');
    }
  };

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile || !activeChat) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
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
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Network error uploading document.');
    }
    setIsUploading(false);
    fetchChats(token);
  };

  const deleteDocument = async (docId: string) => {
    if (!activeChat) return;
    if (!window.confirm('Are you sure you want to delete this document? All associated vectors and summaries will be wiped.')) return;
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
    } catch (error) {
      console.error('Document deletion failed:', error);
      alert('Network error deleting document.');
    }
  };

  const sendMessage = async () => {
    if (!query || !activeChat) return;
    const userMsgTemplate = { sender: 'user', content: query };
    setMessages(prev => [...prev, userMsgTemplate]);
    const currentQuery = query;
    setQuery('');

    if (isSummarizeMode) {
      try {
        const res = await fetch(`${API}/chats/${activeChat.id}/summarize/`, {
          method: 'POST',
          headers: { 
            Authorization: `Bearer ${token}`, 
            'Content-Type': 'application/json',
            'X-LLM-Provider': provider,
            'X-OpenAI-Key': openaiKey
          },
          body: JSON.stringify({ topic: currentQuery })
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(prev => [...prev, { sender: 'ai', content: `**Summary of ${currentQuery}**:\n${data.summary}` }]);
        }
      } catch (error) {
        console.error('Summarize failed:', error);
      }
    } else {
      try {
        const res = await fetch(`${API}/chats/${activeChat.id}/messages/`, {
          method: 'POST',
          headers: { 
            Authorization: `Bearer ${token}`, 
            'Content-Type': 'application/json',
            'X-LLM-Provider': provider,
            'X-OpenAI-Key': openaiKey
          },
          body: JSON.stringify({ content: currentQuery })
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(prev => [...prev.slice(0, -1), data.user_message, data.ai_message]);
        }
      } catch (error) {
        console.error('Send message failed:', error);
      }
    }
  };

  const generateQuiz = async () => {
    if (!quizTopic || !activeChat) return;
    setIsGeneratingQuiz(true);
    setQuizData(null);
    setQuizResult(null);
    setQuizAnswers({});

    try {
      const res = await fetch(`${API}/quizzes/generate/`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`, 
          'Content-Type': 'application/json',
          'X-LLM-Provider': provider,
          'X-OpenAI-Key': openaiKey
        },
        body: JSON.stringify({ chat_id: activeChat.id, topic: quizTopic })
      });
      if (res.ok) {
        const data = await res.json();
        setQuizData(data);
      } else {
        alert('Failed to generate quiz. Insufficient document context.');
      }
    } catch (error) {
      console.error('Quiz generation failed:', error);
      alert('Network error generating quiz.');
    }
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
        fetchAnalytics(token);
      }
    } catch (error) {
      console.error('Quiz submission failed:', error);
      alert('Network error submitting quiz.');
    }
  };

  const fetchDueFlashcards = async () => {
    try {
      const res = await fetch(`${API}/study/flashcards/`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        setDueFlashcards(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch flashcards:', error);
    }
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
        headers: { 
          Authorization: `Bearer ${token}`, 
          'Content-Type': 'application/json',
          'X-LLM-Provider': provider,
          'X-OpenAI-Key': openaiKey
        },
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
    } catch (error) {
      console.error('Flashcard generation failed:', error);
      alert('Network error generating flashcards.');
    }
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
    } catch (error) {
      console.error('Flashcard review failed:', error);
      alert('Network error reviewing flashcard.');
    }
  };

  const openFlashcardModal = () => {
    setShowFlashcardModal(true);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    fetchDueFlashcards();
  };

  const isCurrentlyUploading = isUploading || (activeChat?.documents?.some((d: any) => d.status === 'processing') ?? false);

  return (
    <div className="min-h-screen bg-black text-[#f4f4f5] font-sans selection:bg-white/20 overflow-x-hidden">
      
      <Navbar token={token} setView={setView} setAuthModal={setAuthModal} setShowSettingsModal={setShowSettingsModal} handleGoToDashboard={handleGoToDashboard} />
      
      <SettingsModal
        showSettingsModal={showSettingsModal} setShowSettingsModal={setShowSettingsModal}
        provider={provider} setProvider={setProvider}
        openaiKey={openaiKey} setOpenaiKey={setOpenaiKey}
      />
      
      <AuthModal 
        authModal={authModal} setAuthModal={setAuthModal}
        username={username} setUsername={setUsername}
        email={email} setEmail={setEmail}
        password={password} setPassword={setPassword}
        handleAuth={handleAuth}
      />
      
      <DocumentCenterModal 
        showDocCenter={showDocCenter} setShowDocCenter={setShowDocCenter}
        activeChat={activeChat} deleteDocument={deleteDocument}
      />
      
      <QuizModal 
        showQuizModal={showQuizModal} setShowQuizModal={setShowQuizModal}
        activeChat={activeChat} quizTopic={quizTopic} setQuizTopic={setQuizTopic}
        isGeneratingQuiz={isGeneratingQuiz} quizData={quizData} setQuizData={setQuizData}
        quizAnswers={quizAnswers} setQuizAnswers={setQuizAnswers}
        quizResult={quizResult} setQuizResult={setQuizResult}
        generateQuiz={generateQuiz} submitQuiz={submitQuiz}
      />
      
      <FlashcardReviewModal
        showFlashcardModal={showFlashcardModal} setShowFlashcardModal={setShowFlashcardModal}
        dueFlashcards={dueFlashcards} currentCardIndex={currentCardIndex}
        isFlipped={isFlipped} setIsFlipped={setIsFlipped}
        reviewFlashcard={reviewFlashcard}
      />

      {view === 'landing' ? (
        <LandingPage setAuthModal={setAuthModal} />
      ) : (
        <div className="pt-14 h-screen flex bg-black">
          <DashboardSidebar 
            chats={chats} activeChat={activeChat} view={view} username={username}
            createChat={createChat} deleteChat={deleteChat} handleLogout={handleLogout}
            setActiveChat={setActiveChat} setMessages={setMessages} setView={setView}
          />
          
          <div className="flex flex-col flex-1 h-full relative overflow-hidden">
            {activeChat ? (
              <div className="flex h-full w-full relative">
                <div className="flex-1 relative border-r border-white/5 bg-black">
                  <ChatArea 
                    activeChat={activeChat} deleteChat={deleteChat}
                    setShowQuizModal={setShowQuizModal} setShowDocCenter={setShowDocCenter}
                    uploadFile={uploadFile} isUploading={isCurrentlyUploading}
                    messages={messages} messagesEndRef={messagesEndRef}
                    isSummarizeMode={isSummarizeMode} setIsSummarizeMode={setIsSummarizeMode}
                    query={query} setQuery={setQuery} sendMessage={sendMessage}
                  />
                </div>
                {}
                <FlashcardSidebar 
                  flashcardTopic={flashcardTopic} setFlashcardTopic={setFlashcardTopic}
                  generateFlashcards={generateFlashcards} isGeneratingFlashcards={isGeneratingFlashcards}
                  dueFlashcards={dueFlashcards} collapsedTopics={collapsedTopics}
                  setCollapsedTopics={setCollapsedTopics} openFlashcardModal={openFlashcardModal}
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center text-center px-6">
                <h2 className="text-2xl font-bold tracking-tight mb-2 text-white">Welcome back, {username || 'Priyanshu'}</h2>
                <p className="text-zinc-500 mb-8 max-w-sm">Select a space from the sidebar to continue studying, or create a new one.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
                  <div className="bg-[#0A0A0A] border border-white/5 rounded-xl p-8 h-[300px] flex flex-col justify-between text-left">
                    <div>
                      <h3 className="text-lg font-medium tracking-tight mb-4 text-white">Top Weaknesses</h3>
                      {analytics?.top_weaknesses && analytics.top_weaknesses.length > 0 ? (
                        <div className="space-y-3">
                          {analytics.top_weaknesses.map((w: any, index: number) => (
                            <div key={index} className="flex justify-between items-center bg-white/[0.02] border border-white/[0.04] p-3 rounded-lg">
                              <span className="text-sm text-zinc-300 font-medium">{w.topic}</span>
                              <span className="text-xs bg-rose-500/10 text-rose-400 px-2.5 py-1 rounded-full font-bold border border-rose-500/20">{w.incorrect} errors</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-zinc-500 text-sm">No quizzes completed yet to measure weaknesses.</div>
                      )}
                    </div>
                    {analytics?.average_score !== undefined && analytics?.average_score !== null && (
                      <div className="border-t border-white/5 pt-4 flex justify-between items-center text-xs text-zinc-400 mt-2">
                        <span>Average Quiz Score</span>
                        <span className="text-sm font-bold text-indigo-400">{analytics.average_score}%</span>
                      </div>
                    )}
                  </div>
                  <div className="bg-[#0A0A0A] border border-white/5 rounded-xl p-8 h-[300px] flex flex-col text-left">
                    <h3 className="text-lg font-medium tracking-tight mb-4 text-white">Recent Activity</h3>
                    {chats && chats.length > 0 ? (
                      <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                        {chats.slice(0, 3).map((c: any) => (
                          <div 
                            key={c.id} 
                            onClick={() => { setActiveChat(c); setMessages(c.messages || []); setView('chat'); }}
                            className="flex justify-between items-center bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] p-3 rounded-lg cursor-pointer transition"
                          >
                            <div className="flex flex-col text-left min-w-0 flex-1">
                              <span className="text-sm text-zinc-200 font-medium truncate pr-2">{c.title}</span>
                              <span className="text-[10px] text-zinc-500 mt-0.5">
                                {c.documents?.length || 0} document{(c.documents?.length !== 1) ? 's' : ''} loaded
                              </span>
                            </div>
                            <span className="text-[10px] text-zinc-500 font-mono shrink-0 ml-2">
                              {new Date(c.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-zinc-500 text-sm">System initialized.</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}