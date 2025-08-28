import { useEffect, useState } from "react";
import Tag from "../components/Tag";
import type { TagProps } from "../components/Tag";
import "./Menu.css";
import { motion } from "framer-motion";

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
          <motion.div
            key={item.id}
            className="grid-item"
            whileHover={{ scale: 1.02 }}
            layout
          >
            <img
              src={`${API_BASE}/static/images/pizzas/${item.id}.png`}
              alt={item.name}
              className="picture"
            />
            <strong>{item.name}</strong>
            <div>${Number(item.price).toFixed(2)}</div>
            <div className="tags-container">
              {item.tags.map((tag) => (
                <Tag
                  id={tag.id}
                  key={tag.id}
                  title={tag.title}
                  bgColour={tag.bgColour}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default Menu;
