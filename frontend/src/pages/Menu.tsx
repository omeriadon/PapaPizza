import { useEffect, useState } from "react";

interface PizzaItem {
  id: string;
  name: string;
  price: number;
  image?: string;
}

function Menu() {
  const [menu, setMenu] = useState<PizzaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:1984";

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/menu`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        // accept either { items: [...] } or direct array
        const items = Array.isArray(data) ? data : data.items ?? [];
        setMenu(items);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: "1rem", fontFamily: "system-ui, sans-serif" }}>
      {loading && <p>Loading menu...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {menu.length === 0 && !loading && <p>No menu items.</p>}
        {menu.map((item) => (
          <div
            key={item.id}
            style={{ border: "1px solid #ccc", padding: "0.5rem", width: 180 }}
          >
            <img
              src={
                item.image
                  ? `${API_BASE}${item.image}`
                  : `${API_BASE}/static/images/pizzas/${item.id}.png`
              }
              alt={item.name}
              style={{
                width: "100%",
                height: 120,
                objectFit: "cover",
                borderRadius: 4,
              }}
            />
            <strong>{item.name}</strong>
            <div>${Number(item.price).toFixed(2)}</div>
            <small>{item.id}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Menu;
