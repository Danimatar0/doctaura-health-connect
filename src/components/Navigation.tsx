import { Button } from "@/components/ui/button";
import { Search, MapPin, LogIn, UserCircle, Menu, Settings } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { keycloakService } from "@/services/keycloakService";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import doctauraLogo from "@/assets/doctaura_icon.png";

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const user = keycloakService.getCurrentUser();
    if (user) {
      setIsAuthenticated(true);
      setUserName(user.name);
      setUserRole(user.role);
    }
  }, []);

  const handleLogout = async () => {
    setIsMobileMenuOpen(false);
    await keycloakService.logout();
  };

  const handleNavigate = (path: string) => {
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  const handleDashboard = () => {
    const user = keycloakService.getCurrentUser();
    if (user) {
      setIsMobileMenuOpen(false);
      navigate(keycloakService.getDashboardUrl(user.role));
    }
  };

  const isActivePath = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Left */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <img src={doctauraLogo} alt="Doctaura" className="h-8 w-auto" />
          </div>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex items-center gap-1">
            <Button
              variant={isActivePath('/doctors') ? 'secondary' : 'ghost'}
              onClick={() => handleNavigate('/doctors')}
              className="gap-2"
            >
              <Search className="h-4 w-4" />
              Find Doctors
            </Button>
            <Button
              variant={isActivePath('/pharmacies') ? 'secondary' : 'ghost'}
              onClick={() => handleNavigate('/pharmacies')}
              className="gap-2"
            >
              <MapPin className="h-4 w-4" />
              Pharmacy Locator
            </Button>
          </div>

          {/* Right Side - Auth Buttons */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* Desktop User Menu */}
                <div className="hidden md:block">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="gap-2">
                        <UserCircle className="h-5 w-5" />
                        <span className="hidden lg:inline">{userName}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col">
                          <span>{userName}</span>
                          <span className="text-xs font-normal text-muted-foreground capitalize">
                            {userRole} Account
                          </span>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleDashboard}>
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleNavigate(`/${userRole}/profile`)}>
                        Profile
                      </DropdownMenuItem>
                      {userRole === 'doctor' && (
                        <DropdownMenuItem onClick={() => handleNavigate('/schedule-settings')}>
                          <Settings className="h-4 w-4 mr-2" />
                          Schedule Settings
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleNavigate(`/${userRole}/settings`)}>
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Mobile Menu Button */}
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[280px]">
                    <SheetHeader>
                      <SheetTitle className="flex items-center gap-2">
                        <img src={doctauraLogo} alt="Doctaura" className="h-6 w-auto" />
                        Menu
                      </SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 space-y-4">
                      <div className="px-2 py-3 bg-muted/50 rounded-lg">
                        <p className="text-sm font-medium">{userName}</p>
                        <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
                      </div>
                      <div className="space-y-1">
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={handleDashboard}
                        >
                          Dashboard
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-2"
                          onClick={() => handleNavigate('/doctors')}
                        >
                          <Search className="h-4 w-4" />
                          Find Doctors
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-2"
                          onClick={() => handleNavigate('/pharmacies')}
                        >
                          <MapPin className="h-4 w-4" />
                          Pharmacy Locator
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => handleNavigate(`/${userRole}/profile`)}
                        >
                          Profile
                        </Button>
                        {userRole === 'doctor' && (
                          <Button
                            variant="ghost"
                            className="w-full justify-start gap-2"
                            onClick={() => handleNavigate('/schedule-settings')}
                          >
                            <Settings className="h-4 w-4" />
                            Schedule Settings
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => handleNavigate(`/${userRole}/settings`)}
                        >
                          Settings
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-destructive hover:text-destructive"
                          onClick={handleLogout}
                        >
                          Logout
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </>
            ) : (
              <>
                {/* Guest CTA - Desktop */}
                <Button
                  onClick={() => handleNavigate('/register')}
                  className="hidden md:flex gap-2"
                >
                  Get Started
                </Button>

                {/* Mobile Menu for Guests */}
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[280px]">
                    <SheetHeader>
                      <SheetTitle className="flex items-center gap-2">
                        <img src={doctauraLogo} alt="Doctaura" className="h-6 w-auto" />
                        Menu
                      </SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 space-y-1">
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-2"
                        onClick={() => handleNavigate('/doctors')}
                      >
                        <Search className="h-4 w-4" />
                        Find Doctors
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-2"
                        onClick={() => handleNavigate('/pharmacies')}
                      >
                        <MapPin className="h-4 w-4" />
                        Pharmacy Locator
                      </Button>
                      <Separator className="my-4" />
                      <Button
                        className="w-full gap-2"
                        onClick={() => handleNavigate('/register')}
                      >
                        Get Started
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full gap-2 text-sm text-muted-foreground"
                        onClick={() => handleNavigate('/login')}
                      >
                        Already have an account? Login
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
