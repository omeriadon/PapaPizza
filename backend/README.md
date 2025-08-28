## Dataclasses (store.py)

LineItem(id: str, code: str, name: str, qty: int, unit_price: Decimal, line_total: Decimal)
Order(id: int, items: list[LineItem], subtotal: Decimal, gst: Decimal, total: Decimal, timestamp: str)

## Store methods (public-use)

add_to_current(pizza_id, qty=1)
set_current_item(pizza_id, qty)
remove_from_current(pizza_id)
clear_current()
commit_current(menu_lookup) -> Order
get_summary() -> dict
current_to_dict(menu_lookup) -> dict
to_serializable() -> dict

## API Endpoints

GET /api/health -> status check
GET /api/menu -> list menu items
GET /api/summary -> overall summary

Current order (cart)
GET /api/current-order -> current order (items + totals)
POST /api/current-order/items -> add item {id, qty?}
PATCH /api/current-order/items/<id> -> set quantity {qty}
DELETE /api/current-order/items/<id> -> remove item
POST /api/current-order/commit -> commit cart to new order (returns order_id)
DELETE /api/current-order -> clear cart

Orders
GET /api/orders -> list committed orders
GET /api/orders/<order_id> -> single order or 404

Root
GET / -> plain text service message

## Response Shapes (selected)

Current order:
{
"items": [ {"id": str, "name": str, "qty": int, "unit_price": str, "line_total": str}, ... ],
"subtotal": "decimal-str",
"gst": "decimal-str",
"total": "decimal-str"
}

Summary:
{
"orders": int,
"revenue_ex_gst": "decimal-str",
"gst": "decimal-str",
"revenue_inc_gst": "decimal-str",
"counts": { pizza_id: qty, ... }
}
