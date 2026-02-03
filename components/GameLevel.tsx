import React, { useRef, useEffect } from 'react';
import { GameStatus, PlayerEntity, Platform, Particle } from '../types';
import { 
  GRAVITY, FRICTION, MOVE_SPEED, MAX_SPEED, JUMP_FORCE, 
  CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y, COLORS, LEVEL_LENGTH, 
  DAY_CYCLE_DURATION 
} from '../constants';

interface GameLevelProps {
  status: GameStatus;
  onPause: () => void;
  onWin: () => void;
}

interface WindowData {
  rx: number; // Relative X to building
  ry: number; // Relative Y to building (usually negative from bottom)
  w: number;
  h: number;
  shutoffTime: number; // 0.0 to 1.0 (progress of day when this light turns off)
}

interface SceneryObject {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'building_far' | 'house_mid' | 'tree' | 'lamp';
  color: string;
  windows?: WindowData[];
}

export const GameLevel: React.FC<GameLevelProps> = ({ status, onPause, onWin }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  const gameState = useRef({
    gameTime: 0, 
    intro: { active: true, timer: 0 }, // Intro cutscene state
    player: {
      pos: { x: 280, y: GROUND_Y - 100 }, // Start position slightly further out
      vel: { x: 0, y: 0 },
      size: { width: 30, height: 60 },
      isGrounded: false,
      facingRight: true,
      runFrame: 0,
    } as PlayerEntity,
    camera: { x: 0, y: 0 },
    keys: { left: false, right: false, jump: false },
    particles: [] as Particle[],
    platforms: [] as Platform[],
    scenery: [] as SceneryObject[],
    stars: [] as {x: number, y: number, size: number, blink: number}[],
    schoolDoor: { x: LEVEL_LENGTH - 300, width: 150, height: 200 },
    startHouse: { x: -100, width: 350, height: 400 }, // Big warm house at start
    levelCompleteTriggered: false,
  });

  // Initialize Level & Scenery
  useEffect(() => {
    const s = gameState.current;
    
    // Reset state on mount/remount
    s.intro = { active: true, timer: 0 };
    s.player.pos.x = 280;
    s.player.facingRight = true;
    
    // 1. Generate Stars
    s.stars = [];
    for (let i = 0; i < 100; i++) {
        s.stars.push({
            x: Math.random() * CANVAS_WIDTH,
            y: Math.random() * (CANVAS_HEIGHT / 2),
            size: Math.random() * 2 + 1,
            blink: Math.random()
        });
    }

    // 2. Generate Platforms (The Road)
    // REMOVED OBSTACLES: Only the ground exists now.
    s.platforms = [
      { x: -500, y: GROUND_Y, width: LEVEL_LENGTH + 1000, height: 300, color: COLORS.ground, type: 'ground' },
    ];

    // 3. Generate Scenery (Parallax Layers)
    s.scenery = [];
    
    // Huge Background Buildings (Far)
    for (let i = 0; i < LEVEL_LENGTH; i += 400) {
        if (Math.random() > 0.3) {
            const width = 200 + Math.random() * 200;
            const height = 400 + Math.random() * 300;
            const bX = i;
            const bY = GROUND_Y;
            
            // Generate static windows for this building
            const windows: WindowData[] = [];
            // Grid layout for windows
            for(let wy = 20; wy < height - 20; wy += 40) {
                // Left column
                if (Math.random() > 0.4) {
                    windows.push({
                        rx: 20,
                        ry: -wy,
                        w: 10,
                        h: 15,
                        shutoffTime: 0.2 + Math.random() * 0.6 // Lights turn off between 20% and 80% of day cycle
                    });
                }
                // Right column
                if (Math.random() > 0.4) {
                    windows.push({
                        rx: width - 30,
                        ry: -wy,
                        w: 10,
                        h: 15,
                        shutoffTime: 0.2 + Math.random() * 0.6
                    });
                }
                // Middle column (for wide buildings)
                if (width > 300 && Math.random() > 0.4) {
                    windows.push({
                        rx: width / 2 - 5,
                        ry: -wy,
                        w: 10,
                        h: 15,
                        shutoffTime: 0.2 + Math.random() * 0.6
                    });
                }
            }

            s.scenery.push({
                x: bX,
                y: bY,
                width: width,
                height: height,
                type: 'building_far',
                color: '#1e1b4b',
                windows: windows
            });
        }
    }

    // Midground Houses & Trees
    for (let i = 0; i < LEVEL_LENGTH; i += 250) {
         // Don't spawn scenery too close to the start house to avoid overlap clutter
         if (i < 400) continue;

         const r = Math.random();
         if (r > 0.5) {
             const hWidth = 120;
             const hHeight = 150 + Math.random() * 50;
             
             // Simple windows for houses
             const windows: WindowData[] = [];
             windows.push({ rx: 20, ry: -hHeight + 60, w: 20, h: 25, shutoffTime: 0.3 + Math.random() * 0.4 });
             if (Math.random() > 0.5) {
                windows.push({ rx: hWidth - 40, ry: -hHeight + 60, w: 20, h: 25, shutoffTime: 0.3 + Math.random() * 0.4 });
             }

             s.scenery.push({
                x: i + 100,
                y: GROUND_Y,
                width: hWidth,
                height: hHeight,
                type: 'house_mid',
                color: '#334155',
                windows: windows
             });
         } else {
             s.scenery.push({
                x: i + 100,
                y: GROUND_Y,
                width: 80,
                height: 250 + Math.random() * 100,
                type: 'tree',
                color: '#0f172a'
             });
         }
    }

  }, []);

  // Input Handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== GameStatus.PLAYING) return;
      if (gameState.current.intro.active) return; // Block input during intro

      switch (e.code) {
        case 'KeyA': gameState.current.keys.left = true; break;
        case 'KeyD': gameState.current.keys.right = true; break;
        case 'Space': 
          if (!gameState.current.keys.jump && gameState.current.player.isGrounded) {
             gameState.current.player.vel.y = JUMP_FORCE;
             gameState.current.player.isGrounded = false;
          }
          gameState.current.keys.jump = true; 
          break;
        case 'Escape': onPause(); break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Allow escape even during intro to pause, but maybe not inputs?
      // Actually standardizing to blocked inputs is fine.
      
      switch (e.code) {
        case 'KeyA': gameState.current.keys.left = false; break;
        case 'KeyD': gameState.current.keys.right = false; break;
        case 'Space': gameState.current.keys.jump = false; break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [status, onPause]);

  // Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = () => {
      if (status === GameStatus.PLAYING) {
        update();
      }
      draw(ctx);
      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [status]);

  const update = () => {
    const state = gameState.current;
    const { player, platforms, keys, schoolDoor, intro } = state;

    // Time Progression
    state.gameTime++; 
    if (state.gameTime > DAY_CYCLE_DURATION) state.gameTime = DAY_CYCLE_DURATION;

    // --- INTRO LOGIC ---
    if (intro.active) {
        intro.timer++;
        
        // Sequence: 
        // 0-60: Walk out / Stand (implied)
        // 60-260: Turn Head & Listen
        // 260+: Turn back and get control
        
        if (intro.timer > 60 && intro.timer < 260) {
            player.facingRight = false; // Look back at house
        } else {
            player.facingRight = true; // Look forward
        }

        if (intro.timer > 300) {
            intro.active = false;
        }

        // Apply Gravity only (no run input)
        player.vel.x = 0;
        player.vel.y += GRAVITY;
    } else {
        // --- NORMAL GAMEPLAY ---
        // Movement
        if (keys.left) {
            player.vel.x -= MOVE_SPEED;
            player.facingRight = false;
        }
        if (keys.right) {
            player.vel.x += MOVE_SPEED;
            player.facingRight = true;
        }

        player.vel.x *= FRICTION;
        player.vel.y += GRAVITY;
        if (player.vel.x > MAX_SPEED) player.vel.x = MAX_SPEED;
        if (player.vel.x < -MAX_SPEED) player.vel.x = -MAX_SPEED;
    }

    // Apply Velocity
    player.pos.x += player.vel.x;
    player.pos.y += player.vel.y;

    // Anim Frame
    if (Math.abs(player.vel.x) > 0.5 && player.isGrounded) {
        player.runFrame += 0.2;
    } else {
        player.runFrame = 0;
    }

    // Collision
    player.isGrounded = false;
    for (const plat of platforms) {
      if (
        player.pos.x < plat.x + plat.width &&
        player.pos.x + player.size.width > plat.x &&
        player.pos.y < plat.y + plat.height &&
        player.pos.y + player.size.height > plat.y
      ) {
        const prevY = player.pos.y - player.vel.y;
        if (prevY + player.size.height <= plat.y + 15) { 
            player.pos.y = plat.y - player.size.height;
            player.vel.y = 0;
            player.isGrounded = true;
        } else if (player.vel.y < 0 && prevY >= plat.y + plat.height) {
            player.pos.y = plat.y + plat.height;
            player.vel.y = 0;
        } else {
             if (player.vel.x > 0) {
                 player.pos.x = plat.x - player.size.width;
                 player.vel.x = 0;
             } else if (player.vel.x < 0) {
                 player.pos.x = plat.x + plat.width;
                 player.vel.x = 0;
             }
        }
      }
    }

    // Camera (Look ahead)
    const lookAhead = player.facingRight ? 100 : -50;
    const targetCamX = player.pos.x - CANVAS_WIDTH / 3 + lookAhead;
    const maxCamX = LEVEL_LENGTH - CANVAS_WIDTH + 400;
    const clampedTarget = Math.max(0, Math.min(targetCamX, maxCamX));
    state.camera.x += (clampedTarget - state.camera.x) * 0.08;

    // Win Check
    if (player.pos.x > schoolDoor.x && !state.levelCompleteTriggered) {
        state.levelCompleteTriggered = true;
        onWin();
    }
  };

  // --- DRAWING HELPERS ---

  const drawSoftRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8);
    ctx.fill();
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    const state = gameState.current;
    const { player, camera, gameTime, startHouse, intro } = state;

    // --- 1. SKY & DAY/NIGHT CYCLE ---
    const progress = Math.min(1, gameTime / DAY_CYCLE_DURATION); 
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    
    if (progress < 0.5) {
        const t = progress * 2;
        gradient.addColorStop(0, '#020617'); 
        gradient.addColorStop(1, `rgb(${30 + t*20}, ${27 + t*20}, ${75 + t*50})`); 
    } else {
        const t = (progress - 0.5) * 2;
        gradient.addColorStop(0, `rgb(${2 + t*94}, ${6 + t*159}, ${23 + t*227})`); 
        gradient.addColorStop(1, `rgb(${49 + t*206}, ${46 + t*165}, ${129 - t*50})`);
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Celestial Bodies
    ctx.save();
    const moonY = 100 + progress * 300;
    const moonAlpha = 1 - progress;
    if (moonAlpha > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${moonAlpha})`;
        ctx.beginPath();
        ctx.arc(CANVAS_WIDTH - 200, moonY, 60, 0, Math.PI * 2);
        ctx.fill();
    }
    if (progress < 0.6) {
        ctx.fillStyle = 'white';
        state.stars.forEach(star => {
            const alpha = (1 - (progress * 1.5)) * (0.5 + Math.sin(Date.now() * 0.005 + star.blink) * 0.5);
            if (alpha > 0) {
                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        ctx.globalAlpha = 1;
    }
    if (progress > 0.3) {
        const sunY = CANVAS_HEIGHT + 100 - (progress - 0.3) * 600;
        const sunAlpha = (progress - 0.3) * 1.5;
        ctx.fillStyle = `rgba(253, 224, 71, ${sunAlpha})`;
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 40;
        ctx.beginPath();
        ctx.arc(400, sunY, 80, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
    ctx.restore();


    // --- 2. BACKGROUND SCENERY ---
    ctx.save();
    ctx.translate(-camera.x * 0.1, 0);
    state.scenery.filter(s => s.type === 'building_far').forEach(b => {
        ctx.fillStyle = progress < 0.5 ? '#0f172a' : '#1e293b'; 
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(b.x, b.y - b.height);
        ctx.lineTo(b.x + b.width, b.y - b.height - 10);
        ctx.lineTo(b.x + b.width, b.y);
        ctx.fill();
        
        // Draw Pre-Calculated Windows (No flickering)
        if (b.windows) {
            b.windows.forEach(w => {
                // If current progress is less than the window's unique shutoff time, it's ON.
                if (progress < w.shutoffTime) {
                    ctx.fillStyle = progress < 0.5 ? 'rgba(253, 224, 71, 0.5)' : 'rgba(253, 224, 71, 0.2)';
                    ctx.fillRect(b.x + w.rx, b.y + w.ry, w.w, w.h);
                } else {
                    // Light is off - draw dark rectangle
                    ctx.fillStyle = 'rgba(0,0,0,0.3)';
                    ctx.fillRect(b.x + w.rx, b.y + w.ry, w.w, w.h);
                }
            });
        }
    });
    ctx.restore();

    ctx.save();
    ctx.translate(-camera.x * 0.4, 0);
    state.scenery.filter(s => s.type !== 'building_far').forEach(obj => {
        const lightingTint = progress > 0.5 ? 20 : 0;
        if (obj.type === 'tree') {
            ctx.fillStyle = '#1c1917';
            ctx.fillRect(obj.x + obj.width/2 - 10, obj.y - 40, 20, 40);
            ctx.fillStyle = `rgb(${20 + lightingTint}, ${30 + lightingTint}, ${40 + lightingTint})`;
            ctx.beginPath();
            ctx.ellipse(obj.x + obj.width/2, obj.y - obj.height + 40, obj.width, obj.height, 0, 0, Math.PI*2);
            ctx.fill();
        } else if (obj.type === 'house_mid') {
            ctx.fillStyle = `rgb(${40 + lightingTint}, ${50 + lightingTint}, ${60 + lightingTint})`;
            ctx.fillRect(obj.x, obj.y - obj.height, obj.width, obj.height);
            ctx.fillStyle = `rgb(${30 + lightingTint}, ${35 + lightingTint}, ${45 + lightingTint})`;
            ctx.beginPath();
            ctx.moveTo(obj.x - 10, obj.y - obj.height);
            ctx.lineTo(obj.x + obj.width/2, obj.y - obj.height - 40);
            ctx.lineTo(obj.x + obj.width + 10, obj.y - obj.height);
            ctx.fill();

            // House windows
            if (obj.windows) {
                obj.windows.forEach(w => {
                     if (progress < w.shutoffTime) {
                        ctx.fillStyle = 'rgba(253, 224, 71, 0.7)';
                        ctx.fillRect(obj.x + w.rx, obj.y + w.ry, w.w, w.h);
                     } else {
                        ctx.fillStyle = 'rgba(10, 10, 20, 0.5)';
                        ctx.fillRect(obj.x + w.rx, obj.y + w.ry, w.w, w.h);
                     }
                });
            }
        }
    });
    ctx.restore();


    // --- 3. WORLD SPACE ---
    ctx.save();
    ctx.translate(-camera.x, 0);

    // DRAW START HOUSE (The Player's Home)
    // Warm colors, inviting
    const sh = startHouse;
    const houseColor = '#7c2d12'; // Warm brown
    const houseRoofColor = '#9a3412'; // Lighter warm brown
    const windowLight = '#fef3c7'; // Warm light
    
    // Main Body
    drawSoftRect(ctx, sh.x, GROUND_Y - sh.height, sh.width, sh.height, houseColor);
    // Roof (Triangle)
    ctx.fillStyle = houseRoofColor;
    ctx.beginPath();
    ctx.moveTo(sh.x - 20, GROUND_Y - sh.height);
    ctx.lineTo(sh.x + sh.width/2, GROUND_Y - sh.height - 100);
    ctx.lineTo(sh.x + sh.width + 20, GROUND_Y - sh.height);
    ctx.fill();
    // Door (Open with light)
    const doorW = 70;
    const doorH = 120;
    const doorX = sh.x + sh.width - 120;
    const doorY = GROUND_Y - doorH;
    
    // Light spilling from door
    ctx.save();
    ctx.fillStyle = 'rgba(253, 224, 71, 0.3)';
    ctx.beginPath();
    ctx.moveTo(doorX, doorY + doorH);
    ctx.lineTo(doorX + doorW, doorY + doorH);
    ctx.lineTo(doorX + doorW + 100, doorY + doorH + 50); // Light spills on ground
    ctx.lineTo(doorX - 100, doorY + doorH + 50);
    ctx.fill();
    ctx.restore();

    // The Door Opening itself (Bright warm light)
    ctx.fillStyle = '#fcd34d'; 
    ctx.fillRect(doorX, doorY, doorW, doorH);
    
    // Windows
    drawSoftRect(ctx, sh.x + 40, GROUND_Y - 250, 60, 80, windowLight);
    drawSoftRect(ctx, sh.x + 140, GROUND_Y - 250, 60, 80, windowLight);


    // DRAW DESTINATION (School)
    const school = state.schoolDoor;
    drawSoftRect(ctx, school.x, GROUND_Y - 300, 300, 300, COLORS.school);
    ctx.fillStyle = '#fff1f2';
    ctx.fillRect(school.x + 20, GROUND_Y - 300, 20, 300);
    ctx.fillRect(school.x + 260, GROUND_Y - 300, 20, 300);
    ctx.fillStyle = '#4c0519'; 
    ctx.beginPath();
    ctx.roundRect(school.x + 100, GROUND_Y - 140, 100, 140, [10, 10, 0, 0]);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.font = 'bold 30px Fredoka';
    ctx.fillText('ШКОЛА', school.x + 95, GROUND_Y - 200);

    // Platforms / Ground
    state.platforms.forEach(plat => {
        ctx.fillStyle = COLORS.ground;
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
        ctx.fillStyle = COLORS.groundHighlight;
        ctx.fillRect(plat.x, plat.y, plat.width, 8);
    });

    // --- SPEECH BUBBLE (Intro) ---
    if (intro.active && intro.timer > 80 && intro.timer < 260) {
        const bx = doorX + doorW/2 + 20;
        const by = doorY - 40;
        const bW = 200;
        const bH = 70;

        ctx.save();
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        
        // Bubble Body
        ctx.beginPath();
        ctx.roundRect(bx, by - bH, bW, bH, 10);
        ctx.fill();
        ctx.stroke();
        
        // Tail
        ctx.beginPath();
        ctx.moveTo(bx + 10, by);
        ctx.lineTo(bx - 10, by + 20); // Pointing to door
        ctx.lineTo(bx + 30, by);
        ctx.fill();
        ctx.stroke(); // Stroke tail separately or combine path, separation is fine for sketch style

        // Text
        ctx.fillStyle = 'black';
        ctx.font = 'bold 16px Fredoka';
        ctx.textAlign = 'center';
        ctx.fillText("беги в школу!", bx + bW/2, by - bH + 30);
        ctx.fillText("а то опоздаешь!", bx + bW/2, by - bH + 50);
        ctx.restore();
    }


    // --- PLAYER (The Child) ---
    const { pos, size, facingRight, runFrame } = player;
    const centerX = pos.x + size.width / 2;
    const bottomY = pos.y + size.height;
    const bounceY = Math.abs(Math.sin(runFrame)) * 4;
    const drawY = pos.y - bounceY;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(centerX, bottomY, 15, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Backpack
    ctx.fillStyle = COLORS.backpack;
    const backpackOffset = facingRight ? -12 : 12;
    drawSoftRect(ctx, centerX + backpackOffset - 10, drawY + 25, 20, 25, COLORS.backpack);

    // Legs
    ctx.fillStyle = COLORS.playerPants;
    if (player.isGrounded) {
        const stride = Math.sin(runFrame) * 8;
        ctx.fillRect(centerX - 4 - stride, drawY + 45, 6, 15);
        ctx.fillRect(centerX - 4 + stride, drawY + 45, 6, 15);
    } else {
        ctx.fillRect(centerX - 6, drawY + 40, 6, 12);
        ctx.fillRect(centerX + 2, drawY + 45, 6, 12);
    }

    // Body
    ctx.fillStyle = COLORS.playerClothes;
    ctx.beginPath();
    ctx.roundRect(centerX - 14, drawY + 20, 28, 30, 8);
    ctx.fill();

    // Head
    ctx.fillStyle = COLORS.playerSkin;
    ctx.beginPath();
    ctx.arc(centerX, drawY + 10, 18, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = 'black';
    const eyeX = facingRight ? 4 : -4;
    ctx.beginPath();
    ctx.arc(centerX + eyeX, drawY + 8, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Hood/Hat
    ctx.fillStyle = '#eab308'; 
    ctx.beginPath();
    ctx.arc(centerX - eyeX*1.5, drawY + 10, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.playerSkin;
    ctx.beginPath();
    ctx.arc(centerX + eyeX*0.5, drawY + 10, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(centerX + eyeX + 2, drawY + 8, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="block w-full h-full object-contain bg-[#020617]"
    />
  );
};