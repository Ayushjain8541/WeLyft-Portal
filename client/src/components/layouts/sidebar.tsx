import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  BarChart3,
  Users,
  PackageCheck,
  FileBarChart,
  Package,
  Clock,
  User,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  role: "admin" | "driver" | null;
  mobile?: boolean;
}

export default function Sidebar({ role, mobile = false }: SidebarProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const adminLinks = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <BarChart3 className="mr-3 h-6 w-6" />,
    },
    {
      name: "Drivers",
      href: "/drivers",
      icon: <Users className="mr-3 h-6 w-6" />,
    },
    {
      name: "Orders",
      href: "/orders",
      icon: <PackageCheck className="mr-3 h-6 w-6" />,
    },
    {
      name: "Reports",
      href: "/reports",
      icon: <FileBarChart className="mr-3 h-6 w-6" />,
    },
  ];

  const driverLinks = [
    {
      name: "My Orders",
      href: "/driver/orders",
      icon: <Package className="mr-3 h-6 w-6" />,
    },
    {
      name: "History",
      href: "/driver/history",
      icon: <Clock className="mr-3 h-6 w-6" />,
    },
    {
      name: "Profile",
      href: "/driver/profile",
      icon: <User className="mr-3 h-6 w-6" />,
    },
  ];

  const links = role === "admin" ? adminLinks : driverLinks;

  return (
    <div className="flex flex-col h-0 flex-1 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <span className="text-xl font-bold text-primary">LogiDash</span>
        </div>
        <nav className="mt-5 flex-1 px-2 bg-white dark:bg-gray-800 space-y-1">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              <a
                className={cn(
                  location === link.href
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white",
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer"
                )}
              >
                {link.icon}
                {link.name}
              </a>
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex-shrink-0 w-full group block">
          <div className="flex items-center">
            <Avatar>
              <AvatarImage src={user?.profileImageUrl} alt={user?.name || "User"} />
              <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {user?.name || (role === "admin" ? "Admin User" : "Driver User")}
              </p>
              <Button
                variant="link"
                size="sm"
                className="text-xs text-primary p-0"
                onClick={logout}
              >
                <LogOut className="h-3 w-3 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
