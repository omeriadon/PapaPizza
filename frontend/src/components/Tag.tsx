import { getForegroundColour } from "../utils/getForegroundColour";
import "./Tag.css";

export interface TagProps {
  title: string;
  bgColour: string;
  id: number;
}

export default function Tag({ title, bgColour }: TagProps) {
  return (
    <div
      className="tag"
      style={{
        backgroundColor: bgColour,
        color: getForegroundColour(bgColour),
      }}
    >
      {title}

    </div>
  );
}
