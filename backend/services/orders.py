from decimal import Decimal
from typing import Dict, Any

from store import Order


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
