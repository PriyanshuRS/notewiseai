import { X, Layers, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dispatch, SetStateAction } from 'react';

interface FlashcardReviewModalProps {
  showFlashcardModal: boolean;
  setShowFlashcardModal: Dispatch<SetStateAction<boolean>>;
  dueFlashcards: any[];
  currentCardIndex: number;
  isFlipped: boolean;
  setIsFlipped: Dispatch<SetStateAction<boolean>>;
  reviewFlashcard: (difficulty: 'easy' | 'medium' | 'hard') => Promise<void>;
}

export function FlashcardReviewModal({
  showFlashcardModal, setShowFlashcardModal, dueFlashcards,
  currentCardIndex, isFlipped, setIsFlipped, reviewFlashcard
}: FlashcardReviewModalProps) {
  const currentCard = dueFlashcards[currentCardIndex];
  const isFinished = currentCardIndex >= dueFlashcards.length;

  return (
    <AnimatePresence>
      {showFlashcardModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setShowFlashcardModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 10 }}
            onClick={e => e.stopPropagation()}
            className="bg-[#09090b] border border-white/[0.08] rounded-3xl p-8 w-full max-w-lg shadow-[0_0_40px_rgba(0,0,0,0.5)] relative flex flex-col min-h-[400px]"
          >
            <div className="flex items-center justify-between mb-6 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                  <Layers className="w-5 h-5 text-orange-400" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">Review Flashcards</h2>
              </div>
              <button onClick={() => setShowFlashcardModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 flex flex-col justify-center relative">
              {isFinished || dueFlashcards.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-12">
                  <Sparkles className="w-12 h-12 text-zinc-600 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">You're all caught up!</h3>
                  <p className="text-zinc-400">You've reviewed all your due flashcards for now.</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full">
                  <div className="text-xs font-bold text-zinc-500 mb-4 tracking-widest uppercase">
                    Card {currentCardIndex + 1} of {dueFlashcards.length}
                  </div>
                  
                  <div className="w-full relative flex-1 min-h-[250px]" style={{ perspective: 1000 }}>
                    <motion.div
                      className="w-full h-full relative"
                      initial={false}
                      animate={{ rotateY: isFlipped ? 180 : 0 }}
                      transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      {/* Front */}
                      <div 
                        className="absolute inset-0 bg-[#121214] border border-white/10 rounded-2xl p-8 shadow-xl flex flex-col justify-center items-center text-center cursor-pointer hover:border-orange-500/30 transition-colors"
                        style={{ backfaceVisibility: 'hidden' }}
                        onClick={() => setIsFlipped(true)}
                      >
                        <div className="text-xs font-bold text-orange-400 mb-4 uppercase">{currentCard.topic_tag}</div>
                        <h3 className="text-lg md:text-xl font-medium text-white leading-relaxed">{currentCard.front_text}</h3>
                        <p className="text-zinc-500 text-sm mt-8 opacity-70">Click to reveal answer</p>
                      </div>

                      {/* Back */}
                      <div 
                        className="absolute inset-0 bg-orange-500/10 border border-orange-500/30 rounded-2xl p-8 shadow-[0_0_30px_rgba(249,115,22,0.1)] flex flex-col justify-center items-center text-center overflow-y-auto"
                        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                      >
                         <h3 className="text-base md:text-lg font-medium text-zinc-200 leading-relaxed">{currentCard.back_text}</h3>
                      </div>
                    </motion.div>
                  </div>
                  
                  {/* Controls */}
                  <div className="w-full mt-8 h-12 flex justify-center">
                     {isFlipped && (
                        <div className="flex w-full gap-3">
                           <button onClick={() => reviewFlashcard('hard')} className="flex-1 bg-[#121214] border border-rose-500/30 hover:bg-rose-500/10 text-rose-400 font-semibold py-3 rounded-xl transition-all">Hard (1d)</button>
                           <button onClick={() => reviewFlashcard('medium')} className="flex-1 bg-[#121214] border border-amber-500/30 hover:bg-amber-500/10 text-amber-400 font-semibold py-3 rounded-xl transition-all">Good (2d)</button>
                           <button onClick={() => reviewFlashcard('easy')} className="flex-1 bg-[#121214] border border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-400 font-semibold py-3 rounded-xl transition-all">Easy (4d)</button>
                        </div>
                     )}
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
