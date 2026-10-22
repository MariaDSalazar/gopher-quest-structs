'use strict';
// Gopher Quest · juego individual de structs en Go, en el mundo del juego de rol de la clase de la semana 8.
// Los retos salen de datos.js (generado y verificado con Go por _fuente/construir.py). En datos.js todo va cifrado
// y en cadena: cada reto se abre con la llave que deja el reto anterior resuelto bien.
// El panel «Memoria» muestra las variables (structs, punteros, slices y maps) tal como las dejó Go.

const J = window.JUEGO;
const CLAVE = 'gopher-quest-structs-v1';
let M = null;                    // niveles, títulos, tipos y temas (se descifran al arrancar)
let TOTAL = 0, TEMAS = [], K0 = '';

let E = null;
let repaso = false;              // al rejugar un nivel terminado no se cambia el puntaje

/* ---------------- estado ---------------- */
// resp: primer intento de cada reto (puntaje) · hecho: retos superados · k: llave de cada reto alcanzado
const nuevo = (nombre = '', apellido = '') => ({ nombre, apellido, resp: {}, hecho: {}, k: { '0-0': K0 } });
function cargar() {
  try { return { ...nuevo(), ...JSON.parse(localStorage.getItem(CLAVE)) }; }
  catch { return nuevo(); }
}
function guardar() { localStorage.setItem(CLAVE, JSON.stringify(E)); }
const clave = (n, r) => `${n}-${r}`;
const aciertos = () => Object.values(E.resp).filter(Boolean).length;
const respondidos = () => Object.keys(E.hecho).length;
const nRetos = n => J.retos[n].length;
const nivelHecho = n => J.retos[n].every((_, r) => E.hecho[clave(n, r)]);
const nivelAbierto = n => n === 0 || nivelHecho(n - 1);
const todoHecho = () => J.retos.every((_, n) => nivelHecho(n));
const primeroPendiente = n => J.retos[n].findIndex((_, r) => !E.hecho[clave(n, r)]);
const aciertosNivel = n => J.retos[n].filter((_, r) => E.resp[clave(n, r)]).length;
function estrellas(n) {
  const p = aciertosNivel(n) / nRetos(n);
  return p === 1 ? 3 : p >= .75 ? 2 : p >= .5 ? 1 : 0;
}

/* ---------------- utilidades ---------------- */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = s => esc(s).replace(/"/g, '&quot;');
const KW = /^(type|struct|func|var|return|package|import|for|range|if|else|map|nil|true|false)$/;
const TIPO = /^(string|int|bool|float64|error|any)$/;
function resaltar(src) {
  return src.replace(/(\/\/[^\n]*)|("(?:[^"\\]|\\.)*")|([A-Za-z_]\w*)|(\d+)|([\s\S])/g, (m, c, s, w, num) => {
    if (c) return `<span class="c">${esc(c)}</span>`;
    if (s) return `<span class="s">${esc(s)}</span>`;
    if (w) return KW.test(w) ? `<span class="k">${w}</span>` : TIPO.test(w) ? `<span class="t">${w}</span>` : w;
    if (num) return `<span class="n">${num}</span>`;
    return esc(m);
  });
}
function barajar(a) {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
const estrellasHTML = k => `<span class="estrellas">${[0, 1, 2].map(i => `<span class="${i < k ? 'on' : ''}">${ICONO.estrella}</span>`).join('')}</span>`;
const PARTICULAS = new Set(['de', 'del', 'la', 'las', 'los', 'y', 'e']);
function nombreBonito(s) {
  return s.trim().replace(/\s+/g, ' ').toLowerCase().split(' ')
    .map((p, i) => i > 0 && PARTICULAS.has(p) ? p : p.replace(/(^|['-])(\p{L})/gu, (m, a, b) => a + b.toUpperCase()))
    .join(' ');
}
const MASCOTA = { ojos: 'feliz', sombrero: true };

function barra(conAyuda) {
  const quien = E.nombre ? `<div class="jugador"><b>${esc(E.nombre)} ${esc(E.apellido)}</b>${aciertos()} de ${TOTAL} aciertos</div>` : '';
  const ayuda = conAyuda ? `<button class="ayuda-btn" id="ayuda" title="Ver las instrucciones del reto" aria-label="Ver las instrucciones del reto">${ICONO.ayuda}</button>` : '';
  return `<header class="top"><div class="logo">${gopherSvg(MASCOTA)}<span>Gopher <b>Quest</b></span></div><div class="der">${quien}${ayuda}</div></header>`;
}
function pintar(html, { ancho = false, ayuda = false } = {}) {
  document.body.innerHTML = barra(ayuda) + `<main id="app" class="${ancho ? 'ancho' : ''}">${html}</main>`;
  window.scrollTo({ top: 0 });
}

/* ---------------- la memoria ----------------
   Cada variable es {n, t, node}; node: s (struct, con campos f), v (valor), l (lista de valores), sl (slice de structs),
   m (map), p (puntero: a qué apunta o nil). Las rutas de los campos son las mismas que arma construir.py. */
function memHTML(mem, o = {}) {
  if (!mem || !mem.length) return `<div class="mem-vacia">${o.vacio || 'Todavía no hay variables en la memoria.'}</div>`;
  const toca = o.toca, sel = o.sel || new Set(), camb = new Set(o.cambios || []), nuevas = new Set(o.nuevas || []);
  const hoja = (ruta, nombre, nd) => {
    const val = o.ocultar ? '?' : esc(nd.v);
    const cls = `mf${nd.z && !o.ocultar ? ' cero' : ''}${camb.has(ruta) ? ' cambio' : ''}${sel.has(ruta) ? ' sel' : ''}`;
    return toca
      ? `<button class="${cls} toca" data-p="${attr(ruta)}"><span class="mk">${esc(nombre)}</span><b class="mv">${val}</b></button>`
      : `<div class="${cls}" data-p="${attr(ruta)}"><span class="mk">${esc(nombre)}</span><b class="mv">${val}</b></div>`;
  };
  const struct = (ruta, nd) => nd.f.map(([c, x]) => x.k === 's'
    ? `<div class="msub"><div class="msubcab">${esc(c)}</div>${struct(`${ruta}.${c}`, x)}</div>`
    : hoja(`${ruta}.${c}`, c, x)).join('');
  const cuerpo = (v) => {
    const nd = v.node;
    if (nd.k === 's') return struct(v.n, nd);
    if (nd.k === 'p') return `<div class="mptr">${nd.a ? `apunta a <code>${esc(nd.a)}</code>` : '<code>nil</code> · no apunta a nada'}</div>`;
    if (nd.k === 'sl') return `<div class="mlista">${nd.items.map((x, i) => `<div class="mitem"><span class="midx">[${i}]</span>${struct(`${v.n}[${i}]`, x)}</div>`).join('')}</div>`;
    if (nd.k === 'm') return `<div class="mlista">${nd.items.map(([k, x]) => `<div class="mitem"><span class="midx">"${esc(k)}"</span>${struct(`${v.n}["${k}"]`, x)}</div>`).join('')}</div>`;
    return hoja(v.n, v.n, nd);
  };
  return `<div class="mem">${mem.map(v => `<div class="mvar${v.node.k === 'p' ? ' ptr' : ''}${nuevas.has(v.n) ? ' nueva' : ''}">
      <div class="mcab"><code>${esc(v.n)}</code><span>${esc(v.t)}</span></div><div class="mcuerpo">${cuerpo(v)}</div></div>`).join('')}</div>`;
}
const memCard = (html, titulo = 'Memoria') => `<div class="card mem-card" id="memcard"><div class="mem-bar">${ICONO.memoria}<span>${titulo}</span></div>
  <div class="mem-zona" id="memoria">${html}</div></div>`;
const tiposHTML = (n, abierto = false) => `<details class="card tipos"${abierto ? ' open' : ''}><summary>${ICONO.codigo} Tipos del nivel</summary>
  <pre class="go">${resaltar(M.niveles[n].tipos)}</pre></details>`;

/* ---------------- inicio ---------------- */
function inicio() {
  const chips = ['struct', 'valor cero', 'copia', '*puntero', 'anidados', '==', 'range', 'map'].map(c => `<span class="chip oscuro">${c}</span>`).join('');
  const registro = E.nombre
    ? `<h2>Hola de nuevo, ${esc(E.nombre)}</h2><p class="suave">Llevas ${respondidos()} de ${TOTAL} retos y ${aciertos()} aciertos.</p>
       <div class="fila-btn"><button class="btn grande" id="seguir">Seguir la aventura ${ICONO.sig}</button></div>
       <div class="fila-btn"><button class="btn sec" id="otro">Soy otra persona / empezar de nuevo</button></div>`
    : `<h2>Registro</h2><p class="suave">Escribe tu nombre y tu apellido: aparecerán en tu certificado.</p>
       <label for="nom">Nombre</label><input type="text" id="nom" autocomplete="given-name" maxlength="30">
       <label for="ape">Apellido</label><input type="text" id="ape" autocomplete="family-name" maxlength="30">
       <p class="aviso" id="aviso"></p>
       <button class="btn grande" id="empezar">Empezar ${ICONO.sig}</button>`;
  pintar(`<section class="portada">${gopherSvg({ ojos: 'arriba', sombrero: true })}
      <h1>Gopher <b>Quest</b></h1>
      <p>Structs en Go</p>
      <div class="chips-niveles">${chips}</div></section>
    <div class="card">${registro}</div>
    <div class="card"><h2>${ICONO.mapa} Cómo se juega</h2>
      <p>Todo pasa en <b>Gopher Quest</b>, un juego de rol donde cada personaje es un <b>struct</b>. Son <b>4 niveles</b> de <b>6 retos</b>: crear personajes, copias y punteros, structs dentro de structs, y slices y maps de structs.</p>
      <p>En cada reto decides algo: qué imprime el código, qué línea falla, qué código funciona o qué campo cambia en la memoria. El panel <b>Memoria</b> muestra cómo quedan las variables, y al final recibes tu informe y tu <b>certificado</b>.</p></div>`);
  if (E.nombre) {
    $('#seguir').onclick = mapa;
    $('#otro').onclick = () => { if (confirm('Se borrará el progreso guardado en este dispositivo. ¿Continuar?')) { E = nuevo(); guardar(); inicio(); } };
    return;
  }
  const valido = s => /^[\p{L}][\p{L}' -]{1,29}$/u.test(s.trim());
  const empezar = () => {
    const n = $('#nom').value, a = $('#ape').value;
    if (!valido(n) || !valido(a)) { $('#aviso').textContent = 'Escribe tu nombre y tu apellido (solo letras).'; return; }
    E = nuevo(nombreBonito(n), nombreBonito(a));
    guardar();
    mapa();
  };
  $('#empezar').onclick = empezar;
  ['#nom', '#ape'].forEach(s => $(s).addEventListener('keydown', e => { if (e.key === 'Enter') empezar(); }));
}

/* ---------------- mapa ---------------- */
function mapa() {
  repaso = false;
  const pct = Math.round(respondidos() / TOTAL * 100);
  const nodos = M.niveles.map((nv, n) => {
    const hecho = nivelHecho(n), abierto = nivelAbierto(n);
    const clase = hecho ? 'hecho' : abierto ? 'actual' : '';
    const der = hecho ? estrellasHTML(estrellas(n)) : abierto ? `<span class="chip">${ICONO.play} Jugar</span>` : `<span class="suave">${ICONO.candado}</span>`;
    return `<button class="nodo ${clase}" data-n="${n}" ${abierto ? '' : 'disabled'}>
      <span class="medalla">${ICONO[nv.icono]}<span class="num">${n + 1}</span></span>
      <span><b>Nivel ${n + 1} · ${esc(nv.titulo)}</b><small>${esc(nv.negocio)} · ${nRetos(n)} retos</small></span>${der}</button>`;
  }).join('');
  pintar(`<h2>${ICONO.mapa} Los niveles</h2>
    <div class="progreso"><i style="width:${pct}%"></i></div>
    <div class="mapa">${nodos}</div>
    ${todoHecho() ? `<div class="fila-btn"><button class="btn grande" id="inf">${ICONO.trofeo} Ver mi informe y mi certificado</button></div>` : ''}`);
  $$('.nodo:not(:disabled)').forEach(b => { b.onclick = () => intro(+b.dataset.n); });
  if (todoHecho()) $('#inf').onclick = informe;
}

/* ---------------- intro de un nivel ---------------- */
function intro(n) {
  const nv = M.niveles[n];
  repaso = nivelHecho(n);
  const temas = [...new Set(nv.temas)].map(t => `<span class="chip">${esc(t)}</span>`).join('');
  const comoSeJuega = n === 0 ? `<div class="card"><h2>${ICONO.ayuda} Cómo se juega</h2>
      <p>Arriba está la <b>situación</b> del reto. Debajo, las <b>instrucciones</b>: lo que debe saber, su misión y cómo se resuelve (el botón ${ICONO.ayuda} las vuelve a mostrar).</p>
      <p>Responda en la zona del reto. Si se equivoca, verá <b>por qué</b> esa elección no sirve y lo vuelve a intentar: el reto se supera con la respuesta correcta y el puntaje cuenta el <b>primer intento</b>. Al acertar, el panel <b>Memoria</b> muestra cómo quedaron las variables.</p></div>` : '';
  pintar(`<div class="cabeza-reto"><button class="btn sec" id="volver">${ICONO.mapa} Mapa</button>
      <span class="chip oscuro">Nivel ${n + 1} · ${esc(nv.titulo)}</span></div>
    <div class="globo">${gopherSvg({ ojos: 'arriba', sombrero: true })}<div class="texto">${esc(nv.contexto)}</div></div>
    <div class="card">
      <div class="caso">${ICONO[nv.icono]}<div><b>${esc(nv.negocio)}</b>${nRetos(n)} retos</div></div>
      <p class="suave" style="margin:0 0 4px">Lo que vas a practicar:</p><div class="vamos">${temas}</div>
      ${repaso ? '<p class="suave"><b>Modo repaso:</b> ya terminaste este nivel; tu puntaje no cambia.</p>' : ''}
      <div class="fila-btn"><button class="btn grande" id="comenzar">Comenzar con el reto ${repaso ? 1 : Math.max(primeroPendiente(n), 0) + 1} ${ICONO.sig}</button></div>
    </div>${tiposHTML(n, true)}${comoSeJuega}`);
  $('#volver').onclick = mapa;
  $('#comenzar').onclick = () => reto(n, repaso ? 0 : Math.max(primeroPendiente(n), 0));
}

/* ---------------- retos cifrados en cadena ----------------
   Cada reto se abre con su llave, que solo trae el reto anterior resuelto bien. Al elegir, se abre solo la
   retroalimentación de lo elegido; la respuesta correcta nunca se muestra. */
const rid = (n, r) => `${M.niveles[n].id}-${r}`;
const despuesDe = (n, r) => r + 1 < nRetos(n) ? [n, r + 1] : n + 1 < J.retos.length ? [n + 1, 0] : null;
const abrirCon = async (dato, ...partes) => Cifra.abrir(await Cifra.llave(...partes), dato);
const contenido = (n, r) => abrirCon(J.retos[n][r].c, E.k[clave(n, r)], rid(n, r), 'reto');
const parte = (n, r, p, i, v) => abrirCon(J.retos[n][r].p[p][i], E.k[clave(n, r)], rid(n, r), p, v);
async function calificar(n, r, rt, bien, detalles, canon) {
  let s = null;
  if (bien) { try { s = await abrirCon(J.retos[n][r].x, E.k[clave(n, r)], rid(n, r), 'fin', canon); } catch { s = null; } }
  const k = clave(n, r);
  if (!repaso && !(k in E.resp)) E.resp[k] = !!s;
  if (s) {
    E.hecho[k] = true;
    const sig = despuesDe(n, r);
    if (sig && s.sig) E.k[clave(...sig)] = s.sig;
  }
  guardar();
  responder(n, r, rt, s, detalles);
}

/* ---------------- un reto ---------------- */
async function reto(n, r) {
  const nv = M.niveles[n];
  if (!E.k[clave(n, r)]) { mapa(); return; }
  const rt = await contenido(n, r);
  const puntos = J.retos[n].map((_, k) => {
    const c = clave(n, k);
    return `<i class="${k === r ? 'ahora' : E.hecho[c] && !repaso ? (E.resp[c] ? 'ok' : 'no') : ''}"></i>`;
  }).join('');
  const conMem = rt.conMem || rt.tipo === 'campo';
  const memInicial = rt.tipo === 'campo' ? '' : `<div class="mem-vacia">Cuando responda bien, aquí verá cómo quedan las variables.</div>`;
  pintar(`<div class="cabeza-reto"><button class="btn sec" id="volver">${ICONO.mapa} Mapa</button>
      <span class="chip oscuro">${esc(nv.titulo)} · Reto ${r + 1} de ${nRetos(n)}</span><span class="puntos">${puntos}</span></div>
    <div class="reto-grid${conMem ? '' : ' sin-mem'}">
      <div class="card regla"><div class="etq">RETO ${r + 1} <span>${esc(rt.tema)}</span></div><p class="texto-regla" id="texto-regla">${rt.regla}</p></div>
      <details class="card ficha" id="ficha" open><summary>${ICONO.ayuda} Instrucciones del reto</summary><div class="fsecs">
        <div class="fsec"><b class="t">Lo que debe saber</b><p>${rt.saber}</p></div>
        <div class="fsec"><b class="t">Su misión</b><p>${rt.mision}</p></div>
        <div class="fsec"><b class="t">Cómo se resuelve</b><p>${rt.como}</p></div></div></details>
      ${conMem ? `<div class="lado">${memCard(memInicial)}${tiposHTML(n)}</div>` : ''}
      <div class="card zona" id="zona"></div>
      ${conMem ? '' : tiposHTML(n)}
      <div class="fila-btn oculto" id="nav"><button class="btn sec" id="reabrir">${ICONO.ojo} Ver retroalimentación</button>
        <button class="btn grande" id="siguiente2"></button></div>
    </div>
    <dialog id="dlg" aria-labelledby="dlg-titulo">
      <div class="dlg-cuerpo" id="retro"></div>
      <div class="dlg-pie"><button class="btn sec" id="cerrar">${ICONO.cerrar} Cerrar</button><button class="btn grande" id="siguiente"></button></div>
    </dialog>`, { ancho: true, ayuda: true });
  $('#volver').onclick = mapa;
  $('#ayuda').onclick = () => { const f = $('#ficha'); f.open = true; f.classList.remove('destello'); void f.offsetWidth; f.classList.add('destello'); f.scrollIntoView({ behavior: 'smooth', block: 'center' }); };
  ({ marcar: zonaMarcar, opcion: zonaOpciones, salida: zonaOpciones, go: zonaOpciones, linea: zonaLinea, campo: zonaCampo })[rt.tipo](n, r, rt);
}

function zonaMarcar(n, r, rt) {
  const elegidas = new Set();
  $('#zona').innerHTML = `<p class="instruccion">${rt.instruccion}</p>
    <p class="cuenta-sel">Elegidas: <span id="cuenta">0</span></p>
    <div class="fila-btn"><button class="btn azul" id="listo" disabled>${ICONO.bien} Listo</button></div>`;
  $$('.tok').forEach(b => {
    b.onclick = () => {
      const t = b.dataset.t;
      elegidas.has(t) ? elegidas.delete(t) : elegidas.add(t);
      b.classList.toggle('sel', elegidas.has(t));
      $('#cuenta').textContent = [...elegidas].join(', ') || '0';
      $('#listo').disabled = !elegidas.size;
    };
  });
  $('#listo').onclick = async () => {
    $('#listo').disabled = true;
    $$('.tok').forEach(b => { b.disabled = true; });
    const toks = $$('.tok').map(b => b.dataset.t), ts = [...elegidas];
    const fb = await Promise.all(ts.map(t => parte(n, r, 'tok', toks.indexOf(t), t)));
    const malas = ts.filter((_, i) => !fb[i].ok), faltan = rt.n - (ts.length - malas.length);
    $$('.tok').forEach(b => {
      const i = ts.indexOf(b.dataset.t);
      b.classList.remove('sel');
      if (i >= 0) b.classList.add(fb[i].ok ? 'ok' : 'no');
    });
    const det = [...malas.map(t => `<b>${esc(t)}</b>: ${fb[ts.indexOf(t)].porque}`),
                 ...(faltan > 0 ? [`Le ${faltan === 1 ? 'falta 1' : `faltan ${faltan}`} por marcar.`] : [])];
    calificar(n, r, rt, !det.length, det, [...ts].sort().join(','));
  };
}

function zonaOpciones(n, r, rt) {
  const orden = barajar(rt.opciones.map((_, i) => i));
  const boton = i => rt.tipo === 'go' ? `<button class="op codigo" data-i="${i}"><pre class="go">${resaltar(rt.opciones[i].t)}</pre></button>`
    : rt.tipo === 'salida' ? `<button class="op codigo" data-i="${i}"><pre class="salida-op">${esc(rt.opciones[i].t)}</pre></button>`
    : `<button class="op texto" data-i="${i}">${esc(rt.opciones[i].t)}</button>`;
  $('#zona').innerHTML = `<p class="instruccion">${rt.pregunta || 'Toque el código que hace lo pedido.'}</p>
    ${rt.codigo ? `<pre class="go codigo-reto">${resaltar(rt.codigo)}</pre>` : ''}
    <div class="opciones una">${orden.map(boton).join('')}</div>`;
  $$('.op').forEach(b => {
    b.onclick = async () => {
      $$('.op').forEach(x => { x.disabled = true; });
      const i = +b.dataset.i, o = rt.opciones[i], fb = await parte(n, r, 'op', i, o.t);
      b.classList.add(fb.ok ? 'ok' : 'no');
      const go = fb.go ? `<span class="go-dice">Go dice: ${esc(fb.go)}</span>` : '';
      calificar(n, r, rt, fb.ok, fb.ok ? [] : [`${fb.porque}${go}`], o.t);
    };
  });
}

function zonaLinea(n, r, rt) {
  $('#zona').innerHTML = `<p class="instruccion">${rt.instruccion}</p>
    <div class="lineas">${rt.lineas.map((l, i) => `<button class="linea" data-i="${i}"><span class="nl">${i + 1}</span>${resaltar(l)}</button>`).join('')}</div>`;
  $$('button.linea').forEach(b => {
    b.onclick = async () => {
      $$('button.linea').forEach(x => { x.disabled = true; });
      const i = +b.dataset.i, fb = await parte(n, r, 'lin', i, String(i));
      b.classList.add(fb.ok ? 'ok' : 'no');
      calificar(n, r, rt, fb.ok, fb.ok ? [] : [fb.porque], String(i));
    };
  });
}

// tocar campos en la memoria (o «Ningún campo cambia»)
function zonaCampo(n, r, rt) {
  const sel = new Set(), ninguno = rt.rutas.includes('∅');
  const pinta = () => {
    $('#memoria').innerHTML = memHTML(rt.mem, { toca: true, sel, ocultar: rt.modo === 'cero' });
    $$('#memoria .mf.toca').forEach(b => { b.onclick = () => alternar(b.dataset.p); });
  };
  const alternar = p => {
    if (p === '∅') { const on = !sel.has('∅'); sel.clear(); if (on) sel.add('∅'); }
    else { sel.delete('∅'); sel.has(p) ? sel.delete(p) : sel.add(p); }
    pinta();
    $('#ninguno')?.classList.toggle('sel', sel.has('∅'));
    $('#cuenta').textContent = sel.has('∅') ? 'Ningún campo cambia' : [...sel].join(', ') || '0';
    $('#listo').disabled = !sel.size;
  };
  $('#zona').innerHTML = `<p class="instruccion">${rt.instruccion}</p>
    ${rt.codigo ? `<pre class="go codigo-reto">${resaltar(rt.codigo)}</pre>` : ''}
    ${ninguno ? `<div class="fila-btn izq"><button class="chipbtn ninguno" id="ninguno">Ningún campo cambia</button></div>` : ''}
    <p class="cuenta-sel">Elegidos: <span id="cuenta">0</span></p>
    <div class="fila-btn"><button class="btn azul" id="listo" disabled>${ICONO.bien} Listo</button></div>`;
  if (ninguno) $('#ninguno').onclick = () => alternar('∅');
  pinta();
  $('#listo').onclick = async () => {
    $('#listo').disabled = true;
    const ps = [...sel];
    const fb = await Promise.all(ps.map(p => parte(n, r, 'campo', rt.rutas.indexOf(p), p)));
    const malas = ps.filter((_, i) => !fb[i].ok), faltan = rt.n - (ps.length - malas.length);
    $('#memoria').innerHTML = memHTML(rt.mem, { ocultar: rt.modo === 'cero' });
    ps.forEach((p, i) => {
      const el = p === '∅' ? $('#ninguno') : $$('#memoria .mf').find(x => x.dataset.p === p);
      if (el) el.classList.add(fb[i].ok ? 'ok' : 'no');
    });
    $$('#memoria .mf, #ninguno').forEach(b => { b.disabled = true; });
    const nombre = p => p === '∅' ? 'Ningún campo cambia' : `<code>${esc(p)}</code>`;
    const det = [...malas.map(p => `${nombre(p)}: ${fb[ps.indexOf(p)].porque}`),
                 ...(faltan > 0 && !sel.has('∅') ? [`Le ${faltan === 1 ? 'falta 1 campo' : `faltan ${faltan} campos`} por marcar.`] : [])];
    calificar(n, r, rt, !det.length, det, [...ps].sort().join(','));
  };
}

/* ---------------- respuesta: al acertar se ve la memoria; al fallar se explica por qué y se reintenta ---------------- */
const STICKER = { marcar: 2, opcion: 0, salida: 7, go: 4, linea: 6, campo: 1 };
function responder(n, r, rt, s, detalles) {
  const ok = !!s, ultimo = r === nRetos(n) - 1;
  let cambio = false;
  if (ok && s.despues && $('#memoria')) {
    $('#memoria').innerHTML = memHTML(s.despues, { cambios: s.cambios, nuevas: s.nuevas });
    cambio = s.cambios.length || s.nuevas.length;
  }
  const arte = ok ? gopherSvg({ ojos: 'feliz', boca: 'abierta', sombrero: true }) : sticker(STICKER[rt.tipo]);
  $('#retro').innerHTML = ok
    ? `<div class="retro ok">${arte}<div><h3 id="dlg-titulo">¡Correcto!</h3><p>${s.explica}</p></div></div>
       ${cambio ? `<div class="nota-diagrama">${ICONO.memoria} Mire el panel Memoria: lo que cambió está resaltado.</div>` : ''}`
    : `<div class="retro no">${arte}<div><h3 id="dlg-titulo">No es correcto</h3>
       ${detalles.length ? `<p><b>Por qué no:</b></p><ul>${detalles.map(d => `<li>${d}</li>`).join('')}</ul>` : ''}
       <p class="suave">Relea la situación y las instrucciones, y vuelva a intentarlo.</p></div></div>`;
  const dlg = $('#dlg');
  const avanzar = () => { dlg.close(); if (!ok) reto(n, r); else if (ultimo) finNivel(n); else reto(n, r + 1); };
  ['#siguiente', '#siguiente2'].forEach(b => {
    $(b).innerHTML = !ok ? 'Intentar de nuevo' : ultimo ? `Terminar el nivel ${ICONO.sig}` : `Siguiente reto ${ICONO.sig}`;
    $(b).onclick = avanzar;
  });
  $('#cerrar').onclick = () => dlg.close();
  $('#reabrir').onclick = () => dlg.showModal();
  dlg.onclose = () => { if (dlg.isConnected) $('#nav').classList.remove('oculto'); };
  dlg.onclick = e => { if (e.target === dlg) dlg.close(); };
  const jug = $('header .jugador');
  if (jug) jug.innerHTML = `<b>${esc(E.nombre)} ${esc(E.apellido)}</b>${aciertos()} de ${TOTAL} aciertos`;
  dlg.showModal();
  $('#retro').scrollTop = 0;
}

function confeti() {
  const c = document.createElement('div'); c.className = 'confeti';
  const colores = ['#EAAA00', '#FFFFFF', '#910048', '#6AD7E5', '#1E9E5A'];
  c.innerHTML = Array.from({ length: 70 }, () => `<i style="left:${Math.random() * 100}%;background:${colores[Math.floor(Math.random() * colores.length)]};animation-duration:${2 + Math.random() * 2.5}s;animation-delay:${Math.random() * .8}s"></i>`).join('');
  document.body.appendChild(c);
  setTimeout(() => c.remove(), 5000);
}

function finNivel(n) {
  const nv = M.niveles[n], est = estrellas(n), bien = aciertosNivel(n);
  const msj = repaso ? 'Repaso terminado. Tu puntaje no cambia.' :
    est === 3 ? '¡Nivel perfecto!' : est === 2 ? '¡Muy bien! Casi perfecto.' : est === 1 ? 'Bien. Repasa los porqués antes del siguiente nivel.' : 'Revisa las explicaciones: el siguiente nivel usa lo de este.';
  const siguiente = n + 1 < J.retos.length;
  const temas = [...new Set(nv.temas)].map(t => `<span class="chip">${esc(t)}</span>`).join('');
  pintar(`<div class="card fin">${gopherSvg(est >= 2 ? { ojos: 'feliz', boca: 'abierta', sombrero: true } : { ojos: 'normal', sombrero: true })}
      <h2 style="justify-content:center">Nivel ${n + 1} · ${esc(nv.titulo)}</h2>
      ${estrellasHTML(est)}
      <p><b>${bien} de ${nRetos(n)}</b> retos correctos al primer intento · ${msj}</p>
      <p class="suave" style="margin:6px 0 4px">Lo que practicaste:</p><div class="vamos centro">${temas}</div>
      <div class="fila-btn">
        ${siguiente ? `<button class="btn grande" id="sig">Ir al nivel ${n + 2} ${ICONO.sig}</button>` : `<button class="btn grande" id="inf">${ICONO.trofeo} Ver mi informe y mi certificado</button>`}
      </div>
      <div class="fila-btn"><button class="btn sec" id="mapa">${ICONO.mapa} Volver al mapa</button></div></div>`);
  if (est >= 2 && !repaso) confeti();
  $('#mapa').onclick = mapa;
  if (siguiente) $('#sig').onclick = () => intro(n + 1);
  else $('#inf').onclick = informe;
}

/* ---------------- informe de entendimiento (primer intento de cada reto) ---------------- */
function porTema() {
  const t = Object.fromEntries(TEMAS.map(x => [x, { bien: 0, total: 0 }]));
  M.niveles.forEach((nv, n) => nv.temas.forEach((tema, r) => {
    const k = clave(n, r); if (!(k in E.resp)) return;
    t[tema].total++; if (E.resp[k]) t[tema].bien++;
  }));
  return TEMAS.map(x => ({ tema: x, ...t[x], p: t[x].total ? Math.round(t[x].bien / t[x].total * 100) : 0 }));
}
const nivelTema = p => p >= 80 ? 'Lo domina' : p >= 50 ? 'En proceso' : 'Debe repasarlo';
function informe() {
  if (!todoHecho()) { mapa(); return; }
  const temas = porTema(), a = aciertos(), p = Math.round(a / TOTAL * 100);
  pintar(`<div class="card"><h2>${ICONO.informe} Informe de entendimiento</h2>
      <p><b>${esc(E.nombre)} ${esc(E.apellido)}</b> · ${a} de ${TOTAL} retos correctos al primer intento (${p} %)</p>
      <div class="temas">${temas.map(x => `<div class="tema"><b>${esc(x.tema)}</b><div class="barra"><i class="${x.p >= 80 ? '' : x.p >= 50 ? 'medio' : 'bajo'}" style="width:${x.p}%"></i></div>
        <span>${x.bien}/${x.total}</span><small>${nivelTema(x.p)}</small></div>`).join('')}</div>
      <div class="fila-btn no-imprimir"><button class="btn grande" id="cert">${ICONO.trofeo} Ver mi certificado</button></div>
      <div class="fila-btn no-imprimir"><button class="btn sec" id="copiar">${ICONO.copiar} Copiar el informe</button>
        <button class="btn sec" id="imprimir">${ICONO.imprimir} Imprimir</button><button class="btn sec" id="mapa">${ICONO.mapa} Mapa</button></div>
      <p class="aviso" id="aviso"></p></div>`);
  $('#cert').onclick = certificado;
  $('#mapa').onclick = mapa;
  $('#imprimir').onclick = () => window.print();
  $('#copiar').onclick = async () => {
    const txt = `Gopher Quest · ${E.nombre} ${E.apellido}\n${a} de ${TOTAL} retos al primer intento (${p} %)\n` +
      temas.map(x => `${x.tema}: ${x.bien}/${x.total} · ${nivelTema(x.p)}`).join('\n');
    try { await navigator.clipboard.writeText(txt); $('#aviso').style.color = 'var(--bien)'; $('#aviso').textContent = 'Informe copiado.'; }
    catch { $('#aviso').textContent = 'No se pudo copiar; usa «Imprimir».'; }
  };
}

/* ---------------- certificado ---------------- */
function rango(p) { return p >= 90 ? 'Maestro de structs' : p >= 75 ? 'Caballero de structs' : p >= 50 ? 'Aprendiz avanzado' : 'Aprendiz de structs'; }
function codigo(texto) {
  let h = 0x811c9dc5;
  for (const ch of texto) { h ^= ch.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; }
  const s = h.toString(36).toUpperCase().padStart(8, '0').slice(-8);
  return s.slice(0, 4) + '-' + s.slice(4);
}
const cargarImg = src => new Promise((ok, mal) => { const i = new Image(); i.onload = () => ok(i); i.onerror = mal; i.src = src; });

async function dibujarCertificado() {
  try { await Promise.all([document.fonts.load('800 60px Poppins'), document.fonts.load('600 30px Poppins'), document.fonts.load('400 28px Poppins')]); } catch { /* fuente del sistema */ }
  const W = 1600, H = 1131, c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d');
  const AZUL = '#002C71', DORADO = '#EAAA00', MAG = '#910048', GRIS = '#4a5461';
  x.fillStyle = '#fff'; x.fillRect(0, 0, W, H);
  x.fillStyle = '#fbf7ec'; x.fillRect(60, 60, W - 120, H - 120);
  x.strokeStyle = DORADO; x.lineWidth = 16; x.strokeRect(28, 28, W - 56, H - 56);
  x.strokeStyle = AZUL; x.lineWidth = 3; x.strokeRect(60, 60, W - 120, H - 120);
  x.fillStyle = DORADO;
  [[60, 60, 1, 1], [W - 60, 60, -1, 1], [60, H - 60, 1, -1], [W - 60, H - 60, -1, -1]].forEach(([a, b, sx, sy]) => {
    x.beginPath(); x.moveTo(a, b); x.lineTo(a + 84 * sx, b); x.lineTo(a, b + 84 * sy); x.closePath(); x.fill();
  });
  x.textAlign = 'left'; x.font = '800 50px Poppins, sans-serif';
  x.fillStyle = AZUL; x.fillText('Gopher', 130, 150);
  x.fillStyle = DORADO; x.fillText('Quest', 130, 206);
  try {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -26 120 162" width="240" height="324">${gopher({ ojos: 'feliz', boca: 'abierta', sombrero: true })}</svg>`;
    const im = await cargarImg('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg));
    x.drawImage(im, W - 290, 70, 176, 238);
  } catch { /* sin mascota */ }
  const centro = (txt, y, fuente, color) => { x.font = fuente; x.fillStyle = color; x.textAlign = 'center'; x.fillText(txt, W / 2, y); };
  centro('CERTIFICADO DE LOGRO', 320, '800 66px Poppins, sans-serif', AZUL);
  x.fillStyle = DORADO; x.fillRect(W / 2 - 160, 342, 320, 6);
  centro('Se otorga a', 410, '400 30px Poppins, sans-serif', GRIS);
  const nombre = `${E.nombre} ${E.apellido}`;
  let tam = 78; x.font = `800 ${tam}px Poppins, sans-serif`;
  while (x.measureText(nombre).width > W - 360 && tam > 40) { tam -= 4; x.font = `800 ${tam}px Poppins, sans-serif`; }
  centro(nombre, 498, `800 ${tam}px Poppins, sans-serif`, MAG);
  x.strokeStyle = DORADO; x.lineWidth = 3; x.beginPath(); x.moveTo(W / 2 - 420, 528); x.lineTo(W / 2 + 420, 528); x.stroke();
  centro('por completar los 4 niveles de structs en Go', 588, '600 30px Poppins, sans-serif', AZUL);
  centro('struct · valor cero · copia · *puntero · anidados · == · range · map de structs', 634, '600 22px "JetBrains Mono", Consolas, monospace', GRIS);
  const a = aciertos(), p = Math.round(a / TOTAL * 100);
  const datos = [[`${a} de ${TOTAL}`, 'retos al primer intento'], [`${p} %`, 'de logro'], [rango(p), 'nivel alcanzado']];
  datos.forEach(([v, et], i) => {
    const cx = W / 2 + (i - 1) * 420, y = 680;
    x.fillStyle = i === 2 ? '#fdf2f7' : '#eef3fb'; x.strokeStyle = i === 2 ? MAG : AZUL; x.lineWidth = 2;
    x.beginPath();
    if (x.roundRect) x.roundRect(cx - 190, y, 380, 104, 18); else x.rect(cx - 190, y, 380, 104);
    x.fill(); x.stroke();
    x.textAlign = 'center'; x.fillStyle = i === 2 ? MAG : AZUL;
    let t = 40; x.font = `800 ${t}px Poppins, sans-serif`;
    while (x.measureText(v).width > 350 && t > 22) { t -= 2; x.font = `800 ${t}px Poppins, sans-serif`; }
    x.fillText(v, cx, y + 56);
    x.font = '400 20px Poppins, sans-serif'; x.fillStyle = GRIS; x.fillText(et, cx, y + 88);
  });
  // entendimiento por tema: 8 temas en 4 columnas
  const temas = porTema();
  x.font = '600 17px Poppins, sans-serif';
  temas.forEach((tm, i) => {
    const col = i % 4, fil = Math.floor(i / 4), cx = 150 + col * 330, y = 830 + fil * 46;
    x.textAlign = 'left'; x.fillStyle = AZUL; x.fillText(tm.tema, cx, y);
    x.fillStyle = '#e8edf4'; x.fillRect(cx, y + 9, 240, 9);
    x.fillStyle = tm.p >= 80 ? '#1E9E5A' : tm.p >= 50 ? DORADO : '#C62839'; x.fillRect(cx, y + 9, 240 * tm.p / 100, 9);
    x.fillStyle = GRIS; x.textAlign = 'right'; x.fillText(`${tm.bien}/${tm.total}`, cx + 296, y + 18);
  });
  const fecha = new Date().toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' });
  x.textAlign = 'left'; x.fillStyle = GRIS; x.font = '400 22px Poppins, sans-serif';
  x.strokeStyle = DORADO; x.lineWidth = 2; x.beginPath(); x.moveTo(130, 935); x.lineTo(W - 130, 935); x.stroke();
  x.fillText(fecha.charAt(0).toUpperCase() + fecha.slice(1), 130, 985);
  x.font = '400 18px Poppins, sans-serif'; x.fillText('Fecha', 130, 1012);
  x.textAlign = 'right'; x.fillStyle = AZUL; x.font = '600 24px "JetBrains Mono", Consolas, monospace';
  x.fillText(codigo(`${nombre}|${a}|${fecha}`), W - 130, 985);
  x.fillStyle = GRIS; x.font = '400 18px Poppins, sans-serif'; x.fillText('Código de verificación', W - 130, 1012);
  return c;
}

async function certificado() {
  if (!todoHecho()) { mapa(); return; }
  pintar(`<div class="card centro"><h2 style="justify-content:center">${ICONO.trofeo} Tu certificado</h2>
      <p class="suave" id="gen">Generando…</p><div id="certzona"></div></div>`);
  const c = await dibujarCertificado();
  const url = c.toDataURL('image/png');
  const archivo = `Certificado-Gopher-Quest-${E.nombre}-${E.apellido}.png`.replace(/\s+/g, '-');
  $('#certzona').innerHTML = `<img class="cert" src="${url}" alt="Certificado de ${esc(E.nombre)} ${esc(E.apellido)}">
    <div class="fila-btn"><a class="btn grande" id="descargar" href="${url}" download="${esc(archivo)}">${ICONO.descargar} Descargar certificado</a></div>
    <p class="suave">En el celular también puedes mantener presionada la imagen para guardarla.</p>
    <div class="fila-btn"><button class="btn sec" id="inf">${ICONO.informe} Ver mi informe</button><button class="btn sec" id="mapa">${ICONO.mapa} Volver al mapa</button></div>`;
  $('#gen').remove();
  $('#mapa').onclick = mapa;
  $('#inf').onclick = informe;
  confeti();
}

/* ---------------- arranque ---------------- */
async function arrancar() {
  M = await abrirCon(J.mapa, J.sal, 'mapa');
  TOTAL = J.retos.reduce((s, x) => s + x.length, 0);
  TEMAS = M.temas;
  K0 = await Cifra.huella(J.sal, 'inicio');
  E = cargar();
  inicio();
}
Promise.all([document.fonts.load('15px "JetBrains Mono"'), document.fonts.load('700 16px Poppins'), document.fonts.load('400 15px Poppins')])
  .catch(() => null).then(arrancar);
