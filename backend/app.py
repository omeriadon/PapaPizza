from flask import Flask, jsonify, request, make_response
import json
from pathlib import Path
from decimal import Decimal
from typing import Dict, Any

from store import Store, GST_RATE  # single source of truth
from services.summary import (
    get_total_price_including_gst,
    get_total_gst,
    get_total_revenue_excluding_gst,
    get_orders_list,
    get_daily_summary,
)

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
    resp.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS,DELETE,PATCH"
    return resp


@app.route("/api/current-order/items/<pid>", methods=["OPTIONS"])
def options_current_item(pid: str):
    """Handle CORS preflight for item update/delete"""
    resp = make_response()
    return add_cors(resp)


@app.get("/api/health")
def health():
    return jsonify(status="ok")


@app.get("/api/menu")
def menu() -> list[dict]:
    print("[backend] /api/menu called")
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
        orders_list=get_orders_list(store),
        daily_summary=get_daily_summary(store),
    )


@app.get("/api/summary/total-price-including-gst")
def total_price_including_gst():
    return jsonify(total_price_including_gst=str(get_total_price_including_gst(store)))


@app.get("/api/summary/total-gst")
def total_gst():
    return jsonify(total_gst=str(get_total_gst(store)))


@app.get("/api/summary/total-revenue-excluding-gst")
def total_revenue_excluding_gst():
    return jsonify(
        total_revenue_excluding_gst=str(get_total_revenue_excluding_gst(store))
    )


@app.get("/api/summary/orders-list")
def orders_list():
    return jsonify(orders=get_orders_list(store))


# -------- Current order (cart) endpoints --------
@app.get("/api/current-order")
def get_current_order():
    print("[backend] GET /api/current-order -> state", store.current)
    return jsonify(store.current_to_dict(_menu_lookup()))


@app.post("/api/current-order/items")
def add_current_item():
    data = request.get_json(force=True, silent=True) or {}
    print("[backend] POST /api/current-order/items payload", data)
    pid = str(data.get("id", "")).strip()
    raw_qty = data.get("qty", 1)
    try:
        qty = int(raw_qty)
    except Exception:
        return jsonify(error="qty must be an integer"), 400
    if not pid:
        return jsonify(error="Missing id"), 400
    if pid not in _menu_lookup():
        return jsonify(error="Unknown menu id"), 404
    if qty <= 0:
        return jsonify(error="qty must be > 0"), 400
    try:
        store.add_to_current(pid, qty)
    except Exception as e:
        return jsonify(error=str(e)), 400
    print("[backend] added", pid, qty, "current=", store.current)
    return jsonify(store.current_to_dict(_menu_lookup())), 201


@app.patch("/api/current-order/items/<pid>")
def update_current_item(pid: str):
    data = request.get_json(force=True, silent=True) or {}
    print(f"[backend] PATCH /api/current-order/items/{pid} payload", data)
    if "qty" not in data:
        return jsonify(error="Missing qty"), 400
    raw_qty = data.get("qty")
    if raw_qty is None:
        return jsonify(error="qty cannot be null"), 400
    try:
        qty = int(raw_qty)
    except Exception:
        return jsonify(error="qty must be an integer"), 400
    try:
        store.set_current_item(pid, qty)
    except Exception as e:
        return jsonify(error=str(e)), 400
    print("[backend] updated", pid, qty, "current=", store.current)
    return jsonify(store.current_to_dict(_menu_lookup()))


@app.delete("/api/current-order/items/<pid>")
def delete_current_item(pid: str):
    print(f"[backend] DELETE /api/current-order/items/{pid}")
    store.remove_from_current(pid)
    print("[backend] after delete current=", store.current)
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
