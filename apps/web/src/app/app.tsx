import { Header, Button } from "@repo/ui";
import SidebarLayout from "./layout/layout";

export default function App() {
  return <SidebarLayout />;
}

export function SampleApp() {
  return (
    <div>
      <Header title="Mixie" />
      <div className="card">
        <p className="text-2xl">
          Welcome to Mixie - A next-generation platform for music fans and
          curators to discover, share, and connect through playlists.
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <Button>Get Started</Button>
          <Button variant="outline">Learn More</Button>
          <Button variant="secondary">Browse Playlists</Button>
          <Button variant="destructive">Delete</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>
    </div>
  );
}
