import { motion, AnimatePresence } from "framer-motion";
import Tag, { type TagProps } from "./Tag";
import { useState } from "react";
import "./MenuItem.css";
import NumberFlow from "@number-flow/react";
import { Minus, Plus } from "lucide-react";

type MenuItemType = {
  id: string;
  name: string;
  price: number;
  tags: TagProps[];
};

interface Props {
  item: MenuItemType;
  onClick?: (item: MenuItemType) => void;
  className?: string;
}

export default function MenuItem({ item, onClick, className }: Props) {
  const [count, setCount] = useState(0);
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className={`grid-item relative ${className ?? ""}`}
      whileHover={{ scale: 1.02 }}
      layout
      onClick={() => onClick?.(item)}
    >
      <div
        className="image-wrapper"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <img
          src={`http://localhost:1984/static/images/pizzas/${item.id}.png`}
          alt={item.name}
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
                    setCount((c) => Math.max(0, c - 1));
                  }}
                  className="glass-2 minus"
                >
                  <Minus strokeWidth={4} />
                </button>
                <NumberFlow className="count glass-3" value={count} />

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCount((c) => c + 1);
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

      <strong>{item.name}</strong>
      <div>${Number(item.price).toFixed(2)}</div>
      <div className="tags-container">
        {item.tags?.map((tag) => (
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
