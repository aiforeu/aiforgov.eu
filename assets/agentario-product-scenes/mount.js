import { createStudio } from './studio.js';

// The animated switch uses the GPU canvas directly. The desks retain their still frames
// in two 2D canvases, so hovering a desk costs a redraw only while its angle changes.
export function mount(slots) {
  const studio = createStudio();
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const tiles = slots.map(slot => {
    const direct = slot.dataset.productScene === 'workflows';
    const canvas = direct ? studio.renderer.domElement : document.createElement('canvas');
    const context = direct ? null : canvas.getContext('2d', { alpha: true });
    if (!direct && !context) throw new Error('Canvas 2D unavailable');
    const tile = { slot, canvas, context, item: null, visible: false, dirty: true, angle: 0, target: 0 };
    slot.append(canvas);
    return tile;
  });
  let frame = 0, last = 0, time = 0, lost = false;
  function request() {
    if (!frame && !document.hidden && !lost && tiles.some(tile => tile.visible)) frame = requestAnimationFrame(update);
  }
  function fallback() {
    lost = true;
    for (const tile of tiles) tile.slot.classList.remove('ap-rendered');
  }
  function update(now) {
    frame = 0;
    try { drawVisible(now); } catch { fallback(); }
  }
  function drawVisible(now) {
    if (document.hidden || lost) return;
    const delta = last ? Math.min(now - last, 80) : 38;
    if (delta < 38) { request(); return; }
    last = now;
    time += delta / 1000;
    let moving = false, drewDesk = false;
    for (const tile of tiles) {
      if (!tile.visible) continue;
      const motionAllowed = !motion.matches;
      const animates = motionAllowed && tile.slot.dataset.productScene === 'workflows';
      const target = motionAllowed ? tile.target : 0;
      const turning = Math.abs(tile.angle - target) > .001;
      if (!tile.dirty && !animates && !turning && (tile.context || !drewDesk)) continue;
      tile.angle = turning ? tile.angle + (target - tile.angle) * .24 : target;
      tile.item ??= studio.model(tile.slot.dataset.productScene);
      const density = Math.min(Math.max(1.5, window.devicePixelRatio || 1), 2, 960 / tile.slot.clientWidth);
      const w = Math.max(1, Math.round(tile.slot.clientWidth * density));
      const h = Math.max(1, Math.round(tile.slot.clientHeight * density));
      if (tile.context && (tile.canvas.width !== w || tile.canvas.height !== h)) {
        tile.canvas.width = w;
        tile.canvas.height = h;
      }
      const source = studio.render(tile.item, w, h, tile.angle, motionAllowed ? time : 0);
      if (tile.context) {
        tile.context.clearRect(0, 0, w, h);
        tile.context.drawImage(source, 0, 0);
        drewDesk = true;
      }
      tile.slot.classList.add('ap-rendered');
      tile.dirty = false;
      moving ||= animates || turning;
    }
    if (moving) request();
  }

  const visibility = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const tile = tiles.find(tile => tile.slot === entry.target);
      tile.visible = entry.isIntersecting;
      if (!tile.visible && !tile.context) tile.slot.classList.remove('ap-rendered');
      tile.dirty = true;
    }
    request();
  });
  const size = new ResizeObserver(() => {
    for (const tile of tiles) tile.dirty = true;
    request();
  });
  for (const tile of tiles) {
    visibility.observe(tile.slot);
    size.observe(tile.slot);
    tile.slot.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse' || motion.matches) return;
      const rect = tile.slot.getBoundingClientRect();
      tile.target = ((event.clientX - rect.left) / rect.width - .5) * .23;
      request();
    });
    tile.slot.addEventListener('pointerleave', () => { tile.target = 0; request(); });
  }
  motion.addEventListener('change', () => {
    for (const tile of tiles) { tile.dirty = true; tile.target = 0; if (motion.matches) tile.angle = 0; }
    request();
  });
  document.addEventListener('visibilitychange', () => { last = 0; request(); });
  studio.renderer.domElement.addEventListener('webglcontextlost', fallback);
}
