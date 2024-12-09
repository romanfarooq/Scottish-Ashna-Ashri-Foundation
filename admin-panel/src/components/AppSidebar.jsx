import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Contact,
  Frame,
  GalleryVerticalEnd,
  Home,
  Info,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react";
import {
  Book,
  FileText,
  AudioLines,
  Palette,
  ListTree,
  ChevronDown,
} from "lucide-react";

import { NavMain } from "@/components/NavMain";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    label: "Dashboard",
    items: [
      {
        title: "Home",
        url: "/",
        icon: Home,
      },
      {
        title: "About",
        url: "/about",
        icon: Info,
      },
      {
        title: "Contact",
        url: "/",
        icon: Contact,
      },
    ],
  },
  {
    label: "Islamic Essentials",
    items: [
      {
        title: "Quran",
        icon: Book,
        items: [
          {
            title: "Quran Ayah Wise (Text Format)",
            url: "/quran-text",
            icon: FileText,
          },
          {
            title: "Quran Surah Wise (Book Format)",
            url: "/quran-images",
            icon: ListTree,
          },
          {
            title: "Quran Juzz Wise (Book Format)",
            url: "#",
            icon: ListTree,
          },
          {
            title: "Quran Color Coded Tajweed",
            url: "/quran-tajweed-images",
            icon: Palette,
          },
          {
            title: "Quran Audio",
            url: "/quran-audio",
            icon: AudioLines,
          },
        ],
      },
      {
        title: "Ramadan Calendar",
        url: "#",
      },
      {
        title: "Islamic Calendar",
        url: "#",
      },
      {
        title: "Azaan/Namaz Alerts",
        url: "#",
      },
      {
        title: "Iftar/Sehar Alerts",
        url: "#",
      },
      {
        title: "Qibla Finder",
        url: "#",
      },
      {
        title: "Dua’s",
        url: "#",
      },
      {
        title: "Ziaraah",
        url: "#",
      },
      {
        title: "Salat",
        url: "#",
      },
      {
        title: "Taqibaat",
        url: "#",
      },
      {
        title: "Amal",
        url: "#",
      },
      {
        title: "Sahifa Sajjadia",
        url: "#",
      },
      {
        title: "Hajj & Ziaraah",
        url: "#",
      },
      {
        title: "Specific Dua’s",
        url: "#",
      },
      {
        title: "Ghusul Instructions",
        url: "#",
      },
      {
        title: "Faruh u Deen",
        url: "#",
      },
      {
        title: "Asool e Deen",
        url: "#",
      },
    ],
  },
  {
    label: "Books & Resources",
    items: [
      {
        title: "Nahj al-Balagha",
        url: "#",
      },
      {
        title: "Kitab al-Kafi",
        url: "#",
      },
      {
        title: "Sermons",
        url: "#",
      },
      {
        title: "Hadith Directory",
        url: "#",
      },
      {
        title: "Book Library",
        url: "#",
      },
      {
        title: "Kids Library",
        url: "#",
      },
    ],
  },
  {
    label: "Community Engagement",
    items: [
      {
        title: "Sunday School Fund",
        url: "#",
      },
      {
        title: "Sports and Recreation",
        url: "#",
      },
      {
        title: "Movie Club (Once a Week)",
        url: "#",
      },
      {
        title: "Engagements with Local Community and Politicians",
        url: "#",
      },
      {
        title: "Health Club",
        url: "#",
      },
      {
        title: "A Code of Practice While Living in the West",
        url: "#",
      },
    ],
  },
  {
    label: "Donations",
    items: [
      {
        title: "Make Donations",
        url: "#",
      },
      {
        title: "Khums Fund Pay",
        url: "#",
      },
      {
        title: "Sadiqa Fund Pay",
        url: "#",
      },
      {
        title: "General Fund",
        url: "#",
      },
      {
        title: "Ramadan or Muharram Fund",
        url: "#",
      },
      {
        title: "Death Committee for All Shia Asna Ashir Community",
        url: "#",
      },
    ],
  },
  {
    label: "Interactive Features",
    items: [
      {
        title: "Tasbeeh Counter",
        url: "#",
      },
      {
        title: "Daily Quiz",
        url: "#",
      },
      {
        title: "In-App Notifications",
        url: "#",
        items: [
          {
            title: "Azaan/Namaz Alerts",
            url: "#",
          },
          {
            title: "Iftar/Sehar Alerts",
            url: "#",
          },
        ],
      },
    ],
  },
  {
    label: "Press & Media",
    items: [
      {
        title: "Press Release",
        url: "#",
      },
      {
        title: "Announcement",
        url: "#",
      },
      {
        title: "Media",
        url: "#",
      },
    ],
  },
  {
    label: "Downloads",
    items: [
      {
        title: "Downloads",
        url: "#",
      },
      {
        title: "Islamic Calendar",
        url: "#",
      },
      {
        title: "Full Digital Version of Quran",
        url: "#",
      },
    ],
  },
];

export function AppSidebar({ ...props }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <img
                  src="/src/assets/images/logo.png"
                  alt="logo"
                  className="bg-sidebar hover:bg-sidebar-accent active:bg-sidebar-accent data-[active=true]:bg-sidebar-accent data-[state=open]:hover:bg-sidebar-accent"
                />
              </div>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-semibold">
                  Scottish Ashna Ashri Foundation
                </span>
                <span className="truncate text-xs">Admin Panel</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain menuItems={menuItems} />
      </SidebarContent>
    </Sidebar>
  );
}
