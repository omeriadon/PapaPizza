import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import NavBar from "./components/NavBar.tsx";
import { motion } from "framer-motion";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <NavBar />
    <div style={{ height: "60px" }}></div>
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <App />
    </motion.div>
  </StrictMode>
);
