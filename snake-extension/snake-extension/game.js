(function () {

  /* ── Constants ── */
  const COLS = 17, ROWS = 17, CELL = 24;

  const canvas  = document.getElementById('sg-canvas');
  const ctx     = canvas.getContext('2d');
  canvas.width  = COLS * CELL;   // 408px
  canvas.height = ROWS * CELL;   // 408px

  const overlay    = document.getElementById('sg-overlay');
  const ovTitle    = document.getElementById('ov-title');
  const ovMsg      = document.getElementById('ov-msg');
  const scoreEl    = document.getElementById('sg-score');
  const bestEl     = document.getElementById('sg-best');
  const pauseBtn   = document.getElementById('sg-pause-btn');
  const restartBtn = document.getElementById('sg-restart-btn');
  const startBtn   = document.getElementById('sg-start-btn');
  const soundBtn   = document.getElementById('sg-sound-btn');
  const speedSel   = document.getElementById('sg-speed');
  const applesSel  = document.getElementById('sg-apples');
  const modeDesc   = document.getElementById('sg-mode-desc');

  /* ── Mode Configs ── */
  const MODES = {
    classic:    { bg1:'#8ecc56', bg2:'#7ec04a', wc:'#4a7c3f', ac:'#e03030', sc:'#4a7cff', sh:'#3a6aee', desc:'Classic: avoid walls and your own tail.' },
    borderless: { bg1:'#a0d068', bg2:'#90c458', wc: null,     ac:'#e03030', sc:'#4a7cff', sh:'#3a6aee', desc:'Borderless: edges wrap — no wall deaths!' },
    wall:       { bg1:'#8ecc56', bg2:'#7ec04a', wc:'#8B4513', ac:'#e03030', sc:'#4a7cff', sh:'#3a6aee', desc:'Wall: each apple eaten spawns a new permanent brick!' },
    dark:       { bg1:'#1a2e1a', bg2:'#162612', wc:'#0a1a0a', ac:'#ff4444', sc:'#4488ff', sh:'#2266cc', desc:'Dark: same rules, darker atmosphere.' },
    speedy:     { bg1:'#56a0cc', bg2:'#4a94c0', wc:'#2a5a7c', ac:'#ffcc00', sc:'#ffffff', sh:'#dddddd', desc:'Speedy: snake speeds up with every apple!' },
    maze:       { bg1:'#d4c9a8', bg2:'#c8bb98', wc:'#7a6a3a', ac:'#cc2222', sc:'#4a7cff', sh:'#3a6aee', desc:'Maze: navigate through fixed walls.' }
  };

  /* ── Audio ── */
  let soundOn  = true;
  let audioCtx = null;

  function getAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  }

  function tone(type, freq, freqEnd, gainStart, duration, delay) {
    if (!soundOn) return;
    delay = delay || 0;
    try {
      const ac = getAudio();
      const o  = ac.createOscillator();
      const g  = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type = type;
      const t = ac.currentTime + delay;
      o.frequency.setValueAtTime(freq, t);
      if (freqEnd) o.frequency.exponentialRampToValueAtTime(freqEnd, t + duration);
      g.gain.setValueAtTime(gainStart, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + duration);
      o.start(t);
      o.stop(t + duration + 0.01);
    } catch (e) {}
  }

  function playEat(score)    { const b = 300 + Math.min(score * 8, 400); tone('square', b, b * 1.6, 0.18, 0.15); }
  function playMove()        { tone('sine', 120, null, 0.04, 0.04); }
  function playWall()        { tone('sawtooth', 200, 80, 0.12, 0.14); }
  function playDeath()       { [400,320,240,160].forEach((f,i) => tone('sawtooth', f, f*0.5, 0.2, 0.09, i*0.1)); }
  function playStart()       { [261,329,392,523].forEach((f,i) => tone('triangle', f, null, 0.15, 0.12, i*0.09)); }
  function playBestScore()   { [523,659,784,1046].forEach((f,i) => tone('triangle', f, null, 0.18, 0.14, i*0.1)); }
  function playPauseSound()  {
    if (!soundOn) return;
    try {
      const ac = getAudio();
      const o = ac.createOscillator(), g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type = 'triangle';
      o.frequency.setValueAtTime(440, ac.currentTime);
      o.frequency.setValueAtTime(330, ac.currentTime + 0.08);
      g.gain.setValueAtTime(0.12, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.18);
      o.start(ac.currentTime); o.stop(ac.currentTime + 0.19);
    } catch(e) {}
  }

  soundBtn.addEventListener('click', () => {
    soundOn = !soundOn;
    soundBtn.textContent = soundOn ? '🔊' : '🔇';
    if (soundOn) playPauseSound();
  });

  /* ── Game State ── */
  let snake, dir, nextDir, apples, walls, wallSet;
  let score, best = 0, running = false, paused = false;
  let loop, mode = 'classic', baseSpeed = 130, stepCount = 0;

  function cellKey(x, y) { return x + ',' + y; }

  function occupied(x, y) {
    if (snake.some(s => s.x === x && s.y === y)) return true;
    if (wallSet.has(cellKey(x, y))) return true;
    if (apples.some(a => a.x === x && a.y === y)) return true;
    return false;
  }

  function spawnApple() {
    let x, y, t = 0;
    do { x = Math.floor(Math.random()*COLS); y = Math.floor(Math.random()*ROWS); t++; }
    while (occupied(x, y) && t < 400);
    if (t < 400) apples.push({ x, y });
  }

  function spawnWallBrick() {
    let x, y, t = 0;
    do { x = Math.floor(Math.random()*COLS); y = Math.floor(Math.random()*ROWS); t++; }
    while (occupied(x, y) && t < 400);
    if (t < 400) { walls.push([x, y]); wallSet.add(cellKey(x, y)); }
  }

  function buildMaze() {
    [
      [3,3],[3,4],[3,5],[3,6],[3,7],
      [13,9],[13,10],[13,11],[13,12],[13,13],
      [7,2],[8,2],[9,2],[10,2],
      [6,14],[7,14],[8,14],[9,14],[10,14],
      [2,8],[2,9],[2,10],
      [14,6],[14,7],[14,8]
    ].forEach(([x, y]) => { walls.push([x, y]); wallSet.add(cellKey(x, y)); });
  }

  function initGame() {
    const cx = Math.floor(COLS/2), cy = Math.floor(ROWS/2);
    snake   = [{ x:cx, y:cy }, { x:cx-1, y:cy }, { x:cx-2, y:cy }];
    dir     = { x:1, y:0 };
    nextDir = { x:1, y:0 };
    score   = 0; scoreEl.textContent = 0;
    walls   = []; wallSet = new Set(); apples = []; stepCount = 0;
    if (mode === 'maze') buildMaze();
    const n = parseInt(applesSel.value);
    for (let i = 0; i < n; i++) spawnApple();
  }

  /* ── Game Loop ── */
  function step() {
    if (paused || !running) return;
    dir = { ...nextDir };
    let head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    if (mode === 'borderless') {
      head.x = (head.x + COLS) % COLS;
      head.y = (head.y + ROWS) % ROWS;
    } else {
      if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
        playDeath(); gameOver(); return;
      }
    }

    if (snake.some(s => s.x === head.x && s.y === head.y)) { playDeath(); gameOver(); return; }
    if (wallSet.has(cellKey(head.x, head.y)))               { playDeath(); gameOver(); return; }

    snake.unshift(head);
    stepCount++;
    if (stepCount % 4 === 0) playMove();

    const ai = apples.findIndex(a => a.x === head.x && a.y === head.y);
    if (ai >= 0) {
      apples.splice(ai, 1);
      score++;
      scoreEl.textContent = score;
      scoreEl.classList.remove('flash');
      void scoreEl.offsetWidth;
      scoreEl.classList.add('flash');

      if (score > best) { best = score; bestEl.textContent = best; playBestScore(); }
      else playEat(score);

      if (mode === 'wall')   { spawnWallBrick(); playWall(); }
      if (mode === 'speedy') {
        baseSpeed = Math.max(35, baseSpeed - 8);
        clearInterval(loop);
        loop = setInterval(step, baseSpeed);
      }
      spawnApple();
    } else {
      snake.pop();
    }
    draw();
  }

  /* ── Drawing ── */
  function draw() {
    const m = MODES[mode];

    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        ctx.fillStyle = (r+c)%2===0 ? m.bg1 : m.bg2;
        ctx.fillRect(c*CELL, r*CELL, CELL, CELL);
      }

    walls.forEach(([wx, wy]) => {
      if (mode === 'wall') {
        ctx.fillStyle = '#8B4513'; ctx.fillRect(wx*CELL, wy*CELL, CELL, CELL);
        ctx.fillStyle = '#a0522d'; ctx.fillRect(wx*CELL+1, wy*CELL+1, CELL-2, CELL/2-1);
        ctx.fillStyle = '#6b3410'; ctx.fillRect(wx*CELL+1, wy*CELL+CELL/2, CELL-2, CELL/2-1);
        ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 0.5;
        ctx.strokeRect(wx*CELL+0.5, wy*CELL+0.5, CELL-1, CELL-1);
        ctx.beginPath(); ctx.moveTo(wx*CELL, wy*CELL+CELL/2); ctx.lineTo(wx*CELL+CELL, wy*CELL+CELL/2); ctx.stroke();
      } else {
        ctx.fillStyle = m.wc || '#555'; ctx.fillRect(wx*CELL, wy*CELL, CELL, CELL);
        ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(wx*CELL+2, wy*CELL+2, CELL-4, CELL-4);
      }
    });

    apples.forEach(a => drawApple(a.x, a.y, m.ac));

    snake.forEach((seg, i) => {
      const isHead = i === 0;
      ctx.fillStyle = isHead ? m.sc : m.sh;
      rrect(seg.x*CELL+2, seg.y*CELL+2, CELL-4, CELL-4, isHead ? 6 : 4);
      ctx.fill();
      if (isHead) {
        ctx.fillStyle = mode === 'dark' ? '#aad4ff' : '#fff';
        const ex=dir.x, ey=dir.y, ox=dir.y, oy=-dir.x;
        const cx_=seg.x*CELL+CELL/2+ex*5, cy_=seg.y*CELL+CELL/2+ey*5;
        ctx.beginPath(); ctx.arc(cx_+ox*4, cy_+oy*4, 3.5, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx_-ox*4, cy_-oy*4, 3.5, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#111';
        ctx.beginPath(); ctx.arc(cx_+ox*4+ex*1.2, cy_+oy*4+ey*1.2, 1.8, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx_-ox*4+ex*1.2, cy_-oy*4+ey*1.2, 1.8, 0, Math.PI*2); ctx.fill();
      }
    });
  }

  function drawApple(ax, ay, color) {
    const px=ax*CELL+CELL/2, py=ay*CELL+CELL/2;
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(px, py+1, CELL/2-4, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.beginPath(); ctx.arc(px-3, py-3, 3, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#228822'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(px+1, py-CELL/2+5); ctx.quadraticCurveTo(px+6, py-CELL/2, px+5, py-CELL/2+7); ctx.stroke();
    ctx.fillStyle = '#228822';
    ctx.beginPath(); ctx.ellipse(px+3, py-CELL/2+4, 4, 3, -0.4, 0, Math.PI*2); ctx.fill();
  }

  function rrect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r);
    ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
    ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r);
    ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r);
    ctx.closePath();
  }

  /* ── Game Over ── */
  function gameOver() {
    running = false; clearInterval(loop);
    ovTitle.textContent = 'Game Over!';
    let msg = 'Score: ' + score + (score > 0 ? ' 🎉' : '');
    if (mode === 'wall')   msg += '\nBricks: ' + walls.length;
    if (mode === 'speedy') msg += '\nFinal speed: ' + baseSpeed + 'ms';
    ovMsg.textContent = msg;
    startBtn.textContent = '▶ Play Again';
    overlay.style.display = 'flex';
    pauseBtn.textContent = '⏸';
  }

  /* ── Start ── */
  function startGame() {
    overlay.style.display = 'none';
    running = true; paused = false;
    pauseBtn.textContent = '⏸';
    baseSpeed = parseInt(speedSel.value);
    initGame(); draw();
    clearInterval(loop);
    loop = setInterval(step, baseSpeed);
    playStart();
  }

  function resetToMenu() {
    clearInterval(loop); running = false;
    const parts = MODES[mode].desc.split(':');
    ovTitle.textContent = parts[0] + ' Mode';
    ovMsg.textContent = parts.slice(1).join(':').trim();
    startBtn.textContent = '▶ Play';
    overlay.style.display = 'flex';
    const m = MODES[mode];
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        ctx.fillStyle = (r+c)%2===0 ? m.bg1 : m.bg2;
        ctx.fillRect(c*CELL, r*CELL, CELL, CELL);
      }
  }

  /* ── Controls ── */
  startBtn.addEventListener('click', startGame);
  restartBtn.addEventListener('click', resetToMenu);

  pauseBtn.addEventListener('click', () => {
    if (!running) return;
    paused = !paused;
    pauseBtn.textContent = paused ? '▶' : '⏸';
    playPauseSound();
    if (!paused) draw();
  });

  document.addEventListener('keydown', e => {
    const map = {
      ArrowUp:{x:0,y:-1}, ArrowDown:{x:0,y:1},
      ArrowLeft:{x:-1,y:0}, ArrowRight:{x:1,y:0},
      w:{x:0,y:-1}, s:{x:0,y:1}, a:{x:-1,y:0}, d:{x:1,y:0}
    };
    if (map[e.key]) {
      e.preventDefault();
      const nd = map[e.key];
      if (!(nd.x === -dir.x && nd.y === -dir.y)) nextDir = nd;
    }
    if (e.key === ' ' && running) {
      paused = !paused;
      pauseBtn.textContent = paused ? '▶' : '⏸';
      playPauseSound();
      if (!paused) draw();
    }
  });

  document.getElementById('btn-up').addEventListener('click',    () => { if (dir.y !==  1) nextDir = {x:0,  y:-1}; });
  document.getElementById('btn-down').addEventListener('click',  () => { if (dir.y !== -1) nextDir = {x:0,  y:1}; });
  document.getElementById('btn-left').addEventListener('click',  () => { if (dir.x !==  1) nextDir = {x:-1, y:0}; });
  document.getElementById('btn-right').addEventListener('click', () => { if (dir.x !== -1) nextDir = {x:1,  y:0}; });

  document.querySelectorAll('.sg-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sg-mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      mode = btn.dataset.mode;
      modeDesc.textContent = MODES[mode].desc;
      resetToMenu();
    });
  });

  speedSel.addEventListener('change', () => {
    if (running && !paused) {
      clearInterval(loop);
      baseSpeed = parseInt(speedSel.value);
      loop = setInterval(step, baseSpeed);
    }
  });

  /* ── Initial board ── */
  const m = MODES[mode];
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      ctx.fillStyle = (r+c)%2===0 ? m.bg1 : m.bg2;
      ctx.fillRect(c*CELL, r*CELL, CELL, CELL);
    }

})();
