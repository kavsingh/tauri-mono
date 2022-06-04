import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./app";

const rootElement = document.getElementById("app-root");

if (!rootElement) throw new Error("Root element #app-root not found");

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
