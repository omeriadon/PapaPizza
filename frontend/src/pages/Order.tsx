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

async function updatePizzaItem(id: string, qty: number): Promise<OrderDetails> {
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
  return {
    items: data.items.map((item: any) => ({
      id: item.id,
      name: item.name,
      price: Number(item.unit_price),
      qty: item.qty,
      tags: [],
    })),
    subtotal: Number(data.subtotal),
    gst: Number(data.gst),
    total: Number(data.total),
  };
}

async function getCurrentOrder(): Promise<OrderDetails> {
  const url = `http://localhost:1984/api/current-order`;
  console.log("[api-inline] getCurrentOrder", url);
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch current order");
  return {
    items: data.items.map((item: any) => ({
      id: item.id,
      name: item.name,
      price: Number(item.unit_price),
      qty: item.qty,
      tags: [],
    })),
    subtotal: Number(data.subtotal),
    gst: Number(data.gst),
    total: Number(data.total),
  };
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

export interface OrderDetails {
  items: OrderPizza[];
  subtotal: number;
  gst: number;
  total: number;
}

function Order() {
  const [order, setOrder] = useState<OrderDetails>({
    items: [],
    subtotal: 0,
    gst: 0,
    total: 0,
  });

  useEffect(() => {
    console.log("[Order] mounting -> fetch current order");
    getCurrentOrder()
      .then((currentOrder) => {
        console.log("[Order] fetched order", currentOrder);
        setOrder(currentOrder);
      })
      .catch((e) => console.error("[Order] fetch error", e));
  }, []);

  const updateCount = async (id: string, delta: number) => {
    console.log("[Order] updateCount called", { id, delta });
    const existing = order.items.find((p) => p.id === id);
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

    // Optimistic update
    setOrder((prev) => {
      let updatedItems: OrderPizza[];
      if (existing) {
        updatedItems = prev.items.map((p) =>
          p.id === id ? { ...p, qty: newQty } : p
        );
      } else {
        // This path is for adding a new item not in the cart.
        // The price is unknown here, but the server response will fix it.
        updatedItems = [
          ...prev.items,
          { id, name: id, price: 0, qty: newQty, tags: [] },
        ];
      }
      // This optimistic update doesn't recalculate totals,
      // but the server response will have the correct values.
      return { ...prev, items: updatedItems };
    });

    try {
      const resp = await updatePizzaItem(id, newQty);
      console.log("[Order] server ack", resp);
      setOrder(resp);
    } catch (error) {
      console.error("[Order] updatePizzaItem error, rolling back", error);
      getCurrentOrder().then((currentOrder) => setOrder(currentOrder));
    }
  };

  return (
    <div className="container">
      <h4 className="left">
        <Menu pizzas={order.items} updateCount={updateCount} />
      </h4>
      <div className="right order-details">
        <h2 className="title">Order Details</h2>
        <AnimatePresence>
          {!order.items.some((p) => p.qty > 0) ? (
            <motion.div
              className="empty-cart-message"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p>Your cart is empty.</p>
              <p>Add some pizzas from the menu to get started!</p>
            </motion.div>
          ) : null}

          {order.items.map(
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

        {order.items.some((p) => p.qty > 0) && (
          <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="order-summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <AnimatedCounter2 value={order.subtotal} />
              </div>
              <div className="summary-row">
                <span>GST</span>
                <AnimatedCounter2 value={order.gst} />
              </div>
              <div className="summary-row total-row">
                <span>Total</span>
                <AnimatedCounter2 value={order.total} />
              </div>
            </div>
            <div
              className="submit-cart-container"
              // initial={{ opacity: 0, y: 20 }}
              // animate={{ opacity: 1, y: 0 }}
              // exit={{ opacity: 0, y: 20 }}
              // transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <SubmitCartButton />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Order;
