from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/hook', methods=['POST'])
def receive_hook():
    data = request.get_json()
    event = data.get('event')
    payload = data.get('payload', {})

    print(f"🔗 Received hook: {event}")
    print("Payload:", payload)

    # Example actions
    if event == "zombie_killed":
        # update stats, save to db, train model, etc.
        print(f"Zombie killed! Score: {payload.get('score')}")
    elif event == "game_over":
        print(f"Final score: {payload.get('score')} | Wave: {payload.get('wave')}")

    return jsonify({"status": "ok", "event": event})

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000)
