import { AppSidebar } from "./ui/app-sidebar";
import { SectionCards } from "./ui/section-cards";
import { SectionButtons } from "./ui/section-welcome";
import { SiteHeader } from "./ui/site-header";
import { SidebarInset, SidebarProvider } from "@repo/ui";

export default function SidebarLayout() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionButtons />
              <SectionCards />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
