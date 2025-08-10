import {
  IconChartBar,
  IconDatabase,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconHeart,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui";

import { NavDocuments } from "./nav-documents";
import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";

const data = {
  user: {
    name: "Music Curator",
    email: "curator@mixie.app",
    avatar: "/avatars/music-curator.svg",
  },
  navMain: [
    {
      title: "Discover",
      url: "#",
      icon: IconSearch,
    },
    {
      title: "My Playlists",
      url: "#",
      icon: IconListDetails,
    },
    {
      title: "Analytics",
      url: "#",
      icon: IconChartBar,
    },
    {
      title: "Library",
      url: "#",
      icon: IconFolder,
    },
    {
      title: "Community",
      url: "#",
      icon: IconUsers,
    },
  ],
  navClouds: [
    {
      title: "Playlists",
      icon: IconListDetails,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Recently Created",
          url: "#",
        },
        {
          title: "Collaborative",
          url: "#",
        },
      ],
    },
    {
      title: "Collections",
      icon: IconFolder,
      url: "#",
      items: [
        {
          title: "Favorites",
          url: "#",
        },
        {
          title: "For You",
          url: "#",
        },
      ],
    },
    {
      title: "Reports",
      icon: IconReport,
      url: "#",
      items: [
        {
          title: "Listening Stats",
          url: "#",
        },
        {
          title: "Engagement",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Account Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Help & Support",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search Music",
      url: "#",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: IconDatabase,
    },
    {
      name: "Reports",
      url: "#",
      icon: IconReport,
    },
    {
      name: "Integrations",
      url: "#",
      icon: IconFileWord,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconHeart className="!size-6 -ml-0.5 -mt-0.5" />
                <span className="text-base font-semibold">Mixie</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
