// Palm Poster Lab editor wiring: upload photos, drag / rotate / scale the snapshot
// cards on the live canvas, pick a layout preset and retro grade, export the poster PNG.
// A ?shot= query hands control to ./shots.js for fixed screenshot scenes instead.
import { drawCover, hitCard, SIZES } from './cover.js';
import { runShot, applyPreset, SAMPLES } from './shots.js';

const canvas = document.getElementById('cover');
const status = document.getElementById('status');
const titleEl = document.getElementById('title');
const subtitleEl = document.getElementById('subtitle');
const badgeEl = document.getElementById('badge');
const sizeEl = document.getElementById('size');
const rotateEl = document.getElementById('rotate');
const scaleEl = document.getElementById('scale');
const rotVal = document.getElementById('rotVal');
const scaleVal = document.getElementById('scaleVal');

let nextId = 1;
const state = {
  cards: [],
  title: titleEl.value,
  subtitle: subtitleEl.value,
  badge: badgeEl.value,
  grade: 'golden',
  preset: 'stack',
  sizeKey: 'square',
  selectedId: null,
};

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function selected() {
  return state.cards.find((c) => c.id === state.selectedId) || null;
}

function redraw() {
  drawCover(canvas, state);
}

function setSize(key) {
  state.sizeKey = key;
  const s = SIZES[key] || SIZES.square;
  canvas.width = s.w;
  canvas.height = s.h;
  if (sizeEl.value !== key) sizeEl.value = key;
}

function syncControls() {
  titleEl.value = state.title;
  subtitleEl.value = state.subtitle;
  badgeEl.value = state.badge;
  document.querySelectorAll('input[name="grade"]').forEach((r) => { r.checked = r.value === state.grade; });
  document.querySelectorAll('.preset').forEach((b) => b.classList.toggle('active', b.dataset.preset === state.preset));
  const card = selected();
  if (card) {
    rotateEl.value = Math.round(card.rot);
    scaleEl.value = Math.round(card.scale * 100);
    rotVal.textContent = `${Math.round(card.rot)}°`;
    scaleVal.textContent = `${Math.round(card.scale * 100)}%`;
  }
  rotateEl.disabled = !card;
  scaleEl.disabled = !card;
}

function addCard(img) {
  const card = {
    id: `card-${nextId++}`,
    img,
    x: 0.5, y: 0.45, rot: 0, scale: 1,
    z: state.cards.length,
  };
  state.cards.push(card);
  state.selectedId = card.id;
  return card;
}

async function loadSamples() {
  for (const s of SAMPLES) {
    try { addCard(await loadImage(s.url)); } catch { /* skip missing sample */ }
  }
  applyPreset(state, 'stack');
  state.selectedId = state.cards.length ? state.cards[state.cards.length - 1].id : null;
}

// --- photo upload (local only, files are never sent anywhere) ---
document.getElementById('photo').addEventListener('change', async (e) => {
  const files = [...e.target.files].slice(0, Math.max(0, 8 - state.cards.length));
  if (!files.length) { status.textContent = 'Poster is full (8 snapshots max). Remove one first.'; return; }
  for (const file of files) {
    const img = await loadImage(URL.createObjectURL(file));
    addCard(img);
  }
  // Nudge new cards into a loose fan so they do not land exactly on top of each other.
  state.cards.forEach((card, i) => {
    if (i >= state.cards.length - files.length) {
      card.x = 0.3 + (i % 3) * 0.2;
      card.y = 0.38 + (i % 2) * 0.18;
      card.rot = [-8, 5, -3, 9][i % 4];
    }
  });
  syncControls();
  redraw();
  status.textContent = `${state.cards.length} snapshot(s) on the poster.`;
  e.target.value = '';
});

// --- text fields ---
titleEl.addEventListener('input', () => { state.title = titleEl.value; redraw(); });
subtitleEl.addEventListener('input', () => { state.subtitle = subtitleEl.value; redraw(); });
badgeEl.addEventListener('input', () => { state.badge = badgeEl.value; redraw(); });

// --- presets & grade & size ---
document.querySelectorAll('.preset').forEach((btn) => {
  btn.addEventListener('click', () => {
    applyPreset(state, btn.dataset.preset);
    syncControls();
    redraw();
    status.textContent = `Layout: ${btn.textContent.trim()}.`;
  });
});
document.querySelectorAll('input[name="grade"]').forEach((radio) => {
  radio.addEventListener('change', () => {
    if (radio.checked) { state.grade = radio.value; redraw(); }
  });
});
sizeEl.addEventListener('change', () => { setSize(sizeEl.value); redraw(); });

// --- selected card controls ---
rotateEl.addEventListener('input', () => {
  const card = selected(); if (!card) return;
  card.rot = Number(rotateEl.value);
  rotVal.textContent = `${card.rot}°`;
  redraw();
});
scaleEl.addEventListener('input', () => {
  const card = selected(); if (!card) return;
  card.scale = Number(scaleEl.value) / 100;
  scaleVal.textContent = `${scaleEl.value}%`;
  redraw();
});
document.getElementById('front').addEventListener('click', () => {
  const card = selected(); if (!card) return;
  card.z = Math.max(...state.cards.map((c) => c.z)) + 1;
  redraw();
  status.textContent = 'Snapshot brought to the front.';
});
document.getElementById('remove').addEventListener('click', () => {
  const card = selected(); if (!card) return;
  state.cards = state.cards.filter((c) => c.id !== card.id);
  state.selectedId = state.cards.length ? state.cards[state.cards.length - 1].id : null;
  syncControls();
  redraw();
  status.textContent = 'Snapshot removed.';
});

// --- drag on the canvas ---
let drag = null;
function canvasPoint(e) {
  const r = canvas.getBoundingClientRect();
  return { nx: (e.clientX - r.left) / r.width, ny: (e.clientY - r.top) / r.height };
}
canvas.addEventListener('pointerdown', (e) => {
  const { nx, ny } = canvasPoint(e);
  const card = hitCard(state, canvas.width, canvas.height, nx, ny);
  if (!card) { state.selectedId = null; syncControls(); redraw(); return; }
  state.selectedId = card.id;
  drag = { id: card.id, dx: nx - card.x, dy: ny - card.y };
  canvas.setPointerCapture(e.pointerId);
  syncControls();
  redraw();
});
canvas.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const card = selected(); if (!card || card.id !== drag.id) return;
  const { nx, ny } = canvasPoint(e);
  card.x = Math.min(0.97, Math.max(0.03, nx - drag.dx));
  card.y = Math.min(0.95, Math.max(0.05, ny - drag.dy));
  redraw();
});
canvas.addEventListener('pointerup', () => { drag = null; });
canvas.addEventListener('pointercancel', () => { drag = null; });

// --- export ---
document.getElementById('export').addEventListener('click', () => {
  const keep = state.selectedId;
  state.selectedId = null;
  redraw();
  const s = SIZES[state.sizeKey];
  canvas.toBlob((blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `palm-poster-${s.label}.png`;
    a.click();
    status.textContent = `Saved palm-poster-${s.label}.png`;
    state.selectedId = keep;
    redraw();
  }, 'image/png');
});

// --- boot: shot scene or the normal editor with samples preloaded ---
const params = new URLSearchParams(location.search);
const shot = params.get('shot');
const api = { state, loadImage, setSize, redraw, syncControls };
if (shot) {
  runShot(shot, params, api);
} else {
  (async () => {
    await loadSamples();
    if (document.fonts && document.fonts.ready) { try { await document.fonts.ready; } catch { /* ignore */ } }
    syncControls();
    redraw();
  })();
}
