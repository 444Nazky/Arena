// weapon.js
export class Weapon {
  constructor(name, config) {
    this.name = name;
    this.cooldown = config.cooldown || 300;     // ms between shots
    this.damage = config.damage || 1;
    this.bulletSpeed = config.bulletSpeed || 800;
    this.pellets = config.pellets || 1;
    this.spread = config.spread || 0;
    this.color = config.color || '#ffd6a5';
    this.sound = config.sound || { freq: 900, type: 'square', volume: 0.05 };
  }

  shoot(player, bullets, beep) {
    if (player.cooldown > 0) return;
    player.cooldown = this.cooldown;

    const bx = player.x;
    const by = player.y - 18;

    for (let i = 0; i < this.pellets; i++) {
      const angle = (Math.random() - 0.5) * this.spread;
      const vx = Math.sin(angle) * this.bulletSpeed;
      const vy = -Math.cos(angle) * this.bulletSpeed;
      bullets.push({
        x: bx,
        y: by,
        vx,
        vy,
        dmg: this.damage,
        life: 1500,
        color: this.color
      });
    }

    beep(this.sound.freq, 0.05, this.sound.type, this.sound.volume);
  }
}

export const weaponList = {
  pistol: new Weapon('Pistol', {
    cooldown: 250,
    damage: 1,
    bulletSpeed: 700,
    color: '#ffe6a5',
    sound: { freq: 900, type: 'square', volume: 0.05 }
  }),

  shotgun: new Weapon('Shotgun', {
    cooldown: 700,
    damage: 1,
    bulletSpeed: 550,
    pellets: 6,
    spread: 0.6,
    color: '#ffbaba',
    sound: { freq: 700, type: 'sawtooth', volume: 0.06 }
  }),

  smg: new Weapon('SMG', {
    cooldown: 100,
    damage: 1,
    bulletSpeed: 850,
    color: '#b2ffd6',
    sound: { freq: 1100, type: 'triangle', volume: 0.04 }
  }),

  rifle: new Weapon('Rifle', {
    cooldown: 500,
    damage: 3,
    bulletSpeed: 1100,
    color: '#b2b2ff',
    sound: { freq: 1200, type: 'square', volume: 0.06 }
  }),

  plasma: new Weapon('Plasma', {
    cooldown: 350,
    damage: 4,
    bulletSpeed: 1000,
    color: '#79e3ff',
    sound: { freq: 1300, type: 'sine', volume: 0.07 }
  })
};

// Returns an array for cycling through weapons easily
export const allWeapons = Object.values(weaponList);
