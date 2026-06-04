'use strict';

/* Alchemical SVG icons for tiles.
   All use currentColor — set the colour in CSS on the parent container.
   Silver crescent requires #silver-mask defined in the document <defs> (index.html). */

const CATALYST_SVG = {

  // ♀ Venus / Copper
  copper: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="24" cy="16" r="11" stroke="currentColor" stroke-width="3.5"/>
    <line x1="24" y1="27" x2="24" y2="43" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>
    <line x1="14" y1="35" x2="34" y2="35" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>
  </svg>`,

  // ☽ Moon / Silver  (uses #silver-mask from index.html <defs>)
  silver: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="24" cy="24" r="18" fill="currentColor" mask="url(#silver-mask)"/>
  </svg>`,

  // ☉ Sol / Gold
  gold: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="24" cy="24" r="8" fill="currentColor"/>
    <circle cx="24" cy="24" r="14" stroke="currentColor" stroke-width="2.5"/>
    <g stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
      <line x1="24" y1="4"  x2="24" y2="8"/>
      <line x1="24" y1="40" x2="24" y2="44"/>
      <line x1="4"  y1="24" x2="8"  y2="24"/>
      <line x1="40" y1="24" x2="44" y2="24"/>
      <line x1="10" y1="10" x2="14" y2="14"/>
      <line x1="38" y1="10" x2="34" y2="14"/>
      <line x1="10" y1="38" x2="14" y2="34"/>
      <line x1="38" y1="38" x2="34" y2="34"/>
    </g>
  </svg>`,

  // ☿ Mercury / Mercury  — crescent horns + circle + cross
  mercury: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M 15 20 Q 24 9 33 20" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <circle cx="24" cy="27" r="9" stroke="currentColor" stroke-width="3"/>
    <line x1="24" y1="36" x2="24" y2="45" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <line x1="16" y1="41" x2="32" y2="41" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
  </svg>`,

  // ♂ Mars / Iron  — circle with arrow
  iron: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="20" cy="28" r="12" stroke="currentColor" stroke-width="3"/>
    <line x1="29" y1="19" x2="43" y2="5" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <polyline points="32,5 43,5 43,16" stroke="currentColor" stroke-width="3"
              stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
};

const ELEMENT_SVG = {

  // Flame
  fire: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" aria-hidden="true">
    <path d="M12 2 C10 5.5 7.5 8 7 12 C6.5 16 8 18.5 10 20 C9.5 17.5 10.5 15 12 14
             C13.5 15 14.5 17.5 14 20 C16 18.5 17.5 16 17 12 C16.5 8 14 5.5 12 2Z"/>
  </svg>`,

  // Water drop
  water: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" aria-hidden="true">
    <path d="M12 3 C12 3 5.5 12 5.5 16 C5.5 19.6 8.5 22 12 22 C15.5 22 18.5 19.6 18.5 16 C18.5 12 12 3 12 3Z"/>
  </svg>`,

  // Hexagon crystal
  earth: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" aria-hidden="true">
    <polygon points="12,2 20.5,7 20.5,17 12,22 3.5,17 3.5,7"/>
  </svg>`,

  // Swirl / wind
  air: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true"
        stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
    <path d="M4 14 Q8 5 15 9 Q21 13 16 18 Q11 21 9 16"/>
    <path d="M20 9 Q22 6 20 4 Q16 1 12 5"/>
  </svg>`,

  // 5-pointed star / aether
  aether: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" aria-hidden="true">
    <polygon points="12,2 14.4,8.8 21.5,8.9 16,13.2 17.9,20.1 12,16 6.1,20.1 8,13.2 2.5,8.9 9.6,8.8"/>
  </svg>`,
};

// Unicode chars used in level cards and legend
const CATALYST_CHARS = {
  copper: '♀', silver: '☽', gold: '☉', mercury: '☿', iron: '♂',
};
