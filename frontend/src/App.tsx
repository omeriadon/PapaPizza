import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css"
import Order from "./pages/Order";
import SalesSummary from "./pages/SalesSummary";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Order />} />
        <Route path="/order" element={<Order />} />
        <Route path="/salesSummary" element={<SalesSummary />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
