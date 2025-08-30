import { useEffect, useState, useMemo } from "react";
import "./Menu.css";
import MenuItem from "../components/MenuItem";
import { type PizzaItem, type OrderPizza } from "./Order";

interface MenuProps {
  pizzas: OrderPizza[];
  updateCount: (id: string, delta: number) => void;
}

function Menu({ pizzas, updateCount }: MenuProps) {
  // Keep only the base menu (without qty) locally; qty comes from parent pizzas prop.
  const [baseMenu, setBaseMenu] = useState<PizzaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:1984";

  useEffect(() => {
    console.log("[Menu] fetch menu start");
    setLoading(true);
    fetch(`${API_BASE}/api/menu`)
      .then((r) => {
        console.log("[Menu] menu response status", r.status);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<PizzaItem[]>;
      })
      .then((menuData) => {
        console.log("[Menu] menuData", menuData);
        setBaseMenu(menuData);
      })
      .catch((e) => {
        console.error("[Menu] error", e);
        setError(String(e));
      })
      .finally(() => setLoading(false));
  }, [API_BASE]);

  // Merge current quantities from parent state every render (keeps UI live)
  const merged: OrderPizza[] = useMemo(() => {
    const m = baseMenu.map((item) => {
      const match = pizzas.find((p) => p.id === item.id);
      return {
        id: item.id,
        name: item.name,
        price: item.price,
        tags: item.tags ?? [],
        qty: match?.qty ?? 0,
      } as OrderPizza;
    });
    console.log("[Menu] merged", m);
    return m;
  }, [baseMenu, pizzas]);

  return (
    <div>
      {loading && <p>Loading menu...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      <div className="grid-container">
        {merged.length === 0 && !loading && <p>No menu items.</p>}
        {merged.map((pizza) => (
          <MenuItem key={pizza.id} pizza={pizza} updateCount={updateCount} />
        ))}
      </div>
    </div>
  );
}

export default Menu;
