import { Zombie } from './zombie.js';

let zombies = [];

function spawnZombie() {
  const types = ['walker', 'runner', 'brute', 'toxic'];
  const type = types[Math.floor(Math.random() * types.length)];
  const z = new Zombie(rand(20, W - 20), -50, type, wave);
  zombies.push(z);
}

function updateZombies(dt) {
  for (let i = zombies.length - 1; i >= 0; i--) {
    const z = zombies[i];
    z.update(dt, { width: W, height: H });

    if (z.isOffscreen({ width: W, height: H })) {
      zombies.splice(i, 1);
    }
  }
}

function drawZombies(ctx) {
  zombies.forEach(z => z.draw(ctx));
}
