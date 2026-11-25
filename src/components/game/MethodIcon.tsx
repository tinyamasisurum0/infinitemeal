import React from 'react';

/**
 * Hand-drawn icon set for the cooking methods. One 24×24 grid, rounded 1.7px
 * strokes in the current text colour, with soft fills from the palette
 * (pot green for liquids, brass for heat and food) so they work on both
 * themes and on the selected (cobalt) pill.
 */

const green = { fill: 'var(--im-pot-hi)' };
const brass = { fill: 'var(--im-brass)' };

const icons: Record<string, React.ReactNode> = {
  // Bowl with a spoon stirring a swirl
  mix: (
    <>
      <path d="M3.5 12h17a8.5 7.5 0 0 1-17 0z" style={green} fillOpacity={0.35} />
      <path d="M3.5 12h17a8.5 7.5 0 0 1-17 0z" />
      <path d="M8.5 15.2c1.8 1 5.2 1 7 0" />
      <path d="M18.5 2.8l-5.3 7.4" />
      <ellipse cx="12.3" cy="11.2" rx="1.9" ry="1.2" transform="rotate(-54 12.3 11.2)" style={brass} stroke="none" />
    </>
  ),
  // Pot of water with rising steam
  boil: (
    <>
      <path d="M5.8 14h12.4v3.3a2.4 2.4 0 0 1-2.4 2.4H8.2a2.4 2.4 0 0 1-2.4-2.4z" style={green} fillOpacity={0.5} stroke="none" />
      <path d="M5 10.5h14v6.8a3.2 3.2 0 0 1-3.2 3.2H8.2A3.2 3.2 0 0 1 5 17.3z" />
      <path d="M3.8 10.5h16.4" />
      <path d="M5 13H3M19 13h2" />
      <path d="M9 7.5c-.9-1 .9-2 0-3.5M12 7.5c-.9-1 .9-2 0-3.5M15 7.5c-.9-1 .9-2 0-3.5" />
    </>
  ),
  // Frying pan with a sunny-side egg
  fry: (
    <>
      <circle cx="10" cy="13.5" r="6.8" />
      <path d="M15.2 9.2l5.3-4.2" strokeWidth={2.4} />
      <path d="M7 12.6c0-2 1.8-3 3.4-2.6 1.4.3 1.7 1.4 2.8 1.6 1.6.3 1.9 2.2.8 3.4-1.2 1.4-3.6 2-5.3 1.2C7.4 15.6 7 14.3 7 12.6z" fill="currentColor" fillOpacity={0.14} strokeWidth={1.2} />
      <circle cx="10.4" cy="13.2" r="1.8" style={brass} stroke="none" />
    </>
  ),
  // Oven with a loaf glowing behind the door window
  bake: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2.6" />
      <path d="M3.5 8h17" />
      <circle cx="6.8" cy="5.8" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="9.3" cy="5.8" r="0.7" fill="currentColor" stroke="none" />
      <rect x="6.5" y="10.5" width="11" height="7" rx="1.6" style={brass} fillOpacity={0.28} />
      <path d="M8.8 16c0-1.8 1.4-2.8 3.2-2.8s3.2 1 3.2 2.8z" style={brass} stroke="none" />
    </>
  ),
  // Flat griddle with a pancake stack and a pat of butter
  griddle: (
    <>
      <path d="M6.5 12.6h9a1.6 1.6 0 0 1 0 3.2h-9a1.6 1.6 0 0 1 0-3.2z" style={brass} fillOpacity={0.6} />
      <path d="M7.5 9h7a1.5 1.5 0 0 1 0 3h-7a1.5 1.5 0 0 1 0-3z" style={brass} fillOpacity={0.35} />
      <rect x="9.8" y="6.6" width="2.6" height="2.4" rx="0.6" style={brass} stroke="none" />
      <path d="M2.8 17.8h15.4" strokeWidth={2.4} />
      <path d="M18.2 17.8h3" />
    </>
  ),
  // Knife over a cutting board with diced pieces
  chop: (
    <>
      <rect x="3" y="15" width="18" height="5.5" rx="2" style={brass} fillOpacity={0.3} />
      <rect x="5.6" y="16.9" width="2.1" height="2.1" rx="0.5" transform="rotate(-12 6.6 17.9)" style={green} stroke="none" />
      <rect x="9.4" y="16.3" width="2.1" height="2.1" rx="0.5" transform="rotate(15 10.4 17.3)" style={green} stroke="none" />
      <rect x="12.6" y="17.1" width="2.1" height="2.1" rx="0.5" transform="rotate(-6 13.6 18.1)" style={green} stroke="none" />
      <path d="M3.2 11.8h11.3V6.6C9.6 6.9 5.4 8.7 3.2 11.8z" fill="currentColor" fillOpacity={0.12} />
      <path d="M14.5 9h6" strokeWidth={2.6} />
    </>
  ),
  // Blender jar with liquid, blade and base
  blend: (
    <>
      <path d="M8.2 8.5h7.6l-.8 5.8H9z" style={green} fillOpacity={0.5} stroke="none" />
      <path d="M7 3.5h10l-1.6 11H8.6z" />
      <path d="M6 3.5h12" />
      <path d="M10 12.3l2-1 2 1" strokeWidth={1.3} />
      <path d="M7 14.5h10v5a1.3 1.3 0 0 1-1.3 1.3H8.3A1.3 1.3 0 0 1 7 19.5z" />
      <circle cx="12" cy="17.6" r="1.1" style={brass} stroke="none" />
    </>
  ),
};

export function hasMethodIcon(id: string): boolean {
  return id in icons;
}

export default function MethodIcon({
  id,
  fallback,
  className = 'w-5 h-5',
}: {
  id: string;
  fallback?: string;
  className?: string;
}) {
  const icon = icons[id];
  if (!icon) {
    return <span aria-hidden="true" className="leading-none">{fallback}</span>;
  }
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {icon}
    </svg>
  );
}
