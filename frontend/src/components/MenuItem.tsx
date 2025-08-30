import { motion, AnimatePresence } from "framer-motion";
import Tag, { type TagProps } from "./Tag";
import { useState } from "react";
import "./MenuItem.css";
import { Minus, Plus } from "lucide-react";
import { type OrderPizza } from "../pages/Order";
import { AnimatedCounter } from "./AnimatedCounter";

interface MenuItemProps {
  pizza: OrderPizza;
  updateCount: (id: string, delta: number) => void;
  className?: string;
}

export default function MenuItem({
  pizza,
  updateCount,
  className,
}: MenuItemProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className={`grid-item relative ${className ?? ""}`}
      whileHover={{ scale: 1.02 }}
      layout
    >
      <div
        className="image-wrapper"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <img
          src={`http://localhost:1984/static/images/pizzas/${pizza.id}.png`}
          alt={pizza.name}
          className="picture"
        />

        <AnimatePresence>
          {hovered && (
            <motion.div
              className="overlay"
              initial={{ scale: 0.1 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.1 }}
            >
              <motion.div
                className="controls"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                transition={{ type: "tween", stiffness: 200, damping: 15 }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log(
                      "[MenuItem] minus click",
                      pizza.id,
                      "current",
                      pizza.qty
                    );
                    updateCount(pizza.id, -1);
                  }}
                  className="glass-2 minus"
                >
                  <Minus strokeWidth={4} />
                </button>

                <div className="count glass-3">
                  <AnimatedCounter value={pizza.qty} />
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log(
                      "[MenuItem] plus click",
                      pizza.id,
                      "current",
                      pizza.qty
                    );
                    updateCount(pizza.id, +1);
                  }}
                  className="glass-2 plus"
                >
                  <Plus strokeWidth={4} />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <strong>{pizza.name}</strong>
      <div>${Number(pizza.price).toFixed(2)}</div>
      <div className="tags-container">
        {pizza.tags?.map((tag: TagProps) => (
          <Tag
            key={tag.id}
            id={tag.id}
            title={tag.title}
            bgColour={tag.bgColour}
          />
        ))}
      </div>
    </motion.div>
  );
}
