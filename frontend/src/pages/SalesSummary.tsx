import { useEffect, useState } from "react";
import "./SalesSummary.css";

interface SummaryData {
  revenue_inc_gst: string;
  gst: string;
  revenue_ex_gst: string;
  orders_list: any[];
}

async function fetchSummaryData(): Promise<SummaryData> {
  const response = await fetch("http://localhost:1984/api/summary");
  const data = await response.json();
  return data;
}

function SalesSummary() {
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);

  useEffect(() => {
    fetchSummaryData().then(setSummaryData);
  }, []);

  if (!summaryData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="sales-summary-container">
      <h1 className="title">Sales Summary</h1>
      <div className="summary-section">
        <div style={{ textAlign: "left" }}>
          <p>
            <strong>Total Revenue (Including GST)</strong>
          </p>
          <p className="stat">${summaryData.revenue_inc_gst}</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <p>
            <strong>Total GST</strong>
          </p>
          <p className="stat">${summaryData.gst}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p>
            <strong>Total Revenue (Excluding GST):</strong>{" "}
          </p>
          <p className="stat">${summaryData.revenue_ex_gst}</p>
        </div>
      </div>

      <div className="orders-section">
        <h2 className="title">Orders</h2>
        {summaryData.orders_list.length > 0 ? (
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
              {summaryData.orders_list.map((order) => (
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
