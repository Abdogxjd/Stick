import { useProjectStore } from '../stores/projectStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Move, RotateCw, Scale, Palette, Sliders } from 'lucide-react';

export default function PropertiesPanel() {
  const selection = useProjectStore(s => s.selection);
  const project = useProjectStore(s => s.project);
  const updateNode = useProjectStore(s => s.updateNode);
  const updateStickfigure = useProjectStore(s => s.updateStickfigure);
  const setSelection = useProjectStore(s => s.setSelection);
  
  if (!selection || !project) return null;
  
  const currentFrame = project.frames[project.currentFrame];
  
  const getSelectedItem = () => {
    if (selection.type === 'stickfigure') {
      return currentFrame.stickfigures[selection.id];
    }
    if (selection.type === 'node' && selection.stickfigureId) {
      const sf = currentFrame.stickfigures[selection.stickfigureId];
      return sf?.nodes[selection.id];
    }
    return null;
  };
  
  const item = getSelectedItem();
  if (!item) return null;
  
  const isNode = selection.type === 'node';
  const isStickfigure = selection.type === 'stickfigure';
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 300, opacity: 0 }}
        className="fixed right-0 top-14 bottom-0 w-64 bg-[#0a0a14] border-l border-white/10 z-40 overflow-y-auto"
      >
        <div className="p-4 space-y-4">
          {/* الرأس */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white/80">
              {isNode ? 'خصائص العقدة' : 'خصائص الشخصية'}
            </h3>
            <button
              onClick={() => setSelection(null)}
              className="p-1 rounded hover:bg-white/10 text-white/40"
            >
              <X size={16} />
            </button>
          </div>
          
          {/* الموقع */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-white/50">
              <Move size={12} />
              <span>الموقع</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-white/30">X</label>
                <input
                  type="number"
                  value={Math.round(item.x)}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (isNode && selection.stickfigureId) {
                      updateNode(selection.stickfigureId, selection.id, { x: val });
                    } else if (isStickfigure) {
                      updateStickfigure(selection.id, { x: val });
                    }
                  }}
                  className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-white/30">Y</label>
                <input
                  type="number"
                  value={Math.round(item.y)}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (isNode && selection.stickfigureId) {
                      updateNode(selection.stickfigureId, selection.id, { y: val });
                    } else if (isStickfigure) {
                      updateStickfigure(selection.id, { y: val });
                    }
                  }}
                  className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-sm text-white"
                />
              </div>
            </div>
          </div>
          
          {/* الدوران */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-white/50">
              <RotateCw size={12} />
              <span>الدوران</span>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              value={item.rotation || 0}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (isNode && selection.stickfigureId) {
                  updateNode(selection.stickfigureId, selection.id, { angle: val });
                } else if (isStickfigure) {
                  updateStickfigure(selection.id, { rotation: val });
                }
              }}
              className="w-full accent-indigo-500"
            />
            <div className="text-center text-xs text-white/40">{Math.round(item.rotation || item.angle || 0)}°</div>
          </div>
          
          {/* الحجم */}
          {isStickfigure && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-white/50">
                <Scale size={12} />
                <span>الحجم</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={item.scale || 1}
                onChange={(e) => {
                  updateStickfigure(selection.id, { scale: parseFloat(e.target.value) });
                }}
                className="w-full accent-indigo-500"
              />
              <div className="text-center text-xs text-white/40">{Math.round((item.scale || 1) * 100)}%</div>
            </div>
          )}
          
          {/* اللون */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-white/50">
              <Palette size={12} />
              <span>اللون</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={item.color || '#4ecdc4'}
                onChange={(e) => {
                  if (isNode && selection.stickfigureId) {
                    updateNode(selection.stickfigureId, selection.id, { color: e.target.value });
                  } else if (isStickfigure) {
                    updateStickfigure(selection.id, { color: e.target.value });
                  }
                }}
                className="w-8 h-8 rounded cursor-pointer"
              />
              <span className="text-xs text-white/40">{item.color || '#4ecdc4'}</span>
            </div>
          </div>
          
          {/* الشفافية */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-white/50">
              <Sliders size={12} />
              <span>الشفافية</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={item.opacity}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (isNode && selection.stickfigureId) {
                  updateNode(selection.stickfigureId, selection.id, { opacity: val });
                } else if (isStickfigure) {
                  updateStickfigure(selection.id, { opacity: val });
                }
              }}
              className="w-full accent-indigo-500"
            />
            <div className="text-center text-xs text-white/40">{Math.round(item.opacity * 100)}%</div>
          </div>
          
          {/* السماكة (للعقد فقط) */}
          {isNode && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-white/50">
                <Sliders size={12} />
                <span>السماكة</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={item.thickness || 5}
                onChange={(e) => {
                  if (selection.stickfigureId) {
                    updateNode(selection.stickfigureId, selection.id, { thickness: parseInt(e.target.value) });
                  }
                }}
                className="w-full accent-indigo-500"
              />
              <div className="text-center text-xs text-white/40">{item.thickness || 5}px</div>
            </div>
          )}
          
          {/* الطول (للعقد فقط) */}
          {isNode && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-white/50">
                <Sliders size={12} />
                <span>الطول</span>
              </div>
              <input
                type="range"
                min="1"
                max="200"
                value={item.length || 40}
                onChange={(e) => {
                  if (selection.stickfigureId) {
                    updateNode(selection.stickfigureId, selection.id, { length: parseInt(e.target.value) });
                  }
                }}
                className="w-full accent-indigo-500"
              />
              <div className="text-center text-xs text-white/40">{item.length || 40}px</div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
