'use strict';
// Ilustraciones de Gopher Quest en SVG (las mismas de Gopher al Rescate y Gopher Arquitecto): el gopher (dibujo propio, el mismo de GoRush), los stickers de
// las respuestas incorrectas y los íconos. Nada de emojis: todo lo visual sale de aquí.

const TRAZO = '#1b2a3a';
const CELESTE = '#6AD7E5';
const Tg = w => `stroke="${TRAZO}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const T = Tg(3);

// Gopher de cuerpo entero en una caja de 120 × 132.
function gopher({ color = CELESTE, ojos = 'normal', boca = 'dientes', cejas = '', casco = false, sombrero = false } = {}) {
  const blanco = `<circle cx="44" cy="45" r="14" fill="#fff" ${T}/><circle cx="76" cy="45" r="14" fill="#fff" ${T}/>`;
  const pupilas = (dx, dy, r = 6) => `<circle cx="${44 + dx}" cy="${45 + dy}" r="${r}" fill="${TRAZO}"/>
    <circle cx="${76 + dx}" cy="${45 + dy}" r="${r}" fill="${TRAZO}"/>
    <circle cx="${46 + dx}" cy="${43 + dy}" r="2" fill="#fff"/><circle cx="${78 + dx}" cy="${43 + dy}" r="2" fill="#fff"/>`;
  const OJOS = {
    normal: blanco + pupilas(3, 2),
    arriba: blanco + pupilas(2, -6),
    sorpresa: blanco + pupilas(0, 0, 4),
    triste: blanco + pupilas(0, 5, 5),
    sueno: blanco + pupilas(0, 6, 5)
      + `<path d="M30 45 A14 14 0 0 1 58 45 Z" fill="${color}" ${T}/><path d="M62 45 A14 14 0 0 1 90 45 Z" fill="${color}" ${T}/>`,
    x: blanco + `<path d="M38 39 L50 51 M50 39 L38 51 M70 39 L82 51 M82 39 L70 51" ${Tg(4)}/>`,
    feliz: `<path d="M33 48 Q44 34 55 48 M65 48 Q76 34 87 48" fill="none" ${Tg(4)}/>`,
  };
  const CEJAS = {
    triste: `<path d="M32 30 L50 24 M70 24 L88 30" ${Tg(4)}/>`,
    decidido: `<path d="M32 25 L52 32 M68 32 L88 25" ${Tg(4)}/>`,
  };
  const hocico = `<ellipse cx="60" cy="70" rx="13" ry="9" fill="#F6D2A2" ${T}/><ellipse cx="60" cy="64" rx="6" ry="4" fill="#3b2a20"/>`;
  const BOCA = {
    dientes: hocico + `<path d="M54 76 h12 v9 h-12 Z M60 76 v9" fill="#fff" ${Tg(2.5)}/>`,
    abierta: hocico + `<ellipse cx="60" cy="81" rx="5" ry="6" fill="${TRAZO}"/>`,
  };
  // casco de rescatista con la cruz
  const CASCO = casco ? `<path d="M28 29 C28 2 92 2 92 29 Z" fill="#EAAA00" ${T}/><path d="M22 29 h76" ${Tg(5)}/>
    <rect x="53" y="8" width="14" height="16" rx="3" fill="#fff"/><path d="M60 11 v10 M55 16 h10" stroke="#C62839" stroke-width="3.5"/>` : '';
  // sombrero de mago de Gopher Quest: azul con banda y estrella doradas
  const SOMBRERO = sombrero ? `<ellipse cx="60" cy="26" rx="41" ry="7" fill="#002C71" ${T}/>
    <path d="M37 25 C44 6 56 -10 76 -23 C70 -4 78 10 85 25 Z" fill="#002C71" ${T}/>
    <path d="M40 18 Q61 23 83 18" fill="none" stroke="#EAAA00" stroke-width="5"/>
    <path transform="translate(0 -12)" d="M63 6 l2.2 4.6 5 .7 -3.6 3.5 .9 5 -4.5-2.4 -4.5 2.4 .9-5 -3.6-3.5 5-.7z" fill="#EAAA00"/>
    <circle cx="71" cy="-13" r="2" fill="#EAAA00"/>` : '';
  return `<g>
    <circle cx="30" cy="24" r="9" fill="${color}" ${T}/><circle cx="90" cy="24" r="9" fill="${color}" ${T}/>
    <ellipse cx="21" cy="86" rx="6" ry="11" fill="${color}" ${T} transform="rotate(20 21 86)"/>
    <ellipse cx="99" cy="86" rx="6" ry="11" fill="${color}" ${T} transform="rotate(-20 99 86)"/>
    <path d="M22 62 C22 28 42 14 60 14 C78 14 98 28 98 62 L98 106 C98 121 84 127 60 127 C36 127 22 121 22 106 Z" fill="${color}" ${T}/>
    <ellipse cx="44" cy="127" rx="11" ry="5" fill="#F6D2A2" ${T}/><ellipse cx="76" cy="127" rx="11" ry="5" fill="#F6D2A2" ${T}/>
    ${OJOS[ojos]}${CEJAS[cejas] || ''}${BOCA[boca]}${CASCO}${SOMBRERO}</g>`;
}

function gopherSvg(op = {}, clase = 'gopher') {
  return `<svg viewBox="${op.sombrero ? '0 -26 120 162' : '0 0 120 136'}" class="${clase}" role="img" aria-label="El gopher, la mascota de Go">${gopher(op)}</svg>`;
}

const letra = (x, y, s, tam, relleno) => `<text x="${x}" y="${y}" font-size="${tam}" font-family="Poppins, sans-serif" font-weight="800"
  fill="${relleno}" stroke="${TRAZO}" stroke-width="2" paint-order="stroke" text-anchor="middle">${s}</text>`;
const mono = (x, y, s, tam, relleno) => `<text x="${x}" y="${y}" font-size="${tam}" font-family="JetBrains Mono, monospace" font-weight="700"
  fill="${relleno}" stroke="${TRAZO}" stroke-width="3" paint-order="stroke" text-anchor="middle">${s}</text>`;

// Stickers de respuesta incorrecta: gopher con cara y utilería, borde blanco y leyenda al estilo de un mensaje de Go.
const STICKERS = [
  { txt: 'piénsalo otra vez', cara: { ojos: 'x', boca: 'abierta' }, extra:
    `<g fill="#d7dde5" ${T}><circle cx="178" cy="44" r="11"/><circle cx="192" cy="32" r="9"/><circle cx="196" cy="50" r="8"/></g>
     <path d="M48 40 l12 8 -8 5 13 10 M190 84 l10 6 -7 4 11 9" fill="none" stroke="#EAAA00" stroke-width="4" stroke-linejoin="round"/>` },
  { txt: 'mira la memoria', cara: { ojos: 'arriba' }, extra:
    letra(186, 60, '0', 34, '#9CC3FF') + letra(204, 92, '1', 28, '#F4A6C6') + letra(184, 120, '2', 24, '#B5E27A') + letra(50, 70, '?', 30, '#EAAA00') },
  { txt: 'lee el texto otra vez', cara: { ojos: 'sueno' }, extra:
    letra(176, 62, 'z', 20, '#9CC3FF') + letra(192, 44, 'Z', 28, '#9CC3FF') },
  { txt: 'sigue los puntos', cara: { ojos: 'normal' }, extra:
    `<path d="M156 86 L182 112" stroke="${TRAZO}" stroke-width="9" stroke-linecap="round"/>
     <circle cx="138" cy="67" r="22" fill="rgba(200,235,255,.45)" stroke="${TRAZO}" stroke-width="5"/>
     <path d="M126 56 a14 14 0 0 1 10 -5" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>` },
  { txt: 'revisa el tipo', cara: { ojos: 'sorpresa', boca: 'abierta' }, extra:
    `<rect x="170" y="56" width="62" height="38" rx="7" fill="#fff" stroke="${TRAZO}" stroke-width="3" stroke-dasharray="7 5"/>
     <text x="201" y="81" font-size="15" font-family="JetBrains Mono, monospace" font-weight="700" fill="${TRAZO}" text-anchor="middle">1..*</text>` },
  { txt: 'una copia no es el original', cara: { ojos: 'triste', cejas: 'triste' }, extra:
    `<path d="M97 80 q-6 9 0 13 q6 -4 0 -13 Z" fill="#7cc4ff" stroke="${TRAZO}" stroke-width="2"/>
     <g fill="#cfd8e3" ${T}><circle cx="184" cy="34" r="11"/><circle cx="199" cy="28" r="13"/><circle cx="214" cy="36" r="10"/></g>
     <path d="M186 54 l-3 8 M200 54 l-3 8 M213 54 l-3 8" stroke="#7cc4ff" stroke-width="3" stroke-linecap="round"/>` },
  { txt: 'busca la línea', cara: { ojos: 'sorpresa', boca: 'abierta' }, extra:
    mono(36, 134, '[', 100, '#EAAA00') + mono(204, 134, ']', 100, '#EAAA00') },
  { txt: 'compila de nuevo', cara: { ojos: 'normal', cejas: 'decidido' }, extra:
    `<path d="M170 72 q-5 -7 0 -14 q5 -7 0 -14 M182 72 q-5 -7 0 -14 q5 -7 0 -14" fill="none" stroke="#9fb0c0" stroke-width="3" stroke-linecap="round"/>
     <path d="M190 96 h7 a9 9 0 0 1 0 18 h-7" fill="none" ${Tg(4)}/>
     <rect x="160" y="88" width="32" height="34" rx="5" fill="#fff" ${T}/>
     <text x="176" y="111" font-size="12" font-family="Poppins, sans-serif" font-weight="800" fill="#00ADD8" text-anchor="middle">Go</text>` },
];

function sticker(k) {
  const s = STICKERS[k % STICKERS.length];
  const ancho = [...s.txt].length * 7.6 + 26;
  return `<svg viewBox="0 0 240 212" class="sticker" role="img" aria-label="Sticker: ${s.txt}">
    <defs><filter id="borde-stk" x="-15%" y="-15%" width="130%" height="130%">
      <feMorphology in="SourceAlpha" operator="dilate" radius="6" result="d"/>
      <feGaussianBlur in="d" stdDeviation="4" result="b"/><feOffset in="b" dy="5" result="o"/>
      <feFlood flood-color="#000" flood-opacity=".35"/><feComposite in2="o" operator="in" result="sombra"/>
      <feFlood flood-color="#fff"/><feComposite in2="d" operator="in" result="borde"/>
      <feMerge><feMergeNode in="sombra"/><feMergeNode in="borde"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
    <g filter="url(#borde-stk)"><g transform="translate(60 18)">${gopher({ color: '#F4A6C6', ...s.cara })}</g>${s.extra}
      <rect x="${120 - ancho / 2}" y="168" width="${ancho}" height="30" rx="15" fill="#002C71"/>
      <text x="120" y="188" font-size="12.5" font-family="JetBrains Mono, monospace" font-weight="700" fill="#fff" text-anchor="middle">${s.txt}</text></g></svg>`;
}

// Íconos de trazo (24 × 24, heredan el color del texto).
const ic = d => `<svg viewBox="0 0 24 24" class="ic" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2"
  stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const ICONO = {
  trofeo: ic('<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 5M17 6h3a3 3 0 0 1-3 5"/>'),
  candado: ic('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
  estrella: ic('<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" fill="currentColor"/>'),
  bien: ic('<path d="m4 12 5 5L20 6"/>'),
  cerrar: ic('<path d="M6 6l12 12M18 6 6 18"/>'),
  ojo: ic('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
  sig: ic('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  play: ic('<path d="M7 4v16l13-8z" fill="currentColor"/>'),
  mapa: ic('<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14"/>'),
  descargar: ic('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>'),
  codigo: ic('<path d="m8 8-5 4 5 4M16 8l5 4-5 4M14 4l-4 16"/>'),
  memoria: ic('<rect x="4" y="6" width="16" height="12" rx="2"/><path d="M9 6v12M14 6v12M7 3v3M12 3v3M17 3v3M7 18v3M12 18v3M17 18v3"/>'),
  terminal: ic('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3M12 15h5"/>'),
  // negocios y piezas del juego
  soporte: ic('<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/><path d="M19 20a4 4 0 0 1-4 2h-2"/>'),
  musica: ic('<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>'),
  carrito: ic('<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.6 12.4a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.5L22 8H6"/>'),
  rama: ic('<circle cx="6" cy="5" r="2.5"/><circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="7" r="2.5"/><path d="M6 7.5v9M18 9.5c0 5-6 4-11 8"/>'),
  plano: ic('<rect x="3" y="3" width="8" height="6" rx="1"/><rect x="13" y="15" width="8" height="6" rx="1"/><path d="M7 9v4h10v2"/>'),
  ayuda: ic('<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 0 1 5 0c0 1.7-2.5 2-2.5 4"/><path d="M12 17v.5"/>'),
  lupa: ic('<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/>'),
  informe: ic('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
  imprimir: ic('<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/>'),
  copiar: ic('<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>'),
  // misiones
  rayo: ic('<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>'),
  aire: ic('<path d="M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h7"/>'),
  hospital: ic('<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 7v10M7 12h10"/>'),
  metro: ic('<rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 11h14M9 21l1.5-4M15 21l-1.5-4"/><circle cx="9" cy="14" r=".6" fill="currentColor"/><circle cx="15" cy="14" r=".6" fill="currentColor"/>'),
  gota: ic('<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/><path d="M9.5 15a2.5 2.5 0 0 0 2.5 2.5"/>'),
  escudo: ic('<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><rect x="9" y="11" width="6" height="5" rx="1"/><path d="M10 11V9.5a2 2 0 0 1 4 0V11"/>'),
};
