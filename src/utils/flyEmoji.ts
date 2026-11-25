/**
 * Arcs an emoji from one element to another, like tossing an ingredient into
 * the pot. Purely visual: it never blocks or delays game logic, and does
 * nothing when the visitor prefers reduced motion or the target is hidden.
 */
export function flyEmoji(emoji: string, from: Element | null, to: Element | null): void {
  if (typeof window === 'undefined' || !from || !to) return;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

  const a = from.getBoundingClientRect();
  const b = to.getBoundingClientRect();
  if (b.width === 0 || b.height === 0 || a.width === 0) return;

  const el = document.createElement('span');
  el.className = 'flying-emoji';
  el.textContent = emoji;
  el.setAttribute('aria-hidden', 'true');
  el.style.fontSize = '32px';
  document.body.appendChild(el);

  // Centre of the source → just above the pot's rim (about 30% down the pot).
  const x0 = a.left + a.width / 2 - 16;
  const y0 = a.top + a.height / 2 - 16;
  const x1 = b.left + b.width / 2 - 16;
  const y1 = b.top + b.height * 0.3 - 16;
  const lift = Math.min(160, Math.max(70, Math.abs(x1 - x0) * 0.35));
  const peakY = Math.min(y0, y1) - lift;

  // Sample a quadratic Bézier so the path is a true arc.
  const frames: Keyframe[] = [];
  const steps = 12;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const mx = (x0 + x1) / 2;
    const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * mx + t * t * x1;
    const y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * peakY + t * t * y1;
    const scale = 1 + 0.25 * Math.sin(Math.PI * t) - 0.35 * t * t;
    const rotate = 220 * t;
    frames.push({
      transform: `translate(${x}px, ${y}px) scale(${scale}) rotate(${rotate}deg)`,
      opacity: t > 0.9 ? (1 - t) * 10 : 1,
      offset: t,
    });
  }

  const anim = el.animate(frames, { duration: 520, easing: 'cubic-bezier(0.45, 0, 0.55, 1)', fill: 'forwards' });
  const cleanup = () => el.remove();
  anim.onfinish = cleanup;
  anim.oncancel = cleanup;
  // Safety net in case the animation never finishes (tab hidden, etc.)
  window.setTimeout(cleanup, 1200);
}
