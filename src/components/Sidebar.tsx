import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Pill,
  User,
  Settings,
  Sliders,
  LogOut,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { keycloakService } from "@/services/keycloakService";

interface MenuItem {
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: string;
}

interface MenuSection {
  items: MenuItem[];
  divider?: boolean;
}

const patientMenuSections: MenuSection[] = [
  {
    items: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/patient-dashboard" },
      { label: "My Appointments", icon: Calendar, path: "/patient/appointments" },
      { label: "Medical Records", icon: FileText, path: "/medical-records" },
      { label: "Prescriptions", icon: Pill, path: "/patient/prescriptions" },
    ],
    divider: true,
  },
  {
    items: [
      { label: "My Profile", icon: User, path: "/patient/profile" },
      { label: "Preferences", icon: Sliders, path: "/patient/preferences" },
      { label: "Settings", icon: Settings, path: "/patient/settings" },
    ],
    divider: true,
  },
];

const doctorMenuSections: MenuSection[] = [
  {
    items: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/doctor-dashboard" },
      { label: "My Appointments", icon: Calendar, path: "/doctor/appointments" },
      { label: "My Schedule", icon: Clock, path: "/doctor/schedule" },
      { label: "Patient Records", icon: Users, path: "/doctor/patients" },
    ],
  },
  {
    items: [
      { label: "My Profile", icon: User, path: "/doctor/profile" },
      { label: "Preferences", icon: Sliders, path: "/doctor/preferences" },
      { label: "Settings", icon: Settings, path: "/doctor/settings" },
    ],
    divider: true,
  },
];

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const user = keycloakService.getCurrentUser();
    if (user) {
      setUserRole(user.role);
      setUserName(user.name);
    }
  }, []);

  const menuSections = userRole === "doctor" ? doctorMenuSections : patientMenuSections;

  const handleLogout = async () => {
    await keycloakService.logout();
  };

  const handleProfileClick = () => {
    const profilePath = userRole === "doctor" ? "/doctor/profile" : "/patient/profile";
    navigate(profilePath);
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-card border-r border-border transition-all duration-300 z-40",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="flex flex-col h-full">
        {/* User Info Section */}
        {!isCollapsed && (
          <div className="p-4 border-b border-border">
            <div
              className="flex items-center gap-3 cursor-pointer hover:bg-accent/50 -m-2 p-2 rounded-lg transition-colors"
              onClick={handleProfileClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleProfileClick();
                }
              }}
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{userName}</p>
                <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
              </div>
            </div>
          </div>
        )}

        {/* Collapsed user indicator */}
        {isCollapsed && (
          <div className="p-3 border-b border-border flex justify-center">
            <div
              className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-colors"
              onClick={handleProfileClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleProfileClick();
                }
              }}
              title="My Profile"
            >
              <User className="h-5 w-5 text-primary" />
            </div>
          </div>
        )}

        {/* Menu Items */}
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-3">
            {menuSections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActivePath(item.path);

                  return (
                    <Button
                      key={item.path}
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start mb-1",
                        isActive && "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary",
                        isCollapsed && "justify-center px-2"
                      )}
                      onClick={() => navigate(item.path)}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
                      {!isCollapsed && <span className="flex-1 text-left">{item.label}</span>}
                      {!isCollapsed && item.badge && (
                        <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Button>
                  );
                })}
                {section.divider && <Separator className="my-3" />}
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Logout Button */}
        <div className="p-3 border-t border-border">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10",
              isCollapsed && "justify-center px-2"
            )}
            onClick={handleLogout}
            title={isCollapsed ? "Logout" : undefined}
          >
            <LogOut className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
            {!isCollapsed && "Logout"}
          </Button>
        </div>

        {/* Collapse Toggle */}
        <div className="p-3 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Collapse
              </>
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
