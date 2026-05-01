// ==================== أنواع العقد والشرائح ====================

export type NodeType = 'main' | 'circle' | 'segment' | 'rounded' | 'triangle' | 'trapezoid' | 'polyfill';

export interface Node {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  parentId?: string;
  color: string;
  thickness: number;
  length: number;
  angle: number;
  isStatic: boolean;
  isStretchy: boolean;
  drawBehind: boolean;
  opacity: number;
  zIndex: number;
  name: string;
  children: string[];
}

export interface Stickfigure {
  id: string;
  name: string;
  nodes: Record<string, Node>;
  rootNodeId: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  color: string;
  createdAt: number;
}

// ==================== أنواع الإطارات والتحريك ====================

export interface Frame {
  id: number;
  stickfigures: Record<string, StickfigureState>;
  camera: CameraState;
  sounds: SoundRef[];
  delay: number;
}

export interface StickfigureState {
  id: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  nodes: Record<string, NodeState>;
}

export interface NodeState {
  id: string;
  x: number;
  y: number;
  angle: number;
  length: number;
  color: string;
  thickness: number;
  opacity: number;
}

export interface CameraState {
  x: number;
  y: number;
  zoom: number;
  rotation: number;
}

export interface SoundRef {
  id: string;
  soundId: string;
  volume: number;
  pitch: number;
}

// ==================== أنواع المشروع ====================

export interface Project {
  id: string;
  name: string;
  frames: Frame[];
  currentFrame: number;
  fps: number;
  width: number;
  height: number;
  backgroundColor: string;
  createdAt: number;
  updatedAt: number;
  thumbnail?: string;
  library: Library;
  settings: ProjectSettings;
}

export interface ProjectSettings {
  fps: number;
  tweening: boolean;
  tweenAmount: number;
  tweenMode: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  onionSkinning: boolean;
  onionSkinCount: number;
  showGrid: boolean;
  gridSize: number;
  snapToGrid: boolean;
  verticalMode: boolean;
  screenPadding: number;
}

export interface Library {
  stickfigures: LibraryStickfigure[];
  sprites: LibrarySprite[];
  movieclips: LibraryMovieclip[];
  sounds: LibrarySound[];
}

export interface LibraryStickfigure {
  id: string;
  name: string;
  data: Stickfigure;
  thumbnail?: string;
  category: string;
}

export interface LibrarySprite {
  id: string;
  name: string;
  src: string;
  width: number;
  height: number;
  anchorX: number;
  anchorY: number;
}

export interface LibraryMovieclip {
  id: string;
  name: string;
  frames: Frame[];
  fps: number;
  loopMode: 'once' | 'loop' | 'ping-pong';
}

export interface LibrarySound {
  id: string;
  name: string;
  src: string;
  duration: number;
}

// ==================== أنواع أدوات التحديد ====================

export type ToolMode = 'normal' | 'pan' | 'camera' | 'add-node' | 'add-segment' | 'select';

export interface Selection {
  type: 'node' | 'stickfigure' | 'segment' | 'none';
  id: string;
  stickfigureId?: string;
}

// ==================== أنواع الذكاء الاصطناعي ====================

export interface AISettings {
  apiKey: string;
  model: string;
  enabled: boolean;
}

export interface AIConversation {
  id: string;
  projectId: string;
  messages: AIMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;
  attachments?: AIAttachment[];
}

export interface AIAttachment {
  type: 'image' | 'json' | 'text';
  data: string;
  name: string;
}

// ==================== أنواع التصدير ====================

export type ExportFormat = 'gif' | 'mp4' | 'png-sequence';

export interface ExportSettings {
  format: ExportFormat;
  width: number;
  height: number;
  fps: number;
  quality: number;
  startFrame: number;
  endFrame: number;
  includeSound: boolean;
}

// ==================== أنواع عامة ====================

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ViewTransform {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}
