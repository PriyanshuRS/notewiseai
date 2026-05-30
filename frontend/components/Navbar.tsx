import { BrainCircuit, Settings } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';

interface NavbarProps {
  token: string;
  setView: Dispatch<SetStateAction<'landing' | 'dashboard' | 'chat'>>;
  setAuthModal: Dispatch<SetStateAction<'login' | 'register' | null>>;
  setShowSettingsModal: Dispatch<SetStateAction<boolean>>;
  handleGoToDashboard: () => void;
}

export function Navbar({ token, setView, setAuthModal, setShowSettingsModal, handleGoToDashboard }: NavbarProps) {
  return (
    <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/[0.08]">
      <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => token ? handleGoToDashboard() : setView('landing')}>
          <BrainCircuit className="w-5 h-5 text-white" />
          <span className="text-sm font-semibold tracking-tight text-white">NoteWise</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            {!token ? (
              <>
                <button onClick={() => setAuthModal('login')} className="text-sm font-medium text-[#a1a1aa] hover:text-white transition">Log in</button>
                <button onClick={() => setAuthModal('register')} className="text-sm font-medium px-4 py-1.5 bg-white text-black rounded-full hover:bg-zinc-200 transition">Sign up</button>
              </>
            ) : (
              <>
                <button onClick={() => setShowSettingsModal(true)} className="p-1.5 text-[#a1a1aa] hover:text-white transition rounded-md hover:bg-white/5">
                  <Settings className="w-4 h-4" />
                </button>
                <button onClick={handleGoToDashboard} className="text-sm font-medium px-4 py-1.5 bg-white text-black rounded-full hover:bg-zinc-200 transition">Dashboard</button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
