import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css"
import Order from "./pages/Order";
import SalesSummary from "./pages/SalesSummary";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Order />} />
        <Route path="/order" element={<Order />} />
        <Route path="/salesSummary" element={<SalesSummary />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
