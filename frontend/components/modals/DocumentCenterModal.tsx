import { X, FileText, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dispatch, SetStateAction } from 'react';

interface DocumentCenterModalProps {
  showDocCenter: boolean;
  setShowDocCenter: Dispatch<SetStateAction<boolean>>;
  activeChat: any;
  deleteDocument: (docId: string) => Promise<void>;
}

export function DocumentCenterModal({
  showDocCenter, setShowDocCenter, activeChat, deleteDocument
}: DocumentCenterModalProps) {
  return (
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
  );
}
