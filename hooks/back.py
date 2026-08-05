# backend.py
from flask import Flask, request, jsonify
from player import Player
import json
import os
import time

app = Flask(__name__)

# === GLOBALS ===
DATA_FILE = "players.json"
player = Player(username="Guest")
players = {}

# === HELPERS ===
def save_data():
    """Save all players to a JSON file."""
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump({u: p.__dict__ for u, p in players.items()}, f, indent=2)
    print("💾 Player data saved.")

def load_data():
    """Load player stats if file exists."""
    global players
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            raw = json.load(f)
            players = {u: Player(**data) for u, data in raw.items()}
            print(f"✅ Loaded {len(players)} player profiles.")

load_data()

# === ROUTES ===
@app.route("/", methods=["GET"])
def index():
    return jsonify({
        "status": "online",
        "active_players": len(players),
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
    })

@app.route("/hook", methods=["POST"])
def receive_hook():
    data = request.get_json(force=True)
    event = data.get("event")
    payload = data.get("payload", {})
    username = payload.get("username", "Guest")

    # Get or create player
    if username not in players:
        players[username] = Player(username=username)
    player = players[username]

    # === Handle events ===
    if event == "zombie_killed":
        player.add_score(payload.get("score", 10))
    elif event == "player_hit":
        player.lose_life()
    elif event == "level_up":
        player.next_wave()
    elif event == "weapon_changed":
        player.change_weapon(payload.get("weapon", "Pistol"))
    elif event == "game_over":
        print(f"💀 Game Over: {player.to_json()}")
    else:
        print(f"⚙️ Unknown event: {event}")

    save_data()
    return jsonify({"status": "ok", "event": event, "player": player.__dict__})

@app.route("/leaderboard", methods=["GET"])
def leaderboard():
    """Return sorted players by score."""
    sorted_players = sorted(players.values(), key=lambda p: p.score, reverse=True)
    return jsonify([
        {"username": p.username, "score": p.score, "wave": p.wave, "lives": p.lives}
        for p in sorted_players[:10]
    ])

@app.route("/reset", methods=["POST"])
def reset_data():
    """Reset leaderboard (for dev)."""
    global players
    players = {}
    save_data()
    return jsonify({"status": "reset", "players": 0})

# === MAIN ===
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
