import { createRoot } from "react-dom/client";
import "./style.css";
import { Header } from "@repo/ui/header";
import { Button } from "@repo/ui/button";

const App = () => (
  <div>
    <Header title="Mixie" />
    <div className="card">
      <p>
        Welcome to Mixie - A next-generation platform for music fans and curators to discover, share, and connect through playlists.
      </p>
      <div className="flex gap-4 mt-6">
        <Button>Get Started</Button>
        <Button variant="outline">Learn More</Button>
        <Button variant="secondary">Browse Playlists</Button>
      </div>
    </div>
  </div>
);

createRoot(document.getElementById("app")!).render(<App />);
