from store import GST_RATE, Store
from decimal import Decimal, ROUND_HALF_UP
from datetime import datetime, timezone
from store import LineItem, Order
from app import Q





def record_order(
    order_id: int,
    order_lines: list,
    subtotal: Decimal,
    gst: Decimal,
    total: Decimal,
    store: Store,
):
    # order_lines = [{id, code, name, qty, unit_price, line_total}, ...]
    # build LineItem and Order dataclasses and append to Store

    items = []
    for line in order_lines:
        items.append(
            LineItem(
                id=int(line["id"]),
                code=str(line.get("code", "")),
                name=str(line.get("name", "")),
                qty=int(line.get("qty", 0)),
                unit_price=Decimal(str(line.get("unit_price"))).quantize(Q, ROUND_HALF_UP),
                line_total=Decimal(str(line.get("line_total"))).quantize(Q, ROUND_HALF_UP),
            )
        )

    order = Order(
        id=order_id,
        items=items,
        subtotal=subtotal.quantize(Q, ROUND_HALF_UP),
        gst=gst.quantize(Q, ROUND_HALF_UP),
        total=total.quantize(Q, ROUND_HALF_UP),
        timestamp=datetime.now(timezone.utc).isoformat(),
    )

    store.orders.append(order)
    store.revenue_ex_gst += subtotal


def generate_daily_summary(store: Store):
    gst_total = (store.revenue_ex_gst * GST_RATE).quantize(Q, ROUND_HALF_UP)
    return {
        "orders": len(store.orders),
        "revenue_ex_gst": store.revenue_ex_gst.quantize(Q, ROUND_HALF_UP),
        "gst": gst_total,
        "revenue_inc_gst": (store.revenue_ex_gst + gst_total).quantize(Q, ROUND_HALF_UP),
        "counts": store._recalculate_counts(),
    }
