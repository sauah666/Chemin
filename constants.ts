export const GRAVITY = 0.6;
export const FRICTION = 0.8;
export const MOVE_SPEED = 0.5; // Slightly slower for more "weighty" feel
export const MAX_SPEED = 7;
export const JUMP_FORCE = -13;

export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;

export const LEVEL_LENGTH = 5000; // Longer road
export const GROUND_Y = 620;

// Duration of the "Night to Day" cycle in frames (60fps). 
// 60 seconds * 60 frames = 3600 frames.
export const DAY_CYCLE_DURATION = 3600; 

export const COLORS = {
  // We will generate Sky dynamically, these are fallbacks/object colors
  ground: '#1e293b', // Dark asphalt/path
  groundHighlight: '#334155',
  
  // Childlike palette
  playerSkin: '#fca5a5',
  playerClothes: '#facc15', // Yellow raincoat/hoodie
  playerPants: '#374151',
  backpack: '#ef4444',
  
  obstacle: '#475569', // Cardboard box / stone color
  school: '#e11d48',
  
  // UI
  focusBar: '#fcd34d',
  xpBar: '#60a5fa',
};