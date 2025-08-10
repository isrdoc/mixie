import { Button, Card } from "@repo/ui";

export function SectionButtons() {
  return (
    <div className="px-4 lg:px-6">
      <Card
        className="mb-8 h-[150px] bg-black flex items-center"
        style={{
          backgroundImage: "url('/mixie-hero-logo.png')",
          backgroundPosition: "left center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
        }}
      >
        <div className="w-full h-full flex items-center justify-end pr-8">
          <div className="max-w-md text-right">
            <p className="text-xl font-semibold text-white">
              Welcome to Mixie - A next-generation platform for music fans and
              curators to discover, share, and connect through playlists
            </p>
          </div>
        </div>
      </Card>
      <div className="flex flex-wrap gap-4 mt-6">
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
