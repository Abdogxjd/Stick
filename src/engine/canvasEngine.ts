import type { Frame, NodeState, CameraState } from '../types';

export class CanvasEngine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number = 0;
  height: number = 0;
  dpr: number = 1;
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2d context');
    this.ctx = context;
    this.dpr = window.devicePixelRatio || 1;
  }
  
  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.canvas.width = Math.floor(width * this.dpr);
    this.canvas.height = Math.floor(height * this.dpr);
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }
  
  clear(color: string = '#1a1a2e') {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
  
  drawGrid(camera: CameraState, gridSize: number = 20, showGrid: boolean = true) {
    if (!showGrid) return;
    
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    
    const offsetX = camera.x * camera.zoom;
    const offsetY = camera.y * camera.zoom;
    const scaledGrid = gridSize * camera.zoom;
    
    const startX = ((offsetX % scaledGrid) + scaledGrid) % scaledGrid;
    const startY = ((offsetY % scaledGrid) + scaledGrid) % scaledGrid;
    
    for (let x = startX; x < w; x += scaledGrid) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    
    for (let y = startY; y < h; y += scaledGrid) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    
    ctx.restore();
  }
  
  drawFrame(
    frame: Frame,
    camera: CameraState,
    options: {
      showGrid?: boolean;
      gridSize?: number;
      selectedId?: string | null;
      selectedType?: string;
    } = {}
  ) {
    const { showGrid = true, gridSize = 20 } = options;
    
    this.clear();
    this.drawGrid(camera, gridSize, showGrid);
    
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(this.width / 2, this.height / 2);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-this.width / 2 + camera.x, -this.height / 2 + camera.y);
    
    // رسم الهياكل
    Object.values(frame.stickfigures).forEach(sf => {
      this.drawStickfigure(sf, options.selectedId, options.selectedType);
    });
    
    ctx.restore();
  }
  
  drawStickfigure(
    sf: {
      id: string;
      x: number;
      y: number;
      scale: number;
      rotation: number;
      opacity: number;
      visible: boolean;
      nodes: Record<string, NodeState>;
    },
    selectedId?: string | null,
    selectedType?: string
  ) {
    if (!sf.visible) return;
    
    const ctx = this.ctx;
    const nodes = Object.values(sf.nodes);
    
    ctx.save();
    ctx.translate(sf.x, sf.y);
    ctx.rotate((sf.rotation * Math.PI) / 180);
    ctx.scale(sf.scale, sf.scale);
    ctx.globalAlpha = sf.opacity;
    
    // رسم الشرائح بين العقد
    nodes.forEach(node => {
      if (node.opacity <= 0) return;
      this.drawNodeSegment(node);
    });
    
    // رسم العقد
    nodes.forEach(node => {
      if (node.opacity <= 0) return;
      const isSelected = selectedType === 'node' && selectedId === node.id;
      this.drawNodePoint(node, isSelected);
    });
    
    ctx.restore();
  }
  
  drawNodeSegment(node: NodeState) {
    const ctx = this.ctx;
    
    ctx.save();
    ctx.globalAlpha = node.opacity * 0.8;
    ctx.strokeStyle = node.color;
    ctx.lineWidth = node.thickness;
    ctx.lineCap = 'round';
    
    // رسم خط من المركز إلى موقع العقدة
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(node.x, node.y);
    ctx.stroke();
    
    ctx.restore();
  }
  
  drawNodePoint(node: NodeState, isSelected: boolean = false) {
    const ctx = this.ctx;
    
    ctx.save();
    ctx.globalAlpha = node.opacity;
    ctx.fillStyle = node.color;
    
    const radius = Math.max(4, node.thickness / 3);
    
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    if (isSelected) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius + 4, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.strokeStyle = '#ff6b6b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius + 6, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    ctx.restore();
  }
  
  worldToScreen(wx: number, wy: number, camera: CameraState): { x: number; y: number } {
    return {
      x: (wx + camera.x) * camera.zoom + this.width / 2 * (1 - camera.zoom),
      y: (wy + camera.y) * camera.zoom + this.height / 2 * (1 - camera.zoom),
    };
  }
  
  screenToWorld(sx: number, sy: number, camera: CameraState): { x: number; y: number } {
    return {
      x: (sx - this.width / 2 * (1 - camera.zoom)) / camera.zoom - camera.x,
      y: (sy - this.height / 2 * (1 - camera.zoom)) / camera.zoom - camera.y,
    };
  }
}
