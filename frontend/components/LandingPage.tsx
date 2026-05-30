import { ArrowRight, Search, MessageSquare, User, ChevronUp, Plus, Shield, Activity, Zap } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';

interface LandingPageProps {
  setAuthModal: Dispatch<SetStateAction<'login' | 'register' | null>>;
}

export function LandingPage({ setAuthModal }: LandingPageProps) {
  return (
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
  );
}
