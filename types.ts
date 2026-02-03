export enum GameStatus {
  START_SCREEN = 'START_SCREEN',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE',
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface PlayerEntity {
  pos: Vector2;
  vel: Vector2;
  size: Dimensions;
  isGrounded: boolean;
  facingRight: boolean;
  runFrame: number; // For animation
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  type: 'ground' | 'obstacle' | 'school';
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}
