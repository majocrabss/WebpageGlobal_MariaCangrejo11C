// c8.js — Manual Mode logic

let c8Mode = 'mean';
let c8Tail = 'two';

function syncPair(sliderId, boxId, cb) {
  const slider = document.getElementById(sliderId);
  const box    = document.getElementById(boxId);
  if (!slider || !box) return;
  slider.addEventListener('input', () => { box.value = slider.value; cb(); });
  box.addEventListener('input',   () => { slider.value = box.value;  cb(); });
}

function initC8() {
  document.querySelectorAll('#modeGroup .mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#modeGroup .mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      c8Mode = btn.dataset.mode;
      document.getElementById('meanFields').style.display = c8Mode === 'mean' ? '' : 'none';
      document.getElementById('propFields').style.display = c8Mode === 'proportion' ? '' : 'none';
      updateC8();
    });
  });

  document.querySelectorAll('#tailGroup .tail-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#tailGroup .tail-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      c8Tail = btn.dataset.tail;
      updateC8();
    });
  });

  syncPair('alphaSlider', 'alphaBox',   updateC8);
  syncPair('mu0Slider',   'mu0Box',     updateC8);
  syncPair('xbarSlider',  'xbarBox',    updateC8);
  syncPair('sigmaSlider', 'sigmaBox',   updateC8);
  syncPair('nMeanSlider', 'nMeanBox',   updateC8);
  syncPair('p0Slider',    'p0Box',      updateC8);
  syncPair('phatSlider',  'phatBox',    updateC8);
  syncPair('nPropSlider', 'nPropBox',   updateC8);

  updateC8();
}

function updateC8() {
  const alpha = parseFloat(document.getElementById('alphaBox').value) || 0.05;
  let zStat;

  if (c8Mode === 'mean') {
    const mu0   = parseFloat(document.getElementById('mu0Box').value)   || 100;
    const xbar  = parseFloat(document.getElementById('xbarBox').value)  || 105;
    const sigma = parseFloat(document.getElementById('sigmaBox').value) || 20;
    const n     = parseFloat(document.getElementById('nMeanBox').value) || 50;
    if (sigma <= 0 || n <= 0) return;
    zStat = zStatMean(xbar, mu0, sigma, n);
  } else {
    const p0   = parseFloat(document.getElementById('p0Box').value)   || 0.50;
    const phat = parseFloat(document.getElementById('phatBox').value) || 0.55;
    const n    = parseFloat(document.getElementById('nPropBox').value) || 100;
    if (n <= 0 || p0 <= 0 || p0 >= 1) return;
    zStat = zStatProp(phat, p0, n);
  }

  const pValue   = calcPValue(zStat, c8Tail);
  const critVals = criticalValues(alpha, c8Tail);
  const reject   = pValue < alpha;

  drawNormalCurve('normalCanvas', zStat, c8Tail, alpha, pValue);

  document.getElementById('canvasLegend').innerHTML = `
    <span><span class="legend-dot" style="background:#e05c5c;"></span>z = ${fmt(zStat,3)}</span>
    <span><span class="legend-dot" style="background:rgba(224,92,92,0.55);"></span>P-value region</span>
    <span><span class="legend-dot" style="background:rgba(232,197,71,0.45);"></span>Critical region</span>
  `;

  document.getElementById('zVal').textContent    = fmt(zStat, 4);
  document.getElementById('pVal').textContent    = fmtP(pValue);
  document.getElementById('critVal').textContent = critVals.map(v => fmt(v,4)).join(' / ');
  document.getElementById('alphaVal').textContent = fmt(alpha, 2);

  const box   = document.getElementById('decisionBox');
  const title = document.getElementById('decisionTitle');
  const text  = document.getElementById('decisionText');

  if (reject) {
    box.className   = 'decision-box reject';
    title.textContent = '✗  Reject H₀';
    title.style.color = 'var(--reject)';
    text.textContent  = `p-value (${fmtP(pValue)}) < α (${fmt(alpha,2)}). There is sufficient statistical evidence to reject the null hypothesis.`;
  } else {
    box.className   = 'decision-box fail';
    title.textContent = '✓  Fail to Reject H₀';
    title.style.color = 'var(--accent2)';
    text.textContent  = `p-value (${fmtP(pValue)}) ≥ α (${fmt(alpha,2)}). There is not sufficient evidence to reject the null hypothesis.`;
  }
}
