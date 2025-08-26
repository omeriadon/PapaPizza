import "./App.css";
import { useEffect, useState } from "react";

interface PizzaItem {
  id: number;
  code: string;
  name: string;
  price: number;
  image: string; // path starting with /static/...
}

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:1984";

function App() {
  const [menu, setMenu] = useState<PizzaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/menu`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP Error: ${r.status}`);
        return r.json();
      })
      .then((data) => setMenu(data.items))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: "1rem", fontFamily: "system-ui, sans-serif" }}>
      {loading && <p>Loading menu...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      <div style={{ display: "flex", gap: "1rem" }}>
        {menu.map((item) => (
          <div
            key={item.id}
            style={{ border: "1px solid #ccc", padding: "0.5rem", width: 180 }}
          >
            <img
              src={`${API_BASE}${item.image}`}
              alt={item.name}
              style={{
                width: "100%",
                height: 120,
                objectFit: "cover",
                borderRadius: 4,
              }}
            />
            <strong>{item.name}</strong>
            <div>${item.price.toFixed(2)}</div>
            <small>{item.code}</small>
          </div>
        ))}
      </div>
      <hr />
      <p>Direct static example:</p>
      <img
        src={`${API_BASE}/static/images/tomato.png`}
        alt="Tomato"
        width={100}
      />
    </div>
  );
}

export default App;
