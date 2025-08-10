import { Button } from "@repo/ui";

export function SectionButtons() {
  return (
    <div className="px-4 lg:px-6">
      <p className="text-xl font-semibold">
        Welcome to Mixie - A next-generation platform for music fans and
        curators to discover, share, and connect through playlists.
      </p>
      <div className="flex gap-4 mt-6">
        <Button>Get Started</Button>
        <Button variant="outline">Learn More</Button>
        <Button variant="secondary">Browse Playlists</Button>
        <Button variant="destructive">Delete</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </div>
    </div>
  );
}
