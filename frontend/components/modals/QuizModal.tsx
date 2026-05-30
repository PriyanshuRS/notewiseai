import { X, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dispatch, SetStateAction } from 'react';

interface QuizModalProps {
  showQuizModal: boolean;
  setShowQuizModal: Dispatch<SetStateAction<boolean>>;
  activeChat: any;
  quizTopic: string;
  setQuizTopic: Dispatch<SetStateAction<string>>;
  isGeneratingQuiz: boolean;
  quizData: any;
  setQuizData: Dispatch<SetStateAction<any>>;
  quizAnswers: Record<string, string>;
  setQuizAnswers: Dispatch<SetStateAction<Record<string, string>>>;
  quizResult: any;
  setQuizResult: Dispatch<SetStateAction<any>>;
  generateQuiz: () => Promise<void>;
  submitQuiz: () => Promise<void>;
}

export function QuizModal({
  showQuizModal, setShowQuizModal, activeChat,
  quizTopic, setQuizTopic, isGeneratingQuiz,
  quizData, setQuizData, quizAnswers, setQuizAnswers,
  quizResult, setQuizResult, generateQuiz, submitQuiz
}: QuizModalProps) {
  return (
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
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        generateQuiz();
                      }
                    }}
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
  );
}
