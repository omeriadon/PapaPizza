from datetime import datetime, timezone
from decimal import Decimal
from typing import List, Dict, Any, Tuple

from store import GST_RATE, Store, LineItem, Order


def validate_line(
    menu_lookup: Dict[int, Dict[str, Any]], line: Dict[str, Any]
) -> Tuple[int, int]:
    """Validate a single raw line and return (menu_id, qty).

    line must contain keys: id, qty. Raises on invalid data.
    """
    if "id" not in line:
        raise KeyError("Missing field 'id' in order line")
    if "qty" not in line:
        raise KeyError("Missing field 'qty' in order line")

    try:
        menu_id = int(line["id"])
    except (TypeError, ValueError):
        raise ValueError(f"Invalid menu id: {line['id']}")
    try:
        qty = int(line["qty"])
    except (TypeError, ValueError):
        raise ValueError(f"Invalid quantity for id {line['id']}: {line['qty']}")

    if qty <= 0:
        raise ValueError(f"Quantity must be > 0 for item {menu_id}")
    if menu_id not in menu_lookup:
        raise KeyError(f"Menu id not found: {menu_id}")
    return menu_id, qty


def build_line_items(
    raw_items: List[Dict[str, Any]], menu_lookup: Dict[int, Dict[str, Any]]
) -> List[LineItem]:
    """Turn raw items (id, qty) into LineItem objects (no rounding)."""
    if not raw_items:
        raise ValueError("Order must contain at least one line")
    items: List[LineItem] = []
    for raw in raw_items:
        menu_id, qty = validate_line(menu_lookup, raw)
        menu_entry = menu_lookup[menu_id]
        unit_price = Decimal(str(menu_entry["price"]))  # as given in menu
        line_total = unit_price * qty
        items.append(
            LineItem(
                id=str(menu_id),
                code=str(menu_entry.get("code", "")),
                name=str(menu_entry.get("name", "")),
                qty=qty,
                unit_price=unit_price,
                line_total=line_total,
            )
        )
    return items


def calculate_order_totals(items: List[LineItem]) -> Dict[str, Decimal]:
    subtotal = sum((li.line_total for li in items), Decimal("0"))
    gst = subtotal * GST_RATE
    total = subtotal + gst
    return {"subtotal": subtotal, "gst": gst, "total": total}


def generate_daily_summary(store: Store) -> Dict[str, Any]:
    gst_total = store.revenue_ex_gst * GST_RATE
    return {
        "orders": len(store.orders),
        "revenue_ex_gst": store.revenue_ex_gst,
        "gst": gst_total,
        "revenue_inc_gst": store.revenue_ex_gst + gst_total,
        "counts": store._recalculate_counts(),
    }


def order_to_dict(order: Order) -> Dict[str, Any]:
    return {
        "id": order.id,
        "timestamp": order.timestamp,
        "subtotal": str(order.subtotal),
        "gst": str(order.gst),
        "total": str(order.total),
        "items": [
            {
                "id": li.id,
                "code": li.code,
                "name": li.name,
                "qty": li.qty,
                "unit_price": str(li.unit_price),
                "line_total": str(li.line_total),
            }
            for li in order.items
        ],
    }


def summary_to_dict(summary: Dict[str, Any]) -> Dict[str, Any]:
    return {
        **summary,
        "revenue_ex_gst": str(summary["revenue_ex_gst"]),
        "gst": str(summary["gst"]),
        "revenue_inc_gst": str(summary["revenue_inc_gst"]),
    }
