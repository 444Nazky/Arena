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
        player.add_score(payload.get("score", 10))
    elif event == "player_hit":
        player.lose_life()
    elif event == "level_up":
        player.next_wave()
    elif event == "weapon_changed":
        player.change_weapon(payload.get("weapon", "Unknown"))
    elif event == "game_over":
        print(f"💀 Game Over: {player.to_json()}")

    return jsonify({"status": "ok", "player": player.__dict__})

if __name__ == "__main__":
    app.run(port=5000)
