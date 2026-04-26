const { createCanvas } = require('canvas');
const fs = require('fs');

function makeIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const s = size;

  // Background - green
  ctx.fillStyle = '#4a7c3f';
  ctx.beginPath();
  ctx.roundRect(0, 0, s, s, s * 0.18);
  ctx.fill();

  // Snake body segments
  const seg = s * 0.18;
  const gap = s * 0.04;
  ctx.fillStyle = '#4a7cff';

  // Body segment 1 (tail)
  ctx.beginPath();
  ctx.roundRect(s*0.12, s*0.5 - seg/2, seg, seg, seg*0.25);
  ctx.fill();

  // Body segment 2
  ctx.beginPath();
  ctx.roundRect(s*0.12 + seg + gap, s*0.5 - seg/2, seg, seg, seg*0.25);
  ctx.fill();

  // Body segment 3 (turning up)
  ctx.beginPath();
  ctx.roundRect(s*0.12 + (seg+gap)*2, s*0.5 - seg/2, seg, seg, seg*0.25);
  ctx.fill();

  // Body segment 4 (vertical)
  ctx.beginPath();
  ctx.roundRect(s*0.12 + (seg+gap)*2, s*0.5 - seg/2 - seg - gap, seg, seg, seg*0.25);
  ctx.fill();

  // Head
  const hx = s*0.12 + (seg+gap)*2;
  const hy = s*0.5 - seg/2 - (seg+gap)*2;
  ctx.fillStyle = '#5588ff';
  ctx.beginPath();
  ctx.roundRect(hx, hy, seg, seg, seg*0.3);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(hx + seg*0.28, hy + seg*0.3, seg*0.13, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(hx + seg*0.72, hy + seg*0.3, seg*0.13, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.arc(hx + seg*0.28, hy + seg*0.32, seg*0.07, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(hx + seg*0.72, hy + seg*0.32, seg*0.07, 0, Math.PI*2); ctx.fill();

  // Apple
  const ax = s * 0.68, ay = s * 0.55;
  const ar = s * 0.13;
  ctx.fillStyle = '#e03030';
  ctx.beginPath(); ctx.arc(ax, ay, ar, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.beginPath(); ctx.arc(ax - ar*0.3, ay - ar*0.3, ar*0.3, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#228822'; ctx.lineWidth = s*0.03;
  ctx.beginPath(); ctx.moveTo(ax, ay-ar); ctx.quadraticCurveTo(ax+ar*0.5, ay-ar*1.3, ax+ar*0.4, ay-ar*0.6); ctx.stroke();

  return canvas.toBuffer('image/png');
}

[16, 32, 48, 128].forEach(size => {
  fs.writeFileSync(`icons/icon${size}.png`, makeIcon(size));
  console.log(`icon${size}.png created`);
});
