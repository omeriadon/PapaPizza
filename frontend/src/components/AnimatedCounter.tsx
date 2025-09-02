import { MotionValue, motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

const fontSize = 25;
const padding = 15;
const height = fontSize + padding;

export function AnimatedCounter({ value }: { value: number }) {
  return (
    <div
      style={{ fontSize }}
      className="overflow-hidden rounded p-0 m-0"
    >
      <Digit place={1} value={value} />
    </div>
  );
}

export function AnimatedCounter2({ value }: { value: number }) {
  return (
    <div
      style={{ fontSize }}
      className="flex space-x-3 overflow-hidden rounded px-2 pl-0 ml-0 h-[30px] leading-none text-sm"
    >
      <div style={{ height }} className="relative w-[1ch] tabular-nums">
        {[...Array(1).keys()].map((i) => (
          <motion.span
            key={i}
            className="absolute inset-0 flex items-center justify-center"
          >
            $
          </motion.span>
        ))}
      </div>
      <Digit place={100} value={value} />
      <Digit place={10} value={value} />
      <Digit place={1} value={value} />
      <p>.</p>
      <Digit place={0.1} value={value} />
      <Digit place={0.01} value={value} />
    </div>
  );
}

function Digit({ place, value }: { place: number; value: number }) {
  let valueRoundedToPlace = Math.floor(value / place);
  let animatedValue = useSpring(valueRoundedToPlace);

  useEffect(() => {
    animatedValue.set(valueRoundedToPlace);
  }, [animatedValue, valueRoundedToPlace]);

  return (
    <div style={{ height }} className="relative w-[1ch] tabular-nums">
      {[...Array(10).keys()].map((i) => (
        <Number key={i} mv={animatedValue} number={i} />
      ))}
    </div>
  );
}

function Number({ mv, number }: { mv: MotionValue; number: number }) {
  let y = useTransform(mv, (latest) => {
    let placeValue = latest % 10;
    let offset = (10 + number - placeValue) % 10;

    let memo = offset * height;

    if (offset > 5) {
      memo -= 10 * height;
    }

    return memo;
  });

  return (
    <motion.span
      style={{ y }}
      className="absolute inset-0 flex items-center justify-center"
    >
      {number}
    </motion.span>
  );
}
