import { NavMain } from "@/components/NavMain";
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Activity,
  AudioLines,
  Bell,
  Book,
  BookOpen,
  Calendar,
  CheckSquare,
  Compass,
  Contact,
  DollarSign,
  Droplet,
  Feather,
  FileText,
  Film,
  Gift,
  Heart,
  HelpCircle,
  Home,
  Info,
  Layers,
  Library,
  ListTree,
  Map,
  Megaphone,
  Mic,
  Newspaper,
  Palette,
  HandIcon as PrayingHands,
  School,
  Users,
  Zap
} from "lucide-react";

const menuItems = [
  {
    label: "Dashboard",
    icon: Home,
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
    icon: BookOpen,
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
        icon: Calendar,
      },
      {
        title: "Islamic Calendar",
        url: "#",
        icon: Calendar,
      },
      {
        title: "Qibla Finder",
        url: "#",
        icon: Compass,
      },
      {
        title: "Dua's",
        url: "/dua",
        icon: BookOpen,
      },
      {
        title: "Ziaraah",
        url: "/ziarah",
        icon: Map,
      },
      {
        title: "Salat",
        url: "#",
        icon: PrayingHands,
      },
      {
        title: "Taqibaat",
        url: "/taqibaat",
        icon: BookOpen,
      },
      {
        title: "Sermons",
        url: "/sermon",
        icon: Mic,
      },
      {
        title: "Amal",
        url: "#",
        icon: CheckSquare,
      },
      {
        title: "Sahifa Sajjadia",
        url: "/sahifa",
        icon: Book,
      },
      {
        title: "Hajj & Ziaraah",
        url: "#",
        icon: Map,
      },
      {
        title: "Specific Dua's",
        url: "#",
        icon: BookOpen,
      },
      {
        title: "Ghusul Instructions",
        url: "#",
        icon: Droplet,
      },
      {
        title: "Faruh u Deen",
        url: "#",
        icon: Feather,
      },
      {
        title: "Asool e Deen",
        url: "#",
        icon: Layers,
      },
    ],
  },
  {
    label: "Books & Resources",
    icon: Library,
    items: [
      {
        title: "Nahj al-Balagha",
        url: "#",
        icon: Book,
      },
      {
        title: "Kitab al-Kafi",
        url: "#",
        icon: Book,
      },
      {
        title: "Hadith Directory",
        url: "#",
        icon: FileText,
      },
      {
        title: "Book Library",
        url: "#",
        icon: Library,
      },
      {
        title: "Kids Library",
        url: "#",
        icon: BookOpen,
      },
    ],
  },
  {
    label: "Community Engagement",
    icon: Users,
    items: [
      {
        title: "Sunday School Fund",
        url: "#",
        icon: School,
      },
      {
        title: "Sports and Recreation",
        url: "#",
        icon: Activity,
      },
      {
        title: "Movie Club (Once a Week)",
        url: "#",
        icon: Film,
      },
      {
        title: "Engagements with Local Community and Politicians",
        url: "#",
        icon: Users,
      },
      {
        title: "Health Club",
        url: "#",
        icon: Heart,
      },
      {
        title: "A Code of Practice While Living in the West",
        url: "#",
        icon: FileText,
      },
    ],
  },
  {
    label: "Donations",
    icon: DollarSign,
    items: [
      {
        title: "Make Donations",
        url: "#",
        icon: Gift,
      },
      {
        title: "Khums Fund Pay",
        url: "#",
        icon: DollarSign,
      },
      {
        title: "Sadiqa Fund Pay",
        url: "#",
        icon: DollarSign,
      },
      {
        title: "General Fund",
        url: "#",
        icon: DollarSign,
      },
      {
        title: "Ramadan or Muharram Fund",
        url: "#",
        icon: Calendar,
      },
      {
        title: "Death Committee for All Shia Asna Ashir Community",
        url: "#",
        icon: Users,
      },
    ],
  },
  {
    label: "Interactive Features",
    icon: Zap,
    items: [
      {
        title: "Daily Quiz",
        url: "#",
        icon: HelpCircle,
      },
      {
        title: "In-App Notifications",
        url: "#",
        icon: Bell,
        items: [
          {
            title: "Azaan/Namaz Alerts",
            url: "#",
            icon: Bell,
          },
          {
            title: "Iftar/Sehar Alerts",
            url: "#",
            icon: Bell,
          },
        ],
      },
    ],
  },
  {
    label: "Press & Media",
    icon: Newspaper,
    items: [
      {
        title: "Press Release",
        url: "#",
        icon: FileText,
      },
      {
        title: "Announcement",
        url: "#",
        icon: Megaphone,
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
                <span className="truncate text-xs font-semibold 2xl:text-sm">
                  Scottish Ashna Ashri Foundation
                </span>
                <span className="truncate text-xs">Admin Panel</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <NavMain menuItems={menuItems} />
    </Sidebar>
  );
}
