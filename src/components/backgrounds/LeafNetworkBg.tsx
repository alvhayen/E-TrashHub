import React, { useEffect, useRef } from 'react';

interface LeafNetworkBgProps {
  accentColor?: string;
  opacity?: number;
}

export default function LeafNetworkBg({ accentColor = '#10B981', opacity = 1 }: LeafNetworkBgProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Parse accent color to RGB for dynamic rgba() usage
    const hex = accentColor.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const rgb = `${r},${g},${b}`;

    const rnd = (a: number, b: number) => a + Math.random() * (b - a);

    let W: number, H: number;
    let nodes: any[] = [];
    let spores: any[] = [];
    let branches: any[] = [];
    let t = 0;

    function init() {
      if (!canvas) return;
      // Get internal dimensions based on the element display size
      const parent = canvas.parentElement;
      if (parent) {
         W = canvas.width = parent.offsetWidth;
         H = canvas.height = parent.offsetHeight;
      } else {
         W = canvas.width = window.innerWidth;
         H = canvas.height = window.innerHeight;
      }

      const nodeCount = Math.min(Math.floor((W * H) / 14000), 35);
      const sporeCount = Math.min(Math.floor((W * H) / 6000), 55);

      nodes = Array.from({ length: nodeCount }, () => ({
        x: rnd(0, W),
        y: rnd(0, H),
        vx: rnd(-0.07, 0.07),
        vy: rnd(-0.07, 0.07),
        r: rnd(2, 5.5),
        phase: rnd(0, Math.PI * 2),
        phaseSpeed: rnd(0.008, 0.022),
        isLeaf: Math.random() > 0.45,
        leafAngle: rnd(0, Math.PI * 2),
        leafAngleSpeed: rnd(-0.006, 0.006),
        leafSize: rnd(5, 14),
      }));

      spores = Array.from({ length: sporeCount }, () => ({
        x: rnd(0, W),
        y: rnd(0, H),
        r: rnd(0.5, 1.8),
        vy: rnd(-0.25, -0.06),
        vx: rnd(-0.08, 0.08),
        phase: rnd(0, Math.PI * 2),
        phaseSpeed: rnd(0.012, 0.03),
        opacity: rnd(0.08, 0.35),
      }));

      branches = [];
    }

    function drawLeaf(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, angle: number, alpha: number) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.bezierCurveTo(
        size * 0.55, -size * 0.25,
        size * 0.55,  size * 0.25,
        0, size
      );
      ctx.bezierCurveTo(
        -size * 0.55,  size * 0.25,
        -size * 0.55, -size * 0.25,
        0, -size
      );
      ctx.closePath();
      ctx.fillStyle = `rgba(${rgb},1)`;
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.75);
      ctx.lineTo(0,  size * 0.75);
      ctx.strokeStyle = `rgba(255,255,255,0.18)`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
      ctx.restore();
    }

    function spawnBranch() {
      if (nodes.length === 0) return;
      const origin = nodes[Math.floor(rnd(0, nodes.length))];
      const angle = rnd(0, Math.PI * 2);
      const length = rnd(30, 90);
      branches.push({
        x: origin.x,
        y: origin.y,
        angle,
        length,
        currentLength: 0,
        growSpeed: rnd(0.5, 1.2),
        maxAge: rnd(80, 160),
        age: 0,
        hasSub: Math.random() > 0.55,
        subAngle: angle + rnd(-0.6, 0.6),
        subLength: length * rnd(0.35, 0.6),
        subCurrent: 0,
        subStartAt: rnd(0.4, 0.7),
      });
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      t += 0.013;

      if (Math.random() < 0.008) spawnBranch();

      const connectDist = Math.min(W, H) * 0.22;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < connectDist) {
            const lineAlpha = (1 - d / connectDist) * 0.18;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(${rgb},${lineAlpha})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      branches = branches.filter(br => br.age < br.maxAge);
      branches.forEach(br => {
        br.age++;
        if (br.currentLength < br.length) {
          br.currentLength = Math.min(br.currentLength + br.growSpeed, br.length);
        }

        const progress = br.currentLength / br.length;
        const fadeIn = Math.min(br.age / 20, 1);
        const fadeOut = br.age > br.maxAge * 0.65
          ? 1 - (br.age - br.maxAge * 0.65) / (br.maxAge * 0.35)
          : 1;
        const brAlpha = fadeIn * fadeOut * 0.28;

        const ex = br.x + Math.cos(br.angle) * br.currentLength;
        const ey = br.y + Math.sin(br.angle) * br.currentLength;
        ctx.beginPath();
        ctx.moveTo(br.x, br.y);
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = `rgba(${rgb},${brAlpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        if (progress > 0.85 && fadeOut > 0.3) {
          drawLeaf(ctx, ex, ey, 4, br.angle - Math.PI / 2, brAlpha * 1.5);
        }

        if (br.hasSub && progress >= br.subStartAt) {
          const subProgress = (progress - br.subStartAt) / (1 - br.subStartAt);
          br.subCurrent = Math.min(br.subLength * subProgress, br.subLength);
          const sx = br.x + Math.cos(br.angle) * br.length * br.subStartAt;
          const sy = br.y + Math.sin(br.angle) * br.length * br.subStartAt;
          const ex2 = sx + Math.cos(br.subAngle) * br.subCurrent;
          const ey2 = sy + Math.sin(br.subAngle) * br.subCurrent;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(ex2, ey2);
          ctx.strokeStyle = `rgba(${rgb},${brAlpha * 0.7})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
          if (subProgress > 0.9 && fadeOut > 0.3) {
            drawLeaf(ctx, ex2, ey2, 3, br.subAngle - Math.PI / 2, brAlpha);
          }
        }
      });

      nodes.forEach(n => {
        n.phase += n.phaseSpeed;
        n.leafAngle += n.leafAngleSpeed;
        n.x += n.vx + Math.sin(t * 0.4 + n.phase) * 0.04;
        n.y += n.vy + Math.cos(t * 0.35 + n.phase) * 0.04;

        if (n.x < -15) n.x = W + 15;
        if (n.x > W + 15) n.x = -15;
        if (n.y < -15) n.y = H + 15;
        if (n.y > H + 15) n.y = -15;

        const pulse = 0.75 + 0.25 * Math.sin(n.phase);

        if (n.isLeaf) {
          drawLeaf(ctx, n.x, n.y, n.leafSize * pulse, n.leafAngle, 0.2);
        } else {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r * pulse * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rgb},0.06)`;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r * pulse * 0.55, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rgb},0.28)`;
          ctx.fill();
        }
      });

      spores.forEach(s => {
        s.phase += s.phaseSpeed;
        s.y += s.vy;
        s.x += s.vx + Math.sin(s.phase * 0.6) * 0.15;
        if (s.y < -5) { s.y = H + 5; s.x = rnd(0, W); }
        if (s.x < -5) s.x = W + 5;
        if (s.x > W + 5) s.x = -5;
        const spoAlpha = s.opacity * (0.6 + 0.4 * Math.sin(s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},${spoAlpha})`;
        ctx.fill();
      });

      rafRef.current = requestAnimationFrame(draw);
    }

    init();
    rafRef.current = requestAnimationFrame(draw);

    const handleResize = () => init();
    window.addEventListener('resize', handleResize);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [accentColor]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity,
      }}
    />
  );
}
