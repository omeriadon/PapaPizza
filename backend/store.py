from dataclasses import dataclass, asdict
from decimal import Decimal, ROUND_HALF_UP
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional


GST_RATE = Decimal("0.10")
Q = Decimal("0.01")


@dataclass
class LineItem:
    id: str 
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
        self.current: Dict[str, int] = {}

    def reset_store(self) -> None:
        self.orders.clear()
        self.revenue_ex_gst = Decimal("0.00")
        self._next_order_id = 1
        self.current.clear()

    def _quantize(self, value: Decimal) -> Decimal:
        return value.quantize(Q, rounding=ROUND_HALF_UP)

    def add_to_current(self, pizza_id: str, qty: int = 1) -> None:
        if qty <= 0:
            raise ValueError("qty must be > 0")
        self.current[pizza_id] = self.current.get(pizza_id, 0) + qty

    def set_current_item(self, pizza_id: str, qty: int) -> None:
        if qty < 0:
            raise ValueError("qty cannot be negative")
        if qty == 0:
            self.current.pop(pizza_id, None)
        else:
            self.current[pizza_id] = qty

    def remove_from_current(self, pizza_id: str) -> None:
        self.current.pop(pizza_id, None)

    def clear_current(self) -> None:
        self.current.clear()

    def _build_line_item(
        self, pid: str, qty: int, menu_lookup: Dict[str, Dict[str, Any]]
    ) -> LineItem:
        menu_item = menu_lookup.get(pid)
        if not menu_item:
            raise KeyError(f"Menu id not found: {pid}")
        unit_price = Decimal(str(menu_item["price"]))
        line_total = self._quantize(unit_price * qty)
        return LineItem(
            id=pid,
            code=str(menu_item.get("code", "")),
            name=str(menu_item.get("name", menu_item.get("id", pid))),
            qty=qty,
            unit_price=self._quantize(unit_price),
            line_total=line_total,
        )

    def build_current_items(
        self, menu_lookup: Dict[str, Dict[str, Any]]
    ) -> List[LineItem]:
        return [
            self._build_line_item(pid, qty, menu_lookup)
            for pid, qty in self.current.items()
            if qty > 0
        ]

    def calculate_totals(self, items: List[LineItem]) -> Dict[str, Decimal]:
        subtotal = sum((li.line_total for li in items), Decimal("0.00"))
        gst = self._quantize(subtotal * GST_RATE)
        total = self._quantize(subtotal + gst)
        return {"subtotal": self._quantize(subtotal), "gst": gst, "total": total}

    def commit_current(self, menu_lookup: Dict[str, Dict[str, Any]]) -> Order:
        if not self.current:
            raise ValueError("current order is empty")
        items = self.build_current_items(menu_lookup)
        totals = self.calculate_totals(items)
        order = Order(
            id=self._next_order_id,
            items=items,
            subtotal=totals["subtotal"],
            gst=totals["gst"],
            total=totals["total"],
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
        self.orders.append(order)
        self.revenue_ex_gst += totals["subtotal"]
        self._next_order_id += 1
        self.clear_current()
        return order

    def _recalculate_counts(self) -> Dict[str, int]:
        counts: Dict[str, int] = {}
        for o in self.orders:
            for line in o.items:
                counts[line.id] = counts.get(line.id, 0) + line.qty
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

    def current_to_dict(self, menu_lookup: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
        items = self.build_current_items(menu_lookup)
        totals = (
            self.calculate_totals(items)
            if items
            else {"subtotal": Decimal("0"), "gst": Decimal("0"), "total": Decimal("0")}
        )
        return {
            "items": [
                {
                    "id": li.id,
                    "name": li.name,
                    "qty": li.qty,
                    "unit_price": str(li.unit_price),
                    "line_total": str(li.line_total),
                }
                for li in items
            ],
            "subtotal": str(totals["subtotal"]),
            "gst": str(totals["gst"]),
            "total": str(totals["total"]),
        }
