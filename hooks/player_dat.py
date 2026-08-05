# player.py
from dataclasses import dataclass, asdict
import time
import json

@dataclass
class Player:
    """Represents a player in the zombie game with leveling system."""
    username: str
    score: int = 0
    lives: int = 3
    wave: int = 1
    weapon: str = "Pistol"
    exp: int = 0
    level: int = 1
    start_time: float = time.time()

    def add_score(self, points: int):
        """Add to total score."""
        self.score += points
        print(f"[+] {self.username} gained {points} points (Total: {self.score})")

    def add_exp(self, amount: int):
        """Add experience and handle leveling up."""
        self.exp += amount
        print(f"✨ {self.username} gained {amount} EXP (Total EXP: {self.exp})")
        self.check_level_up()

    def check_level_up(self):
        """Check if player can level up."""
        exp_needed = self.level * 100
        while self.exp >= exp_needed:
            self.exp -= exp_needed
            self.level += 1
            exp_needed = self.level * 100
            print(f"⬆️ {self.username} leveled up! Now Level {self.level}")

    def lose_life(self):
        """Lose one life."""
        self.lives = max(0, self.lives - 1)
        print(f"[!] {self.username} lost a life. Remaining: {self.lives}")
        return self.lives > 0

    def next_wave(self):
        """Advance to the next wave."""
        self.wave += 1
        print(f"🌊 {self.username} advanced to Wave {self.wave}")

    def change_weapon(self, new_weapon: str):
        """Change weapon."""
        self.weapon = new_weapon
        print(f"🔫 {self.username} switched to {self.weapon}")

    def get_runtime(self):
        return round(time.time() - self.start_time, 2)

    def to_json(self):
        data = asdict(self)
        data["runtime"] = self.get_runtime()
        return json.dumps(data, indent=2)

    def __repr__(self):
        return f"<Player {self.username} | Lv.{self.level} | Score: {self.score} | EXP: {self.exp}>"
