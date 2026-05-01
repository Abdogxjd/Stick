import { useRef, useEffect, useCallback, useState } from 'react';
import { useProjectStore } from '../stores/projectStore';
import { CanvasEngine } from '../engine/canvasEngine';

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<CanvasEngine | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const project = useProjectStore(s => s.project);
  const currentFrame = project?.currentFrame ?? 0;
  const frame = project?.frames[currentFrame];
  const showGrid = useProjectStore(s => s.showGrid);
  const settings = useProjectStore(s => s.settings);
  const selection = useProjectStore(s => s.selection);
  const zoom = useProjectStore(s => s.zoom);
  const isPlaying = useProjectStore(s => s.isPlaying);
  
  const updateNode = useProjectStore(s => s.updateNode);
  const updateStickfigure = useProjectStore(s => s.updateStickfigure);
  const setSelection = useProjectStore(s => s.setSelection);
  
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 1, rotation: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastTouchDist, setLastTouchDist] = useState(0);
  
  // تحديث zoom من store
  useEffect(() => {
    setCamera(prev => ({ ...prev, zoom }));
  }, [zoom]);
  
  // تهيئة Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    
    const engine = new CanvasEngine(canvas);
    engineRef.current = engine;
    
    const resize = () => {
      const rect = container.getBoundingClientRect();
      engine.resize(rect.width, rect.height);
      render();
    };
    
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);
  
  // الرسم
  const render = useCallback(() => {
    const engine = engineRef.current;
    if (!engine || !frame) return;
    
    engine.drawFrame(frame, camera, {
      showGrid,
      gridSize: settings.gridSize,
      selectedId: selection?.id || undefined,
      selectedType: selection?.type || undefined,
    });
  }, [frame, camera, showGrid, settings.gridSize, selection]);
  
  useEffect(() => {
    render();
  }, [render]);
  
  // معالجة اللمس
  const getTouchPos = (e: React.TouchEvent | React.MouseEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top,
    };
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setLastTouchDist(dist);
      return;
    }
    
    const pos = getTouchPos(e);
    setIsDragging(true);
    setDragStart(pos);
    
    // التحقق من النقر على عقدة
    if (frame) {
      const engine = engineRef.current;
      if (!engine) return;
      
      const worldPos = engine.screenToWorld(pos.x, pos.y, camera);
      
      for (const sf of Object.values(frame.stickfigures)) {
        for (const node of Object.values(sf.nodes)) {
          const nodeWorldX = sf.x + node.x * sf.scale;
          const nodeWorldY = sf.y + node.y * sf.scale;
          const dist = Math.hypot(worldPos.x - nodeWorldX, worldPos.y - nodeWorldY);
          
          if (dist < 20 / camera.zoom) {
            setSelection({ type: 'node', id: node.id, stickfigureId: sf.id });
            return;
          }
        }
        
        // التحقق من النقر على الهيكل
        const dist = Math.hypot(worldPos.x - sf.x, worldPos.y - sf.y);
        if (dist < 50 / camera.zoom) {
          setSelection({ type: 'stickfigure', id: sf.id });
          return;
        }
      }
    }
    
    setSelection(null);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      
      if (lastTouchDist > 0) {
        const scale = dist / lastTouchDist;
        setCamera(prev => ({
          ...prev,
          zoom: Math.max(0.2, Math.min(5, prev.zoom * scale)),
        }));
      }
      setLastTouchDist(dist);
      return;
    }
    
    if (!isDragging) return;
    
    const pos = getTouchPos(e);
    const dx = pos.x - dragStart.x;
    const dy = pos.y - dragStart.y;
    
    if (selection?.type === 'node' && selection.stickfigureId) {
      // تحريك العقدة
      const engine = engineRef.current;
      if (!engine) return;
      
      const worldDx = dx / camera.zoom;
      const worldDy = dy / camera.zoom;
      
      const sf = frame?.stickfigures[selection.stickfigureId];
      const node = sf?.nodes[selection.id];
      if (node) {
        updateNode(selection.stickfigureId, selection.id, {
          x: node.x + worldDx,
          y: node.y + worldDy,
        });
      }
    } else if (selection?.type === 'stickfigure') {
      // تحريك الهيكل
      const worldDx = dx / camera.zoom;
      const worldDy = dy / camera.zoom;
      
      const sf = frame?.stickfigures[selection.id];
      if (sf) {
        updateStickfigure(selection.id, {
          x: sf.x + worldDx,
          y: sf.y + worldDy,
        });
      }
    } else {
      // تحريك الكاميرا
      setCamera(prev => ({
        ...prev,
        x: prev.x + dx / prev.zoom,
        y: prev.y + dy / prev.zoom,
      }));
    }
    
    setDragStart(pos);
  };
  
  const handleTouchEnd = () => {
    setIsDragging(false);
    setLastTouchDist(0);
  };
  
  // تشغيل الرسوم المتحركة
  useEffect(() => {
    if (!isPlaying || !project) return;
    
    let frameIndex = project.currentFrame;
    const interval = setInterval(() => {
      frameIndex = (frameIndex + 1) % project.frames.length;
      useProjectStore.getState().setCurrentFrame(frameIndex);
    }, 1000 / project.fps);
    
    return () => clearInterval(interval);
  }, [isPlaying, project]);
  
  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-[#0f0f1a]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      />
      
      {/* معلومات الكاميرا */}
      <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1 text-xs text-white/70 pointer-events-none">
        Zoom: {Math.round(camera.zoom * 100)}%
      </div>
      
      {/* عدد الإطارات */}
      <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1 text-xs text-white/70 pointer-events-none">
        Frame: {(currentFrame + 1)} / {project?.frames.length || 0}
      </div>
    </div>
  );
}
