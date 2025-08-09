import { createRoot } from "react-dom/client";
import "./style.css";
import { Header } from "@repo/ui";

const App = () => (
  <div>
    <Header title="Mixie" />
    <div className="card">
      <p>
        Welcome to Mixie - A next-generation platform for music fans and curators to discover, share, and connect through playlists.
      </p>
    </div>
  </div>
);

createRoot(document.getElementById("app")!).render(<App />);
