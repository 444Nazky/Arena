# hooks_server.py
from flask import Flask, request, jsonify
from player import Player

app = Flask(__name__)

# Track current player
player = Player(username="Guest")

@app.route('/hook', methods=['POST'])
def receive_hook():
    data = request.get_json()
    event = data.get("event")
    payload = data.get("payload", {})

    if event == "zombie_killed":
        points = payload.get("score", 10)
        exp_gain = payload.get("exp", 15)
        player.add_score(points)
        player.add_exp(exp_gain)

    elif event == "player_hit":
        player.lose_life()

    elif event == "level_up":
        player.next_wave()
        player.add_exp(50)

    elif event == "weapon_changed":
        player.change_weapon(payload.get("weapon", "Unknown"))

    elif event == "game_over":
        print(f"💀 Game Over: {player.to_json()}")

    return jsonify({
        "status": "ok",
        "player": {
            "username": player.username,
            "score": player.score,
            "level": player.level,
            "exp": player.exp,
            "lives": player.lives,
            "wave": player.wave,
            "weapon": player.weapon
        }
    })

if __name__ == "__main__":
    app.run(port=5000)
