// player.js
export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 36;
    this.h = 42;
    this.speed = 380;
    this.cooldown = 0;
    this.lives = 3;
    this.maxLives = 5;
    this.score = 0;
    this.weaponIndex = 0;
    this.chain = 0;
  }

  update(dt, keys, bounds) {
    // Movement
    if (keys['ArrowLeft'] || keys['a']) this.x -= this.speed * dt;
    if (keys['ArrowRight'] || keys['d']) this.x += this.speed * dt;

    // Clamp within bounds
    this.x = Math.max(this.w / 2, Math.min(bounds.width - this.w / 2, this.x));

    // Cooldown timer
    this.cooldown = Math.max(0, this.cooldown - dt * 1000);
  }

  takeDamage() {
    this.lives--;
    this.chain = 0;
    return this.lives > 0;
  }

  heal(amount = 1) {
    this.lives = Math.min(this.maxLives, this.lives + amount);
  }

  addScore(points) {
    this.score += points;
  }

  switchWeapon(allWeapons, beep) {
    this.weaponIndex = (this.weaponIndex + 1) % allWeapons.length;
    const newWeapon = allWeapons[this.weaponIndex];
    beep(1000, 0.05, 'sine', 0.06);
    return newWeapon;
  }

  shoot(currentWeapon, bullets, beep) {
    currentWeapon.shoot(this, bullets, beep);
  }

  draw(ctx) {
    // Body
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.fillStyle = '#9be7ff';
    ctx.beginPath();
    ctx.ellipse(0, 0, this.w / 2, this.h / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Visor
    ctx.fillStyle = '#003d6b';
    ctx.fillRect(-this.w / 4, -6, this.w / 2, 8);

    ctx.restore();
  }
}
