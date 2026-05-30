import { motion, AnimatePresence } from 'framer-motion';
import { Dispatch, SetStateAction } from 'react';

interface AuthModalProps {
  authModal: 'login' | 'register' | null;
  setAuthModal: Dispatch<SetStateAction<'login' | 'register' | null>>;
  username: string;
  setUsername: Dispatch<SetStateAction<string>>;
  email: string;
  setEmail: Dispatch<SetStateAction<string>>;
  password: string;
  setPassword: Dispatch<SetStateAction<string>>;
  handleAuth: (isLogin: boolean) => Promise<void>;
}

export function AuthModal({
  authModal, setAuthModal,
  username, setUsername, email, setEmail, password, setPassword,
  handleAuth
}: AuthModalProps) {
  return (
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
  );
}
