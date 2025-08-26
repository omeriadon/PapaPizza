def calculate_gst(subtotal):
    return subtotal * 0.1


def calculate_order_subtotal(order_items: list) -> float:
    return sum(item["price"] * item["quantity"] for item in order_items)


def calculate_grand_total(subtotal: float) -> float:
    return subtotal + calculate_gst(subtotal)


def format_currency_round(amount: float) -> float:
    return round(amount, 2)


