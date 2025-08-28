import { useEffect, useState } from "react";
import type { TagProps } from "../components/Tag";
import "./Menu.css";
import MenuItem from "../components/MenuItem";

interface PizzaItem {
  id: string;
  name: string;
  price: number;
  tags: TagProps[];
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
      .then((data: PizzaItem[] | { items: PizzaItem[] }) => {
        const items = Array.isArray(data) ? data : data.items ?? [];
        setMenu(items);
      })

      .catch((e) => {
        console.error(e);
        setError(String(e));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {loading && <p>Loading menu...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      <div className="grid-container">
        {menu.length === 0 && !loading && <p>No menu items.</p>}
        {menu.map((item) => (
          <MenuItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

export default Menu;
