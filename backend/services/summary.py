from typing import Dict, Any, List, Optional
from decimal import Decimal
from store import Store, GST_RATE
from services.orders import order_to_dict


def _aggregate_counts(store: Store) -> Dict[str, int]:
    counts: Dict[str, int] = {}
    for o in store.orders:
        for li in o.items:
            counts[li.id] = counts.get(li.id, 0) + li.qty
    return counts


def get_basic_summary(store: Store) -> Dict[str, Any]:
    gst_total = store.revenue_ex_gst * GST_RATE
    return {
        "orders": len(store.orders),
        "revenue_ex_gst": store.revenue_ex_gst,
        "gst": gst_total,
        "revenue_inc_gst": store.revenue_ex_gst + gst_total,
        "counts": _aggregate_counts(store),
    }


def get_orders(store: Store) -> List[Dict[str, Any]]:
    return [order_to_dict(o) for o in store.orders]


def get_order(store: Store, order_id: int) -> Optional[Dict[str, Any]]:
    for o in store.orders:
        if o.id == order_id:
            return order_to_dict(o)
    return None


def build_per_pizza_sales(
    store: Store, menu_lookup: Dict[str, Dict[str, Any]]
) -> List[Dict[str, Any]]:
    qty_map: Dict[str, int] = {}
    revenue_map: Dict[str, Decimal] = {}
    for o in store.orders:
        for li in o.items:
            qty_map[li.id] = qty_map.get(li.id, 0) + li.qty
            revenue_map[li.id] = revenue_map.get(li.id, Decimal("0")) + li.line_total

    rows: List[Dict[str, Any]] = []
    for pid, qty in qty_map.items():
        meta = menu_lookup.get(pid, {})
        rows.append(
            {
                "id": pid,
                "code": meta.get("code", ""),
                "name": meta.get("name", "Unknown"),
                "qty": qty,
                "revenue_ex_gst": revenue_map.get(pid, Decimal("0")),
            }
        )
    rows.sort(key=lambda r: r["id"])
    return rows


def get_detailed_summary(
    store: Store,
    menu_lookup: Dict[str, Dict[str, Any]],
    include_orders: bool = False,
) -> Dict[str, Any]:
    basic = get_basic_summary(store)
    per_pizza = build_per_pizza_sales(store, menu_lookup)
    avg_order_value = (
        (basic["revenue_ex_gst"] + basic["gst"]) / basic["orders"]
        if basic["orders"] > 0
        else Decimal("0")
    )
    payload: Dict[str, Any] = {
        **basic,
        "per_pizza": per_pizza,
        "avg_order_total_inc_gst": avg_order_value,
    }
    if include_orders:
        payload["orders_list"] = get_orders(store)
    return payload
