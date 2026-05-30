/* ===================================================
   OVA Energías Renovables — app.js
   =================================================== */

/* ─── SIDEBAR ─── */
const hamburgerBtn   = document.getElementById('hamburgerBtn');
const sidebar        = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

function openSidebar()  { sidebar.classList.add('open'); sidebarOverlay.classList.add('active'); }
function closeSidebar() { sidebar.classList.remove('open'); sidebarOverlay.classList.remove('active'); }

if (hamburgerBtn)   hamburgerBtn.addEventListener('click', openSidebar);
if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

/* ─── SECTION NAVIGATION ─── */
const navItems    = document.querySelectorAll('.nav-item[data-section]');
const subNavItems = document.querySelectorAll('.sub-nav-item[data-section]');
const panels      = document.querySelectorAll('.section-panel');
const actPanels   = { act1: 'panel-act1', act2: 'panel-act2', act3: 'panel-act3', act4: 'panel-act4' };

function showSection(sectionId) {
  panels.forEach(p => p.classList.remove('active'));
  const target = document.getElementById('panel-' + sectionId);
  if (target) target.classList.add('active');
  navItems.forEach(n => {
    n.classList.toggle('active', n.dataset.section === sectionId);
  });
  if (window.innerWidth < 768) closeSidebar();
}

function showAct(actId) {
  showSection('actividades');
  Object.values(actPanels).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  const el = document.getElementById(actPanels[actId]);
  if (el) el.style.display = 'block';
  subNavItems.forEach(s => s.classList.toggle('active', s.dataset.act === actId));
}

navItems.forEach(btn => {
  btn.addEventListener('click', () => {
    const section = btn.dataset.section;
    if (section === 'actividades') {
      const sub = document.getElementById('sub-actividades');
      btn.classList.toggle('open');
      sub.classList.toggle('open');
    }
    showSection(section);
    if (section === 'actividades') {
      const firstSub = document.querySelector('.sub-nav-item');
      if (firstSub) showAct(firstSub.dataset.act);
    }
  });
});

subNavItems.forEach(btn => {
  btn.addEventListener('click', () => showAct(btn.dataset.act));
});

/* ═══════════════════════════════════════════════════
   ACTIVIDAD 1 — CRUCIGRAMA
═══════════════════════════════════════════════════ */
/*
  Mini crucigrama 7x7
  Palabras:
    SOLAR   → fila 0, col 0, horizontal
    EOLICA  → fila 0, col 0, vertical  (E empieza en fila 0)
    OLA     → fila 2, col 2, horizontal
    LIMPIA  → fila 4, col 1, horizontal
    AGUA    → fila 1, col 3, vertical
*/
const cwWords = [
  { word: 'SOLAR',  row: 0, col: 0, dir: 'across', clue: '1. Energía que proviene de la radiación del ___.' },
  { word: 'EOLICA', row: 0, col: 0, dir: 'down',   clue: '1. Energía producida por el viento (adj.).' },
  { word: 'AGUA',   row: 1, col: 3, dir: 'down',   clue: '2. Fluido que usan las centrales hidroeléctricas.' },
  { word: 'LIMPIA', row: 4, col: 1, dir: 'across', clue: '3. Adjetivo que describe a las energías renovables.' },
  { word: 'OLA',    row: 2, col: 2, dir: 'across', clue: '4. Movimiento del mar que puede generar energía.' },
];
const CW_ROWS = 7, CW_COLS = 7;
let cwGrid = [];

function buildCrossword() {
  cwGrid = Array.from({ length: CW_ROWS }, () => Array(CW_COLS).fill(null));
  cwWords.forEach(entry => {
    entry.word.split('').forEach((ch, i) => {
      const r = entry.dir === 'across' ? entry.row : entry.row + i;
      const c = entry.dir === 'across' ? entry.col + i : entry.col;
      cwGrid[r][c] = ch;
    });
  });

  const gridEl = document.getElementById('crossword-grid');
  if (!gridEl) return;
  gridEl.innerHTML = '';
  gridEl.style.gridTemplateColumns = `repeat(${CW_COLS}, 36px)`;

  // Number map
  const numberMap = {};
  cwWords.forEach(entry => {
    const key = entry.row + '-' + entry.col;
    if (!numberMap[key]) numberMap[key] = entry.clue.match(/^(\d+)\./)[1];
  });

  for (let r = 0; r < CW_ROWS; r++) {
    for (let c = 0; c < CW_COLS; c++) {
      const cell = document.createElement('div');
      cell.className = 'cw-cell';
      if (cwGrid[r][c] !== null) {
        cell.classList.add('cw-active');
        const inp = document.createElement('input');
        inp.maxLength = 1;
        inp.dataset.answer = cwGrid[r][c];
        inp.dataset.r = r; inp.dataset.c = c;
        inp.addEventListener('input', e => {
          e.target.value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
          if (e.target.value) {
            const next = gridEl.querySelector(`input[data-r="${r}"][data-c="${c+1}"], input[data-r="${r+1}"][data-c="${c}"]`);
          }
          resetCWFeedback();
        });
        const numKey = r + '-' + c;
        if (numberMap[numKey]) {
          const num = document.createElement('span');
          num.className = 'cw-num';
          num.textContent = numberMap[numKey];
          cell.appendChild(num);
        }
        cell.appendChild(inp);
      } else {
        cell.classList.add('cw-blocked');
      }
      gridEl.appendChild(cell);
    }
  }

  // Pistas
  const acrossEl = document.getElementById('clues-across');
  const downEl   = document.getElementById('clues-down');
  if (acrossEl) acrossEl.innerHTML = '';
  if (downEl)   downEl.innerHTML   = '';
  cwWords.forEach(entry => {
    const div = document.createElement('div');
    div.className = 'clue-item';
    div.textContent = entry.clue;
    if (entry.dir === 'across' && acrossEl) acrossEl.appendChild(div);
    else if (downEl) downEl.appendChild(div);
  });

  document.getElementById('crossword-feedback').className = 'feedback-msg';
  document.getElementById('crossword-score').style.display = 'none';
}

function resetCWFeedback() {
  document.querySelectorAll('.cw-active input').forEach(i => i.classList.remove('correct-ans','wrong-ans'));
  document.getElementById('crossword-feedback').className = 'feedback-msg';
  document.getElementById('crossword-score').style.display = 'none';
}

document.getElementById('checkCrossword')?.addEventListener('click', () => {
  const inputs = document.querySelectorAll('.cw-active input');
  let correct = 0, total = 0;
  inputs.forEach(inp => {
    total++;
    if (inp.value.trim() === inp.dataset.answer) {
      inp.classList.add('correct-ans'); inp.classList.remove('wrong-ans'); correct++;
    } else {
      inp.classList.add('wrong-ans'); inp.classList.remove('correct-ans');
    }
  });
  const fb = document.getElementById('crossword-feedback');
  fb.className = correct === total ? 'feedback-msg correct' : 'feedback-msg wrong';
  fb.textContent = correct === total
    ? '🎉 ¡Crucigrama completado perfectamente!'
    : `Tienes ${correct} de ${total} letras correctas. Las incorrectas están en rojo.`;
  const sc = document.getElementById('crossword-score');
  sc.textContent = `✨ Puntaje: ${correct}/${total}`;
  sc.style.display = 'inline-flex';
});

document.getElementById('resetCrossword')?.addEventListener('click', buildCrossword);
buildCrossword();

/* ═══════════════════════════════════════════════════
   ACTIVIDAD 2 — ORDENAR PASOS
═══════════════════════════════════════════════════ */
const sortSteps = [
  { id: 1, text: '☀️ El sol emite radiación solar hacia la Tierra.' },
  { id: 2, text: '🔲 Los paneles fotovoltaicos absorben la radiación solar.' },
  { id: 3, text: '⚡ Las células solares convierten la luz en corriente continua (DC).' },
  { id: 4, text: '🔄 El inversor transforma la corriente continua en corriente alterna (AC).' },
  { id: 5, text: '🏠 La electricidad se distribuye al hogar o a la red eléctrica.' },
];

let sortCurrent = [];

function buildSort() {
  sortCurrent = [...sortSteps].sort(() => Math.random() - 0.5);
  const listEl = document.getElementById('sort-list');
  if (!listEl) return;
  renderSort();
  document.getElementById('sort-feedback').className = 'feedback-msg';
  document.getElementById('sort-score').style.display = 'none';
}

function renderSort() {
  const listEl = document.getElementById('sort-list');
  listEl.innerHTML = '';
  sortCurrent.forEach((step, idx) => {
    const item = document.createElement('div');
    item.className = 'sort-item';
    item.dataset.idx = idx;
    item.innerHTML = `
      <span class="sort-num">${idx + 1}</span>
      <span class="sort-text">${step.text}</span>
      <div class="sort-btns">
        <button class="sort-btn" onclick="moveSort(${idx}, -1)" ${idx === 0 ? 'disabled' : ''}>↑</button>
        <button class="sort-btn" onclick="moveSort(${idx}, 1)" ${idx === sortCurrent.length - 1 ? 'disabled' : ''}>↓</button>
      </div>`;
    listEl.appendChild(item);
  });
}

function moveSort(idx, dir) {
  const newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= sortCurrent.length) return;
  [sortCurrent[idx], sortCurrent[newIdx]] = [sortCurrent[newIdx], sortCurrent[idx]];
  renderSort();
  document.getElementById('sort-feedback').className = 'feedback-msg';
}

document.getElementById('checkSort')?.addEventListener('click', () => {
  const correct = sortCurrent.every((step, i) => step.id === i + 1);
  const fb = document.getElementById('sort-feedback');
  if (correct) {
    fb.className = 'feedback-msg correct';
    fb.textContent = '🎉 ¡Excelente! El orden del proceso es correcto.';
    const sc = document.getElementById('sort-score');
    sc.textContent = '✨ Puntaje: 5/5';
    sc.style.display = 'inline-flex';
  } else {
    let pts = sortCurrent.filter((s, i) => s.id === i + 1).length;
    fb.className = 'feedback-msg wrong';
    fb.textContent = `Hay ${sortCurrent.length - pts} paso(s) fuera de orden. Sigue intentando.`;
    const sc = document.getElementById('sort-score');
    sc.textContent = `✨ Puntaje: ${pts}/${sortCurrent.length}`;
    sc.style.display = 'inline-flex';
  }
});

document.getElementById('resetSort')?.addEventListener('click', buildSort);
buildSort();

/* ═══════════════════════════════════════════════════
   ACTIVIDAD 3 — SELECCIÓN MÚLTIPLE
═══════════════════════════════════════════════════ */
const mcData = [
  {
    q: '¿Cuál de estos dispositivos se usa para capturar energía solar?',
    opts: ['Aerogenerador', 'Panel fotovoltaico', 'Turbina de gas', 'Reactor nuclear'],
    ans: 1
  },
  {
    q: '¿Qué tipo de energía usa la fuerza del viento?',
    opts: ['Geotérmica', 'Mareomotriz', 'Eólica', 'Biomasa'],
    ans: 2
  },
  {
    q: '¿Cuál es la principal ventaja de las energías renovables?',
    opts: ['Son muy baratas de instalar', 'No producen gases de efecto invernadero', 'Son las más potentes', 'No necesitan mantenimiento'],
    ans: 1
  },
  {
    q: '¿De dónde obtiene su energía una central geotérmica?',
    opts: ['Del sol', 'Del viento', 'Del calor interno de la Tierra', 'Del movimiento de las mareas'],
    ans: 2
  },
  {
    q: '¿Qué transforma la energía del agua en electricidad?',
    opts: ['Panel solar', 'Turbina hidráulica', 'Inversor', 'Pila de combustible'],
    ans: 1
  },
];

let mcSelections = {};

function buildMC() {
  mcSelections = {};
  const listEl = document.getElementById('mc-list');
  if (!listEl) return;
  listEl.innerHTML = '';
  mcData.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'mc-item';
    div.innerHTML = `<div class="mc-question">${i+1}. ${item.q}</div>
      <div class="mc-opts" id="mc-opts-${i}">
        ${item.opts.map((opt, j) => `
          <button class="mc-opt" data-q="${i}" data-opt="${j}">${String.fromCharCode(65+j)}. ${opt}</button>
        `).join('')}
      </div>`;
    listEl.appendChild(div);
  });
  listEl.querySelectorAll('.mc-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.dataset.q;
      listEl.querySelectorAll(`.mc-opt[data-q="${q}"]`).forEach(b => b.classList.remove('mc-picked'));
      btn.classList.add('mc-picked');
      mcSelections[q] = +btn.dataset.opt;
    });
  });
  document.getElementById('mc-feedback').className = 'feedback-msg';
  document.getElementById('mc-score').style.display = 'none';
}

document.getElementById('checkMC')?.addEventListener('click', () => {
  let correct = 0;
  mcData.forEach((item, i) => {
    const btns = document.querySelectorAll(`.mc-opt[data-q="${i}"]`);
    btns.forEach(b => b.disabled = true);
    btns.forEach(b => {
      const opt = +b.dataset.opt;
      b.classList.remove('mc-picked');
      if (opt === item.ans) b.classList.add('result-correct');
      else if (mcSelections[i] === opt) b.classList.add('result-wrong');
    });
    if (mcSelections[i] === item.ans) correct++;
  });
  const fb = document.getElementById('mc-feedback');
  fb.className = correct === mcData.length ? 'feedback-msg correct' : 'feedback-msg wrong';
  fb.textContent = correct === mcData.length
    ? '🎉 ¡Perfecto! Todas las respuestas son correctas.'
    : `Obtuviste ${correct} de ${mcData.length}. Las correctas están en verde.`;
  const sc = document.getElementById('mc-score');
  sc.textContent = `✨ Puntaje: ${correct}/${mcData.length}`;
  sc.style.display = 'inline-flex';
});

document.getElementById('resetMC')?.addEventListener('click', buildMC);
buildMC();

/* ═══════════════════════════════════════════════════
   ACTIVIDAD 4 — CLASIFICAR ENERGÍAS
═══════════════════════════════════════════════════ */
const classifyItems = [
  { id: 'solar',    label: '☀️ Solar',       cat: 'renovable' },
  { id: 'eolica',   label: '💨 Eólica',       cat: 'renovable' },
  { id: 'carbon',   label: '⚫ Carbón',        cat: 'norenovable' },
  { id: 'hidro',    label: '💧 Hidráulica',    cat: 'renovable' },
  { id: 'petroleo', label: '🛢️ Petróleo',      cat: 'norenovable' },
  { id: 'geo',      label: '🌋 Geotérmica',    cat: 'renovable' },
  { id: 'nuclear',  label: '☢️ Nuclear',        cat: 'norenovable' },
  { id: 'biomasa',  label: '🌿 Biomasa',        cat: 'renovable' },
  { id: 'gas',      label: '🔥 Gas Natural',    cat: 'norenovable' },
  { id: 'marea',    label: '🌊 Mareomotriz',    cat: 'renovable' },
];

let classifyPlaced = {};

function buildClassify() {
  classifyPlaced = {};
  const bankEl  = document.getElementById('classify-bank');
  const zoneR   = document.getElementById('zone-renovable');
  const zoneNR  = document.getElementById('zone-norenovable');
  if (!bankEl) return;
  bankEl.innerHTML = '';
  zoneR.innerHTML  = '';
  zoneNR.innerHTML = '';

  const shuffled = [...classifyItems].sort(() => Math.random() - 0.5);
  shuffled.forEach(item => {
    const chip = createClassifyChip(item);
    bankEl.appendChild(chip);
  });

  [zoneR, zoneNR].forEach(zone => {
    zone.addEventListener('dragover', e => e.preventDefault());
    zone.addEventListener('drop', e => {
      e.preventDefault();
      const id = e.dataTransfer.getData('text/plain');
      const chip = document.getElementById('classify-chip-' + id);
      if (chip) {
        zone.appendChild(chip);
        classifyPlaced[id] = zone.id === 'zone-renovable' ? 'renovable' : 'norenovable';
      }
    });
  });

  document.getElementById('classify-feedback').className = 'feedback-msg';
  document.getElementById('classify-score').style.display = 'none';
}

function createClassifyChip(item) {
  const chip = document.createElement('div');
  chip.className = 'classify-chip';
  chip.id = 'classify-chip-' + item.id;
  chip.textContent = item.label;
  chip.draggable = true;
  chip.dataset.id = item.id;
  chip.dataset.cat = item.cat;
  chip.addEventListener('dragstart', e => e.dataTransfer.setData('text/plain', item.id));
  // Touch / click fallback
  chip.addEventListener('click', () => {
    const zoneR  = document.getElementById('zone-renovable');
    const zoneNR = document.getElementById('zone-norenovable');
    const bank   = document.getElementById('classify-bank');
    if (chip.parentElement === bank) {
      // move to renovable first if not there
      zoneR.appendChild(chip);
      classifyPlaced[item.id] = 'renovable';
    } else if (chip.parentElement === zoneR) {
      zoneNR.appendChild(chip);
      classifyPlaced[item.id] = 'norenovable';
    } else {
      bank.appendChild(chip);
      delete classifyPlaced[item.id];
    }
  });
  return chip;
}

document.getElementById('checkClassify')?.addEventListener('click', () => {
  let correct = 0;
  classifyItems.forEach(item => {
    const chip = document.getElementById('classify-chip-' + item.id);
    if (!chip) return;
    chip.classList.remove('correct-ans', 'wrong-ans');
    const placed = classifyPlaced[item.id];
    if (placed === item.cat) { chip.classList.add('correct-ans'); correct++; }
    else if (placed) chip.classList.add('wrong-ans');
  });
  const total = classifyItems.length;
  const fb = document.getElementById('classify-feedback');
  fb.className = correct === total ? 'feedback-msg correct' : 'feedback-msg wrong';
  fb.textContent = correct === total
    ? '🎉 ¡Clasificaste todas las energías correctamente!'
    : `Clasificaste ${correct} de ${total} correctamente. Los incorrectos están en rojo.`;
  const sc = document.getElementById('classify-score');
  sc.textContent = `✨ Puntaje: ${correct}/${total}`;
  sc.style.display = 'inline-flex';
});

document.getElementById('resetClassify')?.addEventListener('click', buildClassify);
buildClassify();

/* ═══════════════════════════════════════════════════
   EXAMEN FINAL — 10 PREGUNTAS
   Escala: 0–2.9 Reprueba | 3.0–5.0 Aprueba
═══════════════════════════════════════════════════ */
const examQuestions = [
  {
    q: '¿Qué son las energías renovables?',
    opts: [
      'Fuentes de energía que se agotan con el tiempo',
      'Fuentes de energía que provienen de recursos naturales que se regeneran constantemente',
      'Fuentes de energía derivadas del petróleo',
      'Fuentes de energía que solo funcionan de noche'
    ],
    ans: 1
  },
  {
    q: '¿Qué dispositivo convierte la luz solar directamente en electricidad?',
    opts: ['Turbina eólica', 'Reactor nuclear', 'Panel fotovoltaico', 'Caldera de vapor'],
    ans: 2
  },
  {
    q: '¿Cuál de las siguientes es una fuente de energía NO renovable?',
    opts: ['Energía solar', 'Energía eólica', 'Energía hidráulica', 'Carbón mineral'],
    ans: 3
  },
  {
    q: '¿Qué genera la energía mareomotriz?',
    opts: [
      'El calor del interior de la Tierra',
      'El movimiento de las mareas y corrientes marinas',
      'La quema de materia orgánica',
      'La radiación del sol'
    ],
    ans: 1
  },
  {
    q: 'Una central hidroeléctrica genera electricidad usando:',
    opts: ['La presión del viento', 'La fuerza del agua en movimiento', 'El calor geotérmico', 'La combustión del gas natural'],
    ans: 1
  },
  {
    q: '¿Qué gas de efecto invernadero se evita al usar energías renovables?',
    opts: ['Oxígeno (O₂)', 'Nitrógeno (N₂)', 'Dióxido de carbono (CO₂)', 'Helio (He)'],
    ans: 2
  },
  {
    q: '¿Cómo se llama la máquina que convierte la energía del viento en electricidad?',
    opts: ['Panel solar', 'Aerogenerador', 'Turbina de vapor', 'Pila de combustible'],
    ans: 1
  },
  {
    q: 'La energía geotérmica proviene de:',
    opts: [
      'La radiación del sol que calienta el suelo',
      'Los vientos fuertes del hemisferio norte',
      'El calor interno de la Tierra',
      'El movimiento de las olas del mar'
    ],
    ans: 2
  },
  {
    q: '¿Cuál es un beneficio económico de las energías renovables?',
    opts: [
      'Aumentan la dependencia del petróleo',
      'Son siempre más caras que las fósiles',
      'Reducen la dependencia de combustibles fósiles y sus costos',
      'Solo benefician a países ricos'
    ],
    ans: 2
  },
  {
    q: 'La biomasa obtiene energía a partir de:',
    opts: [
      'La fuerza de las olas del mar',
      'La radiación ultravioleta del sol',
      'El calor del interior de la Tierra',
      'La quema o transformación de materia orgánica'
    ],
    ans: 3
  },
];

let examSelections = {};
let examSubmitted = false;

function buildExam() {
  examSelections = {};
  examSubmitted = false;
  const container = document.getElementById('exam-questions');
  const resultEl  = document.getElementById('exam-result');
  if (!container) return;
  container.innerHTML = '';
  resultEl.style.display = 'none';
  resultEl.innerHTML = '';

  examQuestions.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'exam-q-block';
    div.innerHTML = `
      <div class="exam-q-text">${i+1}. ${item.q}</div>
      <div class="exam-opts" id="exam-opts-${i}">
        ${item.opts.map((opt, j) => `
          <label class="exam-opt-label" id="exam-lbl-${i}-${j}">
            <input type="radio" name="exam-q${i}" value="${j}" />
            <span>${String.fromCharCode(65+j)}. ${opt}</span>
          </label>
        `).join('')}
      </div>`;
    container.appendChild(div);

    div.querySelectorAll('input[type=radio]').forEach(radio => {
      radio.addEventListener('change', () => {
        examSelections[i] = +radio.value;
      });
    });
  });
}

document.getElementById('submitExam')?.addEventListener('click', () => {
  if (examSubmitted) return;

  // Check all answered
  const unanswered = examQuestions.filter((_, i) => examSelections[i] === undefined).length;
  if (unanswered > 0) {
    const res = document.getElementById('exam-result');
    res.style.display = 'block';
    res.innerHTML = `<div class="exam-warning">⚠️ Faltan ${unanswered} pregunta(s) por responder. Por favor responde todas antes de enviar.</div>`;
    return;
  }

  examSubmitted = true;
  let correct = 0;

  examQuestions.forEach((item, i) => {
    // disable radios
    const radios = document.querySelectorAll(`input[name="exam-q${i}"]`);
    radios.forEach(r => r.disabled = true);

    const selected = examSelections[i];
    if (selected === item.ans) correct++;

    // Highlight answers
    item.opts.forEach((_, j) => {
      const lbl = document.getElementById(`exam-lbl-${i}-${j}`);
      if (!lbl) return;
      if (j === item.ans) lbl.classList.add('exam-correct');
      else if (j === selected && j !== item.ans) lbl.classList.add('exam-wrong');
    });
  });

  const total = examQuestions.length;
  // Escala 0-5: nota = (correctas / total) * 5
  const nota = parseFloat(((correct / total) * 5).toFixed(1));
  const aprueba = nota >= 3.0;

  const resultEl = document.getElementById('exam-result');
  resultEl.style.display = 'block';
  resultEl.innerHTML = `
    <div class="exam-score-box ${aprueba ? 'exam-pass' : 'exam-fail'}">
      <div class="exam-score-title">${aprueba ? '🎉 ¡APROBADO!' : '❌ REPROBADO'}</div>
      <div class="exam-score-num">${nota.toFixed(1)} / 5.0</div>
      <div class="exam-score-detail">${correct} de ${total} respuestas correctas</div>
      <div class="exam-score-msg">${
        aprueba
          ? nota === 5 ? '¡Perfecto! Dominas el tema de energías renovables.'
            : nota >= 4 ? '¡Muy bien! Tienes un excelente manejo del tema.'
            : '¡Bien! Aprobaste, pero puedes repasar para mejorar.'
          : nota >= 2 ? 'Estuviste cerca. Te recomendamos repasar el contenido e intentarlo de nuevo.'
            : 'Necesitas repasar el contenido antes de volver a intentarlo.'
      }</div>
    </div>`;
});

document.getElementById('resetExam')?.addEventListener('click', buildExam);
buildExam();

/* initial section */
showSection('contenido');
