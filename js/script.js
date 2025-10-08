(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const hud = document.getElementById('hud');
  const overlay = document.getElementById('overlay');
  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const leftTouch = document.getElementById('leftTouch');
  const rightTouch = document.getElementById('rightTouch');
  const shootTouch = document.getElementById('shootTouch');

  let W = canvas.width, H = canvas.height;
  let dpr = Math.max(1, window.devicePixelRatio || 1);
  let keys = {}, shooting = false;
  let gameRunning = false, gamePaused = false, lastTime = 0;
  let score = 0, lives = 3, wave = 1, chain = 0;
  let spawnTimer = 0, spawnInterval = 1000, zombiesToSpawn = 6;
  let player, bullets, zombies, particles, pickups;

  // --- weapons ---
  const weapons = [
    { name: 'Pistol', cool: 220, dmg: 1, bulletSpeed: 700 },
    { name: 'Shotgun', cool: 650, dmg: 1, bulletSpeed: 520, pellets: 6 },
    { name: 'SMG', cool: 90, dmg: 1, bulletSpeed: 820 },
    { name: 'Rifle', cool: 500, dmg: 3, bulletSpeed: 1100 }
  ];
  let weaponIndex = 0;

  // --- audio helper ---
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  function beep(f=440, d=0.06, t='sine', v=0.06) {
    try {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = t; o.frequency.value = f; g.gain.value = v;
      o.connect(g); g.connect(audioCtx.destination);
      o.start(); o.stop(audioCtx.currentTime + d);
    } catch {}
  }

  const rand = (a,b)=>Math.random()*(b-a)+a;
  const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));

  // --- entities ---
  function spawnZombie(type='walker') {
    const size = type==='brute' ? rand(48,78) : rand(28,44);
    const speed = type==='brute' ? rand(30+wave*4,60+wave*6) : rand(40+wave*6,120+wave*8);
    const hp = type==='brute' ? Math.ceil(4+wave*1.5) : Math.ceil(1+wave*rand(0.8,1.6));
    zombies.push({
      x:rand(size/2,W-size/2), y:-size,
      w:size,h:size, vx:rand(-30,30), vy:speed,
      hp, maxHp:hp, rot:rand(0,Math.PI*2),
      rotSpeed:rand(-1,1)*0.01, type
    });
  }

  function spawnPickup(x,y) {
    const types = ['heal','ammo','weapon','score'];
    pickups.push({x,y,type:types[Math.floor(rand(0,types.length))],t:0,life:8000});
  }

  function shoot() {
    const w = weapons[weaponIndex];
    if (player.cooldown > 0) return;
    player.cooldown = w.cool;
    const bx = player.x, by = player.y - 18;
    if (w.pellets) {
      for (let i=0;i<w.pellets;i++) {
        const ang = rand(-0.28,0.28);
        bullets.push({x:bx,y:by,vx:Math.sin(ang)*w.bulletSpeed,vy:-Math.cos(ang)*w.bulletSpeed,dmg:w.dmg,life:1200});
      }
    } else {
      bullets.push({x:bx,y:by,vx:0,vy:-w.bulletSpeed,dmg:w.dmg,life:1500});
    }
    beep(900,0.04,'square',0.06);
  }

  function createExplosion(x,y,n=14,color='#ffd2a6') {
    for(let i=0;i<n;i++)
      particles.push({x,y,vx:rand(-240,240),vy:rand(-280,240),t:0,life:rand(300,900),size:rand(2,5),color});
  }

  const rectColl = (a,b)=>
    !(a.x+a.w/2<b.x-b.w/2||a.x-a.w/2>b.x+b.w/2||a.y+a.h/2<b.y-b.h/2||a.y-a.h/2>b.y+b.h/2);

  // --- game update ---
  function update(dt) {
    if (!gameRunning || gamePaused) return;

    if (keys['ArrowLeft'] || keys['a']) player.x -= player.speed * dt;
    if (keys['ArrowRight'] || keys['d']) player.x += player.speed * dt;
    player.x = clamp(player.x, 20, W-20);
    player.cooldown = Math.max(0, player.cooldown - dt*1000);
    if (shooting) shoot();

    spawnTimer += dt*1000;
    if (spawnTimer > spawnInterval && zombiesToSpawn > 0) {
      spawnTimer = 0; zombiesToSpawn--;
      spawnZombie(Math.random()>0.85?'brute':'walker');
    }

    bullets = bullets.filter(b=>{
      b.x += b.vx*dt; b.y += b.vy*dt; b.life -= dt*1000;
      return b.y>-30 && b.life>0;
    });

    // --- zombies ---
    for (let i=zombies.length-1;i>=0;i--) {
      const z = zombies[i];
      z.x += z.vx*dt; z.y += z.vy*dt; z.rot += z.rotSpeed;
      if (z.x<z.w/2 || z.x>W-z.w/2) z.vx *= -1;

      for (let j=bullets.length-1;j>=0;j--) {
        const b = bullets[j];
        if (rectColl({x:z.x,y:z.y,w:z.w,h:z.h},{x:b.x,y:b.y,w:8,h:12})) {
          bullets.splice(j,1);
          z.hp -= b.dmg; chain++; score += 10 + Math.floor(chain*0.6);
          createExplosion(b.x,b.y,6,'#ffddaa');
          beep(1200 - Math.min(700,chain*30),0.02,'sine',0.04);
          if (z.hp<=0) {
            createExplosion(z.x,z.y,18,'#ffd6a5');
            if (Math.random()<0.18) spawnPickup(z.x,z.y);
            score += 50 + (z.type==='brute'?100:0);
            zombies.splice(i,1);
            if (zombies.length===0 && zombiesToSpawn===0) wave++;
          }
          break;
        }
      }

      if (rectColl({x:z.x,y:z.y,w:z.w,h:z.h},{x:player.x,y:player.y,w:player.w,h:player.h})) {
        zombies.splice(i,1); lives--; chain=0;
        createExplosion(player.x,player.y,26,'#ffb2b2');
        beep(160,0.2,'sawtooth',0.12);
        if (lives<=0) endGame();
      }

      if (z.y > H+80) { zombies.splice(i,1); chain = 0; }
    }

    // --- pickups ---
    for (let i=pickups.length-1;i>=0;i--) {
      const p = pickups[i]; p.t += dt*1000;
      if (p.t>p.life){ pickups.splice(i,1); continue; }
      p.y += 40*dt;
      if (rectColl({x:p.x,y:p.y,w:28,h:28},{x:player.x,y:player.y,w:player.w,h:player.h})) {
        if (p.type==='heal') { lives = Math.min(5,lives+1); beep(800,0.08,'sine',0.08); }
        else if (p.type==='ammo') { score += 30; beep(1100,0.04,'triangle',0.06); }
        else if (p.type==='weapon') { weaponIndex=(weaponIndex+1)%weapons.length; beep(1400,0.06,'sine',0.08); }
        else if (p.type==='score') { score += 120; beep(1400,0.04,'square',0.07); }
        pickups.splice(i,1);
      }
    }

    particles = particles.filter(p=>{
      p.t+=dt*1000; p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=600*dt;
      return p.t<p.life;
    });

    hud.textContent = `Score: ${score} · Lives: ${lives} · Wave: ${wave}`;
  }

  // --- draw ---
  function draw() {
    const g = ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0,'#020317'); g.addColorStop(1,'#040428');
    ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
    for(let i=0;i<90;i++){ctx.fillStyle='rgba(255,255,255,0.03)';ctx.fillRect((i*73)%W,(i*97)%H,1,1);}

    // player
    ctx.save(); ctx.translate(player.x,player.y);
    ctx.fillStyle='#9be7ff'; ctx.beginPath(); ctx.ellipse(0,0,18,22,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#003d6b'; ctx.fillRect(-9,-6,18,8);
    ctx.restore();

    ctx.fillStyle='#ffd6a5'; bullets.forEach(b=>ctx.fillRect(b.x-3,b.y-8,6,12));
    zombies.forEach(z=>{
      ctx.save(); ctx.translate(z.x,z.y); ctx.rotate(z.rot);
      ctx.fillStyle=z.type==='brute'?'#c55b5b':'#8fb57f';
      ctx.fillRect(-z.w/2,-z.h/2,z.w,z.h);
      ctx.fillStyle='rgba(0,0,0,0.5)';
      ctx.fillRect(-z.w/2,-z.h/2-10,z.w,6);
      ctx.fillStyle='#7cffdf';
      ctx.fillRect(-z.w/2,-z.h/2-10,z.w*(z.hp/z.maxHp),6);
      ctx.restore();
    });

    pickups.forEach(p=>{
      ctx.save(); ctx.translate(p.x,p.y);
      ctx.globalAlpha=0.9;
      ctx.fillStyle = p.type==='heal'?'#9be7ff':p.type==='ammo'?'#ffd6a5':p.type==='weapon'?'#c7b2ff':'#b3ffd6';
      ctx.fillRect(-12,-12,24,24); ctx.restore();
    });

    particles.forEach(p=>{
      ctx.globalAlpha = 1 - (p.t/p.life);
      ctx.fillStyle = p.color || '#ffd2a6';
      ctx.fillRect(p.x,p.y,p.size,p.size);
      ctx.globalAlpha = 1;
    });
  }

  function loop(ts) {
    if (!lastTime) lastTime = ts;
    const dt = Math.min(0.035, (ts-lastTime)/1000);
    lastTime = ts;
    update(dt); draw();
    if (gameRunning) requestAnimationFrame(loop);
  }

  function startGame() {
    player = {x:W/2,y:H-120,w:34,h:40,speed:380,cooldown:0};
    bullets=[]; zombies=[]; particles=[]; pickups=[];
    score=0; lives=3; wave=1; chain=0;
    zombiesToSpawn=6; spawnTimer=0;
    gameRunning=true; gamePaused=false;
    overlay.textContent='';
    beep(680,0.06,'sine',0.07);
    requestAnimationFrame(loop);
  }

  function endGame() {
    gameRunning=false;
    overlay.innerHTML=`<div style=\"color:white;text-align:center\">Game Over<br>Score: ${score} Wave: ${wave}</div>`;
    beep(140,0.5,'sine',0.12);
  }

  function togglePause() {
    if (!gameRunning) return;
    gamePaused=!gamePaused;
    pauseBtn.textContent = gamePaused?'Resume':'Pause';
    if (!gamePaused) { lastTime=0; requestAnimationFrame(loop); }
  }

  // --- input ---
  window.addEventListener('keydown',e=>{
    keys[e.key]=true;
    if(e.code==='Space'){ e.preventDefault(); shooting=true; }
    if(e.key==='p') togglePause();
  });
  window.addEventListener('keyup',e=>{
    keys[e.key]=false;
    if(e.code==='Space') shooting=false;
  });
  canvas.addEventListener('click',()=>{
    if(!gameRunning) startGame(); else { shooting=true; setTimeout(()=>shooting=false,120); }
    if(audioCtx.state==='suspended') audioCtx.resume();
  });
  startBtn.addEventListener('click',()=>{overlay.textContent=''; startGame();});
  pauseBtn.addEventListener('click',()=>togglePause());

  // touch controls
  leftTouch.addEventListener('touchstart',e=>{e.preventDefault(); keys['a']=true;});
  leftTouch.addEventListener('touchend',e=>{e.preventDefault(); keys['a']=false;});
  rightTouch.addEventListener('touchstart',e=>{e.preventDefault(); keys['d']=true;});
  rightTouch.addEventListener('touchend',e=>{e.preventDefault(); keys['d']=false;});
  shootTouch.addEventListener('touchstart',e=>{e.preventDefault(); shooting=true;});
  shootTouch.addEventListener('touchend',e=>{e.preventDefault(); shooting=false;});

  // --- canvas scale ---
  function fitCanvas(){
    const scale = Math.min(window.innerWidth/W, window.innerHeight/H);
    canvas.style.width = Math.round(W*scale)+'px';
    canvas.style.height = Math.round(H*scale)+'px';
  }
  window.addEventListener('resize',fitCanvas);
  fitCanvas();

  // start screen
  overlay.innerHTML = `<div style=\"color:white;text-align:center\">Zombie Shooter<br><small>Press Start or click canvas</small></div>`;
})();
