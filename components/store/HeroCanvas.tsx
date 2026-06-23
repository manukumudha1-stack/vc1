'use client';

import { useEffect, useRef } from 'react';

// ── per-layer palette ──────────────────────────────────────────────────────────
const COL_FAR  = (a: number) => `rgba(140,32,28,${a})`;   // Ilkal / Paithani deep red
const COL_MID  = (a: number) => `rgba(30,85,52,${a})`;    // Paithani parrot green
const COL_NEAR = (a: number) => `rgba(168,112,8,${a})`;   // zari gold
const CREAM    = (a: number) => `rgba(240,215,160,${a})`;

// Motif types themed on Ilkal (Karnataka), Paithani (Maharashtra), Gadwal (Telangana)
type MotifType = 'peacock' | 'gopuram' | 'kasuti' | 'asawali' | 'mangoButi';

interface Particle {
  x: number; y: number; vy: number;
  size: number; angle: number; av: number;
  alpha: number; type: MotifType;
  depth: number; color: (a: number) => string;
  col: number; // fixed column slot 0-11 for even horizontal distribution
}

// ── MOTIFS ─────────────────────────────────────────────────────────────────────

// Paithani peacock (mor) — the most iconic Paithani silk motif
function drawPeacock(ctx: CanvasRenderingContext2D, s: number) {
  // tail fan: 5 feathers spread in a wide arc (drawn first, behind body)
  for (let i = 0; i < 5; i++) {
    const a = (i / 4 - 0.5) * Math.PI * 0.8;
    const tx = Math.sin(a) * s;
    const ty = -Math.abs(Math.cos(a)) * s * 0.9;
    ctx.beginPath();
    ctx.moveTo(0, s * 0.2);
    ctx.bezierCurveTo(tx * 0.3, s * 0.04, tx * 0.7, ty * 0.5, tx, ty);
    ctx.stroke();
    // eye-spot at feather tip
    ctx.beginPath(); ctx.arc(tx, ty, s * 0.08, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(tx, ty, s * 0.025, 0, Math.PI * 2); ctx.fill();
  }
  // body
  ctx.beginPath();
  ctx.ellipse(0, s * 0.34, s * 0.24, s * 0.15, 0, 0, Math.PI * 2);
  ctx.stroke();
  // neck — S-curve to head
  ctx.beginPath();
  ctx.moveTo(-s * 0.16, s * 0.2);
  ctx.bezierCurveTo(-s * 0.3, -s * 0.06, -s * 0.22, -s * 0.34, -s * 0.06, -s * 0.46);
  ctx.stroke();
  // head
  ctx.beginPath(); ctx.arc(-s * 0.04, -s * 0.56, s * 0.1, 0, Math.PI * 2); ctx.stroke();
  // crown dots
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath(); ctx.arc(i * s * 0.07 - s * 0.04, -s * 0.7, s * 0.025, 0, Math.PI * 2); ctx.fill();
  }
  // eye + beak
  ctx.beginPath(); ctx.arc(s * 0.02, -s * 0.55, s * 0.022, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(s * 0.06, -s * 0.53); ctx.lineTo(s * 0.2, -s * 0.5); ctx.stroke();
}

// Gadwal gopuram — tiered temple tower; Gadwal sarees are known for temple borders
function drawGopuram(ctx: CanvasRenderingContext2D, s: number) {
  const tiers = 4;
  for (let i = 0; i < tiers; i++) {
    const yw  = s * (0.76 - i * 0.16);
    const bot = s * (0.6  - i * 0.32);
    const top = bot - s * 0.25;
    ctx.beginPath();
    ctx.moveTo(-yw, bot);
    ctx.lineTo(-yw * 0.86, top);
    ctx.lineTo( yw * 0.86, top);
    ctx.lineTo( yw, bot);
    ctx.closePath(); ctx.stroke();
    // horizontal band inside each tier
    ctx.beginPath();
    ctx.moveTo(-yw * 0.62, (top + bot) * 0.5);
    ctx.lineTo( yw * 0.62, (top + bot) * 0.5);
    ctx.stroke();
  }
  // kalasha (pot finial) at top
  const tp = s * (0.6 - (tiers - 1) * 0.32) - s * 0.25;
  ctx.beginPath(); ctx.arc(0, tp - s * 0.17, s * 0.11, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, tp - s * 0.17, s * 0.045, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(0, tp - s * 0.28); ctx.lineTo(0, tp - s * 0.22); ctx.stroke();
  // arch door at base
  const bd = s * 0.6;
  ctx.beginPath();
  ctx.moveTo(-s * 0.22, bd + s * 0.38);
  ctx.lineTo(-s * 0.22, bd + s * 0.1);
  ctx.arc(0, bd + s * 0.1, s * 0.22, Math.PI, 0);
  ctx.lineTo(s * 0.22, bd + s * 0.38);
  ctx.stroke();
}

// Ilkal kasuti — menthi pattern (double-diamond + cross stitch)
// Kasuti is the traditional hand-embroidery of Ilkal / North Karnataka
function drawKasuti(ctx: CanvasRenderingContext2D, s: number) {
  // outer diamond
  ctx.beginPath();
  ctx.moveTo(0, -s); ctx.lineTo(s * 0.68, 0);
  ctx.lineTo(0,  s); ctx.lineTo(-s * 0.68, 0);
  ctx.closePath(); ctx.stroke();
  // inner diamond
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.48); ctx.lineTo(s * 0.34, 0);
  ctx.lineTo(0,  s * 0.48); ctx.lineTo(-s * 0.34, 0);
  ctx.closePath(); ctx.stroke();
  // cross arms (running stitch direction)
  ctx.beginPath(); ctx.moveTo(-s * 0.68, 0); ctx.lineTo(s * 0.68, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(0, s); ctx.stroke();
  // diagonal kasuti stitch accents between diamonds
  ([
    [ s * 0.34, -s * 0.5], [s * 0.34, s * 0.5],
    [-s * 0.34,  s * 0.5], [-s * 0.34, -s * 0.5],
  ] as [number, number][]).forEach(([x, y]) => {
    ctx.beginPath();
    ctx.moveTo(x * 0.48, y * 0.48);
    ctx.lineTo(x * 0.88, y * 0.88);
    ctx.stroke();
  });
  // cardinal dots and centre
  ([
    [0, -s], [s * 0.68, 0], [0, s], [-s * 0.68, 0],
  ] as [number, number][]).forEach(([x, y]) => {
    ctx.beginPath(); ctx.arc(x, y, s * 0.065, 0, Math.PI * 2); ctx.fill();
  });
  ctx.beginPath(); ctx.arc(0, 0, s * 0.1, 0, Math.PI * 2); ctx.fill();
}

// Paithani asawali — flowering vine sprig (signature Paithani border motif)
function drawAsawali(ctx: CanvasRenderingContext2D, s: number) {
  // S-curve main stem
  ctx.beginPath();
  ctx.moveTo(0, s * 0.98);
  ctx.bezierCurveTo(-s * 0.2, s * 0.52, -s * 0.08, s * 0.1, 0, -s * 0.08);
  ctx.bezierCurveTo(s * 0.08, -s * 0.28, s * 0.28, -s * 0.52, s * 0.1, -s * 0.8);
  ctx.stroke();
  // 3 leaf pairs along stem
  ([
    [s * 0.12, s * 0.55,  1],
    [-s * 0.04, s * 0.18, -1],
    [s * 0.06, -s * 0.22,  1],
  ] as [number, number, number][]).forEach(([bx, by, dir]) => {
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.bezierCurveTo(
      bx + dir * s * 0.3,  by - s * 0.1,
      bx + dir * s * 0.44, by - s * 0.28,
      bx + dir * s * 0.3,  by - s * 0.4
    );
    ctx.bezierCurveTo(
      bx + dir * s * 0.14, by - s * 0.28,
      bx + dir * s * 0.06, by - s * 0.18,
      bx, by
    );
    ctx.stroke();
  });
  // 6-petal flower at top
  const fx = s * 0.1, fy = -s * 0.84;
  for (let i = 0; i < 6; i++) {
    ctx.save();
    ctx.translate(fx, fy);
    ctx.rotate(i * Math.PI / 3);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(s * 0.1, -s * 0.07, s * 0.1, -s * 0.22, 0, -s * 0.28);
    ctx.bezierCurveTo(-s * 0.1, -s * 0.22, -s * 0.1, -s * 0.07, 0, 0);
    ctx.stroke();
    ctx.restore();
  }
  ctx.beginPath(); ctx.arc(fx, fy, s * 0.05, 0, Math.PI * 2); ctx.fill();
}

// Gadwal / mixed-silk mango buti — paisley with internal woven-check texture
function drawMangoButi(ctx: CanvasRenderingContext2D, s: number) {
  // outer mango shape
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.bezierCurveTo( s * 0.54, -s * 0.58,  s * 0.72, s * 0.18, 0,  s * 0.9);
  ctx.bezierCurveTo(-s * 0.72,  s * 0.18, -s * 0.54, -s * 0.58, 0, -s);
  ctx.stroke();
  // characteristic curl at tip (Gadwal / Paithani signature)
  ctx.beginPath();
  ctx.moveTo(s * 0.13, -s * 0.8);
  ctx.bezierCurveTo(s * 0.5, -s * 1.22, s * 0.92, -s * 0.85, s * 0.62, -s * 0.48);
  ctx.stroke();
  // interior horizontal lines — evokes Gadwal cotton-check body weave
  ([-s * 0.2, -s * 0.02, s * 0.18, s * 0.38] as number[]).forEach(y => {
    const hw = s * 0.58 * Math.sqrt(Math.max(0, 1 - ((y / s) * 1.18) ** 2)) * 0.7;
    if (hw > s * 0.06) {
      ctx.beginPath(); ctx.moveTo(-hw, y); ctx.lineTo(hw, y); ctx.stroke();
    }
  });
  // inner leaf / detail petal
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.28);
  ctx.bezierCurveTo( s * 0.15, -s * 0.12,  s * 0.15, s * 0.22, 0,  s * 0.38);
  ctx.bezierCurveTo(-s * 0.15,  s * 0.22, -s * 0.15, -s * 0.12, 0, -s * 0.28);
  ctx.stroke();
  ctx.beginPath(); ctx.arc(0, s * 0.07, s * 0.08, 0, Math.PI * 2); ctx.fill();
}

function drawMotif(ctx: CanvasRenderingContext2D, type: MotifType, s: number) {
  switch (type) {
    case 'peacock':   drawPeacock(ctx, s);   break;
    case 'gopuram':   drawGopuram(ctx, s);   break;
    case 'kasuti':    drawKasuti(ctx, s);    break;
    case 'asawali':   drawAsawali(ctx, s);   break;
    case 'mangoButi': drawMangoButi(ctx, s); break;
  }
}

// ── BORDERS ─────────────────────────────────────────────────────────────────────

// Left border: Paithani asawali vine — alternating flower sprigs on central stem
function drawAsawaliBorder(
  ctx: CanvasRenderingContext2D,
  x: number, h: number, unitH: number, alpha: number,
  col: (a: number) => string
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = col(1);
  ctx.fillStyle   = col(1);
  ctx.lineWidth   = 1;

  // central stem line
  ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();

  const s = unitH * 0.38;
  for (let y = s; y < h; y += unitH) {
    const dir = Math.round(y / unitH) % 2 === 0 ? 1 : -1;
    ctx.save();
    ctx.translate(x, y);
    // curved branch
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(dir * s * 0.28, -s * 0.2, dir * s * 0.48, -s * 0.5, dir * s * 0.4, -s * 0.7);
    ctx.stroke();
    // leaf at tip
    ctx.beginPath();
    ctx.moveTo(dir * s * 0.4, -s * 0.7);
    ctx.bezierCurveTo(dir * s * 0.6, -s * 0.88, dir * s * 0.74, -s * 0.68, dir * s * 0.56, -s * 0.54);
    ctx.stroke();
    // two flower dots along branch
    ctx.beginPath(); ctx.arc(dir * s * 0.2,  -s * 0.32, s * 0.055, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(dir * s * 0.38, -s * 0.64, s * 0.055, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

// Right border: Ilkal chikki paranda — chain of interlocked diamonds
// This is the signature border linking-pattern of Ilkal sarees
function drawChikkiBorder(
  ctx: CanvasRenderingContext2D,
  x: number, h: number, unitH: number, alpha: number,
  col: (a: number) => string
) {
  const r = unitH * 0.3;
  for (let y = r + unitH * 0.1; y < h; y += unitH) {
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = col(1);
    ctx.fillStyle   = col(1);
    ctx.lineWidth   = 1;

    // diamond
    ctx.beginPath();
    ctx.moveTo(0, -r); ctx.lineTo(r * 0.7, 0);
    ctx.lineTo(0,  r); ctx.lineTo(-r * 0.7, 0);
    ctx.closePath(); ctx.stroke();
    // inner cross
    ctx.beginPath(); ctx.moveTo(-r * 0.4, 0); ctx.lineTo(r * 0.4, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -r * 0.58); ctx.lineTo(0, r * 0.58); ctx.stroke();
    // tip accent dots
    ([
      [0, -r], [r * 0.7, 0], [0, r], [-r * 0.7, 0],
    ] as [number, number][]).forEach(([dx, dy]) => {
      ctx.beginPath(); ctx.arc(dx, dy, r * 0.1, 0, Math.PI * 2); ctx.fill();
    });
    // connector thread to next diamond
    const gap = unitH - r * 2 - unitH * 0.2;
    if (gap > 0) {
      ctx.beginPath(); ctx.moveTo(0, r); ctx.lineTo(0, r + gap); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, r + gap * 0.5, r * 0.12, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
}

// ── layer motif palettes ───────────────────────────────────────────────────────
const FAR_TYPES:  MotifType[] = ['peacock',  'gopuram',  'peacock'];
const MID_TYPES:  MotifType[] = ['kasuti',   'asawali',  'kasuti'];
const NEAR_TYPES: MotifType[] = ['mangoButi','asawali',  'mangoButi'];

// ── anti-clustering spawn ──────────────────────────────────────────────────────
// 36 particles = 12 per depth-layer × 3 layers
// Each particle owns a fixed column slot (0-11), giving even horizontal spread
const TOTAL = 36;
const COLS  = 12;

function spawnParticle(p: Particle, w: number, h: number, atBottom: boolean) {
  // x: jitter within this particle's assigned column
  const colW = w / COLS;
  p.x = colW * (p.col + 0.12 + Math.random() * 0.76);

  if (p.depth < 0.34) {
    p.size  = 46 + Math.random() * 28;
    p.vy    = 0.07 + Math.random() * 0.07;
    p.alpha = 0.16 + Math.random() * 0.10;
    p.av    = (Math.random() - 0.5) * 0.0012;
    p.type  = FAR_TYPES[Math.floor(Math.random() * FAR_TYPES.length)];
    p.color = COL_FAR;
  } else if (p.depth < 0.67) {
    p.size  = 22 + Math.random() * 14;
    p.vy    = 0.2  + Math.random() * 0.15;
    p.alpha = 0.22 + Math.random() * 0.12;
    p.av    = (Math.random() - 0.5) * 0.003;
    p.type  = MID_TYPES[Math.floor(Math.random() * MID_TYPES.length)];
    p.color = COL_MID;
  } else {
    p.size  = 11 + Math.random() * 6;
    p.vy    = 0.36 + Math.random() * 0.24;
    p.alpha = 0.28 + Math.random() * 0.14;
    p.av    = (Math.random() - 0.5) * 0.006;
    p.type  = NEAR_TYPES[Math.floor(Math.random() * NEAR_TYPES.length)];
    p.color = COL_NEAR;
  }

  p.angle = Math.random() * Math.PI * 2;
  p.y = atBottom ? h + p.size * 2 : Math.random() * h;
}

// ── component ──────────────────────────────────────────────────────────────────
export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef  = useRef({ x: 0.5, y: 0.5 });
  const rafRef    = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;

    let W = 0, H = 0;

    // Pre-assign each particle a fixed depth and column for even distribution
    const particles: Particle[] = Array.from({ length: TOTAL }, (_, i) => {
      const layerIdx = Math.floor(i / (TOTAL / 3));        // 0 = FAR, 1 = MID, 2 = NEAR
      const depth = layerIdx === 0 ? 0.16 : layerIdx === 1 ? 0.5 : 0.83;
      return {
        x: 0, y: 0, vy: 0, size: 0, angle: 0, av: 0, alpha: 0,
        type: 'kasuti' as MotifType,
        depth,
        color: COL_NEAR,
        col: i % COLS,
      };
    });

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      W = rect.width; H = rect.height;
      canvas!.width  = W * dpr;
      canvas!.height = H * dpr;
      ctx.scale(dpr, dpr);

      particles.forEach((p, i) => {
        spawnParticle(p, W, H, false);
        // Stagger initial Y evenly within each 12-particle depth group
        const idxInLayer = i % (TOTAL / 3);
        p.y = ((idxInLayer + Math.random()) / (TOTAL / 3)) * H;
      });
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const onMouseMove = (e: MouseEvent) => {
      const r = canvas!.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - r.left) / r.width,
        y: (e.clientY - r.top)  / r.height,
      };
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // warm champagne background
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0,   '#E9DEC6');
      bg.addColorStop(0.55,'#D4C0A0');
      bg.addColorStop(1,   '#BDA882');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

      // soft top-right light source
      const vg = ctx.createRadialGradient(W * 0.75, H * 0.1, 0, W * 0.75, H * 0.1, W * 0.6);
      vg.addColorStop(0,   CREAM(0.18));
      vg.addColorStop(0.7, CREAM(0.04));
      vg.addColorStop(1,   CREAM(0));
      ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);

      // ── saree border lines ────────────────────────────────────────────────
      const bw    = Math.max(30, W * 0.034);
      const unitH = bw * 2.9;

      ctx.lineWidth = 0.8;
      [bw, bw + 5].forEach(lx => {
        const a = lx === bw ? 0.32 : 0.14;
        ctx.strokeStyle = COL_FAR(a);
        ctx.beginPath(); ctx.moveTo(lx, 0);     ctx.lineTo(lx, H);     ctx.stroke();
        ctx.beginPath(); ctx.moveTo(W - lx, 0); ctx.lineTo(W - lx, H); ctx.stroke();
      });

      // left: Paithani asawali vine
      drawAsawaliBorder(ctx, bw * 0.5, H, unitH, 0.28, COL_MID);
      // right: Ilkal chikki paranda chain
      drawChikkiBorder(ctx, W - bw * 0.5, H, unitH, 0.28, COL_FAR);

      // ── floating motifs ───────────────────────────────────────────────────
      const mx = (mouseRef.current.x - 0.5) * 2;
      const my = (mouseRef.current.y - 0.5) * 2;

      // paint back-to-front (far → near) for correct depth overlap
      [...particles].sort((a, b) => a.depth - b.depth).forEach(p => {
        p.y     -= p.vy;
        p.angle += p.av;
        if (p.y < -p.size * 2.5) spawnParticle(p, W, H, true);

        const fadeIn  = Math.min(1, (H - p.y)           / (H * 0.14));
        const fadeOut = Math.min(1, (p.y + p.size * 2)  / (H * 0.10));
        const vis     = p.alpha * Math.min(fadeIn, fadeOut);
        if (vis < 0.006) return;

        ctx.save();
        ctx.translate(p.x + mx * p.depth * 14, p.y + my * p.depth * 7);
        ctx.rotate(p.angle);
        ctx.globalAlpha = vis;
        ctx.strokeStyle = p.color(1);
        ctx.fillStyle   = p.color(1);
        ctx.lineWidth   = Math.max(0.6, p.size * 0.05);
        drawMotif(ctx, p.type, p.size);
        ctx.restore();
      });

      // top dark vignette — ensures cream nav text reads over the hero
      const tg = ctx.createLinearGradient(0, 0, 0, H * 0.22);
      tg.addColorStop(0, 'rgba(20,12,4,0.58)');
      tg.addColorStop(1, 'rgba(20,12,4,0)');
      ctx.fillStyle = tg; ctx.fillRect(0, 0, W, H);

      // bottom dark vignette so hero text is always readable
      const sg = ctx.createLinearGradient(0, H * 0.38, 0, H);
      sg.addColorStop(0, 'rgba(20,12,4,0)');
      sg.addColorStop(1, 'rgba(20,12,4,0.76)');
      ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H);

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      aria-hidden="true"
    />
  );
}
