// Palm Poster Lab drawing engine: a painted sunset backdrop (gradient, sun disc, palm
// silhouettes), tilted white-bordered snapshot cards with washi-tape corners, sticker
// badges and a hand-marker caption. Everything is drawn in canvas code — no artwork files,
// no logos, no official fonts.

export const GRADES = {
  golden: {
    label: 'Golden Hour',
    sky: ['#ffb347', '#ff7e5f', '#c94f7c', '#5b2a6e'],
    sun: '#ffe9a3', sunCore: '#ffd76a',
    sea: '#2e7f8f', ink: '#2b1838', accent: '#ff5e3a',
    wash: 'rgba(255, 150, 60, 0.16)', tape: 'rgba(255, 224, 150, 0.75)',
  },
  faded: {
    label: 'Faded Film',
    sky: ['#f2c894', '#e8a07e', '#c98a94', '#7a5a7e'],
    sun: '#ffefc4', sunCore: '#f7d98b',
    sea: '#5f8f8a', ink: '#3a2a44', accent: '#d96f4e',
    wash: 'rgba(240, 210, 160, 0.22)', tape: 'rgba(250, 235, 200, 0.8)',
  },
  coral: {
    label: 'Coral Dusk',
    sky: ['#ff9a62', '#ff5e7a', '#b83a6e', '#3c1e5e'],
    sun: '#ffd9a0', sunCore: '#ffb347',
    sea: '#274b7a', ink: '#241031', accent: '#ffd76a',
    wash: 'rgba(255, 80, 110, 0.15)', tape: 'rgba(255, 190, 170, 0.75)',
  },
};

export const SIZES = {
  square: { w: 1080, h: 1080, label: '1080x1080' },
  portrait: { w: 1080, h: 1350, label: '1080x1350' },
  wide: { w: 1920, h: 1080, label: '1920x1080' },
};

// Layout presets: normalized centre positions, rotation (deg) and scale per card slot.
// Slots cycle when there are more cards than slots.
export const PRESETS = {
  stack: {
    label: 'Snapshot Stack',
    slots: [
      { x: 0.40, y: 0.42, rot: -7, scale: 1.05 },
      { x: 0.60, y: 0.40, rot: 6, scale: 1.0 },
      { x: 0.50, y: 0.55, rot: -2, scale: 1.12 },
      { x: 0.66, y: 0.58, rot: 10, scale: 0.92 },
      { x: 0.32, y: 0.60, rot: -12, scale: 0.9 },
    ],
  },
  row: {
    label: 'Postcard Row',
    slots: [
      { x: 0.20, y: 0.44, rot: -5, scale: 0.95 },
      { x: 0.50, y: 0.42, rot: 2, scale: 1.02 },
      { x: 0.80, y: 0.44, rot: 6, scale: 0.95 },
      { x: 0.35, y: 0.62, rot: 8, scale: 0.85 },
      { x: 0.65, y: 0.62, rot: -8, scale: 0.85 },
    ],
  },
  billboard: {
    label: 'Billboard Wide',
    slots: [
      { x: 0.34, y: 0.46, rot: -3, scale: 1.45 },
      { x: 0.72, y: 0.36, rot: 7, scale: 0.95 },
      { x: 0.76, y: 0.62, rot: -6, scale: 0.9 },
      { x: 0.55, y: 0.60, rot: 12, scale: 0.7 },
      { x: 0.16, y: 0.66, rot: -11, scale: 0.68 },
    ],
  },
};

let seed = 1234567;
function rand() {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed / 2147483648;
}

/** One painted palm: curved trunk plus drooping fronds, as a dark silhouette. */
function drawPalm(ctx, x, y, s, flip, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineWidth = Math.max(3, s * 0.075);
  ctx.beginPath();
  const topX = x + flip * s * 0.38;
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + flip * s * 0.05, y - s * 0.6, topX, y - s);
  ctx.stroke();
  ctx.lineWidth = Math.max(2, s * 0.05);
  const fronds = [-2.75, -2.25, -1.85, -1.35, -0.9, -0.45];
  for (const a of fronds) {
    const ex = topX + Math.cos(a) * s * 0.95 * (a < -1.6 ? 1 : flip);
    const ey = y - s + Math.sin(a) * s * 0.42 + s * 0.22;
    const mx = topX + Math.cos(a) * s * 0.5;
    const my = y - s + Math.sin(a) * s * 0.4 - s * 0.14;
    ctx.beginPath();
    ctx.moveTo(topX, y - s);
    ctx.quadraticCurveTo(mx, my, ex, ey);
    ctx.stroke();
  }
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(topX - s * 0.07, y - s + s * 0.05, s * 0.055, 0, Math.PI * 2);
  ctx.arc(topX + s * 0.07, y - s + s * 0.07, s * 0.045, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawBackdrop(ctx, w, h, g) {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, g.sky[0]);
  grad.addColorStop(0.38, g.sky[1]);
  grad.addColorStop(0.68, g.sky[2]);
  grad.addColorStop(1, g.sky[3]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Sun disc with a soft halo, low over the horizon line.
  const sunX = w * 0.5, sunY = h * 0.34, sunR = Math.min(w, h) * 0.16;
  const halo = ctx.createRadialGradient(sunX, sunY, sunR * 0.4, sunX, sunY, sunR * 2.4);
  halo.addColorStop(0, g.sun);
  halo.addColorStop(1, 'rgba(255, 200, 120, 0)');
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = halo;
  ctx.fillRect(sunX - sunR * 2.4, sunY - sunR * 2.4, sunR * 4.8, sunR * 4.8);
  ctx.globalAlpha = 1;
  ctx.fillStyle = g.sunCore;
  ctx.beginPath(); ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = g.sun;
  ctx.beginPath(); ctx.arc(sunX, sunY, sunR * 0.78, 0, Math.PI * 2); ctx.fill();

  // Painted cloud bands.
  ctx.fillStyle = 'rgba(255, 240, 220, 0.20)';
  for (const [cx, cy, cw] of [[0.16, 0.13, 0.30], [0.68, 0.09, 0.24], [0.55, 0.20, 0.18]]) {
    ctx.beginPath();
    ctx.ellipse(w * cx, h * cy, w * cw * 0.5, h * 0.022, 0, 0, Math.PI * 2);
    ctx.ellipse(w * (cx + 0.05), h * (cy - 0.018), w * cw * 0.32, h * 0.018, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Sea / ground band along the bottom with sparkle strokes.
  const horizon = h * 0.78;
  ctx.fillStyle = g.sea;
  ctx.globalAlpha = 0.55;
  ctx.fillRect(0, horizon, w, h - horizon);
  ctx.globalAlpha = 1;
  seed = 987654;
  ctx.strokeStyle = 'rgba(255, 245, 220, 0.35)';
  ctx.lineWidth = Math.max(1.5, h * 0.002);
  for (let i = 0; i < 46; i++) {
    const y = horizon + rand() * (h - horizon) * 0.9 + 4;
    const x = rand() * w;
    const len = 14 + rand() * 46;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len, y); ctx.stroke();
  }

  // Palm silhouettes framing the poster.
  const ink = 'rgba(24, 10, 34, 0.88)';
  drawPalm(ctx, w * 0.045, h * 0.80, h * 0.34, 1, ink);
  drawPalm(ctx, w * 0.965, h * 0.82, h * 0.40, -1, ink);
  drawPalm(ctx, w * 0.90, h * 0.79, h * 0.22, -1, 'rgba(24, 10, 34, 0.6)');
}

/** Card pixel size for a card at a given canvas size. */
export function cardSize(w, h, scale) {
  const base = Math.min(w, h) * 0.46;
  const cw = base * scale;
  return { cw, ch: cw * 1.16 };
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawTape(ctx, x, y, wdt, rot, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = color;
  ctx.fillRect(-wdt / 2, -wdt * 0.16, wdt, wdt * 0.32);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  for (let i = 0; i < 4; i++) ctx.fillRect(-wdt / 2 + i * (wdt / 4), -wdt * 0.16, 1.5, wdt * 0.32);
  ctx.restore();
}

function drawCard(ctx, w, h, card, g, selected) {
  const { cw, ch } = cardSize(w, h, card.scale);
  ctx.save();
  ctx.translate(card.x * w, card.y * h);
  ctx.rotate((card.rot * Math.PI) / 180);
  ctx.shadowColor = 'rgba(15, 5, 25, 0.5)';
  ctx.shadowBlur = Math.min(w, h) * 0.03;
  ctx.shadowOffsetY = Math.min(w, h) * 0.014;
  ctx.fillStyle = '#fffdf6';
  roundRect(ctx, -cw / 2, -ch / 2, cw, ch, cw * 0.03);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  const pad = cw * 0.065;
  const pw = cw - pad * 2;
  const ph = ch - pad - cw * 0.20;
  const px = -cw / 2 + pad, py = -ch / 2 + pad;
  ctx.save();
  roundRect(ctx, px, py, pw, ph, 3);
  ctx.clip();
  const img = card.img;
  if (img) {
    const s = Math.max(pw / img.naturalWidth, ph / img.naturalHeight);
    ctx.drawImage(img, px + (pw - img.naturalWidth * s) / 2, py + (ph - img.naturalHeight * s) / 2, img.naturalWidth * s, img.naturalHeight * s);
  } else {
    ctx.fillStyle = '#c9b8d9';
    ctx.fillRect(px, py, pw, ph);
  }
  ctx.fillStyle = g.wash;
  ctx.fillRect(px, py, pw, ph);
  const sheen = ctx.createLinearGradient(px, py, px + pw, py + ph);
  sheen.addColorStop(0, 'rgba(255,255,255,0.20)');
  sheen.addColorStop(0.45, 'rgba(255,255,255,0)');
  ctx.fillStyle = sheen;
  ctx.fillRect(px, py, pw, ph);
  ctx.restore();

  // Little pencil dots on the polaroid chin, like a dated print.
  ctx.fillStyle = 'rgba(90, 70, 110, 0.5)';
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(-pw * 0.32 + i * pw * 0.07, ch / 2 - cw * 0.10, cw * 0.012, 0, Math.PI * 2);
    ctx.fill();
  }

  drawTape(ctx, -cw * 0.36, -ch / 2 + 2, cw * 0.30, -0.5, g.tape);
  drawTape(ctx, cw * 0.36, -ch / 2 + 2, cw * 0.30, 0.5, g.tape);

  if (selected) {
    ctx.strokeStyle = '#ffd76a';
    ctx.lineWidth = 4;
    ctx.setLineDash([12, 8]);
    roundRect(ctx, -cw / 2 - 7, -ch / 2 - 7, cw + 14, ch + 14, cw * 0.04);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.restore();
}

function drawStar(ctx, x, y, r, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.2);
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const px = Math.cos(a) * rad, py = Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawStickers(ctx, w, h, g, badgeText) {
  const u = Math.min(w, h);
  drawStar(ctx, w * 0.085, h * 0.115, u * 0.045, '#ffd76a');
  drawStar(ctx, w * 0.135, h * 0.065, u * 0.024, '#fff3d6');
  // Mini palm sticker in a coral blob, bottom right.
  ctx.save();
  ctx.fillStyle = g.accent;
  ctx.beginPath(); ctx.arc(w * 0.915, h * 0.70, u * 0.052, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#fffdf6'; ctx.lineWidth = u * 0.006;
  ctx.beginPath(); ctx.arc(w * 0.915, h * 0.70, u * 0.046, 0, Math.PI * 2); ctx.stroke();
  drawPalm(ctx, w * 0.898, h * 0.735, u * 0.075, 1, '#fffdf6');
  ctx.restore();
  // Round badge sticker with editable text, top right.
  const bx = w * 0.885, by = h * 0.13, br = u * 0.075;
  ctx.save();
  ctx.translate(bx, by);
  ctx.rotate(0.16);
  ctx.fillStyle = '#fffdf6';
  ctx.beginPath(); ctx.arc(0, 0, br, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = g.accent; ctx.lineWidth = u * 0.007; ctx.setLineDash([u * 0.012, u * 0.009]);
  ctx.beginPath(); ctx.arc(0, 0, br * 0.82, 0, Math.PI * 2); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = g.ink;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  let fs = br * 0.42;
  ctx.font = `${fs}px Anton, 'Arial Narrow', sans-serif`;
  const text = (badgeText || 'EST. 2026').toUpperCase();
  while (ctx.measureText(text).width > br * 1.45 && fs > 8) { fs -= 2; ctx.font = `${fs}px Anton, 'Arial Narrow', sans-serif`; }
  ctx.fillText(text, 0, -fs * 0.28);
  ctx.font = `${br * 0.20}px Anton, 'Arial Narrow', sans-serif`;
  ctx.fillStyle = g.accent;
  ctx.fillText('PALM POSTER', 0, fs * 0.62);
  ctx.restore();
}

function drawCaption(ctx, w, h, g, title, subtitle) {
  const u = Math.min(w, h);
  ctx.save();
  ctx.translate(w / 2, h - u * 0.128);
  ctx.rotate(-0.018);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const t = (title || '').trim() || 'Vice Sunset Club';
  let fs = u * 0.085;
  ctx.font = `${fs}px Pacifico, 'Segoe Script', cursive`;
  while (ctx.measureText(t).width > w * 0.86 && fs > 14) { fs -= 3; ctx.font = `${fs}px Pacifico, 'Segoe Script', cursive`; }
  ctx.shadowColor = 'rgba(255, 235, 200, 0.9)';
  ctx.shadowBlur = 0;
  ctx.lineWidth = fs * 0.16;
  ctx.strokeStyle = 'rgba(255, 250, 235, 0.85)';
  ctx.lineJoin = 'round';
  ctx.strokeText(t, 0, 0);
  ctx.fillStyle = g.ink;
  ctx.fillText(t, 0, 0);
  // Underline swoosh.
  const tw = Math.min(ctx.measureText(t).width, w * 0.86);
  ctx.strokeStyle = g.accent;
  ctx.lineWidth = Math.max(3, u * 0.008);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-tw * 0.46, fs * 0.62);
  ctx.quadraticCurveTo(0, fs * 0.86, tw * 0.46, fs * 0.52);
  ctx.stroke();
  const sub = (subtitle || '').trim();
  if (sub) {
    let sfs = u * 0.036;
    ctx.font = `${sfs}px Pacifico, 'Segoe Script', cursive`;
    while (ctx.measureText(sub).width > w * 0.8 && sfs > 10) { sfs -= 2; ctx.font = `${sfs}px Pacifico, 'Segoe Script', cursive`; }
    ctx.lineWidth = sfs * 0.18;
    ctx.strokeText(sub, 0, fs * 1.02);
    ctx.fillStyle = g.ink;
    ctx.fillText(sub, 0, fs * 1.02);
  }
  ctx.restore();
}

function drawGradeOverlay(ctx, w, h, g, gradeKey) {
  // Warm retro film grade over the whole poster: soft vignette + faint grain.
  const v = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.max(w, h) * 0.78);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(30, 8, 30, 0.30)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = g.wash;
  ctx.fillRect(0, 0, w, h);
  seed = gradeKey === 'faded' ? 555 : 24680;
  ctx.fillStyle = 'rgba(255, 250, 240, 0.05)';
  const step = Math.max(7, Math.floor(Math.min(w, h) / 90));
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      if (rand() > 0.55) ctx.fillRect(x, y, 1.6, 1.6);
    }
  }
}

/** Draws the full poster. state: {cards, title, subtitle, badge, grade, selectedId} */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  const g = GRADES[state.grade] || GRADES.golden;
  drawBackdrop(ctx, w, h, g);
  const ordered = [...state.cards].sort((a, b) => a.z - b.z);
  for (const card of ordered) drawCard(ctx, w, h, card, g, card.id === state.selectedId);
  drawStickers(ctx, w, h, g, state.badge);
  drawCaption(ctx, w, h, g, state.title, state.subtitle);
  drawGradeOverlay(ctx, w, h, g, state.grade);
}

/** Hit test: returns the topmost card under normalized point (nx, ny), or null. */
export function hitCard(state, w, h, nx, ny) {
  const ordered = [...state.cards].sort((a, b) => b.z - a.z);
  for (const card of ordered) {
    const { cw, ch } = cardSize(w, h, card.scale);
    const dx = nx * w - card.x * w;
    const dy = ny * h - card.y * h;
    const a = (-card.rot * Math.PI) / 180;
    const rx = dx * Math.cos(a) - dy * Math.sin(a);
    const ry = dx * Math.sin(a) + dy * Math.cos(a);
    if (Math.abs(rx) <= cw / 2 && Math.abs(ry) <= ch / 2) return card;
  }
  return null;
}
