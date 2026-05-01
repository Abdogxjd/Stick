import { useProjectStore } from '../stores/projectStore';
import { 
  MousePointer, Hand, Camera, Plus, Minus, 
  Save, FolderOpen, FilePlus, Download, Maximize2,
  Undo2, Redo2, Grid3X3, Layers
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Toolbar() {
  const project = useProjectStore(s => s.project);
  const selectedTool = useProjectStore(s => s.selectedTool);
  const zoom = useProjectStore(s => s.zoom);
  const showGrid = useProjectStore(s => s.showGrid);
  
  const setTool = useProjectStore(s => s.setTool);
  const setZoom = useProjectStore(s => s.setZoom);
  const toggleGrid = useProjectStore(s => s.toggleGrid);
  const createProject = useProjectStore(s => s.createProject);
  const saveProject = useProjectStore(s => s.saveProject);
  const loadProject = useProjectStore(s => s.loadProject);
  
  const [showProjects, setShowProjects] = useState(false);
  const savedProjects = useProjectStore(s => s.savedProjects);
  
  const tools = [
    { id: 'select', icon: MousePointer, label: 'تحديد' },
    { id: 'pan', icon: Hand, label: 'تحريك' },
    { id: 'camera', icon: Camera, label: 'كاميرا' },
  ];
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };
  
  return (
    <div className="h-14 bg-[#0a0a14] border-b border-white/10 flex items-center px-3 gap-2">
      {/* شعار */}
      <div className="flex items-center gap-2 mr-2">
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Layers size={16} className="text-white" />
        </div>
        <span className="text-sm font-bold text-white hidden sm:block">Stick Nodes</span>
      </div>
      
      <div className="w-px h-8 bg-white/10 mx-1" />
      
      {/* أدوات الملف */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => createProject('مشروع جديد')}
          className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          title="مشروع جديد"
        >
          <FilePlus size={18} />
        </button>
        <button
          onClick={saveProject}
          className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          title="حفظ"
        >
          <Save size={18} />
        </button>
        <button
          onClick={() => setShowProjects(!showProjects)}
          className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors relative"
          title="فتح مشروع"
        >
          <FolderOpen size={18} />
          {showProjects && (
            <div className="absolute top-full left-0 mt-2 w-56 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl z-50 py-2">
              <div className="px-3 py-2 text-xs font-semibold text-white/40 uppercase border-b border-white/5">
                المشاريع المحفوظة
              </div>
              {savedProjects.length === 0 ? (
                <div className="px-3 py-4 text-sm text-white/30 text-center">
                  لا توجد مشاريع محفوظة
                </div>
              ) : (
                savedProjects.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      const projects = JSON.parse(localStorage.getItem('sticknodes-projects') || '[]');
                      const proj = projects.find((pr: any) => pr.id === p.id);
                      if (proj) loadProject(proj);
                      setShowProjects(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-white/70 hover:bg-white/5 transition-colors flex items-center gap-2"
                  >
                    <span className="truncate flex-1">{p.name}</span>
                    <span className="text-xs text-white/30">
                      {new Date(p.updatedAt).toLocaleDateString('ar-SA')}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </button>
        <button
          className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          title="تصدير"
        >
          <Download size={18} />
        </button>
      </div>
      
      <div className="w-px h-8 bg-white/10 mx-1" />
      
      {/* أدوات التحرير */}
      <div className="flex items-center gap-1">
        <button className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
          <Undo2 size={18} />
        </button>
        <button className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
          <Redo2 size={18} />
        </button>
      </div>
      
      <div className="w-px h-8 bg-white/10 mx-1" />
      
      {/* أدوات الكانفاس */}
      <div className="flex items-center gap-1">
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={() => setTool(tool.id)}
            className={`
              p-2 rounded-lg transition-colors
              ${selectedTool === tool.id
                ? 'bg-indigo-500/20 text-indigo-400'
                : 'hover:bg-white/10 text-white/60 hover:text-white'
              }
            `}
            title={tool.label}
          >
            <tool.icon size={18} />
          </button>
        ))}
        
        <button
          onClick={toggleGrid}
          className={`
            p-2 rounded-lg transition-colors
            ${showGrid
              ? 'bg-indigo-500/20 text-indigo-400'
              : 'hover:bg-white/10 text-white/60 hover:text-white'
            }
          `}
          title="شبكة"
        >
          <Grid3X3 size={18} />
        </button>
      </div>
      
      <div className="flex-1" />
      
      {/* التكبير/التصغير */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setZoom(zoom - 0.1)}
          className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
        >
          <Minus size={16} />
        </button>
        <span className="text-xs text-white/50 w-12 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(zoom + 0.1)}
          className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>
      
      <div className="w-px h-8 bg-white/10 mx-1" />
      
      {/* ملء الشاشة */}
      <button
        onClick={toggleFullscreen}
        className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
        title="ملء الشاشة"
      >
        <Maximize2 size={18} />
      </button>
      
      {/* اسم المشروع */}
      {project && (
        <div className="hidden md:flex items-center gap-2 ml-2">
          <span className="text-xs text-white/40">|</span>
          <span className="text-sm text-white/70 truncate max-w-[150px]">{project.name}</span>
        </div>
      )}
    </div>
  );
}
