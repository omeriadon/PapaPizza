import { motion } from "framer-motion";
import Tag, { type TagProps } from "./Tag";

type MenuItemType = {
  id: string; // backend uses string ids like 'pepperoni'
  name: string; // matches menu.json key 'name'
  price: number;
  tags: TagProps[];
};

interface Props {
  item: MenuItemType;
  onClick?: (item: MenuItemType) => void;
  className?: string;
}

export default function MenuItem({ item, onClick, className }: Props) {
  return (
    <motion.div
      className={`grid-item ${className ?? ""}`}
      whileHover={{ scale: 1.02 }}
      layout
      onClick={() => onClick?.(item)}
    >
      <img
        src={`http://localhost:1984/static/images/pizzas/${item.id}.png`}
        alt={item.name}
        className="picture"
      />
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
