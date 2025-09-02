from typing import Dict, Any, List
from decimal import Decimal
from store import Store, GST_RATE
from services.orders import order_to_dict


def get_total_price_including_gst(store: Store) -> Decimal:
    """Calculate the total revenue including GST."""
    gst_total = store.revenue_ex_gst * GST_RATE
    return store.revenue_ex_gst + gst_total


def get_total_gst(store: Store) -> Decimal:
    """Calculate the total GST collected."""
    return store.revenue_ex_gst * GST_RATE


def get_total_revenue_excluding_gst(store: Store) -> Decimal:
    """Get the total revenue excluding GST."""
    return store.revenue_ex_gst


def get_orders_list(store: Store) -> List[Dict[str, Any]]:
    """Get a list of all orders with their details."""
    return [order_to_dict(o) for o in store.orders]
