import { useProjectStore } from '../stores/projectStore';
import { Play, Pause, SkipBack, SkipForward, Copy, Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Timeline() {
  const project = useProjectStore(s => s.project);
  const currentFrame = project?.currentFrame ?? 0;
  const isPlaying = useProjectStore(s => s.isPlaying);
  
  const setCurrentFrame = useProjectStore(s => s.setCurrentFrame);
  const setPlaying = useProjectStore(s => s.setPlaying);
  const addFrame = useProjectStore(s => s.addFrame);
  const deleteFrame = useProjectStore(s => s.deleteFrame);
  const duplicateFrame = useProjectStore(s => s.duplicateFrame);
  
  if (!project) return null;
  
  const frames = project.frames;
  
  return (
    <div className="h-24 bg-[#0a0a14] border-t border-white/10 flex flex-col">
      {/* شريط التحكم */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/5">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentFrame(0)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <SkipBack size={14} />
          </button>
          <button
            onClick={() => setCurrentFrame(Math.max(0, currentFrame - 1))}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => setPlaying(!isPlaying)}
            className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button
            onClick={() => setCurrentFrame(Math.min(frames.length - 1, currentFrame + 1))}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <ChevronRight size={14} />
          </button>
          <button
            onClick={() => setCurrentFrame(frames.length - 1)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <SkipForward size={14} />
          </button>
        </div>
        
        <div className="text-xs text-white/50">
          {currentFrame + 1} / {frames.length}
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={addFrame}
            className="p-1.5 rounded-lg hover:bg-white/10 text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={() => duplicateFrame(currentFrame)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={() => frames.length > 1 && deleteFrame(currentFrame)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-red-400 hover:text-red-300 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      
      {/* الإطارات */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex items-center h-full px-2 gap-1 min-w-max">
          <AnimatePresence>
            {frames.map((frame, index) => (
              <motion.button
                key={frame.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={() => setCurrentFrame(index)}
                className={`
                  relative flex-shrink-0 w-14 h-14 rounded-lg border-2 transition-all
                  ${index === currentFrame 
                    ? 'border-indigo-500 bg-indigo-500/20' 
                    : 'border-white/10 bg-white/5 hover:border-white/30'
                  }
                `}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-xs font-mono ${index === currentFrame ? 'text-indigo-300' : 'text-white/40'}`}>
                    {index + 1}
                  </span>
                </div>
                
                {index === currentFrame && (
                  <motion.div
                    layoutId="activeFrame"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-indigo-500 rounded-full"
                  />
                )}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
