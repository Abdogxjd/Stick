import { useState } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { 
  Layers, Settings, Wand2, Image, Box, 
  ChevronRight, ChevronDown, Eye, EyeOff, Lock, Unlock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type TabType = 'layers' | 'library' | 'ai' | 'settings';

export default function Sidebar() {
  const [activeTab, setActiveTab] = useState<TabType>('layers');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  
  const project = useProjectStore(s => s.project);
  const selection = useProjectStore(s => s.selection);
  const settings = useProjectStore(s => s.settings);
  const aiSettings = useProjectStore(s => s.aiSettings);
  
  const setSelection = useProjectStore(s => s.setSelection);
  const updateSettings = useProjectStore(s => s.updateSettings);
  const updateAISettings = useProjectStore(s => s.updateAISettings);
  const updateStickfigure = useProjectStore(s => s.updateStickfigure);
  
  const currentFrame = project?.frames[project.currentFrame];
  const stickfigures = currentFrame ? Object.values(currentFrame.stickfigures) : [];
  
  const toggleExpand = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  
  const tabs = [
    { id: 'layers' as TabType, icon: Layers, label: 'الطبقات' },
    { id: 'library' as TabType, icon: Box, label: 'المكتبة' },
    { id: 'ai' as TabType, icon: Wand2, label: 'الذكاء' },
    { id: 'settings' as TabType, icon: Settings, label: 'الإعدادات' },
  ];
  
  return (
    <div className="w-64 bg-[#0a0a14] border-l border-white/10 flex flex-col">
      {/* علامات التبويب */}
      <div className="flex border-b border-white/10">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 py-3 flex flex-col items-center gap-1 text-xs transition-colors
              ${activeTab === tab.id 
                ? 'text-indigo-400 bg-white/5 border-b-2 border-indigo-500' 
                : 'text-white/40 hover:text-white/70'
              }
            `}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
      
      {/* المحتوى */}
      <div className="flex-1 overflow-y-auto p-3">
        <AnimatePresence mode="wait">
          {activeTab === 'layers' && (
            <motion.div
              key="layers"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-white/60 uppercase">الهياكل</h3>
                <span className="text-xs text-white/30">{stickfigures.length}</span>
              </div>
              
              {stickfigures.map(sf => (
                <div key={sf.id} className="space-y-1">
                  <div
                    onClick={() => setSelection({ type: 'stickfigure', id: sf.id })}
                    className={`
                      flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors
                      ${selection?.type === 'stickfigure' && selection.id === sf.id
                        ? 'bg-indigo-500/20 border border-indigo-500/30'
                        : 'bg-white/5 hover:bg-white/10 border border-transparent'
                      }
                    `}
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleExpand(sf.id); }}
                      className="text-white/40"
                    >
                      {expandedItems.has(sf.id) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    </button>
                    
                    <span className="text-sm text-white/80 flex-1 truncate">شخصية {sf.id.slice(-4)}</span>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); updateStickfigure(sf.id, { visible: !sf.visible }); }}
                        className="p-1 rounded hover:bg-white/10 text-white/40"
                      >
                        {sf.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); updateStickfigure(sf.id, { locked: !sf.locked }); }}
                        className="p-1 rounded hover:bg-white/10 text-white/40"
                      >
                        {sf.locked ? <Lock size={12} /> : <Unlock size={12} />}
                      </button>
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {expandedItems.has(sf.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="ml-4 space-y-1 overflow-hidden"
                      >
                        {Object.values(sf.nodes).map(node => (
                          <div
                            key={node.id}
                            onClick={() => setSelection({ type: 'node', id: node.id, stickfigureId: sf.id })}
                            className={`
                              flex items-center gap-2 p-1.5 rounded cursor-pointer transition-colors
                              ${selection?.type === 'node' && selection.id === node.id
                                ? 'bg-indigo-500/10'
                                : 'hover:bg-white/5'
                              }
                            `}
                          >
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: node.color }}
                            />
                            <span className="text-xs text-white/50">عقدة {node.id.slice(-4)}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
              
              {stickfigures.length === 0 && (
                <div className="text-center py-8 text-white/30 text-sm">
                  لا توجد هياكل
                </div>
              )}
            </motion.div>
          )}
          
          {activeTab === 'library' && (
            <motion.div
              key="library"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-3"
            >
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-white/60 uppercase">الهياكل المحفوظة</h3>
                {project?.library.stickfigures.map(item => (
                  <div key={item.id} className="p-2 bg-white/5 rounded-lg flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-indigo-500/20 flex items-center justify-center">
                      <Box size={14} className="text-indigo-400" />
                    </div>
                    <span className="text-sm text-white/70 flex-1">{item.name}</span>
                  </div>
                ))}
                {(!project?.library.stickfigures.length) && (
                  <div className="text-center py-4 text-white/30 text-xs">
                    المكتبة فارغة
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-white/60 uppercase">الصور</h3>
                <button className="w-full p-2 bg-white/5 rounded-lg flex items-center gap-2 hover:bg-white/10 transition-colors">
                  <Image size={14} className="text-emerald-400" />
                  <span className="text-sm text-white/70">إضافة صورة</span>
                </button>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'ai' && (
            <motion.div
              key="ai"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-white/60 uppercase">إعدادات الذكاء الاصطناعي</h3>
                
                <div className="space-y-2">
                  <label className="text-xs text-white/50">مفتاح Gemini API</label>
                  <input
                    type="password"
                    value={aiSettings.apiKey}
                    onChange={(e) => updateAISettings({ apiKey: e.target.value })}
                    placeholder="ألصق مفتاح API هنا"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs text-white/50">النموذج</label>
                  <select
                    value={aiSettings.model}
                    onChange={(e) => updateAISettings({ model: e.target.value })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                    <option value="gemini-2.0-pro">Gemini 2.0 Pro</option>
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                  </select>
                </div>
                
                <button
                  onClick={() => updateAISettings({ enabled: !!aiSettings.apiKey })}
                  className={`
                    w-full py-2 rounded-lg text-sm font-medium transition-colors
                    ${aiSettings.apiKey 
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                      : 'bg-white/5 text-white/30 cursor-not-allowed'
                    }
                  `}
                >
                  {aiSettings.apiKey ? 'تفعيل الذكاء الاصطناعي' : 'أدخل مفتاح API أولاً'}
                </button>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-white/60 uppercase">الوضع الخارجي</h3>
                <button className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white/70 transition-colors">
                  نسخ تعليمات العميل
                </button>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-white/60 uppercase">إعدادات المشهد</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-xs text-white/50">FPS</label>
                    <span className="text-xs text-white/70">{settings.fps}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="60"
                    value={settings.fps}
                    onChange={(e) => updateSettings({ fps: parseInt(e.target.value) })}
                    className="w-full accent-indigo-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-xs text-white/50">حجم الشبكة</label>
                    <span className="text-xs text-white/70">{settings.gridSize}</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={settings.gridSize}
                    onChange={(e) => updateSettings({ gridSize: parseInt(e.target.value) })}
                    className="w-full accent-indigo-500"
                  />
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <label className="text-xs text-white/50">البيننة التلقائية</label>
                  <button
                    onClick={() => updateSettings({ tweening: !settings.tweening })}
                    className={`w-10 h-5 rounded-full transition-colors ${settings.tweening ? 'bg-indigo-500' : 'bg-white/10'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.tweening ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <label className="text-xs text-white/50">قشرة البصل</label>
                  <button
                    onClick={() => updateSettings({ onionSkinning: !settings.onionSkinning })}
                    className={`w-10 h-5 rounded-full transition-colors ${settings.onionSkinning ? 'bg-indigo-500' : 'bg-white/10'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.onionSkinning ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <label className="text-xs text-white/50">وضع الفيديو الرأسي</label>
                  <button
                    onClick={() => updateSettings({ verticalMode: !settings.verticalMode })}
                    className={`w-10 h-5 rounded-full transition-colors ${settings.verticalMode ? 'bg-indigo-500' : 'bg-white/10'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.verticalMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
