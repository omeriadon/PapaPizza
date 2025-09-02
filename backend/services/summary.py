from typing import Dict, Any, List
from decimal import Decimal
from store import Store, GST_RATE
from services.orders import order_to_dict


def get_orders_list(store: Store) -> List[Dict[str, Any]]:
    """Get a list of all orders with their details."""
    return [order_to_dict(o) for o in store.orders]
