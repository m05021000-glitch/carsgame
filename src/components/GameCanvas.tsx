import React, { useRef, useEffect } from 'react';
import { TruckConfig, RoadEntity, FloatingText } from '../types/game';

interface GameCanvasProps {
  truck: TruckConfig;
  speed: number; // in km/h
  isNitro: boolean;
  hasShield: boolean;
  lane: number; // 0, 1, 2
  roadEntities: RoadEntity[];
  floatingTexts: FloatingText[];
  distanceTraveled: number;
  targetDistance: number;
  magnetActive: boolean;
  screenShake: number;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  truck,
  speed,
  isNitro,
  hasShield,
  lane,
  roadEntities,
  floatingTexts,
  distanceTraveled,
  targetDistance,
  magnetActive,
  screenShake
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Smooth interpolated player visual lane position (0, 1, 2)
  const currentVisualLaneRef = useRef<number>(lane);
  const roadOffsetRef = useRef<number>(0);
  const skylineOffsetRef = useRef<number>(0);

  // Particles system (exhaust, dust, nitro sparks)
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    alpha: number;
    life: number;
    maxLife: number;
  }>>([]);

  // Sync visual lane smoothly
  useEffect(() => {
    // Interpolate in animation loop
  }, [lane]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Handle canvas resize
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Screen shake translation
      if (screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * screenShake * 8;
        const shakeY = (Math.random() - 0.5) * screenShake * 8;
        ctx.translate(shakeX, shakeY);
      }

      // Smooth lane transition
      currentVisualLaneRef.current += (lane - currentVisualLaneRef.current) * Math.min(1, dt * 14);

      // Parallax scroll updates
      const speedFactor = speed / 3.6; // m/s
      roadOffsetRef.current = (roadOffsetRef.current + speedFactor * dt * 18) % 100;
      skylineOffsetRef.current = (skylineOffsetRef.current + speedFactor * dt * 0.8) % 600;

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);

      // ==========================================
      // 1. Sky & Afternoon Atmosphere
      // ==========================================
      const skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.45);
      if (isNitro) {
        skyGradient.addColorStop(0, '#0F172A');
        skyGradient.addColorStop(0.5, '#0284C7');
        skyGradient.addColorStop(1, '#38BDF8');
      } else {
        skyGradient.addColorStop(0, '#1E293B');
        skyGradient.addColorStop(0.3, '#334155');
        skyGradient.addColorStop(0.7, '#64748B');
        skyGradient.addColorStop(1, '#94A3B8');
      }
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, width, height * 0.45);

      // Afternoon Sun / Golden Hour Lens Glow
      ctx.save();
      const sunGradient = ctx.createRadialGradient(width * 0.82, height * 0.16, 5, width * 0.82, height * 0.16, 90);
      sunGradient.addColorStop(0, 'rgba(254, 240, 138, 0.9)');
      sunGradient.addColorStop(0.4, 'rgba(251, 191, 36, 0.35)');
      sunGradient.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = sunGradient;
      ctx.beginPath();
      ctx.arc(width * 0.82, height * 0.16, 90, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // ==========================================
      // 2. Parallax Distant City Skyline
      // ==========================================
      const horizonY = height * 0.42;
      ctx.save();
      ctx.fillStyle = '#1E293B';
      const skylineX = -skylineOffsetRef.current;
      for (let x = skylineX; x < width + 600; x += 600) {
        drawCityBlock(ctx, x, horizonY);
      }
      ctx.restore();

      // ==========================================
      // 3. 3D-Perspected Road & Lanes
      // ==========================================
      const roadTopWidth = width * 0.42;
      const roadBottomWidth = width * 0.94;
      const roadTopX = (width - roadTopWidth) / 2;
      const roadBottomX = (width - roadBottomWidth) / 2;

      // Road Shoulder Grass / Sidewalk
      const grassGrad = ctx.createLinearGradient(0, horizonY, 0, height);
      grassGrad.addColorStop(0, '#334155');
      grassGrad.addColorStop(1, '#1E293B');
      ctx.fillStyle = grassGrad;
      ctx.fillRect(0, horizonY, width, height - horizonY);

      // Asphalt Surface (Trapezoid Road)
      ctx.beginPath();
      ctx.moveTo(roadTopX, horizonY);
      ctx.lineTo(roadTopX + roadTopWidth, horizonY);
      ctx.lineTo(roadBottomX + roadBottomWidth, height);
      ctx.lineTo(roadBottomX, height);
      ctx.closePath();
      ctx.fillStyle = '#0F172A';
      ctx.fill();

      // Road Borders (Yellow / White Curbs)
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#F59E0B';
      ctx.stroke();

      // Guard rails
      drawGuardRails(ctx, roadTopX, roadBottomX, roadTopWidth, roadBottomWidth, horizonY, height, roadOffsetRef.current);

      // Lane dividers (3 Lanes -> 2 Dividers)
      for (let div = 1; div <= 2; div++) {
        const topRatio = div / 3;
        const bottomRatio = div / 3;
        const xTop = roadTopX + roadTopWidth * topRatio;
        const xBottom = roadBottomX + roadBottomWidth * bottomRatio;

        ctx.save();
        ctx.setLineDash([16, 22]);
        ctx.lineDashOffset = -roadOffsetRef.current * 1.8;
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.beginPath();
        ctx.moveTo(xTop, horizonY);
        ctx.lineTo(xBottom, height);
        ctx.stroke();
        ctx.restore();
      }

      // ==========================================
      // 4. Finish Line or Checkpoint (if in sight)
      // ==========================================
      if (targetDistance > 0) {
        const distRemaining = targetDistance - distanceTraveled;
        if (distRemaining < 250 && distRemaining > -10) {
          // Perspective scale for finish line
          const progress01 = 1 - Math.max(0, distRemaining) / 250;
          const bannerY = horizonY + (height - horizonY) * (progress01 * 0.95);
          const bannerScale = 0.4 + progress01 * 0.6;
          drawFinishBanner(ctx, width / 2, bannerY, bannerScale, distRemaining <= 0);
        }
      }

      // ==========================================
      // 5. Road Entities (Collectibles & Obstacles)
      // ==========================================
      // Sort entities by distance so furthest are drawn first
      const sortedEntities = [...roadEntities].sort((a, b) => b.y - a.y);

      for (const ent of sortedEntities) {
        if (ent.collected) continue;
        const relDist = ent.y - distanceTraveled;
        // Only render entities ahead of player (0m to 120m)
        if (relDist > 1 && relDist < 120) {
          const depthT = 1 - relDist / 120; // 0 = at horizon, 1 = at player level
          // Apply non-linear perspective curve
          const perspY = horizonY + (height - horizonY) * Math.pow(depthT, 1.4);
          
          const currentRoadW = roadTopWidth + (roadBottomWidth - roadTopWidth) * depthT;
          const currentRoadLeft = roadTopX + (roadBottomX - roadTopX) * depthT;
          const laneWidth = currentRoadW / 3;
          const entX = currentRoadLeft + laneWidth * (ent.lane + 0.5) + (ent.xOffset || 0);
          const entScale = 0.35 + depthT * 0.75;

          drawRoadItem(ctx, ent.type, entX, perspY, entScale, time);
        }
      }

      // ==========================================
      // 6. Player Truck Rendering
      // ==========================================
      const playerY = height * 0.78;
      const playerT = (playerY - horizonY) / (height - horizonY);
      const playerRoadW = roadTopWidth + (roadBottomWidth - roadTopWidth) * playerT;
      const playerRoadLeft = roadTopX + (roadBottomX - roadTopX) * playerT;
      const playerLaneW = playerRoadW / 3;
      
      const playerX = playerRoadLeft + playerLaneW * (currentVisualLaneRef.current + 0.5);
      const truckScale = 1.0;

      // Draw Player Shadow
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(playerX, playerY + 28, 48 * truckScale, 14 * truckScale, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Shield Aura
      if (hasShield) {
        ctx.save();
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#0284C7';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.ellipse(playerX, playerY, 65, 45, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Magnet Aura Pulse
      if (magnetActive) {
        ctx.save();
        const pulse = (Math.sin(time * 0.008) + 1) * 0.5;
        ctx.strokeStyle = `rgba(245, 158, 11, ${0.4 + pulse * 0.4})`;
        ctx.lineWidth = 2.5;
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.ellipse(playerX, playerY, 80 + pulse * 20, 50 + pulse * 15, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Nitro & High-Speed Exhaust Particles
      if (isNitro || speed > 90) {
        const particleCount = isNitro ? 3 : 1;
        for (let p = 0; p < particleCount; p++) {
          particlesRef.current.push({
            x: playerX + (Math.random() - 0.5) * 35,
            y: playerY + 20,
            vx: (Math.random() - 0.5) * 1.5,
            vy: 2 + Math.random() * 4 + (speed / 40),
            size: 3 + Math.random() * 6,
            color: isNitro ? (Math.random() > 0.5 ? '#38BDF8' : '#0284C7') : (Math.random() > 0.5 ? '#F59E0B' : '#EF4444'),
            alpha: 0.9,
            life: 0,
            maxLife: 0.35 + Math.random() * 0.2
          });
        }
      }

      // Draw Vehicle on Canvas
      drawTruckModel(ctx, truck, playerX, playerY, truckScale, isNitro, speed, currentVisualLaneRef.current - lane);

      // ==========================================
      // 7. Particle System Update & Draw
      // ==========================================
      ctx.save();
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.life += dt;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 + p.life), 0, Math.PI * 2);
        ctx.fill();

        if (p.life >= p.maxLife) {
          particlesRef.current.splice(i, 1);
        }
      }
      ctx.restore();

      // ==========================================
      // 8. Speed Lines when rushing fast (> 110 km/h)
      // ==========================================
      if (speed > 110) {
        ctx.save();
        const intensity = Math.min(1, (speed - 110) / 70);
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 + intensity * 0.3})`;
        ctx.lineWidth = 1.5;
        const lineCount = Math.floor(6 + intensity * 10);
        for (let i = 0; i < lineCount; i++) {
          const rx = roadBottomX + Math.random() * roadBottomWidth;
          const ry = horizonY + Math.random() * (height - horizonY) * 0.8;
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx + (Math.random() - 0.5) * 8, ry + 30 + intensity * 50);
          ctx.stroke();
        }
        ctx.restore();
      }

      // ==========================================
      // 9. Floating Score & Wake-up Texts
      // ==========================================
      ctx.save();
      for (const ft of floatingTexts) {
        ctx.font = 'bold 16px "Chakra Petch", sans-serif';
        ctx.fillStyle = ft.color;
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 6;
        ctx.globalAlpha = Math.max(0, ft.opacity);
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
      }
      ctx.restore();

      ctx.restore(); // restore dpr and shake
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [truck, speed, isNitro, hasShield, lane, roadEntities, floatingTexts, distanceTraveled, targetDistance, magnetActive, screenShake]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none touch-none">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};

// =========================================================================
// Canvas Drawing Helper Functions
// =========================================================================

function drawCityBlock(ctx: CanvasRenderingContext2D, startX: number, horizonY: number) {
  const buildings = [
    { w: 45, h: 90, color: '#1E293B', winColor: '#FBBF24' },
    { w: 70, h: 140, color: '#0F172A', winColor: '#38BDF8' },
    { w: 55, h: 110, color: '#334155', winColor: '#FEF08A' },
    { w: 85, h: 160, color: '#1E293B', winColor: '#FDE047' },
    { w: 50, h: 80, color: '#0F172A', winColor: '#BAE6FD' },
    { w: 90, h: 130, color: '#334155', winColor: '#F59E0B' },
    { w: 60, h: 100, color: '#1E293B', winColor: '#38BDF8' },
    { w: 75, h: 150, color: '#0F172A', winColor: '#FEF08A' },
    { w: 70, h: 115, color: '#334155', winColor: '#FDE047' }
  ];

  let curX = startX;
  for (const b of buildings) {
    ctx.fillStyle = b.color;
    ctx.fillRect(curX, horizonY - b.h, b.w, b.h);

    // Glowing office windows to simulate hardworking afternoon offices!
    ctx.fillStyle = b.winColor;
    for (let wy = horizonY - b.h + 12; wy < horizonY - 15; wy += 18) {
      for (let wx = curX + 8; wx < curX + b.w - 10; wx += 14) {
        if ((wx + wy) % 5 !== 0) {
          ctx.globalAlpha = 0.55;
          ctx.fillRect(wx, wy, 6, 8);
        }
      }
    }
    ctx.globalAlpha = 1.0;
    curX += b.w;
  }
}

function drawGuardRails(
  ctx: CanvasRenderingContext2D,
  topX: number,
  botX: number,
  topW: number,
  botW: number,
  horizonY: number,
  height: number,
  roadOffset: number
) {
  const steps = 8;
  ctx.save();
  for (let i = 0; i <= steps; i++) {
    const t = ((i / steps) + (roadOffset * 0.01)) % 1;
    const y = horizonY + (height - horizonY) * t;
    const curW = topW + (botW - topW) * t;
    const curLeft = topX + (botX - topX) * t;
    const curRight = curLeft + curW;

    const postH = 10 + t * 24;
    ctx.fillStyle = '#64748B';
    // Left post
    ctx.fillRect(curLeft - 10, y - postH, 4, postH);
    // Right post
    ctx.fillRect(curRight + 6, y - postH, 4, postH);

    // Red/White reflector on posts
    ctx.fillStyle = i % 2 === 0 ? '#EF4444' : '#F8FAFC';
    ctx.fillRect(curLeft - 11, y - postH + 2, 6, 5);
    ctx.fillRect(curRight + 5, y - postH + 2, 6, 5);
  }
  ctx.restore();
}

function drawFinishBanner(ctx: CanvasRenderingContext2D, centerX: number, y: number, scale: number, passed: boolean) {
  ctx.save();
  ctx.translate(centerX, y);
  ctx.scale(scale, scale);

  // Checkered Arch
  const bannerW = 280;
  const bannerH = 34;

  ctx.fillStyle = '#0F172A';
  ctx.fillRect(-bannerW / 2, -bannerH - 40, bannerW, bannerH);
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 3;
  ctx.strokeRect(-bannerW / 2, -bannerH - 40, bannerW, bannerH);

  // Checkers
  const checkSize = 14;
  for (let x = -bannerW / 2; x < bannerW / 2; x += checkSize) {
    for (let by = -bannerH - 40; by < -40; by += checkSize) {
      if ((Math.floor(x / checkSize) + Math.floor(by / checkSize)) % 2 === 0) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x, by, checkSize, checkSize);
      }
    }
  }

  // Text
  ctx.fillStyle = passed ? '#10B981' : '#FBBF24';
  ctx.font = 'bold 18px "Chakra Petch", sans-serif';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 8;
  ctx.fillText(passed ? '🏆 成功送達！精神滿點！' : '🏁 終點站：下午 2:00 打卡點', 0, -50);

  ctx.restore();
}

function drawRoadItem(
  ctx: CanvasRenderingContext2D,
  type: string,
  x: number,
  y: number,
  scale: number,
  time: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  const bob = Math.sin(time * 0.007 + x) * 6;

  if (type === 'COFFEE') {
    // ☕ Glowing Espresso Cup
    ctx.translate(0, bob);
    // Glow ring
    ctx.shadowColor = '#F59E0B';
    ctx.shadowBlur = 12;

    // Cup Body
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(-14, -8);
    ctx.lineTo(14, -8);
    ctx.lineTo(10, 14);
    ctx.lineTo(-10, 14);
    ctx.closePath();
    ctx.fill();

    // Coffee surface
    ctx.fillStyle = '#78350F';
    ctx.beginPath();
    ctx.ellipse(0, -8, 14, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cup handle
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(13, 2, 7, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();

    // Coffee cup logo badge
    ctx.fillStyle = '#D97706';
    ctx.beginPath();
    ctx.arc(0, 3, 5, 0, Math.PI * 2);
    ctx.fill();

    // Steam aroma wisps
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-4, -14);
    ctx.quadraticCurveTo(-7, -22, -3, -28);
    ctx.moveTo(4, -14);
    ctx.quadraticCurveTo(7, -22, 3, -28);
    ctx.stroke();

    // Label
    ctx.fillStyle = '#FEF08A';
    ctx.font = 'bold 9px "Chakra Petch", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('特濃咖啡', 0, 26);
  } else if (type === 'ENERGY_DRINK') {
    // ⚡ Neon Energy Drink
    ctx.translate(0, bob);
    ctx.shadowColor = '#10B981';
    ctx.shadowBlur = 16;

    // Can
    ctx.fillStyle = '#064E3B';
    ctx.fillRect(-10, -16, 20, 32);
    ctx.strokeStyle = '#34D399';
    ctx.lineWidth = 2;
    ctx.strokeRect(-10, -16, 20, 32);

    // Lightning bolt on can
    ctx.fillStyle = '#FDE047';
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(-6, 2);
    ctx.lineTo(2, 2);
    ctx.lineTo(-2, 12);
    ctx.lineTo(6, -2);
    ctx.lineTo(-2, -2);
    ctx.closePath();
    ctx.fill();

    // Label
    ctx.fillStyle = '#34D399';
    ctx.font = 'bold 9px "Chakra Petch", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('能量飲', 0, 26);
  } else if (type === 'PARCEL') {
    // 📦 Express Parcel
    ctx.translate(0, bob * 0.6);
    ctx.fillStyle = '#B45309';
    ctx.fillRect(-16, -12, 32, 24);
    // Red Priority tape
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(-16, -3, 32, 6);
    ctx.fillRect(-3, -12, 6, 24);

    ctx.fillStyle = '#FEF3C7';
    ctx.font = 'bold 7px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('加急', 0, 2);

    // Tip bonus label
    ctx.fillStyle = '#FBBF24';
    ctx.font = 'bold 8px "Chakra Petch", sans-serif';
    ctx.fillText('+小費', 0, 22);
  } else if (type === 'BOOST_PAD') {
    // 🟡 Speed Pad on ground (no bob, flat on road)
    ctx.fillStyle = 'rgba(245, 158, 11, 0.3)';
    ctx.fillRect(-22, -18, 44, 36);

    ctx.fillStyle = '#FBBF24';
    ctx.shadowColor = '#F59E0B';
    ctx.shadowBlur = 10;
    // Two forward chevrons
    for (let offset = -8; offset <= 8; offset += 14) {
      ctx.beginPath();
      ctx.moveTo(-16, offset + 6);
      ctx.lineTo(0, offset - 6);
      ctx.lineTo(16, offset + 6);
      ctx.lineTo(0, offset + 1);
      ctx.closePath();
      ctx.fill();
    }
  } else if (type === 'SLUMP_CLOUD') {
    // 💤 Afternoon Slump Cloud (Drowsiness monster)
    ctx.translate(0, bob);
    ctx.shadowColor = '#818CF8';
    ctx.shadowBlur = 14;

    // Dark purple cloud
    ctx.fillStyle = '#4338CA';
    ctx.beginPath();
    ctx.arc(-12, 0, 14, 0, Math.PI * 2);
    ctx.arc(0, -6, 16, 0, Math.PI * 2);
    ctx.arc(14, 0, 13, 0, Math.PI * 2);
    ctx.fill();

    // Sleepy droopy eyes
    ctx.strokeStyle = '#C7D2FE';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(-6, -2, 4, Math.PI, 0); // closed happy sleeping eye
    ctx.arc(6, -2, 4, Math.PI, 0);
    ctx.stroke();

    // "Z z z" floaters
    ctx.fillStyle = '#E0E7FF';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('Z', 16, -14);
    ctx.font = 'bold 8px sans-serif';
    ctx.fillText('z', 23, -22);

    ctx.fillStyle = '#F87171';
    ctx.font = 'bold 8px "Chakra Petch", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('瞌睡蟲', 0, 22);
  }

  ctx.restore();
}

function drawTruckModel(
  ctx: CanvasRenderingContext2D,
  truck: TruckConfig,
  x: number,
  y: number,
  scale: number,
  isNitro: boolean,
  speed: number,
  turnTilt: number // lean during steering
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  // Lean vehicle slightly when turning
  ctx.rotate(turnTilt * 0.08);

  const truckW = 54;
  const truckL = 75;

  // Truck Body (Top-angled perspective view)
  ctx.save();

  // Roof / Cargo Container
  ctx.fillStyle = truck.color;
  ctx.fillRect(-truckW / 2, -truckL / 2, truckW, truckL * 0.72);
  ctx.strokeStyle = truck.accentColor;
  ctx.lineWidth = 3;
  ctx.strokeRect(-truckW / 2, -truckL / 2, truckW, truckL * 0.72);

  // Cabin windshield & hood (pointing upward/forward)
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(-truckW / 2 + 4, -truckL / 2 + 2, truckW - 8, 14);

  // Windshield glass
  ctx.fillStyle = '#38BDF8';
  ctx.fillRect(-truckW / 2 + 7, -truckL / 2 + 4, truckW - 14, 9);

  // Coffee cup / lightning emblem on roof
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(0, -5, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = truck.accentColor;
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('☕', 0, -4);

  // Rear Bumpers & Taillights
  ctx.fillStyle = '#EF4444';
  ctx.shadowColor = '#EF4444';
  ctx.shadowBlur = 8;
  ctx.fillRect(-truckW / 2 + 2, truckL * 0.22 - 2, 8, 4);
  ctx.fillRect(truckW / 2 - 10, truckL * 0.22 - 2, 8, 4);

  // Headlight beams shining onto road ahead
  ctx.restore();
  ctx.save();
  const beamGrad = ctx.createLinearGradient(0, -truckL / 2, 0, -truckL / 2 - 90);
  beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
  beamGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
  ctx.fillStyle = beamGrad;
  ctx.beginPath();
  ctx.moveTo(-truckW / 2 + 6, -truckL / 2);
  ctx.lineTo(-truckW / 2 - 20, -truckL / 2 - 90);
  ctx.lineTo(truckW / 2 + 20, -truckL / 2 - 90);
  ctx.lineTo(truckW / 2 - 6, -truckL / 2);
  ctx.closePath();
  ctx.fill();

  // Wheels on sides
  ctx.fillStyle = '#0F172A';
  // Front Left
  ctx.fillRect(-truckW / 2 - 6, -truckL / 2 + 8, 6, 14);
  // Front Right
  ctx.fillRect(truckW / 2, -truckL / 2 + 8, 6, 14);
  // Rear Left
  ctx.fillRect(-truckW / 2 - 6, truckL * 0.22 - 14, 6, 16);
  // Rear Right
  ctx.fillRect(truckW / 2, truckL * 0.22 - 14, 6, 16);

  ctx.restore();
  ctx.restore();
}
