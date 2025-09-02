import "./Order.css";
import Menu from "./Menu";
import { useState, useEffect } from "react";
import {
  AnimatedCounter,
  AnimatedCounter2,
} from "../components/AnimatedCounter";
import { type TagProps } from "../components/Tag";
import { AnimatePresence, motion } from "framer-motion";
import SubmitCartButton from "../components/SubmitCartButton";

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

export interface PizzaOrder {
  pizzas: OrderPizza[]; // Array of pizzas in the order
  buyerName: string; // Buyer's name
  buyerEmail: string; // Buyer's email
  gst: number; // GST amount
  totalRevenueExcludingGst: number; // Total revenue excluding GST
  totalPriceIncludingGst: number; // Total price including GST
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
    let newQty = currentQty + delta;

    // clip newQty to 0–9
    newQty = Math.max(0, Math.min(newQty, 9));

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

    setPizzas((prev) => {
      let updated: OrderPizza[];
      if (existing) {
        updated = prev.map((p) => (p.id === id ? { ...p, qty: newQty } : p));
      } else {
        updated = [...prev, { id, name: id, price: 0, qty: newQty, tags: [] }];
      }
      return updated;
    });

    try {
      const resp = await updatePizzaItem(id, newQty);
      console.log("[Order] server ack", resp);
      if (resp && Array.isArray(resp.items)) {
        setPizzas(
          resp.items.map((it: any) => ({
            id: it.id,
            name: it.name,
            price: Number(it.unit_price),
            qty: it.qty,
            tags: [],
          }))
        );
      }
    } catch (error) {
      console.error("[Order] updatePizzaItem error, rolling back", error);
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
                  className="order-item-container"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="order-item-left">
                    <div className="flex">
                      <p>{pizza.name || pizza.id}</p>
                      <p
                        className="order-item-details-2"
                        style={{
                          color: "rgba(255, 255, 255, 0.7)",
                          marginLeft: "5px",
                        }}
                      >
                        ${pizza.price.toFixed(2)} each
                      </p>
                    </div>
                    <div className="order-item-details">
                      <AnimatedCounter2 value={pizza.price * pizza.qty} />
                    </div>
                  </div>
                  <div className="order-item-right">
                    <AnimatedCounter value={pizza.qty} />
                  </div>
                </motion.div>
              )
          )}
        </AnimatePresence>

        {pizzas.some((p) => p.qty > 0) && (
          <motion.div
            layout
            className="submit-cart-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <SubmitCartButton />
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Order;
