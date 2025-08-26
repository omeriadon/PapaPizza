from dataclasses import dataclass, asdict
from decimal import Decimal, ROUND_HALF_UP
from datetime import datetime, timezone
from typing import List, Dict, Any

Q = Decimal("0.01")            # quantize step (one cent)
GST_RATE = Decimal("0.10")     # 10% GST


@dataclass
class LineItem:
    id: int
    code: str
    name: str
    qty: int
    unit_price: Decimal
    line_total: Decimal


@dataclass
class Order:
    id: int
    items: List[LineItem]
    subtotal: Decimal
    gst: Decimal
    total: Decimal
    timestamp: str


class Store:
    def __init__(self) -> None:
        self.orders: List[Order] = []
        self.revenue_ex_gst: Decimal = Decimal("0.00")
        self._next_order_id: int = 1

    def _quantize(self, value: Decimal) -> Decimal:
        return value.quantize(Q, rounding=ROUND_HALF_UP)

    def add_order(self, raw_items: List[Dict[str, Any]], menu_lookup: Dict[int, Dict[str, Any]]) -> Order:
        """
        raw_items: list of {'id': int, 'qty': int}
        menu_lookup: dict mapping menu id -> menu entry that must include 'code','name','price'
        """
        if not raw_items:
            raise ValueError("order must contain at least one item")

        items: List[LineItem] = []
        subtotal = Decimal("0.00")

        for entry in raw_items:
            try:
                mid = int(entry["id"])
            except KeyError:
                raise KeyError("Order item missing 'id'")
            qty = int(entry.get("qty", 0))
            if qty <= 0:
                raise ValueError(f"Invalid quantity for item {mid}: {qty}")

            menu_item = menu_lookup.get(mid)
            if not menu_item:
                raise KeyError(f"Menu id not found: {mid}")

            # normalize price into Decimal
            unit_price = Decimal(str(menu_item["price"]))
            line_total = self._quantize(unit_price * qty)

            items.append(
                LineItem(
                    id=mid,
                    code=str(menu_item.get("code", "")),
                    name=str(menu_item.get("name", "")),
                    qty=qty,
                    unit_price=self._quantize(unit_price),
                    line_total=line_total,
                )
            )
            subtotal += line_total

        subtotal = self._quantize(subtotal)
        gst = self._quantize(subtotal * GST_RATE)
        total = self._quantize(subtotal + gst)

        order = Order(
            id=self._next_order_id,
            items=items,
            subtotal=subtotal,
            gst=gst,
            total=total,
            timestamp=datetime.now(timezone.utc).isoformat(),
        )

        self.orders.append(order)
        self.revenue_ex_gst += subtotal
        self._next_order_id += 1

        return order

    def _recalculate_counts(self) -> Dict[str, int]:
        counts: Dict[str, int] = {}
        for o in self.orders:
            for line in o.items:
                counts[line.code] = counts.get(line.code, 0) + line.qty
        return counts

    def get_summary(self) -> Dict[str, Any]:
        gst_total = self._quantize(self.revenue_ex_gst * GST_RATE)
        return {
            "orders": len(self.orders),
            "revenue_ex_gst": self._quantize(self.revenue_ex_gst),
            "gst": gst_total,
            "revenue_inc_gst": self._quantize(self.revenue_ex_gst + gst_total),
            "counts": self._recalculate_counts(),
        }

    def to_serializable(self) -> Dict[str, Any]:
        """Convert store into JSON-serializable dict (decimals -> strings)"""
        return {
            "orders": [
                {
                    **asdict(o),
                    "items": [
                        {
                            **asdict(li),
                            "unit_price": str(li.unit_price),
                            "line_total": str(li.line_total),
                        }
                        for li in o.items
                    ],
                    "subtotal": str(o.subtotal),
                    "gst": str(o.gst),
                    "total": str(o.total),
                }
                for o in self.orders
            ],
            "counts": self._recalculate_counts(),
            "revenue_ex_gst": str(self._quantize(self.revenue_ex_gst)),
        }

# Example usage (for quick testing)
if __name__ == "__main__":
    # pretend menu_lookup loaded from data/menu.json
    menu_lookup = {
        2: {"code": "PEPP", "name": "Pepperoni", "price": 21.0},
        6: {"code": "MARG", "name": "Margherita", "price": 18.5},
    }

    s = Store()
    order = s.add_order([{"id": 2, "qty": 2}, {"id": 6, "qty": 1}], menu_lookup)
    print(order)
    print(s.get_summary())
    print(s.to_serializable())
