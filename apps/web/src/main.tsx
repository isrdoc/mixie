import { createRoot } from "react-dom/client";
import "@repo/ui/globals.css";
import "./style.css";
import App from "./app/app";

createRoot(document.getElementById("app")!).render(<App />);
