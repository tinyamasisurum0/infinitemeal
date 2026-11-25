import React from 'react';

/**
 * One cooking vessel per method, all drawn in the same enamel style as the
 * original pot (240×170 grid, green enamel gradient, tin rims, brass details).
 * MixingBowl stacks the layers in this order:
 *   flames → back → toolBack → emojis → front → toolFront → bubbles → label
 */

export interface VesselBox {
  left: string;
  right: string;
  top: string;
  height: string;
}

export interface Vessel {
  /** Burner flames under the vessel while cooking; shift moves them up (grid units). */
  flames: false | { shift: number };
  /** Steam/heat wisps while cooking: x positions (0–1) and top (CSS). */
  steam?: { xs: number[]; top: string };
  bubbles?: VesselBox;
  back?: React.ReactNode;
  toolBack?: { node: React.ReactNode; className: string };
  front: React.ReactNode;
  toolFront?: { node: React.ReactNode; className: string };
  emojis: VesselBox & { align: 'end' | 'center'; hideWhenCooking?: boolean; cookingClass?: string };
  label: { top: string; center?: string; compact?: boolean; ink?: boolean };
}

const tin = { fill: 'var(--im-tin)' };
const brass = { fill: 'var(--im-brass)' };
const potLo = { fill: 'var(--im-pot-lo)' };
const onPot = { fill: 'var(--im-on-pot)' };

export function getVessel(id: string, enamel: string): Vessel {
  const E = `url(#${enamel})`;

  switch (id) {
    // Wide mixing bowl on a brass foot; a spoon stirs while mixing.
    case 'mix':
      return {
        flames: false,
        bubbles: { left: '32%', right: '32%', top: '58%', height: '18%' },
        toolBack: {
          className: 'tool-spoon',
          node: (
            <>
              <path d="M166 14L134 74" strokeWidth={8} strokeLinecap="round" style={{ stroke: 'var(--im-brass)' }} />
              <ellipse cx={131} cy={80} rx={11} ry={7} transform="rotate(-62 131 80)" style={brass} />
            </>
          ),
        },
        front: (
          <>
            <rect x={92} y={146} width={56} height={10} rx={5} style={brass} />
            <path d="M28 70H212Q212 150 120 150Q28 150 28 70Z" fill={E} />
            <path d="M28 70H212Q210 84 120 86Q30 84 28 70Z" style={potLo} opacity={0.35} />
            <rect x={50} y={84} width={10} height={40} rx={5} style={onPot} opacity={0.16} />
            <rect x={20} y={64} width={200} height={11} rx={5.5} style={tin} />
          </>
        ),
        emojis: { left: '20%', right: '20%', top: '17%', height: '26%', align: 'end', cookingClass: 'emoji-tumble' },
        label: { top: '42%' },
      };

    // Shallow skillet with a long brass handle; ingredients hop while frying.
    case 'fry':
      return {
        flames: { shift: 12 },
        steam: { xs: [0.22, 0.38, 0.54], top: '18%' },
        front: (
          <>
            <path d="M180 98H226A8 8 0 0 1 226 114H180Z" style={brass} />
            <circle cx={222} cy={106} r={3.5} style={potLo} opacity={0.5} />
            <path d="M22 98H178V114Q178 142 150 142H50Q22 142 22 114Z" fill={E} />
            <path d="M22 98H178V106Q100 112 22 106Z" style={potLo} opacity={0.35} />
            <rect x={38} y={110} width={9} height={22} rx={4.5} style={onPot} opacity={0.16} />
            <rect x={16} y={92} width={168} height={10} rx={5} style={tin} />
          </>
        ),
        emojis: { left: '14%', right: '30%', top: '32%', height: '26%', align: 'end', cookingClass: 'emoji-hop' },
        label: { top: '68%', center: '41.7%', compact: true },
      };

    // Enamel oven: food sits behind the door window, which glows while baking.
    case 'bake':
      return {
        flames: false,
        steam: { xs: [0.36, 0.5, 0.64], top: '-4%' },
        back: (
          <>
            <rect x={44} y={150} width={14} height={10} rx={3} style={brass} />
            <rect x={182} y={150} width={14} height={10} rx={3} style={brass} />
            <rect x={30} y={12} width={180} height={142} rx={18} fill={E} />
            <path d="M30 30Q30 12 48 12H192Q210 12 210 30V44H30Z" style={potLo} opacity={0.35} />
            <circle cx={56} cy={28} r={7} style={brass} />
            <circle cx={78} cy={28} r={7} style={brass} />
            <rect x={150} y={23} width={40} height={10} rx={5} style={tin} />
            <rect x={62} y={50} width={116} height={7} rx={3.5} style={tin} />
            <rect x={48} y={62} width={144} height={66} rx={12} style={{ fill: 'var(--im-pot-lo)' }} />
            <rect className="oven-glow" x={48} y={62} width={144} height={66} rx={12} style={brass} />
          </>
        ),
        front: (
          <>
            <rect x={48} y={62} width={144} height={66} rx={12} fill="none" strokeWidth={5} style={{ stroke: 'var(--im-tin)' }} />
            <path d="M64 120L100 68H118L82 120Z" style={onPot} opacity={0.1} />
          </>
        ),
        emojis: { left: '24%', right: '24%', top: '42%', height: '28%', align: 'center' },
        label: { top: '79%', compact: true },
      };

    // Flat griddle plate with brass side handles; food sizzles on top.
    case 'griddle':
      return {
        flames: { shift: 22 },
        steam: { xs: [0.3, 0.48, 0.66], top: '20%' },
        front: (
          <>
            <path d="M6 104H30V116H6A6 6 0 0 1 6 104Z" style={brass} />
            <path d="M234 104H210V116H234A6 6 0 0 0 234 104Z" style={brass} />
            <path d="M26 104H214V116Q214 128 202 128H38Q26 128 26 116Z" fill={E} />
            <rect x={20} y={97} width={200} height={10} rx={5} style={tin} />
            <path d="M44 101H196" strokeWidth={1.5} style={{ stroke: 'var(--im-pot-lo)' }} opacity={0.25} />
          </>
        ),
        emojis: { left: '18%', right: '18%', top: '35%', height: '24%', align: 'end', cookingClass: 'emoji-hop' },
        label: { top: '63.5%', compact: true },
      };

    // Brass cutting board with an enamel-handled knife that chops while cooking.
    case 'chop':
      return {
        flames: false,
        back: (
          <>
            <rect x={18} y={100} width={204} height={36} rx={14} style={brass} />
            <rect x={18} y={122} width={204} height={14} rx={7} style={potLo} opacity={0.22} />
            <path d="M40 110H150M56 116H190" strokeWidth={1.5} strokeLinecap="round" style={{ stroke: 'var(--im-pot-lo)' }} opacity={0.18} />
            <circle cx={204} cy={111} r={5} style={potLo} opacity={0.35} />
          </>
        ),
        front: null,
        toolFront: {
          className: 'tool-knife',
          node: (
            <>
              <path d="M190 38H118Q104 38 98 50L92 64H190Z" style={tin} />
              <path d="M92 64H190V60H95Z" style={onPot} opacity={0.5} />
              <rect x={186} y={36} width={46} height={16} rx={8} fill={E} />
              <circle cx={200} cy={44} r={2.5} style={brass} />
              <circle cx={218} cy={44} r={2.5} style={brass} />
            </>
          ),
        },
        emojis: { left: '12%', right: '40%', top: '38%', height: '24%', align: 'end', cookingClass: 'emoji-chop' },
        label: { top: '71.5%', compact: true, ink: true },
      };

    // Blender: glass jar on an enamel base; contents whirl while blending.
    case 'blend':
      return {
        flames: false,
        back: (
          <>
            <path d="M164 40H176Q186 40 186 50V78Q186 88 176 88H158" fill="none" strokeWidth={6} style={{ stroke: 'var(--im-tin)' }} />
            <path d="M76 24H164L152 118H88Z" style={onPot} opacity={0.16} />
            <path className="blend-liquid" d="M82 72H158L152 118H88Z" style={{ fill: 'var(--im-pot-hi)' }} opacity={0.4} />
          </>
        ),
        front: (
          <>
            <path d="M76 24H164L152 118H88Z" fill="none" strokeWidth={4} strokeLinejoin="round" style={{ stroke: 'var(--im-tin)' }} />
            <path d="M86 34L92 104" strokeWidth={4} strokeLinecap="round" style={{ stroke: 'var(--im-on-pot)' }} opacity={0.35} />
            <rect x={70} y={14} width={100} height={14} rx={7} fill={E} />
            <rect x={110} y={5} width={20} height={11} rx={4} style={brass} />
            <rect x={70} y={156} width={14} height={8} rx={3} style={brass} />
            <rect x={156} y={156} width={14} height={8} rx={3} style={brass} />
            <path d="M58 116H182V146Q182 158 170 158H70Q58 158 58 146Z" fill={E} />
            <rect x={54} y={112} width={132} height={9} rx={4.5} style={tin} />
          </>
        ),
        emojis: { left: '36%', right: '36%', top: '38%', height: '28%', align: 'center', cookingClass: 'emoji-whirl' },
        label: { top: '79%', compact: true },
      };

    // Boil (default): the original enamel pot with a lid that closes.
    default:
      return {
        flames: { shift: 0 },
        steam: { xs: [0.3, 0.48, 0.66], top: '-2%' },
        bubbles: { left: '30%', right: '30%', top: '62%', height: '20%' },
        toolBack: {
          className: 'pot-lid',
          node: (
            <>
              <path d="M38 58Q120 20 202 58Z" fill={E} />
              <rect x={34} y={55} width={172} height={6} rx={3} style={tin} />
              <rect x={113} y={24} width={14} height={10} rx={3} style={brass} />
              <ellipse cx={120} cy={23} rx={12} ry={5} style={brass} />
            </>
          ),
        },
        front: (
          <>
            <path d="M6 84q0-10 12-10h14v9H20q-4 0-4 4t4 4h12v9H18q-12 0-12-10z" style={brass} />
            <path d="M234 84q0-10-12-10h-14v9h12q4 0 4 4t-4 4h-12v9h14q12 0 12-10z" style={brass} />
            <path d="M30 62H210V112Q210 152 170 152H70Q30 152 30 112Z" fill={E} />
            <path d="M30 62H210V74Q120 84 30 74Z" style={potLo} opacity={0.35} />
            <rect x={52} y={78} width={10} height={52} rx={5} style={onPot} opacity={0.16} />
            <rect x={24} y={56} width={192} height={11} rx={5.5} style={tin} />
          </>
        ),
        emojis: { left: '18%', right: '18%', top: '10%', height: '25%', align: 'end', hideWhenCooking: true },
        label: { top: '50%' },
      };
  }
}
