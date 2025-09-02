import { useEffect, useState } from "react";
import "./SalesSummary.css";

async function fetchTotalPriceIncludingGst() {
  const response = await fetch(
    "http://localhost:1984/api/summary/total-price-including-gst"
  );
  const data = await response.json();
  return data.total_price_including_gst; // Returns a Decimal as a string
}

async function fetchTotalGst() {
  const response = await fetch("http://localhost:1984/api/summary/total-gst");
  const data = await response.json();
  return data.total_gst; // Returns a Decimal as a string
}

async function fetchTotalRevenueExcludingGst() {
  const response = await fetch(
    "http://localhost:1984/api/summary/total-revenue-excluding-gst"
  );
  const data = await response.json();
  return data.total_revenue_excluding_gst; // Returns a Decimal as a string
}

async function fetchOrdersList() {
  const response = await fetch("http://localhost:1984/api/summary/orders-list");
  const data = await response.json();
  return data.orders; // Returns a list of orders with details
}

function SalesSummary() {
  const [totalPriceIncludingGst, setTotalPriceIncludingGst] =
    useState<string>("");
  const [totalGst, setTotalGst] = useState<string>("");
  const [totalRevenueExcludingGst, setTotalRevenueExcludingGst] =
    useState<string>("");
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchTotalPriceIncludingGst().then(setTotalPriceIncludingGst);
    fetchTotalGst().then(setTotalGst);
    fetchTotalRevenueExcludingGst().then(setTotalRevenueExcludingGst);
    fetchOrdersList().then(setOrders);
  }, []);

  return (
    <div className="sales-summary-container">
      <h1 className="title">Sales Summary</h1>
      <div className="summary-section">
        <div style={{ textAlign: "left" }}>
          <p>
            <strong>Total Revenue (Including GST)</strong>
          </p>
          <p className="stat">${totalPriceIncludingGst}</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <p>
            <strong>Total GST</strong>
          </p>
          <p className="stat">${totalGst}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p>
            <strong>Total Revenue (Excluding GST):</strong>{" "}
          </p>
          <p className="stat">${totalRevenueExcludingGst}</p>
        </div>
      </div>

      <div className="orders-section">
        <h2 className="title">Orders</h2>
        {orders.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Timestamp</th>
                <th>Subtotal</th>
                <th>GST</th>
                <th>Total</th>
                <th>Items</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{new Date(order.timestamp).toLocaleString()}</td>
                  <td>${order.subtotal}</td>
                  <td>${order.gst}</td>
                  <td>${order.total}</td>
                  <td>
                    {order.items.map((item: any) => (
                      <div key={item.id}>
                        {item.name} (x{item.qty}) - ${item.line_total}
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No orders available.</p>
        )}
      </div>
    </div>
  );
}

export default SalesSummary;
