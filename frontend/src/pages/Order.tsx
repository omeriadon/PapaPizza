import "./Order.css";
import Menu from "./Menu";
import { useState, useEffect } from "react";
import { SlidingNumber } from "../components/motion-primitives/sliding-number";
import { type TagProps } from "../components/Tag";
import { AnimatePresence, motion } from "framer-motion";

async function updatePizzaItem(id: string, qty: number): Promise<any> {
  console.log("[api-inline] updatePizzaItem", { id, qty });
  const url = `http://localhost:1984/api/current-order/items/${id}`;
  const options: RequestInit =
    qty <= 0
      ? { method: "DELETE" }
      : {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ qty }),
        };
  const res = await fetch(url, options);
  let data: any = null;
  try {
    data = await res.json();
  } catch (e) {
    console.warn("[api-inline] non JSON", e);
  }
  if (!res.ok) throw new Error(data?.error || `Failed (${res.status})`);
  return data;
}

async function getPizzaQuantities(): Promise<OrderPizza[]> {
  const url = `http://localhost:1984/api/current-order`;
  console.log("[api-inline] getPizzaQuantities", url);
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch current order");
  return data.items.map((item: any) => ({
    id: item.id,
    name: item.name,
    price: Number(item.unit_price),
    qty: item.qty,
    tags: [],
  }));
}

export interface PizzaItem {
  id: string;
  name: string;
  price: number;
  tags?: TagProps[];
}

export interface OrderPizza extends PizzaItem {
  qty: number;
}

function Order() {
  const [pizzas, setPizzas] = useState<OrderPizza[]>([]);

  useEffect(() => {
    console.log("[Order] mounting -> fetch current order");
    getPizzaQuantities()
      .then((items) => {
        console.log("[Order] fetched pizzas", items);
        setPizzas(items);
      })
      .catch((e) => console.error("[Order] fetch error", e));
  }, []);

  const updateCount = async (id: string, delta: number) => {
    console.log("[Order] updateCount called", { id, delta });
    const existing = pizzas.find((p) => p.id === id);
    const currentQty = existing?.qty ?? 0;
    const newQty = currentQty + delta;
    console.log(
      "[Order] computed newQty",
      newQty,
      "from",
      currentQty,
      "+",
      delta,
      "exists?",
      !!existing
    );
    if (newQty < 0) {
      console.warn("[Order] newQty < 0; ignoring");
      return;
    }
    setPizzas((prev) => {
      let updated: OrderPizza[];
      if (existing) {
        updated = prev.map((p) => (p.id === id ? { ...p, qty: newQty } : p));
      } else {
        // create placeholder entry (will be enriched when menu merges in Menu component)
        updated = [...prev, { id, name: id, price: 0, qty: newQty, tags: [] }];
      }
      console.log("[Order] optimistic state", updated);
      return updated;
    });
    try {
      const resp = await updatePizzaItem(id, newQty);
      console.log("[Order] server ack", resp);
    } catch (error) {
      console.error("[Order] updatePizzaItem error, rolling back", error);
      // rollback by refetch
      getPizzaQuantities().then((items) => setPizzas(items));
    }
  };

  return (
    <div className="container">
      <h4 className="left">
        <Menu pizzas={pizzas} updateCount={updateCount} />
      </h4>
      <div className="right order-details">
        <h2 className="title">Order Details</h2>
        <AnimatePresence>
          {pizzas.map(
            (pizza) =>
              pizza.qty > 0 && (
                <motion.div
                  key={pizza.id}
                  className="order-item"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <span>{pizza.id}</span>
                  <span>
                    <SlidingNumber value={pizza.qty} />
                  </span>
                </motion.div>
              )
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Order;
