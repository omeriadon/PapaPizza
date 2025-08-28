import "./Order.css";
import Menu from "./Menu";
import NumberFlow from "@number-flow/react";
import { useState } from "react";

function Home() {
  const [count, setCount] = useState<number>(0);

  // to change the number:
  function increase() {
    setCount((prev) => prev + 1);
  }

  return (
    <div className="container">
      <h4 className="left">
        <Menu />
      </h4>
      <div className="right order-details">
        <h2>Order Details</h2>
        <NumberFlow
          value={count}
          format={{
            style: "currency",
            currency: "AUD",
          }}
        />
        <button onClick={increase}>Add 1</button>
      </div>
    </div>
  );
}

export default Home;
