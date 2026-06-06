// canvas.js — Normal curve drawing engine

function drawNormalCurve(canvasId, zStat, tail, alpha, pValue) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.clientWidth || canvas.width;
  const H = canvas.clientHeight || canvas.height;
  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  const PAD_L = 50, PAD_R = 30, PAD_T = 28, PAD_B = 40;
  const cw = W - PAD_L - PAD_R;
  const ch = H - PAD_T - PAD_B;
  const Z_MIN = -4, Z_MAX = 4;
  const STEPS = 400;
  const dz = (Z_MAX - Z_MIN) / STEPS;

  const toX = z  => PAD_L + ((z - Z_MIN) / (Z_MAX - Z_MIN)) * cw;
  const toY = p  => PAD_T + ch - (p / 0.42) * ch;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  const critVals = criticalValues(alpha, tail);

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let z = -3; z <= 3; z++) {
    ctx.beginPath(); ctx.moveTo(toX(z), PAD_T); ctx.lineTo(toX(z), PAD_T + ch); ctx.stroke();
  }

  // Shaded region helper
  function shade(zLo, zHi, color) {
    ctx.beginPath();
    ctx.moveTo(clamp(toX(zLo), PAD_L, PAD_L+cw), toY(0));
    for (let i = 0; i <= STEPS; i++) {
      const z = Z_MIN + i * dz;
      if (z < zLo || z > zHi) continue;
      ctx.lineTo(clamp(toX(z), PAD_L, PAD_L+cw), toY(normalPDF(z)));
    }
    ctx.lineTo(clamp(toX(zHi), PAD_L, PAD_L+cw), toY(0));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  // Critical region (yellow tint)
  if (tail === 'left')       shade(Z_MIN, critVals[0], 'rgba(232,197,71,0.15)');
  else if (tail === 'right') shade(critVals[0], Z_MAX, 'rgba(232,197,71,0.15)');
  else { shade(Z_MIN, critVals[0], 'rgba(232,197,71,0.15)'); shade(critVals[1], Z_MAX, 'rgba(232,197,71,0.15)'); }

  // P-value region (red)
  if (tail === 'left')       shade(Z_MIN, zStat, 'rgba(224,92,92,0.45)');
  else if (tail === 'right') shade(zStat, Z_MAX, 'rgba(224,92,92,0.45)');
  else { const a = Math.abs(zStat); shade(Z_MIN, -a, 'rgba(224,92,92,0.45)'); shade(a, Z_MAX, 'rgba(224,92,92,0.45)'); }

  // Normal curve
  ctx.beginPath();
  for (let i = 0; i <= STEPS; i++) {
    const z = Z_MIN + i * dz;
    i === 0 ? ctx.moveTo(toX(z), toY(normalPDF(z))) : ctx.lineTo(toX(z), toY(normalPDF(z)));
  }
  ctx.strokeStyle = 'rgba(232,230,220,0.90)'; ctx.lineWidth = 2; ctx.stroke();

  // Baseline
  ctx.beginPath(); ctx.moveTo(PAD_L, toY(0)); ctx.lineTo(PAD_L+cw, toY(0));
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1; ctx.stroke();

  // Critical value lines
  critVals.forEach(cv => {
    const x = toX(cv);
    ctx.beginPath(); ctx.moveTo(x, PAD_T); ctx.lineTo(x, toY(0));
    ctx.setLineDash([5,4]); ctx.strokeStyle = 'rgba(232,197,71,0.7)'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(232,197,71,0.9)'; ctx.font = "10px 'DM Mono',monospace";
    ctx.textAlign = cv < 0 ? 'left' : 'right';
    ctx.fillText('z*='+fmt(cv,2), x + (cv < 0 ? 4 : -4), PAD_T + 12);
  });

  // Test stat line
  const zX = clamp(toX(zStat), PAD_L+2, PAD_L+cw-2);
  ctx.beginPath(); ctx.moveTo(zX, PAD_T); ctx.lineTo(zX, toY(0));
  ctx.strokeStyle = '#e05c5c'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#e05c5c'; ctx.font = "bold 10px 'DM Mono',monospace";
  ctx.textAlign = zStat >= 0 ? 'right' : 'left';
  ctx.fillText('z='+fmt(zStat,2), zX + (zStat >= 0 ? -5 : 5), PAD_T + 12);

  // P-value label
  ctx.fillStyle = 'rgba(224,92,92,0.9)'; ctx.font = "11px 'DM Mono',monospace";
  ctx.textAlign = 'center';
  ctx.fillText('p = ' + fmtP(pValue), W/2, H - 8);

  // X-axis labels
  ctx.fillStyle = 'rgba(122,128,153,0.8)'; ctx.font = "9px 'DM Mono',monospace"; ctx.textAlign = 'center';
  [-3,-2,-1,0,1,2,3].forEach(z => ctx.fillText(z, toX(z), toY(0)+14));
}
