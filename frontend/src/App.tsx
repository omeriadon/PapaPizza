import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css"
import Order from "./pages/Order";
import Home from "./pages/Home";
import SalesSummary from "./pages/SalesSummary";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/order" element={<Order />} />
        <Route path="/salesSummary" element={<SalesSummary />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
