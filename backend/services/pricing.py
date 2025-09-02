from decimal import Decimal
from typing import Iterable, Dict, Any
from store import GST_RATE


def calculate_gst(subtotal: Decimal) -> Decimal:
    return subtotal * GST_RATE
