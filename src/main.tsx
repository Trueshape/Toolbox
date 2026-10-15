// main.tsx — punto d'ingresso dell'app: font, stili e radice React.
import "@fontsource-variable/geist";
import "./app/globals.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
