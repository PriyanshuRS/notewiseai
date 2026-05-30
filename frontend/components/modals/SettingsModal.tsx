import { X } from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';

interface SettingsModalProps {
  showSettingsModal: boolean;
  setShowSettingsModal: Dispatch<SetStateAction<boolean>>;
  provider: 'ollama' | 'openai';
  setProvider: Dispatch<SetStateAction<'ollama' | 'openai'>>;
  openaiKey: string;
  setOpenaiKey: Dispatch<SetStateAction<string>>;
}

export function SettingsModal({
  showSettingsModal,
  setShowSettingsModal,
  provider,
  setProvider,
  openaiKey,
  setOpenaiKey
}: SettingsModalProps) {
  if (!showSettingsModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 w-full max-w-md relative shadow-2xl">
        <button onClick={() => setShowSettingsModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition">
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-bold tracking-tight mb-6 text-white">App Settings</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">LLM Provider</label>
            <div className="flex gap-2">
              <button 
                onClick={() => setProvider('ollama')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition ${
                  provider === 'ollama' ? 'bg-white text-black' : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                }`}
              >
                Ollama (Local)
              </button>
              <button 
                onClick={() => setProvider('openai')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition ${
                  provider === 'openai' ? 'bg-white text-black' : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                }`}
              >
                OpenAI (Cloud)
              </button>
            </div>
          </div>

          {provider === 'openai' && (
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">OpenAI API Key</label>
              <input 
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full bg-black border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/20 transition"
              />
              <p className="text-xs text-zinc-500 mt-2">
                Your key is stored locally in your browser and sent securely over headers.
              </p>
            </div>
          )}

          <button 
            onClick={() => setShowSettingsModal(false)}
            className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-semibold transition mt-4"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
}
