from flask import Flask, jsonify, request
import json
from pathlib import Path

# Simple Flask app showing how to serve JSON + static images
# Static images live in backend/static/ (Flask auto serves at /static/...)

app = Flask(__name__)  # static_folder defaults to 'static'

DATA_DIR = Path(__file__).parent / 'data'
MENU_FILE = DATA_DIR / 'menu.json'
GST_RATE = 0.10

# In-memory daily sales store (reset when server restarts)
daily_sales = {
    'orders': [],            # list of orders ({items: [...], subtotal, gst, total})
    'counts': {},            # pizza code -> qty sold
    'revenue_ex_gst': 0.0    # running subtotal before GST
}

def load_menu():
    with MENU_FILE.open() as f:
        return json.load(f)

MENU_CACHE = load_menu()

@app.after_request
def add_cors(resp):
    # Allow Vite dev server (port 2007) to call API. Adjust if you change ports.
    resp.headers['Access-Control-Allow-Origin'] = 'http://localhost:2007'
    resp.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    resp.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
    return resp

@app.get('/api/health')
def health():
    return jsonify(status='ok')

@app.get('/api/menu')
def menu():
    # Return the cached menu. Each item has an image path like /static/images/tomato.png
    return jsonify(items=MENU_CACHE)

@app.post('/api/order')
def create_order():
    data = request.get_json(force=True, silent=True) or {}
    items = data.get('items', [])  # Expect list of {id, qty}
    # Build a lookup by id for quick access
    id_lookup = {p['id']: p for p in MENU_CACHE}
    order_lines = []
    subtotal = 0.0
    for line in items:
        pid = line.get('id')
        qty = line.get('qty', 0)
        if pid not in id_lookup or not isinstance(qty, int) or qty <= 0:
            return jsonify(error=f"Invalid item in order: id={pid} qty={qty}"), 400
        pizza = id_lookup[pid]
        line_total = round(pizza['price'] * qty, 2)
        order_lines.append({
            'id': pid,
            'name': pizza['name'],
            'qty': qty,
            'unit_price': pizza['price'],
            'line_total': line_total
        })
        subtotal += line_total
        # Update daily counts
        code = pizza['code']
        daily_sales['counts'][code] = daily_sales['counts'].get(code, 0) + qty
    subtotal = round(subtotal, 2)
    gst = round(subtotal * GST_RATE, 2)
    total = round(subtotal + gst, 2)
    daily_sales['revenue_ex_gst'] += subtotal
    # Store order summary
    daily_sales['orders'].append({'items': order_lines, 'subtotal': subtotal, 'gst': gst, 'total': total})
    return jsonify(subtotal=subtotal, gst=gst, total=total, items=order_lines)

@app.get('/api/summary')
def summary():
    gst_total = round(daily_sales['revenue_ex_gst'] * GST_RATE, 2)
    return jsonify(
        orders=len(daily_sales['orders']),
        revenue_ex_gst=round(daily_sales['revenue_ex_gst'], 2),
        gst=gst_total,
        revenue_inc_gst=round(daily_sales['revenue_ex_gst'] + gst_total, 2),
        counts=daily_sales['counts']
    )

@app.get('/')
def root():
    return 'PapaPizza Backend Running (menu at /api/menu)'

if __name__ == '__main__':
    # For development only
    app.run(host='0.0.0.0', port=1984, debug=True)
