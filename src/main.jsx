import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
import fullscreenIcon from '../fullscreen-icon.png';
import gameConfig from '../config.json';
import bgMusicUrl from '../bg-music.mp3';

const WIDTH = 900;
const HEIGHT = 420;
const GROUND = 340;

function roundedRect(ctx, x, y, w, h, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function drawBoy(ctx, x, y, kick, frame = 0) {
  const step = Math.sin(frame / 6) * 5;
  const kickSwing = kick * 14;

  // Backpack sits behind the uniform.
  roundedRect(ctx, x + 12, y + 49, 20, 39, 8, '#3d79a8');
  roundedRect(ctx, x + 16, y + 57, 13, 20, 5, '#5796c4');
  ctx.strokeStyle = '#315f85'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x + 29, y + 53); ctx.lineTo(x + 35, y + 79); ctx.stroke();

  // School shorts, moving legs, white socks, and sneakers.
  roundedRect(ctx, x + 29, y + 77, 33, 17, 5, '#263f62');
  ctx.strokeStyle = '#263f62'; ctx.lineWidth = 8; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x + 36, y + 89); ctx.lineTo(x + 32 + step, y + 105); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + 55, y + 89); ctx.lineTo(x + 59 - step + kickSwing, y + 104 - kick * 8); ctx.stroke();
  ctx.strokeStyle = '#f7f5ee'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(x + 32 + step, y + 101); ctx.lineTo(x + 32 + step, y + 108); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + 59 - step + kickSwing, y + 100); ctx.lineTo(x + 59 - step + kickSwing, y + 107); ctx.stroke();
  roundedRect(ctx, x + 23 + step, y + 105, 18, 7, 4, '#f6f7f5');
  roundedRect(ctx, x + 52 - step + kickSwing, y + 104 - kick * 8, 18, 7, 4, '#f6f7f5');

  // White collared shirt and a small red tie.
  roundedRect(ctx, x + 27, y + 43, 38, 43, 10, '#fffdf6');
  ctx.fillStyle = '#dce9f3';
  ctx.beginPath(); ctx.moveTo(x + 38, y + 45); ctx.lineTo(x + 46, y + 53); ctx.lineTo(x + 42, y + 59); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + 55, y + 45); ctx.lineTo(x + 47, y + 53); ctx.lineTo(x + 51, y + 59); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#d95753';
  ctx.beginPath(); ctx.moveTo(x + 45, y + 53); ctx.lineTo(x + 49, y + 53); ctx.lineTo(x + 51, y + 70); ctx.lineTo(x + 47, y + 74); ctx.lineTo(x + 43, y + 70); ctx.closePath(); ctx.fill();
  roundedRect(ctx, x + 31, y + 70, 7, 5, 2, '#8bb7d5');

  // Arms, face, and hair.
  ctx.strokeStyle = '#f2b889'; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(x + 29, y + 54); ctx.lineTo(x + 16, y + 72 + step * .35); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + 62, y + 54); ctx.lineTo(x + 75, y + 69 - step * .35); ctx.stroke();
  ctx.fillStyle = '#f2b889'; ctx.beginPath(); ctx.arc(x + 46, y + 27, 23, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#49352d'; ctx.beginPath(); ctx.arc(x + 45, y + 17, 22, Math.PI, Math.PI * 2); ctx.lineTo(x + 66, y + 29); ctx.quadraticCurveTo(x + 55, y + 23, x + 48, y + 28); ctx.quadraticCurveTo(x + 39, y + 21, x + 26, y + 30); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#26384a'; ctx.beginPath(); ctx.arc(x + 54, y + 29, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#a75d49'; ctx.lineWidth = 1.7; ctx.beginPath(); ctx.arc(x + 56, y + 35, 5, .2, 1.4); ctx.stroke();
}

function drawBall(ctx, x, y, spin) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(spin);
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#27394c'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = '#26384a';
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + i * Math.PI * 2 / 5;
    ctx.beginPath(); ctx.arc(Math.cos(a) * 8, Math.sin(a) * 8, 4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawObstacle(ctx, obstacle) {
  if (obstacle.type === 'books') {
    roundedRect(ctx, obstacle.x + 2, GROUND - 18, 39, 16, 4, '#ef7651');
    roundedRect(ctx, obstacle.x + 7, GROUND - 34, 34, 15, 4, '#4b82bb');
    roundedRect(ctx, obstacle.x, GROUND - gameConfig.obstacles.bookStackHeight, 35, 15, 4, '#f0c34e');
    ctx.fillStyle = '#fff8e8';
    ctx.fillRect(obstacle.x + 5, GROUND - 15, 31, 3);
    ctx.fillRect(obstacle.x + 10, GROUND - 31, 25, 3);
    ctx.fillRect(obstacle.x + 4, GROUND - gameConfig.obstacles.bookStackHeight + 12, 27, 3);
    ctx.fillStyle = '#d75e45'; ctx.fillRect(obstacle.x + 8, GROUND - 32, 4, 11);
  } else if (obstacle.type === 'backpack') {
    roundedRect(ctx, obstacle.x + 5, GROUND - gameConfig.obstacles.backpackHeight, 33, gameConfig.obstacles.backpackHeight - 2, 10, '#4d83b5');
    roundedRect(ctx, obstacle.x + 10, GROUND - 23, 23, 15, 5, '#78a7cf');
    roundedRect(ctx, obstacle.x + 14, GROUND - gameConfig.obstacles.backpackHeight - 4, 14, 9, 5, '#315f85');
    ctx.fillStyle = '#f2ca5a'; ctx.beginPath(); ctx.arc(obstacle.x + 21, GROUND - 16, 2, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.save();
    ctx.translate(obstacle.x + 21, GROUND - gameConfig.obstacles.pencilHeight / 2);
    ctx.rotate(.18);
    roundedRect(ctx, -6, -gameConfig.obstacles.pencilHeight / 2, 12, gameConfig.obstacles.pencilHeight - 8, 4, '#efc44d');
    ctx.fillStyle = '#f0a9a0'; ctx.fillRect(-6, -gameConfig.obstacles.pencilHeight / 2, 12, 7);
    ctx.fillStyle = '#d9b58b'; ctx.beginPath(); ctx.moveTo(-6, gameConfig.obstacles.pencilHeight / 2 - 8); ctx.lineTo(6, gameConfig.obstacles.pencilHeight / 2 - 8); ctx.lineTo(0, gameConfig.obstacles.pencilHeight / 2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#454b50'; ctx.beginPath(); ctx.moveTo(-2, gameConfig.obstacles.pencilHeight / 2 - 2); ctx.lineTo(2, gameConfig.obstacles.pencilHeight / 2 - 2); ctx.lineTo(0, gameConfig.obstacles.pencilHeight / 2); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
}

function Game() {
  const canvasRef = useRef(null);
  const gameWrapRef = useRef(null);
  const gameRef = useRef(null);
  const musicRef = useRef(null);
  const [status, setStatus] = useState('ready');
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem('boy-ball-best') || 0));
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [fullscreenMode, setFullscreenMode] = useState(false);

  useEffect(() => {
    const music = new Audio(bgMusicUrl);
    music.loop = true;
    music.volume = gameConfig.audio.backgroundVolume;
    musicRef.current = music;
    return () => {
      music.pause();
      music.currentTime = 0;
      musicRef.current = null;
    };
  }, []);

  useEffect(() => {
    const music = musicRef.current;
    if (!music) return;
    if (status === 'playing' && musicEnabled) music.play().catch(() => {});
    else music.pause();
  }, [status, musicEnabled]);

  const startGame = useCallback(() => {
    if (musicEnabled && musicRef.current?.paused) musicRef.current.play().catch(() => {});
    gameRef.current = { running: true, over: false, score: 0, speed: gameConfig.obstacles.startSpeed, boyY: GROUND - 118, ballY: GROUND - gameConfig.ball.restingOffset, ballVY: 0, ballX: 125, ballSpin: 0, kick: 0, obstacles: [], spawn: gameConfig.obstacles.initialSpawnFrames * gameConfig.obstacles.spawnReferenceSpeed / gameConfig.obstacles.startSpeed, frame: 0, clouds: [{x: 120,y:78,s:1},{x:430,y:115,s:.75},{x:760,y:64,s:1.1}], groundShift: 0 };
    setScore(0); setStatus('playing');
  }, [musicEnabled]);

  const kickBall = useCallback(() => {
    const g = gameRef.current;
    if (!g || !g.running || g.over) return;

    const restingY = GROUND - gameConfig.ball.restingOffset;
    const ballIsGrounded = g.ballY >= restingY - 0.5 && g.ballVY >= 0;
    if (!ballIsGrounded) return;

    g.ballVY = -gameConfig.ball.jumpVelocity;
    g.kick = 1;
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        if (e.repeat) return;
        if (status !== 'playing') startGame(); else kickBall();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [status, startGame, kickBall]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf;
    let lastTimestamp = null;
    let accumulator = 0;
    const render = (timestamp) => {
      const g = gameRef.current;
      const elapsed = lastTimestamp === null ? 1 / 60 : Math.min((timestamp - lastTimestamp) / 1000, 0.1);
      lastTimestamp = timestamp;
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      // Bầu trời
      // Clear morning sky on the walk to school.
      const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
      sky.addColorStop(0, '#c9edff'); sky.addColorStop(1, '#f8fcff'); ctx.fillStyle = sky; ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.fillStyle = '#ffd976'; ctx.beginPath(); ctx.arc(774, 70, 29, 0, Math.PI * 2); ctx.fill();

      const clouds = g?.clouds || [{x:120,y:78,s:1},{x:430,y:115,s:.75},{x:760,y:64,s:1.1}];
      clouds.forEach(c => { ctx.fillStyle = 'rgba(255,255,255,.92)'; ctx.beginPath(); ctx.arc(c.x,c.y,19*c.s,0,Math.PI*2); ctx.arc(c.x+21*c.s,c.y-9*c.s,24*c.s,0,Math.PI*2); ctx.arc(c.x+47*c.s,c.y,18*c.s,0,Math.PI*2); ctx.fill(); });

      // School building in the distance.
      roundedRect(ctx, 574, 151, 278, 134, 8, '#f5d9a9');
      ctx.fillStyle = '#e97f62'; ctx.beginPath(); ctx.moveTo(555, 157); ctx.lineTo(713, 91); ctx.lineTo(870, 157); ctx.closePath(); ctx.fill();
      roundedRect(ctx, 585, 159, 256, 13, 4, '#fff0cf');
      roundedRect(ctx, 668, 105, 91, 35, 8, '#fff8e7');
      ctx.fillStyle = '#3e6985'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('SCHOOL', 713, 128);
      roundedRect(ctx, 694, 213, 39, 72, 5, '#6b91a3');
      ctx.fillStyle = '#d7f1fa'; ctx.fillRect(607, 187, 38, 34); ctx.fillRect(778, 187, 38, 34);
      ctx.strokeStyle = '#fff2d6'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(626,187);ctx.lineTo(626,221);ctx.moveTo(607,204);ctx.lineTo(645,204);ctx.moveTo(797,187);ctx.lineTo(797,221);ctx.moveTo(778,204);ctx.lineTo(816,204);ctx.stroke();
      ctx.fillStyle = '#b8d992'; ctx.fillRect(0, 254, WIDTH, 50);
      // Trees along the school fence.
      for (const tx of [95, 250, 465, 850]) {
        ctx.fillStyle = '#946c4e'; ctx.fillRect(tx - 5, 229, 10, 43);
        ctx.fillStyle = '#67ad74'; ctx.beginPath(); ctx.arc(tx, 218, 22, 0, Math.PI * 2); ctx.arc(tx - 15, 229, 15, 0, Math.PI * 2); ctx.arc(tx + 15, 229, 15, 0, Math.PI * 2); ctx.fill();
      }
      // Sidewalk and school road.
      ctx.fillStyle = '#e6dcc8'; ctx.fillRect(0, 286, WIDTH, GROUND - 286);
      ctx.fillStyle = '#70858c'; ctx.fillRect(0, GROUND, WIDTH, HEIGHT - GROUND);
      ctx.strokeStyle = '#f8e8b6'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, GROUND); ctx.lineTo(WIDTH, GROUND); ctx.stroke();
      const shift = g?.groundShift || 0;
      ctx.fillStyle = 'rgba(255,255,255,.64)';
      for (let i = 0; i < 13; i++) { const x = ((i*92 - shift*1.6) % (WIDTH+40) + WIDTH+40)%(WIDTH+40); roundedRect(ctx, x, GROUND+46, 47, 7, 3, 'rgba(255,255,255,.62)'); }


      if (g?.running) {
        accumulator += elapsed * 60;
        while (accumulator >= 1 && g.running) {
          g.frame++;
          g.speed = Math.min(gameConfig.obstacles.maxSpeed, gameConfig.obstacles.startSpeed + g.score * gameConfig.obstacles.speedIncreasePerPoint);
          g.score += gameConfig.scoring.pointsPerFrame; g.groundShift = (g.groundShift + g.speed) % 59;
          g.kick = Math.max(0, g.kick - .09);
          g.ballVY += gameConfig.ball.gravity; g.ballY += g.ballVY; g.ballSpin += .11;
          if (g.ballY > GROUND - gameConfig.ball.restingOffset) { g.ballY = GROUND - gameConfig.ball.restingOffset; g.ballVY = 0; }
          // Bóng lăn theo cậu bé khi đang sát đất
          g.ballX = 126 + (g.kick > .45 ? 5 : 0);
          g.spawn--;
          if (g.spawn <= 0) { g.obstacles.push({x: WIDTH + 15, type: Math.random() < .4 ? 'books' : Math.random() < .72 ? 'backpack' : 'pencil', passed: false}); g.spawn = (gameConfig.obstacles.spawnIntervalMin + Math.random() * gameConfig.obstacles.spawnIntervalRandom - gameConfig.obstacles.spawnReferenceSpeed * gameConfig.obstacles.spawnSpeedReduction) * gameConfig.obstacles.spawnReferenceSpeed / g.speed; }
          g.obstacles.forEach(o => { o.x -= g.speed; if (!o.passed && o.x + 42 < 155) { o.passed = true; g.score += gameConfig.scoring.pointsPerObstacle; } });
          g.obstacles = g.obstacles.filter(o => o.x > -60);
          // Bóng cần ở trên đỉnh vật cản lúc đi ngang qua
          for (const o of g.obstacles) {
            const overlaps = o.x < 145 && o.x + 42 > 112;
            const clears = g.ballY < GROUND - gameConfig.ball.clearanceHeight;
            if (overlaps && !clears) { g.running = false; g.over = true; break; }
          }
          if (g.frame % 8 === 0) setScore(Math.floor(g.score));
        accumulator -= 1;
        }
      } else {
        accumulator = 0;
      }
      drawBoy(ctx, 63, g?.boyY ?? GROUND - 118, g?.kick ?? 0, g?.frame ?? 0);
      drawBall(ctx, g?.ballX ?? 126, g?.ballY ?? GROUND - 19, g?.ballSpin ?? 0);
      (g?.obstacles || []).forEach(o => drawObstacle(ctx, o));
      if (g?.over) {
        const finalScore = Math.floor(g.score);
        setStatus(s => s === 'playing' ? 'over' : s);
        setBest(prev => { if (finalScore > prev) { localStorage.setItem('boy-ball-best', String(finalScore)); return finalScore; } return prev; });
      }
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const syncFullscreenState = () => {
      const gameWrap = gameWrapRef.current;
      setFullscreenMode(Boolean(gameWrap && (document.fullscreenElement === gameWrap || document.webkitFullscreenElement === gameWrap)));
    };
    document.addEventListener('fullscreenchange', syncFullscreenState);
    document.addEventListener('webkitfullscreenchange', syncFullscreenState);
    return () => {
      document.removeEventListener('fullscreenchange', syncFullscreenState);
      document.removeEventListener('webkitfullscreenchange', syncFullscreenState);
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const gameWrap = gameWrapRef.current;
    if (!gameWrap) return;
    const isNativeFullscreen = document.fullscreenElement === gameWrap || document.webkitFullscreenElement === gameWrap;
    if (isNativeFullscreen) {
      if (document.exitFullscreen) await document.exitFullscreen().catch(() => {});
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      return;
    }
    if (fullscreenMode) { setFullscreenMode(false); return; }
    try {
      const requestFullscreen = gameWrap.requestFullscreen || gameWrap.webkitRequestFullscreen;
      if (requestFullscreen) {
        await requestFullscreen.call(gameWrap);
        setFullscreenMode(true);
        try { await screen.orientation?.lock?.('landscape'); } catch {}
        return;
      }
    } catch {}
    setFullscreenMode(true);
  }, [fullscreenMode]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && fullscreenMode && !document.fullscreenElement && !document.webkitFullscreenElement) setFullscreenMode(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [fullscreenMode]);

  const isOver = status === 'over';
  return <main className="page">
    <header className="topbar"><a className="brand" href="#"><span className="brand-ball">⚽</span> SÂN CHƠI NHỎ</a><span className="top-note">Một chút khéo léo, thật nhiều niềm vui!</span><button type="button" className="music-toggle" aria-pressed={musicEnabled} onClick={() => setMusicEnabled((enabled) => !enabled)}>{musicEnabled ? 'Nhạc: bật' : 'Nhạc: tắt'}</button></header>
    <section ref={gameWrapRef} className={fullscreenMode ? 'game-wrap game-fullscreen' : 'game-wrap'}>
      <div className="eyebrow"><span className="live-dot" /> GAME VƯỢT CHƯỚNG NGẠI</div>
      <h1>Cậu Bé <span>Tâng Bóng</span></h1>
      <p className="subtitle">Canh đúng nhịp, tâng bóng qua chướng ngại vật nhé!</p>
      <div className="scorebar"><div className="score-card"><span>ĐIỂM</span><strong>{String(score).padStart(4,'0')}</strong></div><div className="best-card"><span>🏆 KỶ LỤC</span><strong>{String(best).padStart(4,'0')}</strong></div></div>
      <p className="rotate-hint">Rotate your iPhone sideways for a larger game view.</p>
      <div className="canvas-shell">
        <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} aria-label="Màn chơi cậu bé tâng bóng" onPointerDown={() => status === 'playing' ? kickBall() : startGame()} />
        {status !== 'playing' && <div className="overlay"><div className="overlay-card">
          <div className="overlay-icon">{isOver ? '💫' : '⚽'}</div>
          <h2>{isOver ? 'Ôi, hụt mất rồi!' : 'Sẵn sàng tâng bóng?'}</h2>
          <p>{isOver ? `Bạn ghi được ${score} điểm. Thử lại để lập kỷ lục mới nhé!` : 'Bấm đúng lúc để đưa bóng bay qua vật cản.'}</p>
          <div className="overlay-actions"><button className="play-button" onClick={startGame}>{isOver ? 'Chơi lại' : 'Bắt đầu chơi'} <span>→</span></button><button type="button" className="fullscreen-toggle" onClick={toggleFullscreen} aria-label={fullscreenMode ? 'Exit fullscreen' : 'Open fullscreen'} title={fullscreenMode ? 'Exit fullscreen' : 'Open fullscreen'}><img src={fullscreenIcon} alt="" /></button></div>
        </div></div>}
      </div>
      <div className="instructions"><div className="key-hint"><kbd>SPACE</kbd><kbd>↑</kbd><span>Tâng bóng</span></div><span className="hint-divider"/><span className="mobile-hint">Hoặc chạm vào màn hình</span><span className="desktop-hint">Nhấn đúng nhịp khi bóng gần chân</span></div>
    </section>
    <footer>Được làm bằng <span>⚽</span> và thật nhiều niềm vui.</footer>
  </main>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><Game /></React.StrictMode>);
