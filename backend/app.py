from flask import Flask, jsonify, request
import json
from pathlib import Path
from decimal import Decimal

app = Flask(__name__)

DATA_DIR = Path(__file__).parent / "data"
MENU_FILE = DATA_DIR / "menu.json"
GST_RATE = Decimal("0.10")
Q = Decimal("0.01")

store = {
    "orders": [],
    "counts": {},
    "revenue_ex_gst": Decimal("0.00"),
}


@app.after_request
def add_cors(resp):
    # Allow Vite dev server (port 2007) to call API. Adjust if you change ports.
    resp.headers["Access-Control-Allow-Origin"] = "http://localhost:2007"
    resp.headers["Access-Control-Allow-Headers"] = "Content-Type"
    resp.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
    return resp


@app.get("/api/health")
def health():
    return jsonify(status="ok")


@app.get("/api/menu")
def menu() -> dict:
    with MENU_FILE.open() as f:
        return json.load(f)


@app.get("/api/summary")
def summary():
    gst_total = round(store["revenue_ex_gst"] * GST_RATE, 2)
    return jsonify(
        orders=len(store["orders"]),
        revenue_ex_gst=round(store["revenue_ex_gst"], 2),
        gst=gst_total,
        revenue_inc_gst=round(store["revenue_ex_gst"] + gst_total, 2),
        counts=store["counts"],
    )


@app.get("/")
def root():
    return "PapaPizza Backend Running"


if __name__ == "__main__":
    # For development only
    app.run(host="0.0.0.0", port=1984, debug=True)
