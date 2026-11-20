// Fixed scenes for screenshots.
//   ?shot=cover&size=wide|square|portrait&caption=...&subtitle=...&grade=...&preset=...
//     renders ONLY the finished cover (editor hidden by the shot-cover body class).
//   ?shot=editor shows the editor with the sample snapshots already placed.
// Samples are loaded through the callback main.js passes in, so this module stays
// free of editor wiring. window.__shotReady is set once the scene is painted.
import { SIZES, PRESETS } from './cover.js';

export const SAMPLES = [
  { name: 'boulevard', url: 'samples/boulevard.jpg' },
  { name: 'pier', url: 'samples/pier.jpg' },
  { name: 'fishing', url: 'samples/fishing.jpg' },
  { name: 'skyline', url: 'samples/skyline.jpg' },
];

/** Applies a layout preset's slots to the cards (positions cycle if needed). */
export function applyPreset(state, presetName) {
  const preset = PRESETS[presetName] || PRESETS.stack;
  state.preset = PRESETS[presetName] ? presetName : 'stack';
  state.cards.forEach((card, i) => {
    const slot = preset.slots[i % preset.slots.length];
    card.x = slot.x; card.y = slot.y; card.rot = slot.rot; card.scale = slot.scale;
    card.z = i;
    // Spread the fan on wide canvases so the snapshots use the full poster width,
    // and settle it slightly on portrait canvases where the caption needs room.
    if (state.sizeKey === 'wide') card.x = Math.min(0.88, Math.max(0.12, 0.5 + (card.x - 0.5) * 1.35));
    if (state.sizeKey === 'portrait') card.y = 0.5 + (card.y - 0.5) * 0.9;
  });
}

export async function runShot(shot, query, api) {
  const { state, loadImage, setSize, redraw, syncControls } = api;
  if (shot === 'cover') document.body.classList.add('shot-cover');

  const sizeKey = query.get('size');
  if (sizeKey && SIZES[sizeKey]) setSize(sizeKey);

  if (query.get('caption')) state.title = query.get('caption');
  if (query.get('subtitle')) state.subtitle = query.get('subtitle');
  if (query.get('badge')) state.badge = query.get('badge');
  const grade = query.get('grade');
  if (grade && ['golden', 'faded', 'coral'].includes(grade)) state.grade = grade;

  // Load the requested sample set: ?photos=pier,fishing or all four by default.
  const wanted = (query.get('photos') || SAMPLES.map((s) => s.name).join(','))
    .split(',').map((s) => s.trim()).filter(Boolean);
  const chosen = SAMPLES.filter((s) => wanted.includes(s.name));
  const list = chosen.length ? chosen : SAMPLES;
  state.cards = [];
  for (const s of list) {
    try {
      const img = await loadImage(s.url);
      state.cards.push({ id: `card-${state.cards.length + 1}`, img, x: 0.5, y: 0.45, rot: 0, scale: 1, z: state.cards.length });
    } catch { /* a missing sample simply leaves one fewer card */ }
  }
  applyPreset(state, query.get('preset') || 'stack');
  state.selectedId = state.cards.length ? state.cards[state.cards.length - 1].id : null;
  if (syncControls) syncControls();
  redraw();
  // Fonts can land a beat after images; repaint once they are ready, then flag ready.
  if (document.fonts && document.fonts.ready) {
    try { await document.fonts.ready; redraw(); } catch { /* keep first paint */ }
  }
  requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
}
