from decimal import Decimal
from typing import Iterable, Dict, Any
from store import GST_RATE


def calculate_order_subtotal(order_items: Iterable[Dict[str, Any]]) -> Decimal:
    total = Decimal("0")
    for item in order_items:
        price = Decimal(str(item["price"]))
        qty = int(item["quantity"])
        total += price * qty
    return total


def calculate_gst(subtotal: Decimal) -> Decimal:
    return subtotal * GST_RATE


def calculate_grand_total(subtotal: Decimal) -> Decimal:
    return subtotal + calculate_gst(subtotal)


def breakdown(order_items: Iterable[Dict[str, Any]]) -> Dict[str, Decimal]:
    subtotal = calculate_order_subtotal(order_items)
    gst = calculate_gst(subtotal)
    total = subtotal + gst
    return {"subtotal": subtotal, "gst": gst, "total": total}
