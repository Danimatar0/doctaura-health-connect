import { Button } from "@/components/ui/button";
import { Heart, UserCircle, LogOut, Pill, Menu, Settings, LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { keycloakService } from "@/services/keycloakService";
import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Navigation = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const user = keycloakService.getCurrentUser();
    if (user) {
      setIsAuthenticated(true);
      setUserName(user.name);
      setUserRole(user.role);
    }
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await keycloakService.logout();
  };

  const handleDashboard = () => {
    const user = keycloakService.getCurrentUser();
    if (user) {
      setIsMenuOpen(false);
      navigate(keycloakService.getDashboardUrl(user.role));
    }
  };

  const handleNavigate = (path: string) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Hamburger Menu */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[320px] flex flex-col">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Heart className="h-6 w-6 text-primary" fill="currentColor" />
                  <span className="text-xl font-bold">Doctaura</span>
                </SheetTitle>
              </SheetHeader>

              {/* User Info */}
              {isAuthenticated && (
                <div className="mt-6 px-2">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <UserCircle className="h-10 w-10 text-primary" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{userName}</span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {userRole} Account
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Menu Items */}
              <div className="flex-1 mt-6">
                <div className="space-y-1 px-2">
                  {isAuthenticated ? (
                    <>
                      <Button
                        onClick={handleDashboard}
                        variant="ghost"
                        className="w-full justify-start"
                      >
                        <LayoutDashboard className="h-5 w-5 mr-3" />
                        Dashboard
                      </Button>
                      <Button
                        onClick={() => handleNavigate('/doctors')}
                        variant="ghost"
                        className="w-full justify-start"
                      >
                        <UserCircle className="h-5 w-5 mr-3" />
                        Find Doctors
                      </Button>
                      <Button
                        onClick={() => handleNavigate('/pharmacies')}
                        variant="ghost"
                        className="w-full justify-start"
                      >
                        <Pill className="h-5 w-5 mr-3" />
                        Pharmacies
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={() => handleNavigate('/login')}
                        variant="ghost"
                        className="w-full justify-start"
                      >
                        <UserCircle className="h-5 w-5 mr-3" />
                        Login
                      </Button>
                      <Button
                        onClick={() => handleNavigate('/doctors')}
                        variant="ghost"
                        className="w-full justify-start"
                      >
                        <UserCircle className="h-5 w-5 mr-3" />
                        Find Doctors
                      </Button>
                      <Button
                        onClick={() => handleNavigate('/pharmacies')}
                        variant="ghost"
                        className="w-full justify-start"
                      >
                        <Pill className="h-5 w-5 mr-3" />
                        Pharmacies
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Bottom Menu - Settings & Logout */}
              <div className="mt-auto border-t pt-4 px-2 space-y-1">
                <Button
                  onClick={() => handleNavigate('/settings')}
                  variant="ghost"
                  className="w-full justify-start"
                >
                  <Settings className="h-5 w-5 mr-3" />
                  Settings
                </Button>
                {isAuthenticated && (
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:text-destructive"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Logout
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Center Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer absolute left-1/2 transform -translate-x-1/2"
            onClick={() => navigate('/')}
          >
            <Heart className="h-6 w-6 text-primary" fill="currentColor" />
            <span className="text-xl font-bold text-foreground">Doctaura</span>
          </div>

          {/* Right side placeholder for balance */}
          <div className="w-10"></div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
