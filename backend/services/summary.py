from typing import Dict, Any, List
from decimal import Decimal
from datetime import datetime
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


def get_daily_summary(store: Store) -> List[Dict[str, Any]]:
    """Get a summary of sales for each day."""
    daily_data: Dict[str, Dict[str, Any]] = {}
    for order in store.orders:
        date_str = datetime.fromisoformat(order.timestamp).strftime("%Y-%m-%d")
        if date_str not in daily_data:
            daily_data[date_str] = {
                "date": date_str,
                "revenue_inc_gst": Decimal("0"),
                "gst": Decimal("0"),
                "pizzas_sold": 0,
            }
        daily_data[date_str]["revenue_inc_gst"] += order.total
        daily_data[date_str]["gst"] += order.gst
        daily_data[date_str]["pizzas_sold"] += sum(item.qty for item in order.items)

    # Convert Decimals to strings for JSON serialization
    summary_list = list(daily_data.values())
    for summary in summary_list:
        summary["revenue_ex_gst"] = str(summary["revenue_inc_gst"] - summary["gst"])
        summary["revenue_inc_gst"] = str(summary["revenue_inc_gst"])
        summary["gst"] = str(summary["gst"])

    return summary_list
