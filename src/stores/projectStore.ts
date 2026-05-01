import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Project, Frame, Stickfigure, ProjectSettings, AISettings, AIConversation, ExportSettings, LibraryStickfigure } from '../types';

interface ProjectStore {
  // المشروع الحالي
  project: Project | null;
  
  // الإعدادات العامة
  settings: ProjectSettings;
  aiSettings: AISettings;
  
  // المحادثات
  conversations: AIConversation[];
  
  // قائمة المشاريع المحفوظة
  savedProjects: { id: string; name: string; thumbnail?: string; updatedAt: number }[];
  
  // الحالة
  isPlaying: boolean;
  isExporting: boolean;
  showGrid: boolean;
  showOnionSkin: boolean;
  selectedTool: string;
  selection: { type: string; id: string; stickfigureId?: string } | null;
  zoom: number;
  
  // الإجراءات
  createProject: (name: string) => void;
  loadProject: (project: Project) => void;
  saveProject: () => void;
  deleteProject: (id: string) => void;
  addFrame: () => void;
  deleteFrame: (index: number) => void;
  duplicateFrame: (index: number) => void;
  setCurrentFrame: (index: number) => void;
  addStickfigure: (stickfigure: Stickfigure) => void;
  removeStickfigure: (id: string) => void;
  updateStickfigure: (id: string, updates: Partial<Stickfigure>) => void;
  updateNode: (stickfigureId: string, nodeId: string, updates: any) => void;
  setPlaying: (playing: boolean) => void;
  setTool: (tool: string) => void;
  setSelection: (selection: any) => void;
  setZoom: (zoom: number) => void;
  toggleGrid: () => void;
  toggleOnionSkin: () => void;
  updateSettings: (settings: Partial<ProjectSettings>) => void;
  updateAISettings: (settings: Partial<AISettings>) => void;
  addConversation: (conversation: AIConversation) => void;
  updateConversation: (id: string, updates: Partial<AIConversation>) => void;
  exportProject: (settings: ExportSettings) => void;
  addToLibrary: (item: LibraryStickfigure) => void;
  undo: () => void;
  redo: () => void;
}

const defaultSettings: ProjectSettings = {
  fps: 24,
  tweening: false,
  tweenAmount: 3,
  tweenMode: 'linear',
  onionSkinning: true,
  onionSkinCount: 2,
  showGrid: true,
  gridSize: 20,
  snapToGrid: false,
  verticalMode: false,
  screenPadding: 0,
};

const defaultAISettings: AISettings = {
  apiKey: '',
  model: 'gemini-2.0-flash',
  enabled: false,
};

const createDefaultProject = (name: string): Project => ({
  id: Date.now().toString(),
  name,
  frames: [{
    id: 1,
    stickfigures: {},
    camera: { x: 0, y: 0, zoom: 1, rotation: 0 },
    sounds: [],
    delay: 1,
  }],
  currentFrame: 0,
  fps: 24,
  width: 1920,
  height: 1080,
  backgroundColor: '#1a1a2e',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  library: {
    stickfigures: [],
    sprites: [],
    movieclips: [],
    sounds: [],
  },
  settings: { ...defaultSettings },
});

// إنشاء هيكل عصوي افتراضي
const createDefaultStickfigure = (): Stickfigure => {
  const rootId = 'root-' + Date.now();
  const headId = 'head-' + Date.now();
  const bodyId = 'body-' + Date.now();
  const armLId = 'armL-' + Date.now();
  const armRId = 'armR-' + Date.now();
  const legLId = 'legL-' + Date.now();
  const legRId = 'legR-' + Date.now();
  
  return {
    id: 'sf-' + Date.now(),
    name: 'شخصية جديدة',
    nodes: {
      [rootId]: { id: rootId, type: 'main', x: 0, y: 0, color: '#ff6b6b', thickness: 8, length: 0, angle: 0, isStatic: false, isStretchy: false, drawBehind: false, opacity: 1, zIndex: 0, name: 'الجذر', children: [bodyId] },
      [bodyId]: { id: bodyId, type: 'segment', x: 0, y: -40, parentId: rootId, color: '#4ecdc4', thickness: 6, length: 40, angle: -90, isStatic: false, isStretchy: true, drawBehind: false, opacity: 1, zIndex: 1, name: 'الجسم', children: [headId, armLId, armRId, legLId, legRId] },
      [headId]: { id: headId, type: 'circle', x: 0, y: -25, parentId: bodyId, color: '#ffe66d', thickness: 20, length: 20, angle: -90, isStatic: false, isStretchy: false, drawBehind: false, opacity: 1, zIndex: 2, name: 'الرأس', children: [] },
      [armLId]: { id: armLId, type: 'segment', x: -15, y: -10, parentId: bodyId, color: '#4ecdc4', thickness: 5, length: 30, angle: -135, isStatic: false, isStretchy: true, drawBehind: false, opacity: 1, zIndex: 1, name: 'اليد اليسرى', children: [] },
      [armRId]: { id: armRId, type: 'segment', x: 15, y: -10, parentId: bodyId, color: '#4ecdc4', thickness: 5, length: 30, angle: -45, isStatic: false, isStretchy: true, drawBehind: false, opacity: 1, zIndex: 1, name: 'اليد اليمنى', children: [] },
      [legLId]: { id: legLId, type: 'segment', x: -8, y: 40, parentId: bodyId, color: '#4ecdc4', thickness: 5, length: 35, angle: 90, isStatic: false, isStretchy: true, drawBehind: false, opacity: 1, zIndex: 0, name: 'الرجل اليسرى', children: [] },
      [legRId]: { id: legRId, type: 'segment', x: 8, y: 40, parentId: bodyId, color: '#4ecdc4', thickness: 5, length: 35, angle: 90, isStatic: false, isStretchy: true, drawBehind: false, opacity: 1, zIndex: 0, name: 'الرجل اليمنى', children: [] },
    },
    rootNodeId: rootId,
    x: 400,
    y: 300,
    scale: 1,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    color: '#4ecdc4',
    createdAt: Date.now(),
  };
};

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      project: null,
      settings: defaultSettings,
      aiSettings: defaultAISettings,
      conversations: [],
      savedProjects: [],
      isPlaying: false,
      isExporting: false,
      showGrid: true,
      showOnionSkin: true,
      selectedTool: 'select',
      selection: null,
      zoom: 1,
      
      createProject: (name) => {
        const project = createDefaultProject(name);
        const stickfigure = createDefaultStickfigure();
        project.frames[0].stickfigures[stickfigure.id] = {
          id: stickfigure.id,
          x: stickfigure.x,
          y: stickfigure.y,
          scale: stickfigure.scale,
          rotation: stickfigure.rotation,
          opacity: stickfigure.opacity,
          visible: stickfigure.visible,
          locked: false,
          nodes: Object.fromEntries(
            Object.values(stickfigure.nodes).map(n => [n.id, {
              id: n.id,
              x: n.x,
              y: n.y,
              angle: n.angle,
              length: n.length,
              color: n.color,
              thickness: n.thickness,
              opacity: n.opacity,
            }])
          ),
        };
        project.library.stickfigures.push({
          id: stickfigure.id,
          name: stickfigure.name,
          data: stickfigure,
          category: 'default',
        });
        set({ project, selection: null });
      },
      
      loadProject: (project) => set({ project, selection: null }),
      
      saveProject: () => {
        const { project } = get();
        if (!project) return;
        const updated = { ...project, updatedAt: Date.now() };
        const savedProjects = get().savedProjects.filter(p => p.id !== updated.id);
        savedProjects.unshift({
          id: updated.id,
          name: updated.name,
          updatedAt: updated.updatedAt,
        });
        set({ savedProjects: savedProjects.slice(0, 50) });
        
        // حفظ في localStorage
        const projects = JSON.parse(localStorage.getItem('sticknodes-projects') || '[]');
        const existingIndex = projects.findIndex((p: any) => p.id === updated.id);
        if (existingIndex >= 0) {
          projects[existingIndex] = updated;
        } else {
          projects.push(updated);
        }
        localStorage.setItem('sticknodes-projects', JSON.stringify(projects));
        set({ project: updated });
      },
      
      deleteProject: (id) => {
        const savedProjects = get().savedProjects.filter(p => p.id !== id);
        const projects = JSON.parse(localStorage.getItem('sticknodes-projects') || '[]');
        localStorage.setItem('sticknodes-projects', JSON.stringify(projects.filter((p: any) => p.id !== id)));
        set({ savedProjects });
      },
      
      addFrame: () => {
        const { project } = get();
        if (!project) return;
        const currentFrame = project.frames[project.currentFrame];
        const newFrame: Frame = {
          id: project.frames.length + 1,
          stickfigures: JSON.parse(JSON.stringify(currentFrame.stickfigures)),
          camera: { ...currentFrame.camera },
          sounds: [],
          delay: 1,
        };
        const frames = [...project.frames];
        frames.splice(project.currentFrame + 1, 0, newFrame);
        set({
          project: {
            ...project,
            frames,
            currentFrame: project.currentFrame + 1,
          },
        });
      },
      
      deleteFrame: (index) => {
        const { project } = get();
        if (!project || project.frames.length <= 1) return;
        const frames = project.frames.filter((_, i) => i !== index);
        set({
          project: {
            ...project,
            frames,
            currentFrame: Math.min(index, frames.length - 1),
          },
        });
      },
      
      duplicateFrame: (index) => {
        const { project } = get();
        if (!project) return;
        const frame = project.frames[index];
        const newFrame: Frame = {
          ...JSON.parse(JSON.stringify(frame)),
          id: project.frames.length + 1,
        };
        const frames = [...project.frames];
        frames.splice(index + 1, 0, newFrame);
        set({
          project: {
            ...project,
            frames,
            currentFrame: index + 1,
          },
        });
      },
      
      setCurrentFrame: (index) => {
        const { project } = get();
        if (!project) return;
        set({
          project: {
            ...project,
            currentFrame: Math.max(0, Math.min(index, project.frames.length - 1)),
          },
        });
      },
      
      addStickfigure: (stickfigure) => {
        const { project } = get();
        if (!project) return;
        const state = {
          id: stickfigure.id,
          x: stickfigure.x,
          y: stickfigure.y,
          scale: stickfigure.scale,
          rotation: stickfigure.rotation,
          opacity: stickfigure.opacity,
          visible: stickfigure.visible,
          locked: false,
          nodes: Object.fromEntries(
            Object.values(stickfigure.nodes).map(n => [n.id, {
              id: n.id,
              x: n.x,
              y: n.y,
              angle: n.angle,
              length: n.length,
              color: n.color,
              thickness: n.thickness,
              opacity: n.opacity,
            }])
          ),
        };
        set({
          project: {
            ...project,
            frames: project.frames.map((f, i) =>
              i === project.currentFrame
                ? { ...f, stickfigures: { ...f.stickfigures, [stickfigure.id]: state } }
                : f
            ),
            library: {
              ...project.library,
              stickfigures: [...project.library.stickfigures, { id: stickfigure.id, name: stickfigure.name, data: stickfigure, category: 'custom' }],
            },
          },
        });
      },
      
      removeStickfigure: (id) => {
        const { project } = get();
        if (!project) return;
        set({
          project: {
            ...project,
            frames: project.frames.map(f => {
              const { [id]: _, ...rest } = f.stickfigures;
              return { ...f, stickfigures: rest };
            }),
          },
        });
      },
      
      updateStickfigure: (id, updates) => {
        const { project } = get();
        if (!project) return;
        const frame = project.frames[project.currentFrame];
        const sf = frame.stickfigures[id];
        if (!sf) return;
        set({
          project: {
            ...project,
            frames: project.frames.map((f, i) =>
              i === project.currentFrame
                ? { ...f, stickfigures: { ...f.stickfigures, [id]: { ...sf, ...updates } } }
                : f
            ),
          },
        });
      },
      
      updateNode: (stickfigureId, nodeId, updates) => {
        const { project } = get();
        if (!project) return;
        const frame = project.frames[project.currentFrame];
        const sf = frame.stickfigures[stickfigureId];
        if (!sf) return;
        const node = sf.nodes[nodeId];
        if (!node) return;
        set({
          project: {
            ...project,
            frames: project.frames.map((f, i) =>
              i === project.currentFrame
                ? {
                    ...f,
                    stickfigures: {
                      ...f.stickfigures,
                      [stickfigureId]: {
                        ...sf,
                        nodes: { ...sf.nodes, [nodeId]: { ...node, ...updates } },
                      },
                    },
                  }
                : f
            ),
          },
        });
      },
      
      setPlaying: (playing) => set({ isPlaying: playing }),
      setTool: (tool) => set({ selectedTool: tool }),
      setSelection: (selection) => set({ selection }),
      setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),
      toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
      toggleOnionSkin: () => set((state) => ({ showOnionSkin: !state.showOnionSkin })),
      
      updateSettings: (settings) => set((state) => ({
        settings: { ...state.settings, ...settings },
      })),
      
      updateAISettings: (settings) => set((state) => ({
        aiSettings: { ...state.aiSettings, ...settings },
      })),
      
      addConversation: (conversation) => set((state) => ({
        conversations: [...state.conversations, conversation],
      })),
      
      updateConversation: (id, updates) => set((state) => ({
        conversations: state.conversations.map(c =>
          c.id === id ? { ...c, ...updates } : c
        ),
      })),
      
      exportProject: (_exportSettings) => {
        set({ isExporting: true });
        // سيتم تنفيذ التصدير لاحقاً
        setTimeout(() => set({ isExporting: false }), 1000);
      },
      
      addToLibrary: (item) => {
        const { project } = get();
        if (!project) return;
        set({
          project: {
            ...project,
            library: {
              ...project.library,
              stickfigures: [...project.library.stickfigures, item],
            },
          },
        });
      },
      
      undo: () => {},
      redo: () => {},
    }),
    {
      name: 'sticknodes-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        aiSettings: state.aiSettings,
        savedProjects: state.savedProjects,
        settings: state.settings,
      }),
    }
  )
);

// تحميل المشاريع المحفوظة
export const loadSavedProjects = (): any[] => {
  try {
    return JSON.parse(localStorage.getItem('sticknodes-projects') || '[]');
  } catch {
    return [];
  }
};

export const loadProjectById = (id: string): any | null => {
  const projects = loadSavedProjects();
  return projects.find((p: any) => p.id === id) || null;
};
