from flask import Flask, jsonify, request
import json
from pathlib import Path
from decimal import Decimal
from typing import Dict, Any

from store import Store, GST_RATE  # single source of truth

app = Flask(__name__)

DATA_DIR = Path(__file__).parent / "data"
MENU_FILE = DATA_DIR / "menu.json"
store = Store()
_menu_cache: Dict[str, Dict[str, Any]] | None = None


def _load_menu() -> list[Dict[str, Any]]:
    global _menu_cache
    if _menu_cache is None:
        with MENU_FILE.open() as f:
            data = json.load(f)
        # build cache keyed by id
        _menu_cache = {item["id"]: item for item in data}
    return list(_menu_cache.values())


def _menu_lookup() -> Dict[str, Dict[str, Any]]:
    _load_menu()  # ensure cache
    assert _menu_cache is not None
    return _menu_cache


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
def menu() -> list[dict]:
    return _load_menu()


@app.get("/api/summary")
def summary():
    s = store.get_summary()
    return jsonify(
        orders=s["orders"],
        revenue_ex_gst=str(s["revenue_ex_gst"]),
        gst=str(s["gst"]),
        revenue_inc_gst=str(s["revenue_inc_gst"]),
        counts=s["counts"],
    )


# -------- Current order (cart) endpoints --------
@app.get("/api/current-order")
def get_current_order():
    return jsonify(store.current_to_dict(_menu_lookup()))


@app.post("/api/current-order/items")
def add_current_item():
    data = request.get_json(force=True, silent=True) or {}
    pid = str(data.get("id", "")).strip()
    qty = int(data.get("qty", 1))
    if not pid:
        return jsonify(error="Missing id"), 400
    try:
        if pid not in _menu_lookup():
            return jsonify(error="Unknown menu id"), 404
        if qty <= 0:
            return jsonify(error="qty must be > 0"), 400
        store.add_to_current(pid, qty)
        return jsonify(store.current_to_dict(_menu_lookup())), 201
    except Exception as e:
        return jsonify(error=str(e)), 400


@app.patch("/api/current-order/items/<pid>")
def update_current_item(pid: str):
    data = request.get_json(force=True, silent=True) or {}
    if "qty" not in data:
        return jsonify(error="Missing qty"), 400
    qty = int(data.get("qty", 0))
    try:
        store.set_current_item(pid, qty)
        return jsonify(store.current_to_dict(_menu_lookup()))
    except Exception as e:
        return jsonify(error=str(e)), 400


@app.delete("/api/current-order/items/<pid>")
def delete_current_item(pid: str):
    store.remove_from_current(pid)
    return jsonify(store.current_to_dict(_menu_lookup()))


@app.post("/api/current-order/commit")
def commit_current():
    try:
        order = store.commit_current(_menu_lookup())
        return jsonify({"order_id": order.id}), 201
    except Exception as e:
        return jsonify(error=str(e)), 400


@app.delete("/api/current-order")
def clear_current():
    store.clear_current()
    return jsonify(store.current_to_dict(_menu_lookup()))


# -------- Orders listing --------
@app.get("/api/orders")
def list_orders():
    return jsonify(store.to_serializable()["orders"])  # list of orders


@app.get("/api/orders/<int:oid>")
def get_order(oid: int):
    for o in store.to_serializable()["orders"]:
        if o["id"] == oid:
            return jsonify(o)
    return jsonify(error="order not found"), 404


@app.get("/")
def root():
    return "PapaPizza Backend Running"


if __name__ == "__main__":
    # For development only
    app.run(host="0.0.0.0", port=1984, debug=True)
