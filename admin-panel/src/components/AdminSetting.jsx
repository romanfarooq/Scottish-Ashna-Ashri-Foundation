import toast from "react-hot-toast";
import { RiAdminLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const API_URL = import.meta.env.VITE_API_URL;

export function AdminSetting() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/admin/logout`, {
        method: "POST",
        credentials: "include",
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message);
        navigate("/login");
      } else {
        toast.error(result.message || "Logout failed");
      }
    } catch (error) {
      toast.error("An error occurred during logout");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="rounded-md bg-inherit py-5 text-sidebar-foreground shadow-none hover:bg-sidebar hover:text-sidebar-accent-foreground focus-visible:ring-0">
          <RiAdminLine className="mr-1" />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Admin</span>
            <span className="truncate text-xs">saafscotland@gmail.com</span>
          </div>
          <ChevronsUpDown className="ml-3 size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] rounded-lg"
        side="bottom"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Sparkles />
            Upgrade to Pro
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <BadgeCheck />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard />
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Bell />
            Notifications
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
