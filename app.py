from flask import Flask, render_template, request, jsonify
import json, os, socket

app = Flask(__name__)
SCORES_FILE = "scores.json"

def load_scores():
    if not os.path.exists(SCORES_FILE):
        return []
    with open(SCORES_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_scores(scores):
    with open(SCORES_FILE, "w", encoding="utf-8") as f:
        json.dump(scores, f, ensure_ascii=False, indent=2)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/start")
def start():
    return render_template("start.html")

@app.route("/aide")
def aide():
    return render_template("aide.html")

@app.route("/apropos")
def apropos():
    return render_template("apropos.html")

@app.route("/api/scores", methods=["GET", "POST"])
def api_scores():
    if request.method == "POST":
        data = request.get_json()
        name = data.get("name", "Anonyme")
        score = int(data.get("score", 0))
        scores = load_scores()
        scores.append({"name": name, "score": score})
        scores = sorted(scores, key=lambda x: x["score"], reverse=True)[:10]
        save_scores(scores)
        return jsonify({"status": "ok", "scores": scores})
    else:
        return jsonify(load_scores())

if __name__ == "__main__":
    hostname = socket.gethostname()
    if "pythonanywhere" in hostname:
        pass
    else:
        app.run(debug=True)